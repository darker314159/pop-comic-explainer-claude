/* ============================================================
 * POP ENGINE — deterministic, frame-addressable renderer.
 *   POP.init(story, timing)   timing = output of tools/tts.py (or null -> estimated)
 *   POP.seek(t)               draw the frame at absolute time t (seconds)
 *   POP.duration, POP.cues    (sfx cue list for the audio mixer), POP.report(t) layout boxes
 * ============================================================ */
(function (G) {
const { C, PAL, col, rich, esc, clamp01, easeOutBack, easeOutCubic, easeInCubic, easeOutBounce, INK, autoText, hashStr } = POPC;
const STAGE_BOTTOM = 1404;
const SLOTS = {
  'top-left': [250, 540], 'top': [540, 540], 'top-right': [830, 540],
  'upper-left': [250, 710], 'upper': [540, 710], 'upper-right': [830, 710],
  'mid-left': [230, 890], 'center': [540, 900], 'mid-right': [850, 890],
  'low-left': [250, 1080], 'low': [540, 1080], 'low-right': [830, 1080],
  'bottom-left': [250, 1250], 'bottom': [540, 1250], 'bottom-right': [830, 1250],
};
const AUTO_ORDER = ['upper-left', 'upper-right', 'mid-left', 'mid-right', 'top-left', 'top-right', 'low-left', 'low-right', 'top', 'bottom-left', 'bottom-right', 'center'];
const CHAR_X = { 'far-left': 180, left: 290, 'center-left': 410, center: 540, 'center-right': 670, right: 790, 'far-right': 900 };
const CHAR_H = { XL: 1060, L: 900, M: 740, S: 560, XS: 380, XXS: 260 };
const BG = {
  cream: { c: '#f4ecdf', dot: '#f2b3c2' }, 'cream-blue': { c: '#f4ecdf', dot: '#b9d9f2' }, 'cream-yellow': { c: '#f4ecdf', dot: '#f3d677' }, paper: { c: '#f4ecdf', dot: 'transparent' },
  yellow: { c: '#ffd21f', dot: '#f2bd00', ray: 'rgba(170,120,0,.25)' }, pink: { c: '#ff5fa2', dot: '#ff7db5', ray: 'rgba(150,0,60,.18)' },
  blue: { c: '#7ec8ff', dot: '#9ad6ff', ray: 'rgba(0,60,130,.16)' }, orange: { c: '#ff6a3d', dot: '#ff8257', ray: 'rgba(130,30,0,.18)' },
  purple: { c: '#b48cff', dot: '#c3a2ff', ray: 'rgba(60,0,130,.16)' }, green: { c: '#4fd08a', dot: '#6bdc9d', ray: 'rgba(0,90,40,.16)' },
  red: { c: '#e8412c', dot: '#f2604c', ray: 'rgba(110,0,0,.2)' }, dark: { c: '#1f1d22', dot: 'transparent', grid: 1 }, navy: { c: '#232a3f', dot: 'transparent', grid: 1 },
  'light-pink': { c: '#ffe1ea', dot: '#ffb8cc' }, 'light-blue': { c: '#dff1ff', dot: '#b6dcff' }, 'light-green': { c: '#ddf7e8', dot: '#a9e8c4' }, 'light-yellow': { c: '#fff4c2', dot: '#ffe27a' },
};
const CHAP_COLORS = ['blue', 'pink', 'yellow', 'green', 'purple', 'orange', 'red', 'cobalt'];
const ENTER_DUR = { pop: .34, stamp: .26, slam: .32, 'slide-left': .38, 'slide-right': .38, 'slide-up': .38, 'slide-down': .38, drop: .55, fade: .3, grow: .4, spin: .45, rise: .45, none: 0, wipe: .4, zoom: .35 };

function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
function enterFx(kind, p) {   // p 0..1 -> transform deltas
  if (kind === 'none') return {};
  const q = clamp01(p);
  switch (kind) {
    case 'fade': return { o: q };
    case 'stamp': return { s: 1 + 1.4 * (1 - easeOutCubic(q)), o: clamp01(q * 3), r: (1 - q) * -14 };
    case 'slam': return { s: 1 + 2.2 * (1 - easeOutCubic(q)), o: clamp01(q * 4), r: (1 - q) * 12 };
    case 'slide-left': return { x: (1 - easeOutBack(q)) * -420, o: clamp01(q * 3) };
    case 'slide-right': return { x: (1 - easeOutBack(q)) * 420, o: clamp01(q * 3) };
    case 'slide-up': return { y: (1 - easeOutBack(q)) * 320, o: clamp01(q * 3) };
    case 'slide-down': return { y: (1 - easeOutBack(q)) * -320, o: clamp01(q * 3) };
    case 'rise': return { y: (1 - easeOutCubic(q)) * 500 };
    case 'drop': return { y: (1 - easeOutBounce(q)) * -700, o: clamp01(q * 4) };
    case 'grow': return { sy: easeOutBack(q), sx: 1 };
    case 'spin': return { s: easeOutBack(q), r: (1 - q) * -200, o: clamp01(q * 3) };
    case 'zoom': return { s: .2 + .8 * easeOutCubic(q), o: q };
    case 'wipe': return { clip: q };
    default: return { s: q <= 0 ? 0 : easeOutBack(q), o: clamp01(q * 4) };   // pop
  }
}
function loopFx(kind, lt, seed) {
  switch (kind) {
    case 'float': return { y: Math.sin(lt * 2.4 + seed) * 10 };
    case 'wiggle': return { r: Math.sin(lt * 5 + seed) * 3.5 };
    case 'pulse': return { s: 1 + .045 * Math.sin(lt * 7 + seed) };
    case 'shake': return { x: Math.sin(lt * 61 + seed) * 5, y: Math.cos(lt * 53) * 3 };
    case 'spin': return { r: lt * 90 };
    case 'bounce': return { y: -Math.abs(Math.sin(lt * 4.2 + seed)) * 22 };
    case 'swing': return { r: Math.sin(lt * 2.6 + seed) * 6 };
    case 'blink': return { o: (Math.floor(lt * 3) % 2) ? .35 : 1 };
    case 'heartbeat': { const k = (lt * 1.25) % 1; return { s: 1 + (k < .12 ? .12 * Math.sin(k / .12 * Math.PI) : k < .3 && k > .16 ? .07 * Math.sin((k - .16) / .14 * Math.PI) : 0) }; }
  }
  return {};
}

const POP = { story: null, scenes: [], duration: 0, cues: [], warnings: [] };
let ROOT, WORLD, SCN_LAYER, HDR, PROG, TITLE, SUB, PANEL_EDGE, TRANS, FLASH;

/* ---------- text helpers ---------- */
function stripMarks(s) { return String(s).replace(/[\[\]]/g, ''); }
function lineObj(l) { return typeof l === 'string' ? { text: l } : l; }
function hlMask(s) { const out = []; let on = false; for (const ch of String(s)) { if (ch === '[') { on = true; continue; } if (ch === ']') { on = false; continue; } out.push(on); } return out; }
const PUNCT = /[，,。．.！!？?；;：:、…—\-~～“”"‘’'（）()《》<>「」『』\s]/;
function chunkLine(text, maxLen) {          // -> [{s,e}] index ranges on the stripped text
  const raw = stripMarks(text); const n = raw.length; const parts = []; let st = 0;
  for (let i = 0; i < n; i++) if (/[，,。！!？?；;：:…]/.test(raw[i])) { if (i > st) parts.push([st, i + 1]); st = i + 1; }
  if (st < n) parts.push([st, n]);
  const vis = (a, b) => raw.slice(a, b).replace(new RegExp(PUNCT.source, 'g'), '').length;
  const out = []; let cur = null;
  for (const p of parts) {
    if (cur && vis(cur[0], p[1]) <= maxLen) cur[1] = p[1];
    else { if (cur) out.push(cur); cur = [p[0], p[1]]; }
  }
  if (cur) out.push(cur);
  const fin = [];
  for (const c of out) {            // hard-split overlong chunks
    let L = vis(c[0], c[1]);
    if (L <= maxLen + 2) { fin.push(c); continue; }
    const k = Math.ceil(L / maxLen); const step = (c[1] - c[0]) / k;
    for (let j = 0; j < k; j++) fin.push([Math.round(c[0] + j * step), Math.round(c[0] + (j + 1) * step)]);
  }
  return fin;
}
/* ---------- timing ---------- */
function charTimes(line, t0, t1, words) {   // time for each char of the stripped text
  const raw = stripMarks(line.text); const n = raw.length; const ts = new Array(n);
  if (words && words.length) {
    let pos = 0;
    for (const w of words) {
      const k = raw.indexOf(w.w, pos); if (k < 0) continue;
      for (let j = 0; j < w.w.length; j++) ts[k + j] = w.t0 + (w.t1 - w.t0) * j / w.w.length;
      pos = k + w.w.length;
    }
    let last = t0; for (let i = 0; i < n; i++) { if (ts[i] === undefined) ts[i] = last; last = ts[i]; }
  } else {
    const spoken = [...raw].map(ch => PUNCT.test(ch) ? 0.35 : 1); const tot = spoken.reduce((a, b) => a + b, 0) || 1; let acc = 0;
    for (let i = 0; i < n; i++) { ts[i] = t0 + (t1 - t0) * acc / tot; acc += spoken[i]; }
  }
  return ts;
}
function resolveAt(at, sc, def = 0) {
  if (at === undefined || at === null || at === '') return def;
  if (typeof at === 'number') return at;
  let s = String(at).trim(); let off = 0;
  const m = s.match(/^(.*?)([+-]\d*\.?\d+)$/); if (m && m[1] && !/^-?\d*\.?\d+$/.test(s)) { s = m[1]; off = parseFloat(m[2]); }
  if (/^-?\d*\.?\d+$/.test(s)) return parseFloat(s) + off;
  let r;
  if (/^L\d+e$/i.test(s)) { const L = sc.lines[parseInt(s.slice(1)) - 1]; r = L ? L.t1 : null; }
  else if (/^L\d+$/i.test(s)) { const L = sc.lines[parseInt(s.slice(1)) - 1]; r = L ? L.t0 : null; }
  else if (s === 'end') r = sc.dur;
  else if (s === 'start') r = 0;
  else if (/^w\d*:/.test(s)) {
    const nth = parseInt(s.slice(1)) || 1; const word = s.slice(s.indexOf(':') + 1); let cnt = 0;
    for (const L of sc.lines) { let k = -1; const raw = stripMarks(L.text); while ((k = raw.indexOf(word, k + 1)) >= 0) { cnt++; if (cnt === nth) { r = L.ct[k]; break; } } if (r != null) break; }
  }
  if (r === null || r === undefined) { POP.warnings.push(`scene ${sc.i + 1}: cannot resolve time "${at}" -> using ${def}`); return def; }
  return r + off;
}
/* ---------- init ---------- */
POP.init = function (story, timing) {
  POP.story = story; POP.warnings = []; POP.cues = [];
  const meta = story.meta || {};
  const chapters = (story.chapters || []).map((c, i) => Object.assign({ color: CHAP_COLORS[i % CHAP_COLORS.length] }, c));
  POP.chapters = chapters;
  const tsc = (timing && timing.scenes) || [];
  let T = 0;
  POP.scenes = (story.scenes || []).map((spec, i) => {
    const tm = tsc[i] || {};
    const lines = (spec.lines || []).map(lineObj);
    let lt = 0; const pre = spec.kind === 'part' ? 0.45 : 0.15;
    const L = lines.map((l, k) => {
      const tl = (tm.lines || [])[k];
      let t0, t1, words;
      if (tl) { t0 = tl.t0; t1 = tl.t1; words = tl.words; }
      else { const n = stripMarks(l.text).replace(new RegExp(PUNCT.source, 'g'), '').length; t0 = (k ? lt + 0.12 : pre); t1 = t0 + Math.max(0.8, n * 0.21 / (meta.speed || 1)); }
      lt = t1; return Object.assign({}, l, { t0, t1, words });
    });
    let dur = tm.dur || ((L.length ? L[L.length - 1].t1 : 0) + (meta.sceneTail ?? 0.45));
    if (spec.dur) dur = Math.max(dur, spec.dur);
    if (spec.kind === 'part' && !tm.dur) dur = Math.max(dur, 1.9);
    if (spec.pad) dur += spec.pad;
    if (!L.length && !spec.dur) dur = spec.kind === 'part' ? 1.6 : 2.0;
    const sc = { i, spec, lines: L, start: T, dur, chapter: spec.chapter ?? (i ? null : (chapters[0] || {}).id) };
    for (const l of L) { l.ct = charTimes(l, l.t0, l.t1, l.words); l.hl = hlMask(l.text); l.chunks = chunkLine(l.text, meta.subMax || 14).map(([a, b]) => ({ a, b, t0: l.ct[a] ?? l.t0 })); }
    T += dur; return sc;
  });
  // chapter inheritance
  let cur = chapters[0] ? chapters[0].id : null;
  for (const sc of POP.scenes) { if (sc.spec.chapter !== undefined) cur = sc.spec.chapter; else if (sc.spec.kind === 'part' && sc.spec.num) cur = sc.spec.num; sc.chapter = cur; }
  POP.duration = T + (meta.tail ?? 0.6);
  buildDOM(meta);
  POP.scenes.forEach(prepScene);
  POP.cues.sort((a, b) => a.t - b.t);
  return { duration: POP.duration, warnings: POP.warnings, scenes: POP.scenes.map(s => ({ start: s.start, dur: s.dur })) };
};
function buildDOM(meta) {
  ROOT = document.getElementById('stage'); ROOT.innerHTML = '';
  WORLD = div('world', ROOT); WORLD.id = 'world';
  SCN_LAYER = div('layer', WORLD);
  const panel = div('', ROOT); panel.id = 'panel'; div('grid', panel); PANEL_EDGE = div('edge', panel);
  TITLE = div('', ROOT); TITLE.id = 'title';
  HDR = div('', ROOT); HDR.id = 'hdr';
  PROG = div('', ROOT); PROG.id = 'prog';
  SUB = div('', ROOT); SUB.id = 'sub';
  if (meta.subY) SUB.style.top = meta.subY + 'px';
  if (meta.watermark) { const w = div('', ROOT); w.style.cssText = 'position:absolute;right:40px;bottom:330px;font:28px NotoBlack;color:rgba(255,255,255,.35)'; w.textContent = meta.watermark; }
  TRANS = div('layer', ROOT); TRANS.style.pointerEvents = 'none';
  FLASH = div('layer', ROOT); FLASH.style.background = '#fff'; FLASH.style.opacity = 0;
}
function div(cls, parent) { const d = document.createElement('div'); if (cls) d.className = cls; parent.appendChild(d); return d; }
function bgHTML(bg, set) {
  const parts = String(bg || 'cream').split(/\s+/); const b = BG[parts[0]] || { c: col(parts[0], '#f4ecdf'), dot: 'transparent' };
  let h = `<div class="bg" style="background:${b.c}">`;
  if (set && G.SETS && SETS.resolve(set.name)) {   // illustrated environment replaces the flat background
    const dark = SETS.isDark(set.name);
    h += SETS.svg(set.name, set) + `<div class="haze" style="background:linear-gradient(180deg,${dark ? 'rgba(14,14,28,.62)' : 'rgba(255,250,240,.78)'} 0%,${dark ? 'rgba(14,14,28,.35)' : 'rgba(255,250,240,.45)'} 30%,transparent 42%)"></div>`;
    if (parts.includes('rays')) h += `<div class="rays" style="--rayc:rgba(255,255,255,.18)"></div>`;
    return h + `<div class="paper"></div></div>`;
  }
  if (parts.includes('sun')) h += `<div class="sun" style="--sun1:${b.c};--sun2:${b.dot}"></div>`;
  if (parts.includes('rays') || (b.ray && !parts.includes('flat') && !parts.includes('sun'))) h += `<div class="rays" style="--rayc:${b.ray || 'rgba(0,0,0,.06)'}"></div>`;
  if (b.grid || parts.includes('grid')) h += `<div class="grid"></div>`;
  if (b.dot !== 'transparent' && !parts.includes('flat')) h += `<div class="dots" style="--dotc:${b.dot}"></div>`;
  h += `<div class="paper"></div></div>`;
  return h;
}
function charHead(e) { return { x: e._x, y: (e._y ?? STAGE_BOTTOM + 8) - 8 - e._h * 0.70, r: e._h * 0.2 }; }
function prepScene(sc) {
  const spec = sc.spec; const meta = POP.story.meta || {};
  sc.node = div('layer', SCN_LAYER); sc.node.style.display = 'none';
  let bg = spec.bg; if (spec.kind === 'part' && !bg) { const ch = POP.chapters.find(c => c.id === (spec.num || sc.chapter)); bg = (spec.color || (ch && ch.color) || 'yellow') + ' rays'; }
  const setSpec = spec.set ? (typeof spec.set === 'string' ? { name: spec.set, flip: /\bflip\b/.test(spec.set) } : spec.set) : null;
  if (setSpec && !(G.SETS && SETS.resolve(setSpec.name))) POP.warnings.push(`scene ${sc.i + 1}: unknown set "${setSpec.name}"`);
  sc.node.innerHTML = bgHTML(bg || 'cream', setSpec);
  sc.hasSet = !!(setSpec && G.SETS && SETS.resolve(setSpec.name));
  sc.bgDark = sc.hasSet ? SETS.isDark(setSpec.name) : /^(dark|navy)/.test(bg || '');
  sc.els = [];
  let elems = (spec.elements || []).slice();
  sc.partN = 0; if (spec.kind === 'part') { const pe = partElements(spec, sc); sc.partN = pe.length; elems = pe.concat(elems); }
  // pass 1: chars (positions needed for auto layout)
  const used = new Set(); const heads = [];
  elems.forEach((e, k) => {
    if (e.type !== 'char') return;
    e._h = typeof e.size === 'number' ? e.size : (CHAR_H[e.size || (elems.filter(x => x.type === 'char').length > 1 ? 'M' : 'L')] || 900);
    e._w = e._h * 400 / 640;
    e._x = typeof e.x === 'number' ? e.x : (CHAR_X[e.pos || e.x || 'center'] ?? 540);
    e._y = typeof e.y === 'number' ? e.y : STAGE_BOTTOM + 8;
    e._acts = (e.acts || []).map(a => Object.assign({}, a, { _t: resolveAt(a.at, sc) }));
    e._acts.forEach(a => { if (a._t > sc.dur - 0.2) POP.warnings.push(`scene ${sc.i + 1}: char act at=${a.at} -> ${a._t.toFixed(2)}s exceeds scene length ${sc.dur.toFixed(2)}s`); });
    heads.push(charHead(e));
  });
  for (const h of heads) for (const [k, p] of Object.entries(SLOTS)) if (Math.hypot(p[0] - h.x, p[1] - h.y) < h.r * 1.25 || (Math.abs(p[0] - h.x) < h.r * 1.0 && p[1] > h.y)) used.add(k);
  const hasTitle = !!(spec.title || spec.kind === 'part');
  if (hasTitle) { used.add('top-left'); used.add('top'); used.add('top-right'); }
  elems.forEach((e, k) => {
    const comp = C[e.type]; if (!comp) { POP.warnings.push(`scene ${sc.i + 1}: unknown element type "${e.type}" (skipped)`); return; }
    const el = { spec: e, comp, idx: k, sc };
    el.tIn = resolveAt(e.at, sc, 0);
    el.tOut = e.out !== undefined ? resolveAt(e.out, sc, sc.dur) : Infinity;
    if (el.tIn > sc.dur - 0.2) POP.warnings.push(`scene ${sc.i + 1}: element #${k + 1} (${e.type} "${e.text || e.who || ''}") at=${e.at} -> ${el.tIn.toFixed(2)}s, but scene only lasts ${sc.dur.toFixed(2)}s (will never be seen)`);
    else if (el.tIn > sc.dur - 0.6 && e.type !== 'particles') POP.warnings.push(`scene ${sc.i + 1}: element #${k + 1} (${e.type} "${e.text || e.who || e.name || ''}") appears at ${el.tIn.toFixed(2)}s and is only visible for ${(sc.dur - el.tIn).toFixed(2)}s (too short; make it earlier or add "pad": 0.5 to the scene)`);
    el.enter = e.enter || comp.defEnter || (e.type === 'char' ? 'rise' : 'pop');
    el.exit = e.exit || 'pop';
    el.loop = e.loop || (e.type === 'char' ? '' : comp.rot ? '' : '');
    // position
    let x, y;
    if (e.type === 'char') { x = e._x; y = e._y; }
    else if (typeof e.x === 'number' || typeof e.y === 'number') { x = e.x ?? 540; y = e.y ?? 900; }
    else if (e.pos && /^head-/.test(e.pos)) {
      const ce = elems.find(z => z.type === 'char' && (!e.of || z.id === e.of)); const h = ce ? charHead(ce) : { x: 540, y: 800, r: 180 };
      const side = e.pos.slice(5); x = h.x + (side === 'left' ? -h.r * 1.75 : side === 'right' ? h.r * 1.75 : 0); y = h.y + (side === 'top' ? -h.r * 1.55 : -h.r * .35);
    }
    else if (e.pos && SLOTS[e.pos]) { [x, y] = SLOTS[e.pos]; used.add(e.pos); }
    else if (comp.autoPos) { const slot = AUTO_ORDER.find(s => !used.has(s)) || 'center'; used.add(slot); [x, y] = SLOTS[slot]; e._slot = slot; }
    else { [x, y] = SLOTS.center; }
    if (e.dx) x += e.dx; if (e.dy) y += e.dy;
    el.x = x; el.y = y;
    el.rot = e.rot ?? (comp.rot ? ((hashStr(e.text || k) % 9) - 4) : 0);
    el.scale = e.scale ?? 1;
    el.anchor = e.anchor || comp.anchor || 'center';
    // motion: "move": {to:[x,y] | "slot", by:[dx,dy], at, dur, arc, rot, scale, ease}  (or an array of moves, chained)
    el.moves = []; let fx0 = x, fy0 = y;
    for (const m of [].concat(e.move || [])) {
      if (!m) continue;
      let tx = fx0, ty = fy0;
      if (Array.isArray(m.to)) [tx, ty] = m.to; else if (typeof m.to === 'string' && SLOTS[m.to]) [tx, ty] = SLOTS[m.to];
      else if (typeof m.to === 'string' && CHAR_X[m.to] !== undefined) tx = CHAR_X[m.to];
      if (Array.isArray(m.by)) { tx = fx0 + m.by[0]; ty = fy0 + m.by[1]; }
      const mv = { t0: resolveAt(m.at, sc, el.tIn + .4), dur: m.dur ?? .7, fx: fx0, fy: fy0, tx, ty, arc: m.arc || 0, rot: m.rot || 0, scale: m.scale ?? 1, ease: m.ease || 'inOut' };
      if (mv.t0 > sc.dur - .2) POP.warnings.push(`scene ${sc.i + 1}: element #${k + 1} move at=${m.at} -> ${mv.t0.toFixed(2)}s exceeds scene length ${sc.dur.toFixed(2)}s`);
      el.moves.push(mv); fx0 = tx; fy0 = ty;
      if (m.sfx !== false) POP.cues.push({ t: sc.start + mv.t0, sfx: m.sfx || 'swish', gain: .6 });
    }
    el.endX = fx0; el.endY = fy0;
    // state changes for props: "acts": [{at, name|text|color|...}] -> re-render (icon rose -> wilted_rose, tag text change …)
    el.states = null;
    if (e.type !== 'char' && Array.isArray(e.acts) && e.acts.length) {
      let cur = Object.assign({}, e); el.states = [{ t: -1, spec: cur }];
      e.acts.map(a => Object.assign({}, a, { _t: resolveAt(a.at, sc) })).sort((a, b) => a._t - b._t).forEach(a => {
        const { at, _t, sfx: asfx, ...rest } = a; cur = Object.assign({}, cur, rest); el.states.push({ t: _t, spec: cur });
        if (_t > sc.dur - .2) POP.warnings.push(`scene ${sc.i + 1}: element #${k + 1} act at=${at} -> ${_t.toFixed(2)}s exceeds scene length ${sc.dur.toFixed(2)}s`);
        POP.cues.push({ t: sc.start + _t, sfx: asfx || 'pop2', gain: .7 });
      });
    }
    // items with own times (card/chat)
    if (Array.isArray(e.items)) e._itemT = e.items.map(it => (it && typeof it === 'object' && it.at !== undefined) ? resolveAt(it.at, sc) - el.tIn : null);
    const node = document.createElement('div'); node.className = 'el';
    node.style.zIndex = e.z ?? (e.type === 'char' ? 5 : e.type === 'versus' || e.type === 'spotlight' ? 2 : e.type === 'shape' ? 4 : 10);
    if (el.anchor === 'none') node.style.transformOrigin = '0 0';
    node.innerHTML = `<div class="inner">${comp.html(e, sc)}</div>`;
    sc.node.appendChild(node); el.node = node; el.inner = node.firstChild;
    sc.els.push(el);
    // sfx cue
    const sfx = e.sfx === undefined ? comp.sfx : e.sfx;
    if (sfx && !(e.type === 'char' && meta.charSfx === false)) POP.cues.push({ t: sc.start + el.tIn, sfx, gain: e.sfxGain ?? 1 });
    if (e.type === 'avatars') { const n = e.count || 12, st = e.stagger ?? .09; for (let j = 1; j < n; j += 2) POP.cues.push({ t: sc.start + el.tIn + j * st, sfx: 'pop', gain: .45 }); }
    if (e.type === 'card' || e.type === 'chat' || e.type === 'polaroids') (e.items || []).forEach((it, j) => { const tt = (e._itemT && e._itemT[j] != null) ? e._itemT[j] : (e.type === 'polaroids' ? j * (e.stagger ?? .3) : (e.type === 'chat' ? .3 + j * (e.stagger ?? .7) : .35 + j * (e.stagger ?? .45))); POP.cues.push({ t: sc.start + el.tIn + tt, sfx: e.type === 'chat' ? 'msg' : 'pop', gain: .7 }); });
    for (const a of (e._acts || [])) if (a.expr && e.type === 'char') POP.cues.push({ t: sc.start + a._t, sfx: a.sfx || 'boing', gain: .5 });
  });
  // title
  sc.titleAt = resolveAt(spec.title_at, sc, spec.kind === 'part' ? 0.55 : 0);
  if (spec.title) POP.cues.push({ t: sc.start + sc.titleAt, sfx: 'type', gain: .8 });
  for (const p of [].concat(spec.punch || [])) { sc.punches = sc.punches || []; const tt = resolveAt(p, sc); sc.punches.push(tt); POP.cues.push({ t: sc.start + tt, sfx: 'hit', gain: .8 }); }
  for (const p of [].concat(spec.shake || [])) { sc.shakes = sc.shakes || []; sc.shakes.push(resolveAt(p, sc)); }
  for (const p of [].concat(spec.flash || [])) { sc.flashes = sc.flashes || []; sc.flashes.push(resolveAt(p, sc)); }
  const tr = spec.transition || (spec.kind === 'part' ? 'stripes' : (sc.i === 0 ? 'wipe' : 'cut'));
  sc.transition = tr;
  if (tr !== 'cut' && tr !== 'none') POP.cues.push({ t: Math.max(0, sc.start - (tr === 'stripes' ? .25 : 0)), sfx: 'whoosh', gain: .9 });
  if (spec.kind === 'part') POP.cues.push({ t: sc.start + .38, sfx: 'hit', gain: 1 });
  // title html
  sc.titleHTML = titleHTML(spec, sc);
}
function partElements(spec, sc) {
  const ch = POP.chapters.find(c => c.id === (spec.num || sc.chapter)) || {};
  const num = spec.num || ch.id || '01'; const name = spec.name || ch.name || '';
  return [
    { type: 'text', text: spec.label || 'PART', font: 'num', size: 64, color: '#fff', stroke: 0, box: 'black', x: 300, y: 560, rot: -5, at: .25, enter: 'slide-left', sfx: false, track: 6 },
    { type: 'number', text: num, size: 400, x: 540, y: 800, rot: -4, at: .32, enter: 'slam', sfx: false },
  ];
}
function titleHTML(spec, sc) {
  const T = spec.kind === 'part' ? (spec.title || (POP.chapters.find(c => c.id === (spec.num || sc.chapter)) || {}).name || '') : spec.title;
  if (!T) return '';
  const style = spec.title_style || (spec.kind === 'part' ? 'white' : sc.bgDark ? 'white' : /^(yellow|pink|blue|orange|purple|green|red)/.test(spec.bg || '') ? 'white' : 'pop');
  const color = { pop: PAL.red, white: '#ffffff', dark: INK, yellow: PAL.yellow }[style] || col(style, PAL.red);
  const shadow = style === 'pop' ? PAL.yellow : style === 'white' ? INK : style === 'yellow' ? INK : '#ffffff';
  const hl = style === 'pop' ? INK : style === 'white' ? PAL.yellow : PAL.red;
  const mk = (txt, cls, fs) => {
    let on = false, h = '', k = 0;
    for (const ch of String(txt)) {
      if (ch === '[') { on = true; continue; } if (ch === ']') { on = false; continue; }
      h += `<span class="tch" data-k="${k++}" style="color:${on ? (style === 'pop' ? PAL.yellow : hl) : color};text-shadow:${fs * .055}px ${fs * .055}px 0 ${on && style === 'pop' ? PAL.red : shadow}">${ch === ' ' ? '&nbsp;' : esc(ch)}</span>`;
    }
    return `<span class="tline ${cls}" style="font-size:${fs}px">${h}</span>`;
  };
  const n1 = stripMarks(T).length; const fs1 = spec.title_size || (n1 <= 6 ? 128 : n1 <= 8 ? 112 : n1 <= 10 ? 92 : 80);
  let h = mk(T, 'ttl', fs1);
  if (spec.title2) { const n2 = stripMarks(spec.title2).length; h += mk(spec.title2, 'ttl ttl2', spec.title2_size || (n2 <= 8 ? 80 : 64)); }
  sc.titleTop = spec.kind === 'part' ? 1030 : (spec.title_y || 255);
  return h;
}
/* ---------- per-frame ---------- */
let CUR = -1;
POP.seek = function (t) {
  const S = POP.scenes; if (!S.length) return;
  let i = S.findIndex(s => t >= s.start && t < s.start + s.dur); if (i < 0) i = t < 0 ? 0 : S.length - 1;
  const sc = S[i]; const lt = t - sc.start;
  if (i !== CUR) {
    if (CUR >= 0) S[CUR].node.style.display = 'none';
    sc.node.style.display = 'block'; CUR = i;
    TITLE.innerHTML = sc.titleHTML; TITLE.style.top = sc.titleTop + 'px'; sc.tch = [...TITLE.querySelectorAll('.tch')];
    drawHeader(sc);
  }
  if (PROG._time && PROG._u) PROG._u.style.width = (100 * clamp01(t / Math.max(1, POP.duration))).toFixed(2) + '%';
  // elements
  for (const el of sc.els) drawEl(el, lt);
  // title per-char pop
  const tt = lt - sc.titleAt; const n = sc.tch.length;
  sc.tch.forEach((s, k) => {
    const p = clamp01((tt - k * 0.055) / 0.22);
    const wob = Math.sin(lt * 3 + k) * 1.2;
    s.style.opacity = p > 0 ? 1 : 0;
    s.style.transform = `scale(${p > 0 ? easeOutBack(p) : 0}) rotate(${(k % 2 ? 3 : -3) * (1 - p) + wob}deg) translateY(${Math.sin(lt * 2.2 + k * .7) * 2}px)`;
  });
  drawSub(sc, lt);
  // camera: punch / shake
  let z = 1, dx = 0, dy = 0;
  for (const p of sc.punches || []) { const q = lt - p; if (q >= 0 && q < .4) z += .06 * Math.sin(q / .4 * Math.PI) * (1 - q / .4 * .5); }
  for (const p of sc.shakes || []) { const q = lt - p; if (q >= 0 && q < .45) { const a = 14 * (1 - q / .45); dx += Math.sin(q * 90) * a; dy += Math.cos(q * 77) * a * .6; } }
  if (sc.spec.camera === 'push') z *= 1 + .035 * clamp01(lt / Math.max(1, sc.dur));
  WORLD.style.transform = `translate(${dx}px,${dy}px) scale(${z})`;
  let fl = 0; for (const p of sc.flashes || []) { const q = lt - p; if (q >= 0 && q < .25) fl = Math.max(fl, .85 * (1 - q / .25)); }
  FLASH.style.opacity = fl;
  drawTransition(t, i);
};
function drawEl(el, lt) {
  const n = el.node;
  if (lt < el.tIn || lt > el.tOut + .3) { n.style.display = 'none'; return; }
  n.style.display = 'block';
  const a = lt - el.tIn; const ed = el.spec.enterDur ?? ENTER_DUR[el.enter] ?? .34;
  let fx = ed > 0 ? enterFx(el.enter, a / ed) : {};
  if (lt > el.tOut) { const q = clamp01((lt - el.tOut) / .25); fx = el.exit === 'fade' ? { o: 1 - q } : el.exit === 'slide-left' ? { x: -700 * easeInCubic(q) } : el.exit === 'slide-right' ? { x: 700 * easeInCubic(q) } : el.exit === 'drop' ? { y: 900 * easeInCubic(q) } : { s: 1 - easeInCubic(q), o: 1 - q }; }
  const lp = el.spec.loop ? loopFx(el.spec.loop, a, el.idx) : {};
  let swapS = 1;
  if (el.states) {
    let si = 0; for (let k = 1; k < el.states.length; k++) if (lt >= el.states[k].t) si = k;
    if (el.curState !== si) { el.curState = si; el.inner.innerHTML = el.comp.html(el.states[si].spec, el.sc); el.subs = el.aps = null; }
    const q = lt - el.states[si].t; if (si > 0 && q < .32) swapS = 1 + .28 * Math.sin(q / .32 * Math.PI);
  }
  const cf = el.comp.frame ? (el.comp.frame(el, a) || {}) : {};
  let bx = el.x, by = el.y, mr = 0, ms = 1;
  for (const m of el.moves || []) {
    if (lt <= m.t0) break;
    const q = clamp01((lt - m.t0) / Math.max(.01, m.dur));
    const p = m.ease === 'linear' ? q : m.ease === 'out' ? 1 - Math.pow(1 - q, 3) : m.ease === 'in' ? q * q * q : (q < .5 ? 4 * q * q * q : 1 - Math.pow(-2 * q + 2, 3) / 2);
    bx = m.fx + (m.tx - m.fx) * p; by = m.fy + (m.ty - m.fy) * p - m.arc * Math.sin(Math.PI * p); mr += m.rot * p; ms *= 1 + (m.scale - 1) * p;
  }
  const x = bx + (fx.x || 0) + (lp.x || 0) + (cf.dx || 0), y = by + (fx.y || 0) + (lp.y || 0) + (cf.dy || 0);
  const s = el.scale * ms * swapS * (fx.s ?? 1) * (lp.s ?? 1) * (cf.s ?? 1);
  const sx = s * (fx.sx ?? 1) * (cf.sx ?? 1), sy = s * (fx.sy ?? 1) * (cf.sy ?? 1);
  const r = el.rot + mr + (fx.r || 0) + (lp.r || 0) + (cf.r || 0);
  const o = (fx.o ?? 1) * (lp.o ?? 1) * (el.spec.opacity ?? 1);
  if (el.anchor === 'none') n.style.transform = `translate(${(fx.x || 0) + (lp.x || 0)}px,${(fx.y || 0) + (lp.y || 0)}px)`;
  else {
    const ay = el.anchor === 'bottom' ? '-100%' : el.anchor === 'top' ? '0%' : '-50%';
    n.style.transformOrigin = el.anchor === 'bottom' ? '50% 100%' : el.anchor === 'top' ? '50% 0%' : '50% 50%';
    n.style.transform = `translate(${x}px,${y}px) translate(-50%,${ay}) rotate(${r}deg) scale(${sx},${sy})`;
    n.style.left = '0px'; n.style.top = '0px';
  }
  if (fx.clip !== undefined) n.style.clipPath = `inset(0 ${100 - fx.clip * 100}% 0 0)`; else if (n.style.clipPath) n.style.clipPath = '';
  n.style.opacity = o;
}
const SCENE_EDGE = ['blue', 'pink', 'yellow', 'green', 'purple', 'orange'];
function drawHeader(sc) {
  const meta = POP.story.meta || {}; const ch = POP.chapters.find(c => c.id === sc.chapter);
  if (meta.header === false) { HDR.innerHTML = ''; PROG.innerHTML = ''; return; }
  // pill: chapter (if chapters are used) -> scene "tag" -> meta.topic
  // black pill = meta.series (account / series name); without series it shows meta.topic, so the topic is never duplicated
  const series = meta.series || (!ch && meta.topic) || '心理拆解';
  const tagTxt = sc.spec.tag || (meta.series ? meta.topic : '');
  const pill = ch ? `<b>${esc(ch.id)}</b>${esc(ch.name || '')}` : (tagTxt && tagTxt !== series) ? esc(tagTxt) : '';
  HDR.innerHTML = `<span class="series">${esc(series)}</span>` + (pill ? `<span class="chap">${pill}</span>` : '');
  if (POP.chapters.length) {
    const ci = POP.chapters.indexOf(ch);
    PROG.innerHTML = POP.chapters.map((c, k) => `<i style="background:${k <= ci ? col(c.color) : '#4a4650'};${k === ci ? 'width:54px' : ''}"></i>`).join('');
    PROG._time = false;
  } else { PROG.innerHTML = `<i class="tbar" style="width:150px;background:#4a4650;position:relative;overflow:hidden"><u style="position:absolute;left:0;top:0;bottom:0;width:0;background:${PAL.yellow};border-radius:7px"></u></i>`; PROG._time = true; PROG._u = PROG.querySelector('u'); }
  PANEL_EDGE.style.background = col(ch ? ch.color : SCENE_EDGE[sc.i % SCENE_EDGE.length]);
  HDR.querySelector('.series').style.background = sc.bgDark ? '#fff' : INK; HDR.querySelector('.series').style.color = sc.bgDark ? INK : '#fff';
}
function drawSub(sc, lt) {
  if ((POP.story.meta || {}).subtitles === false) { SUB.innerHTML = ''; return; }
  let L = null, chunk = null;
  for (const l of sc.lines) { if (lt >= l.t0 - .05) L = l; }
  if (!L) { if (SUB._k !== '') { SUB.innerHTML = ''; SUB._k = ''; } return; }
  for (const c of L.chunks) if (lt >= c.t0 - .05) chunk = c;
  chunk = chunk || L.chunks[0];
  const key = sc.i + ':' + L.t0 + ':' + chunk.a;
  if (SUB._k === key) return; SUB._k = key;
  const raw = stripMarks(L.text); let h = '', on = false;
  for (let i = chunk.a; i < chunk.b; i++) {
    const ch = raw[i]; if (PUNCT.test(ch) && !/[“”"「」《》]/.test(ch)) continue;
    const hl = L.hl[i]; if (hl !== on) { h += hl ? '<span class="hl">' : '</span>'; on = hl; }
    h += esc(ch);
  }
  if (on) h += '</span>';
  SUB.innerHTML = h;
  const n = chunk.b - chunk.a; SUB.style.fontSize = (n > 15 ? 50 : 58) + 'px';
}
function drawTransition(t, i) {
  const S = POP.scenes; let html = '';
  // stripes (into part cards) : straddles the cut
  for (const k of [i, i + 1]) {
    const sc = S[k]; if (!sc) continue;
    const q = (t - (sc.start - .25)) / .55;
    if (sc.transition === 'stripes' && q >= 0 && q <= 1) {
      const e = easeInCubic(q) * 0.5 + easeOutCubic(q) * 0.5; const off = -1900 + e * 3800;
      const ch = POP.chapters.find(c => c.id === (sc.spec.num || sc.chapter)); const c2 = col(sc.spec.color || (ch && ch.color) || 'yellow');
      html += `<div style="position:absolute;left:-600px;top:-600px;width:2400px;height:3200px;transform:translateX(${-off}px) rotate(28deg);transform-origin:50% 50%"><div style="position:absolute;left:700px;top:0;width:260px;height:3200px;background:${INK}"></div><div style="position:absolute;left:960px;top:0;width:360px;height:3200px;background:${c2}"></div><div style="position:absolute;left:1320px;top:0;width:180px;height:3200px;background:${INK}"></div><div style="position:absolute;left:1500px;top:0;width:300px;height:3200px;background:${c2}"></div></div>`;
    }
    const qw = (t - sc.start) / .5;
    if (k === i && sc.transition === 'wipe' && qw >= 0 && qw <= 1) {
      const e = easeInCubic(qw) * .4 + easeOutCubic(qw) * .6; const x = e * 1700;
      html += `<div style="position:absolute;left:${-200 + x}px;top:-200px;width:1800px;height:2400px;transform:skewX(-14deg);background:#f4ecdf;border-left:22px solid ${PAL.yellow};box-shadow:-10px 0 0 ${INK}"></div>`;
    }
    if (k === i && sc.transition === 'flash') { const q2 = (t - sc.start) / .2; if (q2 >= 0 && q2 <= 1) html += `<div style="position:absolute;inset:0;background:#fff;opacity:${1 - q2}"></div>`; }
    if (k === i && sc.transition === 'zoom') { const q3 = clamp01((t - sc.start) / .35); WORLD.style.transform += ` scale(${1.18 - .18 * easeOutCubic(q3)})`; }
    if (k === i && sc.transition === 'slide') { const q4 = clamp01((t - sc.start) / .35); sc.node.style.transform = `translateX(${(1 - easeOutCubic(q4)) * 1080}px)`; }
  }
  if (TRANS._h !== html) { TRANS.innerHTML = html; TRANS._h = html; }
}
/* layout report for the validator (text-only QA) */
POP.report = function (t) {
  POP.seek(t); const sc = POP.scenes[CUR]; const out = [];
  for (const el of sc.els) {
    if (el.node.style.display === 'none' || el.anchor === 'none' || ['char', 'shape', 'versus', 'spotlight', 'particles', 'emph'].includes(el.spec.type) && el.spec.type !== 'char') continue;
    const r = el.inner.getBoundingClientRect();
    let box = { x0: r.left, y0: r.top, x1: r.right, y1: r.bottom };
    if (el.spec.type === 'char') { const h = charHead(el.spec); box = { x0: h.x - h.r * .95, y0: h.y - h.r * 1.05, x1: h.x + h.r * .95, y1: h.y + h.r * 1.0, face: true }; }
    if (el.idx < (sc.partN || 0)) continue;
    { const lt = t - sc.start; if (lt < el.tIn || lt > el.tOut) continue; }
    out.push(Object.assign({ type: el.spec.type, idx: el.idx - (sc.partN || 0), label: el.spec.text || el.spec.title || el.spec.name || el.spec.who || '' }, box));
  }
  let tr = null; for (const sp of TITLE.querySelectorAll('.tch')) { const q = sp.getBoundingClientRect(); if (!q.width) continue; tr = tr ? { left: Math.min(tr.left, q.left), top: Math.min(tr.top, q.top), right: Math.max(tr.right, q.right), bottom: Math.max(tr.bottom, q.bottom) } : { left: q.left, top: q.top, right: q.right, bottom: q.bottom }; }
  if (tr && TITLE.innerHTML) out.push({ type: 'title', idx: -1, label: sc.spec.title || '', x0: tr.left, y0: tr.top, x1: tr.right, y1: tr.bottom });
  const sr = SUB.getBoundingClientRect(); out.push({ type: 'subtitle', idx: -2, label: SUB.textContent, x0: sr.left, y0: sr.top, x1: sr.right, y1: sr.bottom });
  return { scene: CUR + 1, boxes: out };
};
G.POP = POP;
})(window);
