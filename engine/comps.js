/* ============================================================
 * COMPONENT LIBRARY — each component: { html(spec, ctx) -> string, anchor?, frame?(el, lt, ctx), sfx, autoPos }
 * Coordinates: 1080x1920 canvas. Stage (art area) y≈430–1404. Subtitle panel y≥1404.
 * ============================================================ */
(function (G) {
const INK = '#1c1a1f';
const PAL = { yellow: '#ffd21f', red: '#e8412c', pink: '#ff5fa2', rose: '#ff4f7a', blue: '#7ec8ff', sky: '#8fd6ff', cobalt: '#2f5fd0', orange: '#ff6a3d', purple: '#b48cff', green: '#4fd08a', mint: '#9ff0c8', white: '#ffffff', cream: '#f4ecdf', black: '#1c1a1f', dark: '#1f1d22', navy: '#232a3f', grey: '#8a8790', lime: '#c8f04a' };
const col = (c, d) => (c === undefined || c === null) ? d : (PAL[c] || c);
const lum = (hex) => { const n = parseInt((hex || '#fff').slice(1), 16); return (0.3 * (n >> 16) + 0.59 * ((n >> 8) & 255) + 0.11 * (n & 255)) / 255; };
const autoText = (bg) => lum(bg) > 0.55 ? INK : '#ffffff';
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// "[关键词]" -> highlighted span ; "\n" -> <br>
const rich = (s, hl = PAL.yellow) => esc(s).replace(/\[([^\]]+)\]/g, `<span style="color:${hl}">$1</span>`).replace(/\\n|\n/g, '<br>');
const FONTS = { pop: 'HuangYou', bold: 'NotoBlack', num: 'Archivo', comic: 'Bangers', smiley: 'Smiley', cute: 'KuaiLe', medium: 'NotoBold' };
function rng(seed) { let s = (seed * 9301 + 49297) % 233280; return () => (s = (s * 9301 + 49297) % 233280) / 233280; }
function hashStr(s) { let h = 7; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) % 100003; return h; }

const C = {};
function POP_FLASH_HINT() {}
/* ---------- character ---------- */
C.char = {
  anchor: 'bottom', sfx: 'pop',
  html: (s) => `<div class="cw" style="width:${s._w}px;height:${s._h}px;${s.flip ? 'transform:scaleX(-1);' : ''}"></div>`,
  frame(el, lt) {
    const s = el.spec; let st = { expr: s.expr || 'neutral', pose: s.pose || 'down', look: s.look || 0, silhouette: !!s.silhouette };
    let lastAct = -9;
    for (const a of (s._acts || [])) if (lt >= a._t) { Object.assign(st, a); lastAct = a._t; }
    const seed = (el.idx * 1.37) % 3;
    const sil = st.silhouette ?? s.silhouette;
    if (sil !== el._sil) { el._sil = sil; const cw = el.node.querySelector('.cw'); cw.style.filter = sil ? 'brightness(0) invert(.27)' : ''; if (lastAct > 0 && !sil) POP_FLASH_HINT(el); }
    const ph = (lt + seed) % 3.4; const blink = (ph < 0.11 && !s.noBlink) ? 1 : 0;
    const key = st.expr + '|' + st.pose + '|' + st.look + '|' + blink;
    if (key !== el._key) {
      el._key = key;
      const o = Object.assign({}, s.outfit ? { outfit: s.outfit } : {}, s.style || {}, { who: s.who, expr: st.expr, pose: st.pose, look: st.look, blink });
      for (const k of ['hairColor', 'outfitColor', 'innerColor', 'skin', 'hair', 'eyeColor', 'lip', 'glasses']) if (s[k] !== undefined) o[k] = col(s[k]);
      el.node.querySelector('.cw').innerHTML = CHAR.charSVG(o);
    }
    // breathing + hop on expression change
    const hop = lt - lastAct < 0.3 && lastAct > 0 ? Math.sin((lt - lastAct) / 0.3 * Math.PI) * 18 : 0;
    return { dy: -hop, sy: 1 + 0.008 * Math.sin(lt * 2.1 + seed) };
  },
};
/* ---------- round avatar ---------- */
C.avatar = { sfx: 'pop', autoPos: true,
  html: (s) => `<div style="width:${s.size || 150}px;height:${s.size || 150}px">${CHAR.avatarSVG({ who: s.who || 'girl', expr: s.expr || 'smile', ring: col(s.ring, PAL.yellow), bg: col(s.bg, '#fff3e0') })}</div>` };
