---
name: pop-comic-explainer
description: 制作"波普漫画风"竖屏讲解短视频（抖音/视频号/小红书 1080×1920）。米色网点纸背景或 16 张场景插画（卧室/办公室/约会/雨夜/海边…）、文案意象可视化（礼物/玫瑰/冰山/木偶等 110+ 道具与动作）、粗黑描边、平涂高饱和色、帅哥美女 Q 版半身角色、大标题逐字弹出、贴纸/气泡/拟声词/计数器/聊天框等动效，自动配音（小米 MiMo TTS / edge-tts）+字幕+音效+BGM，渲染后自动上传并给出可直接下载的链接；内置 water-koubo 可把参考稿二创成抖音爆款口播。适用于心理学/情感/认知/职场/科普类"拆解"口播。用户说"做个讲解视频 / 波普风 / 漫画风 / 心理拆解视频 / 把这段文案做成视频 / 把这篇稿子改成口播视频"时使用。
---

# 波普漫画风讲解视频（Pop-Comic Explainer）

你只需要写 **一个 `story.json` 分镜文件**，引擎会自动完成：角色绘制、排版、动画、字幕、配音、音效、BGM、渲染 MP4。
**你不需要写任何 HTML/CSS/JS，也不要去改 `engine/` 里的代码。**

```
skill/
├── SKILL.md                ← 你正在读（流程 + 硬性规则 + 速查）
├── references/
│   ├── copywriting.md      ← 有参考稿时：用 water-koubo 二创成爆款口播
│   ├── script-writing.md   ← 怎么写口播文案（先读！）
│   ├── scene-recipes.md    ← 40+ 个可直接复制的场景模板（最常用）
│   ├── visualization.md    ← 文案→画面翻译法：地点→场景插画、物品/比喻→道具、变化→动作（必读）
│   ├── components.md       ← 每个元素的全部字段
│   ├── characters.md       ← 角色/表情/姿势/换装
│   ├── style-bible.md      ← 画面规范：颜色、字号、布局网格、节奏
│   ├── qa-checklist.md     ← 常见错误与修法
│   └── img/                ← cast.jpg expressions.jpg poses.jpg icons.jpg sets.jpg recipes_sheet.jpg（能看图就看）
├── copywriting/water-koubo/ ← 第三方文案二创 Skill（原样收录，CC BY-NC 4.0）
├── engine/                 ← 渲染引擎（不要改）
├── tools/                  ← make.py(一键) setup_mimo.py script2story.py visualize.py imagery.py validate.py tts.py preview.py render.py publish.py(上传) gallery.py
├── config.example.json     ← 小米 TTS 配置示例（setup_mimo.py 会生成 config.json）
└── examples/
    ├── pleaser/   《越讨好越廉价》完整示例：story.json + video.mp4 + sheet.jpg（首选参考）
    ├── numb/      《搞定的越多越麻木》示例
    └── recipes/   42 个模板合在一起的测试分镜
```

## 0. 环境（第一次用时执行一次）

```bash
pip install playwright edge-tts numpy pillow
python3 -m playwright install chromium      # 系统已有 chromium 可跳过（会自动找 /usr/bin/chromium）
ffmpeg -version                             # 必须有 ffmpeg
```

**配音（推荐小米 MiMo TTS，用户只需要提供一个 API Key）：**
```bash
python3 tools/setup_mimo.py sk-xxxxxxxx     # 保存 Key 到 config.json 并试合成一句，看到 ✅ 就好了
```
- Key 在 https://platform.xiaomimimo.com 的 API Keys 页面创建（`sk-` 按量 / `tp-` Token Plan 都行，地址自动识别）。也可用环境变量 `MIMO_API_KEY`。
- 用户没给 Key：自动退回免费的 edge-tts（需联网）；都没网：`meta.tts:"none"` 生成无声版。**不要编造 Key，也不要把用户的 Key 写进 story.json 或回复里。**
- 用户提到"小米 TTS / MiMo 配音"但没给 Key 时，问他要 Key，然后运行上面的命令。

## 1. 工作流程（严格按顺序）

