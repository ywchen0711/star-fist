// Dialogue boxes, choices, list menus and notices. Each returns a promise, so story scripts are
// plain async code; the main loop feeds the top window input and draws the whole stack.
import { ctx, W, H, text, textW, windowBox, cursor, face } from './gfx.js';
import { input } from './input.js';
import { sfx } from './audio.js';
import { L, tn } from './i18n.js';
import { PEOPLE } from './data.js';

const stack = [];
export const UI = {
  auto: false, // tests and auto-play: windows answer themselves
  get active() { return stack.length > 0; },
  get top() { return stack[stack.length - 1]; },
  update() { const t = stack[stack.length - 1]; if (t) { t.age = (t.age || 0) + 1; t.update(); } },
  draw() { for (const w of stack) w.draw(); },
  // abandon every open window: whatever awaits them unwinds back to the title loop
  clear() { const ws = stack.slice(); stack.length = 0; for (const w of ws) w.fail && w.fail(new Error('__title__')); },
};
let frame = 0;
export function uiTick() { frame++; }
export function push(w) { stack.push(w); return new Promise((res, rej) => { w.done = (v) => { const i = stack.indexOf(w); if (i >= 0) stack.splice(i, 1); res(v); }; w.fail = rej; }); }

export function wrap(s, w) {
  const out = [];
  for (const para of String(s).split('\n')) {
    let line = '';
    for (const ch of para.match(/[A-Za-z0-9'".,!?:;()%\-+/]+ ?|./gu) || []) {
      if (textW(line + ch) > w && line) {
        if ('，。、！？」』）…：；,.!?'.includes(ch)) { out.push(line + ch); line = ''; continue; }
        out.push(line.trimEnd()); line = ch.trimStart();
      } else line += ch;
    }
    out.push(line);
  }
  return out;
}

// ---------- dialogue ----------
// who: a key of PEOPLE (or null for narration); zh/en: the line
export function say(who, zh, en, { top = false } = {}) {
  const p = who ? PEOPLE[who] || { name: [who, who], face: null } : null;
  const name = p && p.name ? tn(p.name) : null;
  const pic = p && p.face ? face(p.face) : null;
  const msg = L(zh, en == null ? zh : en);
  const tw = pic ? 186 : 230;
  const lines = wrap(msg, tw);
  const pages = [];
  for (let i = 0; i < lines.length; i += 3) pages.push(lines.slice(i, i + 3));
  const box = {
    page: 0, shown: 0, y: top ? 6 : H - 64,
    update() {
      const total = pages[this.page].join('').length;
      if (UI.auto) { if (this.age > 1) { if (this.page < pages.length - 1) { this.page++; this.age = 0; } else this.done(); } return; }
      if (this.shown < total) {
        this.shown += input.held('a') || input.held('b') ? 3 : 1;
        if (frame % 3 === 0) sfx('text');
        if (input.pressed('a') && this.age > 3) this.shown = total;
        return;
      }
      if (input.pressed('a') || input.pressed('b')) {
        sfx('cursor');
        if (this.page < pages.length - 1) { this.page++; this.shown = 0; } else this.done();
      }
    },
    draw() {
      windowBox(4, this.y, W - 8, 60);
      let tx = 14;
      if (pic) {
        ctx.fillStyle = '#05040f'; ctx.fillRect(9, this.y + 10, 42, 42);
        ctx.fillStyle = '#3a3a7a'; ctx.fillRect(10, this.y + 11, 40, 40);
        ctx.drawImage(pic, 11, this.y + 12, 38, 38);
        tx = 58;
      }
      if (name) { windowBox(8, this.y - 14, textW(name) + 14, 17, { accent: '#ffd870' }); text(name, 15, this.y - 11, '#ffe070'); }
      let left = this.shown;
      pages[this.page].forEach((ln, i) => {
        const part = ln.slice(0, Math.max(0, left));
        left -= ln.length;
        text(part, tx, this.y + 9 + i * 15);
      });
      const total = pages[this.page].join('').length;
      if (this.shown >= total && (frame >> 4) % 2) cursor(W - 18, this.y + 50, 0, true);
    },
  };
  return push(box);
}
// several lines in a row: [[who, zh, en], ...]
export async function talk(lines) { for (const [who, zh, en] of lines) await say(who, zh, en); }

// ---------- a list menu ----------
// items: [{ label, sub?, disabled?, icon?(x,y) }]; returns the index or -1 (cancel)
export function menu(items, { x = 8, y = 8, w = null, title = null, cancel = true, auto = null, start = 0, rows = 8, onMove = null, hint = null } = {}) {
  const width = w || Math.min(240, Math.max(70, ...items.map((it) => textW(it.label) + (it.sub ? textW(it.sub) + 16 : 0) + 30)), title ? textW(title) + 20 : 0);
  const vis = Math.min(rows, items.length);
  const h = vis * 15 + 10 + (title ? 15 : 0);
  const m = {
    sel: Math.max(0, Math.min(items.length - 1, start)), top: 0,
    update() {
      if (UI.auto) { if (this.age > 1) this.done(auto ? auto() : Math.max(0, items.findIndex((it) => !it.disabled))); return; }
      const n = items.length;
      if (input.repeat('down')) { this.sel = (this.sel + 1) % n; sfx('cursor'); onMove && onMove(this.sel); }
      if (input.repeat('up')) { this.sel = (this.sel + n - 1) % n; sfx('cursor'); onMove && onMove(this.sel); }
      if (this.sel < this.top) this.top = this.sel;
      if (this.sel >= this.top + vis) this.top = this.sel - vis + 1;
      if (input.pressed('a') && this.age > 2) {
        if (items[this.sel].disabled) { sfx('buzz'); return; }
        sfx('ok'); this.done(this.sel);
      } else if (input.pressed('b') && cancel && this.age > 2) { sfx('cancel'); this.done(-1); }
    },
    draw() {
      const yy = typeof y === 'function' ? y(h) : y, xx = typeof x === 'function' ? x(width) : x;
      windowBox(xx, yy, width, h);
      let oy = yy + 6;
      if (title) { text(title, xx + 10, oy, '#ffe070'); oy += 15; }
      for (let i = 0; i < vis; i++) {
        const k = this.top + i, it = items[k];
        if (!it) continue;
        const col = it.disabled ? '#6a6890' : it.col || '#f4f4ff';
        let tx = xx + 16;
        if (it.icon) { it.icon(tx, oy - 2); tx += 18; }
        text(it.label, tx, oy, col);
        if (it.sub) text(it.sub, xx + width - 8, oy, it.disabled ? '#6a6890' : it.subCol || '#a8c8ff', { align: 'right' });
        if (k === this.sel) cursor(xx + 6, oy + 5, frame);
        oy += 15;
      }
      if (this.top > 0) cursor(xx + width / 2, yy + 2, 0, false);
      if (hint) hint(this.sel, xx, yy, width, h);
    },
  };
  return push(m);
}
export async function ask(zh, en, options, opt = {}) {
  // a question in a dialogue box with choices next to it
  const q = push({ update() {}, draw() { windowBox(4, H - 64, W - 8, 60); wrap(L(zh, en), 230).slice(0, 3).forEach((ln, i) => text(ln, 14, H - 55 + i * 15)); } });
  void q;
  const r = await menu(options.map((o) => ({ label: o })), { x: (w) => W - w - 8, y: (h) => H - 70 - h, cancel: false, ...opt });
  UI.top && UI.top.done && UI.top.done(null);
  return r;
}
// a short notice that closes itself (or with a key)
export function notice(zh, en, { frames = 70, y = 80 } = {}) {
  const msg = L(zh, en == null ? zh : en);
  const lines = wrap(msg, 220);
  return push({
    update() { if (UI.auto ? this.age > 1 : (this.age > frames || (this.age > 8 && (input.pressed('a') || input.pressed('b'))))) this.done(); },
    draw() {
      const w = Math.min(236, Math.max(...lines.map((l) => textW(l))) + 24), h = lines.length * 15 + 12;
      windowBox((W - w) / 2, y, w, h);
      lines.forEach((l, i) => text(l, W / 2, y + 7 + i * 15, '#f4f4ff', { align: 'center' }));
    },
  });
}
export function wait(frames) { return push({ update() { if (this.age >= (UI.auto ? 1 : frames)) this.done(); }, draw() {} }); }
// a custom full window (status screens etc.)
export function widget(w) { return push(w); }