/* ---------- crowd of avatars ---------- */
C.avatars = { sfx: 'pops',
  html(s) {
    const n = s.count || 12, size = s.size || 110, R = rng(hashStr(JSON.stringify(s)) + 3);
    const whoList = Array.isArray(s.who) ? s.who : s.who === 'guys' ? ['guy', 'guy2', 'guy3', 'boss'] : s.who === 'mixed' ? ['girl', 'guy', 'girl2', 'guy2', 'girl3', 'guy3', 'girl4'] : ['girl', 'girl2', 'girl3', 'girl4'];
    const rings = (s.rings || ['yellow', 'pink', 'blue', 'green', 'purple', 'orange']).map(c => col(c));
    const exprs = s.exprs || [s.expr || 'smile'];
    const pts = [];
    const L = s.layout || 'arc';
    for (let i = 0; i < n; i++) {
      let x, y;
      if (L === 'arc') { const a = Math.PI * (1.05 + 0.9 * (n === 1 ? .5 : i / (n - 1))); const r = s.radius || 330; x = Math.cos(a) * r; y = Math.sin(a) * r * 1.0 + r * .35; }
      else if (L === 'ring') { const a = Math.PI * 2 * i / n - Math.PI / 2; const r = s.radius || 300; x = Math.cos(a) * r; y = Math.sin(a) * r; }
      else if (L === 'row') { const gap = s.gap || size * 1.12; x = (i - (n - 1) / 2) * gap; y = 0; }
      else if (L === 'scatter') { x = (R() - .5) * (s.w || 800); y = (R() - .5) * (s.h || 600); }
      else { const cols = s.cols || 6, gap = s.gap || size * 1.15; const rows = Math.ceil(n / cols); x = ((i % cols) - (cols - 1) / 2) * gap; y = (Math.floor(i / cols) - (rows - 1) / 2) * gap; }
      pts.push([x, y]);
    }
    return `<div style="position:relative;width:0;height:0">` + pts.map(([x, y], i) => `<div class="sub" data-k="${i}" style="position:absolute;left:${x - size / 2}px;top:${y - size / 2}px;width:${size}px;height:${size}px">${CHAR.avatarSVG({ who: whoList[i % whoList.length], expr: exprs[i % exprs.length], ring: rings[i % rings.length] })}</div>`).join('') + `</div>`;
  },
  frame(el, lt) {
    const st = el.spec.stagger ?? 0.09;
    el.subs = el.subs || [...el.node.querySelectorAll('.sub')];
    el.subs.forEach((d, k) => { const p = clamp01((lt - k * st) / 0.28); const s = p <= 0 ? 0 : easeOutBack(p); d.style.transform = `scale(${s})`; d.style.opacity = p > 0 ? 1 : 0; });
    return {};
  },
};
/* ---------- tag / sticker / label ---------- */
C.tag = { sfx: 'pop', autoPos: true, rot: true,
  html(s) {
    const bg = col(s.color, PAL.yellow), fg = col(s.textColor, autoText(bg));
    const fs = s.size || 42;
    const ic = s.icon ? `<span class="ic" style="width:${fs * 1.1}px;height:${fs * 1.1}px">${ICON.svg(s.icon, { color: col(s.iconColor) })}</span>` : '';
    return `<div class="tag${s.round ? ' round' : ''}" style="background:${bg};color:${fg};font-size:${fs}px;${s.font ? 'font-family:' + (FONTS[s.font] || s.font) + ';' : ''}">${ic}<span>${rich(s.text, s.hl ? col(s.hl) : (bg === PAL.yellow ? PAL.red : PAL.yellow))}</span></div>`;
  } };
/* ---------- counter tag "搞定 ×{n}" ---------- */
C.counter = { sfx: 'count', autoPos: true, rot: true,
  html: (s) => C.tag.html(Object.assign({}, s, { text: '<n>' })).replace('&lt;n&gt;', '<b class="cnt"></b>'),
  frame(el, lt) {
    const s = el.spec, d = s.dur ?? 1.6, from = s.from ?? 0, to = s.to ?? 10;
    const v = Math.round(from + (to - from) * clamp01(lt / d));
    const txt = (s.text || '{n}').replace('{n}', v);
    if (txt !== el._t) { el._t = txt; el.node.querySelector('.cnt').innerHTML = rich(txt); }
    return {};
  } };