1. **写文案**（保存为 `projects/<名字>/script.md`）：
   - 用户给了**参考稿/别人的文案** → 按 `references/copywriting.md` 用 water-koubo 二创成「标题 / 封面文字 / 口播正文」；
   - 只给了**主题** → 按 `references/script-writing.md` 写：钩子 → 核心判断 → 原因/案例 → 爆点 → 回应开头。**不需要"第一、第二、第三"分点，也不需要 PART 卡**；每句 8~18 字，总 30~150 秒。
2. **拆分镜**：`python3 tools/script2story.py projects/<名字>/script.md` 自动切句、分场景，生成 story.json 骨架（也可以手写，推荐复制 `examples/pleaser/story.json`）。
3. **填分镜**：每 1~3 句旁白 = 1 个场景。把每个 `【待填】` 标题改成 4~8 字结论，从 `references/scene-recipes.md` 选模板配画面，旁白加 `[关键词]`。
   - **按文案可视化**（读 `references/visualization.md`）：有地点/时间 → 场景加 `"set"`；提到重要物品 → 画出这个 `icon` 并 `"at":"w:物品"`；比喻 → 意象道具（冰山/木偶/跷跷板/气球…）；动作/变化 → `move` / 道具 `acts`。
   - `python3 tools/visualize.py projects/<名字>/story.json` 会逐场景给出建议和丰富度统计（script2story 已自动补过一轮 set/道具，你再精修）。
4. **检查**：`python3 tools/make.py projects/<名字>/story.json --check`
   - 会依次：静态校验 → 配音 → 排版校验 → 生成预览图 `build/sheet.jpg`。
   - 有 `❌` 就按提示改 `story.json`，再跑一次，直到 `✅ 通过`。`⚠️` 尽量也修。
   - **你看不了图片时**：运行 `python3 tools/validate.py projects/<名字>/story.json --describe`，它会用文字告诉你每个场景画面上有什么、在什么坐标，用它代替看图。
5. **渲染**：`python3 tools/make.py projects/<名字>/story.json` → `projects/<名字>/build/video.mp4`
   - 1 分钟视频在 2 核机器上约 2~4 分钟。命令可能超时，就放后台跑：`nohup python3 tools/make.py … > build.log 2>&1 &`，然后 `tail build.log` 看进度。
   - 只想看某一段：`python3 tools/render.py story.json --start 10 --end 20 --out build/part.mp4`
6. **在线部署**：make.py 渲染完会**自动上传**视频，日志最后打印 `🔗 下载链接: https://…`（同时写入 `build/publish.json`）。默认 litterbox（直链，保存 72 小时）→ 失败自动换 uguu / gofile。手动上传：`python3 tools/publish.py build/video.mp4 [--host litterbox|uguu|gofile|catbox] [--time 72h]`。config.json 填 `catbox_userhash` 可得永久链接。用户明确不想上传时加 `--no-publish`。
7. **交付**：给用户 **视频文件 + 可直接下载的链接**（注明有效期）+ 一句话说明（时长、配音音色）。**每次交付都必须给链接**，上传全部失败时说明原因并重试 `publish.py`。

## 2. story.json 最小骨架

```json
{
  "meta": { "topic": "心理拆解", "voice": "苏打", "bgm": "auto" },
  "scenes": [
    { "title": "越懂越孤独", "lines": ["你有没有发现", "越懂事的人[越孤独]"],
      "elements": [ { "type": "char", "who": "guy", "expr": "sad", "acts": [{ "at": "w:孤独", "expr": "cry" }] },
                    { "type": "tag", "text": "懂事", "color": "yellow", "at": "L2" } ] },
    { "title": "需求藏起来", "bg": "light-pink", "lines": ["因为懂事的本质", "是把自己的[需求]藏起来"], "elements": [ … ] },
    { "title": "不是不爱你", "bg": "cream-yellow", "lines": ["别人不是不爱你", "是根本不知道你[需要]"], "elements": [ … ] }
  ]
}
```

- 场景按顺序播放；场景时长 = 它的旁白配音时长（自动），不用写秒数。
- 顶部左上黑色胶囊 = `meta.series`（账号/系列名，可不写）；旁边的彩色胶囊 = `meta.topic`（2~6 字，如"心理拆解""职场真相"；不写 series 时 topic 直接显示在黑胶囊里），单个场景可用 `"tag":"反转"` 加一个临时胶囊；顶部进度条自动按时间走。

