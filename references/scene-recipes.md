# 场景模板库（复制 → 改文字 → 改 at 关键词）

用法：每个场景先想"观众该看到什么"，从下表选最接近的模板，**整段复制**到 `scenes` 数组里，然后：
1. 改 `title` / `lines`；2. 把 `"w:关键词"` 改成你旁白里真实存在的词；3. 换角色 `who` / 背景 `bg`，避免和上一个场景一样。

所有模板都已通过 validate.py 并实际渲染检查过（`examples/recipes/story.json`，预览图 `references/img/recipes_sheet.jpg`）。

| 编号 | 模板 | 什么时候用 |
|---|---|---|
| R01 | 开场·计数钩子 | 开头讲"越多/越频繁/很多次" |
| R02 | 开场·扎心提问 | 开头用"为什么……？"提问 |
| R03 | 开场·点名一群人 | “如果你也是……的人” |
| R04 | 单人·情绪转折 | 一个人的感受从 A 变 B |
| R05 | 单人·内心独白 | 角色心里在想什么 |
| R06 | 双人·对话 | 两个人之间的互动 |
| R07 | 被包围·一对多 | 一个人被很多人评价/围观 |
| R08 | 尴尬·流汗 | 尴尬、慌张、出糗 |
| R09 | 心动 | 喜欢、心动、被吸引 |
| R10 | 麻木·能量下降 | 无感、疲惫、热情消退 |
| R11 | 比喻道具·大图标 | 用一个物件比喻抽象概念 |
| R12 | 揭露真相·聚光灯 | 揭示隐藏的原因/真相 |
| R13 | 审视·放大镜 | “放大”“看清”“审视” |
| R14 | 误区·打叉 | 否定一个常见误解 |
| R15 | 正解·打勾 | 给出正确做法 |
| R16 | 对比·VS 分屏 | 两种人/两种做法对比 |
| R17 | 前后对比·箭头 | 变化：以前 → 现在 |
| R18 | 清单卡 | 列举 2~5 个点/表现/步骤 |
| R19 | 数据·进度条 | 比例、程度、数据 |
| R20 | 价值·吊牌 | “价值/价格/标签化” |
| R21 | 聊天记录 | 对话、消息、冷暴力、试探 |
| R22 | 照片墙 | 多段经历/多个对象/回忆 |
| R23 | 金句·爆炸 | 全片最重要的一句话 |
| R24 | 大数字 | 强调一个数字/次数/年限 |
| R25 | 程度·仪表盘 | 焦虑值、依赖程度、危险等级 |
| R26 | 因果链·箭头 | A 导致 B |
| R27 | 反转·拟声词 | “但是/然而/没想到”的转折 |
| R28 | PART 章节卡（可选） | 只在长的清单型视频（>90 秒，"三个信号"类）分段时用 |
| R29 | 深夜独白 | 孤独、失眠、反复想 |
| R30 | 总结·金句 | 最后的结论 |
| R31 | 结尾·关注贴纸（可选） | 用户要求加关注引导时 |
| R32 | 图片素材 | 有真实截图/AI 生成插画时 |

## 节奏搭配建议

- 不需要"第一/第二/第三"，也不需要 PART 卡。一条连贯的因果链：
- 开头钩子：R01/R02/R03 选一个 → R04/R05（核心判断）
- 中段：原因/机制用"概念"模板(R11~R26)，案例用"情绪/对话"模板(R04~R10、R21 聊天、R22 照片墙、R29 深夜)，两类交替；转折用 R27 反转，因果用 R26
- 爆点：R23 金句爆炸 或 R24 大数字 + punch；结尾：R30 金句回应开头（R31 关注贴纸可选）
- 长的清单型视频才用 R28 PART 卡分段。
- 背景色轮换：cream → light-* → 彩色(yellow/pink/…) → cream，深色(dark/navy) 只给"真相/深夜/孤独"类场景。

## R01 开场·计数钩子
**适用**：开头讲"越多/越频繁/很多次"