/* ---------- speech bubble ---------- */
C.bubble = { sfx: 'pop2', autoPos: true,
  html(s) {
    const bg = col(s.color, '#ffffff'), fg = col(s.textColor, autoText(bg)), fs = s.size || 44, style = s.style || 'speech';
    const text = `<span style="position:relative;z-index:2">${rich(s.text, s.hl ? col(s.hl) : PAL.red)}</span>`;
    if (style === 'shout') {
      const w = Math.max(260, (String(s.text).replace(/\[|\]/g, '').length) * fs * 1.05 + 160), h = fs * 3.2;
      const R = rng(hashStr(s.text)); let pts = []; const n = 22;
      for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; const r = i % 2 ? 0.78 + R() * .06 : 1.0 + R() * .12; pts.push(`${(w / 2 + Math.cos(a) * w / 2 * r).toFixed(1)},${(h / 2 + Math.sin(a) * h / 2 * r).toFixed(1)}`); }
      return `<div style="position:relative;width:${w}px;height:${h}px;display:flex;align-items:center;justify-content:center;font:${fs}px NotoBlack;color:${fg};white-space:nowrap"><svg style="position:absolute;left:0;top:0;overflow:visible" width="${w}" height="${h}"><polygon points="${pts.join(' ')}" fill="${INK}" transform="translate(8 8)"/><polygon points="${pts.join(' ')}" fill="${bg}" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/></svg>${text}</div>`;
    }
    const tail = s.tail || 'bl';
    const tpos = { bl: 'left:22%;bottom:-30px;transform:skewX(25deg)', br: 'right:22%;bottom:-30px;transform:skewX(-25deg)', bottom: 'left:46%;bottom:-30px', tl: 'left:22%;top:-30px;transform:rotate(180deg) skewX(-25deg)', tr: 'right:22%;top:-30px;transform:rotate(180deg) skewX(25deg)' }[tail];
    const tailHtml = tail === 'none' ? '' : style === 'thought'
      ? `<i style="position:absolute;${tail.includes('r') ? 'right:18%' : 'left:18%'};bottom:-34px;width:30px;height:30px;border-radius:50%;background:${bg};border:5px solid ${INK}"></i><i style="position:absolute;${tail.includes('r') ? 'right:12%' : 'left:12%'};bottom:-62px;width:18px;height:18px;border-radius:50%;background:${bg};border:4px solid ${INK}"></i>`
      : `<i style="position:absolute;${tpos};width:44px;height:34px;z-index:1"><svg width="44" height="40" style="overflow:visible"><path d="M0 -6 L22 34 L44 -6" fill="${bg}" stroke="${INK}" stroke-width="5.5" stroke-linejoin="round"/></svg></i>`;
    return `<div style="position:relative;display:inline-block;background:${bg};color:${fg};border:5.5px solid ${INK};border-radius:${style === 'thought' ? 60 : 36}px;padding:${fs * .38}px ${fs * .7}px;font:${fs}px NotoBlack;white-space:nowrap;box-shadow:8px 8px 0 ${INK};line-height:1.25;text-align:center">${text}${tailHtml}</div>`;
  } };
/* ---------- explosion burst with text ---------- */
C.burst = { sfx: 'boom',
  html(s) {
    const w = s.w || s.size || 600, h = s.h || w * .82, n = s.spikes || 18, R = rng(hashStr(s.text || 'b') + 11);
    const bg = col(s.color, '#ffffff'), fg = col(s.textColor, PAL.yellow);
    let pts = [];
    for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * Math.PI * 2 - Math.PI / 2; const r = i % 2 ? 0.62 + R() * .08 : 0.92 + R() * .1; pts.push(`${(w / 2 + Math.cos(a) * w / 2 * r).toFixed(1)},${(h / 2 + Math.sin(a) * h / 2 * r).toFixed(1)}`); }
    const fs = s.textSize || Math.min(w * .26, w * 1.1 / Math.max(2, String(s.text || '').length));
    return `<div style="position:relative;width:${w}px;height:${h}px"><svg width="${w}" height="${h}" style="position:absolute;overflow:visible"><polygon points="${pts.join(' ')}" fill="${INK}" transform="translate(12 12)"/><polygon points="${pts.join(' ')}" fill="${bg}" stroke="${INK}" stroke-width="10" stroke-linejoin="round"/></svg>
      <div class="txt" style="position:absolute;left:0;right:0;top:50%;transform:translateY(-50%) rotate(${s.textRot ?? -4}deg);font-family:${FONTS[s.font || 'pop']};font-size:${fs}px;color:${fg};-webkit-text-stroke:${fs * .1}px ${INK};text-shadow:${fs * .06}px ${fs * .06}px 0 ${INK}">${rich(s.text || '', col(s.hl, PAL.red))}</div>
      ${s.sub ? `<div class="txt" style="position:absolute;left:0;right:0;top:${50 + fs / h * 70}%;font:${fs * .42}px NotoBlack;"><span style="background:${INK};color:#fff;padding:4px 16px;border-radius:8px">${esc(s.sub)}</span></div>` : ''}</div>`;
  } };
/* ---------- comic onomatopoeia (BOING! POW!) ---------- */
C.onoma = { sfx: 'boing', autoPos: true,
  html(s) { const fs = s.size || 110, c = col(s.color, PAL.yellow); return `<div class="txt" style="font-family:Bangers;font-size:${fs}px;letter-spacing:4px;color:${c};-webkit-text-stroke:${fs * .1}px ${INK};text-shadow:${fs * .07}px ${fs * .07}px 0 ${INK}">${esc(s.text || 'POW!')}</div>`; } };
