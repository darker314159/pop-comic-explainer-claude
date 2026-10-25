#!/usr/bin/env python3
"""Regenerate the visual reference sheets in references/img/ (cast, expressions, poses, icons, backgrounds).
usage: python3 tools/gallery.py"""
import asyncio, json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from _browser import chromium_path, async_playwright, ENGINE
OUT = ENGINE.parent / 'references' / 'img'

HTML = """<html><head><meta charset=utf-8><style>@font-face{font-family:NB;src:url('%(f)s')}
body{margin:0;background:#f4ecdf;font-family:NB}#g{display:flex;flex-wrap:wrap;width:%(W)spx;padding:10px}
.c{position:relative;margin:6px;background:#fffaf2;border:3px solid #1c1a1f;border-radius:14px;overflow:hidden}
.l{position:absolute;left:0;right:0;bottom:0;background:#1c1a1f;color:#fff;font-size:20px;text-align:center;padding:3px 0}</style></head>
<body><div id=g></div><script src="%(e)s/characters.js"></script><script src="%(e)s/icons.js"></script><script>
const items=%(items)s;
for(const it of items){const d=document.createElement('div');d.className='c';d.style.width=it.w+'px';d.style.height=it.h+'px';
 const svg=it.icon?`<div style="width:${it.w-30}px;height:${it.w-30}px;margin:10px 15px">${ICON.svg(it.icon)}</div>`:it.avatar?CHAR.avatarSVG(it):CHAR.charSVG(it);
 d.innerHTML=`<div style="width:100%%;height:${it.h-28}px">${svg}</div><div class=l>${it.label}</div>`;g.appendChild(d)}
</script></body></html>"""

async def sheet(page, items, out, W=1640):
    html = HTML % dict(f=(ENGINE / 'fonts' / 'NotoSansSC-Bold.otf').as_uri(), e=ENGINE.as_uri(), W=W, items=json.dumps(items, ensure_ascii=False))
    tmp = OUT / '_tmp.html'; tmp.write_text(html, encoding='utf-8')
    await page.goto(tmp.as_uri()); await page.wait_for_timeout(400)
    await page.screenshot(path=str(out), full_page=True, type='jpeg', quality=82); tmp.unlink()
    print('saved', out)

async def main():
    OUT.mkdir(parents=True, exist_ok=True)
    js = (ENGINE / 'characters.js').read_text(encoding='utf-8')
    import re
    who = re.findall(r'^\s+(\w+):\s+\{ sex', js, re.M)
    exprs = re.findall(r"'(\w+)'", re.search(r'EXPRESSIONS: \[([^\]]+)\]', js).group(1))
    poses = re.findall(r"'(\w+)'", re.search(r'POSES: \[([^\]]+)\]', js).group(1))
    icons = re.findall(r'^  (\w+): \(', (ENGINE / 'icons.js').read_text(encoding='utf-8'), re.M)
    kw = dict(args=['--no-sandbox', '--allow-file-access-from-files']); exe = chromium_path()
    if exe: kw['executable_path'] = exe
    async with async_playwright() as pw:
        b = await pw.chromium.launch(**kw); page = await b.new_page(viewport={'width': 1660, 'height': 800})
        await sheet(page, [dict(who=w, expr='smile', w=390, h=640, label=f'who: "{w}"') for w in who], OUT / 'cast.jpg')
        await sheet(page, [dict(who='guy', expr=e, w=196, h=330, label=e) for e in exprs] + [dict(who='girl2', expr=e, w=196, h=330, label=e) for e in exprs], OUT / 'expressions.jpg')
        await sheet(page, [dict(who=w, pose=p, expr='smile', w=260, h=430, label=f'pose: {p}') for p, w in zip(poses, ['guy', 'girl', 'guy2', 'girl3', 'girl4', 'guy3', 'boss', 'girl2', 'girl'])], OUT / 'poses.jpg')
        await sheet(page, [dict(icon=n, w=150, h=178, label=n) for n in icons], OUT / 'icons.jpg')
        await b.close()

asyncio.run(main())
