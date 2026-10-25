/* POP ICON SET — ICON.svg(name, {color, color2}) -> <svg viewBox="0 0 200 200">.
 * Thick ink outline + flat fill + white glint, same language as the characters. */
(function (G) {
const K = '#1c1a1f', W = 9;
const p = (d, f, sw = W) => `<path d="${d}" fill="${f}" stroke="${K}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>`;
const l = (d, sw = W, c = K) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`;
const c = (x, y, r, f, sw = W) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" stroke="${K}" stroke-width="${sw}"/>`;
const r = (x, y, w, h, rx, f, sw = W) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${f}" stroke="${K}" stroke-width="${sw}"/>`;
const glint = (d) => l(d, 8, '#ffffff');
const I = {
  heart: (a = '#ff4f7a') => p('M100 172 C30 122 18 72 50 50 C74 34 94 50 100 66 C106 50 126 34 150 50 C182 72 170 122 100 172 Z', a) + glint('M52 74 C50 84 54 94 60 100'),
  broken_heart: (a = '#ff4f7a') => p('M96 168 C30 120 18 72 50 50 C74 34 92 48 98 62 L86 92 L108 110 L92 140 Z', a) + p('M108 168 C170 120 182 72 150 50 C126 34 110 46 104 60 L120 92 L98 110 L114 140 Z', a),
  star: (a = '#ffd21f') => p('M100 18 L124 72 L182 76 L138 114 L152 172 L100 142 L48 172 L62 114 L18 76 L76 72 Z', a) + glint('M80 80 L90 70'),
  lightning: (a = '#ffd21f') => p('M116 14 L46 112 L94 112 L80 186 L154 82 L106 82 Z', a),
  question: (a = '#7ec8ff') => c(100, 100, 82, a) + `<text x="100" y="138" font-family="Archivo Black,Arial Black" font-size="118" text-anchor="middle" fill="#fff" stroke="${K}" stroke-width="7" paint-order="stroke">?</text>`,
  exclaim: (a = '#ff5a36') => c(100, 100, 82, a) + `<text x="100" y="140" font-family="Archivo Black,Arial Black" font-size="122" text-anchor="middle" fill="#fff" stroke="${K}" stroke-width="7" paint-order="stroke">!</text>`,
  magnifier: (a = '#ffd21f', b = '#cfefff') => l('M128 128 L178 178', 30) + l('M128 128 L178 178', 16, '#ff5a36') + c(86, 86, 60, a, 10) + c(86, 86, 44, b, 6) + glint('M60 72 C66 58 78 52 92 52'),
  phone: (a = '#2a2830', b = '#8fd6ff') => r(52, 14, 96, 172, 20, a) + r(64, 34, 72, 124, 8, b, 0) + c(100, 172, 6, '#fff', 0) + glint('M74 50 L74 90'),
  chat: (a = '#ffffff') => p('M30 40 L170 40 C178 40 182 44 182 52 L182 122 C182 130 178 134 170 134 L92 134 L52 170 L58 134 L30 134 C22 134 18 130 18 122 L18 52 C18 44 22 40 30 40 Z', a) + c(64, 88, 9, K, 0) + c(100, 88, 9, K, 0) + c(136, 88, 9, K, 0),
  lock: (a = '#ffd21f') => l('M62 92 L62 66 C62 22 138 22 138 66 L138 92', 16) + r(36, 88, 128, 96, 18, a) + c(100, 128, 12, K, 0) + l('M100 132 L100 156', 10),
  key: (a = '#ffd21f') => c(60, 100, 38, a) + c(60, 100, 12, '#fff', 6) + p('M96 88 L178 88 L178 112 L162 112 L162 132 L142 132 L142 112 L96 112 Z', a),
  gift: (a = '#ff4f7a', b = '#ffd21f') => r(26, 80, 148, 100, 10, a) + r(18, 56, 164, 34, 8, a) + p('M88 56 L112 56 L112 180 L88 180 Z', b, 7) + p('M100 56 C70 20 40 40 62 56 Z', b, 7) + p('M100 56 C130 20 160 40 138 56 Z', b, 7),
  money: (a = '#5ad17a') => r(14, 50, 172, 100, 12, a) + c(100, 100, 30, '#c8f5d4', 7) + `<text x="100" y="114" font-family="Archivo Black,Arial Black" font-size="40" text-anchor="middle" fill="${K}">¥</text>`,
  coin: (a = '#ffd21f') => c(100, 100, 78, a) + c(100, 100, 56, '#ffe577', 6) + `<text x="100" y="124" font-family="Archivo Black,Arial Black" font-size="70" text-anchor="middle" fill="${K}">¥</text>`,
  crown: (a = '#ffd21f') => p('M24 150 L18 54 L66 96 L100 34 L134 96 L182 54 L176 150 Z', a) + r(22, 146, 156, 30, 8, a) + c(100, 112, 10, '#ff4f7a', 6),
  trophy: (a = '#ffd21f') => p('M52 26 L148 26 L148 70 C148 112 124 132 100 132 C76 132 52 112 52 70 Z', a) + l('M52 46 C14 46 22 98 58 96', 10) + l('M148 46 C186 46 178 98 142 96', 10) + p('M88 132 L112 132 L116 160 L84 160 Z', a, 7) + r(56, 158, 88, 24, 6, a),
  fire: (a = '#ff5a36', b = '#ffd21f') => p('M100 184 C46 184 28 140 40 104 C50 76 74 66 72 30 C104 46 116 72 110 96 C124 88 128 74 126 62 C160 90 172 124 160 152 C150 172 128 184 100 184 Z', a) + p('M100 182 C76 182 68 160 74 144 C80 128 96 124 96 104 C116 118 132 136 126 158 C122 172 112 182 100 182 Z', b, 6),
  bomb: (a = '#2a2830') => c(92, 116, 66, a) + p('M124 52 L148 32 L164 48 L144 72 Z', '#888', 7) + l('M158 36 C168 22 178 22 186 12', 6) + glint('M60 92 C64 80 72 72 84 68'),
  balance: (a = '#ffd21f', b = '#ff5a36') => p('M92 40 L108 40 L114 168 L86 168 Z', b, 7) + p('M60 168 L140 168 L150 186 L50 186 Z', b, 7) + l('M24 64 L176 52', 10, a) + l('M24 64 L24 64', 2) + p('M4 112 L52 112 C48 132 8 132 4 112 Z', a, 7) + p('M148 100 L196 100 C192 120 152 120 148 100 Z', a, 7) + l('M28 64 L8 112 M28 64 L48 112', 4) + l('M172 52 L152 100 M172 52 L192 100', 4) + c(100, 58, 10, a, 6),
  clock: (a = '#ffffff') => c(100, 104, 78, a) + l('M100 104 L100 58', 10) + l('M100 104 L134 120', 10) + c(100, 104, 8, K, 0) + l('M66 22 L42 42 M134 22 L158 42', 12),
  gauge: (a = '#ffffff') => p('M16 140 C16 60 184 60 184 140 Z', a) + l('M36 132 C40 84 72 64 100 64', 16, '#5ad17a') + l('M100 64 C128 64 156 80 164 132', 16, '#ff5a36') + l('M100 136 L150 88', 9) + c(100 , 136, 12, K, 0),
  cage: (a = '#5ad17a') => p('M40 170 L40 86 C40 16 160 16 160 86 L160 170 Z', 'none', 8) + [60, 80, 100, 120, 140].map(x => l(`M${x} 40 L${x} 170`, 6)).join('') + r(28, 164, 144, 22, 6, a) + c(100, 20, 10, a, 6),
  bird: (a = '#ffffff') => p('M30 110 C60 80 90 100 110 90 C120 60 160 50 178 70 L158 78 C160 120 120 150 70 140 C50 136 36 126 30 110 Z', a) + p('M80 100 C90 70 120 60 140 50 C132 80 116 100 96 108 Z', '#7ec8ff', 6) + c(156, 68, 4, K, 0),
  check: (a = '#5ad17a') => c(100, 100, 82, a) + l('M58 102 L88 132 L144 70', 18, '#ffffff') + l('M58 102 L88 132 L144 70', 4),
  cross: (a = '#ff5a36') => l('M40 40 L160 160 M160 40 L40 160', 40) + l('M40 40 L160 160 M160 40 L40 160', 24, a),
  arrow_up: (a = '#5ad17a') => p('M100 14 L176 94 L130 94 L130 186 L70 186 L70 94 L24 94 Z', a),
  arrow_down: (a = '#ff5a36') => p('M100 186 L176 106 L130 106 L130 14 L70 14 L70 106 L24 106 Z', a),
  thumbs_up: (a = '#ffe0c7') => p('M70 92 L104 20 C122 18 130 34 124 56 L118 80 L168 80 C182 80 188 96 182 108 L168 168 C164 178 156 184 144 184 L70 184 Z', a) + r(18, 88, 50, 98, 8, '#7ec8ff'),
  eye: (a = '#ffffff', b = '#7ec8ff') => p('M10 100 C50 40 150 40 190 100 C150 160 50 160 10 100 Z', a) + c(100, 100, 38, b) + c(100, 100, 18, K, 0) + c(112, 88, 8, '#fff', 0),
  brain: (a = '#ff9ec4') => p('M100 40 C80 14 40 22 40 54 C14 60 12 100 30 112 C18 140 46 166 72 156 C84 180 116 180 128 156 C154 166 182 140 170 112 C188 100 186 60 160 54 C160 22 120 14 100 40 Z', a) + l('M100 40 L100 170 M60 80 C76 80 82 92 80 104 M140 80 C124 80 118 92 120 104 M56 130 C70 124 82 130 84 140 M144 130 C130 124 118 130 116 140', 6),
  battery: (a = '#5ad17a', lvl = .7) => r(14, 54, 160, 92, 14, '#ffffff') + r(174, 80, 14, 40, 4, K, 0) + `<rect x="28" y="68" width="${132 * lvl}" height="64" rx="6" fill="${a}"/>`,
  battery_low: (a = '#ff5a36') => r(14, 54, 160, 92, 14, '#ffffff') + r(174, 80, 14, 40, 4, K, 0) + `<rect x="28" y="68" width="26" height="64" rx="6" fill="${a}"/>`,
  target: (a = '#ff5a36') => c(100, 100, 82, '#ffffff') + c(100, 100, 56, a) + c(100, 100, 30, '#ffffff') + c(100, 100, 10, a, 0),
  shield: (a = '#7ec8ff') => p('M100 14 L176 42 C176 120 140 168 100 186 C60 168 24 120 24 42 Z', a) + glint('M52 56 L52 96'),
  mask: (a = '#ffffff') => p('M20 70 C60 40 140 40 180 70 C186 130 150 176 100 176 C50 176 14 130 20 70 Z', a) + p('M48 92 C60 80 80 82 86 98 C72 108 56 106 48 92 Z', K, 0) + p('M152 92 C140 80 120 82 114 98 C128 108 144 106 152 92 Z', K, 0) + l('M76 140 Q100 152 124 140', 7),
  rose: (a = '#ff4f7a') => l('M100 110 L100 190', 9, '#3caa5a') + p('M100 150 C80 140 66 150 62 166 C80 168 92 162 100 150 Z', '#5ad17a', 6) + c(100, 74, 46, a) + l('M80 66 C90 52 112 52 118 70 C116 86 96 90 90 78', 6),
  envelope: (a = '#ffffff') => r(16, 46, 168, 112, 12, a) + l('M20 52 L100 116 L180 52', 9) + I.heart('#ff4f7a').replace('<path', '<path transform="translate(70 92) scale(.3)"'),
  candle: (a = '#ffffff') => r(70, 80, 60, 104, 8, a) + p('M100 20 C120 44 118 66 100 70 C82 66 80 44 100 20 Z', '#ffd21f', 6) + l('M100 70 L100 80', 5),
  camera: (a = '#ffffff') => r(14, 56, 172, 118, 18, a) + p('M64 56 L76 32 L124 32 L136 56 Z', a, 8) + c(100, 114, 40, '#7ec8ff') + c(100, 114, 16, K, 0) + c(156, 80, 8, '#ff5a36', 0),
  mirror: (a = '#cfefff') => `<ellipse cx="100" cy="84" rx="64" ry="74" fill="#ffd21f" stroke="${K}" stroke-width="${W}"/><ellipse cx="100" cy="84" rx="46" ry="56" fill="${a}" stroke="${K}" stroke-width="6"/>` + r(88, 156, 24, 36, 6, '#ffd21f') + glint('M74 60 L90 44'),
  tag: (a = '#ffd21f') => p('M40 20 L120 20 L184 100 L120 180 L40 180 C26 180 18 172 18 158 L18 42 C18 28 26 20 40 20 Z', a) + c(56, 100, 12, '#fff', 6),
  dice: (a = '#ffffff') => r(24, 24, 152, 152, 28, a) + c(64, 64, 13, K, 0) + c(100, 100, 13, K, 0) + c(136, 136, 13, K, 0),
  gamepad: (a = '#b48cff') => p('M50 60 L150 60 C186 60 196 120 188 150 C180 176 152 172 136 140 L64 140 C48 172 20 176 12 150 C4 120 14 60 50 60 Z', a) + l('M52 100 L80 100 M66 86 L66 114', 9) + c(132, 96, 9, '#ff5a36', 5) + c(152, 112, 9, '#ffd21f', 5),
  ring: (a = '#ffd21f') => c(100, 120, 62, 'none', 18) + c(100, 120, 62, 'none', 8).replace(K, a) + p('M70 22 L130 22 L146 46 L100 78 L54 46 Z', '#cfefff', 8),
  sparkle: (a = '#ffd21f') => p('M100 10 C108 70 130 92 190 100 C130 108 108 130 100 190 C92 130 70 108 10 100 C70 92 92 70 100 10 Z', a),
  zzz: (a = '#7ec8ff') => `<g font-family="Archivo Black,Arial Black" fill="${a}" stroke="${K}" stroke-width="7" paint-order="stroke"><text x="30" y="170" font-size="80">Z</text><text x="90" y="110" font-size="62">Z</text><text x="138" y="60" font-size="46">Z</text></g>`,
  sweat: (a = '#7ec8ff') => p('M100 18 C70 80 50 110 50 136 C50 164 74 184 100 184 C126 184 150 164 150 136 C150 110 130 80 100 18 Z', a) + glint('M76 130 C76 146 84 156 94 160'),
  music: (a = '#b48cff') => l('M70 150 L70 40 L160 22 L160 132', 10) + `<ellipse cx="52" cy="152" rx="26" ry="20" fill="${a}" stroke="${K}" stroke-width="8"/><ellipse cx="142" cy="134" rx="26" ry="20" fill="${a}" stroke="${K}" stroke-width="8"/>`,
  idea: (a = '#ffd21f') => p('M100 16 C54 16 32 52 40 86 C46 112 70 122 70 146 L130 146 C130 122 154 112 160 86 C168 52 146 16 100 16 Z', a) + r(70, 146, 60, 22, 4, '#cccccc', 7) + r(80, 166, 40, 18, 6, '#999999', 7) + glint('M70 60 C74 46 84 40 96 38'),
  warning: (a = '#ffd21f') => p('M100 16 L188 176 L12 176 Z', a) + `<text x="100" y="160" font-family="Archivo Black,Arial Black" font-size="100" text-anchor="middle" fill="${K}">!</text>`,
  ban: (a = '#ff5a36') => c(100, 100, 80, '#ffffff', 0) + `<circle cx="100" cy="100" r="74" fill="none" stroke="${a}" stroke-width="22"/>` + l('M48 48 L152 152', 22, a) + c(100, 100, 85, 'none', 8),
  chart_up: (a = '#5ad17a') => r(14, 14, 172, 172, 16, '#ffffff') + l('M34 150 L76 108 L106 128 L162 60', 14, a) + p('M136 56 L168 52 L164 86 Z', a, 6),
  chart_down: (a = '#ff5a36') => r(14, 14, 172, 172, 16, '#ffffff') + l('M34 56 L76 98 L106 78 L162 146', 14, a) + p('M136 150 L168 154 L164 120 Z', a, 6),
  wine: (a = '#ff4f7a') => p('M50 20 L150 20 C150 80 130 104 100 104 C70 104 50 80 50 20 Z', '#ffffff') + p('M56 50 L144 50 C140 84 124 100 100 100 C76 100 60 84 56 50 Z', a, 0) + l('M100 104 L100 170 M64 176 L136 176', 10),
  bed: (a = '#7ec8ff') => r(14, 100, 172, 56, 10, a) + r(20, 74, 50, 30, 10, '#ffffff', 7) + l('M14 156 L14 182 M186 156 L186 182 M14 70 L14 156', 10),
  door: (a = '#ff9a3c') => r(46, 14, 108, 172, 8, a) + c(130, 104, 8, '#ffd21f', 5) + r(60, 30, 80, 50, 4, shadeLite(a), 5),
  footprints: (a = '#2a2830') => `<g fill="${a}"><ellipse cx="66" cy="140" rx="18" ry="28"/><ellipse cx="134" cy="70" rx="18" ry="28"/></g>`,
};
function shadeLite(h) { return h; }
const ALIASES = { love: 'heart', idea_bulb: 'idea', bulb: 'idea', q: 'question', ok: 'check', no: 'cross', x: 'cross', search: 'magnifier', talk: 'chat', msg: 'chat', price: 'tag', game: 'gamepad', up: 'arrow_up', down: 'arrow_down' };
function svg(name, o = {}) {
  const fn = I[name] || I[ALIASES[name]] || I.question;
  const args = [o.color, o.color2].filter(v => v !== undefined);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 -10 220 220" width="100%" height="100%" style="overflow:visible">${fn(...args)}</svg>`;
}
G.ICON = { svg, NAMES: Object.keys(I), ALIASES };
})(typeof window !== 'undefined' ? window : globalThis);