/* ---------- icon ---------- */
C.icon = { sfx: 'pop', autoPos: true,
  html(s) { const z = s.size || 220; return `<div style="width:${z}px;height:${z}px;position:relative">${ICON.svg(s.name || 'star', { color: col(s.color), color2: col(s.color2) })}${s.label ? `<div style="position:absolute;left:50%;top:${z + 6}px;transform:translateX(-50%)">${C.tag.html({ text: s.label, color: s.labelColor || 'white', size: s.labelSize || 34 })}</div>` : ''}</div>`; } };
/* ---------- free text ---------- */
C.text = { sfx: false, autoPos: true,
  html(s) {
    const fs = s.size || 90, font = FONTS[s.font || 'pop'] || s.font, c = col(s.color, INK), sk = s.stroke ?? (s.font === 'bold' || s.font === 'medium' ? 0 : fs * .09);
    const sh = s.shadow === false ? 'none' : s.shadow ? `${fs * .06}px ${fs * .06}px 0 ${col(s.shadow === true ? 'black' : s.shadow)}` : 'none';
    const bgbox = s.box ? `background:${col(s.box)};padding:${fs * .12}px ${fs * .3}px;border:5px solid ${INK};border-radius:12px;box-shadow:8px 8px 0 ${INK};` : '';
    return `<div class="txt" style="font-family:${font};font-size:${fs}px;color:${c};-webkit-text-stroke:${sk}px ${col(s.strokeColor, INK)};text-shadow:${sh};letter-spacing:${s.track ?? 2}px;${bgbox}">${rich(s.text || '', col(s.hl, PAL.yellow))}</div>`;
  } };
/* ---------- rubber stamp ---------- */
C.stamp = { sfx: 'stamp', autoPos: true,
  html(s) { const c = col(s.color, PAL.red), fs = s.size || 76; return `<div style="border:${fs * .09}px solid ${c};outline:${fs * .05}px solid ${c};outline-offset:${fs * .08}px;color:${c};font:${fs}px NotoBlack;padding:${fs * .05}px ${fs * .3}px;border-radius:12px;white-space:nowrap;background:${s.fill ? col(s.fill) : 'rgba(255,255,255,.0)'};letter-spacing:4px">${esc(s.text || '盖章')}</div>`; } };
/* ---------- hanging price tag ---------- */
C.pricetag = { sfx: 'swing', autoPos: true, anchor: 'top',
  html(s) {
    const c = col(s.color, PAL.yellow), w = s.w || 300, h = w * 1.2, fs = s.size || w * .24;
    return `<div style="position:relative;width:${w}px;height:${h + 140}px"><svg width="${w}" height="${h + 140}" style="position:absolute;overflow:visible"><path d="M${w / 2} 0 L${w / 2} 150" stroke="${INK}" stroke-width="6"/><path d="M${w * .2} 120 L${w * .8} 120 L${w} 200 L${w} ${h + 120} L0 ${h + 120} L0 200 Z" fill="${INK}" transform="translate(10 10)"/><path d="M${w * .2} 120 L${w * .8} 120 L${w} 200 L${w} ${h + 120} L0 ${h + 120} L0 200 Z" fill="${c}" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/><circle cx="${w / 2}" cy="160" r="16" fill="#fff" stroke="${INK}" stroke-width="6"/></svg>
      <div class="txt" style="position:absolute;left:0;right:0;top:${200 + h * .12}px;font-family:HuangYou;font-size:${fs}px;color:${INK}">${rich(s.text || '')}</div>
      ${s.sub ? `<div class="txt" style="position:absolute;left:0;right:0;top:${200 + h * .12 + fs * 1.2}px;font:${fs * .36}px Archivo;letter-spacing:3px">${esc(s.sub)}</div>` : ''}</div>`;
  },
  frame: (el, lt) => ({ r: Math.sin(lt * 2.6) * 5 * Math.exp(-lt * .4) + Math.sin(lt * 1.3) * 1.5 }) };
/* ---------- progress bar ---------- */
C.progress = { sfx: 'rise',
  html(s) {
    const w = s.w || 760, h = s.h || 56, c = col(s.color, PAL.green);
    return `<div style="width:${w}px">${s.label !== undefined ? `<div class="barlab"><span>${rich(s.label, PAL.red)}</span><span class="pct"></span></div>` : ''}<div class="bar" style="height:${h}px"><div class="fill" style="background:${c}"></div></div></div>`;
  },
  frame(el, lt) {
    const s = el.spec, d = s.dur ?? 1.2, from = s.from ?? 0, to = s.to ?? 80; const v = from + (to - from) * easeOutCubic(clamp01((lt - .15) / d));
    el.fill = el.fill || el.node.querySelector('.fill'); el.pct = el.pct || el.node.querySelector('.pct');
    el.fill.style.width = v + '%'; if (el.pct) el.pct.textContent = Math.round(v) + (s.unit ?? '%');
    if (s.colorTo) el.fill.style.background = v < (s.warnBelow ?? 30) ? col(s.colorTo) : col(s.color, PAL.green);
    return {};
  } };
