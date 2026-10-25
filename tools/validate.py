#!/usr/bin/env python3
"""分镜 JSON 校验器（给不能看图的模型用的"眼睛"）。

usage:
  python3 tools/validate.py story.json                  # 静态检查 + 浏览器排版检查（自动读取同目录 build/timing.json）
  python3 tools/validate.py story.json --static         # 只做静态检查（不开浏览器，最快）
  python3 tools/validate.py story.json --describe       # 额外打印每个场景结束时"画面上有什么、在哪里"
退出码：0 = 没有错误（可能有警告）；1 = 有错误，必须修复后再渲染。
"""
import argparse, asyncio, json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ENG = ROOT / 'engine'

# ---------------------------------------------------------------- enumerations (parsed from the engine source)
def _keys_of_block(src, start_pat):
    m = re.search(start_pat, src)
    if not m: return []
    i = m.end(); depth = 1; j = i
    while j < len(src) and depth:
        if src[j] == '{': depth += 1
        elif src[j] == '}': depth -= 1
        j += 1
    body = src[i:j]
    keys, d = [], 0
    for mm in re.finditer(r"[{}]|(?:^|[,{\n])\s*'?([A-Za-z_][\w-]*)'?\s*:", body):
        tok = mm.group(0)
        if tok == '{': d += 1
        elif tok == '}': d -= 1
        elif d == 0 and mm.group(1): keys.append(mm.group(1))
    return keys

def load_enums():
    ch = (ENG / 'characters.js').read_text(encoding='utf-8'); ic = (ENG / 'icons.js').read_text(encoding='utf-8')
    co = (ENG / 'comps.js').read_text(encoding='utf-8'); en = (ENG / 'engine.js').read_text(encoding='utf-8')
    lst = lambda name, src: re.findall(r"'([\w-]+)'", re.search(name + r"\s*:\s*\[([^\]]*)\]", src).group(1))
    E = {}
    E['who'] = _keys_of_block(ch, r'const PRESETS = \{')
    E['expr'] = lst('EXPRESSIONS', ch); E['pose'] = lst('POSES', ch)
    E['icon'] = _keys_of_block(ic, r'const I = \{') + _keys_of_block(ic, r'const ALIASES = \{')
    E['types'] = re.findall(r'^C\.(\w+)\s*=', co, re.M)
    E['pal'] = _keys_of_block(co, r'const PAL = \{')
    E['bg'] = _keys_of_block(en, r'const BG = \{')
    E['slots'] = _keys_of_block(en, r'const SLOTS = \{')
    E['charx'] = _keys_of_block(en, r'const CHAR_X = \{')
    E['charh'] = _keys_of_block(en, r'const CHAR_H = \{')
    E['enter'] = _keys_of_block(en, r'const ENTER_DUR = \{')
    return E

LOOPS = ['float', 'wiggle', 'pulse', 'shake', 'spin', 'bounce', 'swing', 'blink', 'heartbeat']
EXITS = ['pop', 'fade', 'slide-left', 'slide-right', 'drop']
TRANS = ['cut', 'wipe', 'stripes', 'flash', 'zoom', 'slide']
FONTS = ['pop', 'bold', 'num', 'comic', 'smiley', 'cute', 'medium']
HAIRS = ['swept', 'curtain', 'spiky', 'slick', 'long', 'wavy', 'bob', 'pony']
OUTFITS = ['blazer', 'hoodie', 'tee', 'suit', 'cami', 'blouse', 'knit']
META_KEYS = {'series', 'voice', 'rate', 'pitch', 'tts', 'bgm', 'bgmGain', 'sfx', 'sfxGain', 'voiceGain', 'subMax', 'subY', 'header',
             'subtitles', 'watermark', 'gap', 'sceneTail', 'tail', 'speed', 'charSfx', 'title', 'note', 'fps', 'topic', 'ttsStyle', 'ttsModel', 'ttsWorkers', 'cover'}
SCENE_KEYS = {'kind', 'num', 'label', 'color', 'chapter', 'title', 'title2', 'title_style', 'title_size', 'title2_size', 'title_y', 'title_at',
              'bg', 'transition', 'lines', 'elements', 'punch', 'shake', 'flash', 'camera', 'dur', 'pad', 'note', 'id', 'tag'}