```json
{
  "title": "搞定的越多",
  "lines": ["你搞定的女生越多", "对女人就越容易[麻木]"],
  "elements": [
    {"type": "char", "who": "guy", "expr": "smug", "acts": [{"at": "w:麻木", "expr": "numb"}]},
    {"type": "avatars", "who": "girls", "layout": "arc", "count": 12, "x": 540, "y": 760, "radius": 340, "at": 0.3},
    {"type": "counter", "text": "搞定 ×{n}", "from": 1, "to": 17, "dur": 1.6, "x": 830, "y": 1200, "at": 0.4}
  ]
}
```
> 💡 开头场景不用写 transition，默认斜切入场。avatars 的 x/y 设在角色头部附近、radius 340 会形成头顶光环。

## R02 开场·扎心提问
**适用**：开头用"为什么……？"提问

```json
{
  "title": "为什么",
  "title2": "越懂事越[孤独]",
  "bg": "light-blue",
  "lines": ["为什么你越懂事", "反而越[孤独]？"],
  "punch": "w:孤独",
  "elements": [
    {"type": "char", "who": "girl3", "expr": "smile", "acts": [{"at": "w:孤独", "expr": "sad"}]},
    {"type": "particles", "kind": "question", "count": 6, "x": 540, "y": 700, "spread": 700, "at": "L1+0.4"},
    {"type": "bubble", "style": "thought", "text": "是我不够好吗", "x": 800, "y": 1180, "at": "L2+0.3", "tail": "tl", "size": 38}
  ]
}
```

## R03 开场·点名一群人
**适用**：“如果你也是……的人”

```json
{
  "title": "你是不是",
  "title2": "从不[麻烦]别人",
  "bg": "cream-yellow",
  "lines": ["如果你是那种", "从不[麻烦]别人的人"],
  "elements": [
    {"type": "avatars", "who": "mixed", "layout": "grid", "count": 12, "cols": 4, "size": 150, "x": 540, "y": 860, "at": 0.2, "exprs": ["smile", "neutral", "tired"]},
    {"type": "tag", "text": "说的就是你", "icon": "target", "color": "red", "x": 540, "y": 1250, "at": "L2", "loop": "pulse"}
  ]
}
```

## R04 单人·情绪转折
**适用**：一个人的感受从 A 变 B

```json
{
  "title": "表面很平静",
  "bg": "light-green",
  "lines": ["你表面上很平静", "心里早就[崩溃]了"],
  "shake": "w:崩溃",
  "elements": [
    {"type": "char", "who": "guy2", "expr": "smile", "acts": [{"at": "w:崩溃", "expr": "cry"}]},
    {"type": "tag", "text": "没事", "color": "white", "pos": "head-left", "at": 0.4},
    {"type": "tag", "text": "崩溃", "color": "red", "pos": "head-right", "at": "w:崩溃", "enter": "stamp"},
    {"type": "particles", "kind": "sweat", "count": 4, "x": 540, "y": 700, "spread": 400, "at": "w:崩溃"}
  ]
}
```
> 💡 表情变化 + 一对反义贴纸（左"表面"、右"真实"）是最常用的组合。

## R05 单人·内心独白
**适用**：角色心里在想什么

```json
{
  "title": "她在想什么",
  "lines": ["她嘴上说没关系", "心里想的是[你快哄我]"],
  "elements": [
    {"type": "char", "who": "girl", "expr": "smug", "pose": "cross", "acts": [{"at": "L2", "expr": "shy"}]},
    {"type": "bubble", "text": "没关系呀", "x": 250, "y": 640, "tail": "br", "at": 0.3},
    {"type": "bubble", "style": "thought", "text": "你快哄我", "color": "pink", "x": 820, "y": 640, "tail": "bl", "at": "L2"}
  ]
}
```

## R06 双人·对话
**适用**：两个人之间的互动

