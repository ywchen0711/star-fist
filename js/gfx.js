// Low-level drawing: the 256x224 screen, the pixel font, windows, cards, sprites cut from the
// Ninja Adventure sheets (CC0), effect strips, and the procedurally painted skies.
export const W = 256, H = 224;

export function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, w); c.height = Math.max(1, h);
  c.x = c.getContext('2d', { willReadFrequently: false });
  c.x.imageSmoothingEnabled = false;
  return c;
}
export const screen = document.getElementById('screen');
const game = canvas(W, H);
export const ctx = game.x;
const sctx = screen.getContext('2d');
export const view = { shake: 0 };
let lines = null;
export function present() {
  const k = Math.max(1, Math.round(screen.width / W));
  sctx.imageSmoothingEnabled = false;
  const sx = view.shake > 0 ? Math.round((Math.random() - 0.5) * view.shake * 2) * k : 0;
  const sy = view.shake > 0 ? Math.round((Math.random() - 0.5) * view.shake * 2) * k : 0;
  if (sx || sy) { sctx.fillStyle = '#000'; sctx.fillRect(0, 0, screen.width, screen.height); }
  sctx.drawImage(game, sx, sy, W * k, H * k);
  if (k >= 3) {
    if (!lines || lines.k !== k) {
      lines = canvas(W * k, H * k); lines.k = k;
      lines.x.fillStyle = 'rgba(0,0,0,0.18)';
      for (let y = 0; y < H; y++) lines.x.fillRect(0, y * k + k - 1, W * k, 1);
    }
    sctx.drawImage(lines, 0, 0);
  }
}
export const gameCanvas = game;

// ---------- colour ----------
export function rgb(h) {
  if (Array.isArray(h)) return h;
  h = h.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export const hex = (c) => '#' + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
export const mix = (a, b, t) => { a = rgb(a); b = rgb(b); return hex(a.map((v, i) => v + (b[i] - v) * t)); };
export const hash = (x, y, k = 0) => { let h = (x * 374761393 + y * 668265263 + k * 1442695041) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
export const bayer = (x, y) => BAYER[(y & 3) * 4 + (x & 3)];

// ---------- pixel font ----------
// Cubic 11 sits on a 12-pixel grid. Each string is drawn 8x larger and sampled at the centre of
// each 8x8 block, so every glyph comes out as clean single pixels.
export const FONT = '12px Cubic11';
export function textW(s) { ctx.font = FONT; return Math.round(ctx.measureText(String(s)).width); }
const GS = 8, maskCache = new Map(), glyphCache = new Map();
let big = null;
function glyphMask(s) {
  let m = maskCache.get(s);
  if (m) return m;
  if (!big) big = canvas(1, 1);
  const w = Math.max(1, textW(s) + 2), h = 14;
  if (big.width < w * GS) big.width = w * GS;
  if (big.height < h * GS) big.height = h * GS;
  const x = big.x;
  x.clearRect(0, 0, big.width, big.height);
  x.font = 12 * GS + 'px Cubic11'; x.textBaseline = 'alphabetic'; x.fillStyle = '#fff';
  x.fillText(s, 0, 11 * GS);
  const d = x.getImageData(0, 0, w * GS, h * GS).data, bits = new Uint8Array(w * h);
  for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) bits[yy * w + xx] = d[(((yy * GS + GS / 2) * w * GS) + xx * GS + GS / 2) * 4 + 3] > 127 ? 1 : 0;
  m = { w, h, bits };
  if (maskCache.size > 3000) maskCache.clear();
  maskCache.set(s, m);
  return m;
}
export function glyphs(s, col) {
  const key = s + '|' + col;
  let c = glyphCache.get(key);
  if (c) return c;
  const m = glyphMask(s), [r, g, b] = rgb(col);
  c = canvas(m.w, m.h);
  const id = c.x.createImageData(m.w, m.h), d = id.data;
  for (let k = 0; k < m.bits.length; k++) if (m.bits[k]) { d[k * 4] = r; d[k * 4 + 1] = g; d[k * 4 + 2] = b; d[k * 4 + 3] = 255; }
  c.x.putImageData(id, 0, 0);
  if (glyphCache.size > 3000) glyphCache.clear();
  glyphCache.set(key, c);
  return c;
}
export function text(s, x, y, col = '#f4f4ff', { shadow = '#0a0820', align = 'left', g = ctx } = {}) {
  s = String(s);
  if (align !== 'left') { const w = textW(s); x -= align === 'center' ? Math.floor(w / 2) : w; }
  if (shadow) g.drawImage(glyphs(s, shadow), Math.round(x) + 1, Math.round(y) + 1);
  g.drawImage(glyphs(s, col), Math.round(x), Math.round(y));
}
// big text: the 12px glyphs scaled up by a whole number, with a dark outline
export function bigText(s, x, y, col, k = 2, { align = 'left', outline = '#0a0820', g = ctx, grad = null } = {}) {
  s = String(s);
  const w = textW(s) * k;
  if (align === 'center') x -= Math.floor(w / 2); else if (align === 'right') x -= w;
  x = Math.round(x); y = Math.round(y);
  const gl = glyphs(s, col), ol = glyphs(s, outline);
  const gw = gl.width * k, gh = gl.height * k;
  if (outline) for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [1, 1], [2, 2]]) g.drawImage(ol, x + dx * Math.max(1, k >> 1), y + dy * Math.max(1, k >> 1), gw, gh);
  g.drawImage(gl, x, y, gw, gh);
  if (grad) {
    // a lighter top half for metallic lettering
    const lt = glyphs(s, grad);
    g.save(); g.beginPath(); g.rect(x, y, gw, Math.round(gh * 0.45)); g.clip(); g.drawImage(lt, x, y, gw, gh); g.restore();
  }
  return w;
}

