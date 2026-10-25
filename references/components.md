# 元素（elements）字段大全

每个元素是 `elements` 数组里的一个对象，`type` 必填。**不写的字段都有好看的默认值，能少写就少写。**
画布 1080×1920；舞台区 y=430~1400（上面是标题，下面 1404 起是字幕面板）。`x/y` 指元素 **中心点**（`char` 是脚底中点，`pricetag` 是挂绳顶点）。

## 通用字段（所有元素都可以用）

| 字段 | 说明 | 例子 |
|---|---|---|
| `at` | 出现时间（默认 0 = 场景开始） | `0.5` `"L2"` `"L2e"` `"L1+0.4"` `"w:麻木"` `"w2:她"` `"end-0.6"` |
| `out` | 消失时间（默认一直在） | `"L3"` |
| `enter` | 进场动画（默认 pop；角色默认 rise） | `pop stamp slam slide-left slide-right slide-up slide-down drop fade grow spin zoom rise wipe none` |
| `exit` | 退场动画（配合 out） | `pop fade slide-left slide-right drop` |
| `loop` | 出现后持续的小动作 | `float wiggle pulse shake spin bounce swing blink heartbeat` |
| `pos` | 预设位置（见下） | `"mid-left"` `"head-right"` |
| `x` `y` | 精确坐标（优先于 pos） | `"x": 780, "y": 900` |
| `dx` `dy` | 在 pos 基础上微调 | `"dy": 60` |
| `rot` | 旋转角度（贴纸默认随机 -4~4°） | `-8` |
| `scale` | 缩放 | `1.2` |
| `z` | 层级（角色 5，贴纸 10，背景类 2） | `12` |
| `sfx` | 出场音效名或 `false` 关闭 | `"ding"` `false` |
| `id` / `of` | 给角色起名 / 指定贴在哪个角色头旁 | `"id":"a"` / `"of":"a"` |
| `overlap` | `true` = 故意叠放，校验器不报重叠 | |
| `move` | 出现后**移动**到别处（递送/扔掉/飞走/掉落）：`{to:[x,y]|"位置名"|"角色id", by:[dx,dy], at, dur(.7), arc, rot, scale, ease, sfx}`；数组 = 连续动作 | `{"at":"L2","to":[880,1200],"arc":-160,"rot":200}` |
| `acts` | 非角色元素也能切换：`[{at, name?, text?, color?, size?…}]`，到点后重新绘制并弹一下（玫瑰→枯萎、标签改字） | `[{"at":"w:枯萎","name":"wilted_rose"}]` |

**pos 位置网格（中心点坐标）**
```
top-left(250,540)     top(540,540)     top-right(830,540)
upper-left(250,710)   upper(540,710)   upper-right(830,710)
mid-left(230,890)     center(540,900)  mid-right(850,890)
low-left(250,1080)    low(540,1080)    low-right(830,1080)
bottom-left(250,1250) bottom(540,1250) bottom-right(830,1250)
head-left / head-right / head-top：跟随角色头部（多角色时加 "of"）
```
不写 `pos` 和 `x/y` 的贴纸类元素（tag/counter/bubble/onoma/icon/stamp…）会 **自动找空位**，避开标题和角色的脸。

**场景插画 `set`（写在场景上，不是元素）**：`"set":"office"` 或 `{"name":"office","flip":true,"dim":0.3}`，16 张：`bedroom bedroom_night office cafe date street city_night park classroom living_room rain_window party subway stage seaside crossroads`。用法见 `visualization.md`。

**音效名**：`pop pop2 pops boing boom buzz click count ding hit msg rise sparkle stamp swing swish tada type whoosh wrong`（每种元素有默认音效，一般不用写）

---

