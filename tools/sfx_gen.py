#!/usr/bin/env python3
"""Synthesize the bundled SFX + BGM loops (pure numpy, royalty-free). Run once; outputs engine/sfx/*.wav, engine/bgm/*.wav"""
import numpy as np, wave
from pathlib import Path
SR = 48000
OUT = Path(__file__).resolve().parent.parent / 'engine'
rng = np.random.default_rng(7)
def t_(d): return np.arange(int(SR * d)) / SR
def env(n, a=.004, r=None, curve=6):
    e = np.ones(n); na = max(1, int(a * SR)); e[:na] = np.linspace(0, 1, na)
    x = np.linspace(0, 1, n); e *= np.exp(-curve * x) if r is None else 1; return e
def sweep(f0, f1, d, shape='sine', expo=True):
    t = t_(d); f = f0 * (f1 / f0) ** (t / d) if expo else f0 + (f1 - f0) * t / d
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) if shape == 'sine' else np.sign(np.sin(ph)) * .6 if shape == 'square' else (2 * ((ph / (2 * np.pi)) % 1) - 1) * .7
def lp(x, a):  # one-pole lowpass, a in (0,1): smaller = darker
    y = np.zeros_like(x); s = 0.
    for i in range(len(x)): s += a * (x[i] - s); y[i] = s
    return y
def bp_noise(d, f0, f1):
    n = rng.standard_normal(int(SR * d)); out = np.zeros_like(n); lo = 0.; bl = 0.
    fs = np.geomspace(f0, f1, len(n))
    for i in range(len(n)):
        a = min(1, 2 * np.pi * fs[i] / SR); lo += a * (n[i] - lo); bl += a * .5 * (lo - bl); out[i] = lo - bl
    return out / (np.abs(out).max() + 1e-9)
def norm(x, peak=.9): return x / (np.abs(x).max() + 1e-9) * peak
def save(name, x, folder='sfx'):
    x = np.asarray(x, dtype=np.float64)
    if x.ndim == 1: x = np.stack([x, x], 1)
    p = OUT / folder / f'{name}.wav'; p.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(p), 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(x, -1, 1) * 32767).astype('<i2').tobytes())
def fade_tail(x, d=.01):
    n = int(d * SR); x = x.copy(); x[-n:] *= np.linspace(1, 0, n); return x

def make_sfx():
    d = .09; save('pop', fade_tail(norm(sweep(1100, 260, d) * env(int(SR * d), curve=7) + .25 * bp_noise(d, 3000, 1500) * env(int(SR * d), curve=30), .8)))
    d = .13; save('pop2', fade_tail(norm(sweep(380, 1250, d) * np.sin(np.pi * t_(d) / d) ** .6, .7)))
    save('pops', fade_tail(norm(sweep(1400, 500, .06) * env(int(SR * .06), curve=8), .5)))
    d = .42; n = bp_noise(d, 300, 4500); save('whoosh', fade_tail(norm(n * np.sin(np.pi * t_(d) / d) ** 2, .7)))
    d = .22; n = bp_noise(d, 900, 6000); save('swish', fade_tail(norm(n * np.sin(np.pi * t_(d) / d) ** 2, .55)))
    d = .32; n = bp_noise(d, 200, 1200); save('swing', fade_tail(norm(n * np.sin(np.pi * t_(d) / d) ** 2, .4)))
    d = .35; save('hit', fade_tail(norm(sweep(150, 45, d) * env(int(SR * d), curve=9) + .5 * bp_noise(d, 2500, 800) * env(int(SR * d), curve=28), .95)))
    d = .9; save('boom', fade_tail(norm(sweep(110, 32, d) * env(int(SR * d), curve=5) + .6 * bp_noise(d, 1800, 200) * env(int(SR * d), curve=7), .95)))
    d = .18; save('stamp', fade_tail(norm(sweep(220, 70, d) * env(int(SR * d), curve=14) + .7 * bp_noise(d, 1500, 600) * env(int(SR * d), curve=22), .9)))
    d = .5; tt = t_(d); f = 220 + 380 * (tt / d) + 60 * np.sin(2 * np.pi * 16 * tt); save('boing', fade_tail(norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(tt), curve=4), .6)))
    d = .9; tt = t_(d); b = sum(a * np.sin(2 * np.pi * f * tt) for f, a in [(1318, 1), (2637, .4), (3951, .15)]); save('ding', fade_tail(norm(b * env(len(tt), curve=5), .55)))
    d = .32; save('buzz', fade_tail(norm(lp(sweep(120, 110, d, 'square'), .2) * (env(int(SR * d), curve=2)), .55)))
    d = 1.2; x = np.zeros(int(SR * d))
    for k in range(16):
        s = int(k * .072 * SR); tk = .03; x[s:s + int(tk * SR)] += sweep(2200 + 40 * k, 1600, tk) * env(int(tk * SR), curve=12) * (1 - k / 20)
    save('count', fade_tail(norm(x, .45)))
    d = .45; x = np.zeros(int(SR * d))
    for k in range(6):
        s = int(k * .065 * SR); tk = .025; x[s:s + int(tk * SR)] += bp_noise(tk, 4000, 2500) * env(int(tk * SR), curve=14)
    save('type', fade_tail(norm(x, .45)))
    d = .28; tt = t_(d); x = np.where(tt < .1, np.sin(2 * np.pi * 988 * tt), np.sin(2 * np.pi * 1480 * tt)) * env(len(tt), curve=6); save('msg', fade_tail(norm(x, .5)))
    d = .7; save('rise', fade_tail(norm(sweep(300, 1100, d) * np.sin(np.pi * t_(d) / d) * .8 + .2 * sweep(600, 2200, d), .4)))
    d = .7; x = np.zeros(int(SR * d))
    for k, f in enumerate([1568, 2093, 2637, 3136, 4186]):
        s = int(k * .06 * SR); tk = .35; tt = t_(tk); x[s:s + len(tt)] += np.sin(2 * np.pi * f * tt) * env(len(tt), curve=9)
    save('sparkle', fade_tail(norm(x, .4)))
    d = .03; save('click', fade_tail(norm(bp_noise(d, 3000, 2000) * env(int(SR * d), curve=20), .5)))
    d = 1.0; x = np.zeros(int(SR * d))
    for k, f in enumerate([523, 659, 784, 1047]):
        s = int(k * .09 * SR); tk = .6; tt = t_(tk); x[s:s + len(tt)] += (np.sin(2 * np.pi * f * tt) + .3 * np.sin(4 * np.pi * f * tt)) * env(len(tt), curve=5)
    save('tada', fade_tail(norm(x, .5)))
    d = .5; tt = t_(d); save('wrong', fade_tail(norm(np.sign(np.sin(2 * np.pi * np.where(tt < .2, 300, 220) * tt)) * env(len(tt), curve=3) * .5, .45)))