// ---------- windows ----------
// deep space glass: a violet-to-navy body, a pale cyan rim and tiny four-point stars at the corners
const winCache = new Map();
export function windowBox(x, y, w, h, { alpha = 1, accent = '#8ad8ff' } = {}) {
  w = Math.round(w); h = Math.round(h);
  const key = w + 'x' + h + accent;
  let c = winCache.get(key);
  if (!c) {
    c = canvas(w, h);
    const X = c.x;
    for (let yy = 1; yy < h - 1; yy++) {
      const t = yy / h;
      X.fillStyle = mix('#28204e', '#0c1030', t);
      X.fillRect(1, yy, w - 2, 1);
    }
    X.fillStyle = 'rgba(255,255,255,0.05)';
    for (let yy = 3; yy < h - 2; yy += 2) X.fillRect(2, yy, w - 4, 1);
    X.fillStyle = '#05040f';
    X.fillRect(2, 0, w - 4, 1); X.fillRect(2, h - 1, w - 4, 1); X.fillRect(0, 2, 1, h - 4); X.fillRect(w - 1, 2, 1, h - 4);
    X.fillRect(1, 1, 1, 1); X.fillRect(w - 2, 1, 1, 1); X.fillRect(1, h - 2, 1, 1); X.fillRect(w - 2, h - 2, 1, 1);
    X.fillStyle = accent;
    X.fillRect(2, 1, w - 4, 1); X.fillRect(2, h - 2, w - 4, 1); X.fillRect(1, 2, 1, h - 4); X.fillRect(w - 2, 2, 1, h - 4);
    X.fillStyle = mix(accent, '#202060', 0.55);
    X.fillRect(3, 2, w - 6, 1); X.fillRect(2, 3, 1, h - 6);
    for (const [cx, cy] of [[3, 3], [w - 4, 3], [3, h - 4], [w - 4, h - 4]]) {
      X.fillStyle = '#ffffff'; X.fillRect(cx, cy, 1, 1);
      X.fillStyle = '#f8e080'; X.fillRect(cx - 1, cy, 1, 1); X.fillRect(cx + 1, cy, 1, 1); X.fillRect(cx, cy - 1, 1, 1); X.fillRect(cx, cy + 1, 1, 1);
    }
    if (winCache.size > 300) winCache.clear();
    winCache.set(key, c);
  }
  ctx.globalAlpha = alpha; ctx.drawImage(c, Math.round(x), Math.round(y)); ctx.globalAlpha = 1;
}
export function bar(x, y, w, v, max, col = '#58e070', h = 3) {
  ctx.fillStyle = '#05040f'; ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
  ctx.fillStyle = '#2a2448'; ctx.fillRect(x, y, w, h);
  const f = Math.max(0, Math.min(1, v / max));
  const fw = Math.round(w * f);
  ctx.fillStyle = col; ctx.fillRect(x, y, fw, h);
  ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(x, y, fw, 1);
}
// a cursor: a small glowing triangle pointing right (or down)
export function cursor(x, y, t = 0, down = false) {
  const o = Math.floor(t / 8) % 2;
  ctx.fillStyle = '#05040f';
  if (down) { for (let i = 0; i < 4; i++) ctx.fillRect(x - 4 + i, y + i + o, 9 - i * 2, 1); return; }
  for (let i = 0; i < 5; i++) { ctx.fillStyle = '#05040f'; ctx.fillRect(x + o - 1, y - 5 + i, i + 2, 1); ctx.fillRect(x + o - 1, y + 5 - i, i + 2, 1); }
  for (let i = 0; i < 4; i++) { ctx.fillStyle = i < 2 ? '#ffffff' : '#ffe070'; ctx.fillRect(x + o, y - 4 + i, i + 1, 1); ctx.fillRect(x + o, y + 4 - i, i + 1, 1); }
  ctx.fillStyle = '#ffe070'; ctx.fillRect(x + o, y, 5, 1);
}

