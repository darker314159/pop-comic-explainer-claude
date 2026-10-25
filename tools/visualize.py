#!/usr/bin/env python3
"""文案可视化助手：逐个场景读旁白 → 给出「场景插画 set / 意象道具 icon / 组件 / 动作」建议，并统计画面丰富度。

usage:
  python3 tools/visualize.py projects/x/story.json            # 打印每个场景的画面建议
  python3 tools/visualize.py projects/x/story.json --apply    # 自动补上：缺 set 的场景加 set、缺道具的场景加 1 个意象 icon（会备份 story.bak.json）
建议只是起点：好的画面来自"这句话能画成什么"——见 references/visualization.md。
"""
import argparse, json, shutil, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import imagery

PROPS = ('icon', 'image', 'chat', 'card', 'polaroids', 'versus', 'meter', 'progress', 'pricetag', 'burst', 'number', 'avatars', 'counter')

def has_prop(sc): return any(isinstance(e, dict) and e.get('type') in PROPS for e in sc.get('elements', []) or [])

def apply(story, inherit=False, max_props=1):
    """add set (place words; carried over to the next scene if it has no place of its own) + one imagery icon per scene. returns #changes"""
    n = 0; last_set = None; carry = 0
    for sc in story.get('scenes', []):
        if sc.get('kind') == 'part': continue
        sg = imagery.suggest(sc)
        if sc.get('set'): last_set = sc['set']; carry = 1
        elif sg['set']: sc['set'] = sg['set']; last_set = sg['set']; carry = 1; n += 1
        elif inherit and last_set and carry < 2: sc['set'] = last_set; carry += 1; n += 1
        else: last_set = None
        els = sc.setdefault('elements', [])
        have = {e.get('name') for e in els if isinstance(e, dict)}
        added = 0
        for icon, kw, ent in sg['props']:
            if added >= max_props or icon in have: continue
            if ent.get('comp') == 'chat' and any(e.get('type') == 'chat' for e in els): continue
            els.append({'type': 'icon', 'name': icon, 'size': 220, 'at': f'w:{kw}', 'enter': 'pop', 'loop': 'float'}); added += 1; n += 1
    return n

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('story'); ap.add_argument('--apply', action='store_true')
    a = ap.parse_args(); p = Path(a.story)
    story = json.loads(p.read_text(encoding='utf-8'))
    scenes = [s for s in story.get('scenes', []) if s.get('kind') != 'part']
    n_set = n_prop = n_mot = 0
    for i, sc in enumerate(story.get('scenes', [])):
        if sc.get('kind') == 'part': continue
        sg = imagery.suggest(sc); els = [e for e in sc.get('elements', []) or [] if isinstance(e, dict)]
        cur = ([f'set:{sc["set"] if isinstance(sc["set"], str) else sc["set"].get("name")}'] if sc.get('set') else []) + [e['type'] + (f':{e.get("name") or e.get("who") or ""}' if e.get('name') or e.get('who') else '') for e in els]
        mot = any(e.get('move') or (e.get('type') != 'char' and e.get('acts')) for e in els)
        n_set += bool(sc.get('set')); n_prop += has_prop(sc); n_mot += mot
        print(f'\n#{i + 1} {sc.get("title", "")}  「{imagery.scene_text(sc)}」')
        print(f'   现在: {", ".join(cur) or "（空）"}' + ('  ✨有动作' if mot else ''))
        if sg['set'] and not sc.get('set'): print(f'   🏠 地点「{sg["set_kw"]}」→ "set": "{sg["set"]}"')
        for icon, kw, ent in sg['props']: print(f'   🎁 「{kw}」→ icon: {" / ".join(ent["icons"])}' + (f'；组件 {ent["comp"]}' if ent.get('comp') else ''))
        for t in dict.fromkeys(sg['tips']): print(f'   🎬 {t}')
        if not sg['hits'] and not has_prop(sc) and not sc.get('set'): print('   ❓ 词典没命中：想一想这句话的「字面物品 / 比喻 / 地点 / 动作」是什么，再从 icons.jpg / sets.jpg 里挑')
    k = max(1, len(scenes))
    print(f'\n丰富度：场景插画 {n_set}/{k} · 道具主视觉 {n_prop}/{k} · 有动作 {n_mot}/{k}   （建议：set ≥ 1/3，道具 ≥ 1/2，动作 ≥ 3 个场景）')
    if a.apply:
        shutil.copy(p, p.with_name(p.stem + '.bak.json'))
        n = apply(story); p.write_text(json.dumps(story, ensure_ascii=False, indent=1), encoding='utf-8')
        print(f'\n✅ 自动补了 {n} 处（set / icon）→ {p}（原文件备份为 {p.stem}.bak.json）。请再用 make.py --check 检查位置，按需改 x/y/size、加 move/acts。')

if __name__ == '__main__': main()
