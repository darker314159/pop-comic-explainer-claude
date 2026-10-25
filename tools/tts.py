#!/usr/bin/env python3
"""Narration -> build/voice.wav + build/timing.json (per-line & per-word timestamps).

usage: python3 tools/tts.py story.json [--provider mimo|edge|none] [--voice 苏打] [--rate +0%]

Providers (meta.tts, default "auto"):
  mimo  小米 MiMo TTS（推荐，最自然，支持语气/情绪指令）。需要 API Key：
        python3 tools/setup_mimo.py sk-xxxx      （或环境变量 MIMO_API_KEY）
  edge  微软 edge-tts（免费、无需 Key，带逐词时间戳）
  none  无声（按字数估算时长），用于没网/没 Key 时先看画面
  auto  有小米 Key 用 mimo，否则 edge，edge 失败则无声
Each line is synthesized separately (cached in build/tts_cache), then laid out:
  scene start pad (0.15s, PART cards 0.45s) -> line -> gap (meta.gap, 0.12s) -> line ... -> tail (meta.sceneTail, 0.45s)
"""
import argparse, asyncio, base64, hashlib, json, os, re, subprocess, sys, time, wave
import urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import numpy as np
SR = 48000
ROOT = Path(__file__).resolve().parent.parent
PUNCT = r'[，,。．.！!？?；;：:、…—\-~～“”"‘’\'（）()《》<>「」『』\s]'
MIMO_VOICES = ['苏打', '白桦', '冰糖', '茉莉', 'mimo_default', 'Mia', 'Chloe', 'Milo', 'Dean']
MIMO_DEFAULT_VOICE = '苏打'
MIMO_DEFAULT_STYLE = ('抖音爆款知识口播博主，年轻有磁性的声音，语速偏快、节奏利落，情绪饱满有感染力，'
                      '像在跟朋友揭穿一个扎心的真相；关键词加重语气，句尾干脆不拖音，不要播音腔。')
EDGE_DEFAULT_VOICE = 'zh-CN-YunxiNeural'

def strip(s): return re.sub(r'[\[\]]', '', s)
def line_obj(l): return {'text': l} if isinstance(l, str) else l

# ------------------------------------------------------------------ config
def load_config():
    cfg = {}
    for p in [ROOT / 'config.json', Path.home() / '.pop-comic' / 'config.json']:
        if p.exists():
            try: cfg = {**json.loads(p.read_text(encoding='utf-8')), **cfg}
            except Exception as e: print(f'WARN: cannot read {p}: {e}', file=sys.stderr)
    key = os.environ.get('MIMO_API_KEY') or cfg.get('mimo_api_key') or ''
    base = os.environ.get('MIMO_BASE_URL') or cfg.get('mimo_base_url') or ('https://token-plan-cn.xiaomimimo.com/v1' if key.startswith(('tp-', 'ttp-')) else 'https://api.xiaomimimo.com/v1')
    return {'key': key.strip(), 'base': base.rstrip('/'), 'model': os.environ.get('MIMO_TTS_MODEL') or cfg.get('mimo_model') or 'mimo-v2.5-tts',
            'voice': cfg.get('mimo_voice'), 'style': cfg.get('mimo_style')}

# ------------------------------------------------------------------ providers
class FatalTTS(Exception): pass