// ---------- star shapes ----------
const starCache = new Map();
export function starShape(r, col, edge = '#05040f') {
  const key = r + col + edge;
  let c = starCache.get(key);
  if (c) return c;
  const s = r * 2 + 3;
  c = canvas(s, s);
  const id = c.x.createImageData(s, s), d = id.data, cx = s / 2, cy = s / 2 + 0.3;
  const inside = (px, py) => {
    const a = Math.atan2(py - cy, px - cx) + Math.PI / 2, dist = Math.hypot(px - cx, py - cy);
    const k = ((a / (Math.PI * 2 / 5)) % 1 + 1) % 1, t = Math.abs(k - 0.5) * 2;
    return dist <= r * (0.45 + 0.55 * Math.pow(t, 1.6));
  };
  const [R, G, B] = rgb(col), [r2, g2, b2] = rgb(edge);
  const on = new Uint8Array(s * s);
  for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) on[y * s + x] = inside(x + 0.5, y + 0.5) ? 1 : 0;
  for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
    const i = y * s + x;
    if (on[i]) { d[i * 4] = R; d[i * 4 + 1] = G; d[i * 4 + 2] = B; d[i * 4 + 3] = 255; }
    else if (edge && ((x > 0 && on[i - 1]) || (x < s - 1 && on[i + 1]) || (y > 0 && on[i - s]) || (y < s - 1 && on[i + s]))) { d[i * 4] = r2; d[i * 4 + 1] = g2; d[i * 4 + 2] = b2; d[i * 4 + 3] = 255; }
  }
  c.x.putImageData(id, 0, 0);
  starCache.set(key, c);
  return c;
}
export function drawStar(x, y, r, col, edge) { const c = starShape(r, col, edge); ctx.drawImage(c, Math.round(x - c.width / 2), Math.round(y - c.height / 2)); }
// a tiny four-point twinkle
export function twinkle(x, y, col = '#fff', big = false) {
  ctx.fillStyle = col; ctx.fillRect(x, y, 1, 1);
  if (big) { ctx.fillRect(x - 1, y, 3, 1); ctx.fillRect(x, y - 1, 1, 3); ctx.globalAlpha = 0.5; ctx.fillRect(x - 2, y, 5, 1); ctx.fillRect(x, y - 2, 1, 5); ctx.globalAlpha = 1; }
}