COMMON = {'type', 'id', 'at', 'out', 'enter', 'exit', 'enterDur', 'loop', 'x', 'y', 'dx', 'dy', 'pos', 'of', 'rot', 'scale', 'z', 'sfx', 'sfxGain',
          'anchor', 'stagger', 'note', 'overlap', 'opacity'}
FIELDS = {
    'char': 'who expr pose look flip silhouette noBlink outfit style acts size hairColor outfitColor innerColor skin hair eyeColor lip glasses',
    'avatar': 'who expr ring bg size', 'avatars': 'who expr exprs rings count size layout radius gap cols w h',
    'tag': 'text color textColor icon iconColor size font hl round', 'counter': 'text color textColor icon iconColor size font hl round from to dur',
    'bubble': 'text style tail color textColor size hl', 'burst': 'text sub color textColor font size w h spikes hl textRot textSize',
    'onoma': 'text color size', 'icon': 'name color color2 size label labelColor labelSize', 'text': 'text font size color stroke strokeColor shadow box hl track',
    'stamp': 'text color fill size', 'pricetag': 'text sub color size w', 'progress': 'label from to dur color colorTo warnBelow unit w h',
    'meter': 'label labelColor from to dur size', 'card': 'title badge items color w', 'chat': 'title items phone w h', 'polaroids': 'items cols w gap',
    'arrow': 'from to color width curve dur', 'cross': 'color size', 'check': 'color size', 'spotlight': 'x y r dim',
    'particles': 'kind count size spread x y color rise period', 'image': 'src w h sticker frame round', 'shape': 'shape w h color border radius shadow',
    'emph': 'count r1 r2 color width', 'versus': 'left right vs vsY labelY', 'number': 'text color size',
}
TEXT_MAX = {'tag': (8, 12), 'counter': (8, 12), 'bubble': (12, 18), 'burst': (4, 6), 'onoma': (8, 12), 'stamp': (5, 7), 'pricetag': (4, 6),
            'text': (10, 16), 'number': (4, 6)}
AT_RE = re.compile(r'^(start|end|L\d+e?|w\d*:[^+]+?|-?\d*\.?\d+)([+-]\d*\.?\d+)?$')
COLOR_RE = re.compile(r'^#[0-9a-fA-F]{3,8}$|^rgba?\(')

def plain(s): return re.sub(r'[\[\]]', '', str(s or ''))
def spoken(s): return re.sub(r'[\s，。、！？!?,.；;：:“”"‘’\'（）()…—\-·~～\[\]]', '', str(s or ''))

class Report:
    def __init__(s): s.err, s.warn = [], []
    def E(s, where, msg, fix=''): s.err.append(f'❌ {where}: {msg}' + (f'\n     → 修改建议: {fix}' if fix else ''))
    def W(s, where, msg, fix=''): s.warn.append(f'⚠️  {where}: {msg}' + (f'\n     → 建议: {fix}' if fix else ''))

def near(word, options):
    import difflib
    m = difflib.get_close_matches(str(word), [str(o) for o in options], n=3, cutoff=0.4)
    return ('可选值里最接近的: ' + ' / '.join(m)) if m else ('可选值: ' + ' '.join(map(str, options[:40])))