/* ---------- gauge meter ---------- */
C.meter = { sfx: 'rise',
  html(s) {
    const z = s.size || 380;
    return `<div style="width:${z}px;height:${z * .78}px;position:relative"><svg viewBox="0 0 200 156" width="${z}" height="${z * .78}" style="overflow:visible"><path d="M14 140 A86 86 0 0 1 186 140 Z" fill="#fff" stroke="${INK}" stroke-width="8" stroke-linejoin="round" transform="translate(6 6)" opacity="1" style="fill:${INK}"/><path d="M14 140 A86 86 0 0 1 186 140 Z" fill="#fff" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/><path d="M32 132 A68 68 0 0 1 72 72" fill="none" stroke="#4fd08a" stroke-width="18"/><path d="M76 70 A68 68 0 0 1 124 70" fill="none" stroke="#ffd21f" stroke-width="18"/><path d="M128 72 A68 68 0 0 1 168 132" fill="none" stroke="#e8412c" stroke-width="18"/><g class="needle"><path d="M100 140 L100 62" stroke="${INK}" stroke-width="9" stroke-linecap="round"/></g><circle cx="100" cy="140" r="12" fill="${INK}"/></svg>${s.label ? `<div style="position:absolute;left:50%;top:${z * .84}px;transform:translateX(-50%) rotate(-2deg)">${C.tag.html({ text: s.label, color: s.labelColor || 'white', size: Math.max(34, z * .1) })}</div>` : ''}</div>`;
  },
  frame(el, lt) {
    const s = el.spec, d = s.dur ?? 1.2, v = (s.from ?? 0) + ((s.to ?? 90) - (s.from ?? 0)) * easeOutBack(clamp01((lt - .1) / d));
    el.nd = el.nd || el.node.querySelector('.needle'); el.nd.setAttribute('transform', `rotate(${-78 + 156 * Math.min(1.05, Math.max(-.05, v / 100))} 100 140)`); return {};
  } };
/* ---------- UI card with rows (checklist / template / report) ---------- */
C.card = { sfx: 'whoosh',
  html(s) {
    const w = s.w || 740, hc = col(s.color, PAL.yellow);
    const rows = (s.items || []).map((it, k) => {
      const o = typeof it === 'string' ? { text: it } : it;
      const box = o.check === true ? `<span class="box" style="background:${PAL.green}">✓</span>` : o.check === false ? `<span class="box" style="background:${PAL.red};color:#fff">✕</span>` : o.check === 'dot' ? `<span class="box" style="border-radius:50%;background:${PAL.yellow}"></span>` : o.num ? `<span class="box" style="background:${PAL.yellow}">${k + 1}</span>` : '';
      return `<div class="row sub" data-k="${k}">${box}<span>${rich(o.text, PAL.red)}</span>${o.value ? `<span class="val">${rich(o.value)}</span>` : ''}</div>`;
    }).join('');
    return `<div class="card" style="width:${w}px">${s.title ? `<div class="head" style="background:${hc};color:${autoText(hc)}"><span>${rich(s.title)}</span>${s.badge ? `<span class="badge">${esc(s.badge)}</span>` : ''}</div>` : ''}<div style="padding:10px 0">${rows}</div></div>`;
  },
  frame(el, lt) {
    const st = el.spec.stagger ?? 0.45; el.subs = el.subs || [...el.node.querySelectorAll('.sub')];
    el.subs.forEach((d, k) => { const t0 = (el.spec._itemT && el.spec._itemT[k] != null) ? el.spec._itemT[k] : 0.35 + k * st; const p = clamp01((lt - t0) / 0.25); d.style.opacity = p; d.style.transform = `translateX(${(1 - easeOutCubic(p)) * -40}px)`; });
    return {};
  } };