// ---------- cards ----------
// a battle card: a star band on top (one pip per star) and a big number or glyph below
const cardCache = new Map();
export const CARD_W = 36, CARD_H = 50;
const PIP = (() => {
  const c = canvas(5, 5), X = c.x;
  X.fillStyle = '#ffe070'; X.fillRect(2, 0, 1, 5); X.fillRect(0, 2, 5, 1); X.fillRect(1, 1, 3, 3);
  X.fillStyle = '#ffffff'; X.fillRect(2, 1, 1, 1);
  return c;
})();
function buildCard(card) {
  const w = CARD_W, h = CARD_H, c = canvas(w, h), X = c.x;
  X.fillStyle = '#05040f'; X.fillRect(1, 0, w - 2, h); X.fillRect(0, 1, w, h - 2);
  X.fillStyle = '#e8c060'; X.fillRect(1, 1, w - 2, h - 2);
  for (let y = 2; y < h - 2; y++) { X.fillStyle = mix('#fbf4e2', '#e2d6bc', y / h); X.fillRect(2, y, w - 4, 1); }
  // star band
  X.fillStyle = '#1a2a6a'; X.fillRect(2, 2, w - 4, 11);
  X.fillStyle = '#2c46a0'; X.fillRect(2, 2, w - 4, 1);
  const n = card.s, pitch = n > 5 ? 4 : 5, total = (n - 1) * pitch + 5, x0 = Math.floor((w - total) / 2);
  for (let i = 0; i < n; i++) X.drawImage(PIP, x0 + i * pitch, 5 - (n > 5 ? 0 : 0));
  // corner star value
  // centre
  const cy = 31;
  if (card.n === 'S' || card.n === 'K') {
    const disc = card.n === 'S' ? ['#c02838', '#ff6a50'] : ['#164a8a', '#3aa8ff'];
    for (let y = -10; y <= 10; y++) for (let x = -10; x <= 10; x++) {
      const d = Math.hypot(x, y);
      if (d <= 10.2) { X.fillStyle = d > 9 ? '#05040f' : y < -3 ? disc[1] : disc[0]; X.fillRect(18 + x, cy + y, 1, 1); }
    }
    const g = glyphs(card.n === 'S' ? '必' : '氣', card.n === 'S' ? '#ffe070' : '#e8fbff');
    X.drawImage(g, 18 - Math.floor((g.width - 2) / 2), cy - 6);
  } else {
    const s = String(card.n), g = glyphs(s, '#b01828'), o = glyphs(s, '#f8e8c8');
    const gw = (g.width - 2) * 2;
    const x = Math.round(18 - gw / 2) - 1, y = cy - 13;
    X.drawImage(o, x + 1, y + 2, g.width * 2, g.height * 2);
    X.drawImage(g, x, y, g.width * 2, g.height * 2);
  }
  // small star numeral at the bottom
  const sg = glyphs(String(card.s), '#1a2a6a');
  X.drawImage(PIP, w - 13, h - 10); X.drawImage(sg, w - 7, h - 13);
  return c;
}
export function drawCard(x, y, card, { back = false, hl = false, dim = false, lift = 0 } = {}) {
  let c;
  if (back) c = cardBack();
  else {
    const key = card.s + '/' + card.n;
    c = cardCache.get(key);
    if (!c) { c = buildCard(card); cardCache.set(key, c); }
  }
  y -= lift;
  if (hl) { ctx.fillStyle = '#fff6a0'; ctx.fillRect(x - 2, y - 1, CARD_W + 4, CARD_H + 2); ctx.fillRect(x - 1, y - 2, CARD_W + 2, CARD_H + 4); }
  ctx.drawImage(c, Math.round(x), Math.round(y));
  if (dim) { ctx.fillStyle = 'rgba(8,6,24,0.55)'; ctx.fillRect(x, y, CARD_W, CARD_H); }
}
let backC = null;
export function cardBack() {
  if (backC) return backC;
  const w = CARD_W, h = CARD_H, c = canvas(w, h), X = c.x;
  X.fillStyle = '#05040f'; X.fillRect(1, 0, w - 2, h); X.fillRect(0, 1, w, h - 2);
  X.fillStyle = '#e8c060'; X.fillRect(1, 1, w - 2, h - 2);
  for (let y = 2; y < h - 2; y++) { X.fillStyle = mix('#2a1e6a', '#0e0c34', y / h); X.fillRect(2, y, w - 4, 1); }
  for (let i = 0; i < 18; i++) { X.fillStyle = i % 3 ? '#8a90d8' : '#ffffff'; X.fillRect(3 + Math.floor(hash(i, 1) * (w - 6)), 3 + Math.floor(hash(i, 2) * (h - 6)), 1, 1); }
  const s = starShape(9, '#ffd860', '#6a3a10');
  X.drawImage(s, Math.round(w / 2 - s.width / 2), Math.round(h / 2 - s.height / 2));
  backC = c;
  return c;
}
// a movement card on the field: just a big star with its number
export const MCARD_W = 26, MCARD_H = 34;
const mcardCache = new Map();
export function drawMoveCard(x, y, n, { hl = false, lift = 0 } = {}) {
  let c = mcardCache.get(n);
  if (!c) {
    const w = MCARD_W, h = MCARD_H;
    c = canvas(w, h); const X = c.x;
    X.fillStyle = '#05040f'; X.fillRect(1, 0, w - 2, h); X.fillRect(0, 1, w, h - 2);
    X.fillStyle = '#e8c060'; X.fillRect(1, 1, w - 2, h - 2);
    for (let yy = 2; yy < h - 2; yy++) { X.fillStyle = mix('#2c2a80', '#11103c', yy / h); X.fillRect(2, yy, w - 4, 1); }
    const s = starShape(10, '#ffd860', '#05040f');
    X.drawImage(s, Math.round(w / 2 - s.width / 2), 5);
    const g = glyphs(String(n), '#7a1010');
    X.drawImage(g, Math.round(w / 2 - (g.width - 2) / 2) - 1, 9);
    for (let i = 0; i < n; i++) { X.fillStyle = '#ffe070'; X.fillRect(Math.round(w / 2 - (n * 3 - 1) / 2) + i * 3, h - 6, 2, 2); }
    mcardCache.set(n, c);
  }
  y -= lift;
  if (hl) { ctx.fillStyle = '#fff6a0'; ctx.fillRect(x - 2, y - 1, MCARD_W + 4, MCARD_H + 2); ctx.fillRect(x - 1, y - 2, MCARD_W + 2, MCARD_H + 4); }
  ctx.drawImage(c, Math.round(x), Math.round(y));
}

