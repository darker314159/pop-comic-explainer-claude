#!/usr/bin/env python3
"""把成片上传到公共文件托管，返回【可直接下载的链接】（make.py 渲染完会自动调用）。

usage:
  python3 tools/publish.py projects/x/build/video.mp4            # 按顺序尝试托管，成功即停
  python3 tools/publish.py video.mp4 --host uguu                 # 指定托管
  python3 tools/publish.py video.mp4 --time 24h                  # litterbox 保存时长 1h / 12h / 24h / 72h（默认 72h）
结果写到同目录 publish.json：{"url": 直链, "host", "expires", "size"}。

托管（顺序可在 config.json 的 "publish_hosts" 改）：
  catbox     永久保存，需在 config.json 配 "catbox_userhash"（catbox.moe 注册后在账号页获取；匿名上传常被拒）
  litterbox  默认，最长 72 小时，≤1GB，直链
  uguu       约 3 小时，≤128MB，直链
  gofile     长期（有下载才保留），返回下载页（非直链），作为兜底
注意：上传到公共托管 = 拿到链接的人都能下载。用户不希望公开时加 make.py --no-publish。
"""
import argparse, json, os, re, shutil, subprocess, sys, time
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
UA = 'Mozilla/5.0 (pop-comic-explainer publish)'

def cfg():
    c = {}
    for p in [Path.home() / '.pop-comic' / 'config.json', ROOT / 'config.json']:
        if p.exists():
            try: c.update(json.loads(p.read_text(encoding='utf-8')))
            except Exception: pass
    return c

def curl(args, timeout=900):
    if not shutil.which('curl'): raise RuntimeError('找不到 curl 命令')
    r = subprocess.run(['curl', '-sS', '-L', '-A', UA, '--max-time', str(timeout)] + args, capture_output=True, text=True)
    if r.returncode: raise RuntimeError((r.stderr or '').strip()[:200] or f'curl exit {r.returncode}')
    return r.stdout.strip()

def up_catbox(f, o):
    uh = o['cfg'].get('catbox_userhash', '')
    if not uh: raise RuntimeError('未配置 catbox_userhash，跳过')
    out = curl(['-F', 'reqtype=fileupload', '-F', f'userhash={uh}', '-F', f'fileToUpload=@{f}', 'https://catbox.moe/user/api.php'])
    if not out.startswith('https://'): raise RuntimeError(out[:200])
    return out, '永久'

def up_litterbox(f, o):
    t = o['time'] if o['time'] in ('1h', '12h', '24h', '72h') else '72h'
    out = curl(['-F', 'reqtype=fileupload', '-F', f'time={t}', '-F', f'fileToUpload=@{f}', 'https://litterbox.catbox.moe/resources/internals/api.php'])
    if not out.startswith('https://'): raise RuntimeError(out[:200])
    return out, t.replace('h', ' 小时')

def up_uguu(f, o):
    if f.stat().st_size > 128 * 1024 * 1024: raise RuntimeError('文件超过 128MB')
    js = json.loads(curl(['-F', f'files[]=@{f}', 'https://uguu.se/upload']))
    if not js.get('success'): raise RuntimeError(str(js)[:200])
    return js['files'][0]['url'], '约 3 小时'

def up_gofile(f, o):
    js = json.loads(curl(['-F', f'file=@{f}', 'https://upload.gofile.io/uploadfile']))
    if js.get('status') != 'ok': raise RuntimeError(str(js)[:200])
    return js['data']['downloadPage'], '长期（下载页，非直链）'

HOSTS = {'catbox': up_catbox, 'litterbox': up_litterbox, 'uguu': up_uguu, 'gofile': up_gofile}

def verify(url, size):
    """GET the first bytes; direct links must answer 200/206 with a video/binary content type"""
    try:
        r = subprocess.run(['curl', '-sS', '-L', '-A', UA, '--max-time', '60', '-r', '0-2047', '-o', os.devnull, '-w', '%{http_code} %{content_type}', url], capture_output=True, text=True)
        code, _, ctype = r.stdout.partition(' ')
        return code in ('200', '206') and 'text/html' not in ctype, f'{code} {ctype}'
    except Exception as e: return False, str(e)

def publish(path, host=None, time_='72h', quiet=False):
    f = Path(path).resolve()
    if not f.exists(): raise SystemExit(f'❌ 找不到文件 {f}')
    c = cfg(); order = [host] if host else (c.get('publish_hosts') or ['catbox', 'litterbox', 'uguu', 'gofile'])
    mb = f.stat().st_size / 1048576; errs = []
    print(f'☁️  上传 {f.name}（{mb:.1f}MB）…', flush=True)
    for h in order:
        if h not in HOSTS: errs.append(f'{h}: 未知托管'); continue
        for attempt in range(2):
            try:
                url, exp = HOSTS[h](f, {'cfg': c, 'time': time_})
                direct = h != 'gofile'
                ok, info = verify(url, f.stat().st_size) if direct else (True, 'page')
                if not ok: raise RuntimeError(f'链接验证失败 {info}')
                res = {'url': url, 'host': h, 'direct': direct, 'expires': exp, 'size_mb': round(mb, 1), 'file': f.name, 'time': time.strftime('%Y-%m-%d %H:%M')}
                (f.parent / 'publish.json').write_text(json.dumps(res, ensure_ascii=False, indent=1), encoding='utf-8')
                print(f'✅ 已在线发布（{h}，保存 {exp}）\n🔗 {"下载直链" if direct else "下载页"}：{url}')
                return res
            except Exception as e:
                msg = str(e)
                if 'userhash' in msg: errs.append(f'{h}: {msg}'); break
                errs.append(f'{h}#{attempt + 1}: {msg}'); time.sleep(3)
    print('❌ 所有托管都上传失败：\n   ' + '\n   '.join(errs) + '\n   视频仍在本地：' + str(f)); return None

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('file'); ap.add_argument('--host', choices=list(HOSTS)); ap.add_argument('--time', default='72h')
    a = ap.parse_args()
    sys.exit(0 if publish(a.file, a.host, a.time) else 4)
