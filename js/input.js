// Keyboard, gamepad and on-screen touch buttons, read once per frame.
const MAP = {
  ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
  KeyZ: 'a', Enter: 'a', Space: 'a', KeyJ: 'a', KeyX: 'b', Escape: 'b', Backspace: 'b', KeyK: 'b', KeyC: 'menu', Tab: 'menu',
};
const KEYS = ['up', 'down', 'left', 'right', 'a', 'b', 'menu'];
const down = new Set(), was = new Set(), touch = new Set();
const age = {};
let pad = new Set();
// presses that happened between frames (a fast tap can go down and up inside one frame)
const tapped = new Set();
// synthetic presses for tests and auto-play
const fake = new Set();
export let lastDevice = 'key';
if (typeof addEventListener !== 'undefined') {
  addEventListener('keydown', (e) => {
    const k = MAP[e.code];
    if (!k) return;
    e.preventDefault();
    if (!e.repeat) tapped.add(k);
    down.add(k); lastDevice = 'key';
  });
  addEventListener('keyup', (e) => { const k = MAP[e.code]; if (k) down.delete(k); });
  addEventListener('blur', () => { down.clear(); touch.clear(); });
}
const isHeld = (k) => down.has(k) || touch.has(k) || pad.has(k) || fake.has(k);
export const input = {
  held: isHeld,
  pressed: (k) => (isHeld(k) && !was.has(k)) || tapped.has(k),
  repeat(k) {
    if (tapped.has(k)) return true;
    if (!isHeld(k)) return false;
    const a = age[k] || 0;
    return a === 1 || (a > 16 && a % 5 === 0);
  },
  dir() { for (const d of ['up', 'down', 'left', 'right']) if (isHeld(d)) return d; return null; },
  press(k) { fake.add(k); },
};
export function pollInput() {
  pad = new Set();
  const gp = typeof navigator !== 'undefined' && navigator.getGamepads ? [...navigator.getGamepads()].find((g) => g) : null;
  if (gp) {
    const b = (i) => gp.buttons[i] && gp.buttons[i].pressed;
    if (b(12) || gp.axes[1] < -0.5) pad.add('up');
    if (b(13) || gp.axes[1] > 0.5) pad.add('down');
    if (b(14) || gp.axes[0] < -0.5) pad.add('left');
    if (b(15) || gp.axes[0] > 0.5) pad.add('right');
    if (b(0)) pad.add('a');
    if (b(1)) pad.add('b');
    if (b(3) || b(9)) pad.add('menu');
    if (pad.size) lastDevice = 'pad';
  }
  for (const k of KEYS) age[k] = isHeld(k) ? (age[k] || 0) + 1 : 0;
}
export function endInput() {
  was.clear();
  for (const k of [...down, ...touch, ...pad, ...fake]) was.add(k);
  tapped.clear();
  fake.clear();
}

export function setupTouch() {
  const el = document.getElementById('touch');
  if (!el) return;
  const show = () => { document.body.classList.add('touching'); lastDevice = 'touch'; };
  addEventListener('touchstart', show, { passive: true, once: true });
  const active = new Map();
  const update = () => { touch.clear(); for (const k of active.values()) if (k) { if (!touch.has(k)) tapped.add(k); touch.add(k); } };
  const hit = (x, y) => { const t = document.elementFromPoint(x, y); return t && t.dataset && t.dataset.k ? t.dataset.k : null; };
  const dpad = el.querySelector('.dpad');
  const dirAt = (x, y) => {
    const r = dpad.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, dx = x - cx, dy = y - cy;
    if (Math.hypot(dx, dy) > r.width * 0.8 || Math.hypot(dx, dy) < r.width * 0.1) return null;
    return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
  };
  const onTouch = (e) => {
    for (const t of e.changedTouches) {
      if (e.type === 'touchend' || e.type === 'touchcancel') { active.delete(t.identifier); continue; }
      const k = hit(t.clientX, t.clientY);
      const inPad = dpad && dpad.contains(document.elementFromPoint(t.clientX, t.clientY));
      const prev = active.get(t.identifier);
      if (inPad || (prev && ['up', 'down', 'left', 'right'].includes(prev))) active.set(t.identifier, dirAt(t.clientX, t.clientY));
      else active.set(t.identifier, k);
    }
    const before = new Set(touch);
    update();
    for (const k of touch) if (before.has(k)) tapped.delete(k);
    e.preventDefault();
  };
  for (const ev of ['touchstart', 'touchmove', 'touchend', 'touchcancel']) el.addEventListener(ev, onTouch, { passive: false });
}
