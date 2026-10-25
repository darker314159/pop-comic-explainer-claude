#!/usr/bin/env python3
"""一键流水线：校验 → 配音 → 排版校验 → 预览图 → 渲染。

usage:
  python3 tools/make.py my/story.json            # 全流程，输出 my/build/video.mp4
  python3 tools/make.py my/story.json --check    # 只到预览图（不渲染），改稿阶段用这个
  python3 tools/make.py my/story.json --force    # 有 ❌ 也继续（不推荐）
  python3 tools/make.py my/story.json --tts edge # 临时指定配音：mimo / edge / none（默认看 meta.tts，再看有没有小米 Key）
  python3 tools/make.py my/story.json --no-publish   # 渲染后不上传（默认会自动上传并给出下载直链）
  其余参数透传给 render.py：--fps 30 --workers 2 --crf 18
"""
import argparse, subprocess, sys
from pathlib import Path
T = Path(__file__).resolve().parent

def run(step, args, stop=True):
    print(f'\n========== {step} ==========', flush=True)
    r = subprocess.run([sys.executable, str(T / args[0])] + args[1:])
    if r.returncode and stop:
        print(f'\n⛔ {step} 失败（退出码 {r.returncode}）。按上面的提示修改 story.json 后重新运行。'); sys.exit(r.returncode)
    return r.returncode

p = argparse.ArgumentParser(); p.add_argument('story'); p.add_argument('--check', action='store_true'); p.add_argument('--force', action='store_true')
p.add_argument('--tts', choices=['auto', 'mimo', 'edge', 'none'])
p.add_argument('--no-publish', action='store_true'); p.add_argument('--host'); p.add_argument('--time', default='72h')
p.add_argument('--fps', default='30'); p.add_argument('--workers', default='2'); p.add_argument('--crf', default='18')
a = p.parse_args(); s = a.story
run('1/6 静态校验', ['validate.py', s, '--static'], stop=not a.force)
run('2/6 配音 + 时间轴', ['tts.py', s] + (['--provider', a.tts] if a.tts else []))
run('3/6 排版校验（真实时间轴）', ['validate.py', s], stop=not a.force)
run('4/6 预览图', ['preview.py', s])
if a.check: print(f'\n✅ 检查完成。预览图: {Path(s).parent / "build" / "sheet.jpg"}。确认无误后去掉 --check 渲染。'); sys.exit(0)
run('5/6 渲染', ['render.py', s, '--fps', a.fps, '--workers', a.workers, '--crf', a.crf])
out = Path(s).parent / 'build' / 'video.mp4'
print(f'\n🎉 完成: {out}')
if not a.no_publish:
    run('6/6 在线发布', ['publish.py', str(out), '--time', a.time] + (['--host', a.host] if a.host else []), stop=False)