```json
{
  "title": "一句话破防",
  "bg": "cream-blue",
  "lines": ["他随口一句", "[你变了]", "她立刻就破防了"],
  "elements": [
    {"type": "char", "who": "guy", "id": "a", "pos": "left", "expr": "bored"},
    {"type": "char", "who": "girl2", "id": "b", "pos": "right", "flip": true, "expr": "smile", "acts": [{"at": "L3", "expr": "angry"}]},
    {"type": "bubble", "text": "你变了", "of": "a", "pos": "head-top", "tail": "bottom", "at": "L2"},
    {"type": "onoma", "text": "BOOM!", "color": "red", "x": 800, "y": 560, "at": "L3", "enter": "slam"}
  ]
}
```
> 💡 两个角色都写 id，贴纸/气泡用 of 指定贴在谁头上。右边角色 flip:true 让两人面对面。

## R07 被包围·一对多
**适用**：一个人被很多人评价/围观

```json
{
  "title": "所有人都在看",
  "bg": "light-pink",
  "lines": ["你总觉得", "所有人都在[盯着你]"],
  "elements": [
    {"type": "char", "who": "girl4", "size": "S", "expr": "scared", "y": 1300},
    {"type": "avatars", "who": "mixed", "layout": "ring", "count": 10, "radius": 330, "x": 540, "y": 900, "size": 120, "exprs": ["smug", "think", "bored"], "at": "L2"},
    {"type": "icon", "name": "eye", "size": 150, "x": 540, "y": 640, "at": "w:盯着你", "loop": "pulse"}
  ]
}
```
> 💡 角色用 S 号 + y 调小，让一圈头像包围它。

## R08 尴尬·流汗
**适用**：尴尬、慌张、出糗

```json
{
  "title": "当场社死",
  "bg": "yellow",
  "lines": ["你话说到一半", "突然[忘词]了"],
  "elements": [
    {"type": "emph", "x": 540, "y": 780, "r1": 260, "r2": 420, "at": "w:忘词", "z": 3},
    {"type": "char", "who": "guy3", "expr": "neutral", "acts": [{"at": "w:忘词", "expr": "sweat"}]},
    {"type": "onoma", "text": "OOPS!", "color": "white", "x": 830, "y": 560, "at": "w:忘词", "enter": "slam", "loop": "wiggle"}
  ]
}
```

## R09 心动
**适用**：喜欢、心动、被吸引

```json
{
  "title": "瞬间心动",
  "bg": "pink rays",
  "lines": ["她只是笑了一下", "你就[心动]了"],
  "elements": [
    {"type": "char", "who": "guy", "pos": "left", "size": "M", "expr": "neutral", "acts": [{"at": "w:心动", "expr": "love"}]},
    {"type": "char", "who": "girl", "pos": "right", "size": "M", "flip": true, "expr": "wink"},
    {"type": "icon", "name": "heart", "size": 200, "x": 540, "y": 760, "at": "w:心动", "loop": "heartbeat", "enter": "zoom"},
    {"type": "particles", "kind": "hearts", "count": 8, "x": 540, "y": 900, "spread": 800, "at": "w:心动"}
  ]
}
```

## R10 麻木·能量下降
**适用**：无感、疲惫、热情消退

```json
{
  "title": "越来越无感",
  "bg": "light-blue",
  "lines": ["热情一点点被[耗光]"],
  "elements": [
    {"type": "char", "who": "guy2", "expr": "tired", "acts": [{"at": "w:耗光", "expr": "numb"}], "pos": "center", "y": 1440},
    {"type": "progress", "label": "心动值", "from": 90, "to": 5, "dur": 1.8, "color": "green", "colorTo": "red", "warnBelow": 30, "y": 530, "w": 760, "at": 0.3},
    {"type": "icon", "name": "battery_low", "size": 170, "pos": "head-right", "at": "w:耗光"}
  ]
}
```

## R11 比喻道具·大图标
**适用**：用一个物件比喻抽象概念