## char — 角色（主视觉）
```json
{"type":"char","who":"girl","expr":"smile","pose":"down","pos":"center","size":"L",
 "acts":[{"at":"w:心动","expr":"love"},{"at":"L3","expr":"sad","pose":"chin"}]}
```
| 字段 | 说明 |
|---|---|
| `who` | **必填** `guy guy2 guy3 boss girl girl2 girl3 girl4` |
| `expr` | 起始表情（默认 neutral），见 characters.md |
| `pose` | 起始姿势（默认 down）`down cross chin point wave cheer shrug phone heart` |
| `pos` | `far-left(180) left(290) center-left(410) center(540) center-right(670) right(790) far-right(900)`；也可写 `x` |
| `size` | `XL(1060) L(900) M(740) S(560) XS(380) XXS(260)` 像素高；单人默认 L，多人默认 M |
| `y` | 脚底 y（默认 1412 = 站在字幕面板上）。往下移(>1412)角色变"半身更近"，可给头顶腾空间 |
| `acts` | 表情/姿势切换时间表：`[{at, expr?, pose?, look?, silhouette?}]` 切换时角色会轻轻跳一下；`silhouette:false` = 剪影揭晓露脸 |
| `flip` | `true` 水平镜像（两人对视时右边的人用） |
| `silhouette` | `true` 灰黑剪影（神秘/某个人） |
| `look` | 眼珠左右 -1~1 |
| 换装 | `hair hairColor outfit outfitColor innerColor skin eyeColor lip glasses` 见 characters.md |

## avatar — 单个圆头像
```json
{"type":"avatar","who":"girl3","expr":"wink","ring":"pink","size":160,"x":180,"y":800,"loop":"float"}
```
`who` `expr` `ring`(圈颜色，默认黄) `bg`(底色) `size`(默认 150)

## avatars — 一群头像（"很多人"）
```json
{"type":"avatars","who":"girls","count":12,"layout":"arc","x":540,"y":760,"radius":340,"size":110}
```
| 字段 | 说明 |
|---|---|
| `who` | `girls`(默认) `guys` `mixed` 或数组 `["girl","guy2"]` |
| `count` | 数量（默认 12，≤ 20） |
| `layout` | `arc` 头顶半圆光环 / `ring` 一整圈 / `row` 一排 / `grid` 网格(`cols`) / `scatter` 随机(`w h`) |
| `radius` `size` `gap` `cols` | 半径 / 头像大小(110) / 间距 / 列数 |
| `expr` / `exprs` | 统一表情 / 轮流使用的表情数组 |
| `rings` | 圈颜色数组 |
| `stagger` | 依次弹出间隔（默认 0.09s） |

## tag — 贴纸标签（最常用）
```json
{"type":"tag","text":"不在意[结果]","color":"yellow","icon":"check","pos":"head-left","at":"L2"}
```
`text`(≤8字，`[ ]` 变色) `color`(底色，默认 yellow；文字颜色自动黑/白) `textColor` `icon`(左侧小图标) `iconColor` `size`(字号 42) `font` `round`(true=胶囊圆角) `hl`(高亮色)

## counter — 计数标签
```json
{"type":"counter","text":"搞定 ×{n}","from":1,"to":17,"dur":1.6,"color":"yellow","x":830,"y":1200}
```
`{n}` 会从 `from` 滚动到 `to`，用时 `dur` 秒。其余同 tag。

## bubble — 气泡
```json
{"type":"bubble","text":"你变了","style":"speech","tail":"bl","of":"a","pos":"head-top"}
```
`style`: `speech` 说话(默认) / `thought` 心里想(云朵小圆点尾巴) / `shout` 喊叫(黑色爆炸框)
`tail`: 尾巴方向 `bl`(左下，默认) `br` `bottom` `tl` `tr` `none` —— **尾巴要指向说话的人**
`color` `textColor` `size`(44) `hl`

## burst — 爆炸星 + 大字
```json
{"type":"burst","text":"爱自己","sub":"SELF LOVE","color":"white","textColor":"red","w":700,"x":540,"y":860,"enter":"slam"}
```
`text`(≤4 字) `sub`(下方小黑条英文) `color`(星形底色) `textColor`(默认黄) `w` `h` `spikes`(尖角数 18) `textSize` `textRot` `font`
不写 text = 纯装饰爆炸背景（放在角色后面用 `z:3`）。