**配音设置（meta）**

| 字段 | 说明 |
|---|---|
| `tts` | `auto`(默认：有小米 Key 用 mimo，否则 edge) / `mimo` / `edge` / `none` |
| `voice` | MiMo：`苏打`(男·默认) `白桦`(男) `冰糖`(女) `茉莉`(女) `mimo_default` `Mia` `Chloe` `Milo` `Dean`；edge：如 `zh-CN-YunxiNeural` `zh-CN-XiaoxiaoNeural`（换了提供方会自动换成对应默认音色） |
| `ttsStyle` | MiMo 整片语气（自然语言），默认"抖音爆款知识口播博主，语速偏快、情绪饱满…"。情感向可写"温柔低沉、像深夜电台" |
| `rate` | 语速，如 `+10%`（MiMo 默认 +0%，edge 默认 +10%） |
| 单句 | `{"text":"字幕", "say":"读法", "style":"冷笑，压低声音", "rate":"+15%"}`，`style` 只对 MiMo 生效 |

**可选：章节（只给长的清单型视频用）**——内容本身是"三个信号/五个习惯"且超过 90 秒时，可加 `"chapters":[{"id":"01","name":"信号一"},…]`，场景写 `"chapter":"01"`，或插 PART 卡 `{"kind":"part","num":"01","lines":["第一个信号"]}`；顶部会显示章节胶囊和分段进度条。普通口播**不要用**。

## 3. 硬性规则（违反就会难看——务必遵守）

**文字**
1. 标题 `title` **4~8 个字**（最多 10）；副标题 `title2` ≤ 10 字。标题是"结论/关键词"，不是把旁白抄一遍。
2. 旁白每句 **8~18 个字**，一个场景 **1~3 句**。长句用逗号拆成两句写进 `lines`。
3. 贴纸 `tag` ≤ 8 字、气泡 `bubble` ≤ 12 字、`stamp` ≤ 5 字、`burst` ≤ 4 字、拟声词 `onoma` 用英文（POW! BOOM! WOW! BOING! OOPS! FREE!）。
4. 每个场景用 `[关键词]` 标 **1 个**重点（字幕里会变黄色）；标题里也可以用 `[ ]` 让 1~2 个字变色。
5. 不要在旁白里写 emoji、英文缩写、括号注释、阿拉伯数字范围（"3-5"写成"三到五"）。

**画面**
6. **每个场景必须有 1 个"主视觉"**：一个角色(`char`) 或一个大道具（`card`/`chat`/`icon` 大图/`versus`/`polaroids`/`meter`）。**画面要按文案可视化**：文案提到的地点用 `set` 画出来，重要物品/比喻要有对应的道具图标，不要全程"角色+贴纸+纯色背景"。
7. 每个场景 **2~5 个元素**；小贴纸（tag/bubble/stamp/onoma/counter）**最多 3 个**。
8. 元素的出现时间要 **跟着旁白走**：用 `"at": "L2"`（第2句开始）或 `"at": "w:关键词"`（说到这个词时）。不要全部 `at: 0` 同时出现。
9. **不要挡脸**：贴纸放在脸的两侧（`pos: "head-left" / "head-right"` 或 `mid-left / mid-right`），不要放 `center`/`top` 压在角色头上。
10. 相邻场景要有变化：换场景插画/背景色、换角色/表情、或换主视觉。**同一画面不要连续超过 2 个场景**。丰富度目标：有 `set` 的场景 ≥ 1/3，有意象道具的 ≥ 1/2，有 `move`/道具 `acts` 动作的 ≥ 3 个（validate 会提示）。
11. 角色表情要随剧情变：用 `acts` 在关键词处切换表情（如 `smile → shock`），每个角色场景至少 1 次。
12. 所有坐标都在 1080×1920 画布：舞台区 y = 430~1400（标题在上方、字幕面板在 1404 以下）。**元素的 y 不要 < 430 或 > 1350**。
13. 叙事是一条连贯的因果链：钩子 → 判断 → 原因/案例 → 爆点 → 回应开头。**不要为了结构硬凑"第一/第二/第三"或 PART 卡**；段落之间用"可问题是…/更扎心的是…/说白了…"过渡。结尾用金句收住，"关注"贴纸可选（不强制写进旁白）。