```json
{
  "title": "关系的牢笼",
  "bg": "cream",
  "lines": ["你以为是安全感", "其实是一座[牢笼]"],
  "elements": [
    {"type": "icon", "name": "cage", "size": 520, "x": 540, "y": 880, "at": 0.2, "enter": "drop", "label": "安全感？"},
    {"type": "icon", "name": "bird", "size": 200, "x": 540, "y": 930, "at": 0.6, "z": 11, "loop": "float", "overlap": true},
    {"type": "stamp", "text": "牢笼", "x": 820, "y": 1220, "rot": -12, "at": "w:牢笼"}
  ]
}
```
> 💡 常用比喻：cage 束缚 / balance 权衡 / battery_low 精力 / mask 伪装 / lock 封闭 / key 解法 / bomb 隐患 / mirror 自我 / gauge 程度 / target 目标。

## R12 揭露真相·聚光灯
**适用**：揭示隐藏的原因/真相

```json
{
  "title": "真正的原因",
  "bg": "dark",
  "lines": ["真正让你害怕的", "是那个[不够好]的自己"],
  "flash": "w:不够好",
  "elements": [
    {"type": "spotlight", "x": 540, "y": 900, "r": 330, "at": 0},
    {"type": "char", "who": "guy", "silhouette": true, "acts": [{"at": "w:不够好", "silhouette": false, "expr": "sad"}]},
    {"type": "tag", "text": "不够好", "color": "red", "pos": "head-right", "at": "w:不够好", "enter": "stamp"}
  ]
}
```
> 💡 acts 里也可以切换 silhouette，做"剪影 → 露脸"的揭晓。

## R13 审视·放大镜
**适用**：“放大”“看清”“审视”

```json
{
  "title": "放大给你看",
  "lines": ["她只是把你的[不安]", "放大给你看"],
  "elements": [
    {"type": "char", "who": "guy2", "expr": "neutral", "acts": [{"at": "L2", "expr": "scared"}]},
    {"type": "icon", "name": "magnifier", "size": 300, "x": 760, "y": 1120, "at": "L2", "enter": "slide-right", "loop": "swing"},
    {"type": "tag", "text": "匮乏", "color": "red", "pos": "mid-left", "at": "w:不安"},
    {"type": "tag", "text": "羞耻", "color": "pink", "pos": "upper-right", "at": "L2+0.3"}
  ]
}
```

## R14 误区·打叉
**适用**：否定一个常见误解

```json
{
  "title": "不是不爱你",
  "bg": "cream-yellow",
  "lines": ["很多人以为", "冷淡就是[不爱]了"],
  "elements": [
    {"type": "char", "who": "girl2", "pos": "left", "size": "M", "expr": "think", "acts": [{"at": "w:不爱", "expr": "shock"}]},
    {"type": "bubble", "style": "thought", "text": "冷淡=不爱？", "x": 760, "y": 640, "tail": "bl", "at": "L1+0.3"},
    {"type": "cross", "size": 260, "x": 780, "y": 960, "at": "w:不爱"},
    {"type": "tag", "text": "误解", "color": "red", "x": 780, "y": 1200, "at": "w:不爱+0.3"}
  ]
}
```

## R15 正解·打勾
**适用**：给出正确做法

```json
{
  "title": "正确做法",
  "bg": "light-green",
  "lines": ["你该做的是", "先[照顾好]自己"],
  "elements": [
    {"type": "char", "who": "girl4", "pose": "cheer", "expr": "happy", "pos": "left", "size": "M"},
    {"type": "check", "size": 240, "x": 800, "y": 700, "at": "w:照顾好"},
    {"type": "tag", "text": "先爱自己", "icon": "heart", "color": "white", "x": 790, "y": 1000, "at": "w:照顾好+0.3"}
  ]
}
```

## R16 对比·VS 分屏
**适用**：两种人/两种做法对比

```json
{
  "title": "高手vs新手",
  "lines": ["新手拼命[证明]自己", "高手只是做自己"],
  "elements": [
    {"type": "versus", "left": {"color": "blue", "label": "新手"}, "right": {"color": "pink", "label": "高手"}, "at": 0},
    {"type": "char", "who": "guy3", "pos": "left", "size": "M", "expr": "sweat"},
    {"type": "char", "who": "boss", "pos": "right", "size": "M", "expr": "cool", "pose": "cross", "at": "L2"},
    {"type": "tag", "text": "用力过猛", "color": "yellow", "x": 260, "y": 1260, "at": "w:证明"},
    {"type": "tag", "text": "松弛感", "color": "white", "x": 820, "y": 1260, "at": "L2+0.4"}
  ]
}
```
> 💡 versus 自带左右标签；角色放 left/right；底部各一张结论贴纸。

