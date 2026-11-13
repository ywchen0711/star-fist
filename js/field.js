// The board: painting a region's star chart, picking a movement card and walking its star number
// along the paths. Story scenes wait on event spots; fights, towns, springs and chests on others.
import { ctx, W, H, canvas, text, textW, windowBox, mix, hash, bayer, drawMoveCard, MCARD_W, drawStar, walkFrames, twinkle, cursor, bar } from './gfx.js';
import { input } from './input.js';
import { sfx } from './audio.js';
import { push, UI, wrap } from './ui.js';
import { L, tn } from './i18n.js';
import { BOARDS } from './maps.js';
import { S, moveHand } from './state.js';
import { maxHp } from './rules.js';

export const FIELD = { board: null, objective: null, objText: null, t: 0, facing: 'd', anim: null, walkT: 0 };
const TOP = 18, BOT = 166;
export const node = (id) => FIELD.board && FIELD.board.nodes[id];

// ---------- painting ----------
const paintCache = new Map();
function distToSeg(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy;
  const t = l ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l)) : 0;
  return Math.hypot(px - ax - t * dx, py - ay - t * dy);
}
function paintBoard(id) {
  if (paintCache.has(id)) return paintCache.get(id);
  const b = BOARDS[id], lk = b.look, c = canvas(W, H), X = c.x;
  const nodes = Object.values(b.nodes);
  const near = (x, y, r) => nodes.some((n) => Math.hypot(n.x - x, n.y - y) < r) || nodes.some((n) => n.links.some((o) => distToSeg(x, y, n.x, n.y, b.nodes[o].x, b.nodes[o].y) < r * 0.6));
  // ground
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const n = Math.sin(x * 0.05 + y * 0.03) * 0.5 + Math.sin(x * 0.013 - y * 0.041 + 2) * 0.5 + hash(x >> 3, y >> 3, 7) * 0.4;
    X.fillStyle = n + (bayer(x, y) - 0.5) * 0.5 > 0.35 ? lk.alt : lk.base;
    X.fillRect(x, y, 1, 1);
  }
  if (lk.deco === 'lava') {
    for (let i = 0; i < 9; i++) {
      let x = hash(i, 1, 5) * W, y = TOP + hash(i, 2, 5) * (BOT - TOP);
      for (let s = 0; s < 40; s++) { x += (hash(i, s, 3) - 0.5) * 6; y += (hash(i, s, 4) - 0.3) * 4; X.fillStyle = s % 5 ? '#c83818' : '#ffb040'; X.fillRect(Math.round(x), Math.round(y), 2, 1); }
    }
  }
  if (lk.deco === 'metal') {
    X.fillStyle = mix(lk.base, '#000000', 0.3);
    for (let x = 0; x < W; x += 24) X.fillRect(x, 0, 1, H);
    for (let y = 0; y < H; y += 24) X.fillRect(0, y, W, 1);
    for (let i = 0; i < 40; i++) { X.fillStyle = i % 3 ? '#c070ff' : '#60e0ff'; X.fillRect(Math.floor(hash(i, 1, 9) * 11) * 24 + 2, Math.floor(hash(i, 2, 9) * 10) * 24 + 2, 2, 1); }
  }
  if (lk.river) {
    const pts = lk.river;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      let d = 1e9;
      for (let i = 0; i < pts.length - 1; i++) d = Math.min(d, distToSeg(x, y, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]));
      if (d < 9) { X.fillStyle = d < 3 ? '#4a9ac0' : d < 7 ? (bayer(x, y) < 0.5 ? '#2a6a98' : '#2c78a0') : '#1c4a5a'; X.fillRect(x, y, 1, 1); }
      if (d < 7 && hash(x, y, 2) < 0.015) { X.fillStyle = '#c8f0ff'; X.fillRect(x, y, 2, 1); }
    }
  }
  for (const [px, py, s] of lk.peaks || []) {
    for (let y = 0; y < s; y++) {
      const half = Math.round((y / s) * s * 0.8);
      for (let x = -half; x <= half; x++) {
        X.fillStyle = y < s * 0.3 ? '#e8ecff' : x < 0 ? '#5a5070' : '#3a3450';
        X.fillRect(px + x, py + y, 1, 1);
      }
    }
  }
  // scattered decoration away from the paths
  for (let i = 0; i < 260; i++) {
    const x = Math.floor(hash(i, 11, id.length) * W), y = Math.floor(TOP + 4 + hash(i, 12, id.length) * (BOT - TOP - 4));
    if (near(x, y, 13)) continue;
    if (lk.deco === 'pine') {
      for (let k = 0; k < 7; k++) { X.fillStyle = k < 2 ? '#3a7a50' : '#1a4a30'; X.fillRect(x - Math.floor(k / 2), y + k, 1 + Math.floor(k / 2) * 2, 1); }
      X.fillStyle = '#4a2a1a'; X.fillRect(x, y + 7, 1, 2);
    } else if (lk.deco === 'reed') {
      X.fillStyle = '#7ab060'; X.fillRect(x, y, 1, 4); X.fillRect(x + 2, y + 1, 1, 3); X.fillStyle = '#c8a050'; X.fillRect(x, y - 1, 1, 1);
    } else if (lk.deco === 'rock') {
      X.fillStyle = '#2a1a14'; X.fillRect(x - 3, y, 7, 4); X.fillStyle = '#8a6a50'; X.fillRect(x - 2, y, 5, 3); X.fillStyle = '#b89070'; X.fillRect(x - 1, y, 2, 1);
    } else if (lk.deco === 'grass') {
      X.fillStyle = '#7ad080'; X.fillRect(x, y, 1, 2); X.fillRect(x + 2, y - 1, 1, 3); if (i % 5 === 0) { X.fillStyle = i % 2 ? '#ffe0f0' : '#fff080'; X.fillRect(x + 1, y - 2, 1, 1); }
    } else if (lk.deco === 'lava' && i % 3 === 0) {
      X.fillStyle = '#1a0a0a'; X.fillRect(x - 2, y, 5, 3); X.fillStyle = '#5a3a34'; X.fillRect(x - 1, y, 3, 1);
    } else if (lk.deco === 'metal' && i % 4 === 0) {
      X.fillStyle = '#3a3a60'; X.fillRect(x - 3, y, 6, 4); X.fillStyle = '#8888b8'; X.fillRect(x - 3, y, 6, 1);
    }
  }
  if (lk.clouds) {
    for (let i = 0; i < 7; i++) {
      const cx = hash(i, 1, 4) * W, cy = TOP + hash(i, 2, 4) * (BOT - TOP);
      for (let y = -4; y <= 4; y++) for (let x = -26; x <= 26; x++) if ((x * x) / 676 + (y * y) / 16 < 1 && bayer(x + 99, y + 99) < 0.32) { X.fillStyle = '#e8f8ff'; X.fillRect(Math.round(cx + x), Math.round(cy + y), 1, 1); }
    }
  }
  // the edges dissolve into deep space with stars: this is a star chart after all
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const e = Math.min(x, W - 1 - x, (y - TOP + 6) * 1.4, (BOT + 4 - y) * 1.4);
    const k = 1 - e / 22;
    if (k > bayer(x, y)) { X.fillStyle = '#07061a'; X.fillRect(x, y, 1, 1); if (hash(x, y, 3) < 0.02) { X.fillStyle = hash(x, y, 4) < 0.3 ? '#fff6c0' : '#8088d0'; X.fillRect(x, y, 1, 1); } }
  }
  // towns, springs
  for (const n of nodes) {
    if (n.k === 't') {
      for (const [dx, dy] of [[-9, -6], [5, -9], [-2, 2]]) house(X, n.x + dx, n.y + dy);
    }
    if (n.k === 's') { X.fillStyle = '#1c4a6a'; X.beginPath(); X.ellipse(n.x, n.y + 1, 8, 4, 0, 0, Math.PI * 2); X.fill(); X.fillStyle = '#5ac8f0'; X.beginPath(); X.ellipse(n.x, n.y + 1, 6, 3, 0, 0, Math.PI * 2); X.fill(); }
  }
  if (lk.lanterns) for (let i = 0; i < 10; i++) { const x = 40 + i * 20, y = 30 + Math.sin(i) * 4; X.fillStyle = '#5a3a2a'; X.fillRect(x - 10, y - 2, 20, 1); X.fillStyle = i % 2 ? '#ff6040' : '#ffd060'; X.fillRect(x, y, 2, 3); }
  paintCache.set(id, c);
  return c;
}
function house(X, x, y) {
  X.fillStyle = '#05040f'; X.fillRect(x - 5, y - 4, 11, 9);
  X.fillStyle = '#b84030'; for (let k = 0; k < 4; k++) X.fillRect(x - 4 + k, y - 4 + k - 0, 9 - k * 2, 1);
  X.fillStyle = '#e8d8b0'; X.fillRect(x - 3, y, 7, 4);
  X.fillStyle = '#ffd870'; X.fillRect(x - 2, y + 1, 2, 2);
  X.fillStyle = '#4a2a1a'; X.fillRect(x + 1, y + 1, 2, 3);
}

