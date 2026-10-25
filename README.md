# pop-comic-explainer · 波普漫画风讲解视频 Skill

把一段口播文案 → 1080×1920 竖屏波普漫画风讲解视频（角色、动效、字幕、配音、音效、BGM 全自动）。
模型只需要写一个 `story.json` 分镜文件，引擎负责画面。
- **按文案可视化**：16 张场景插画（卧室/深夜/办公室/约会/雨夜/地铁/海边/岔路口…）+ 111 个意象道具（礼物、玫瑰→枯萎、冰山、提线木偶、跷跷板、气球…）+ `move`/`acts` 动作，`tools/visualize.py` 自动给出每个场景的画面建议。
- **自动在线部署**：渲染完自动上传，输出可直接下载的链接（默认 litterbox 72 小时直链，失败自动切换 uguu / gofile；配置 `catbox_userhash` 可永久保存）。

## 安装
```bash
pip install -r requirements.txt
python3 -m playwright install chromium   # 已有系统 chromium 可跳过
# 需要 ffmpeg
```

## 配音：小米 MiMo TTS（推荐，只需一个 API Key）
```bash
python3 tools/setup_mimo.py sk-你的key              # 保存到 config.json 并试合成一句
python3 tools/setup_mimo.py sk-你的key --voice 冰糖  # 顺便设默认音色（苏打/白桦/冰糖/茉莉/Mia/Chloe/Milo/Dean）
```
- Key 在 https://platform.xiaomimimo.com 创建；`tp-` 开头的 Token Plan Key 会自动用 token-plan 地址。也可以只设环境变量 `MIMO_API_KEY`。
- 配好后 make.py / tts.py 自动走小米（日志第一行 `TTS: mimo · …`）；没配 Key 自动用免费的 edge-tts。
- 语气：`story.json` 里 `meta.ttsStyle` 写整体风格（如"温柔低沉、像深夜电台"），单句 `{"text":"…","style":"冷笑"}`。
- `config.json` 含密钥，不要分享/提交（已写进 .gitignore）。

## 给 AI 用
- **支持 Agent Skills 的工具**（Claude Code / Codex / OpenCode / Cursor 等）：把整个 `pop-comic-explainer/` 文件夹放进 skills 目录。
- **其他模型（DeepSeek、MiniMax、Qwen…）**：把 `SKILL.md` 全文放进系统提示词，并允许模型读取 `references/` 下的文件、执行 `python3 tools/...` 命令。
  推荐让模型按顺序读：`SKILL.md` → `references/script-writing.md` → `references/scene-recipes.md`。

## 文案：内置 water-koubo 爆款口播二创
有参考稿时，AI 会按 `copywriting/water-koubo/SKILL.md` 把它二创成「标题 / 封面文字 / 口播正文」，
再用 `tools/script2story.py` 自动切句、分场景生成分镜骨架。流程见 `references/copywriting.md`。
不再强制"第一、第二、第三"按点论述——叙事按 钩子 → 判断 → 原因/案例 → 爆点 → 回应开头 自然推进。

> water-koubo 作者：老肖AI运营（https://github.com/waterbrojx/water-koubo），CC BY-NC 4.0。
> 原样收录，未做修改（见 `copywriting/water-koubo/MODIFICATIONS.md`）。**非商业使用免费；商业使用须向原作者单独授权。**

## 自己用
```bash
mkdir -p projects/my_video && vim projects/my_video/script.md   # 标题：/封面文字：/口播正文：
python3 tools/script2story.py projects/my_video/script.md      # → story.json 骨架（再填标题和画面）
# 或者：cp -r examples/pleaser projects/my_video               # 拿示例改
python3 tools/make.py projects/my_video/story.json --check   # 校验 + 配音 + 预览图
python3 tools/visualize.py projects/my_video/story.json      # 每个场景的 场景插画/道具/动作 建议（--apply 自动补）
python3 tools/make.py projects/my_video/story.json           # 渲染 → build/video.mp4，并自动上传给出 🔗 下载链接
python3 tools/publish.py projects/my_video/build/video.mp4   # 单独上传（--host litterbox|uguu|gofile|catbox）
```

## 目录
- `SKILL.md` 主说明（流程 / 硬性规则 / 速查）
- `references/` 文案写作、42 个场景模板、文案可视化翻译法、组件字段、角色、风格规范、质检清单、参考图
- `engine/` 渲染引擎（HTML/SVG 角色 + 场景插画 + 道具 + 动画），`fonts/` 开源字体（OFL），`sfx/` `bgm/` 自制无版权音效与音乐
- `tools/` make（一键）、validate（校验 + 文字版画面描述）、tts（小米 MiMo / edge-tts 配音 + 字级时间轴）、setup_mimo（配置小米 Key）、script2story（文案 → 分镜骨架）、preview（预览图）、render（多进程渲染 + 混音）、visualize / imagery（文案 → 场景插画/意象道具建议）、publish（在线部署并给出下载链接）、gallery（重新生成参考图）
- `copywriting/water-koubo/` 第三方文案二创 Skill（CC BY-NC 4.0）
- `examples/` 完整示例（含成片）

字体：站酷庆科黄油体、站酷快乐体、得意黑、思源黑体、Archivo Black、Bangers，均为 SIL OFL 开源字体，可商用。

## ⚠️ 隐私提示：成片默认会被上传到公共托管

`tools/make.py` 渲染完成后，**第 6 步会自动调用 `tools/publish.py`，把成片上传到公共文件托管**
（catbox / litterbox / uguu / gofile），返回一个**任何人都能下载的链接**。

- 不想要公开链接，务必加 `--no-publish`：

  ```bash
  python3 tools/make.py projects/my_video/story.json --no-publish
  ```

- 也可以改 `config.json` 的 `publish_hosts` 为空数组，或直接删掉 `tools/publish.py`。
- 上传记录写在成片同目录的 `publish.json`（含 URL / 托管 / 有效期）。
- 各托管保存期：`catbox` 永久（需 `catbox_userhash`）、`litterbox` 最长 72 小时、`uguu` 约 3 小时、`gofile` 长期但为下载页。

> **涉及商业内容、未发布素材、客户隐私时，请一律用 `--no-publish`。**

## 从本仓库安装

```bash
git clone https://github.com/darker314159/pop-comic-explainer-claude.git
cp -r pop-comic-explainer-claude ~/.agents/skills/pop-comic-explainer
```

放进 skills 目录后，说「做个波普漫画风讲解视频」「把这段文案做成视频」即可触发。

## 许可

**本仓库是混合许可，请分开看：**

| 范围 | 许可 | 商用 |
|---|---|---|
| 主体（`SKILL.md` / `references/` / `tools/` / `engine/` / `examples/`） | MIT | ✅ |
| 字体 `engine/fonts/` | SIL OFL 1.1 | ✅ |
| 音效 / BGM | 自制无版权 | ✅ |
| **`copywriting/water-koubo/`** | **CC BY-NC 4.0** | ❌ **须单独授权** |

> ⚠️ `copywriting/water-koubo/` 是老肖AI运营的作品（[waterbrojx/water-koubo](https://github.com/waterbrojx/water-koubo)），
> **禁止商用、不可改许可**。商业使用须向原作者单独取得授权，本仓库的 MIT 无法覆盖也无法代授。
> 详细条款、收录版本与修改情况见 [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md)。

## 📄 License

MIT © 2026 darker314159（不含第三方组件，详见 `LICENSE` 适用范围内与 `THIRD-PARTY-NOTICES.md`）