/* ---------- chat (optionally inside a phone) ---------- */
C.chat = { sfx: 'msg',
  html(s) {
    const w = s.w || 640;
    const items = (s.items || []).map((it, k) => {
      const r = it.side === 'r' || it.side === 'right'; const bg = col(it.color, r ? PAL.green : '#ffffff');
      return `<div class="sub" data-k="${k}" style="display:flex;justify-content:${r ? 'flex-end' : 'flex-start'};margin:16px 0"><span class="chatb" style="background:${bg};color:${autoText(bg)}">${rich(it.text, PAL.red)}</span></div>`;
    }).join('');
    const body = `<div style="padding:10px 26px">${items}</div>`;
    if (s.phone === false) return `<div style="width:${w}px">${body}</div>`;
    return `<div style="width:${w}px;background:#2a2830;border:7px solid ${INK};border-radius:56px;padding:22px;box-shadow:14px 14px 0 ${INK}"><div style="background:#f6f3ff;border-radius:36px;min-height:${s.h || 520}px;overflow:hidden"><div style="background:#fff;border-bottom:5px solid ${INK};padding:16px;text-align:center;font:34px NotoBlack">${esc(s.title || '聊天')}</div>${body}</div></div>`;
  },
  frame(el, lt) {
    const st = el.spec.stagger ?? 0.7; el.subs = el.subs || [...el.node.querySelectorAll('.sub')];
    el.subs.forEach((d, k) => { const t0 = (el.spec._itemT && el.spec._itemT[k] != null) ? el.spec._itemT[k] : 0.3 + k * st; const p = clamp01((lt - t0) / 0.25); d.style.opacity = p > 0 ? 1 : 0; d.style.transform = `scale(${p > 0 ? easeOutBack(p) : 0})`; d.style.transformOrigin = (el.spec.items[k].side || 'l')[0] === 'r' ? '100% 100%' : '0 100%'; });
    return {};
  } };
/* ---------- polaroid cards grid ---------- */
C.polaroids = { sfx: 'pops',
  html(s) {
    const its = s.items || [], cols = s.cols || Math.min(3, its.length), w = s.w || 230, gap = s.gap || 36, R = rng(hashStr(JSON.stringify(its)));
    return `<div style="display:grid;grid-template-columns:repeat(${cols},${w}px);gap:${gap}px">` + its.map((it, k) => { const o = typeof it === 'string' ? { text: it } : it; return `<div class="sub" data-k="${k}"><div class="polaroid" style="transform:rotate(${((R() - .5) * 10).toFixed(1)}deg)"><div class="pic" style="height:${w * .78}px;background:${col(o.color, ['#fff3b0', '#ffd6e6', '#d6f0ff', '#e4ffd6', '#eadcff'][k % 5])}"><div style="width:${w * .55}px;height:${w * .55}px">${o.who ? CHAR.avatarSVG({ who: o.who, expr: o.expr || 'smile', ring: col(o.ring, PAL.yellow), bg: '#fff3e0' }) : ICON.svg(o.icon || 'heart', { color: col(o.iconColor) })}</div></div>${rich(o.text || '')}</div></div>`; }).join('') + `</div>`;
  },
  frame(el, lt) { const st = el.spec.stagger ?? 0.3; el.subs = el.subs || [...el.node.querySelectorAll('.sub')]; el.subs.forEach((d, k) => { const p = clamp01((lt - k * st) / 0.3); d.style.opacity = p > 0 ? 1 : 0; d.style.transform = `translateY(${(1 - easeOutBack(p)) * 120}px) scale(${.6 + .4 * easeOutBack(p)})`; }); return {}; } };
/* ---------- arrow (draws itself) ---------- */
C.arrow = { sfx: 'swish', anchor: 'none',
  html(s) {
    const [x1, y1] = s.from || [300, 900], [x2, y2] = s.to || [700, 900], c = col(s.color, PAL.red), w = s.width || 16;
    const mx = (x1 + x2) / 2 - (y2 - y1) * (s.curve ?? .3), my = (y1 + y2) / 2 + (x2 - x1) * (s.curve ?? .3);
    const a = Math.atan2(y2 - my, x2 - mx), hl = w * 2.6;
    const hx1 = x2 - hl * Math.cos(a - .5), hy1 = y2 - hl * Math.sin(a - .5), hx2 = x2 - hl * Math.cos(a + .5), hy2 = y2 - hl * Math.sin(a + .5);
    const d = `M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`;
    return `<svg width="1080" height="1920" style="position:absolute;left:0;top:0;overflow:visible"><path class="ap" d="${d}" fill="none" stroke="${INK}" stroke-width="${w + 10}" stroke-linecap="round" pathLength="100" stroke-dasharray="100 200"/><path class="ap" d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" pathLength="100" stroke-dasharray="100 200"/><path class="ah" d="M${hx1} ${hy1} L${x2} ${y2} L${hx2} ${hy2} Z" fill="${c}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/></svg>`;
  },
  frame(el, lt) { const p = easeOutCubic(clamp01(lt / (el.spec.dur ?? .45))); el.aps = el.aps || [...el.node.querySelectorAll('.ap')]; el.aps.forEach(a => a.setAttribute('stroke-dashoffset', 100 - 100 * p)); el.node.querySelector('.ah').style.opacity = p > .9 ? 1 : 0; return {}; } };
