# 第三方声明 / Third-Party Notices

本仓库是**混合许可**。不同部分适用不同条款，使用前请分别确认。

## 许可总览

| 路径 | 许可 | 可否商用 |
|---|---|---|
| `SKILL.md`、`references/`、`tools/`、`engine/`（除字体）、`examples/` | **MIT**（© 2026 darker314159） | ✅ 可 |
| `engine/fonts/` | **SIL OFL 1.1**（各自原作者） | ✅ 可 |
| `engine/sfx/`、`engine/bgm/` | 自制无版权音效与音乐 | ✅ 可 |
| **`copywriting/water-koubo/`** | **CC BY-NC 4.0** | ❌ **不可商用** |

---

## ⚠️ copywriting/water-koubo —— CC BY-NC 4.0

| 项 | 内容 |
|---|---|
| 作品名 | water-koubo / 爆款口播二创 Skill |
| 作者 | **老肖AI运营**（GitHub: [waterbrojx](https://github.com/waterbrojx)） |
| 项目地址 | <https://github.com/waterbrojx/water-koubo> |
| 收录版本 | 1.0.0（commit `7566f0f`） |
| 首次公开 | 2026-08-18 |
| 许可 | **CC BY-NC 4.0** |
| 条款全文 | <https://creativecommons.org/licenses/by-nc/4.0/legalcode.zh-hans> |

### 收录与修改情况

**原样收录，未做任何修改**：`SKILL.md`、`LICENSE`、`NOTICE`、`VERSION` 均为原文件拷贝。

未收录原仓库的 `README`、媒体素材（横幅 / 微信二维码）、`dist`、`tests`、`agents` 目录。
作者品牌、横幅、二维码等**排除资产已全部剔除**，未在本仓库出现。

本仓库另外新增了两处适配（**不属于 water-koubo，也不改变其规则**）：

1. `references/copywriting.md` —— 说明如何调用 water-koubo 产出「标题 / 封面文字 / 口播正文」
2. `tools/script2story.py` —— 把上述产出转成本 Skill 的 `story.json` 分镜骨架

### 使用限制（重要）

依据 CC BY-NC 4.0 及原作者 NOTICE，「商业使用」明确包括但不限于：

- 用于已有或计划变现的个人内容账号
- 用于企业账号、品牌营销、获客或销售
- 代运营公司、工作室、MCN 或顾问为客户批量写稿或交付
- 集成到收费产品、会员服务、工作流、插件、应用或其他商业工具
- 以收费培训、咨询、模板包等方式直接或间接获利

**以上场景均须向原作者老肖AI运营取得单独授权，本仓库的 MIT 许可不覆盖此目录，也无法代为授权。**

使用本 Skill 生成的稿件无需署名原作者；但**项目材料本身**的再发布必须保留署名、许可证说明和修改说明。

---

## 字体 / Fonts

`engine/fonts/` 下 6 款字体均为 **SIL Open Font License 1.1**，可随软件分发与商用：

| 文件 | 字体 | 许可 |
|---|---|---|
| `NotoSansSC-Black.otf` / `NotoSansSC-Bold.otf` | 思源黑体 Noto Sans SC | SIL OFL 1.1 |
| `ZCOOLQingKeHuangYou-Regular.ttf` | 站酷庆科黄油体 | SIL OFL 1.1 |
| `ZCOOLKuaiLe-Regular.ttf` | 站酷快乐体 | SIL OFL 1.1 |
| `SmileySans-Oblique.ttf` | 得意黑 Smiley Sans | SIL OFL 1.1 |
| `ArchivoBlack-Regular.ttf` | Archivo Black | SIL OFL 1.1 |
| `Bangers-Regular.ttf` | Bangers | SIL OFL 1.1 |

OFL 要求：不得单独售卖字体文件本体；修改后须沿用 OFL 并更名。嵌入视频、图片中使用不受限。

## 音效与音乐 / SFX & BGM

`engine/sfx/`（20 个音效）与 `engine/bgm/`（3 首配乐）为本项目自制素材，随 MIT 许可一并提供。

## 关于主体部分的作者

原始分发包（`pop-comic-explainer-claude.zip`）**未在文件内标注主体作者信息**，
本仓库依授权以 `darker314159` 名义发布。如你是该主体部分的作者并认为署名有误，请提 Issue 更正。

## 免责声明

- 本仓库只提供工具与模板，不产出内容成品；使用者对生成内容的合规性负责。
- `config.json` 含 API Key，已在 `.gitignore` 中排除，**请勿提交**。
- 本仓库不自动安装依赖，运行时需自行准备 ffmpeg / playwright / Python 包。