// ---------- drawing ----------
const done = (n) => n.k === 'c' && S.flags['chest_' + S.chapter + '_' + n.id];
export function drawField(objId, opts = {}) {
  const b = FIELD.board;
  if (!b) return;
  FIELD.t++;
  const t = FIELD.t;
  ctx.drawImage(paintBoard(S.chapter), 0, 0);
  // paths: constellation lines
  const drawn = new Set();
  const cur = node(S.node);
  for (const n of Object.values(b.nodes)) for (const o of n.links) {
    const key = n.id < o ? n.id + o : o + n.id;
    if (drawn.has(key)) continue;
    drawn.add(key);
    const m = b.nodes[o];
    const hot = opts.moving && cur && ((cur.id === n.id) || (cur.id === m.id));
    const len = Math.hypot(m.x - n.x, m.y - n.y), steps = Math.floor(len / 3);
    for (let i = 1; i < steps; i++) {
      const x = Math.round(n.x + ((m.x - n.x) * i) / steps), y = Math.round(n.y + ((m.y - n.y) * i) / steps);
      ctx.fillStyle = '#05040f'; ctx.fillRect(x - 1, y - 1, 3, 3);
      ctx.fillStyle = hot ? ((i + (t >> 2)) % 3 === 0 ? '#ffffff' : '#ffe070') : '#a8b0e8';
      ctx.fillRect(x, y, 1, 1);
    }
  }
  // nodes
  for (const n of Object.values(b.nodes)) {
    const isObj = n.id === objId;
    if (n.k === 'f') drawStar(n.x, n.y, 4, '#ff5a48');
    else if (n.k === 't') { /* the houses are painted */ ctx.fillStyle = '#ffd870'; ctx.fillRect(n.x - 1, n.y + 6, 3, 1); }
    else if (n.k === 's') { ctx.fillStyle = '#ffffff'; ctx.fillRect(n.x - 1, n.y, 3, 1); }
    else if (n.k === 'c') chest(n.x, n.y, done(n));
    else if (n.k === 'e') drawStar(n.x, n.y, isObj ? 5 : 3, isObj ? ((t >> 3) % 2 ? '#fff6a0' : '#ffd040') : '#8a88b8');
    else { ctx.fillStyle = '#05040f'; ctx.fillRect(n.x - 2, n.y - 1, 5, 3); ctx.fillRect(n.x - 1, n.y - 2, 3, 5); ctx.fillStyle = '#d8e0ff'; ctx.fillRect(n.x - 1, n.y, 3, 1); ctx.fillRect(n.x, n.y - 1, 1, 3); }
    if (isObj && n.k !== 'e') { const r = 7 + ((t >> 2) % 4); ctx.strokeStyle = '#ffe070'; ctx.globalAlpha = 0.8; ctx.strokeRect(n.x - r, n.y - r, r * 2, r * 2); ctx.globalAlpha = 1; }
    if (isObj) { twinkle(n.x + 6, n.y - 8, '#fff', (t >> 3) % 2 === 0); }
  }
  // Kai
  const a = FIELD.anim;
  let px = cur ? cur.x : 0, py = cur ? cur.y : 0, hop = 0;
  if (a) { const k = Math.min(1, a.t / a.n); px = a.x0 + (a.x1 - a.x0) * k; py = a.y0 + (a.y1 - a.y0) * k; hop = Math.sin(k * Math.PI) * 4; }
  const fr = walkFrames('SamuraiBlue', FIELD.facing);
  const img = fr[a ? Math.floor(a.t / 4) % 4 : Math.floor(t / 24) % 2 === 0 ? 0 : 0];
  ctx.fillStyle = 'rgba(5,4,15,0.5)'; ctx.beginPath(); ctx.ellipse(px, py + 2, 5, 2, 0, 0, Math.PI * 2); ctx.fill();
  ctx.drawImage(img, Math.round(px - 8), Math.round(py - 14 - hop));
  // top bar
  windowBox(0, 0, W, TOP + 1);
  text(tn(b.name), 8, 3, '#ffe070');
  text('◎ ' + S.coins, W - 8, 3, '#f8e8a0', { align: 'right' });
  const lead = S.party[0];
  if (opts.pick) text(L('X:選單', 'X: menu'), 200, 3, '#9898c8', { align: 'right' });
}
function chest(x, y, open) {
  ctx.fillStyle = '#05040f'; ctx.fillRect(x - 4, y - 3, 9, 7);
  ctx.fillStyle = open ? '#5a5a6a' : '#c88a30'; ctx.fillRect(x - 3, y - 2, 7, 5);
  ctx.fillStyle = open ? '#3a3a48' : '#ffd060'; ctx.fillRect(x - 3, y - 2, 7, 1); ctx.fillRect(x, y, 1, 1);
}
// the bottom panel: objective and the hand
export function drawHand(sel, { steps = null, info = null } = {}) {
  windowBox(0, BOT + 2, W, H - BOT - 2);
  const lines = wrap(FIELD.objText || '', 100).slice(0, 3);
  text(L('目標', 'Goal'), 8, BOT + 5, '#ffe070');
  lines.forEach((l, i) => text(l, 8, BOT + 17 + i * 12, '#e0e4ff'));
  if (steps != null) {
    text(L('剩餘步數', 'Steps left'), 176, BOT + 6, '#a8c8ff', { align: 'center' });
    drawStar(176, BOT + 28, 11, '#ffd860');
    text(String(steps), 176, BOT + 22, '#7a1010', { align: 'center', shadow: null });
    text(FIELD.hint || '', 176, BOT + 39, '#9898c8', { align: 'center' });
    return;
  }
  S.hand.forEach((n, i) => drawMoveCard(112 + i * (MCARD_W + 2), BOT + 10, n, { hl: i === sel, lift: i === sel ? 4 : 0 }));
}