/* ---------- big red X ---------- */
C.cross = { sfx: 'buzz', autoPos: true, defEnter: 'stamp',
  html: (s) => `<div style="width:${s.size || 300}px;height:${s.size || 300}px">${ICON.svg('cross', { color: col(s.color, PAL.red) })}</div>` };
/* ---------- check mark ---------- */
C.check = { sfx: 'ding', autoPos: true, defEnter: 'stamp',
  html: (s) => `<div style="width:${s.size || 220}px;height:${s.size || 220}px">${ICON.svg('check', { color: col(s.color, PAL.green) })}</div>` };
/* ---------- spotlight / darkness ---------- */
C.spotlight = { sfx: 'click', anchor: 'none', defEnter: 'fade',
  html(s) { const x = s.x ?? 540, y = s.y ?? 1000, r = s.r || 300; return `<div style="position:absolute;left:0;top:0;width:1080px;height:1404px;background:radial-gradient(ellipse ${r}px ${r * 1.25}px at ${x}px ${y}px, rgba(255,240,180,.0) 0%, rgba(255,240,180,.0) 60%, rgba(20,18,24,${s.dim ?? .82}) 100%)"></div><svg width="1080" height="1404" style="position:absolute;left:0;top:0"><path d="M${x - 40} 0 L${x + 40} 0 L${x + r} ${y + r * .9} L${x - r} ${y + r * .9} Z" fill="rgba(255,236,160,.16)"/></svg>`; } };
/* ---------- floating particles ---------- */
C.particles = { sfx: 'sparkle', anchor: 'none', defEnter: 'none',
  html(s) {
    const n = s.count || 8, R = rng(hashStr(JSON.stringify(s)) + 5), kind = s.kind || 'hearts';
    const icon = { hearts: 'heart', stars: 'star', sparkles: 'sparkle', question: 'question', zzz: 'zzz', sweat: 'sweat', music: 'music', money: 'coin', broken: 'broken_heart', fire: 'fire' }[kind] || kind;
    el_ps = [];
    let h = '';
    for (let i = 0; i < n; i++) { const z = (s.size || 70) * (.6 + R() * .7); const x = (s.x ?? 540) + (R() - .5) * (s.spread || 500); const y = (s.y ?? 900) + (R() - .5) * (s.spread || 500) * .4; h += `<div class="sub" data-ph="${R().toFixed(3)}" data-x="${x}" data-y="${y}" style="position:absolute;left:${x - z / 2}px;top:${y - z / 2}px;width:${z}px;height:${z}px">${ICON.svg(icon, { color: col(s.color) })}</div>`; }
    return `<div style="position:absolute;left:0;top:0;width:1080px;height:1404px">${h}</div>`;
  },
  frame(el, lt) { const rise = el.spec.rise || 260, per = el.spec.period || 2.2; el.subs = el.subs || [...el.node.querySelectorAll('.sub')]; el.subs.forEach(d => { const ph = +d.dataset.ph; const q = ((lt / per) + ph) % 1; const on = lt > ph * .6; d.style.opacity = on ? Math.sin(q * Math.PI) : 0; d.style.transform = `translate(${Math.sin((q + ph) * 6.28) * 24}px, ${-q * rise}px) scale(${.7 + .5 * Math.sin(q * Math.PI)}) rotate(${(ph - .5) * 40}deg)`; }); return {}; } };
/* ---------- external image (AI-generated character, product photo, screenshot) ---------- */
C.image = { sfx: 'pop', autoPos: true,
  html(s) {
    const w = s.w || 500, h = s.h ? `height:${s.h}px;` : '';
    const st = s.sticker !== false ? 'filter:drop-shadow(5px 0 0 #fff) drop-shadow(-5px 0 0 #fff) drop-shadow(0 5px 0 #fff) drop-shadow(0 -5px 0 #fff) drop-shadow(4px 0 0 #1c1a1f) drop-shadow(-4px 0 0 #1c1a1f) drop-shadow(0 4px 0 #1c1a1f) drop-shadow(0 -4px 0 #1c1a1f) drop-shadow(10px 10px 0 #1c1a1f);' : '';
    const frame = s.frame ? `border:7px solid ${INK};border-radius:${s.round ? '50%' : '22px'};box-shadow:12px 12px 0 ${INK};object-fit:cover;` : '';
    return `<img src="${esc(s.src)}" style="display:block;width:${w}px;${h}${frame || st}${s.round && !s.frame ? 'border-radius:50%;' : ''}">`;
  } };
/* ---------- shapes / panels ---------- */
C.shape = { sfx: false,
  html(s) { const w = s.w || 300, h = s.h || 300; return `<div style="width:${w}px;height:${h}px;background:${col(s.color, '#ffffff')};border:${s.border ?? 6}px solid ${INK};border-radius:${s.shape === 'circle' ? '50%' : (s.radius ?? 24) + 'px'};${s.shadow === false ? '' : `box-shadow:12px 12px 0 ${INK};`}"></div>`; } };
