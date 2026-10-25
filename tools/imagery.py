#!/usr/bin/env python3
"""意象词典：把旁白里的「地点 / 物品 / 抽象概念」翻译成画面（set 场景插画 / icon 道具 / 组件 / 动作）。
被 visualize.py、script2story.py、validate.py 共用。也可以直接查词：python3 tools/imagery.py 冷暴力 礼物 深夜
"""
import re, sys

# kind: place = 地点 → set；object = 字面物品 → icon（旁白说到就该出现）；metaphor = 抽象概念 → 比喻道具；action = 动作 → move/acts 演出来
LEX = [
    # ---------------- 地点 → set
    dict(kind='place', kw='深夜 凌晨 失眠 睡不着 半夜 熬夜 夜里 睡前 晚上', set='bedroom_night', icons=['moon', 'zzz'], tip='深夜独白：set bedroom_night + 角色 pose phone + particles zzz'),
    dict(kind='place', kw='卧室 床上 起床 被窝 房间 宅在家 躺平', set='bedroom', icons=['bed']),
    dict(kind='place', kw='公司 上班 加班 老板 领导 同事 工位 职场 开会 辞职 打工 面试 升职 绩效 下属 甲方', set='office', icons=['briefcase', 'clock'], tip='职场：set office；老板用 who:boss'),
    dict(kind='place', kw='咖啡馆 奶茶店 下午茶', set='cafe', icons=['coffee']),
    dict(kind='place', kw='约会 晚餐 餐厅 烛光 纪念日 表白 相亲 吃饭', set='date', icons=['wine', 'candle', 'rose'], tip='两人对坐：两个 char left/right + set date'),
    dict(kind='place', kw='街上 路上 逛街 马路 商场 偶遇 下班路上', set='street', icons=['shopping_bag']),
    dict(kind='place', kw='城市 大城市 北漂 沪漂 漂泊 天台 夜景 霓虹 出租屋', set='city_night', icons=['moon']),
    dict(kind='place', kw='公园 散步 草地 户外 周末 野餐', set='park', icons=['tree', 'sun']),
    dict(kind='place', kw='学校 老师 学生 考试 上课 教室 同学 作业 高考 成绩 班主任', set='classroom', icons=['book']),
    dict(kind='place', kw='家里 回家 父母 爸妈 妈妈 爸爸 家人 过年 客厅 原生家庭 亲戚 催婚', set='living_room', icons=['house', 'sofa', 'tv']),
    dict(kind='place', kw='下雨 雨天 雨夜 窗外 淋雨', set='rain_window', icons=['cloud_rain', 'umbrella']),
    dict(kind='place', kw='聚会 派对 生日 聚餐 酒局 热闹 婚礼 团建', set='party', icons=['balloon', 'cake']),
    dict(kind='place', kw='地铁 通勤 公交 早高峰 挤地铁', set='subway'),
    dict(kind='place', kw='舞台 表演 演戏 演员 观众 人设 聚光灯 演技', set='stage', icons=['microphone', 'mask'], tip='"演/人设"：set stage + mask 道具'),
    dict(kind='place', kw='海边 大海 释怀 旅行 远方 度假 看海', set='seaside', icons=['paper_plane', 'sun']),
    dict(kind='place', kw='选择 岔路 十字路口 纠结 犹豫 抉择 路口 何去何从', set='crossroads', icons=['signpost', 'dice'], tip='选择题：set crossroads + 两个 tag 分别贴在路牌两边'),
    # ---------------- 字面物品 → icon
    dict(kind='object', kw='手机 消息 微信 回复 秒回 聊天记录 朋友圈 已读 未读 发信息', icons=['phone', 'chat'], comp='chat', tip='对话内容用 chat 组件；"秒回/不回"用 phone icon + loop wiggle'),
    dict(kind='object', kw='礼物 送礼 惊喜', icons=['gift'], tip='礼物 move 递到对方面前；被嫌弃时 move 进 trash'),
    dict(kind='object', kw='玫瑰 鲜花 花束 送花', icons=['rose'], tip='感情变淡：rose 用 acts 换成 wilted_rose'),
    dict(kind='object', kw='枯萎 凋谢 凋零', icons=['wilted_rose']),
    dict(kind='object', kw='工资 存款 收入 赚钱 花钱 彩礼 房贷 月薪 年薪 负债', icons=['money', 'wallet', 'coin'], tip='钱变多/变少：counter 数字滚动 或 particles money'),
    dict(kind='object', kw='钱包 买单 AA 请客', icons=['wallet']),
    dict(kind='object', kw='咖啡', icons=['coffee']),
    dict(kind='object', kw='蛋糕 生日', icons=['cake']),
    dict(kind='object', kw='戒指 求婚 结婚 婚姻 嫁 娶', icons=['ring']),
    dict(kind='object', kw='喝酒 酒 醉', icons=['wine']),
    dict(kind='object', kw='读书 看书 书 学习 知识', icons=['book']),
    dict(kind='object', kw='开车 车 豪车', icons=['car']),
    dict(kind='object', kw='飞机 异地 出国 远方', icons=['plane'], tip='异地：plane move 从一边飞到另一边'),
    dict(kind='object', kw='行李 搬走 出走 离家', icons=['suitcase']),
    dict(kind='object', kw='房子 买房 租房', icons=['house']),
    dict(kind='object', kw='门 敲门 关门 推开', icons=['door']),
    dict(kind='object', kw='钥匙', icons=['key']),
    dict(kind='object', kw='情书 信封 来信', icons=['envelope']),
    dict(kind='object', kw='镜子 照镜子', icons=['mirror']),
    dict(kind='object', kw='照片 拍照 合照 自拍', icons=['camera'], comp='polaroids'),
    dict(kind='object', kw='蜡烛', icons=['candle']),
    dict(kind='object', kw='雨伞 撑伞 伞', icons=['umbrella']),
    dict(kind='object', kw='电视 刷剧', icons=['tv']),
    dict(kind='object', kw='吃药 药', icons=['pill']),
    dict(kind='object', kw='购物 买买买 包包 剁手', icons=['shopping_bag']),
    dict(kind='object', kw='日历 天数 第一天 每一天 倒计时', icons=['calendar']),
    dict(kind='object', kw='闹钟 几点 准时 迟到', icons=['clock']),
    dict(kind='object', kw='游戏 打游戏', icons=['gamepad']),
    # ---------------- 抽象概念 → 比喻道具
    dict(kind='metaphor', kw='冷暴力 冷漠 冷淡 冰冷 冷下来 心凉', icons=['ice_cube', 'snowflake'], tip='冷：ice_cube + particles snowflake；或 set rain_window'),
    dict(kind='metaphor', kw='热情 温度 降温 升温 热度', icons=['thermometer', 'fire'], tip='热情消退：thermometer 配 progress 从 90 降到 10'),
    dict(kind='metaphor', kw='控制 操控 摆布 PUA 拿捏 牵着鼻子走', icons=['puppet'], tip='被操控：角色头上放 puppet，或 puppet icon 大图 loop swing'),
    dict(kind='metaphor', kw='束缚 困住 牢笼 枷锁 被困 套牢', icons=['cage', 'chain'], tip='困住：cage 套在角色上（z 高于角色）'),
    dict(kind='metaphor', kw='绑住 捆绑 绑架 道德绑架', icons=['rope', 'chain', 'handcuffs']),
    dict(kind='metaphor', kw='依赖 离不开', icons=['handcuffs', 'anchor']),
    dict(kind='metaphor', kw='安全感 依靠 港湾 靠山', icons=['anchor', 'umbrella', 'house', 'shield']),
    dict(kind='metaphor', kw='成长 进步 变好 改变 慢慢来', icons=['seedling', 'ladder', 'chart_up'], tip='成长：seedling acts 换成 tree'),
    dict(kind='metaphor', kw='逆袭 起飞 上升 翻身 爆发式', icons=['rocket', 'ladder', 'chart_up'], tip='rocket move 向上冲出画面'),
    dict(kind='metaphor', kw='目标 梦想 理想 终点 山顶', icons=['flag', 'mountain', 'target']),
    dict(kind='metaphor', kw='迷茫 困惑 找不到方向 迷路 内耗', icons=['maze', 'compass', 'question']),
    dict(kind='metaphor', kw='方向 指引 出路', icons=['compass', 'signpost', 'lighthouse']),
    dict(kind='metaphor', kw='平衡 权衡 付出与回报 对等 不对等 天平', icons=['seesaw', 'balance'], tip='付出不对等：seesaw 倾斜'),
    dict(kind='metaphor', kw='冰山 表面 一角 看不见的 内心深处 隐藏', icons=['iceberg'], tip='冰山：iceberg 大图，tag 分别标在水上/水下'),
    dict(kind='metaphor', kw='受伤 伤害 伤口 伤疤 创伤', icons=['bandage', 'broken_heart']),
    dict(kind='metaphor', kw='治愈 疗愈 自愈 愈合', icons=['bandage', 'pill', 'sun']),
    dict(kind='metaphor', kw='套路 诱饵 上钩 诱惑 钓', icons=['hook'], tip='诱饵：hook 从上方 move 降下来'),
    dict(kind='metaphor', kw='吸引 吸引力 被吸引 魅力', icons=['magnet', 'heart'], tip='magnet + 一排 heart move 被吸过去'),
    dict(kind='metaphor', kw='距离 隔阂 疏远 越走越远', icons=['bridge', 'brick_wall'], tip='两个角色分别 move 到 far-left / far-right'),
    dict(kind='metaphor', kw='防备 防御 戒备 心墙 设防', icons=['brick_wall', 'shield']),
    dict(kind='metaphor', kw='沟通 连接 桥梁 理解', icons=['bridge', 'chat']),
    dict(kind='metaphor', kw='契合 合适 匹配 互补 拼图', icons=['puzzle'], tip='两块 puzzle move 拼到一起'),
    dict(kind='metaphor', kw='心碎 分手 失恋 被甩', icons=['broken_heart', 'crack']),
    dict(kind='metaphor', kw='裂痕 破裂 崩塌 出问题', icons=['crack']),
    dict(kind='metaphor', kw='面具 伪装 假装 演 讨好 装作', icons=['mask'], tip='摘面具：mask move 飞走，露出真实表情'),
    dict(kind='metaphor', kw='价值 廉价 掉价 标价 身价 便宜', icons=['tag'], comp='pricetag'),
    dict(kind='metaphor', kw='时间 青春 岁月 等待 拖延 来不及 浪费', icons=['hourglass', 'clock']),
    dict(kind='metaphor', kw='压力 崩溃 爆炸 情绪失控 炸了', icons=['bomb', 'thermometer'], tip='bomb + shake'),
    dict(kind='metaphor', kw='秘密 心事 守口如瓶', icons=['lock', 'key']),
    dict(kind='metaphor', kw='真相 本质 答案 看清 看透', icons=['magnifier', 'key'], tip='真相：spotlight + 角色 silhouette 揭开'),
    dict(kind='metaphor', kw='精力 疲惫 很累 耗尽 透支 内耗', icons=['battery_low']),
    dict(kind='metaphor', kw='希望 光 曙光 转机', icons=['lighthouse', 'sun', 'seedling']),
    dict(kind='metaphor', kw='低谷 黑暗 至暗', icons=['moon', 'cloud_rain']),
    dict(kind='metaphor', kw='自由 解脱 挣脱', icons=['bird', 'balloon', 'paper_plane'], tip='挣脱：chain 用 acts 换成 bird'),
    dict(kind='metaphor', kw='放手 放下 告别 算了', icons=['balloon', 'paper_plane'], tip='放手：balloon move 往上飘出画面'),
    dict(kind='metaphor', kw='机会 新的开始 另一扇门', icons=['door', 'key']),
    dict(kind='metaphor', kw='底线 边界 界限 拒绝', icons=['shield', 'ban']),
    dict(kind='metaphor', kw='乐观 悲观 半杯水 心态', icons=['glass_half']),
    dict(kind='metaphor', kw='运气 赌 碰运气 概率', icons=['dice']),
    dict(kind='metaphor', kw='发声 表达 说出来 沟通', icons=['microphone', 'megaphone']),
    dict(kind='metaphor', kw='断舍离 剪断 切断 断联', icons=['scissors'], tip='scissors 剪断 rope'),
    dict(kind='metaphor', kw='扔掉 丢掉 抛弃 不要了', icons=['trash'], tip='道具 move 进 trash'),
    dict(kind='metaphor', kw='孤独 一个人 孤单 没人懂', icons=['moon'], tip='孤独：set city_night / rain_window，角色 size S 偏一侧留大面积空'),
    dict(kind='metaphor', kw='心动 喜欢 爱上', icons=['heart'], tip='heart loop heartbeat + particles hearts'),
    dict(kind='metaphor', kw='比较 攀比 对比', icons=['balance'], comp='versus'),
    dict(kind='metaphor', kw='上瘾 戒不掉 沉迷', icons=['hook', 'phone']),
]
for e in LEX: e['kw'] = e['kw'].split()