## R17 前后对比·箭头
**适用**：变化：以前 → 现在

```json
{
  "title": "从讨好到松弛",
  "bg": "light-yellow",
  "lines": ["以前你拼命讨好", "现在你学会了[松弛]"],
  "elements": [
    {"type": "char", "who": "girl3", "pos": "left", "size": "M", "expr": "sweat"},
    {"type": "char", "who": "girl3", "pos": "right", "size": "M", "expr": "cool", "pose": "cross", "at": "L2"},
    {"type": "arrow", "from": [380, 640], "to": [700, 640], "curve": -0.25, "at": "L2"},
    {"type": "tag", "text": "以前", "color": "grey", "x": 290, "y": 1250, "at": 0.3},
    {"type": "tag", "text": "现在", "color": "green", "x": 790, "y": 1250, "at": "L2+0.2"}
  ]
}
```

## R18 清单卡
**适用**：列举 2~5 个点/表现/步骤

```json
{
  "title": "三个信号",
  "bg": "cream-blue",
  "lines": ["回复越来越慢", "分享越来越少", "连见面都开始[找借口]"],
  "elements": [
    {"type": "card", "title": "TA 在疏远你", "badge": "CHECK", "color": "yellow", "y": 820, "w": 800, "items": [{"text": "回复越来越慢", "num": true, "at": "L1"}, {"text": "不再分享日常", "num": true, "at": "L2"}, {"text": "开始[找借口]", "num": true, "at": "L3"}]},
    {"type": "char", "who": "girl", "size": "XS", "x": 900, "expr": "sad"}
  ]
}
```
> 💡 每一行用 at 对齐到对应旁白（L1/L2/L3）。行文字 ≤ 12 字。旁白不用说"第一、第二"，卡片上的序号就够了。

## R19 数据·进度条
**适用**：比例、程度、数据

```json
{
  "title": "九成的人",
  "bg": "yellow",
  "lines": ["百分之九十的人", "都在用错的方式[道歉]"],
  "elements": [
    {"type": "number", "text": "90%", "size": 300, "color": "red", "x": 540, "y": 700, "at": 0.2},
    {"type": "progress", "label": "用错方式道歉", "from": 0, "to": 90, "dur": 1.4, "color": "red", "y": 1000, "w": 800, "at": 0.4},
    {"type": "avatars", "who": "mixed", "layout": "row", "count": 6, "size": 110, "x": 540, "y": 1220, "at": "L2"}
  ]
}
```

## R20 价值·吊牌
**适用**：“价值/价格/标签化”

```json
{
  "title": "你的价值",
  "lines": ["你总在用别人的评价", "给自己[标价]"],
  "elements": [
    {"type": "char", "who": "guy", "pos": "left", "size": "M", "expr": "sad"},
    {"type": "pricetag", "text": "¥9.9", "sub": "SALE", "color": "yellow", "x": 790, "y": 560, "w": 280, "at": "w:标价"},
    {"type": "tag", "text": "被定义", "color": "red", "x": 790, "y": 1180, "at": "w:标价+0.4"}
  ]
}
```

## R21 聊天记录
**适用**：对话、消息、冷暴力、试探

```json
{
  "title": "秒回到不回",
  "bg": "light-pink",
  "lines": ["一开始秒回", "后来变成了[已读不回]"],
  "elements": [
    {"type": "chat", "title": "TA", "w": 640, "y": 860, "items": [{"side": "r", "text": "在干嘛呀", "at": 0.3}, {"side": "l", "text": "想你呀～", "at": 0.9}, {"side": "r", "text": "今晚有空吗", "at": "L2"}, {"side": "r", "text": "？", "at": "w:已读不回"}]},
    {"type": "stamp", "text": "已读", "x": 830, "y": 1230, "at": "w:已读不回+0.4"}
  ]
}
```
> 💡 side:"r" 是自己（绿色），"l" 是对方（白色）。最多 4~5 条，每条 ≤ 12 字。