NOTE = lambda m: 440 * 2 ** ((m - 69) / 12)
def make_bgm(name, bpm, prog, style):
    beat = 60 / bpm; bars = 8; L = int(SR * beat * 4 * bars); mix = np.zeros((L, 2))
    def add(x, start, pan=0., g=1.):
        s = int(start * SR); e = min(L, s + len(x)); x = x[:e - s] * g
        mix[s:e, 0] += x * (1 - max(0, pan)); mix[s:e, 1] += x * (1 + min(0, pan))
    kick = sweep(130, 42, .28) * env(int(SR * .28), curve=8)
    snare = bp_noise(.18, 3500, 1200) * env(int(SR * .18), curve=16) + .4 * np.sin(2 * np.pi * 190 * t_(.18)) * env(int(SR * .18), curve=20)
    hat = bp_noise(.04, 9000, 7000) * env(int(SR * .04), curve=30)
    for bar in range(bars):
        root, quality = prog[bar % len(prog)]
        chord = [root, root + (3 if quality == 'm' else 4), root + 7, root + 12]
        for b in range(4):
            t0 = (bar * 4 + b) * beat
            if style != 'chill' or b in (0, 2): add(kick, t0, g=.9 if style == 'pop' else .7)
            if b in (1, 3): add(snare, t0, g=.35 if style == 'pop' else .25)
            for h in range(2): add(hat, t0 + h * beat / 2, pan=.3, g=.22 if h else .12)
            # bass
            bn = root - 24 + (7 if (style == 'pop' and b == 3) else 0)
            bd = beat * .9; bass = lp(sweep(NOTE(bn), NOTE(bn), bd, 'saw', expo=False), .08) * env(int(SR * bd), curve=3)
            add(bass, t0, g=.55)
            # chord stabs on off-beats (pop) / pads (chill)
            if style == 'pop':
                sd = beat * .35; st = sum(lp(sweep(NOTE(n + 12), NOTE(n + 12), sd, 'saw', expo=False), .25) for n in chord[:3]) * env(int(SR * sd), curve=9)
                add(st, t0 + beat / 2, pan=-.2, g=.16)
            elif b == 0:
                pd = beat * 4; pad = sum(np.sin(2 * np.pi * NOTE(n) * t_(pd)) for n in chord) * np.sin(np.pi * t_(pd) / pd) ** .5
                add(pad, t0, g=.07)
        # little pluck melody (pentatonic)
        if style in ('pop', 'chill'):
            R = np.random.default_rng(bar + (3 if style == 'pop' else 9)); scale = [0, 2, 4, 7, 9, 12, 14]
            for k in range(8 if style == 'pop' else 4):
                if R.random() < .45: continue
                n = 72 + scale[R.integers(len(scale))] + (root % 12 if style == 'pop' else 0) - 12 * (root % 12 > 6)
                pdur = beat * .45; pl = np.sin(2 * np.pi * NOTE(n) * t_(pdur)) * env(int(SR * pdur), curve=7) + .3 * np.sin(4 * np.pi * NOTE(n) * t_(pdur)) * env(int(SR * pdur), curve=12)
                add(pl, (bar * 4) * beat + k * beat * (0.5 if style == 'pop' else 1), pan=.25, g=.12)
    mix = mix / (np.abs(mix).max() + 1e-9) * .8
    save(name, mix, 'bgm')

if __name__ == '__main__':
    make_sfx()
    make_bgm('pop_bounce', 112, [(60, ''), (67, ''), (69, 'm'), (65, '')], 'pop')
    make_bgm('lofi_chill', 84, [(62, 'm'), (67, ''), (60, ''), (69, 'm')], 'chill')
    make_bgm('tension', 96, [(57, 'm'), (57, 'm'), (53, ''), (52, '')], 'dark')
    print('ok ->', OUT / 'sfx', OUT / 'bgm')
