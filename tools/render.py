#!/usr/bin/env python3
"""Render the final MP4: frames (headless Chromium) + voice + auto SFX + BGM.

usage: python3 tools/render.py story.json [--out build/video.mp4] [--fps 30] [--workers 2] [--crf 18]
                                          [--start 0 --end 10]  (partial render for checking)  [--no-audio]
needs: build/timing.json + build/voice.wav from tools/tts.py (otherwise renders silent with estimated timing).
"""
import argparse, asyncio, json, math, os, subprocess, sys, time, wave
from pathlib import Path
import numpy as np
sys.path.insert(0, str(Path(__file__).parent))
from _browser import open_player, load_json, async_playwright, ENGINE
SR = 48000

async def worker(k, story, timing, frames, fps, seg, crf):
    async with async_playwright() as pw:
        browser, page, info = await open_player(pw, story, timing)
        ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'image2pipe', '-framerate', str(fps), '-c:v', 'mjpeg', '-i', '-',
                               '-c:v', 'libx264', '-preset', 'medium', '-crf', str(crf), '-pix_fmt', 'yuv420p', '-r', str(fps), str(seg)], stdin=subprocess.PIPE)
        t0 = time.time()
        for j, f in enumerate(frames):
            await page.evaluate(f'POP.seek({f / fps})')
            ff.stdin.write(await page.screenshot(type='jpeg', quality=93))
            if j % 150 == 0: print(f'  worker {k}: {j}/{len(frames)} frames  {time.time() - t0:.0f}s', flush=True)
        ff.stdin.close(); ff.wait(); await browser.close()

def read_wav(p):
    with wave.open(str(p)) as w:
        sr, ch, n = w.getframerate(), w.getnchannels(), w.getnframes(); x = np.frombuffer(w.readframes(n), dtype='<i2').astype(np.float32) / 32768
    x = x.reshape(-1, ch); x = x if ch == 2 else np.repeat(x, 2, 1)
    if sr != SR: idx = np.arange(0, len(x), sr / SR).astype(int); x = x[idx[idx < len(x)]]
    return x

def any_to_wav(src, dst):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(src), '-ar', str(SR), '-ac', '2', str(dst)], check=True)

def mix_audio(story, info, build, total):
    meta = story.get('meta', {}); n = int(total * SR); out = np.zeros((n, 2), np.float32)
    vp = build / 'voice.wav'; voice = read_wav(vp)[:n] if vp.exists() else np.zeros((0, 2), np.float32)
    out[:len(voice)] += voice * meta.get('voiceGain', 1.0)
    # SFX
    if meta.get('sfx', True) is not False:
        cache = {}; g0 = meta.get('sfxGain', 0.45)
        for c in info['cues']:
            name = c['sfx']; p = ENGINE / 'sfx' / f'{name}.wav'
            if not p.exists(): continue
            x = cache.get(name); x = cache.setdefault(name, read_wav(p)) if x is None else x
            s = int(c['t'] * SR); e = min(n, s + len(x))
            if s < n and e > s: out[s:e] += x[:e - s] * g0 * c.get('gain', 1)
    # BGM (looped, ducked under the voice)
    bgm = meta.get('bgm', 'pop_bounce')
    if bgm and bgm not in ('none', False):
        if bgm == 'auto': bgm = 'pop_bounce'
        src = Path(bgm) if Path(bgm).suffix else next((q for q in [ENGINE / 'bgm' / f'{bgm}.mp3', ENGINE / 'bgm' / f'{bgm}.wav'] if q.exists()), ENGINE / 'bgm' / f'{bgm}.mp3')
        if not src.is_absolute() and not src.exists(): src = (Path(story.get('_dir', '.')) / bgm)
        if not src.exists(): print(f'WARN: bgm not found: {src} (no music)')
        if src.exists():
            tmp = build / '_bgm.wav'; any_to_wav(src, tmp); b = read_wav(tmp)
            reps = math.ceil(n / len(b)); b = np.tile(b, (reps, 1))[:n]
            env = np.abs(voice[:, 0]) if len(voice) else np.zeros(n)
            env = np.pad(env, (0, max(0, n - len(env))))[:n]
            win = int(.25 * SR); k = np.ones(win) / win; sm = np.convolve(env, k, 'same')
            duck = 1 - 0.45 * np.clip(sm / (sm.max() + 1e-9) * 3, 0, 1)
            vr = np.sqrt(np.mean(voice ** 2)) if len(voice) else .05; br = np.sqrt(np.mean(b ** 2)) + 1e-9
            g = meta.get('bgmGain', 0.22) * vr / br
            fade = np.ones(n); fi = int(.6 * SR); fo = int(1.5 * SR); fade[:fi] = np.linspace(0, 1, fi); fade[-fo:] = np.linspace(1, 0, fo)
            out += b * (g * duck * fade)[:, None]
        else: print('WARN bgm not found:', bgm)
    peak = np.abs(out).max();
    if peak > .98: out *= .98 / peak
    p = build / 'mix.wav'
    with wave.open(str(p), 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype('<i2').tobytes())
    return p