/* ---------- comic emphasis lines around a point ---------- */
C.emph = { sfx: false, defEnter: 'fade',
  html(s) { const n = s.count || 18, r1 = s.r1 || 170, r2 = s.r2 || 260, c = col(s.color, INK); let d = ''; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + .1; d += `M${(Math.cos(a) * r1).toFixed(1)} ${(Math.sin(a) * r1).toFixed(1)} L${(Math.cos(a) * r2).toFixed(1)} ${(Math.sin(a) * r2).toFixed(1)} `; } return `<svg width="${r2 * 2}" height="${r2 * 2}" viewBox="${-r2} ${-r2} ${r2 * 2} ${r2 * 2}" style="overflow:visible"><path d="${d}" stroke="${c}" stroke-width="${s.width || 9}" stroke-linecap="round"/></svg>`; },
  frame: (el, lt) => ({ s: 1 + .04 * Math.sin(lt * 18) }) };
/* ---------- VS split background ---------- */
C.versus = { sfx: 'boom', anchor: 'none', defEnter: 'none',
  html(s) {
    const L = col((s.left || {}).color, PAL.blue), Rr = col((s.right || {}).color, PAL.pink);
    const lab = (o, x, c) => o && o.label ? `<div style="position:absolute;left:${x}px;top:${s.labelY || 520}px;transform:translateX(-50%) rotate(-3deg)">${C.tag.html({ text: o.label, color: 'white', size: 46 })}</div>` : '';
    return `<div class="vsL" style="position:absolute;left:0;top:0;width:1080px;height:1404px;background:${L};clip-path:polygon(0 0,58% 0,42% 100%,0 100%)"></div><div class="vsR" style="position:absolute;left:0;top:0;width:1080px;height:1404px;background:${Rr};clip-path:polygon(58% 0,100% 0,100% 100%,42% 100%)"></div><svg width="1080" height="1404" style="position:absolute;left:0;top:0"><path d="M626 0 L454 1404" stroke="${INK}" stroke-width="14"/></svg>${s.vs !== false ? `<div class="vsb" style="position:absolute;left:540px;top:${s.vsY || 900}px;transform:translate(-50%,-50%)"><div class="txt" style="font-family:Bangers;font-size:170px;color:${PAL.yellow};-webkit-text-stroke:16px ${INK};text-shadow:12px 12px 0 ${INK}">VS</div></div>` : ''}${lab(s.left, 270)}${lab(s.right, 810)}`;
  },
  frame(el, lt) { const p = easeOutCubic(clamp01(lt / .4)); el.l = el.l || el.node.querySelector('.vsL'); el.r = el.r || el.node.querySelector('.vsR'); el.l.style.transform = `translateX(${(1 - p) * -700}px)`; el.r.style.transform = `translateX(${(1 - p) * 700}px)`; const b = el.node.querySelector('.vsb'); if (b) { const q = clamp01((lt - .35) / .3); b.style.transform = `translate(-50%,-50%) scale(${q > 0 ? easeOutBack(q) * 1 : 0}) rotate(-8deg)`; } return {}; } };
/* ---------- big chapter numeral (used by part scenes, usable alone) ---------- */
C.number = { sfx: 'hit', autoPos: true, defEnter: 'slam',
  html(s) { const fs = s.size || 380; return `<div class="txt" style="font-family:Archivo;font-size:${fs}px;line-height:1;color:${col(s.color, INK)};-webkit-text-stroke:${fs * .045}px #fff;text-shadow:${fs * .035}px ${fs * .035}px 0 ${INK};letter-spacing:-4px">${esc(s.text || '01')}</div>`; } };

/* ---------- easing helpers (shared) ---------- */
function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
function easeOutBack(x) { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); }
function easeOutCubic(x) { return 1 - Math.pow(1 - x, 3); }
function easeInCubic(x) { return x * x * x; }
function easeOutBounce(x) { const n1 = 7.5625, d1 = 2.75; if (x < 1 / d1) return n1 * x * x; if (x < 2 / d1) return n1 * (x -= 1.5 / d1) * x + .75; if (x < 2.5 / d1) return n1 * (x -= 2.25 / d1) * x + .9375; return n1 * (x -= 2.625 / d1) * x + .984375; }
var el_ps;
G.POPC = { C, PAL, col, rich, esc, FONTS, autoText, rng, hashStr, clamp01, easeOutBack, easeOutCubic, easeInCubic, easeOutBounce, INK };
G.clamp01 = clamp01; G.easeOutBack = easeOutBack; G.easeOutCubic = easeOutCubic;
})(typeof window !== 'undefined' ? window : globalThis);
