#!/usr/bin/env python3
"""Render still frames / a contact sheet for visual QA (no audio needed).

usage:
  python3 tools/preview.py story.json --out build/sheet.jpg                # one frame per scene (at 85% of the scene)
  python3 tools/preview.py story.json --times 1.5 4.2 9 --out build/f.jpg  # specific seconds
  python3 tools/preview.py story.json --scene 3 --out build/s3.jpg         # 6 frames across scene 3
  add --timing build/timing.json once TTS has been generated (exact timing).
"""
import argparse, asyncio, io, sys
from pathlib import Path
from PIL import Image, ImageDraw
sys.path.insert(0, str(Path(__file__).parent))
from _browser import open_player, load_json, async_playwright

async def main(a):
    story = load_json(a.story); story['_dir'] = str(Path(a.story).parent); timing = load_json(a.timing) if a.timing else load_json(Path(a.story).parent / 'build' / 'timing.json')
    async with async_playwright() as pw:
        browser, page, info = await open_player(pw, story, timing)
        for w in info.get('warnings', []): print('WARN', w)
        sc = info['scenes']
        if a.times: times = a.times
        elif a.scene: s = sc[a.scene - 1]; times = [s['start'] + s['dur'] * k / 5.2 + .05 for k in range(6)]
        else: times = [s['start'] + s['dur'] * .85 for s in sc]
        thumbs = []
        from PIL import ImageFont
        try: fnt = ImageFont.truetype(str(Path(__file__).resolve().parent.parent / 'engine' / 'fonts' / 'NotoSansSC-Bold.otf'), max(14, a.thumb // 16))
        except Exception: fnt = None
        def scene_at(t):
            for k, s in enumerate(sc):
                if s['start'] <= t < s['start'] + s['dur']: return k
            return len(sc) - 1
        for t in times:
            await page.evaluate(f'POP.seek({t})')
            png = await page.screenshot(type='jpeg', quality=88)
            im = Image.open(io.BytesIO(png)).convert('RGB').resize((a.thumb, int(a.thumb * 1920 / 1080)))
            k = scene_at(t); note = story['scenes'][k].get('note', '')
            dr = ImageDraw.Draw(im); lab = f'#{k + 1} {t:.1f}s {note}'.strip()
            if fnt: dr.rectangle([0, 0, a.thumb, fnt.size + 8], fill=(255, 0, 140)); dr.text((6, 3), lab, fill=(255, 255, 255), font=fnt)
            else: dr.text((8, 6), lab, fill=(255, 0, 255))
            thumbs.append(im)
        await browser.close()
    cols = min(a.cols, len(thumbs)); rows = (len(thumbs) + cols - 1) // cols
    W, H = thumbs[0].size
    sheet = Image.new('RGB', (cols * W + (cols - 1) * 6, rows * H + (rows - 1) * 6), (40, 40, 40))
    for i, im in enumerate(thumbs): sheet.paste(im, ((i % cols) * (W + 6), (i // cols) * (H + 6)))
    out = Path(a.out) if a.out else Path(a.story).parent / 'build' / 'sheet.jpg'; out.parent.mkdir(parents=True, exist_ok=True); sheet.save(out, quality=90)
    print('saved', out, f'({len(thumbs)} frames, total duration {info["duration"]:.1f}s)')

if __name__ == '__main__':
    p = argparse.ArgumentParser(); p.add_argument('story'); p.add_argument('--timing'); p.add_argument('--out')
    p.add_argument('--times', type=float, nargs='*'); p.add_argument('--scene', type=int); p.add_argument('--cols', type=int, default=6); p.add_argument('--thumb', type=int, default=360)
    asyncio.run(main(p.parse_args()))