async def main(a):
    story = load_json(a.story); story['_dir'] = str(Path(a.story).parent)
    build = Path(a.story).parent / 'build'; build.mkdir(exist_ok=True)
    timing = load_json(a.timing) if a.timing else load_json(build / 'timing.json')
    if not timing: print('WARN: no build/timing.json -> estimated timing, silent voice. Run tools/tts.py first.')
    async with async_playwright() as pw:
        browser, page, info = await open_player(pw, story, timing)
        info['cues'] = await page.evaluate('POP.cues'); await browser.close()
    for w in info['warnings']: print('WARN', w)
    total = info['duration']; fps = a.fps
    f0 = int((a.start or 0) * fps); f1 = int(min(total, a.end or total) * fps)
    frames = list(range(f0, f1)); W = max(1, a.workers)
    print(f'duration {total:.2f}s -> rendering frames {f0}..{f1} ({len(frames)}) with {W} workers')
    chunks = [frames[i * len(frames) // W:(i + 1) * len(frames) // W] for i in range(W)]
    segs = [build / f'_seg{i}.mp4' for i in range(W)]
    t0 = time.time()
    await asyncio.gather(*[worker(i, story, timing, chunks[i], fps, segs[i], a.crf) for i in range(W) if chunks[i]])
    print(f'frames done in {time.time() - t0:.0f}s')
    lst = build / '_segs.txt'; lst.write_text(''.join(f"file '{s.resolve()}'\n" for s, c in zip(segs, chunks) if c))
    silent = build / '_video.mp4'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', str(lst), '-c', 'copy', str(silent)], check=True)
    out = Path(a.out) if a.out else build / 'video.mp4'
    if a.no_audio: os.replace(silent, out)
    else:
        mix = mix_audio(story, info, build, total)
        ss = f0 / fps; dur = len(frames) / fps
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(silent), '-ss', f'{ss:.3f}', '-t', f'{dur:.3f}', '-i', str(mix),
                        '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '48000', '-c:a', 'aac', '-b:a', '192k',
                        '-shortest', '-movflags', '+faststart', str(out)], check=True)
    for s in segs: s.unlink(missing_ok=True)
    silent.unlink(missing_ok=True)
    print('DONE ->', out)

if __name__ == '__main__':
    p = argparse.ArgumentParser(); p.add_argument('story'); p.add_argument('--timing'); p.add_argument('--out'); p.add_argument('--fps', type=int, default=30)
    p.add_argument('--workers', type=int, default=2); p.add_argument('--crf', type=int, default=18); p.add_argument('--start', type=float); p.add_argument('--end', type=float)
    p.add_argument('--no-audio', action='store_true')
    asyncio.run(main(p.parse_args()))
