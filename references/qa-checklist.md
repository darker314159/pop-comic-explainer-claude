# 质检清单 & 常见问题

## A. 每次渲染前（必做）
```bash
python3 tools/make.py projects/xxx/story.json --check
```
看到 `✅ 通过` 才渲染。不能看图的模型再加一步：
```bash
python3 tools/validate.py projects/xxx/story.json --describe
```
逐个场景读描述，问自己：
- [ ] 每个场景都有主视觉（角色脸 / card / chat / icon 大图 / versus …）？
- [ ] 标题 y 范围在 250~500，没有任何元素的 y 范围和它重叠？
- [ ] 所有元素 x 在 40~1040、y 在 430~1400 之间？
- [ ] 贴纸的框没有落在"角色脸"的框里？
- [ ] 相邻两个场景的 bg/set 或角色不同？
- [ ] 文案里的地点有 `set`、重要物品有道具 icon（`at:"w:物品"`）、至少 3 处 `move`/道具 `acts`？（`python3 tools/visualize.py s.json` 查看建议）

## B. 校验器报错 → 怎么改

| 报错关键词 | 原因 | 改法 |
|---|---|---|
| `JSON 语法错误` | 多/少逗号、中文引号“”、注释 // | 按行号修；字符串只能用英文双引号 `"` |
| `未知元素类型` | type 拼错 | 用提示里"最接近的"值 |
| `xxx 不存在` + 可选值 | 枚举值拼错（表情/姿势/颜色/图标） | 换成提示里的值 |
| `旁白里找不到「词」` | `"w:词"` 的词不在本场景 lines 里 | 改成 lines 里原样出现的词（不含 [ ]） |
| `本场景只有 N 句旁白` | `L3` 但只有 2 句 | 改成存在的句子编号 |
| `will never be seen` / `exceeds scene length` | 出现时间晚于场景结束 | 改早一点：`"L2"` 而不是 `"L2+2"`；或给场景加 `"pad": 0.8` 延长 |
| `标题…超过 10 个字` | 标题太长 | 压缩成 4~8 字结论，其余放 title2 |
| `…重叠 xx%，挡住了角色的脸` | 贴纸盖住脸 | 用 `pos:"head-left"/"head-right"`，或 `y` 改到 1100~1300（胸前），或角色换到 left/right |
| `…和…重叠` | 两个元素叠在一起 | 换一个 pos；或者让前一个 `out` 掉；故意叠放加 `"overlap":true` |
| `左边/右边超出` | 文字太长或 x 太靠边 | 缩短文字 / x 往中间挪 / 减小 size / w |
| `压进了底部字幕面板` | y 太大 | y ≤ 1300（大元素要更小） |
| `顶到了页眉区` | y 太小 | y ≥ 500 |
| `head-* 必须写 of` | 多角色时没指定 | 给角色加 `"id":"a"`，元素加 `"of":"a"` |
| `timing.json 有 N 个场景` | 改了分镜没重新配音 | 重新跑 make.py（或 tools/tts.py） |
| `和上一个场景画面几乎一样` | 画面重复 | 换 bg / 换表情 / 加道具 |
| `占位符（待填 / TODO / 【…】）` | script2story 生成的骨架没填完 | 把每个【待填】标题换成 4~8 字结论 |
| `像在按点罗列` | 旁白里"第一/第二/第三""首先/其次"出现 ≥3 次，或 ≥3 张 PART 卡 | 改成因果推进 + 转折句；除非内容本身就是清单，否则删掉序号 |
| `场景插画 xxx 不存在` | set 名拼错 | 用提示里的值（16 个，见 visualization.md） |
| `move.to …` / `move 字段` | to 写错（不是坐标/位置名/角色 id） | `"to":[x,y]` 或 `"to":"bottom-right"`；相对移动用 `"by":[dx,dy]` |
| `连续 3 个场景画面单调` / `道具场景不足` / `没有任何动作` | 画面太素 | 按 💡 画面建议：加 `set`、把物品/比喻画成 icon、用 `move`/`acts` 表现变化 |
| `旁白里有括号` | MiMo 会把括号内容当语气指令读不出来 | 删掉括号；想改语气用该句的 `"style"` 字段 |

## C. 运行问题