## R22 照片墙
**适用**：多段经历/多个对象/回忆

```json
{
  "title": "一段又一段",
  "bg": "cream-yellow",
  "lines": ["一段又一段[关系]", "你都没有真正投入"],
  "elements": [
    {"type": "polaroids", "cols": 3, "w": 250, "y": 820, "items": [{"who": "girl", "text": "初恋"}, {"who": "girl2", "text": "同事"}, {"who": "girl3", "text": "网友"}, {"who": "girl4", "text": "学妹"}, {"icon": "broken_heart", "text": "……"}, {"icon": "question", "text": "下一个"}], "at": 0.2},
    {"type": "stamp", "text": "没投入", "x": 760, "y": 1260, "rot": -10, "at": "L2+0.3"}
  ]
}
```

## R23 金句·爆炸
**适用**：全片最重要的一句话

```json
{
  "title": "记住这句话",
  "bg": "red rays",
  "lines": ["你不是不好", "你只是[不够爱自己]"],
  "punch": "w:不够爱自己",
  "flash": "w:不够爱自己",
  "elements": [
    {"type": "burst", "text": "爱自己", "color": "white", "textColor": "red", "w": 720, "x": 540, "y": 860, "at": "w:不够爱自己", "enter": "slam", "sub": "SELF LOVE"},
    {"type": "onoma", "text": "POW!", "color": "yellow", "x": 840, "y": 1270, "at": "w:不够爱自己+0.2"}
  ]
}
```
> 💡 punch + flash + burst 三连 = 最强冲击，一部片子最多用 1~2 次。

## R24 大数字
**适用**：强调一个数字/次数/年限

```json
{
  "title": "整整三年",
  "bg": "navy",
  "lines": ["你等了他", "整整[三年]"],
  "elements": [
    {"type": "number", "text": "3", "size": 520, "color": "yellow", "x": 400, "y": 860, "at": "w:三年", "enter": "slam"},
    {"type": "text", "text": "YEARS", "font": "comic", "size": 130, "color": "white", "x": 720, "y": 1000, "at": "w:三年+0.2"},
    {"type": "icon", "name": "clock", "size": 180, "x": 820, "y": 640, "at": 0.3, "loop": "wiggle"}
  ]
}
```

## R25 程度·仪表盘
**适用**：焦虑值、依赖程度、危险等级

```json
{
  "title": "焦虑爆表",
  "bg": "orange",
  "lines": ["只要他不回消息", "你的焦虑就[爆表]"],
  "elements": [
    {"type": "char", "who": "girl2", "pos": "right", "size": "M", "flip": true, "expr": "neutral", "acts": [{"at": "w:爆表", "expr": "scared"}]},
    {"type": "meter", "label": "焦虑值", "from": 10, "to": 98, "dur": 1.6, "size": 420, "x": 300, "y": 720, "at": 0.3},
    {"type": "onoma", "text": "BEEP!", "color": "yellow", "x": 300, "y": 1160, "at": "w:爆表", "loop": "blink"}
  ]
}
```

## R26 因果链·箭头
**适用**：A 导致 B

```json
{
  "title": "越控制越失去",
  "bg": "light-green",
  "lines": ["你越想[控制]", "就越会失去"],
  "elements": [
    {"type": "icon", "name": "lock", "size": 230, "x": 260, "y": 760, "at": 0.2, "label": "控制"},
    {"type": "arrow", "from": [400, 760], "to": [680, 760], "curve": -0.3, "at": "L2"},
    {"type": "icon", "name": "broken_heart", "size": 230, "x": 820, "y": 760, "at": "L2+0.3", "label": "失去"},
    {"type": "char", "who": "guy3", "size": "S", "expr": "sad", "y": 1460}
  ]
}
```

## R27 反转·拟声词
**适用**：“但是/然而/没想到”的转折