## onoma — 漫画拟声词
```json
{"type":"onoma","text":"BOOM!","color":"red","size":120,"enter":"slam","loop":"wiggle"}
```
英文大写 + 感叹号：`POW! BOOM! WOW! OOPS! BOING! FREE! BUT! BEEP! OMG! ZZZ… CHILL~ YES! NO!`

## icon — 手绘图标（111 个，见 img/icons.jpg）
```json
{"type":"icon","name":"cage","size":480,"x":540,"y":880,"label":"安全感？","enter":"drop"}
```
`name` 必填；`size`(220) `color`(主色，覆盖默认) `color2` `label`(下方白色小标签) `labelColor`
图标名：`heart broken_heart star lightning question exclaim magnifier phone chat lock key gift money coin crown trophy fire bomb balance clock gauge cage bird check cross arrow_up arrow_down thumbs_up eye brain battery battery_low target shield mask rose envelope candle camera mirror tag dice gamepad ring sparkle zzz sweat music idea warning ban chart_up chart_down wine bed door footprints umbrella ladder chain puppet iceberg hourglass seesaw balloon rocket rope bridge maze thermometer wallet coffee cake ice_cube bandage pill seedling tree sun moon cloud_rain house car plane suitcase calendar book microphone megaphone puzzle magnet hook anchor flag mountain wilted_rose scissors paper_plane trash brick_wall compass lighthouse snowflake glass_half shopping_bag signpost handcuffs tv sofa briefcase crack`
别名：`love→heart clock_sand→hourglass time→hourglass ice→ice_cube cold→snowflake bait→hook wall→brick_wall home→house plant→seedling grow→seedling bag→shopping_bag luggage→suitcase cup→coffee mic→microphone road_sign→signpost withered_rose→wilted_rose idea_bulb→idea bulb→idea q→question ok→check no→cross x→cross search→magnifier talk→chat msg→chat price→tag game→gamepad up→arrow_up down→arrow_down`

意象道具查询：`python3 tools/imagery.py 冷暴力 放手`；比喻→图标对照见 `visualization.md`。

## text — 自由文字
```json
{"type":"text","text":"YEARS","font":"comic","size":130,"color":"white","x":720,"y":1000}
```
`font`: `pop`(黄油体，默认) `bold`(思源黑 Black) `medium` `num`(粗英文数字) `comic`(漫画英文) `smiley`(得意黑斜体) `cute`(快乐体)
`size`(90) `color` `stroke`(描边粗细) `strokeColor` `shadow`(true/颜色) `box`(底色块颜色，变成标牌) `track`(字距) `hl`

## stamp — 印章
```json
{"type":"stamp","text":"已读","color":"red","rot":-12,"x":820,"y":1220}
```
`text`(≤5字) `color`(默认红) `fill`(底色) `size`(76)。默认 stamp 进场 + 盖章音。

## pricetag — 摇摆吊牌
```json
{"type":"pricetag","text":"¥9.9","sub":"SALE","color":"yellow","w":280,"x":790,"y":560}
```
`y` 是挂绳顶端。`text`(≤4字) `sub` `w`(300) `size`

## progress — 进度条
```json
{"type":"progress","label":"心动值","from":90,"to":5,"dur":1.8,"color":"green","colorTo":"red","warnBelow":30,"y":540,"w":760}
```
`label`(上方左侧，右侧自动显示百分比) `from` `to`(0~100) `dur` `color` `colorTo`+`warnBelow`(低于某值变色) `unit`(默认 %) `w` `h`

## meter — 仪表盘
```json
{"type":"meter","label":"焦虑值","from":10,"to":98,"dur":1.6,"size":420,"x":300,"y":720}
```