// ---------- the turn ----------
// choose a movement card: resolves with its index, or 'menu'
export function pickCard(autoPick) {
  moveHand();
  return push({
    isPick: true,
    sel: Math.min(2, S.hand.length - 1),
    update() {
      if (UI.auto) { if (this.age > 1) this.done(autoPick ? autoPick() : 0); return; }
      if (input.repeat('left')) { this.sel = (this.sel + S.hand.length - 1) % S.hand.length; sfx('card'); }
      if (input.repeat('right')) { this.sel = (this.sel + 1) % S.hand.length; sfx('card'); }
      if (input.pressed('a') && this.age > 3) { sfx('ok'); this.done(this.sel); }
      else if ((input.pressed('b') || input.pressed('menu')) && this.age > 3) { sfx('ok'); this.done('menu'); }
    },
    draw() {
      FIELD.hint = L('Z選牌 X選單', 'Z: card  X: menu');
      drawHand(this.sel);
    },
  });
}
// which neighbour lies in the direction pressed
function neighbourToward(cur, d) {
  const v = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[d];
  let best = null, bs = 0.35;
  for (const id of cur.links) {
    const n = node(id), dx = n.x - cur.x, dy = n.y - cur.y, l = Math.hypot(dx, dy);
    const s = (dx * v[0] + dy * v[1]) / l;
    if (s > bs) { bs = s; best = id; }
  }
  return best;
}
// shortest path between nodes (for the auto-player and the hint)
export function pathTo(from, to) {
  const prev = { [from]: null }, q = [from];
  while (q.length) {
    const c = q.shift();
    if (c === to) break;
    for (const n of node(c).links) if (!(n in prev)) { prev[n] = c; q.push(n); }
  }
  if (!(to in prev)) return null;
  const out = [];
  for (let c = to; c !== from; c = prev[c]) out.unshift(c);
  return out;
}
// walk up to n steps. onArrive(nodeId) may return 'stop' (an event spot). Resolves with the final node id.
export function walkSteps(n, onArrive, autoNext) {
  return push({
    steps: n, moving: false,
    update() {
      const a = FIELD.anim;
      if (a) {
        a.t += UI.auto ? a.n : 1;
        if (a.t >= a.n) {
          FIELD.anim = null; S.node = a.to; this.steps--; S.steps++;
          sfx('step');
          const r = onArrive(a.to);
          if (r === 'stop' || this.steps <= 0) { this.done(S.node); }
        }
        return;
      }
      let next = null;
      if (UI.auto) next = autoNext ? autoNext() : null;
      else {
        if (input.pressed('a') && this.age > 4) { sfx('ok'); this.done(S.node); return; }
        const d = ['up', 'down', 'left', 'right'].find((k) => input.repeat(k));
        if (d) { next = neighbourToward(node(S.node), d); if (!next) sfx('buzz'); }
      }
      if (UI.auto && !next) { this.done(S.node); return; }
      if (next) {
        const c = node(S.node), m = node(next);
        FIELD.facing = Math.abs(m.x - c.x) > Math.abs(m.y - c.y) ? (m.x > c.x ? 'r' : 'l') : m.y > c.y ? 'd' : 'u';
        FIELD.anim = { x0: c.x, y0: c.y, x1: m.x, y1: m.y, t: 0, n: 12, to: next };
      }
    },
    draw() {
      FIELD.hint = L('方向鍵走 Z停', 'Arrows · Z: stop');
      drawHand(null, { steps: this.steps });
      // arrows to the neighbours
      if (!FIELD.anim) {
        const c = node(S.node);
        for (const id of c.links) {
          const m = node(id), dx = m.x - c.x, dy = m.y - c.y, l = Math.hypot(dx, dy);
          const x = Math.round(c.x + (dx / l) * 11), y = Math.round(c.y + (dy / l) * 11);
          ctx.fillStyle = '#05040f'; ctx.fillRect(x - 2, y - 2, 5, 5);
          ctx.fillStyle = (FIELD.t >> 3) % 2 ? '#ffe070' : '#ffffff'; ctx.fillRect(x - 1, y - 1, 3, 3);
        }
      }
    },
  });
}
export function setBoard(id) {
  FIELD.board = BOARDS[id];
  S.chapter = id;
  if (!S.node || !FIELD.board.nodes[S.node]) S.node = FIELD.board.start;
}
void textW; void cursor;