def mimo_one(text, voice, style, line_style, cfg, out_wav):
    content = (f'({line_style}){text}' if line_style else text)
    msgs = ([{'role': 'user', 'content': style}] if style else []) + [{'role': 'assistant', 'content': content}]
    body = json.dumps({'model': cfg['model'], 'messages': msgs, 'audio': {'format': 'wav', 'voice': voice}}, ensure_ascii=False).encode('utf-8')
    req = urllib.request.Request(cfg['base'] + '/chat/completions', data=body, method='POST',
                                 headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {cfg["key"]}', 'api-key': cfg['key']})
    last = None
    for attempt in range(5):
        try:
            with urllib.request.urlopen(req, timeout=180) as r: js = json.loads(r.read().decode('utf-8'))
            data = js['choices'][0]['message']['audio']['data']
            Path(out_wav).write_bytes(base64.b64decode(data)); return
        except urllib.error.HTTPError as e:
            msg = e.read().decode('utf-8', 'ignore')[:300]; last = f'HTTP {e.code}: {msg}'
            if e.code in (401, 403): raise FatalTTS(f'小米 API Key 无效或无权限（{last}）。运行 python3 tools/setup_mimo.py 重新配置。')
            if e.code == 400: raise FatalTTS(f'请求被拒绝（{last}）。检查 voice / 模型名 / 文本内容。')
        except (KeyError, IndexError, TypeError, ValueError) as e: last = f'响应格式异常: {e}'
        except Exception as e: last = str(e)
        time.sleep(min(20, 2 ** attempt + 1))
    raise RuntimeError(last)

async def edge_one(text, voice, rate, pitch, mp3, js):
    import edge_tts
    c = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch, boundary='WordBoundary')
    words = []
    with open(mp3, 'wb') as f:
        async for ch in c.stream():
            if ch['type'] == 'audio': f.write(ch['data'])
            elif ch['type'] == 'WordBoundary': words.append({'w': ch['text'], 't0': ch['offset'] / 1e7, 't1': (ch['offset'] + ch['duration']) / 1e7})
    Path(js).write_text(json.dumps(words, ensure_ascii=False), encoding='utf-8')

