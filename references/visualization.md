# 文案 → 画面：可视化翻译法（让场景不单调）

> 目标：观众**不听声音、只看画面**也能大致看懂在讲什么。每句旁白都问自己：**"这句话能画成什么？"**

## 1. 四层画面模型（每个场景从下往上叠）

| 层 | 作用 | 用什么 | 要求 |
|---|---|---|---|
| ① 场景层 | 交代"在哪儿、什么时候" | 场景字段 `"set"`（16 张插画）或纯色 `bg` | 有地点/时间的句子**必须**用 set |
| ② 主体层 | 谁在经历 | `char`（表情+姿势+acts） | 情绪随关键词变 |
| ③ 意象层 | 把**物品/比喻**画出来 | `icon`（110+ 个）/ `chat` / `card` / `pricetag` / `polaroids` | 每个重要物品都要出现在画面上 |
| ④ 强调层 | 把重点"砸"进眼里 | `tag` `burst` `stamp` `onoma` `punch` `shake` | ≤3 个小贴纸 |

**变化用动作表达**：东西"给出去 / 扔掉 / 飞走 / 掉下来" → `move`；东西"变了"（玫瑰枯萎、杯子空了、天平倾斜）→ `acts` 换 `name` / `rot`。

## 2. 翻译规则

1. **地点/时间词 → set**："深夜/凌晨/睡不着" → `bedroom_night`；"上班/老板/加班" → `office`；"约会/吃饭" → `date`；"下雨/哭" → `rain_window`；"选择/路口" → `crossroads`；"放下/释怀/结尾" → `seaside`。
2. **字面物品 → icon**：旁白提到"礼物、玫瑰、手机、钱包、咖啡、蛋糕、行李箱…" 就把这个东西画出来，并在说到它时出现：`"at":"w:礼物"`。
3. **比喻 → 道具**（最出彩的一步）：
   | 文案里的比喻/概念 | 画成 |
   |---|---|
   | 被操控、牵着走 | `puppet`（提线木偶） |
   | 表面一点点、背后一大片 | `iceberg` |
   | 关系失衡、付出不对等 | `seesaw` + `acts` 倾斜 `rot` |
   | 消耗、时间不多 | `hourglass` `battery` |
   | 束缚、困住 | `chain` `handcuffs` `cage` `maze` |
   | 放手、释怀 | `balloon` + `move` 飞走 |
   | 冷淡、冷暴力 | `ice_cube` `snowflake` `thermometer` |
   | 修复、疗愈 | `bandage` `pill` `seedling → tree` |
   | 隔阂、拒绝 | `brick_wall` `crack` |
   | 方向、选择 | `signpost` `compass` `lighthouse` `crossroads`(set) |
   | 廉价、被定价 | `pricetag` |
   | 期待落空 | `rose → wilted_rose`、`glass_half` |
4. **变化 → 动作**：一句话里有动词"送/给/扔/丢/掉/飞/逃/追" → 用 `move`；有"变/越来越/慢慢" → 用 `acts`。
5. **数字/对比/清单** → `counter` / `versus` / `card`；**对话** → `chat`。

## 3. 写法示例

```json
{ "title": "礼物进了[垃圾桶]", "set": "date",
  "lines": ["你精心准备的[礼物]", "他看都没看就扔到一边"],
  "elements": [
    {"type":"char","who":"girl","expr":"smile","pos":"left","acts":[{"at":"L2","expr":"shock"}]},
    {"type":"icon","name":"gift","size":200,"x":620,"y":900,"at":"w:礼物",
     "move":[{"at":"L2","to":[880,1200],"arc":-160,"rot":200,"scale":0.7,"sfx":"swish"}]},
    {"type":"icon","name":"trash","size":200,"x":880,"y":1230,"at":"L2"}
  ]}
```

```json
{ "title": "热情慢慢[枯萎]", "set": "rain_window",
  "lines": ["一次次的冷落", "让[热情]一点点枯萎"],
  "elements": [
    {"type":"icon","name":"rose","size":300,"pos":"center","acts":[{"at":"w:热情","name":"wilted_rose"}]},
    {"type":"tag","text":"已读不回","color":"blue","pos":"mid-left","at":"L1"}
  ]}
```

`move` 字段：`to:[x,y]` 或位置名/角色 id，`by:[dx,dy]`，`at`，`dur`(默认 .7)，`arc`(弧线高度，负数向上)，`rot`，`scale`，`ease`(inOut/in/out/linear)，`sfx`(默认 swish)；写成数组可以连续动。
道具 `acts`：`[{"at":"w:词","name":"新图标","color":"red","text":"新文字"}]`，切换时会弹一下并带音效。

## 4. 场景插画 set 一览（看 `references/img/sets.jpg`）

| set | 画面 | 别名 |
|---|---|---|
| `bedroom` | 卧室（白天） | room |
| `bedroom_night` 🌙 | 深夜卧室（月亮、台灯） | night |
| `office` | 办公室（落地窗城市） | |
| `cafe` | 咖啡馆 | |
| `date` | 约会餐厅（烛光、串灯） | restaurant |
| `street` | 街道 | |
| `city_night` 🌙 | 城市夜景/天台 | city, rooftop |
| `park` | 公园 | |
| `classroom` | 教室（黑板） | school |
| `living_room` | 客厅/家（沙发） | home |
| `rain_window` 🌙 | 雨夜窗边 | rain |
| `party` | 派对/聚会 | |
| `subway` | 地铁车厢/通勤 | metro |
| `stage` 🌙 | 舞台（幕布、聚光） | |
| `seaside` | 海边日落 | sea, beach |
| `crossroads` | 岔路口（选择） | road, choice |

🌙 = 深色场景，字幕/标题自动用浅色。`"set":{"name":"office","flip":true,"dim":0.3}` 可镜像、压暗（让前景更突出）。
set 会替代 `bg`；**不要连续 3 个场景以上用同一个 set**，中间穿插纯色 `bg`（放射线 rays 适合爆点）。

## 5. 丰富度目标（validate 会提示）

- 有 set 的场景 ≥ 1/3；有意象道具的场景 ≥ 1/2；有 `move`/道具 `acts` 的场景 ≥ 3 个。
- 不要连续 3 个"只有角色 + 贴纸"的场景。

## 6. 工具

```bash
python3 tools/visualize.py projects/x/story.json          # 每个场景给出 set / icon / 组件建议 + 丰富度统计
python3 tools/visualize.py projects/x/story.json --apply  # 自动补 set 和 1 个意象 icon（备份 story.bak.json），再手动精修
python3 tools/imagery.py 冷暴力 礼物 深夜                  # 查某个词能画成什么
```

`script2story.py` 生成骨架时已自动执行一次 `--apply`。自动结果只是起点：**重要物品要配 `at:"w:词"`，有动作的用 `move`/`acts`**，这一步要手动做。