## card — UI 卡片 / 清单
```json
{"type":"card","title":"TA 在疏远你","badge":"CHECK","color":"yellow","w":800,"y":820,
 "items":[{"text":"回复越来越慢","num":true,"at":"L1"},{"text":"不再分享日常","num":true,"at":"L2"},{"text":"开始[找借口]","check":false,"at":"L3"}]}
```
`title`(顶部色条) `badge`(右上角小英文) `color`(色条颜色) `w`(740)
`items`: 字符串或 `{text, num:true(序号)|check:true(绿勾)/false(红叉)/"dot", value(右侧值), at(出现时间)}`。不写 at 时每 0.45s 出一行。**≤5 行，每行 ≤12 字**。

## chat — 手机聊天
```json
{"type":"chat","title":"TA","w":640,"y":860,
 "items":[{"side":"r","text":"在干嘛呀","at":0.3},{"side":"l","text":"想你呀～","at":0.9},{"side":"r","text":"？","at":"w:已读不回"}]}
```
`side`: `r` 我（绿色，右边）/ `l` 对方（白色，左边）；`color` 自定义气泡色。`phone:false` 不要手机外壳。`h` 屏幕最小高度(520)。**≤5 条，每条 ≤12 字**。

## polaroids — 拍立得照片墙
```json
{"type":"polaroids","cols":3,"w":250,"y":820,"items":[{"who":"girl","text":"初恋"},{"icon":"broken_heart","text":"……"}]}
```
每张：`who`(头像) 或 `icon`(图标)，`text` 下方文字，`color` 底色。≤6 张。

## versus — 左右对比分屏
```json
{"type":"versus","left":{"color":"blue","label":"新手"},"right":{"color":"pink","label":"高手"}}
```
铺满舞台的斜切双色背景 + 中间 VS 字样 + 左右顶部标签。`vs:false` 去掉 VS，`vsY` VS 的 y（900），`labelY` 标签 y（520）。左边角色 `pos:left`，右边 `pos:right`。

## arrow — 自动画出的箭头
```json
{"type":"arrow","from":[380,640],"to":[700,640],"curve":-0.25,"color":"red","at":"L2"}
```
`from` `to` 像素坐标；`curve` 弯曲度（0 直线，正负方向相反，默认 0.3）；`width`(16)；`dur` 画出用时。

## cross / check — 大红叉 / 大绿勾
```json
{"type":"cross","size":260,"x":780,"y":960,"at":"w:不爱"}
```

## spotlight — 聚光灯（压暗四周）
```json
{"type":"spotlight","x":540,"y":900,"r":330,"dim":0.82}
```
配合 `bg:"dark"` 和角色 `silhouette`。

## particles — 漂浮粒子
```json
{"type":"particles","kind":"hearts","count":8,"x":540,"y":900,"spread":700}
```
`kind`: `hearts stars sparkles question zzz sweat music money broken fire` 或任意 icon 名；`size`(70) `spread`(散布范围 500) `rise`(上飘距离) `period`

## emph — 漫画集中线
```json
{"type":"emph","x":540,"y":780,"r1":260,"r2":420,"color":"black"}
```
加 `"z":3` 放到角色后面，营造"震惊/聚焦"。

## shape — 色块面板
```json
{"type":"shape","shape":"rect","w":800,"h":500,"color":"white","radius":24,"x":540,"y":850,"z":3}
```
`shape`: `rect`/`circle`；`border`(6) `shadow:false`

## number — 超大数字
```json
{"type":"number","text":"90%","size":300,"color":"red","x":540,"y":700}
```

## image — 外部图片
```json
{"type":"image","src":"assets/photo.png","w":520,"x":540,"y":850,"frame":true}
```
`src`: 相对 story.json 的路径或 https 链接。默认加白边+黑边"贴纸描边"（适合透明底 PNG）；`frame:true` 黑框相片；`round:true` 圆形；`sticker:false` 不描边。