def match(text):
    """-> list of (entry, keyword) found in text, longest keywords first, no duplicates per entry."""
    t = re.sub(r'[\[\]]', '', text or ''); out, seen = [], set()
    pairs = sorted(((k, i) for i, e in enumerate(LEX) for k in e['kw']), key=lambda x: -len(x[0]))
    used = [False] * len(t)
    for k, i in pairs:
        if i in seen: continue
        for m in re.finditer(re.escape(k), t):
            if any(used[m.start():m.end()]): continue
            if len(k) == 1 and k not in ('书', '车', '门', '酒', '伞', '药', '演', '嫁', '娶', '醉', '赌', '钓', '光'): continue
            for j in range(m.start(), m.end()): used[j] = True
            seen.add(i); out.append((LEX[i], k)); break
    return out

def scene_text(sc):
    return ' '.join((l if isinstance(l, str) else l.get('text', '')) for l in sc.get('lines', []))

def suggest(sc):
    """per-scene suggestions -> dict(set, props:[(icon,kw,tip)], comps, hits)"""
    hits = match(scene_text(sc))
    s = dict(set=None, set_kw=None, props=[], comps=[], tips=[], hits=hits)
    for e, k in hits:
        if e['kind'] == 'place' and not s['set']: s['set'], s['set_kw'] = e['set'], k
        if e.get('icons') and e['kind'] != 'place': s['props'].append((e['icons'][0], k, e))
        if e.get('comp'): s['comps'].append((e['comp'], k))
        if e.get('tip'): s['tips'].append(e['tip'])
    return s

if __name__ == '__main__':
    for w in sys.argv[1:] or ['冷暴力', '礼物', '深夜']:
        hs = match(w)
        if not hs: print(f'{w}: （词典里没有，按"这个词能画成什么"自己想：字面物品 / 比喻道具 / 地点 / 动作）'); continue
        for e, k in hs:
            print(f'{w} → [{e["kind"]}] ' + (f'set={e["set"]} ' if e.get('set') else '') + (f'icons={"/".join(e.get("icons", []))} ' if e.get('icons') else '') + (f'comp={e["comp"]} ' if e.get('comp') else '') + (f'· {e["tip"]}' if e.get('tip') else ''))