**流程**
14. 只改 `story.json`。改完一定重新跑 `make.py --check`，**看到 `✅ 通过` 才能渲染**。
15. 修改了 `lines` 后必须重新配音（make.py 会自动做；单独渲染前要先跑 `tools/tts.py`）。

## 4. 速查表

**场景字段**

| 字段 | 说明 | 值 |
|---|---|---|
| `title` / `title2` | 大标题 / 副标题（支持 `[ ]` 变色） | 4~8 字 / ≤10 字 |
| `lines` | 旁白数组，自动配音+字幕；`[词]` = 字幕高亮 | 1~3 句 |
| `elements` | 画面元素数组 | 见 components.md |
| `set` | 场景插画（替代 bg）：`bedroom bedroom_night office cafe date street city_night park classroom living_room rain_window party subway stage seaside crossroads`；`{"name":"office","flip":true,"dim":0.3}` | 见 visualization.md |
| `bg` | 背景 | `cream`(默认) `cream-blue` `cream-yellow` `paper` `light-pink` `light-blue` `light-green` `light-yellow` `yellow` `pink` `blue` `orange` `purple` `green` `red` `dark` `navy`；可加修饰 ` rays`(放射线) ` sun`(太阳光芒) ` flat`(去网点) ` grid` |
| `tag` | 覆盖顶部胶囊文字（默认 meta.topic） | 2~6 字 |
| `kind` + `num` | `"kind":"part","num":"01"` = 章节卡（可选，长清单视频才用） | |
| `transition` | 进入该场景的转场 | `cut` `wipe` `stripes` `flash` `zoom` `slide`（默认：第一个场景 wipe，PART 卡 stripes，其余 cut） |
| `punch` | 镜头冲击放大 + 重击音效 | `"w:关键词"` 或数组 |
| `shake` | 屏幕震动 | 同上 |
| `flash` | 白闪 | 同上 |
| `camera` | `"push"` 整个场景缓慢推镜 | |
| `title_style` | 标题配色 | `pop`(红字黄影，浅底默认) `white`(彩色/深色底默认) `dark` `yellow` |

**元素通用字段**：`type` `at`(出现) `out`(消失) `enter` `exit` `loop` `pos` / `x` `y` `dx` `dy` `rot` `scale` `z` `sfx` `id` `of` `move`(移动) `acts`(切换)

- 移动 `move`：`{"at":"L2","to":[880,1200],"arc":-160,"rot":200,"scale":0.7}`（`to` 也可以是位置名或角色 id；`by:[dx,dy]` 相对移动；数组=连续动作）。用于 递送礼物、扔进垃圾桶、气球飞走、东西掉落。
- 道具切换 `acts`：`[{"at":"w:枯萎","name":"wilted_rose"}]`，icon 换图、tag 换字、换色都行。

- 时间 `at` / `out`：`1.2`（场景内秒数）、`"L2"`（第2句开始）、`"L2e"`（第2句结束）、`"L2+0.3"`、`"w:关键词"`、`"w2:她"`（第2次出现的"她"）、`"end-0.5"`。
- 位置 `pos`：`top-left top top-right / upper-left upper upper-right / mid-left center mid-right / low-left low low-right / bottom-left bottom bottom-right`，或 `head-left head-right head-top`（贴在角色头旁，多角色时加 `"of":"角色id"`）。不写 pos 时贴纸会自动找空位。
- 角色 `pos`：`far-left left center-left center center-right right far-right`；`size`：`XL L M S XS XXS`（单人默认 L，多人默认 M）。
- 进场 `enter`：`pop`(默认) `stamp` `slam` `slide-left` `slide-right` `slide-up` `slide-down` `drop` `fade` `grow` `spin` `zoom` `rise` `wipe` `none`
- 退场 `exit`：`pop` `fade` `slide-left` `slide-right` `drop`；循环 `loop`：`float` `wiggle` `pulse` `shake` `spin` `bounce` `swing` `blink` `heartbeat`
- 颜色：`yellow red pink rose blue sky cobalt orange purple green mint lime white cream black dark navy grey` 或 `#hex`

**元素类型一览**（详见 components.md）

