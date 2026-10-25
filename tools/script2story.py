#!/usr/bin/env python3
"""script.md（标题/封面文字/口播正文，water-koubo 输出格式）→ story.json 骨架。

usage: python3 tools/script2story.py projects/x/script.md [--out projects/x/story.json] [--per 3] [--max 18] [--force]
也接受纯文本稿（没有"口播正文："时整篇当正文）。生成后标题是【待填】，需要模型逐个场景填好再 make.py --check。
"""
import argparse, json, re, sys
from pathlib import Path

BGS = ['cream', 'light-blue', 'cream-yellow', 'light-pink', 'light-green', 'cream-blue', 'light-yellow', 'paper']
CAST = ['guy', 'girl', 'guy2', 'girl2', 'girl3', 'guy3']

def parse(md):
    md = md.replace('\r\n', '\n')
    def field(name):
        m = re.search(rf'^\s*\**{name}\**\s*[：:]\s*(.*?)(?=^\s*\**(?:标题|封面文字|口播正文)\**\s*[：:]|\Z)', md, re.S | re.M)
        return m.group(1).strip() if m else ''
    title, cover, body = field('标题'), field('封面文字'), field('口播正文')
    if not body: body = md.strip()
    return title, cover, body

def split_sentences(para, mx):
    """split a paragraph into narration lines ≤ mx chars, cutting at punctuation; keep ？！ and drop other trailing punct."""
    para = re.sub(r'[（(][^）)]*[）)]', '', para)                     # parentheses would be read as style tags
    para = para.replace('“', '').replace('”', '').replace('"', '')
    parts = re.split(r'(?<=[。！？!?；;…])', para)
    out = []
    for p in parts:
        p = p.strip()
        if not p: continue
        chunks = [c for c in re.split(r'(?<=[，,、：:—])', p) if c.strip()]
        cur = ''
        for c in chunks:
            c = c.strip()
            if cur and len(re.sub(r'\W', '', cur + c)) > mx: out.append(cur); cur = c
            else: cur += c
        if cur: out.append(cur)
    res = []
    for l in out:
        l = re.sub(r'[，,、：:；;—。…\.]+$', '', l).strip()
        while len(re.sub(r'\W', '', l)) > mx + 4:           # hard split very long chunks without punctuation
            cut = mx; res.append(l[:cut]); l = l[cut:]
        if l: res.append(l)
    return res

def group(lines, per):
    """1~per lines per scene, prefer splitting after questions/exclamations, keep ~ ≤ 36 chars per scene."""
    scenes, cur = [], []
    for l in lines:
        cur.append(l)
        n = sum(len(x) for x in cur)
        if len(cur) >= per or n >= 30 or (l.endswith(('？', '?', '！', '!')) and len(cur) >= 2):
            scenes.append(cur); cur = []
    if cur:
        if scenes and len(cur) == 1 and len(scenes[-1]) < per: scenes[-1] += cur
        else: scenes.append(cur)
    return scenes

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('script'); ap.add_argument('--out'); ap.add_argument('--per', type=int, default=3)
    ap.add_argument('--max', type=int, default=18); ap.add_argument('--force', action='store_true')
    a = ap.parse_args()
    src = Path(a.script); out = Path(a.out) if a.out else src.with_name('story.json')
    if out.exists() and not a.force: sys.exit(f'❌ {out} 已存在（加 --force 覆盖）')
    title, cover, body = parse(src.read_text(encoding='utf-8'))
    paras = [p.strip() for p in re.split(r'\n\s*\n|\n', body) if p.strip()]
    scenes = []
    for p in paras:
        for g in group(split_sentences(p, a.max), a.per): scenes.append(g)
    if not scenes: sys.exit('❌ 没有找到口播正文')
    story = {'meta': {'series': '', 'topic': (title or cover or '')[:8], 'cover': cover, 'bgm': 'auto'}, 'scenes': []}
    for i, g in enumerate(scenes):
        sc = {'title': '【待填】', 'bg': BGS[i % len(BGS)], 'lines': g,
              'elements': [{'type': 'char', 'who': CAST[(i // 2) % len(CAST)], 'expr': 'neutral', 'acts': [{'at': 'L2' if len(g) > 1 else 'L1+0.6', 'expr': 'shock'}]}]}
        if i == 0 and (cover or title): sc['title'] = cover or title
        story['scenes'].append(sc)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(story, ensure_ascii=False, indent=1), encoding='utf-8')
    n = sum(len(g) for g in scenes); chars = sum(len(re.sub(r'\W', '', l)) for g in scenes for l in g)
    print(f'✅ {out}：{len(scenes)} 个场景 / {n} 句 / {chars} 字（约 {chars / 4.5:.0f} 秒）')
    print('下一步：逐个场景把 title 的【待填】换成 4~8 字结论、给旁白加 [关键词]、按 scene-recipes.md 换主视觉，再运行 make.py --check')

if __name__ == '__main__':
    main()