# ---------------------------------------------------------------- static checks
def static_checks(story, E, R, timing=None):
    if not isinstance(story, dict) or 'scenes' not in story:
        R.E('文件', '顶层必须是 {"meta":{...}, "chapters":[...], "scenes":[...]}'); return
    for k in story:
        if k not in ('meta', 'chapters', 'scenes', 'note', '_dir'): R.W('顶层', f'未知字段 "{k}"（会被忽略）')
    meta = story.get('meta', {}) or {}
    for k in meta:
        if k not in META_KEYS: R.W('meta', f'未知字段 "{k}"（会被忽略）', near(k, sorted(META_KEYS)))
    if meta.get('tts') and str(meta['tts']).lower() not in ('auto', 'mimo', 'xiaomi', 'edge', 'none'):
        R.E('meta', f'tts "{meta["tts"]}" 不存在', 'auto / mimo / edge / none')
    if any(str(meta.get(k, '')).startswith(('sk-', 'tp-', 'ttp-')) for k in meta):
        R.E('meta', '不要把 API Key 写进 story.json', '运行 python3 tools/setup_mimo.py sk-xxx 保存到 config.json')
    chapters = story.get('chapters', []) or []
    chap_ids = [str(c.get('id')) for c in chapters]
    for i, c in enumerate(chapters):
        w = f'chapters[{i}]'
        if 'id' not in c or 'name' not in c: R.E(w, '每个章节必须有 id 和 name', '{"id":"01","name":"真相"}')
        if len(plain(c.get('name'))) > 5: R.W(w, f'章节名「{c.get("name")}」超过 5 个字，顶部胶囊会很长', '压缩到 2~4 个字')
        if c.get('color') and c['color'] not in E['pal'] and not COLOR_RE.match(str(c['color'])): R.E(w, f'颜色 "{c["color"]}" 不存在', near(c['color'], E['pal']))
    scenes = story.get('scenes', [])
    if not scenes: R.E('scenes', '没有任何场景'); return
    tsc = (timing or {}).get('scenes') or []
    prev_sig = None; parts = 0
    for i, sc in enumerate(scenes):
        W = f'场景{i + 1}'
        if not isinstance(sc, dict): R.E(W, '场景必须是对象 {...}'); continue
        for k in sc:
            if k not in SCENE_KEYS: R.W(W, f'未知场景字段 "{k}"（会被忽略）', near(k, sorted(SCENE_KEYS)))
        part = sc.get('kind') == 'part'
        if sc.get('kind') not in (None, 'part'): R.E(W, f'kind 只能是 "part" 或不写，现在是 "{sc.get("kind")}"')
        if part:
            parts += 1
            if not sc.get('num'): R.E(W, 'PART 场景必须有 "num"（如 "01"），要和 chapters 里的 id 对应')
            elif chap_ids and str(sc['num']) not in chap_ids: R.E(W, f'num "{sc["num"]}" 不在 chapters 的 id 里 {chap_ids}')
            if len(sc.get('lines', [])) > 1: R.W(W, 'PART 卡片最多 1 句旁白（例如"第一，xxx"），多的放到下一个场景')
        if sc.get('chapter') is not None and chap_ids and str(sc['chapter']) not in chap_ids: R.E(W, f'chapter "{sc["chapter"]}" 不在 chapters 的 id 里 {chap_ids}')
        # title
        t = sc.get('title')
        if not part and not t: R.W(W, '没有标题 title：本系列每个讲解场景都有大标题', '加 4~8 个字的标题')
        if t:
            n = len(plain(t))
            if n > 10: R.E(W, f'标题「{t}」{n} 个字，超过 10 个字会挤成很小的字号', '压缩到 4~8 个字，或拆一部分进 title2')
            elif n > 8: R.W(W, f'标题「{t}」{n} 个字，偏长（最佳 4~8）')
            if t.count('[') != t.count(']'): R.E(W, f'标题「{t}」方括号不成对')
        if sc.get('title2') and len(plain(sc['title2'])) > 12: R.E(W, f'副标题「{sc["title2"]}」超过 12 个字', '压缩到 4~10 个字')
        if sc.get('title_style') and sc['title_style'] not in ('pop', 'white', 'dark', 'yellow') and sc['title_style'] not in E['pal']:
            R.E(W, f'title_style "{sc["title_style"]}" 不存在', '可选: pop / white / dark / yellow')
        # bg / transition
        if sc.get('bg'):
            toks = str(sc['bg']).split()
            if toks[0] not in E['bg'] and toks[0] not in E['pal'] and not COLOR_RE.match(toks[0]): R.E(W, f'背景 "{toks[0]}" 不存在', near(toks[0], E['bg']))
            for x in toks[1:]:
                if x not in ('rays', 'sun', 'flat', 'grid'): R.E(W, f'背景修饰词 "{x}" 不存在', '可选: rays / sun / flat / grid')
        if sc.get('transition') and sc['transition'] not in TRANS: R.E(W, f'转场 "{sc["transition"]}" 不存在', '可选: ' + ' / '.join(TRANS))
        # lines
        lines = sc.get('lines', [])
        if not isinstance(lines, list): R.E(W, 'lines 必须是字符串数组'); lines = []
        if not part and not lines and not sc.get('dur'): R.W(W, '没有旁白 lines（场景只停留 2 秒）')
        if len(lines) > 4: R.W(W, f'{len(lines)} 句旁白，场景太长、画面会停滞', '每个场景 1~3 句，超过就拆成两个场景并换画面')
        total_chars = 0
        for k, L in enumerate(lines):
            txt = L if isinstance(L, str) else (L or {}).get('text', '')
            if not isinstance(txt, str) or not txt.strip(): R.E(W, f'第{k + 1}句旁白为空'); continue
            n = len(spoken(txt)); total_chars += n
            if n > 30: R.E(W, f'第{k + 1}句「{txt}」{n} 个字太长', '一句 8~18 个字，用逗号断开或拆成两句')
            elif n > 22: R.W(W, f'第{k + 1}句「{txt}」{n} 个字偏长（会被切成多段字幕）')
            if txt.count('[') != txt.count(']'): R.E(W, f'第{k + 1}句方括号不成对：「{txt}」')
            if re.search(r'[A-Za-z]{4,}', txt) and not re.search(r'[\u4e00-\u9fff]', txt): R.W(W, f'第{k + 1}句是纯英文，中文配音会读得很怪')
            if re.search(r'[()（）]', txt): R.W(W, f'第{k + 1}句含括号「{txt}」：小米 TTS 会把括号当成语气指令', '去掉括号；要控制语气请用 {"text":"…","style":"开心"}')
            if not isinstance(L, str):
                for kk in L:
                    if kk not in ('text', 'say', 'style', 'voice', 'rate'): R.W(W, f'第{k + 1}句未知字段 "{kk}"', 'text / say / style / voice / rate')
        if tsc and i < len(tsc):
            d = tsc[i].get('dur', 0)
            if not part and d > 8.5: R.W(W, f'场景时长 {d:.1f}s 太长，观众会走神', '拆成两个场景（换背景/换角色表情/加新元素）')
        elif total_chars > 48: R.W(W, f'旁白共 {total_chars} 字（约 {total_chars * 0.21:.0f}s），场景太长', '拆成两个场景')
        # elements
        els = sc.get('elements', [])
        if not isinstance(els, list): R.E(W, 'elements 必须是数组'); els = []
        chars = [e for e in els if isinstance(e, dict) and e.get('type') == 'char']
        if not part and not els: R.W(W, '没有任何画面元素，只有标题+字幕会很空', '至少放 1 个角色或 1 个大道具（icon/card/chat/burst）')
        if len(chars) > 3: R.W(W, f'{len(chars)} 个角色太多，画面会挤', '最多 2 个（加 avatars 表示"一群人"）')
        if len([e for e in els if isinstance(e, dict) and e.get('type') in ('tag', 'counter', 'bubble', 'stamp', 'onoma')]) > 4:
            R.W(W, '小贴纸/气泡超过 4 个，画面会乱', '保留最关键的 2~3 个，其余拆到下一个场景')
        ids = [e.get('id') for e in els if isinstance(e, dict) and e.get('id')]
        for j, e in enumerate(els):
            WE = f'{W} 元素#{j + 1}'
            if not isinstance(e, dict): R.E(WE, '元素必须是对象'); continue
            ty = e.get('type')
            if ty not in E['types']: R.E(WE, f'未知元素类型 "{ty}"（会被跳过）', near(ty, E['types'])); continue
            WE += f'({ty}{" 「" + plain(e.get("text")) + "」" if e.get("text") else ""})'
            allowed = COMMON | set(FIELDS.get(ty, '').split())
            for k in e:
                if k not in allowed: R.W(WE, f'字段 "{k}" 对 {ty} 无效（会被忽略）', near(k, sorted(allowed)))
            for k in ('at', 'out'):
                if k in e and not isinstance(e[k], (int, float)) and not AT_RE.match(str(e[k]).strip()):
                    R.E(WE, f'{k} = "{e[k]}" 格式不对', '数字秒数 / "L2" / "L2e" / "L2+0.3" / "w:关键词" / "end-0.5"')
                if k in e and isinstance(e[k], str) and e[k].startswith('w') and ':' in e[k]:
                    word = re.sub(r'[+-]\d*\.?\d+$', '', e[k].split(':', 1)[1])
                    if not any(word in plain(L if isinstance(L, str) else L.get('text', '')) for L in lines):
                        R.E(WE, f'{k} = "{e[k]}" 但旁白里找不到「{word}」', '关键词必须原样出现在本场景的 lines 里')
                m = re.match(r'^L(\d+)', str(e.get(k, '')))
                if m and int(m.group(1)) > len(lines): R.E(WE, f'{k} = "{e[k]}" 但本场景只有 {len(lines)} 句旁白')
            def chk_enum(field, opts, required=False):
                v = e.get(field)
                if v is None:
                    if required: R.E(WE, f'缺少字段 "{field}"', near('', opts))
                    return
                if v not in opts: R.E(WE, f'{field} = "{v}" 不存在', near(v, opts))
            def chk_color(field):
                v = e.get(field)
                if v is not None and v not in E['pal'] and not COLOR_RE.match(str(v)): R.E(WE, f'颜色 {field} = "{v}" 不存在', near(v, E['pal']))
            for cf in ('color', 'textColor', 'ring', 'iconColor', 'labelColor', 'strokeColor', 'colorTo', 'fill', 'hairColor', 'outfitColor', 'innerColor'):
                if not (ty == 'avatar' and cf == 'bg'): chk_color(cf)
            chk_enum('enter', E['enter']); chk_enum('exit', EXITS); chk_enum('loop', LOOPS)
            if e.get('pos') is not None:
                if ty == 'char': chk_enum('pos', E['charx'])
                elif not str(e['pos']).startswith('head-'): chk_enum('pos', E['slots'] + ['head-left', 'head-right', 'head-top'])
                elif e['pos'] not in ('head-left', 'head-right', 'head-top'): R.E(WE, f'pos = "{e["pos"]}" 不存在', 'head-left / head-right / head-top')
                elif len(chars) > 1 and not e.get('of'): R.E(WE, '有多个角色时 head-* 必须写 "of": "<角色id>"', '给角色加 "id":"a"，这里写 "of":"a"')
                elif e.get('of') and e['of'] not in ids: R.E(WE, f'of = "{e["of"]}" 找不到这个 id 的角色', f'本场景已有 id: {ids}')
            if ty in ('char', 'avatar'):
                chk_enum('who', E['who'], required=(ty == 'char')); chk_enum('expr', E['expr'])
            if ty == 'char':
                chk_enum('pose', E['pose'])
                if e.get('size') is not None and not isinstance(e['size'], (int, float)): chk_enum('size', E['charh'])
                if e.get('hair') is not None: chk_enum('hair', HAIRS)
                if e.get('outfit') is not None: chk_enum('outfit', OUTFITS)
                for a in e.get('acts', []) or []:
                    if 'at' not in a: R.E(WE, 'acts 里每一项都要有 at')
                    elif not isinstance(a['at'], (int, float)) and not AT_RE.match(str(a['at'])): R.E(WE, f'acts.at = "{a["at"]}" 格式不对')
                    if a.get('expr') and a['expr'] not in E['expr']: R.E(WE, f'acts.expr = "{a["expr"]}" 不存在', near(a['expr'], E['expr']))
                    if a.get('pose') and a['pose'] not in E['pose']: R.E(WE, f'acts.pose = "{a["pose"]}" 不存在', near(a['pose'], E['pose']))
            if ty == 'avatars':
                w_ = e.get('who')
                if isinstance(w_, list):
                    for x in w_:
                        if x not in E['who']: R.E(WE, f'who 列表里 "{x}" 不存在', near(x, E['who']))
                elif w_ is not None and w_ not in ('girls', 'guys', 'mixed') + tuple(E['who']): R.E(WE, f'who = "{w_}" 不存在', 'girls / guys / mixed / 或角色列表')
                if e.get('layout') and e['layout'] not in ('arc', 'ring', 'row', 'grid', 'scatter'): R.E(WE, f'layout "{e["layout"]}" 不存在', 'arc / ring / row / grid / scatter')
                if (e.get('count') or 12) > 24: R.W(WE, 'count 超过 24，头像会很小很乱')
            if ty == 'icon': chk_enum('name', E['icon'], required=True)
            if ty == 'tag' and e.get('icon'): chk_enum('icon', E['icon'])
            if ty == 'bubble':
                if e.get('style') and e['style'] not in ('speech', 'thought', 'shout'): R.E(WE, f'style "{e["style"]}" 不存在', 'speech / thought / shout')
                if e.get('tail') and e['tail'] not in ('bl', 'br', 'bottom', 'tl', 'tr', 'none'): R.E(WE, f'tail "{e["tail"]}" 不存在', 'bl / br / bottom / tl / tr / none')
            if ty in ('text', 'tag', 'burst') and e.get('font') and e['font'] not in FONTS: R.W(WE, f'font "{e["font"]}" 不是内置字体名', ' / '.join(FONTS))
            if ty == 'particles' and e.get('kind') and e['kind'] not in ('hearts', 'stars', 'sparkles', 'question', 'zzz', 'sweat', 'music', 'money', 'broken', 'fire') + tuple(E['icon']):
                R.E(WE, f'kind "{e["kind"]}" 不存在', 'hearts / stars / sparkles / question / zzz / sweat / music / money / broken / fire')
            if ty == 'image' and not e.get('src'): R.E(WE, 'image 必须有 src（相对 story.json 的路径或 https 链接）')
            if ty in ('card', 'chat', 'polaroids'):
                its = e.get('items')
                if not isinstance(its, list) or not its: R.E(WE, f'{ty} 必须有非空 items 数组')
                else:
                    if ty == 'card' and len(its) > 6: R.W(WE, f'卡片 {len(its)} 行太多', '最多 5~6 行')
                    if ty == 'chat':
                        if len(its) > 5: R.W(WE, f'聊天 {len(its)} 条太多', '最多 4~5 条')
                        for it in its:
                            if not isinstance(it, dict) or 'text' not in it: R.E(WE, 'chat 的每条 items 必须是 {"side":"l|r","text":"…"}'); break
                            if len(plain(it['text'])) > 14: R.W(WE, f'聊天气泡「{it["text"]}」超过 14 字，会超出手机宽度')
                    if ty == 'card':
                        for it in its:
                            tx = it if isinstance(it, str) else (it or {}).get('text', '')
                            if len(plain(tx)) + len(plain((it or {}).get('value', '') if isinstance(it, dict) else '')) > 16: R.W(WE, f'卡片行「{tx}」太长，可能溢出', '每行 ≤ 14 字')
                    if ty == 'polaroids' and len(its) > 6: R.W(WE, '拍立得超过 6 张会很小')
            if ty == 'arrow' and not (e.get('from') and e.get('to')): R.E(WE, 'arrow 需要 from:[x,y] 和 to:[x,y]（像素坐标）')
            if ty in TEXT_MAX and e.get('text') is not None:
                n = len(plain(str(e['text']).replace('{n}', '00')))
                soft, hard = TEXT_MAX[ty]
                if n > hard: R.E(WE, f'文字 {n} 个字，{ty} 最多 {hard} 字', f'压缩到 {soft} 字以内，长句交给字幕')
                elif n > soft: R.W(WE, f'文字 {n} 个字偏长（{ty} 建议 ≤ {soft}）')
            for k in ('x', 'y'):
                v = e.get(k)
                if isinstance(v, (int, float)):
                    if k == 'x' and not (0 <= v <= 1080): R.E(WE, f'x = {v} 超出画面（0~1080）')
                    if k == 'y' and ty != 'char' and not (380 <= v <= 1404): R.W(WE, f'y = {v} 不在舞台区（430~1400）里，可能压住标题或进入字幕区')
        # repetition
        sig = (str(sc.get('bg', 'cream')).split()[0], tuple(sorted((c.get('who'), c.get('pos', 'center')) for c in chars)), len(els))
        if prev_sig and sig == prev_sig and not part and len(els) <= 1: R.W(W, '和上一个场景画面几乎一样（同背景、同角色、没别的元素）', '换背景色/换角色或表情/加道具，让每 3~5 秒画面有新变化')
        prev_sig = sig
    # mechanical "第一/第二/第三" structure (not required any more — only keep it if the source script really is a list)
    enum_re = re.compile(r'^(第[一二三四五六七八九十\d]+(个|点|条|种|步|层)?[，,、：:]?|首先|其次|再次|其一|其二|其三)')
    enum_lines = [plain(L if isinstance(L, str) else (L or {}).get('text', '')) for sc in scenes if isinstance(sc, dict) for L in (sc.get('lines') or [])]
    enum_hits = [t for t in enum_lines if enum_re.match(t)]
    if len(enum_hits) >= 3 or parts >= 3:
        R.W('全片', f'检测到"第一、第二、第三"式的列点结构（{len(enum_hits)} 句，PART 卡 {parts} 张）', '本风格不要求按 1、2、3 列点。除非原稿本身就是清单，否则改成自然推进：钩子 → 冲突/原因 → 案例 → 爆点 → 回应开头的结尾；PART 卡只在长视频里偶尔用')
    # unfinished placeholders left by script2story.py
    blob = json.dumps(scenes, ensure_ascii=False)
    if re.search(r'待填|TODO|【.*?】', blob): R.E('全片', '分镜里还有占位符（待填 / TODO / 【…】）', '把所有占位符替换成真实内容（标题、元素）再渲染')
    if not scenes[0].get('title'): R.W('场景1', '开头没有大标题，前 3 秒钩子不够强')

