#!/usr/bin/env python3
"""一次性配置小米 MiMo TTS（配好之后 tts.py / make.py 自动使用小米配音）。

usage:
  python3 tools/setup_mimo.py sk-xxxxxxxx                 # 按量付费 Key（api.xiaomimimo.com）
  python3 tools/setup_mimo.py tp-xxxxxxxx                 # Token Plan Key（自动切换 token-plan-cn 地址）
  python3 tools/setup_mimo.py sk-xxx --voice 冰糖 --style "温柔治愈的女声，语速适中"
  python3 tools/setup_mimo.py --test                      # 只测试已保存的配置
  python3 tools/setup_mimo.py sk-xxx --global             # 保存到 ~/.pop-comic/config.json（所有项目共用）

Key 获取：https://platform.xiaomimimo.com → API Keys。默认保存到 <skill>/config.json（不要分享这个文件）。
音色：苏打(男·默认) 白桦(男) 冰糖(女) 茉莉(女) mimo_default Mia Chloe Milo Dean
"""
import argparse, json, sys, tempfile, wave
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import tts

def main():
    p = argparse.ArgumentParser(description='配置小米 MiMo TTS API Key')
    p.add_argument('key', nargs='?', help='小米 API Key（sk-... 或 tp-...）')
    p.add_argument('--base-url', help='自定义接口地址（默认按 Key 前缀自动选择）')
    p.add_argument('--voice', help='默认音色，默认 苏打')
    p.add_argument('--style', help='默认语气指令（自然语言描述，例如“激昂的知识博主，语速快”）')
    p.add_argument('--model', help='模型名，默认 mimo-v2.5-tts')
    p.add_argument('--global', dest='glob', action='store_true', help='保存到 ~/.pop-comic/config.json')
    p.add_argument('--test', action='store_true', help='只测试当前配置，不写文件')
    p.add_argument('--text', default='你有没有发现，你对别人越好，别人越不珍惜你？', help='测试文本')
    a = p.parse_args()

    if a.voice and a.voice not in tts.MIMO_VOICES:
        sys.exit(f'❌ 音色 “{a.voice}” 不存在，可选：{" ".join(tts.MIMO_VOICES)}')
    path = (Path.home() / '.pop-comic' / 'config.json') if a.glob else (tts.ROOT / 'config.json')
    if not a.test:
        if not a.key: sys.exit('❌ 请提供 Key：python3 tools/setup_mimo.py sk-你的key   （获取：https://platform.xiaomimimo.com）')
        k = a.key.strip()
        if not k.startswith(('sk-', 'tp-', 'ttp-')): print('⚠️  Key 一般以 sk- 或 tp- 开头，请确认没复制错。')
        cfg = json.loads(path.read_text(encoding='utf-8')) if path.exists() else {}
        cfg['mimo_api_key'] = k
        for opt, name in [(a.base_url, 'mimo_base_url'), (a.voice, 'mimo_voice'), (a.style, 'mimo_style'), (a.model, 'mimo_model')]:
            if opt: cfg[name] = opt
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(cfg, ensure_ascii=False, indent=2), encoding='utf-8')
        try: path.chmod(0o600)
        except Exception: pass
        print(f'✅ 已保存到 {path}')

    cfg = tts.load_config()
    if not cfg['key']: sys.exit('❌ 没有找到 Key。运行：python3 tools/setup_mimo.py sk-你的key')
    voice = cfg['voice'] or tts.MIMO_DEFAULT_VOICE
    style = cfg['style'] if cfg['style'] is not None else tts.MIMO_DEFAULT_STYLE
    print(f'🔊 测试合成：{cfg["base"]} · {cfg["model"]} · 音色 {voice} · Key {cfg["key"][:5]}…{cfg["key"][-4:]}')
    out = Path(tempfile.gettempdir()) / 'mimo_test.wav'
    try:
        tts.mimo_one(a.text, voice, style, '', cfg, out)
        with wave.open(str(out)) as w: dur = w.getnframes() / w.getframerate()
    except tts.FatalTTS as e: sys.exit(f'❌ {e}')
    except Exception as e: sys.exit(f'❌ 测试失败：{e}\n   检查网络、Key 是否正确、账户是否开通 TTS（https://platform.xiaomimimo.com）。')
    print(f'✅ 小米 TTS 可用！测试音频 {dur:.1f}s → {out}\n   之后运行 make.py / tts.py 会自动使用小米配音（story.json 里 meta.tts 可写 "mimo" / "edge" 强制指定）。')

if __name__ == '__main__':
    main()