| type | 用途 | 关键字段 |
|---|---|---|
| `char` | Q版半身角色（主角） | `who expr pose size pos acts flip silhouette` |
| `avatar` / `avatars` | 圆头像 / 一群头像（"很多女生"） | `who expr ring size` / `count layout radius` |
| `tag` | 贴纸标签 | `text color icon` |
| `counter` | 数字滚动标签 "搞定 ×17" | `text:"搞定 ×{n}" from to dur` |
| `bubble` | 对话/心声/喊叫气泡 | `text style:speech/thought/shout tail` |
| `burst` | 爆炸星形 + 大字 | `text color sub w` |
| `onoma` | 英文拟声词 | `text color size` |
| `icon` | 111 个手绘图标/意象道具 | `name size color label` |
| `text` | 自由文字 | `text font size color box` |
| `stamp` | 红色印章 | `text color` |
| `pricetag` | 摇摆吊牌（"价值"） | `text sub color` |
| `progress` / `meter` | 进度条 / 仪表盘 | `label from to color` |
| `card` | UI 卡片清单 | `title items[{text,check,value,at}]` |
| `chat` | 手机聊天 | `title items[{side,text,at}]` |
| `polaroids` | 拍立得照片墙 | `items[{text,icon|who}]` |
| `versus` | 左右对比分屏背景 | `left{color,label} right{...}` |
| `arrow` | 自绘箭头 | `from[x,y] to[x,y]` |
| `cross` / `check` | 大红叉 / 大绿勾 | `size` |
| `spotlight` | 聚光灯压暗 | `x y r` |
| `particles` | 漂浮粒子 | `kind:hearts/stars/question/zzz/money/broken…` |
| `emph` | 漫画集中线 | `x y r1 r2` |
| `shape` | 色块面板 | `w h color shape` |
| `image` | 外部图片（贴纸描边） | `src w` |
| `number` | 超大数字 | `text size color` |

**角色**：`guy`(黑发蓝西装) `guy2`(中分黑卫衣) `guy3`(黄刺头蓝T) `boss`(背头眼镜西装) `girl`(黑长直橙吊带) `girl2`(棕卷发白衬衫) `girl3`(波波头紫毛衣) `girl4`(马尾黄T)
**表情**：`neutral smile happy grin laugh smug cool love wink shy think sad cry angry shock scared numb tired bored dizzy sweat kiss`
**姿势**：`down cross chin point wave cheer shrug phone heart`

## 5. 写分镜的思考顺序（每个场景都这样想）

1. 这 1~3 句话的 **核心意思** 是什么？→ 写成 4~8 字 `title`。
2. 观众应该 **看到什么** 来理解它？→ 在哪儿（`set`）、有什么东西（`icon`）、比喻成什么（意象道具）、发生了什么变化（`move`/`acts`）；再从 scene-recipes.md 选模板（人物情绪 / 对比 / 清单 / 数据 / 聊天 / 比喻道具…）。
3. 哪个词是 **重点**？→ 在 `lines` 里加 `[ ]`，并让一个元素在 `"at":"w:这个词"` 出现（必要时加 `punch`）。
4. 角色的情绪 **怎么变**？→ `expr` 起始表情 + `acts` 切换。
5. 和上一个场景 **有什么不同**？→ 换 `set`/`bg` 或主视觉。

## 6. 交付前自检

- [ ] `make.py --check` 显示 `✅ 通过`
- [ ] 预览图（或 `--describe` 文字描述）里每个场景都有主视觉，标题没被挡，贴纸没压脸
- [ ] 开头 3 秒有钩子（问题/反常识/冲突）+ 强视觉（角色大表情 / burst / counter）
- [ ] 结尾有金句并回应开头；没有硬凑的"第一/第二/第三"
- [ ] 配音用的是用户期望的提供方（有小米 Key 时日志显示 `TTS: mimo`）
- [ ] 画面按文案可视化：地点有 set、重要物品有道具、至少 3 处动作（move/acts），没有连续 3 个单调场景
- [ ] 渲染完成，`build/video.mp4` 存在，时长合理
- [ ] 已上传并拿到 `🔗 下载链接`，交付时同时给文件和链接（注明有效期）

更多：常见报错和修法见 `references/qa-checklist.md`。
