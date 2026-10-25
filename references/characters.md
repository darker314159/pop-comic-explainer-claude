# 角色手册（帅哥美女 Q 版半身像）

能看图就先看：`img/cast.jpg`（8 个角色）、`img/expressions.jpg`（22 种表情）、`img/poses.jpg`（9 种姿势）。

## 1. 8 个预设角色

| who | 形象 | 适合演 |
|---|---|---|
| `guy` | 黑色侧分短发，蓝西装白内搭，阳光帅气 | **默认男主**、"你"、普通男生 |
| `guy2` | 棕色中分，黑色卫衣粉抽绳，文艺 | 内向/敏感/深夜 emo 的男生 |
| `guy3` | 黄色刺头，浅蓝 T 恤，少年感 | 新手、冲动、搞笑担当、学生 |
| `boss` | 背头 + 眼镜，深灰西装红领带 | 上司、高手、成熟男人、专家 |
| `girl` | 黑长直，橙色吊带，御姐 | **默认女主**、"她"、有魅力的女生 |
| `girl2` | 棕色长卷发，白衬衫粉领结，温柔 | 温柔型、前任、白月光 |
| `girl3` | 黑色波波头，紫色毛衣，知性 | 懂事型、讨好型、"你"（女性视角） |
| `girl4` | 棕色马尾，黄色 T 恤，元气 | 活泼、朋友、闺蜜、结尾招手 |

**选角规则**：
- 一个视频里 **主角固定 1~2 个**（例如"你"= guy，"她"= girl），从头到尾不要换人，观众才看得懂。
- 第三方/路人用其他角色，或 `avatars` / `silhouette:true` 剪影。
- 讲"你"时，如果受众是女性，用 girl3 或 girl4 当"你"。

## 2. 表情 expr（22 种）

| 情绪 | 表情名 |
|---|---|
| 平静 | `neutral`（默认）`think`（思考，眼睛看上方）`bored`（无聊半眯眼） |
| 开心 | `smile` `happy`（眯眼笑）`grin`（露齿）`laugh`（大笑）`wink`（眨眼） |
| 自信/得意 | `smug`（坏笑）`cool`（墨镜） |
| 喜欢 | `love`（爱心眼）`shy`（害羞脸红）`kiss` |
| 难过 | `sad` `cry`（流泪）`tired`（疲惫黑眼圈） |
| 激动 | `angry` `shock`（震惊大眼）`scared`（害怕）`sweat`（尴尬流汗）`dizzy`（晕） |
| 麻木 | `numb`（死鱼眼，"无感/麻木"专用） |

**表情要有变化**：每个角色场景至少用 `acts` 切换 1 次，变化方向和旁白一致：
- 反转："以为……其实……" → `smile → shock`
- 扎心："……你就[崩溃]了" → `neutral → cry`
- 恍然大悟 → `think → happy`
- 被拒绝 → `love → sad`
- 越来越麻木 → `smile → tired → numb`

```json
"acts": [{"at": "L2", "expr": "think"}, {"at": "w:原来", "expr": "shock", "pose": "point"}]
```

## 3. 姿势 pose（9 种）

| pose | 动作 | 用在 |
|---|---|---|
| `down` | 双手自然下垂（默认） | 一般讲述 |
| `cross` | 双手抱胸 | 自信、防御、拒绝、高冷 |
| `chin` | 手托下巴 | 思考、怀疑、分析 |
| `point` | 一只手指向侧面 | "你看"、指出问题、讲解 |
| `wave` | 举手打招呼 | 开场打招呼/结尾告别 |
| `cheer` | 双手举起握拳 | 成功、开心、"做到了" |
| `shrug` | 摊手耸肩 | 无奈、"那又怎样"、不在乎 |
| `phone` | 手拿手机 | 聊天、刷朋友圈、等消息 |
| `heart` | 胸前捧着爱心 | 心动、真心、爱自己、总结 |

## 4. 尺寸与站位

- 单人：`size:"L"`（默认）站中间。头部中心约在 y=770，脸占 y 585~955。
- 双人：自动 `M`，用 `pos:"left"` + `pos:"right"`，右边的人加 `"flip":true` 面对面。
- 小配角：`size:"XS"` 或 `"S"` + `x` 放在角落，给大道具让位。
- 让出头顶空间（放进度条/仪表盘）：把 `y` 设大一点，如 `"y":1500`，角色整体下移。
- 角色身体可以被贴纸压住（胸前贴标签很好看），**脸不能被挡**。

## 5. 换装 / 自定义角色

在预设基础上覆盖任意字段即可：
```json
{"type":"char","who":"girl","hairColor":"#c2185b","outfit":"blazer","outfitColor":"black","innerColor":"white","glasses":true}
```
| 字段 | 可选值 |
|---|---|
| `hair` | 男：`swept`(侧分短) `curtain`(中分) `spiky`(刺头) `slick`(背头)；女：`long`(长直) `wavy`(卷发) `bob`(波波头) `pony`(马尾) |
| `outfit` | `blazer`(西装外套) `hoodie`(卫衣) `tee`(T恤) `suit`(正装+领带) `cami`(吊带) `blouse`(衬衫领结) `knit`(毛衣) |
| `hairColor` `outfitColor` `innerColor` `skin` `eyeColor` `lip` | 颜色名或 #hex |
| `glasses` | `true` 戴眼镜 |

**配色建议**：衣服用调色板里的高饱和色（blue cobalt pink red orange yellow purple green），避免和当前背景同色（黄色背景别穿黄 T 恤）。

## 6. 头像 avatar / avatars

- `avatar`：圆形头像，`who` + `expr` + `ring` 圈颜色，适合"她/他"在画面边上出现、或者聊天对象。
- `avatars`：一群人。`who:"girls"`/`"guys"`/`"mixed"`，`layout:"arc"` 放在角色头顶 = "阅人无数"，`"ring"` 围一圈 = "被包围/被评价"，`"grid"` = "很多人/你是不是也这样"，`"row"` = "一排人/统计"。

## 7.（可选）用 AI 生成的角色图

引擎自带角色已经足够。如果用户提供了图片（或你有生图工具），用 `image` 元素：
- 生图提示词模板（保持风格统一）：
  `flat pop-art comic illustration, half-body portrait of a handsome young Chinese man, thick black outlines, flat cel shading, bright saturated colors, cream background, halftone dots, clean vector style, cute anime proportions, white sticker border --ar 2:3`
- 生成后抠成透明底 PNG，放在 `story.json` 同目录 `assets/` 下：
  `{"type":"image","src":"assets/hero.png","w":560,"x":540,"y":980}`
- 图片不会眨眼/换表情，所以 **主角色仍建议用 char**，图片用于封面人物、真实截图、产品等。