| 现象 | 处理 |
|---|---|
| `小米 API Key 无效或无权限` | Key 复制错/过期/没开通：`python3 tools/setup_mimo.py sk-新key` 重新配置（会试合成一句） |
| `meta.tts = "mimo" 但没有配置小米 API Key` | 向用户要 Key → `python3 tools/setup_mimo.py sk-xxx`；或把 `meta.tts` 改成 `auto`/`edge` |
| `配音失败 scene N line M` / `N 句配音失败` | 网络抖动或限流；直接重跑（已成功的句子有缓存，只补失败的）。限流多就 `meta.ttsWorkers: 2` |
| `请求被拒绝 HTTP 400` | 音色名写错或文本异常；MiMo 音色只有 苏打 白桦 冰糖 茉莉 mimo_default Mia Chloe Milo Dean |
| 想确认用的是哪个配音 | 看 tts 输出第一行 `TTS: mimo · mimo-v2.5-tts · 音色 苏打`；没 Key 时会提示改用 edge-tts |
| `edge retry …` | edge-tts 需要联网；重跑即可（有缓存）。实在不行 `meta.tts:"none"` 出无声版 |
| `Executable doesn't exist` / 找不到浏览器 | `python3 -m playwright install chromium`，或设置环境变量 `CHROMIUM=/path/to/chromium` |
| 字体显示成方块/宋体 | `engine/fonts/` 缺字体文件；不要删除这个文件夹 |
| 渲染太慢 / 命令超时 | 后台运行 `nohup python3 tools/make.py s.json > build.log 2>&1 &`；`--workers 4`（CPU 核多时）；`--fps 24` |
| 想快速看某段动画 | `python3 tools/render.py s.json --start 8 --end 14 --out build/clip.mp4 --no-audio` |
| 想看某个场景的 6 帧 | `python3 tools/preview.py s.json --scene 5` → build/sheet.jpg |
| 想看指定时间 | `python3 tools/preview.py s.json --times 3.2 7.5 12` |
| 音乐太吵/太小 | `meta.bgmGain`（默认 0.22）`meta.sfxGain`（默认 0.45） |
| 配音太快/太慢 | `meta.rate`："+0%" 正常，"+10%" 快一点，"-10%" 慢（MiMo 用变速实现，±20% 内最自然）；MiMo 也可以在 `meta.ttsStyle` 里写"语速快" |
| 换配音员 | MiMo：`meta.voice` = `苏打`(男，默认) `白桦`(男，沉稳) `冰糖`(女) `茉莉`(女) 等；edge：`zh-CN-YunxiNeural`(男) `zh-CN-YunjianNeural`(男，浑厚) `zh-CN-XiaoxiaoNeural`(女) `zh-CN-XiaoyiNeural`(女，活泼) |
| 语气不对（太播音腔/太平） | 改 `meta.ttsStyle`，例如"像跟朋友吐槽，语气夸张有起伏"；单句加 `"style":"惊讶"`，改完重跑 tts（缓存会自动失效） |
| 某个词读错 | 该句写成 `{"text":"字幕写法","say":"配音读法"}` |
| `❌ 所有托管都上传失败` | 网络/托管限流：`python3 tools/publish.py build/video.mp4 --host uguu`（或 gofile）重试；catbox 匿名被拒时在 config.json 填 `catbox_userhash` |
| 下载链接过期 | litterbox 默认 72h（`--time 1h/12h/24h/72h`）、uguu 约 3 小时；重新跑 `publish.py` 即可得到新链接 |
| 不想上传 | `make.py … --no-publish` |
| 字幕某段太长 | 引擎按 ≤14 字自动分屏；仍嫌长就拆句 |

## D. 最终交付检查
- [ ] `build/video.mp4` 存在；`ffprobe` 时长 ≈ validate 报告的总时长
- [ ] 开头 3 秒：大标题 + 角色强表情 + 1 个强元素
- [ ] 叙事是连贯的因果链，没有硬凑的"第一/第二/第三"（清单型长视频用了章节时，章节名和 chapters 一致）
- [ ] 结尾金句回应开头（"关注"贴纸可选）
- [ ] 用参考稿二创的：遵守了 water-koubo 规则（第一人称经历没写成用户亲历、没编造数字）
- [ ] 把 `build/sheet.jpg` 一起交付给用户预览（可选）
- [ ] 已在线发布：交付消息里有 `🔗` 下载链接（注明有效期），链接能打开（publish.py 会自动校验）
