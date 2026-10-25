/* POP SCENE SETS — illustrated environments drawn behind the characters (1080×1404 stage area).
 * SETS.svg(name, {flip, dim}) -> <svg>. Same language as characters/icons: ink outlines, flat fills, muted palette
 * so the foreground (characters, props, stickers) still pops. The centre (x 300~780) is kept calm for the character. */
(function (G) {
const K = '#1c1a1f', SW = 8;
const R = (x, y, w, h, f, rx = 0, sw = SW) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${f}" stroke="${sw ? K : 'none'}" stroke-width="${sw}"/>`;
const P = (d, f, sw = SW) => `<path d="${d}" fill="${f}" stroke="${sw ? K : 'none'}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>`;
const L = (d, sw = SW, c = K, extra = '') => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const C = (x, y, r, f, sw = SW) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" stroke="${sw ? K : 'none'}" stroke-width="${sw}"/>`;
const E = (x, y, rx, ry, f, sw = SW) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${f}" stroke="${sw ? K : 'none'}" stroke-width="${sw}"/>`;
const T = (x, y, s, f, txt, extra = '') => `<text x="${x}" y="${y}" font-size="${s}" fill="${f}" font-family="KuaiLe, HuangYou, sans-serif" text-anchor="middle" ${extra}>${txt}</text>`;
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const W = 1080, H = 1404;
const floor = (y, c, line = 'rgba(0,0,0,.10)', gap = 120) => R(-20, y, W + 40, H - y + 20, c) + Array.from({ length: Math.ceil(W / gap) + 1 }, (_, i) => L(`M${i * gap - 40} ${y + 6} L${i * gap - 140} ${H}`, 5, line)).join('');
const windowBox = (x, y, w, h, sky, inner = '', frame = '#ffffff', panes = 2) =>
  `<g><clipPath id="wc${x}_${y}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath>` + R(x, y, w, h, sky) +
  `<g clip-path="url(#wc${x}_${y})">${inner}</g>` + R(x, y, w, h, 'none', 0, 18).replace(`stroke="${K}"`, `stroke="${frame}"`) + R(x - 9, y - 9, w + 18, h + 18, 'none') +
  (panes > 1 ? L(`M${x + w / 2} ${y} L${x + w / 2} ${y + h}`, 14, frame) + L(`M${x} ${y + h * .5} L${x + w} ${y + h * .5}`, 14, frame) : '') + `</g>`;
const cloud = (x, y, s = 1, f = '#ffffff') => P(`M${x} ${y} c${-40 * s} 0 ${-46 * s} ${-44 * s} ${-8 * s} ${-50 * s} c${8 * s} ${-36 * s} ${62 * s} ${-40 * s} ${74 * s} ${-6 * s} c${30 * s} ${-14 * s} ${66 * s} ${4 * s} ${60 * s} ${36 * s} c${30 * s} ${4 * s} ${28 * s} ${20 * s} ${8 * s} ${20 * s} Z`, f, 6);
const plant = (x, y, s = 1, pot = '#ff9a3c', leaf = '#5fc47a') => `<g transform="translate(${x} ${y}) scale(${s})">` +
  P('M-40 -150 C-120 -190 -130 -260 -110 -300 C-60 -280 -30 -220 -10 -150 Z', leaf) + P('M10 -150 C40 -240 100 -270 130 -260 C130 -200 80 -160 20 -140 Z', leaf) + P('M-6 -150 C-30 -250 -10 -330 20 -360 C50 -300 40 -220 10 -150 Z', leaf) +
  P('M-70 -150 L70 -150 L54 0 L-54 0 Z', pot) + R(-80, -170, 160, 30, pot, 8) + `</g>`;
const lampTable = (x, y, shade = '#ffd21f', glow = false) => (glow ? `<circle cx="${x}" cy="${y - 190}" r="210" fill="url(#glow)"/>` : '') +
  R(x - 90, y, 180, 150, '#c98f62', 10) + L(`M${x - 60} ${y + 70} L${x + 60} ${y + 70}`, 6) + R(x - 12, y - 140, 24, 140, '#2a2830', 4) + P(`M${x - 80} ${y - 130} L${x + 80} ${y - 130} L${x + 50} ${y - 230} L${x - 50} ${y - 230} Z`, shade);
const frame = (x, y, w, h, c, inner = '') => R(x, y, w, h, '#ffffff', 6) + R(x + 16, y + 16, w - 32, h - 32, c, 2, 5) + inner;
const defs = `<defs><radialGradient id="glow"><stop offset="0" stop-color="#fff2a8" stop-opacity=".75"/><stop offset="1" stop-color="#fff2a8" stop-opacity="0"/></radialGradient>
<linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffcf9e"/><stop offset="1" stop-color="#ff9a7a"/></linearGradient>
<linearGradient id="night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#161a36"/><stop offset="1" stop-color="#3b2f63"/></linearGradient>
<linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6c8" stop-opacity=".7"/><stop offset="1" stop-color="#fff6c8" stop-opacity=".12"/></linearGradient>
<pattern id="brick" width="120" height="60" patternUnits="userSpaceOnUse"><rect width="120" height="60" fill="none"/><path d="M0 0 H120 M0 30 H120 M30 0 V30 M90 30 V60" stroke="rgba(0,0,0,.13)" stroke-width="5"/></pattern>
<pattern id="stripe" width="80" height="10" patternUnits="userSpaceOnUse"><rect width="40" height="10" fill="rgba(255,255,255,.35)"/></pattern></defs>`;
const stars = (n, seed, y0 = 0, y1 = 900, c = '#fff6c8') => { const r = rng(seed); let s = ''; for (let i = 0; i < n; i++) { const x = r() * W, y = y0 + r() * (y1 - y0), z = 3 + r() * 6; s += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${z.toFixed(1)}" fill="${c}" opacity="${(.5 + r() * .5).toFixed(2)}"/>`; } return s; };
const building = (x, y, w, h, c, win = '#fff3c4', seed = 1, lit = 1, cols = 3) => { const r = rng(seed); let s = R(x, y, w, h, c, 4); const cw = w / cols; for (let yy = y + 40; yy < y + h - 60; yy += 90) for (let i = 0; i < cols; i++) if (r() < lit) s += R(x + i * cw + cw * .22, yy, cw * .56, 54, win, 4, 5); return s; };

function bedroom(night) {
  const wall = night ? '#2b3352' : '#ffe9d6', fl = night ? '#1f2540' : '#e8b98a', sky = night ? '#141a36' : '#bfe6ff', cur = night ? '#4b4f8a' : '#ff9eb8', bed = night ? '#3d4a7a' : '#7ec8ff', sheet = night ? '#9aa6cc' : '#ffffff', blanket = night ? '#5a5fa0' : '#ffb3c7';
  const view = night ? stars(26, 7, 0, 420) + C(250, 120, 56, '#fff3b0', 6) + C(274, 104, 50, sky, 0) : cloud(160, 170, 1.1) + cloud(330, 300, .8);
  return R(-10, -10, W + 20, H + 20, wall, 0, 0) + floor(1190, fl, night ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.08)') +
    windowBox(60, 520, 300, 400, sky, view) +
    P('M30 470 C70 640 40 800 60 960 L-10 960 L-10 470 Z', cur) + P('M380 470 C350 640 400 820 360 960 L300 960 C330 800 290 640 300 470 Z', cur) + L('M0 470 L420 470', 14) +
    (night ? `<circle cx="160" cy="980" r="230" fill="url(#glow)"/>` : '') + lampTable(160, 1060, night ? '#ffe27a' : '#ffd21f') +
    frame(790, 520, 210, 260, night ? '#6b6fb0' : '#ffd21f', C(895, 650, 50, night ? '#ff8fb0' : '#ff5a7a', 6)) +
    R(760, 860, 400, 330, bed, 40) + R(700, 1060, 460, 170, sheet, 24) + P('M700 1110 C800 1090 960 1120 1160 1100 L1160 1240 L700 1240 Z', blanket) + R(800, 1000, 200, 80, sheet, 30, 7);
}
function office() {
  const city = building(-20, 260, 220, 400, '#b9cde4', '#e6f0fa', 3, .7) + building(200, 160, 200, 500, '#a6bfdc', '#e6f0fa', 4, .7) + building(420, 300, 240, 360, '#c4d6ea', '#e6f0fa', 5, .7) + building(680, 120, 220, 540, '#a9c2de', '#e6f0fa', 6, .7) + building(900, 240, 220, 420, '#bcd0e6', '#e6f0fa', 7, .7);
  return R(-10, -10, W + 20, H + 20, '#e9eef5', 0, 0) + floor(1200, '#c3c9d4') +
    `<g>${R(-20, 470, W + 40, 460, '#d7ebff')}<g clip-path="url(#ofw)">${city}</g><clipPath id="ofw"><rect x="-20" y="470" width="1120" height="460"/></clipPath>` +
    [0, 270, 540, 810, 1080].map(x => R(x - 12, 462, 24, 476, '#ffffff', 4, 6)).join('') + R(-20, 924, W + 40, 26, '#ffffff', 4, 6) + R(-20, 452, W + 40, 22, '#ffffff', 4, 6) + `</g>` +
    R(850, 980, 220, 230, '#9aa4b5', 8) + R(870, 1000, 180, 90, '#aeb7c6', 6, 5) + R(870, 1104, 180, 90, '#aeb7c6', 6, 5) + R(935, 1036, 50, 14, '#2a2830', 6, 0) + R(935, 1140, 50, 14, '#2a2830', 6, 0) + plant(960, 980, .55) +
    R(-30, 1140, 400, 40, '#b07a4f', 8) + R(10, 1180, 24, 220, '#7a5236', 4, 6) + R(300, 1180, 24, 220, '#7a5236', 4, 6) +
    R(70, 960, 240, 160, '#2a2830', 14) + R(86, 976, 208, 124, '#7ec8ff', 6, 0) + L('M100 1080 L150 1040 L190 1060 L270 1000', 9, '#ffffff') + R(170, 1120, 40, 22, '#2a2830', 0, 0) + R(380 - 330, 1110, 70, 40, '#ffffff', 6, 6);
}
function cafe() {
  return R(-10, -10, W + 20, H + 20, '#e9a27a', 0, 0) + R(-10, -10, W + 20, H + 20, 'url(#brick)', 0, 0) +
    windowBox(40, 560, 290, 420, '#cfeaff', cloud(150, 690, .8) + building(40, 760, 120, 260, '#ffc9a8', '#fff', 11, .8, 2) + building(180, 700, 150, 320, '#b9e2c8', '#fff', 12, .8, 2), '#5a3a28') +
    R(730, 520, 300, 380, '#2f3b33', 10, 0) + R(730, 520, 300, 380, 'none', 10, 14).replace(`stroke="${K}"`, 'stroke="#8a5a3c"') + T(880, 600, 52, '#ffffff', 'MENU', 'font-family="Archivo Black, sans-serif"') +
    [650, 710, 770, 830].map((y, i) => L(`M770 ${y} L${900 + (i % 2) * 30} ${y}`, 6, '#e8e2d0') + C(985, y - 8, 9, '#ffd21f', 0)).join('') +
    L('M180 -10 L180 380', 5) + P('M120 380 L240 380 L210 330 L150 330 Z', '#2f6b5a') + `<circle cx="180" cy="420" r="110" fill="url(#glow)"/>` + E(180, 386, 34, 12, '#fff3b0', 5) +
    L('M900 -10 L900 330', 5) + P('M840 330 L960 330 L930 280 L870 280 Z', '#2f6b5a') + E(900, 336, 34, 12, '#fff3b0', 5) +
    R(-30, 1170, W + 60, 260, '#8a5a3c') + R(-30, 1150, W + 60, 46, '#c98f62', 8) +
    R(60, 1010, 150, 140, '#cfd5de', 12) + R(84, 1036, 102, 50, '#2a2830', 6, 0) + R(120, 1100, 30, 50, '#2a2830', 4, 0) +
    P('M860 1070 L940 1070 L932 1150 L868 1150 Z', '#ffffff') + L('M940 1090 C968 1090 968 1130 936 1130', 7) + L('M886 1050 C878 1036 896 1028 888 1012 M914 1050 C906 1036 924 1028 916 1012', 6, '#ffffff');
}
function date() {
  const bulbs = Array.from({ length: 12 }, (_, i) => { const x = 40 + i * 92, y = 470 + Math.sin(i / 11 * Math.PI) * 70; return L(`M${x} ${y} L${x} ${y + 18}`, 5) + E(x, y + 34, 14, 18, '#ffe27a', 5) + `<circle cx="${x}" cy="${y + 34}" r="40" fill="url(#glow)"/>`; }).join('');
  return R(-10, -10, W + 20, H + 20, '#f7d0c4', 0, 0) + R(-10, -10, W + 20, H + 20, 'url(#stripe)', 0, 0) +
    L('M0 460 Q540 610 1080 460', 6) + bulbs +
    frame(70, 620, 220, 280, '#ffb38a', C(180, 790, 46, '#ff6a3d', 5) + L('M100 860 Q180 800 260 860', 6, '#5a3a28')) +
    windowBox(790, 600, 240, 360, '#232a4f', stars(10, 3, 600, 960) + C(960, 680, 30, '#fff3b0', 5), '#ffffff', 1) +
    R(-30, 1200, W + 60, 230, '#ffffff') + R(-30, 1200, W + 60, 230, 'url(#stripe)', 0, 0) + P('M-30 1200 L1110 1200 L1110 1236 L-30 1236 Z', '#e8412c') +
    R(120, 1090, 26, 110, '#ffffff', 6, 6) + P('M133 1050 C147 1070 145 1084 133 1088 C121 1084 119 1070 133 1050 Z', '#ffd21f', 5) + `<circle cx="133" cy="1070" r="80" fill="url(#glow)"/>` +
    P('M880 1050 L960 1050 C960 1110 940 1130 920 1130 C900 1130 880 1110 880 1050 Z', '#ffffff') + P('M884 1080 L956 1080 C952 1112 938 1126 920 1126 C902 1126 888 1112 884 1080 Z', '#c2185b', 0) + L('M920 1130 L920 1196 M890 1198 L950 1198', 8);
}
function street() {
  return R(-10, -10, W + 20, H + 20, '#bfe6ff', 0, 0) + cloud(520, 250, 1.2) + cloud(820, 160, .8) +
    building(330, 640, 200, 560, '#dbe6f2', '#ffffff', 21, .6) + building(540, 700, 200, 500, '#e8dff0', '#ffffff', 22, .6) +
    building(-30, 380, 330, 880, '#ffb38a', '#fff3c4', 23, .85) + R(-30, 1020, 330, 30, '#e8412c', 0) + [0, 1, 2, 3, 4, 5].map(i => P(`M${-30 + i * 55} 1050 L${25 + i * 55} 1050 L${25 + i * 55} 1100 Q${-2 + i * 55} 1120 ${-30 + i * 55} 1100 Z`, i % 2 ? '#ffffff' : '#e8412c', 6)).join('') +
    building(770, 300, 340, 960, '#9fd3b8', '#fff3c4', 24, .85) + R(800, 980, 240, 70, '#ffd21f', 8) + T(920, 1032, 50, K, 'SHOP', 'font-family="Archivo Black, sans-serif"') +
    R(-30, 1250, W + 60, 200, '#d8d2c8') + R(-30, 1240, W + 60, 22, '#a9a39a', 0, 6) +
    R(704, 760, 16, 490, '#2a2830', 6, 0) + P('M680 760 L744 760 L734 720 L690 720 Z', '#2a2830', 6) + `<circle cx="712" cy="780" r="70" fill="url(#glow)"/>`;
}
function cityNight() {
  const far = building(-20, 640, 160, 640, '#2b3157', '#ffe27a', 31, .35, 2) + building(130, 520, 200, 760, '#323a66', '#ffe27a', 32, .35) + building(330, 700, 180, 580, '#2b3157', '#ffe27a', 33, .3, 2) + building(520, 600, 200, 680, '#323a66', '#ffe27a', 34, .35) + building(730, 700, 190, 580, '#2b3157', '#ffe27a', 35, .35) + building(920, 620, 180, 660, '#323a66', '#ffe27a', 36, .35, 2);
  return R(-10, -10, W + 20, H + 20, 'url(#night)', 0, 0) + stars(40, 9, 0, 620) + C(850, 590, 70, '#fff3b0', 6) + `<circle cx="850" cy="590" r="170" fill="url(#glow)" opacity=".6"/>` + far +
    R(-30, 1240, W + 60, 200, '#1b1f36') + L('M-30 1240 L1110 1240', 10) + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => L(`M${i * 108} 1150 L${i * 108} 1240`, 9, '#4a527e')).join('') + L('M-30 1150 L1110 1150', 12, '#4a527e');
}
function park() {
  const tree = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">` + R(-24, -40, 48, 240, '#a0643c', 8) + P('M0 -330 C90 -330 130 -260 116 -210 C170 -180 160 -90 100 -80 C70 -40 -70 -40 -100 -80 C-160 -90 -170 -180 -116 -210 C-130 -260 -90 -330 0 -330 Z', '#5fc47a') + C(-40, -230, 14, '#ff8fb0', 0) + C(50, -170, 14, '#ff8fb0', 0) + C(20, -270, 12, '#ffffff', 0) + `</g>`;
  return R(-10, -10, W + 20, H + 20, '#cdeeff', 0, 0) + C(880, 300, 70, '#ffd21f', 7) + cloud(240, 260, 1) + cloud(640, 200, .7) +
    P('M-30 1000 Q200 820 460 980 Q700 860 1110 990 L1110 1404 L-30 1404 Z', '#a8e0a0') + R(-30, 1150, W + 60, 300, '#8fd67a') +
    P('M420 1404 Q520 1250 560 1150 L640 1150 Q660 1250 700 1404 Z', '#f0dcb0', 6) +
    tree(130, 1110, 1.05) + tree(960, 1080, .9) +
    R(760, 1170, 300, 30, '#c98f62', 6) + R(760, 1110, 300, 30, '#c98f62', 6) + R(780, 1200, 20, 90, '#7a5236', 4, 6) + R(1020, 1200, 20, 90, '#7a5236', 4, 6) +
    [80, 260, 330, 1000].map((x, i) => L(`M${x} 1300 l10 -30 l10 30 m-4 0 l14 -24`, 6, '#4aa860')).join('') + C(300, 1240, 12, '#ffd21f', 5) + C(240, 1330, 12, '#ff8fb0', 5);
}
function classroom() {
  return R(-10, -10, W + 20, H + 20, '#f3ead2', 0, 0) + floor(1220, '#c9b28f') +
    R(120, 470, 840, 440, '#8a5a3c', 10) + R(140, 490, 800, 400, '#2f5d4a', 4, 0) +
    L('M190 560 L330 560 M190 610 L300 610 M190 660 L360 660', 8, '#e8f2ea') + L('M780 560 Q840 520 880 580 Q900 640 820 650', 7, '#e8f2ea') + L('M700 820 L760 760 L800 800 L880 720', 7, '#ffe27a') + T(560, 600, 54, '#e8f2ea', 'A + B = ?', 'font-family="Archivo Black, sans-serif"') + R(400, 880, 120, 20, '#ffffff', 4, 5) +
    C(1010, 560, 44, '#ffffff') + L('M1010 560 L1010 530 M1010 560 L1030 572', 6) +
    R(-30, 1180, 300, 40, '#d9a066', 6) + R(10, 1220, 20, 180, '#7a5236', 4, 6) + R(230, 1220, 20, 180, '#7a5236', 4, 6) +
    R(810, 1180, 300, 40, '#d9a066', 6) + R(840, 1220, 20, 180, '#7a5236', 4, 6) + R(1050, 1220, 20, 180, '#7a5236', 4, 6) + R(40, 1140, 110, 40, '#7ec8ff', 4, 6) + R(880, 1146, 90, 34, '#ffb3c7', 4, 6);
}
function livingRoom() {
  return R(-10, -10, W + 20, H + 20, '#d8f0e6', 0, 0) + floor(1250, '#e6c9a0') +
    frame(330, 560, 160, 200, '#ffd21f', C(410, 650, 30, '#ff8a8a', 5)) + frame(530, 600, 220, 160, '#7ec8ff', L('M560 720 L610 670 L650 700 L720 640', 6, '#ffffff')) +
    L('M150 470 L150 1250', 10) + P('M80 470 L220 470 L190 380 L110 380 Z', '#ffd21f') + `<circle cx="150" cy="500" r="140" fill="url(#glow)"/>` + E(150, 1256, 70, 14, '#2a2830', 0) +
    R(170, 1000, 740, 220, '#ff8a8a', 50) + R(130, 1060, 120, 220, '#ff7070', 40) + R(830, 1060, 120, 220, '#ff7070', 40) + R(230, 1140, 620, 110, '#ff9c9c', 24) +
    R(280, 1030, 140, 110, '#ffd21f', 30, 7) + R(660, 1030, 140, 110, '#7ec8ff', 30, 7) + plant(990, 1250, .8);
}
function rainWindow() {
  const r = rng(41); let rain = ''; for (let i = 0; i < 70; i++) { const x = r() * 1100, y = 400 + r() * 900; rain += L(`M${x.toFixed(0)} ${y.toFixed(0)} l-14 ${40 + r() * 40}`, 4, '#a9c0e8', 'opacity=".7"'); }
  let drops = ''; for (let i = 0; i < 22; i++) { const x = 120 + r() * 840, y = 520 + r() * 620; drops += E(x, y, 7, 10, 'rgba(220,235,255,.55)', 3); }
  const city = building(80, 760, 160, 440, '#2c3658', '#ffd27a', 51, .4, 2) + building(260, 680, 200, 520, '#344068', '#ffd27a', 52, .4) + building(620, 720, 200, 480, '#2c3658', '#ffd27a', 53, .4) + building(830, 640, 180, 560, '#344068', '#ffd27a', 54, .4, 2);
  return R(-10, -10, W + 20, H + 20, '#222a44', 0, 0) +
    `<clipPath id="rw"><rect x="70" y="470" width="940" height="720"/></clipPath>` + R(70, 470, 940, 720, '#3a4670') + `<g clip-path="url(#rw)">${city}${rain}${drops}</g>` +
    R(70, 470, 940, 720, 'none', 0, 22).replace(`stroke="${K}"`, 'stroke="#4a5578"') + L('M540 470 L540 1190', 18, '#4a5578') + R(60, 460, 960, 740, 'none') +
    R(30, 1190, 1020, 44, '#56628a', 8) + R(-30, 1234, W + 60, 200, '#1a2038', 0, 0) +
    P('M820 1110 L900 1110 L894 1190 L826 1190 Z', '#ffb3c7') + L('M900 1128 C926 1128 926 1168 896 1168', 7) + L('M846 1094 C838 1080 856 1072 848 1056 M872 1094 C864 1080 882 1072 874 1056', 5, '#c8d4f0');
}
function party() {
  const flags = (y, amp, seed) => { const r = rng(seed); const cs = ['#ff5a7a', '#ffd21f', '#7ec8ff', '#5fd08a', '#b48cff', '#ff9a3c']; let s = L(`M-20 ${y} Q540 ${y + amp} 1100 ${y}`, 5); for (let i = 0; i < 13; i++) { const x = i * 90 + 10, yy = y + amp * 4 * (x / 1080) * (1 - x / 1080) * .5; s += P(`M${x} ${yy} L${x + 60} ${yy} L${x + 30} ${yy + 64} Z`, cs[i % 6], 5); } return s; };
  const balloon = (x, y, c) => L(`M${x} ${y + 70} Q${x + 20} ${y + 160} ${x - 10} ${y + 260}`, 4) + P(`M${x} ${y - 70} C${x + 60} ${y - 70} ${x + 66} ${y + 20} ${x} ${y + 70} C${x - 66} ${y + 20} ${x - 60} ${y - 70} ${x} ${y - 70} Z`, c, 7) + L(`M${x - 28} ${y - 30} Q${x - 30} ${y - 6} ${x - 20} ${y + 10}`, 7, '#ffffff');
  const r = rng(61); let conf = ''; for (let i = 0; i < 40; i++) conf += `<rect x="${(r() * W).toFixed(0)}" y="${(480 + r() * 760).toFixed(0)}" width="16" height="9" fill="${['#ff5a7a', '#ffd21f', '#7ec8ff', '#5fd08a'][i % 4]}" transform="rotate(${(r() * 180).toFixed(0)} ${(r() * W).toFixed(0)} 900)" opacity=".8"/>`;
  return R(-10, -10, W + 20, H + 20, '#ffd6e8', 0, 0) + conf + flags(460, 120, 1) + flags(560, 90, 2) +
    balloon(110, 760, '#ff5a7a') + balloon(220, 690, '#ffd21f') + balloon(960, 720, '#7ec8ff') + balloon(860, 800, '#b48cff') + floor(1240, '#b48cff', 'rgba(255,255,255,.12)') +
    R(820, 1140, 260, 100, '#ffffff', 10) + R(870, 1060, 160, 80, '#ffb3c7', 10) + R(940, 1010, 16, 50, '#7ec8ff', 4, 5) + P('M948 980 C958 994 956 1004 948 1006 C940 1004 938 994 948 980 Z', '#ffd21f', 5);
}
function subway() {
  return R(-10, -10, W + 20, H + 20, '#e6eef0', 0, 0) + floor(1250, '#9aa3ad', 'rgba(255,255,255,.12)') +
    R(-20, 430, W + 40, 50, '#5fb7e5', 0, 6) + [0, 1, 2, 3, 4, 5].map(i => C(80 + i * 190, 455, 9, '#ffffff', 4)).join('') + L('M80 455 L1030 455', 5, '#ffffff') +
    [[30, 300], [380, 320], [750, 300]].map(([x, w]) => R(x, 560, w, 300, '#3a4250', 30) + L(`M${x + 30} ${640} l${w - 80} 0 M${x + 60} ${720} l${w - 120} 0 M${x + 20} ${800} l${w - 60} 0`, 6, '#59627a')).join('') +
    L('M-20 520 L1100 520', 12, '#c0c8cc') + [140, 330, 520, 710, 900].map(x => L(`M${x} 520 L${x} 580`, 5) + `<ellipse cx="${x}" cy="604" rx="22" ry="26" fill="none" stroke="${K}" stroke-width="8"/>`).join('') +
    R(232, 520, 22, 900, '#ffd21f', 8, 6) + R(826, 520, 22, 900, '#ffd21f', 8, 6) +
    R(-40, 1110, 250, 60, '#4fa3d8', 14) + R(-40, 1000, 60, 170, '#4fa3d8', 14) + R(870, 1110, 260, 60, '#4fa3d8', 14) + R(1060, 1000, 60, 170, '#4fa3d8', 14) + R(-40, 1170, 250, 80, '#3a4250', 0, 6) + R(870, 1170, 260, 80, '#3a4250', 0, 6);
}
function stage() {
  const curtain = (x0, dir) => { let s = ''; for (let i = 0; i < 4; i++) { const x = x0 + dir * i * 60; s += P(`M${x} 380 L${x + dir * 70} 380 C${x + dir * 60} 700 ${x + dir * 90} 1000 ${x + dir * 60} 1260 L${x - dir * 10} 1260 C${x + dir * 20} 1000 ${x - dir * 10} 700 ${x} 380 Z`, i % 2 ? '#c2263a' : '#e0384c', 6); } return s; };
  return R(-10, -10, W + 20, H + 20, '#3a1f2e', 0, 0) + P('M380 380 L700 380 L960 1300 L120 1300 Z', 'url(#beam)', 0) +
    R(-30, 1230, W + 60, 200, '#b07a4f') + [0, 1, 2, 3, 4, 5, 6].map(i => L(`M-30 ${1260 + i * 26} L1110 ${1260 + i * 26}`, 4, 'rgba(0,0,0,.15)')).join('') + E(540, 1300, 380, 60, 'rgba(255,246,200,.45)', 0) +
    curtain(-40, 1) + curtain(1120, -1) + P(`M-20 360 L1100 360 L1100 440 ${Array.from({ length: 9 }, (_, i) => `Q${1100 - i * 125 - 62} 520 ${1100 - (i + 1) * 125} 440`).join(' ')} Z`, '#e0384c', 7) + L('M-20 400 L1100 400', 6, '#ffd21f');
}
function seaside() {
  return R(-10, -10, W + 20, H + 20, 'url(#dusk)', 0, 0) + C(780, 980, 150, '#ffe27a', 0) + cloud(260, 300, 1, '#ffe8d0') + cloud(700, 220, .7, '#ffe8d0') +
    L('M200 600 q20 -20 40 0 q20 -20 40 0', 6) + L('M320 520 q16 -16 32 0 q16 -16 32 0', 5) +
    R(-30, 980, W + 60, 260, '#5fb7e5', 0, 0) + L('M-30 980 L1110 980', 8) + [1030, 1090, 1150].map((y, i) => L(`M${-20 + i * 40} ${y} q40 -18 80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0`, 6, '#ffffff', 'opacity=".75"')).join('') +
    `<rect x="620" y="990" width="320" height="10" fill="#ffe27a" opacity=".7"/><rect x="660" y="1020" width="240" height="8" fill="#ffe27a" opacity=".5"/>` +
    P('M-30 1240 Q300 1190 600 1230 Q860 1260 1110 1220 L1110 1404 L-30 1404 Z', '#f5d9a0') + C(200, 1320, 16, '#ff9eb8', 5) + P('M880 1330 l20 -30 l20 30 Z', '#ffffff', 5);
}
function crossroads() {
  return R(-10, -10, W + 20, H + 20, '#dff1ff', 0, 0) + cloud(250, 300, 1) + cloud(820, 240, .8) +
    P('M-30 960 L180 760 L330 900 L520 720 L760 940 L900 800 L1110 960 Z', '#b9d3e8') + R(-30, 950, W + 60, 480, '#a8dc8f', 0, 0) + L('M-30 950 L1110 950', 8) +
    P('M380 1404 L500 1110 L190 960 L250 960 L540 1080 L830 960 L890 960 L580 1110 L700 1404 Z', '#8a8f9c') +
    L('M540 1390 L540 1120', 10, '#ffffff', 'stroke-dasharray="40 34"') + L('M520 1100 L230 965', 8, '#ffffff', 'stroke-dasharray="30 28"') + L('M560 1100 L850 965', 8, '#ffffff', 'stroke-dasharray="30 28"') +
    R(900, 900, 22, 380, '#a0643c', 4) + P('M790 940 L990 940 L1030 980 L990 1020 L790 1020 Z', '#ffd21f', 7) + P('M1030 1050 L830 1050 L790 1090 L830 1130 L1030 1130 Z', '#7ec8ff', 7) +
    T(905, 995, 40, K, '这边') + T(925, 1105, 40, K, '那边') + L('M80 1300 l10 -30 l10 30 m-4 0 l14 -24', 6, '#4aa860');
}
const SETS = {
  bedroom: { dark: false, fn: () => bedroom(false), zh: '卧室（白天）' },
  bedroom_night: { dark: true, fn: () => bedroom(true), zh: '深夜卧室（月亮、台灯）' },
  office: { dark: false, fn: office, zh: '办公室（落地窗城市）' },
  cafe: { dark: false, fn: cafe, zh: '咖啡馆' },
  date: { dark: false, fn: date, zh: '约会餐厅（烛光、串灯）' },
  street: { dark: false, fn: street, zh: '街道' },
  city_night: { dark: true, fn: cityNight, zh: '城市夜景/天台' },
  park: { dark: false, fn: park, zh: '公园' },
  classroom: { dark: false, fn: classroom, zh: '教室（黑板）' },
  living_room: { dark: false, fn: livingRoom, zh: '客厅/家（沙发）' },
  rain_window: { dark: true, fn: rainWindow, zh: '雨夜窗边' },
  party: { dark: false, fn: party, zh: '派对/聚会' },
  subway: { dark: false, fn: subway, zh: '地铁车厢/通勤' },
  stage: { dark: true, fn: stage, zh: '舞台（幕布、聚光）' },
  seaside: { dark: false, fn: seaside, zh: '海边日落' },
  crossroads: { dark: false, fn: crossroads, zh: '岔路口（选择）' },
};
const SET_ALIASES = { night: 'bedroom_night', home: 'living_room', room: 'bedroom', restaurant: 'date', city: 'city_night', rooftop: 'city_night', rain: 'rain_window', school: 'classroom', metro: 'subway', sea: 'seaside', beach: 'seaside', road: 'crossroads', choice: 'crossroads' };
function resolve(name) { const n = String(name || '').split(/\s+/)[0]; return SETS[n] ? n : SET_ALIASES[n] || null; }
function svg(name, o = {}) {
  const n = resolve(name); if (!n) return '';
  const tr = o.flip ? `transform="translate(${W} 0) scale(-1 1)"` : '';
  const dim = o.dim ? `<rect x="0" y="0" width="${W}" height="${H}" fill="${SETS[n].dark ? '#000' : '#fff'}" opacity="${Math.min(.8, +o.dim)}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" style="position:absolute;left:0;top:0">${defs}<g ${tr}>${SETS[n].fn()}</g>${dim}</svg>`;
}
G.SETS = { svg, resolve, NAMES: Object.keys(SETS), INFO: Object.fromEntries(Object.entries(SETS).map(([k, v]) => [k, { dark: v.dark, zh: v.zh }])), ALIASES: SET_ALIASES, isDark: n => { const r = resolve(n); return r ? SETS[r].dark : false; } };
})(typeof window !== 'undefined' ? window : globalThis);