# ---------------------------------------------------------------- browser layout checks
def inter(a, b):
    w = min(a['x1'], b['x1']) - max(a['x0'], b['x0']); h = min(a['y1'], b['y1']) - max(a['y0'], b['y0'])
    return max(0, w) * max(0, h)
def area(a): return max(1, (a['x1'] - a['x0']) * (a['y1'] - a['y0']))
NAME = {'title': '标题', 'subtitle': '字幕', 'char': '角色脸'}

async def layout_checks(story, timing, R, describe=False):
    sys.path.insert(0, str(Path(__file__).parent))
    from _browser import open_player, async_playwright
    async with async_playwright() as pw:
        browser, page, info = await open_player(pw, story, timing)
        for w in info.get('warnings', []):
            (R.E if ('never be seen' in w or 'cannot resolve' in w or 'unknown' in w) else R.W)('引擎', w)
        total = info['duration']
        for i, s in enumerate(info['scenes']):
            spec = story['scenes'][i]; els = spec.get('elements', [])
            seen = set()
            for frac in (0.55, 0.97):
                t = s['start'] + s['dur'] * frac
                rep = await page.evaluate(f'POP.report({t})')
                boxes = rep['boxes']; W = f'场景{i + 1}'
                if describe and frac > .9:
                    print(f'\n🎬 场景{i + 1}  [{s["start"]:.1f}s → {s["start"] + s["dur"]:.1f}s, {s["dur"]:.1f}s]  bg={spec.get("bg") or ("PART卡" if spec.get("kind") == "part" else "cream")}')
                    for b in boxes:
                        nm = NAME.get(b['type'], b['type']) + (f'#{b["idx"] + 1}' if b['idx'] >= 0 else '')
                        print(f'   - {nm:10s} 「{str(b["label"])[:16]}」 x {b["x0"]:.0f}~{b["x1"]:.0f}, y {b["y0"]:.0f}~{b["y1"]:.0f}')
                def lab(b):
                    if b['idx'] < 0: return f'{NAME[b["type"]]}「{str(b["label"])[:12]}」'
                    return f'元素#{b["idx"] + 1}({b["type"]}{"「" + str(b["label"])[:10] + "」" if b["label"] and b["type"] != "char" else (" " + str(b["label"]) if b["type"] == "char" else "")})'
                def allowed(b):
                    if b['idx'] < 0 or b['idx'] >= len(els): return False
                    e_ = els[b['idx']]
                    return bool(e_.get('overlap') or (e_.get('type') == 'burst' and not e_.get('text')) or (isinstance(e_.get('z'), (int, float)) and e_['z'] < 0))
                for b in boxes:
                    if b['type'] in ('subtitle', 'char'): continue
                    key = ('oob', b['idx'])
                    if key in seen: continue
                    over = []
                    if b['x0'] < 8: over.append(f'左边超出 {8 - b["x0"]:.0f}px')
                    if b['x1'] > 1072: over.append(f'右边超出 {b["x1"] - 1072:.0f}px')
                    if b['type'] != 'title' and b['y0'] < 225: over.append(f'顶到了页眉区（y={b["y0"]:.0f}）')
                    if b['type'] != 'title' and b['y1'] > 1410 and els[b['idx']].get('type') not in ('char',): over.append(f'压进了底部字幕面板（y 到 {b["y1"]:.0f}，舞台底部是 1404）')
                    if over:
                        seen.add(key); R.E(W, f'{lab(b)} ' + '；'.join(over), '调整 x/y（或 pos）/ 缩小 size / 缩短文字')
                for a_i in range(len(boxes)):
                    for b_i in range(a_i + 1, len(boxes)):
                        a, b = boxes[a_i], boxes[b_i]
                        if 'subtitle' in (a['type'], b['type']): continue
                        if a['type'] == 'char' and b['type'] == 'char': continue
                        if allowed(a) or allowed(b): continue
                        ov = inter(a, b)
                        if not ov: continue
                        r = ov / min(area(a), area(b))
                        key = ('ov', a['idx'], b['idx'])
                        if key in seen: continue
                        face = 'char' in (a['type'], b['type'])
                        if face: r = ov / area(a if a['type'] == 'char' else b)
                        if face and r > 0.18: seen.add(key); R.E(W, f'{lab(a)} 和 {lab(b)} 重叠 {r:.0%}，挡住了角色的脸', '把贴纸挪到脸两侧（pos:"head-left"/"head-right" 或 mid-left/mid-right），或用 y 往下移到胸前')
                        elif face and r > 0.08: seen.add(key); R.W(W, f'{lab(a)} 和 {lab(b)} 盖住了角色脸的 {r:.0%}', '确认没挡住眼睛/嘴；更稳妥是挪到脸侧面')
                        elif not face and r > 0.35: seen.add(key); R.E(W, f'{lab(a)} 和 {lab(b)} 重叠 {r:.0%}', '错开位置（换 pos 或改 x/y），或让先出现的元素用 "out" 提前离场；如果是故意叠放，给元素加 "overlap": true')
                        elif not face and r > 0.12: seen.add(key); R.W(W, f'{lab(a)} 和 {lab(b)} 轻微重叠 {r:.0%}')
        await browser.close()
        return total

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('story'); ap.add_argument('--timing'); ap.add_argument('--static', action='store_true'); ap.add_argument('--describe', action='store_true')
    a = ap.parse_args()
    R = Report()
    try: story = json.loads(Path(a.story).read_text(encoding='utf-8'))
    except json.JSONDecodeError as ex:
        print(f'❌ JSON 语法错误: 第 {ex.lineno} 行第 {ex.colno} 列: {ex.msg}\n   → 常见原因：多了/少了逗号，用了中文引号“”，注释 //，结尾多余逗号'); sys.exit(1)
    story['_dir'] = str(Path(a.story).parent)
    tp = Path(a.timing) if a.timing else Path(a.story).parent / 'build' / 'timing.json'
    timing = json.loads(tp.read_text(encoding='utf-8')) if tp.exists() else None
    if timing and len(timing.get('scenes', [])) != len(story.get('scenes', [])):
        R.W('timing', f'timing.json 有 {len(timing.get("scenes", []))} 个场景，但分镜有 {len(story.get("scenes", []))} 个——分镜改过，需要重新运行 tts.py'); timing = None
    E = load_enums()
    static_checks(story, E, R, timing)
    total = None
    if not a.static and not R.err:
        try: total = asyncio.run(layout_checks(story, timing, R, a.describe))
        except ImportError: R.W('浏览器', '没装 playwright，跳过排版检查（pip install playwright）')
    for m in R.err: print(m)
    for m in R.warn: print(m)
    tinfo = f'，总时长 {total:.1f}s' + ('' if timing else '（估算，未配音）') if total else ''
    if total and total < 30: print(f'⚠️  全片 {total:.0f}s 偏短（建议 45~150s）')
    if total and total > 180: print(f'⚠️  全片 {total:.0f}s 偏长（建议 ≤ 150s）')
    print(f'\n{"❌ 未通过" if R.err else "✅ 通过"}：{len(R.err)} 个错误，{len(R.warn)} 个警告{tinfo}' + ('。先修复所有 ❌ 再渲染。' if R.err else ''))
    sys.exit(1 if R.err else 0)

if __name__ == '__main__': main()