// ---------- pictures ----------
export const IMG = {};
const load = (src) => new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => { console.warn('missing picture', src); res(null); }; im.src = src; });
export async function loadImages(list) {
  const got = await Promise.all(list.map(([, src]) => load(src)));
  list.forEach(([k], i) => { IMG[k] = got[i]; });
}
// character sheets: a column per facing (down, up, left, right), rows 0-3 walk, 4 attack, 5 jump, 6 item
const frameCache = new Map();
function cut(img, sx, sy, w, h, { flip = false, filter = null, ghost = false } = {}) {
  const c = canvas(w, h);
  if (filter) c.x.filter = filter;
  if (flip) { c.x.translate(w, 0); c.x.scale(-1, 1); }
  c.x.drawImage(img, sx, sy, w, h, 0, 0, w, h);
  if (ghost) {
    c.x.setTransform(1, 0, 0, 1, 0, 0); c.x.filter = 'none';
    c.x.globalCompositeOperation = 'source-atop'; c.x.fillStyle = 'rgba(150,220,255,0.55)'; c.x.fillRect(0, 0, w, h);
  }
  return c;
}
const DIRS = { d: 0, u: 1, l: 2, r: 3 };
export function walkFrames(sheet, dir) {
  const key = 'w:' + sheet + dir;
  if (frameCache.has(key)) return frameCache.get(key);
  const img = IMG['c:' + sheet];
  const out = img ? [0, 1, 2, 3].map((k) => cut(img, DIRS[dir] * 16, k * 16, 16, 16)) : [canvas(16, 16)];
  frameCache.set(key, out);
  return out;
}
// a fighter's poses for the battle screen: idle frames, attack, jump, item
export function fighterArt(spec, facing) {
  const key = 'f:' + JSON.stringify(spec) + facing;
  if (frameCache.has(key)) return frameCache.get(key);
  let art;
  const filter = spec.hue ? 'hue-rotate(' + spec.hue + 'deg) saturate(1.3)' : null;
  if (spec.k === 'c') {
    const img = IMG['c:' + spec.n];
    const col = facing === 'r' ? 3 : 2;
    const f = (row, c = col) => (img ? cut(img, c * 16, row * 16, 16, 16, { filter, ghost: spec.ghost }) : canvas(16, 16));
    art = { idle: [f(0), f(1), f(0), f(3)], atk: f(4), jump: f(5), item: f(6, 0), front: f(0, 0), w: 16, h: 16 };
  } else if (spec.k === 'm') {
    const img = IMG['m:' + spec.n];
    const col = facing === 'r' ? 3 : 2;
    const f = (row) => (img ? cut(img, col * 16, row * 16, 16, 16, { filter }) : canvas(16, 16));
    const fr = [f(0), f(1), f(2), f(3)];
    art = { idle: fr, atk: fr[1], jump: fr[2], item: fr[0], front: fr[0], w: 16, h: 16 };
  } else {
    const img = IMG['b:' + spec.n];
    const fw = spec.fw || (img ? img.height : 48), fh = img ? img.height : 48, n = img ? Math.floor(img.width / fw) : 1;
    const fr = [];
    for (let i = 0; i < n; i++) fr.push(img ? cut(img, i * fw, 0, fw, fh, { filter }) : canvas(fw, fh));
    // trim the empty margins shared by every frame, so the creature stands on the ground
    let x0 = fw, y0 = fh, x1 = -1, y1 = -1;
    for (const c of fr) {
      const d = c.x.getImageData(0, 0, fw, fh).data;
      for (let y = 0; y < fh; y++) for (let x = 0; x < fw; x++) if (d[(y * fw + x) * 4 + 3] > 20) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    }
    const tw = x1 >= x0 ? x1 - x0 + 1 : fw, th = y1 >= y0 ? y1 - y0 + 1 : fh;
    const trimmed = x1 >= x0 ? fr.map((c) => { const t = canvas(tw, th); t.x.drawImage(c, -x0, -y0); return t; }) : fr;
    art = { idle: trimmed, atk: trimmed[Math.min(1, n - 1)], jump: trimmed[0], item: trimmed[0], front: trimmed[0], w: tw, h: th, big: true, cs: spec.cs || null, ss: spec.ss || 1 };
  }
  frameCache.set(key, art);
  return art;
}
// a solid silhouette (hit flash, afterimages)
const silCache = new Map();
export function silhouette(src, col) {
  let m = silCache.get(src);
  if (!m) { m = new Map(); silCache.set(src, m); }
  let c = m.get(col);
  if (!c) {
    c = canvas(src.width, src.height);
    c.x.drawImage(src, 0, 0); c.x.globalCompositeOperation = 'source-atop'; c.x.fillStyle = col; c.x.fillRect(0, 0, c.width, c.height);
    m.set(col, c);
  }
  return c;
}
// gold-tinted copy (the Golden Flame)
export function goldTint(src) {
  let m = silCache.get(src);
  if (!m) { m = new Map(); silCache.set(src, m); }
  let c = m.get('gold');
  if (!c) {
    // each pixel keeps its shading but moves towards a bright gold ramp; outlines stay dark
    c = canvas(src.width, src.height);
    c.x.drawImage(src, 0, 0);
    const id = c.x.getImageData(0, 0, c.width, c.height), d = id.data;
    const lo = [140, 62, 0], hi = [255, 226, 96];
    for (let i = 0; i < d.length; i += 4) {
      if (!d[i + 3]) continue;
      const l = (0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2]) / 255;
      if (l < 0.13) { d[i] = 58; d[i + 1] = 26; d[i + 2] = 6; continue; }
      const k = Math.min(1, 0.42 + l * 0.9);
      for (let j = 0; j < 3; j++) d[i + j] = Math.round(d[i + j] * 0.25 + (lo[j] + (hi[j] - lo[j]) * k) * 0.75);
    }
    c.x.putImageData(id, 0, 0);
    m.set('gold', c);
  }
  return c;
}
export function face(name) { return IMG['f:' + name] || null; }
// effect strips: name -> [frame width, frames]
export const FX = { explosion: [40, 9], spark: [27, 10], circle: [32, 4], cutx: [32, 4], shield: [24, 6], smoke: [32, 6], thunder: [20, 8], boost: [53, 8], rock: [30, 14] };
export function fxDraw(name, i, x, y, scale = 1, alpha = 1) {
  const img = IMG['x:' + name];
  if (!img) return;
  const [fw, n] = FX[name];
  i = Math.floor(i);
  if (i < 0 || i >= n) return;
  const fh = img.height;
  ctx.globalAlpha = alpha;
  ctx.drawImage(img, i * fw, 0, fw, fh, Math.round(x - (fw * scale) / 2), Math.round(y - (fh * scale) / 2), fw * scale, fh * scale);
  ctx.globalAlpha = 1;
}
export function itemIcon(icon, x, y) {
  if (icon === 'starfruit') { drawStar(x + 8, y + 8, 6, '#ffd040', '#6a3008'); ctx.fillStyle = '#fff8c0'; ctx.fillRect(x + 6, y + 6, 2, 1); ctx.fillStyle = '#50a040'; ctx.fillRect(x + 8, y + 1, 2, 2); return; }
  const img = IMG['i:' + icon];
  if (img) ctx.drawImage(img, Math.round(x + (16 - img.width) / 2), Math.round(y + (16 - img.height) / 2));
}

