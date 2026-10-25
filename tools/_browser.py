"""Shared headless-browser helper: opens engine/player.html with a story + timing injected."""
import asyncio, json, os, shutil
from pathlib import Path
from playwright.async_api import async_playwright

ENGINE = Path(__file__).resolve().parent.parent / 'engine'

def chromium_path():
    for p in [os.environ.get('CHROMIUM'), shutil.which('chromium'), shutil.which('chromium-browser'), shutil.which('google-chrome')]:
        if p and os.path.exists(p): return p
    return None   # fall back to playwright's bundled browser (`playwright install chromium`)

def resolve_assets(story):
    """image.src may be relative to the story.json folder -> make it an absolute file:// URI for the player."""
    base = Path(story.get('_dir') or '.').resolve()
    for sc in story.get('scenes', []):
        for e in sc.get('elements', []) or []:
            if isinstance(e, dict) and e.get('type') == 'image' and e.get('src') and not str(e['src']).startswith(('http:', 'https:', 'data:', 'file:')):
                p = Path(e['src']); p = p if p.is_absolute() else base / p
                if not p.exists(): print(f'[asset missing] {p}')
                e['src'] = p.resolve().as_uri()
    return story

async def open_player(pw, story, timing, scale=1.0):
    story = resolve_assets(json.loads(json.dumps(story)))
    exe = chromium_path()
    kw = dict(args=['--no-sandbox', '--allow-file-access-from-files', '--disable-web-security', '--font-render-hinting=none'])
    if exe: kw['executable_path'] = exe
    browser = await pw.chromium.launch(**kw)
    page = await browser.new_page(viewport={'width': 1080, 'height': 1920}, device_scale_factor=scale)
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
    await page.add_init_script(f"window.__STORY__ = {json.dumps(story, ensure_ascii=False)}; window.__TIMING__ = {json.dumps(timing, ensure_ascii=False) if timing else 'null'};")
    await page.goto((ENGINE / 'player.html').as_uri())
    info = await page.evaluate('window.__ready')
    if errors: print('[browser errors]', *errors[:10], sep='\n  ')
    return browser, page, info

def load_json(p):
    return json.loads(Path(p).read_text(encoding='utf-8')) if p and Path(p).exists() else None