```json
{
  "title": "但是",
  "bg": "purple rays",
  "lines": ["但真相恰恰相反"],
  "shake": "L1+0.3",
  "elements": [
    {"type": "onoma", "text": "BUT!", "size": 220, "color": "yellow", "x": 540, "y": 820, "at": 0.15, "enter": "slam"},
    {"type": "emph", "x": 540, "y": 820, "r1": 300, "r2": 480, "color": "white", "at": 0.15}
  ]
}
```
> 💡 短小的过渡场景（1 句话），节奏上像一个"急刹车"。

## R28 PART 章节卡（可选）
**适用**：只在长的清单型视频（>90 秒，"三个信号"类）分段时用

```json
{
  "kind": "part",
  "num": "01",
  "lines": ["先说第一个信号"]
}
```
> 💡 普通口播不要用。用的话需要在 story 顶层写 chapters（见 SKILL.md"可选：章节"）。PART 卡自动用章节颜色+放射线+大号数字，标题自动用 chapters 里的 name，可写 "title" 覆盖。旁白 ≤ 1 句。

## R29 深夜独白
**适用**：孤独、失眠、反复想

```json
{
  "title": "凌晨两点",
  "bg": "navy",
  "lines": ["凌晨两点", "你又点开了她的[朋友圈]"],
  "elements": [
    {"type": "char", "who": "guy2", "pose": "phone", "expr": "tired", "acts": [{"at": "w:朋友圈", "expr": "sad"}]},
    {"type": "particles", "kind": "zzz", "count": 4, "x": 300, "y": 640, "spread": 300, "at": 0.3},
    {"type": "icon", "name": "clock", "size": 160, "pos": "head-right", "at": 0.2},
    {"type": "tag", "text": "又在想她", "color": "purple", "pos": "head-left", "at": "w:朋友圈"}
  ]
}
```

## R30 总结·金句
**适用**：最后的结论

```json
{
  "title": "麻木换来自由",
  "title2": "也拿走[心动]",
  "bg": "yellow sun",
  "lines": ["麻木换来了自由", "也拿走了[心动]"],
  "elements": [
    {"type": "char", "who": "guy", "expr": "smile", "pose": "heart", "acts": [{"at": "w:心动", "expr": "sad"}]},
    {"type": "avatar", "who": "girl", "x": 160, "y": 820, "at": "L1+0.3", "loop": "float"},
    {"type": "avatar", "who": "girl3", "x": 920, "y": 860, "at": "L1+0.6", "loop": "float", "ring": "pink"},
    {"type": "tag", "text": "越经历越难心动", "color": "white", "x": 540, "y": 1290, "at": "L2+0.2"}
  ]
}
```

## R31 结尾·关注贴纸（可选）
**适用**：用户要求加关注引导时

```json
{
  "title": "下期见",
  "bg": "pink sun",
  "lines": ["别再委屈自己了", "我们[下期]见"],
  "elements": [
    {"type": "char", "who": "girl4", "pose": "wave", "expr": "happy"},
    {"type": "tag", "text": "关注", "icon": "heart", "color": "yellow", "pos": "head-left", "at": 0.2, "loop": "pulse"},
    {"type": "tag", "text": "点赞收藏", "icon": "star", "color": "white", "pos": "head-right", "at": "L2"},
    {"type": "particles", "kind": "stars", "count": 7, "x": 540, "y": 800, "spread": 800, "at": "L2"}
  ]
}
```
> 💡 "关注/点赞"放在贴纸上即可，旁白不强制喊"关注我"。用户没要求时直接用 R30 金句收尾。

## R32 图片素材
**适用**：有真实截图/AI 生成插画时

```json
{
  "title": "看这张图",
  "bg": "light-blue",
  "lines": ["你看这个[眼神]"],
  "elements": [
    {"type": "image", "src": "assets/sample.png", "w": 520, "x": 540, "y": 850, "at": 0.2, "frame": true},
    {"type": "tag", "text": "眼神", "color": "red", "x": 840, "y": 1200, "at": "w:眼神"}
  ]
}
```
> 💡 src 相对 story.json 所在文件夹。frame:true = 黑边相框；默认是"贴纸描边"（适合透明底 PNG）。