// ---------- skies ----------
// theme: { sky: [top, mid, horizon], far, near, ground, accent, planet, stars }
const skyCache = new Map();
export function paintSky(th, w = W, h = 136, groundY = 118) {
  const key = JSON.stringify(th) + w + 'x' + h + groundY;
  let c = skyCache.get(key);
  if (c) return c;
  c = canvas(w, h); const X = c.x;
  const [a, b, d] = th.sky;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x += 1) {
    const t = y / groundY;
    const v = t + (bayer(x, y) - 0.5) * 0.09;
    const col = v < 0.55 ? mix(a, b, Math.floor((v / 0.55) * 6) / 6) : mix(b, d, Math.min(1, Math.floor(((v - 0.55) / 0.45) * 6) / 6));
    X.fillStyle = col; X.fillRect(x, y, 1, 1);
  }
  // stars
  const ns = th.stars == null ? 70 : th.stars;
  for (let i = 0; i < ns; i++) {
    const x = Math.floor(hash(i, 3, w) * w), y = Math.floor(Math.pow(hash(i, 4, h), 1.6) * groundY * 0.8);
    X.fillStyle = hash(i, 5) < 0.2 ? '#fff6c0' : hash(i, 6) < 0.5 ? '#c8d0ff' : '#8088c8';
    X.fillRect(x, y, 1, 1);
  }
  // a planet or moon
  if (th.planet) {
    const [px, py, pr, pc] = th.planet;
    for (let y = -pr; y <= pr; y++) for (let x = -pr; x <= pr; x++) {
      const dd = Math.hypot(x, y);
      if (dd > pr) continue;
      const lit = (x * -0.6 + y * -0.5) / pr + 0.35 + (bayer(x + 64, y + 64) - 0.5) * 0.25;
      X.fillStyle = lit > 0.5 ? mix(pc, '#ffffff', 0.35) : lit > 0 ? pc : lit > -0.45 ? mix(pc, '#100820', 0.5) : mix(pc, '#05040f', 0.78);
      X.fillRect(px + x, py + y, 1, 1);
    }
    if (th.ring) { X.strokeStyle = mix(pc, '#ffffff', 0.4); X.lineWidth = 1; X.beginPath(); X.ellipse(px + 0.5, py + 0.5, pr * 1.8, pr * 0.42, -0.25, 0, Math.PI * 2); X.stroke(); }
  }
  // far ridge and near ridge
  const ridge = (col, base, amp, freq, seed) => {
    for (let x = 0; x < w; x++) {
      const n = Math.sin(x * freq + seed) * 0.5 + Math.sin(x * freq * 2.3 + seed * 1.7) * 0.3 + Math.sin(x * freq * 5.1 + seed * 0.3) * 0.2;
      const top = Math.round(base - amp * (0.5 + n * 0.5));
      X.fillStyle = col; X.fillRect(x, top, 1, groundY - top + 1);
      X.fillStyle = mix(col, '#ffffff', 0.12); X.fillRect(x, top, 1, 1);
    }
  };
  if (th.far) ridge(th.far, groundY - 6, th.farAmp || 34, th.farF || 0.035, 1.3);
  if (th.near) ridge(th.near, groundY + 2, th.nearAmp || 16, th.nearF || 0.06, 4.1);
  // ground
  for (let y = groundY; y < h; y++) {
    const t = (y - groundY) / (h - groundY);
    for (let x = 0; x < w; x++) {
      const v = t + (bayer(x, y) - 0.5) * 0.3;
      X.fillStyle = v < 0.3 ? mix(th.ground, '#ffffff', 0.08) : v < 0.7 ? th.ground : mix(th.ground, '#05040f', 0.35);
      X.fillRect(x, y, 1, 1);
    }
  }
  if (th.accent) { X.fillStyle = th.accent; X.fillRect(0, groundY, w, 1); }
  skyCache.set(key, c);
  return c;
}
// a bright line of twinkling stars on top of a painted sky
export function drawTwinkles(t, n = 12, maxY = 90, seed = 0) {
  for (let i = 0; i < n; i++) {
    const ph = (t / 30 + hash(i, 9, seed) * 10) % 4;
    if (ph > 1) continue;
    twinkle(Math.floor(hash(i, 7, seed) * W), Math.floor(hash(i, 8, seed) * maxY), '#ffffff', ph > 0.3 && ph < 0.7);
  }
}
