#!/usr/bin/env python3
"""Render references/img/sets.jpg (all scene sets with a character in front). usage: python3 tools/dev/setsheet.py [out.jpg]"""
import asyncio, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from _browser import chromium_path, async_playwright, ENGINE
OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else ENGINE.parent / 'references' / 'img' / 'sets.jpg'
S = .3
HTML = f"""<html><head><meta charset=utf-8><link rel=stylesheet href="{(ENGINE / 'theme.css').as_uri()}"><style>body{{margin:0;background:#222;width:{int(1080 * S * 4 + 50)}px}}
.c{{display:inline-block;position:relative;width:{1080 * S}px;height:{1404 * S + 34}px;margin:5px;overflow:hidden;border:3px solid #111;background:#fff}}
.in{{position:absolute;left:0;top:0;width:1080px;height:1404px;transform:scale({S});transform-origin:0 0;overflow:hidden}}
.l{{position:absolute;left:0;right:0;bottom:0;height:34px;background:#1c1a1f;color:#fff;font:22px NotoBold,sans-serif;text-align:center;line-height:34px}}</style></head><body>
<script src="{(ENGINE / 'characters.js').as_uri()}"></script><script src="{(ENGINE / 'sets.js').as_uri()}"></script><script>
const who=['girl3','guy','girl','guy2','girl2','boss','girl4','guy3'];
SETS.NAMES.forEach((n,i)=>{{const d=document.createElement('div');d.className='c';
 d.innerHTML=`<div class=in>${{SETS.svg(n)}}<div style="position:absolute;left:${{540-281}}px;top:${{1404-900}}px;width:562px;height:900px">${{CHAR.charSVG({{who:who[i%8],expr:'smile'}})}}</div></div><div class=l>${{n}} · ${{SETS.INFO[n].zh}}</div>`;document.body.appendChild(d)}});
</script></body></html>"""
async def main():
    tmp = ENGINE.parent / 'tools' / 'dev' / '_sets.html'; tmp.write_text(HTML, encoding='utf-8')
    kw = dict(args=['--no-sandbox', '--allow-file-access-from-files']); exe = chromium_path()
    if exe: kw['executable_path'] = exe
    async with async_playwright() as pw:
        b = await pw.chromium.launch(**kw); p = await b.new_page(viewport={'width': int(1080 * S * 4 + 50), 'height': 800})
        await p.goto(tmp.as_uri()); await p.wait_for_timeout(600)
        await p.screenshot(path=str(OUT), full_page=True, type='jpeg', quality=82); await b.close()
    tmp.unlink(); print('saved', OUT)
asyncio.run(main())
