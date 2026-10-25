/* ============================================================
 * POP-COMIC CHARACTER KIT  (pure SVG, no external assets)
 * charSVG(opts) -> '<svg>…</svg>' half-body, viewBox 0 0 400 600
 *   opts.who   : preset id ('guy','guy2','guy3','girl','girl2','girl3','boss','auntie')
 *   opts.expr  : expression id (see EXPRESSIONS)
 *   opts.pose  : 'down'|'cross'|'chin'|'point'|'wave'|'cheer'|'shrug'|'phone'|'heart'
 *   opts.look  : -1..1 horizontal gaze,   opts.blink: 0..1 (1 = closed)
 *   any preset field can be overridden: hair, hairColor, skin, outfit, outfitColor, innerColor, eyeColor, lip
 * ============================================================ */
(function (G) {
const INK = '#1c1a1f';
const SW = 5.5;                      // main outline width
const PRESETS = {
  guy:   { sex: 'm', hair: 'swept',   hairColor: '#24222b', skin: '#ffe0c7', outfit: 'blazer', outfitColor: '#2f5fd0', innerColor: '#fffaf0', eyeColor: '#2b2530' },
  guy2:  { sex: 'm', hair: 'curtain', hairColor: '#3a2a22', skin: '#ffdcc2', outfit: 'hoodie', outfitColor: '#1f1d24', innerColor: '#ff4f9a', eyeColor: '#3a2a22' },
  guy3:  { sex: 'm', hair: 'spiky',   hairColor: '#ffd21f', skin: '#ffe0c7', outfit: 'tee',    outfitColor: '#7ec8ff', innerColor: '#ffffff', eyeColor: '#2b2530' },
  boss:  { sex: 'm', hair: 'slick',   hairColor: '#2a2a30', skin: '#ffd9bd', outfit: 'suit',   outfitColor: '#33333d', innerColor: '#ffffff', tie: '#e8412c', eyeColor: '#2b2530', glasses: true },
  girl:  { sex: 'f', hair: 'long',    hairColor: '#221f2a', skin: '#ffe4d0', outfit: 'cami',   outfitColor: '#ff5a36', innerColor: '#ffffff', eyeColor: '#6b3b2a', lip: '#e8414f' },
  girl2: { sex: 'f', hair: 'wavy',    hairColor: '#6b3a2a', skin: '#ffe6d6', outfit: 'blouse', outfitColor: '#ffffff', innerColor: '#ff7eb6', eyeColor: '#7a4a2e', lip: '#ef5a72' },
  girl3: { sex: 'f', hair: 'bob',     hairColor: '#1e1c26', skin: '#ffe4d0', outfit: 'knit',   outfitColor: '#b48cff', innerColor: '#ffffff', eyeColor: '#3a2f4a', lip: '#e8414f' },
  girl4: { sex: 'f', hair: 'pony',    hairColor: '#2a1f1c', skin: '#ffe2cc', outfit: 'tee',    outfitColor: '#ffd21f', innerColor: '#ffffff', eyeColor: '#5a3524', lip: '#ef5a72' },
};
const shade = (hex, k) => {           // k<1 darker, k>1 lighter
  const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  if (k < 1) { r *= k; g *= k; b *= k; } else { const t = k - 1; r += (255 - r) * t; g += (255 - g) * t; b += (255 - b) * t; }
  const c = v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return '#' + c(r) + c(g) + c(b);
};
const P = (d, fill, sw = SW, extra = '') => `<path d="${d}" fill="${fill}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round" ${extra}/>`;
const L = (d, sw = 4, col = INK, extra = '') => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const F = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const mirror = s => `<g transform="translate(400 0) scale(-1 1)">${s}</g>`;

/* ---------------- BODY / OUTFITS ---------------- */
const TORSO = 'M58 600 L62 392 C66 342 104 318 158 306 L180 300 L220 300 L242 306 C296 318 334 342 338 392 L342 600 Z';
function body(o) {
  const c = o.outfitColor, d = shade(c, .78), s = o.skin, sd = shade(s, .86), inner = o.innerColor;
  let out = '';
  // neck
  out += P('M176 236 L176 310 L224 310 L224 236 Z', s);
  out += F('M176 252 Q200 280 224 252 L224 282 Q200 298 176 282 Z', sd);
  if (o.outfit === 'cami') {
    out += P('M58 600 L62 392 C66 342 104 318 158 306 L180 300 L220 300 L242 306 C296 318 334 342 338 392 L342 600 Z', s);
    out += L('M168 330 Q184 338 196 334', 3, shade(s, .7)); out += L('M232 330 Q216 338 204 334', 3, shade(s, .7));
    out += P('M96 600 L100 410 Q150 384 200 400 Q250 384 300 410 L304 600 Z', c);
    out += F('M100 470 Q200 500 300 470 L304 600 L96 600 Z', d, 'opacity=".55"');
    out += L('M118 404 L136 318', 5); out += L('M282 404 L264 318', 5);
    out += L('M200 400 L200 430', 3, shade(c, .6));
  } else if (o.outfit === 'blouse') {
    out += P(TORSO, c);
    out += F('M62 470 C120 500 280 500 338 470 L342 600 L58 600 Z', shade(c, .9));
    out += P('M150 304 Q200 360 250 304 L262 316 Q200 392 138 316 Z', c, 4.5);
    out += P('M178 304 L200 346 L222 304 Z', s, 4);
    out += P('M200 346 L176 378 L156 352 Z', inner, 4); out += P('M200 346 L224 378 L244 352 Z', inner, 4);
    out += `<circle cx="200" cy="350" r="7" fill="${inner}" stroke="${INK}" stroke-width="4"/>`;
  } else if (o.outfit === 'knit') {
    out += P(TORSO, c);
    for (let x = 100; x <= 300; x += 26) out += L(`M${x} 420 L${x} 600`, 3, shade(c, .8));
    out += P('M156 306 Q200 344 244 306 L250 318 Q200 362 150 318 Z', shade(c, .85), 4.5);
  } else if (o.outfit === 'hoodie') {
    out += P(TORSO, c);
    out += P('M136 318 C136 282 264 282 264 318 C264 352 136 352 136 318 Z', d, 5);
    out += P('M160 312 Q200 336 240 312 Q200 322 160 312 Z', shade(c, .6), 3);
    out += L('M182 336 L178 420', 4, inner); out += L('M218 336 L222 420', 4, inner);
    out += `<rect x="172" y="418" width="12" height="16" rx="3" fill="${inner}" stroke="${INK}" stroke-width="3"/><rect x="216" y="418" width="12" height="16" rx="3" fill="${inner}" stroke="${INK}" stroke-width="3"/>`;
    out += P('M128 510 L272 510 L286 600 L114 600 Z', d, 4.5);
  } else if (o.outfit === 'tee') {
    out += P(TORSO, c);
    out += P('M162 304 Q200 336 238 304 L244 312 Q200 352 156 312 Z', shade(c, .82), 4);
    out += F('M62 480 C140 500 260 500 338 480 L342 600 L58 600 Z', shade(c, .9));
  } else { // blazer / suit
    out += P(TORSO, c);
    out += P('M164 304 L200 420 L236 304 Z', inner, 4.5);
    if (o.outfit === 'suit') { out += P('M192 322 L208 322 L214 400 L200 420 L186 400 Z', o.tie || '#e8412c', 3.5); out += P('M188 306 L212 306 L208 324 L192 324 Z', o.tie || '#e8412c', 3.5); }
    out += P('M164 304 L146 332 L172 356 L156 372 L200 460 L182 360 Z', shade(c, 1.08), 4.5);
    out += P('M236 304 L254 332 L228 356 L244 372 L200 460 L218 360 Z', shade(c, 1.08), 4.5);
    out += L('M200 460 L200 600', 3.5); out += `<circle cx="214" cy="500" r="5" fill="${INK}"/>`;
    out += F('M62 420 C70 360 100 336 130 328 L120 600 L58 600 Z', d, 'opacity=".45"');
  }
  if (o.outfit !== 'cami') {
    out += F('M254 308 C300 320 334 344 338 392 L342 600 L282 600 C290 500 286 420 254 308 Z', INK, 'opacity=".14"');
    out += L('M96 352 C110 334 130 324 150 318', 5, '#ffffff', 'opacity=".35"');
  } else out += F('M254 400 C280 396 296 404 300 410 L304 600 L270 600 C276 520 272 450 254 400 Z', INK, 'opacity=".12"');
  // arm seams (pose 'down')
  if (o.pose === 'down' || !o.pose) {
    if (o.outfit !== 'cami') { out += L('M104 404 C100 470 98 540 98 600', 4); out += L('M296 404 C300 470 302 540 302 600', 4); }
    else { out += L('M100 410 C96 470 94 540 94 600', 4); out += L('M300 410 C304 470 306 540 306 600', 4); }
  }
  return out;
}
/* ---------------- ARMS (poses) ---------------- */
function hand(x, y, r, skin, rot = 0) {
  return `<g transform="translate(${x} ${y}) rotate(${rot})">` +
    P(`M${-r} 0 C${-r} ${-r * 1.3} ${r} ${-r * 1.3} ${r} 0 C${r} ${r * 1.1} ${-r} ${r * 1.1} ${-r} 0 Z`, skin, 4.5) +
    L(`M${-r * .35} ${-r * .55} L${-r * .35} ${r * .2}`, 2.5) + L(`M${r * .15} ${-r * .6} L${r * .15} ${r * .2}`, 2.5) + `</g>`;
}
function arms(o) {
  const c = o.outfit === 'cami' ? o.skin : o.outfitColor, s = o.skin, pose = o.pose || 'down';
  const sl = o.outfit === 'cami' ? s : shade(c, .92);
  let out = '';
  if (pose === 'cross') {
    out += P('M74 420 C90 470 150 470 300 440 L306 482 C160 520 90 520 70 470 Z', sl, 5);
    out += P('M326 420 C310 470 250 476 100 452 L96 494 C240 524 316 516 330 470 Z', shade(sl, .95), 5);
    out += hand(306, 458, 20, s, -10); out += hand(96, 472, 20, s, 10);
  } else if (pose === 'chin') {          // forearm rises from bottom, fist under chin
    out += L('M104 404 C100 470 98 540 98 600', 4);
    out += P('M226 600 C230 500 226 400 216 318 L262 312 C276 400 282 500 284 600 Z', sl, 5);
    out += L('M232 560 L276 556', 3.5, shade(sl, .6));
    out += P('M206 300 C206 276 230 266 252 272 C272 278 276 300 266 318 C254 334 214 334 206 300 Z', s, 5);
    out += L('M216 290 C226 284 240 284 250 290', 3) + L('M218 304 C228 298 242 298 254 304', 3);
  } else if (pose === 'point') {         // arm stretches to screen-right, index finger points right
    out += L('M104 404 C100 470 98 540 98 600', 4);
    out += P('M300 396 C326 420 350 430 380 424 L384 462 C340 476 300 466 286 440 Z', sl, 5);
    out += `<g transform="translate(392 444)">` + P('M-14 -20 C4 -26 18 -18 20 -12 L58 -14 C68 -14 68 0 58 0 L22 2 C22 18 8 26 -10 22 C-20 18 -22 -14 -14 -20 Z', s, 4.5)
      + P('M-6 -20 C0 -32 16 -32 18 -20 Z', s, 4) + L('M-2 8 L16 8', 3) + `</g>`;
  } else if (pose === 'wave') {
    out += L('M104 404 C100 470 98 540 98 600', 4);
    out += P('M300 400 C330 350 350 280 344 210 L374 206 C384 290 362 370 330 430 Z', sl, 5);
    out += hand(360, 190, 26, s, 15);
  } else if (pose === 'cheer') {
    out += P('M100 400 C70 340 54 270 60 200 L30 196 C20 280 40 370 76 440 Z', sl, 5);
    out += P('M300 400 C330 340 346 270 340 200 L370 196 C380 280 360 370 324 440 Z', sl, 5);
    out += hand(46, 182, 24, s, -15); out += hand(354, 182, 24, s, 15);
  } else if (pose === 'shrug') {
    out += P('M96 410 C70 450 60 470 40 470 L36 440 C54 436 70 420 84 392 Z', sl, 5);
    out += P('M304 410 C330 450 340 470 360 470 L364 440 C346 436 330 420 316 392 Z', sl, 5);
    out += hand(28, 450, 22, s, -70); out += hand(372, 450, 22, s, 70);
  } else if (pose === 'phone') {         // holds phone in front of chest
    out += L('M104 404 C100 470 98 540 98 600', 4);
    out += P('M300 600 C296 540 280 500 256 476 L222 500 C246 520 258 556 260 600 Z', sl, 5);
    out += `<g transform="rotate(-10 226 440)"><rect x="194" y="378" width="66" height="112" rx="12" fill="#2a2830" stroke="${INK}" stroke-width="5"/><rect x="202" y="390" width="50" height="86" rx="6" fill="#8fd6ff"/><path d="M206 470 L248 400 L252 410 L214 474 Z" fill="#fff" opacity=".45"/></g>`;
    out += P('M214 468 C214 450 244 444 258 456 C270 470 262 492 242 496 C222 498 214 486 214 468 Z', s, 4.5);
    out += L('M222 466 L250 462', 3) + L('M224 480 L252 476', 3);
  } else if (pose === 'heart') {         // hugs a big heart at chest
    out += P('M70 430 C90 480 140 500 190 488 L186 452 C150 458 110 446 92 404 Z', sl, 5);
    out += P('M330 430 C310 480 260 500 210 488 L214 452 C250 458 290 446 308 404 Z', sl, 5);
    out += `<path d="M200 520 C130 470 120 410 160 396 C182 388 196 404 200 418 C204 404 218 388 240 396 C280 410 270 470 200 520 Z" fill="#ff4f7a" stroke="${INK}" stroke-width="6"/><path d="M160 412 C150 420 148 436 156 446" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".8"/>`;
    out += hand(186, 472, 20, s, 0) + hand(214, 472, 20, s, 0);
  }
  return out;
}
/* ---------------- HAIR ---------------- */
function hairBack(o) {
  const h = o.hairColor, hd = shade(h, .7);
  switch (o.hair) {
    case 'long': return P('M118 150 C96 230 100 340 70 470 C120 500 170 480 186 430 L214 430 C230 480 280 500 330 470 C300 340 304 230 282 150 Z', h) + F('M110 300 C104 380 92 430 80 466 C110 476 130 470 146 456 C136 400 132 340 136 290 Z', hd, 'opacity=".6"');
    case 'wavy': return P('M116 150 C90 220 110 270 86 330 C70 380 104 410 84 460 C130 490 176 470 184 430 L216 430 C224 470 270 490 316 460 C296 410 330 380 314 330 C290 270 310 220 284 150 Z', h) + F('M100 330 C92 380 110 420 92 456 C120 466 140 462 152 446 C140 400 150 360 132 320 Z', hd, 'opacity=".6"');
    case 'bob':  return P('M110 150 C92 210 96 270 108 300 C150 318 250 318 292 300 C304 270 308 210 290 150 Z', h);
    case 'pony': return P('M262 96 C330 90 350 170 330 260 C318 320 300 350 312 400 C280 380 270 330 280 270 C292 200 286 140 262 120 Z', h) + `<circle cx="272" cy="104" r="12" fill="#ff4f7a" stroke="${INK}" stroke-width="4"/>`;
  }
  return '';
}
// leaf-shaped hair lock from root (x0,y0) to tip (x1,y1); bend>0 curls to the right
function lock(x0, y0, x1, y1, w, bend, fill, sw = 4.5) {
  const mx = (x0 + x1) / 2 + bend, my = (y0 + y1) / 2;
  const d = `M${x0 - w} ${y0} Q${mx - w * .7} ${my} ${x1} ${y1} Q${mx + w * .7} ${my} ${x0 + w} ${y0}`;
  return F(d + ' Z', fill) + L(d, sw);   // open stroke: no line across the root
}
function hairFront(o) {
  const h = o.hairColor, hl = shade(h, 1.6), hd = shade(h, .72);
  const shine = (d) => L(d, 6, hl, 'opacity=".85"');
  const cap = (yb) => P(`M120 ${yb} C104 110 144 46 202 44 C262 44 302 110 282 ${yb} C270 140 240 118 200 118 C160 118 132 140 120 ${yb} Z`, h);
  let s = '';
  switch (o.hair) {
    case 'swept': // korean side-swept fringe
      s += P('M122 182 C100 110 134 36 206 34 C278 32 310 100 282 182 C276 150 266 128 252 118 C230 108 170 108 146 120 C134 134 126 156 122 182 Z', h);
      s += lock(150, 104, 138, 168, 16, -8, h) + lock(178, 100, 160, 160, 20, -10, h) + lock(210, 98, 186, 156, 22, -12, h) + lock(242, 100, 222, 146, 20, -8, h) + lock(268, 108, 262, 150, 14, 4, h);
      s += L('M120 176 L126 206', 5) + L('M280 176 L274 206', 5);
      s += shine('M160 62 C190 48 232 50 258 70') + shine('M146 84 C152 78 160 72 170 68');
      return s;
    case 'curtain': // middle part
      s += P('M120 186 C98 104 142 38 204 38 C266 38 306 104 280 186 C276 150 264 124 244 110 L200 100 L156 110 C136 124 124 150 120 186 Z', h);
      s += lock(196, 96, 150, 170, 22, -26, h) + lock(204, 96, 250, 170, 22, 26, h) + lock(176, 100, 134, 186, 16, -16, h) + lock(224, 100, 266, 186, 16, 16, h);
      s += shine('M150 70 C170 54 196 50 216 52') + shine('M238 62 C254 70 264 82 270 94');
      return s;
    case 'spiky':
      return P('M120 178 C104 140 106 112 112 96 L92 92 L122 74 L108 44 L146 58 L152 22 L182 52 L204 14 L220 52 L254 24 L254 62 L292 50 L276 84 L308 92 L284 110 C294 132 292 156 280 178 C272 150 262 134 248 124 L238 148 L222 128 L206 152 L192 126 L174 150 L166 126 L148 146 L146 126 C136 140 126 158 120 178 Z', h)
        + shine('M150 70 L170 62') + shine('M210 50 L232 52');
    case 'slick':
      return P('M124 172 C110 100 150 52 206 52 C262 52 298 96 280 172 C274 140 262 118 240 104 C210 92 170 98 150 116 C138 128 128 148 124 172 Z', h) + shine('M170 70 C200 60 240 64 262 84') + lock(232, 96, 250, 150, 7, 8, h, 3.5);
    case 'long': // air bangs + face-framing locks
      s += cap(196);
      s += lock(128, 140, 112, 330, 16, -16, h) + lock(272, 140, 288, 330, 16, 16, h);
      s += lock(146, 112, 132, 178, 14, -6, h) + lock(166, 106, 156, 160, 12, -4, h) + lock(186, 104, 182, 158, 12, -2, h) + lock(206, 104, 210, 156, 12, 2, h) + lock(228, 106, 236, 160, 12, 4, h) + lock(250, 112, 266, 176, 14, 6, h);
      s += shine('M150 70 C176 54 214 52 242 62') + shine('M136 96 C142 88 148 82 156 78');
      return s;
    case 'wavy':
      s += cap(198);
      s += P('M124 160 C104 210 128 246 110 288 C98 318 120 338 106 364 C138 352 148 326 140 298 C132 270 146 236 140 168 Z', h, 4.5);
      s += P('M276 160 C296 210 272 246 290 288 C302 318 280 338 294 364 C262 352 252 326 260 298 C268 270 254 236 260 168 Z', h, 4.5);
      s += lock(160, 104, 130, 180, 22, -18, h) + lock(196, 100, 160, 160, 22, -14, h) + lock(236, 104, 268, 176, 20, 14, h);
      s += shine('M160 64 C186 52 218 52 242 64');
      return s;
    case 'bob':
      s += P('M112 236 C92 120 140 44 202 44 C266 44 312 120 290 236 C286 200 280 176 272 158 L130 158 C122 176 116 200 112 236 Z', h);
      for (let i = 0; i < 7; i++) { const x = 134 + i * 22; s += lock(x, 120, x + (i - 3) * 2, 166, 13, (i - 3) * 1.5, h, 4); }
      s += shine('M150 72 C176 58 214 56 244 68');
      return s;
    case 'pony':
      s += cap(184);
      s += lock(126, 140, 118, 262, 12, -10, h, 4);
      s += lock(150, 110, 134, 176, 16, -10, h) + lock(180, 104, 168, 156, 16, -8, h) + lock(214, 104, 230, 150, 18, 10, h) + lock(248, 110, 270, 170, 16, 10, h);
      s += shine('M156 70 C180 56 214 54 240 64');
      return s;
  }
  return '';
}
/* ---------------- FACE ---------------- */
const FACE_M = 'M130 150 C128 196 142 230 168 252 C182 264 192 270 200 270 C208 270 218 264 232 252 C258 230 272 196 270 150 C270 100 240 76 200 76 C160 76 130 100 130 150 Z';
const FACE_F = 'M134 152 C132 198 146 232 172 254 C186 266 194 272 200 272 C206 272 214 266 228 254 C254 232 268 198 266 152 C266 102 238 78 200 78 C162 78 134 102 134 152 Z';
function ears(o) {
  const s = o.skin;
  const e = P('M134 170 C116 158 108 182 116 198 C121 208 130 210 138 204 Z', s, 5) + L('M124 178 C121 186 124 194 130 196', 3);
  return e + mirror(e) + (o.sex === 'f' ? `<circle cx="120" cy="214" r="6" fill="#ffd21f" stroke="${INK}" stroke-width="3"/><circle cx="280" cy="214" r="6" fill="#ffd21f" stroke="${INK}" stroke-width="3"/>` : '');
}
function eyeOpen(o, side, look, lid) {
  // drawn for the LEFT eye (screen-left), mirrored for right
  const f = o.sex === 'f', ec = o.eyeColor;
  const cx = 164, cy = 186;
  const w = f ? 25 : 23, top = f ? 30 : 20, bot = f ? 18 : 12;
  const shape = `M${cx - w} ${cy + 2} C${cx - w + 6} ${cy - top * .9} ${cx + w - 8} ${cy - top * .95} ${cx + w} ${cy - 5} C${cx + w - 6} ${cy + bot} ${cx - w + 8} ${cy + bot + 2} ${cx - w} ${cy + 2} Z`;
  const id = 'ec' + Math.random().toString(36).slice(2, 8);
  const lx = look * 7 * (side < 0 ? -1 : 1) + 2;
  const ir = f ? 15 : 12.5;
  let s = `<defs><linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(ec, .55)}"/><stop offset=".55" stop-color="${ec}"/><stop offset="1" stop-color="${shade(ec, 1.6)}"/></linearGradient></defs>`;
  s += `<clipPath id="${id}"><path d="${shape}"/></clipPath>`;
  s += F(shape, '#ffffff');
  s += `<g clip-path="url(#${id})">`;
  s += F(`M${cx - w} ${cy - top} L${cx + w} ${cy - top} L${cx + w} ${cy - top * .35} Q${cx} ${cy - top * .55} ${cx - w} ${cy - top * .35} Z`, '#d9d2e0', 'opacity=".7"');
  s += `<ellipse cx="${cx + lx}" cy="${cy + 1}" rx="${ir}" ry="${ir * (f ? 1.15 : 1.08)}" fill="url(#${id}g)" stroke="${shade(ec, .4)}" stroke-width="2.5"/>`;
  s += `<ellipse cx="${cx + lx}" cy="${cy + 1}" rx="${ir * .48}" ry="${ir * .55}" fill="${INK}"/>`;
  s += `<ellipse cx="${cx + lx + ir * .38}" cy="${cy - ir * .42}" rx="${f ? 5.2 : 4}" ry="${f ? 4.4 : 3.4}" fill="#fff"/><circle cx="${cx + lx - ir * .42}" cy="${cy + ir * .5}" r="${f ? 2.6 : 2}" fill="#fff" opacity=".9"/>`;
  if (lid > 0) s += F(`M${cx - w - 4} ${cy - top - 6} L${cx + w + 4} ${cy - top - 6} L${cx + w + 4} ${cy - top - 6 + (top + bot + 8) * lid} L${cx - w - 4} ${cy - top - 6 + (top + bot + 8) * lid} Z`, o.skin);
  s += `</g>`;
  // upper lid (thick), outer wing, lashes, crease
  const ly = lid > .05 ? (cy - top + (top + bot) * lid) : null;
  if (ly === null) {
    s += L(`M${cx - w - 2} ${cy + 3} C${cx - w + 6} ${cy - top * .95} ${cx + w - 8} ${cy - top} ${cx + w + 2} ${cy - 6}`, f ? 7 : 6);
    if (f) s += L(`M${cx - w + 8} ${cy - top * .8 - 4} C${cx - 2} ${cy - top - 4} ${cx + w - 12} ${cy - top - 2} ${cx + w - 6} ${cy - top * .55 - 4}`, 2, shade(o.skin, .62));
  } else s += L(`M${cx - w - 2} ${ly + 3} Q${cx} ${ly - 4} ${cx + w + 2} ${ly - 3}`, f ? 7 : 6);
  if (f) { // outer-corner lashes (screen-left eye: outer = left)
    s += L(`M${cx - w - 1} ${cy + 2} Q${cx - w - 8} ${cy - 2} ${cx - w - 13} ${cy - 10}`, 4.5);
    s += L(`M${cx - w + 4} ${cy - 10} Q${cx - w - 2} ${cy - 16} ${cx - w - 6} ${cy - 24}`, 3.5);
    s += L(`M${cx - w + 12} ${cy - 18} Q${cx - w + 8} ${cy - 26} ${cx - w + 6} ${cy - 32}`, 3);
    s += L(`M${cx - w + 8} ${cy + bot - 2} Q${cx} ${cy + bot + 4} ${cx + w - 6} ${cy + 6}`, 2.6, shade(o.skin, .45));
  } else s += L(`M${cx - w + 8} ${cy + bot - 1} Q${cx} ${cy + bot + 3} ${cx + w - 6} ${cy + 3}`, 2.4, shade(o.skin, .5));
  return s;
}
function eyes(o, ex, look, blink) {
  const f = o.sex === 'f';
  const both = (fn) => fn(-1) + mirror(fn(1));
  const cy = 186;
  if (blink > .85 || ex === 'happy' || ex === 'grin' || ex === 'laugh')
    return both(() => L(`M146 ${cy + 2} Q166 ${cy - 14} 186 ${cy + 2}`, 5.5) + (f ? L('M144 ' + (cy + 1) + ' L137 ' + (cy - 4), 3.5) : ''));
  if (ex === 'numb' || ex === 'tired') return both(() => L(`M146 ${cy - 2} L186 ${cy - 4}`, 5.5) + `<circle cx="168" cy="${cy + 4}" r="4.5" fill="${INK}"/>` + L(`M150 ${cy + 14} Q166 ${cy + 18} 182 ${cy + 12}`, 2.4, shade(o.skin, .6)));
  if (ex === 'shock' || ex === 'scared') return both(() => `<ellipse cx="166" cy="${cy}" rx="17" ry="19" fill="#fff" stroke="${INK}" stroke-width="5"/><circle cx="166" cy="${cy + 2}" r="4.5" fill="${INK}"/>`);
  if (ex === 'love') return both(() => `<path d="M166 ${cy + 12} C140 ${cy - 4} 150 ${cy - 22} 166 ${cy - 8} C182 ${cy - 22} 192 ${cy - 4} 166 ${cy + 12} Z" fill="#ff3d6e" stroke="${INK}" stroke-width="4.5"/><circle cx="160" cy="${cy - 6}" r="3" fill="#fff"/>`);
  if (ex === 'dizzy') return both(() => L(`M166 ${cy} m-3 0 a3 3 0 1 1 6 0 a7 7 0 1 1 -14 0 a11 11 0 1 1 22 0 a15 15 0 1 1 -30 0`, 3.5));
  if (ex === 'wink') return eyeOpen(o, -1, look, 0) + mirror(L(`M146 ${cy + 2} Q166 ${cy - 12} 186 ${cy + 2}`, 5.5));
  if (ex === 'cool') return `<path d="M128 166 L272 166 L268 182 C262 206 232 206 214 188 L186 188 C168 206 138 206 132 182 Z" fill="${INK}"/><path d="M146 172 L170 172 L160 190 Z" fill="#fff" opacity=".55"/><path d="M230 172 L254 172 L244 190 Z" fill="#fff" opacity=".55"/>`;
  let lid = blink;
  if (ex === 'smug' || ex === 'bored') lid = Math.max(lid, .42);
  if (ex === 'sad' || ex === 'cry') lid = Math.max(lid, .18);
  if (ex === 'angry') lid = Math.max(lid, .25);
  return eyeOpen(o, -1, look, lid) + mirror(eyeOpen(o, 1, look, lid));
}
function brows(o, ex) {
  const f = o.sex === 'f', w = f ? 5 : 8;
  let d;
  switch (ex) {
    case 'angry': d = 'M140 142 Q166 148 190 162'; break;
    case 'sad': case 'cry': case 'scared': d = 'M140 158 Q164 148 188 138'; break;
    case 'shock': d = 'M140 134 Q164 120 188 130'; break;
    case 'smug': case 'bored': d = 'M140 150 Q164 146 188 150'; break;
    case 'think': d = 'M140 146 Q164 134 188 142'; break;
    default: d = f ? 'M140 150 Q160 136 186 142' : 'M138 152 Q162 140 188 146';
  }
  let s = L(d, w);
  if (ex === 'think') return s + mirror(L('M140 154 Q164 150 188 154', w));
  return s + mirror(s);
}
function mouth(o, ex) {
  const f = o.sex === 'f', lip = o.lip || '#d9544f', y = f ? 238 : 236;
  switch (ex) {
    case 'smile': case 'happy': case 'love': case 'wink':
      return f ? P(`M186 ${y - 2} Q200 ${y + 12} 214 ${y - 2} Q200 ${y + 4} 186 ${y - 2} Z`, lip, 3.5) : L(`M184 ${y - 3} Q200 ${y + 10} 216 ${y - 3}`, 4.5);
    case 'grin': case 'laugh':
      return P(`M180 ${y - 6} Q200 ${y - 2} 220 ${y - 6} Q218 ${y + 20} 200 ${y + 20} Q182 ${y + 20} 180 ${y - 6} Z`, '#8a2133', 4) + F(`M184 ${y - 4} Q200 ${y - 1} 216 ${y - 4} L214 ${y + 3} Q200 ${y + 5} 186 ${y + 3} Z`, '#fff') + F(`M188 ${y + 14} Q200 ${y + 6} 212 ${y + 14} Q200 ${y + 20} 188 ${y + 14} Z`, '#ff7a8a');
    case 'shock': case 'scared':
      return `<ellipse cx="200" cy="${y + 6}" rx="9" ry="12" fill="#8a2133" stroke="${INK}" stroke-width="4"/>`;
    case 'sad': case 'cry':
      return L(`M186 ${y + 4} Q200 ${y - 6} 214 ${y + 4}`, 4.5);
    case 'angry':
      return P(`M184 ${y + 4} Q200 ${y - 6} 216 ${y + 4} Z`, '#8a2133', 4);
    case 'smug':
      return L(`M186 ${y} Q206 ${y + 6} 218 ${y - 8}`, 4.5);
    case 'numb': case 'bored': case 'tired':
      return L(`M188 ${y + 1} L212 ${y + 1}`, 4.5);
    case 'think':
      return L(`M190 ${y + 2} Q202 ${y - 2} 212 ${y + 3}`, 4);
    case 'cool':
      return L(`M186 ${y} Q204 ${y + 6} 216 ${y - 4}`, 4.5);
    case 'kiss':
      return P(`M196 ${y - 4} C190 ${y} 190 ${y + 8} 198 ${y + 8} C206 ${y + 8} 206 ${y} 200 ${y - 2}`, lip, 3.5);
    case 'dizzy':
      return L(`M184 ${y + 2} Q190 ${y - 4} 196 ${y + 2} Q202 ${y + 8} 208 ${y + 2} Q214 ${y - 4} 218 ${y + 2}`, 4);
    default:
      return f ? P(`M186 ${y - 1} Q193 ${y - 5} 200 ${y - 2} Q207 ${y - 5} 214 ${y - 1} Q200 ${y + 11} 186 ${y - 1} Z`, lip, 3) + F(`M193 ${y + 3} Q200 ${y + 5} 206 ${y + 3}`, '#fff', 'opacity=".5"') : L(`M188 ${y} Q200 ${y + 5} 212 ${y}`, 4.5);
  }
}
function cheeks(o, ex) {
  let s = '';
  const on = o.sex === 'f' || ['smile', 'happy', 'love', 'shy', 'laugh', 'grin', 'wink'].includes(ex);
  if (on) {
    const b = `<ellipse cx="150" cy="218" rx="17" ry="9" fill="#ff7c95" opacity="${ex === 'shy' || ex === 'love' ? .8 : .45}"/>` + L('M142 214 L138 222', 2.5, '#e8566f') + L('M150 214 L146 222', 2.5, '#e8566f') + L('M158 214 L154 222', 2.5, '#e8566f');
    s += b + mirror(b);
  }
  if (ex === 'cry') s += `<path d="M150 196 C146 216 140 236 150 246 C160 236 154 216 150 196 Z" fill="#6cc6ff" stroke="${INK}" stroke-width="3.5"/>` + mirror(`<path d="M150 196 C146 216 140 236 150 246 C160 236 154 216 150 196 Z" fill="#6cc6ff" stroke="${INK}" stroke-width="3.5"/>`);
  if (ex === 'scared' || ex === 'tired') s += L('M150 140 L150 166', 3, '#6f8cff') + L('M164 136 L164 160', 3, '#6f8cff') + L('M178 140 L178 162', 3, '#6f8cff');
  if (ex === 'angry') s += `<g transform="translate(272 96)" fill="none" stroke="#e8412c" stroke-width="6" stroke-linecap="round"><path d="M-14 -4 Q-6 -6 -4 -14"/><path d="M14 -4 Q6 -6 4 -14"/><path d="M-14 4 Q-6 6 -4 14"/><path d="M14 4 Q6 6 4 14"/></g>`;
  if (ex === 'sweat') s += `<path d="M276 120 C268 136 268 148 278 150 C288 148 286 136 276 120 Z" fill="#9fdcff" stroke="${INK}" stroke-width="3.5"/>`;
  return s;
}
function nose(o) { return o.sex === 'f' ? L('M198 212 Q203 216 206 212', 3.2) : L('M201 196 L196 214 Q200 218 206 215', 3.6); }
function glasses(o) {
  return `<g fill="none" stroke="${INK}" stroke-width="5"><rect x="140" y="160" width="54" height="40" rx="12"/><rect x="206" y="160" width="54" height="40" rx="12"/><path d="M194 176 L206 176"/></g><path d="M148 168 L162 168 L152 190 Z" fill="#fff" opacity=".6"/>`;
}
/* ---------------- ASSEMBLE ---------------- */
function charSVG(opts = {}) {
  const o = Object.assign({}, PRESETS[opts.who || 'guy'] || PRESETS.guy, opts);
  const ex = o.expr || 'neutral', look = o.look || 0, blink = o.blink || 0;
  o.pose = o.pose || 'down';
  const face = o.sex === 'f' ? FACE_F : FACE_M;
  const s = o.skin, sd = shade(s, .88);
  let svg = '';
  svg += hairBack(o);
  svg += body(o);
  const HK = o.headScale || 1.16;
  const head0 = svg.length;
  svg += ears(o);
  svg += P(face, s);
  svg += F('M138 166 C150 150 250 150 262 166 C252 156 150 156 138 166 Z', sd, 'opacity=".0"');
  svg += F(o.sex === 'f' ? 'M134 152 C150 168 180 176 200 176 C220 176 250 168 266 152 L266 140 L134 140 Z' : 'M130 150 C150 166 180 172 200 172 C220 172 250 166 270 150 L270 140 L130 140 Z', sd, 'opacity=".5"');
  svg += cheeks(o, ex);
  svg += eyes(o, ex, look, blink);
  svg += brows(o, ex);
  svg += nose(o);
  svg += mouth(o, ex);
  if (o.glasses && ex !== 'cool') svg += glasses(o);
  svg += hairFront(o);
  svg = svg.slice(0, head0) + `<g transform="translate(200 262) scale(${HK}) translate(-200 -262)">` + svg.slice(head0) + '</g>';
  svg += arms(o);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -40 400 640" width="100%" height="100%" style="overflow:visible">${svg}</svg>`;
}
/* round avatar head for crowds / profile bubbles */
function avatarSVG(opts = {}) {
  const ring = opts.ring || '#ffd21f';
  const inner = charSVG(Object.assign({ pose: 'down' }, opts)).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
  const id = 'av' + Math.random().toString(36).slice(2, 8);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%"><clipPath id="${id}"><circle cx="100" cy="100" r="88"/></clipPath><circle cx="100" cy="100" r="92" fill="${ring}" stroke="${INK}" stroke-width="7"/><g clip-path="url(#${id})"><circle cx="100" cy="100" r="88" fill="${opts.bg || '#fff3e0'}"/><g transform="translate(100 112) scale(.62) translate(-200 -200)">${inner}</g></g><circle cx="100" cy="100" r="88" fill="none" stroke="${INK}" stroke-width="6"/></svg>`;
}
G.CHAR = { charSVG, avatarSVG, PRESETS, shade, INK,
  EXPRESSIONS: ['neutral', 'smile', 'happy', 'grin', 'laugh', 'smug', 'cool', 'love', 'wink', 'shy', 'think', 'sad', 'cry', 'angry', 'shock', 'scared', 'numb', 'tired', 'bored', 'dizzy', 'sweat', 'kiss'],
  POSES: ['down', 'cross', 'chin', 'point', 'wave', 'cheer', 'shrug', 'phone', 'heart'] };
})(typeof window !== 'undefined' ? window : globalThis);