# ------------------------------------------------------------------ audio helpers
def decode(path, tempo=1.0):
    af = ['-af', f'atempo={tempo:.4f}'] if abs(tempo - 1) > 1e-3 else []
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(path)] + af + ['-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype='<i2').astype(np.float32) / 32768

def trim(x, thr=0.012, head_keep=0.03, tail_keep=0.06):
    idx = np.where(np.abs(x) > thr)[0]
    if not len(idx): return x
    a = max(0, idx[0] - int(head_keep * SR)); b = min(len(x), idx[-1] + int(tail_keep * SR))
    return x[a:b]

def rate_to_tempo(rate):
    m = re.match(r'^([+-]?\d+(?:\.\d+)?)%$', str(rate or '+0%').strip())
    return max(0.6, min(1.6, 1 + float(m.group(1)) / 100)) if m else 1.0

def align_segments(x, text):
    """No word timestamps (MiMo): split text at punctuation and map the boundaries to the longest pauses in the audio.
    Returns [{'w','t0','t1'}] per segment (engine spreads chars evenly inside each), or [] if unsure."""
    segs = [s for s in re.split(PUNCT, strip(text)) if s]
    if len(segs) < 2: return [{'w': segs[0], 't0': 0.0, 't1': len(x) / SR}] if segs else []
    hop = int(0.01 * SR); n = len(x) // hop
    if n < 10: return []
    env = np.sqrt(np.convolve(x[:n * hop].reshape(n, hop).__pow__(2).mean(1), np.ones(5) / 5, 'same'))
    thr = max(0.006, env.max() * 0.06); quiet = env < thr
    gaps, i = [], 0
    while i < n:
        if quiet[i]:
            j = i
            while j < n and quiet[j]: j += 1
            if i > 3 and j < n - 3 and j - i >= 8: gaps.append((j - i, i, j))
            i = j
        else: i += 1
    k = len(segs) - 1
    if len(gaps) < k: return []
    cut = sorted(sorted(gaps, reverse=True)[:k], key=lambda g: g[1])
    out, t = [], 0.0
    for s, g in zip(segs, cut + [None]):
        t1 = (g[1] * hop / SR) if g else len(x) / SR
        out.append({'w': s, 't0': round(t, 3), 't1': round(t1, 3)}); t = (g[2] * hop / SR) if g else t1
    return out

# ------------------------------------------------------------------ main
def resolve_provider(want, cfg):
    want = (want or 'auto').lower()
    if want in ('mimo', 'xiaomi'):
        if not cfg['key']: raise FatalTTS('meta.tts = "mimo" 但没有配置小米 API Key。运行：python3 tools/setup_mimo.py sk-你的key （或设置环境变量 MIMO_API_KEY）')
        return 'mimo'
    if want == 'auto': return 'mimo' if cfg['key'] else 'edge'
    return want

def main(a):
    story = json.loads(Path(a.story).read_text(encoding='utf-8')); meta = story.get('meta', {})
    cfg = load_config()
    try: provider = resolve_provider(a.provider or meta.get('tts'), cfg)
    except FatalTTS as e: print('❌', e); sys.exit(2)
    if provider == 'edge' and not (a.provider or meta.get('tts')): print('ℹ️  没有配置小米 API Key → 使用免费的 edge-tts。想用小米 TTS：python3 tools/setup_mimo.py sk-xxxx')
    voice = a.voice or meta.get('voice')
    if provider == 'mimo':
        if voice not in MIMO_VOICES: voice = cfg['voice'] or MIMO_DEFAULT_VOICE
        style = meta.get('ttsStyle', cfg['style'] if cfg['style'] is not None else MIMO_DEFAULT_STYLE)
        cfg['model'] = meta.get('ttsModel', cfg['model'])
    else:
        if not voice or voice in MIMO_VOICES: voice = EDGE_DEFAULT_VOICE
        style = ''
    rate = a.rate or meta.get('rate', '+10%' if provider == 'edge' else '+0%'); pitch = meta.get('pitch', '+0Hz')
    build = Path(a.out or Path(a.story).parent / 'build'); cache = build / 'tts_cache'; cache.mkdir(parents=True, exist_ok=True)
    gap = meta.get('gap', 0.12); tail = meta.get('sceneTail', 0.45)
    print(f'TTS: {provider}' + (f' · {cfg["model"]} · 音色 {voice}' if provider == 'mimo' else f' · {voice}' if provider == 'edge' else '') + f' · 语速 {rate}')

    # 1) collect jobs
    jobs = {}
    plan = []
    for si, sc in enumerate(story['scenes']):
        row = []
        for li, l in enumerate(line_obj(x) for x in sc.get('lines', [])):
            say = strip(l.get('say', l['text'])).strip()
            v = l.get('voice', voice) if provider != 'mimo' or l.get('voice') in MIMO_VOICES else voice
            r = l.get('rate', rate); st = l.get('style', '') if provider == 'mimo' else ''
            h = hashlib.md5(json.dumps([provider, cfg['model'] if provider == 'mimo' else '', say, v, r, pitch, style, st], ensure_ascii=False).encode()).hexdigest()[:16]
            jobs[h] = dict(say=say, v=v, r=r, st=st, si=si, li=li); row.append((h, l))
        plan.append(row)

    # 2) synthesize (mimo in parallel threads; edge sequential)
    failed = set()
    def run_job(h):
        j = jobs[h]
        if provider == 'mimo':
            wav = cache / f'{h}.wav'
            if wav.exists() and wav.stat().st_size > 1000: return
            mimo_one(j['say'], j['v'], style, j['st'], cfg, wav)
        elif provider == 'edge':
            mp3, js = cache / f'{h}.mp3', cache / f'{h}.json'
            if mp3.exists() and mp3.stat().st_size > 500 and js.exists(): return
            for attempt in range(3):
                try: asyncio.run(edge_one(j['say'], j['v'], j['r'], pitch, mp3, js)); return
                except Exception as e:
                    print(f'  edge retry {attempt + 1} (scene {j["si"] + 1} line {j["li"] + 1}): {e}', file=sys.stderr); mp3.unlink(missing_ok=True); time.sleep(2)
            raise RuntimeError('edge-tts failed')
    if provider in ('mimo', 'edge'):
        todo = list(jobs)
        workers = int(meta.get('ttsWorkers', 4)) if provider == 'mimo' else 1
        done = 0
        with ThreadPoolExecutor(max_workers=workers) as ex:
            futs = {ex.submit(run_job, h): h for h in todo}
            for f in futs:
                h = futs[f]
                try: f.result()
                except FatalTTS as e: print('❌', e); ex.shutdown(cancel_futures=True); sys.exit(2)
                except Exception as e: failed.add(h); print(f'  ⚠️ 配音失败 scene {jobs[h]["si"] + 1} line {jobs[h]["li"] + 1}: {e}', file=sys.stderr)
                done += 1
                if done % 10 == 0: print(f'  {done}/{len(todo)} lines', flush=True)

    # 3) lay out
    out_scenes, track = [], []; total = 0.0
    for si, sc in enumerate(story['scenes']):
        pre = 0.45 if sc.get('kind') == 'part' else 0.15
        t = pre; L = []; audio = [np.zeros(int(pre * SR), np.float32)]
        for li, (h, l) in enumerate(plan[si]):
            j = jobs[h]; x, words = None, []
            if h not in failed:
                try:
                    if provider == 'mimo':
                        x = trim(decode(cache / f'{h}.wav', rate_to_tempo(j['r']))); words = align_segments(x, j['say'])
                    elif provider == 'edge':
                        x = trim(decode(cache / f'{h}.mp3'), head_keep=10); words = json.loads((cache / f'{h}.json').read_text(encoding='utf-8'))
                except Exception as e: print(f'  ⚠️ decode failed scene {si + 1} line {li + 1}: {e}', file=sys.stderr); x = None
            if x is None:
                if provider != 'none': failed.add(h)
                n = len(re.sub(PUNCT, '', j['say'])); x = np.zeros(int(max(.8, n * .21) * SR), np.float32); words = []
            if li: audio.append(np.zeros(int(gap * SR), np.float32)); t += gap
            dur = len(x) / SR
            L.append({'t0': round(t, 3), 't1': round(t + dur, 3), 'text': l['text'], 'words': [{'w': w['w'], 't0': round(t + w['t0'], 3), 't1': round(t + w['t1'], 3)} for w in words]})
            audio.append(x); t += dur
        min_d = max(sc.get('dur', 0) or 0, 1.9 if sc.get('kind') == 'part' else (2.0 if not plan[si] else 0))
        end = max(t + tail, min_d) + sc.get('pad', 0)
        a_ = np.concatenate(audio); a_ = np.pad(a_, (0, max(0, int(end * SR) - len(a_))))[:int(end * SR)]
        track.append(a_); out_scenes.append({'dur': round(end, 3), 'lines': L}); total += end
        print(f'scene {si + 1:>2}: {end:5.2f}s  ' + ' | '.join(strip(l["text"]) for _, l in plan[si])[:80])
    vt = np.concatenate(track) if track else np.zeros(SR, np.float32)
    with wave.open(str(build / 'voice.wav'), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(vt, -1, 1) * 32767).astype('<i2').tobytes())
    timing = {'voice': voice, 'rate': rate, 'provider': provider, 'total': round(total, 3), 'scenes': out_scenes}
    (build / 'timing.json').write_text(json.dumps(timing, ensure_ascii=False, indent=1), encoding='utf-8')
    print(f'\nvoice.wav + timing.json → {build}  总时长 {total:.1f}s' + (f'  ⚠️ {len(failed)} 句配音失败（静音占位），重新运行可重试' if failed else ''))
    if failed and provider != 'none': sys.exit(3)

if __name__ == '__main__':
    p = argparse.ArgumentParser(); p.add_argument('story'); p.add_argument('--voice'); p.add_argument('--rate'); p.add_argument('--provider'); p.add_argument('--out')
    main(p.parse_args())
