// The close-up exchanges: rushes, ki blasts, beams, the beam clash where Z is mashed to push back,
// and the Golden Flame awakening. The fighters are the 16x16 pack sprites scaled up; the auras,
// speed lines, beams and shockwaves are drawn in code.
import { ctx, W, H, text, bigText, textW, fighterArt, silhouette, goldTint, fxDraw, mix, hash, view, bar, windowBox } from './gfx.js';
import { input } from './input.js';
import { sfx, hum } from './audio.js';
import { push, UI } from './ui.js';
import { L, tn, num } from './i18n.js';
import { SPECIALS } from './data.js';

export const CINE = { fast: false, mashRate: 7, freeze: null };
const GROUND = 178;

// ---------- drawing pieces ----------
export function drawFighter(art, cx, feet, scale, pose = 'idle', t = 0, { gold = false, flash = false, alpha = 1, flipX = false } = {}) {
  let img = pose === 'idle' ? art.idle[Math.floor(t / 10) % art.idle.length] : art[pose] || art.idle[0];
  if (gold) img = goldTint(img);
  if (flash) img = silhouette(img, '#ffffff');
  const w = img.width * scale, h = img.height * scale;
  ctx.globalAlpha = alpha;
  if (flipX) { ctx.save(); ctx.translate(Math.round(cx), 0); ctx.scale(-1, 1); ctx.drawImage(img, Math.round(-w / 2), Math.round(feet - h), w, h); ctx.restore(); }
  else ctx.drawImage(img, Math.round(cx - w / 2), Math.round(feet - h), w, h);
  ctx.globalAlpha = 1;
  return { w, h };
}
// rising flame tongues around a fighter
export function drawAura(cx, feet, w, h, col, t, power = 1) {
  const n = Math.round(26 * power), lite = mix(col, '#ffffff', 0.55);
  for (let i = 0; i < n; i++) {
    const sp = 0.025 + hash(i, 1) * 0.03;
    const life = (t * sp + hash(i, 2)) % 1;
    const side = hash(i, 3) - 0.5;
    const x = cx + side * w * (1.05 - life * 0.5) + Math.sin(t * 0.2 + i) * 1.5;
    const y = feet - life * h * 1.35;
    const s = Math.max(1, Math.round((1 - life) * 4 * Math.sqrt(power) * (w > 40 ? 1.5 : 1)));
    ctx.globalAlpha = 0.85 * (1 - life * 0.7);
    ctx.fillStyle = life < 0.35 ? lite : col;
    ctx.fillRect(Math.round(x - s / 2), Math.round(y - s), s, s * 2);
  }
  ctx.globalAlpha = Math.min(0.2, 0.06 * power);
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.ellipse(cx, feet - h * 0.5, w * 0.7, h * 0.72, 0, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
}
function speedLines(t, col, dir = 1, dense = 1) {
  for (let i = 0; i < 26 * dense; i++) {
    const y = Math.floor(hash(i, 11) * 200) + 4;
    const len = 20 + hash(i, 12) * 70;
    const sp = 6 + hash(i, 13) * 8;
    let x = ((hash(i, 14) * 400 + t * sp * dir) % 400 + 400) % 400 - 72;
    ctx.globalAlpha = 0.25 + hash(i, 15) * 0.35;
    ctx.fillStyle = i % 4 ? col : '#ffffff';
    ctx.fillRect(Math.round(x), y, Math.round(len), 1);
  }
  ctx.globalAlpha = 1;
}
function radialLines(cx, cy, t, col) {
  ctx.strokeStyle = col; ctx.lineWidth = 1;
  for (let i = 0; i < 40; i++) {
    const a = hash(i, 21) * Math.PI * 2 + t * 0.002, r0 = 60 + ((t * 4 + hash(i, 22) * 200) % 120);
    ctx.globalAlpha = 0.35;
    ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); ctx.lineTo(cx + Math.cos(a) * (r0 + 40), cy + Math.sin(a) * (r0 + 40)); ctx.stroke();
  }
  ctx.globalAlpha = 1;
}
function kiBall(x, y, r, col, t) {
  r = Math.max(1, r);
  ctx.fillStyle = col; ctx.globalAlpha = 0.35;
  ctx.beginPath(); ctx.arc(x, y, r * 1.8 + Math.sin(t * 0.8), 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(x, y, r * 0.55, 0, Math.PI * 2); ctx.fill();
}
// a beam from x0 to x1 at height y; thickness th
function beam(x0, x1, y, th, col, t) {
  const a = Math.min(x0, x1), b = Math.max(x0, x1);
  const lite = mix(col, '#ffffff', 0.5);
  for (let x = Math.floor(a); x <= b; x += 2) {
    const wob = Math.sin(x * 0.35 + t * 0.9) * 1.2 + Math.sin(x * 0.11 - t * 0.5) * 1.0;
    const h1 = th + wob;
    ctx.fillStyle = col; ctx.fillRect(x, Math.round(y - h1), 2, Math.round(h1 * 2));
    ctx.fillStyle = lite; ctx.fillRect(x, Math.round(y - h1 * 0.62), 2, Math.round(h1 * 1.24));
    ctx.fillStyle = '#ffffff'; ctx.fillRect(x, Math.round(y - h1 * 0.28), 2, Math.max(1, Math.round(h1 * 0.56)));
  }
  // sparks streaming along it
  for (let i = 0; i < 10; i++) {
    const k = ((t * 0.05 + hash(i, 31)) % 1);
    const x = x0 + (x1 - x0) * k, yy = y + (hash(i, 32) - 0.5) * th * 2.4;
    ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(x), Math.round(yy), 2, 1);
  }
}
function ring(x, y, r, col, a = 1) {
  ctx.strokeStyle = col; ctx.globalAlpha = a; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.8, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.globalAlpha = 1; ctx.lineWidth = 1;
}
function backdrop(th, t, col, dir) {
  // a dark gradient taken from the stage's sky, then speed lines in the attacker's colour
  const [a, b] = th.sky;
  for (let y = 0; y < H; y += 4) { ctx.fillStyle = mix(mix(a, '#05040f', 0.45), mix(b, '#05040f', 0.3), y / H); ctx.fillRect(0, y, W, 4); }
  // a floor in perspective
  ctx.fillStyle = mix(th.ground, '#05040f', 0.35); ctx.fillRect(0, GROUND, W, H - GROUND);
  ctx.fillStyle = mix(th.ground, '#ffffff', 0.12); ctx.fillRect(0, GROUND, W, 1);
  for (let i = 0; i < 6; i++) { const yy = GROUND + 3 + i * i * 1.6; ctx.fillStyle = mix(th.ground, '#05040f', 0.2 + i * 0.06); ctx.fillRect(0, Math.round(yy), W, 1); }
  speedLines(t, mix(col, '#ffffff', 0.2), dir);
}
function scaleFor(art) { return art.big ? art.cs || 1.5 : 4; }
function popNumber(n, x, y, k, col = '#ffffff') {
  const lift = Math.min(14, k * 1.2);
  bigText(num(n), x, y - lift, col, 2, { align: 'center', outline: '#300810' });
}
function banner(s, col, t) {
  const w = textW(s) * 2 + 24, x = W / 2 - w / 2, slide = Math.max(0, 20 - t) * 8;
  ctx.fillStyle = 'rgba(5,4,15,0.75)'; ctx.fillRect(x - slide, 12, w, 30);
  ctx.fillStyle = col; ctx.fillRect(x - slide, 12, w, 1); ctx.fillRect(x - slide, 41, w, 1);
  bigText(s, W / 2 - slide, 15, '#ffffff', 2, { align: 'center', outline: mix(col, '#05040f', 0.5) });
}
function hud(L0, R0) {
  // thin HP bars for both fighters at the bottom
  for (const [f, x, al] of [[L0, 8, 'left'], [R0, W - 8, 'right']]) {
    const bx = al === 'left' ? x : x - 100;
    text(f.name, al === 'left' ? bx : x, 196, '#ffe070', { align: al });
    bar(bx, 210, 100, f.hpShown, f.hpMax, f.hpShown / f.hpMax < 0.3 ? '#ff5050' : '#58e070', 4);
  }
}

// ---------- the exchange ----------
// side: { name, art, col, gold, hp, hpMax, hpBefore }  (left = the party, right = the enemy)
// rec: the result from rules.exchange; attLeft: is the attacker on the left
export function playExchange(rec, left, right, attLeft, th) {
  const A = attLeft ? left : right, D = attLeft ? right : left;
  const dir = attLeft ? 1 : -1;
  const act = rec.act, sp = act.t === 'sp' ? SPECIALS[act.id] : null;
  const kind = act.t === 'rush' ? 'rush' : act.t === 'blast' ? 'blast' : sp.kind === 'beam' ? 'beam' : sp.kind === 'buff' || sp.kind === 'heal' ? 'self' : 'melee';
  const sa = scaleFor(A.art), sd = scaleFor(D.art);
  const homeA = attLeft ? 64 : 192, homeD = attLeft ? 192 : 64;
  const lenBy = { rush: 120, blast: 110, beam: 150, melee: 150, self: 100 };
  const len = (rec.clash ? 80 : lenBy[kind]) + 40;
  for (const s of [left, right]) { s.hpShown = s.hpBefore; }
  let stopHum = null;
  const w = {
    t: 0,
    update() {
      if (CINE.freeze != null && this.t >= CINE.freeze) return;
      const t = this.t++;
      if (CINE.fast || UI.auto) { finish(); return; }
      if (input.pressed('b') && t > 10) { finish(); return; }
      if (input.held('a') && t > 10 && t < len - 12) this.t++;
      // sounds on cue
      if (kind === 'rush' || kind === 'melee') {
        const hits = kind === 'melee' ? 7 : 5;
        if (t === 6) sfx('whoosh');
        if (t === 4 && sp) sfx('charge');
        const h0 = kind === 'melee' ? 40 : 26, step = kind === 'melee' ? 8 : 11;
        for (let i = 0; i < hits; i++) if (t === h0 + i * step) sfx(rec.dodged ? 'dodge' : rec.guarded ? 'guard' : i % 2 ? 'kick' : 'punch');
        if (t === h0 + hits * step + 2 && !rec.dodged) sfx(kind === 'melee' ? 'boom' : 'hurt');
      }
      if (kind === 'blast') { if (t === 2) sfx('charge'); if (t === 30) sfx('blast'); if (t === 52) sfx(rec.dodged ? 'dodge' : 'boom'); }
      if (kind === 'beam' && !rec.clash) {
        if (t === 2) sfx('charge');
        if (t === 50) stopHum = hum(attLeft ? 120 : 95);
        if (t === 82) sfx(rec.dodged ? 'dodge' : 'bigboom');
        if (t === 96 && stopHum) { stopHum(); stopHum = null; }
      }
      if (rec.clash && t === 4) sfx('bigboom');
      if (kind === 'self' && t === 6) sfx(rec.heal ? 'heal' : 'buff');
      // the HP bar falls once the hit lands
      const hitT = rec.clash ? 30 : { rush: 70, melee: 100, blast: 54, beam: 84, self: 999 }[kind];
      if (t >= hitT) {
        for (const s of [left, right]) {
          const target = s.hp;
          if (s.hpShown > target) s.hpShown = Math.max(target, s.hpShown - Math.max(1, (s.hpBefore - target) / 18));
        }
      }
      if (t >= len) finish();
    },
    draw() {
      const t = this.t;
      backdrop(th, t, A.col, dir);
      let ax = homeA, dx = homeD, aPose = 'idle', dPose = 'idle', dFlash = false, dAlpha = 1, aFlash = false;
      let aFeet = GROUND, dFeet = GROUND;
      const fx = [];
      if (rec.clash) {
        // the beam clash has been decided: the winner's beam rolls over the other
        const winL = (rec.clash.winner === 'att') === attLeft;
        const k = Math.min(1, t / 26);
        const meet = 128 + (winL ? 1 : -1) * k * 110;
        beam(64 + 14, meet, 120, 7, left.col, t);
        beam(192 - 14, meet, 120, 7, right.col, t);
        kiBall(meet, 120, 10 + Math.sin(t) * 2, '#ffffff', t);
        if (t > 26 && t < 60) { fxDraw('explosion', (t - 26) / 3.5, winL ? 192 : 64, 140, 2.5); view.shake = 4; }
        if (t > 30) { const loser = winL ? right : left; const lost = loser.hpBefore - loser.hp; if (lost > 0) popNumber(lost, winL ? 192 : 64, 70, t - 30); }
        if (winL) dFlash = t > 26 && t < 40 && t % 4 < 2; else aFlash = t > 26 && t < 40 && t % 4 < 2;
        drawFighter(left.art, 64, GROUND, scaleFor(left.art), 'atk', t, { gold: left.gold, flash: winL ? false : aFlash || (t > 26 && t < 40 && t % 4 < 2) });
        drawFighter(right.art, 192, GROUND, scaleFor(right.art), right.art.big ? 'idle' : 'atk', t, { gold: right.gold, flash: winL ? (t > 26 && t < 40 && t % 4 < 2) : false });
        hud(left, right);
        text(L('光束對決！', 'BEAM CLASH!'), W / 2, 50, '#ffe070', { align: 'center' });
        return;
      }
      if (kind === 'rush' || kind === 'melee') {
        const hits = kind === 'melee' ? 7 : 5, h0 = kind === 'melee' ? 40 : 26, step = kind === 'melee' ? 8 : 11;
        if (sp) { if (t < 36) { drawAura(homeA, GROUND, 16 * sa * 0.6, 16 * sa, A.col, t, 1.4); } }
        const reach = homeD - dir * (8 * sa + 10);
        if (t < h0) { const k = Math.max(0, (t - (sp ? 24 : 4)) / (h0 - (sp ? 24 : 4))); ax = homeA + (reach - homeA) * Math.min(1, k); aPose = k > 0 ? 'jump' : 'idle'; }
        else if (t < h0 + hits * step + 10) {
          ax = reach; const i = Math.floor((t - h0) / step), ph = (t - h0) % step;
          aPose = i % 2 ? 'jump' : 'atk';
          if (ph < 3) ax += dir * 4;
          if (rec.dodged) { dAlpha = t % 4 < 2 ? 0.25 : 0.6; dx = homeD + dir * 26; dFeet = GROUND - 30; }
          else if (rec.guarded) { dx = homeD + dir * Math.min(10, (t - h0) * 0.3); if (ph < 4) fx.push(['shield', ph * 1.5, dx - dir * 10, GROUND - 16 * sd * 0.5, 2]); }
          else { dx = homeD + dir * Math.min(24, (t - h0) * 0.5); dFlash = ph < 2; if (ph < 4) fx.push([kind === 'melee' ? 'cutx' : 'spark', ph * (kind === 'melee' ? 1 : 2.5), dx - dir * 6 + (hash(i, 3) - 0.5) * 16, GROUND - 16 * sd * 0.55 + (hash(i, 4) - 0.5) * 20, 2]); }
          if (ph < 2 && !rec.dodged) view.shake = kind === 'melee' ? 3 : 2;
        } else {
          const k = Math.min(1, (t - (h0 + hits * step + 10)) / 16);
          ax = reach + (homeA - reach) * k;
          dx = rec.dodged ? homeD : rec.guarded ? homeD + dir * 10 : homeD + dir * (24 + (1 - k) * 8);
          if (kind === 'melee' && !rec.dodged && t < h0 + hits * step + 34) fx.push(['explosion', (t - (h0 + hits * step + 10)) / 2.5, dx, GROUND - 30, 2]);
        }
      } else if (kind === 'blast') {
        aPose = t < 30 ? 'item' : 'atk';
        const hx = homeA + dir * (8 * sa), hy = GROUND - 16 * sa * 0.55;
        if (t < 30) kiBall(hx, hy, 2 + t / 6, A.col, t);
        else if (t < 52) { const k = (t - 30) / 22; const bx = hx + (homeD - hx) * k; kiBall(bx, hy - (rec.dodged ? 0 : 0), 6, A.col, t); }
        else if (t < 90) {
          if (rec.dodged) { dFeet = GROUND - Math.max(0, 40 - Math.abs(t - 60) * 2); dAlpha = 1; const bx = homeD + dir * (t - 52) * 6; kiBall(bx, hy, 6, A.col, t); }
          else { fx.push(['explosion', (t - 52) / 3.2, homeD, hy, rec.guarded ? 1.5 : 2.2]); dFlash = t < 60 && t % 4 < 2; dx = homeD + dir * Math.min(14, (t - 52)); if (t < 58) view.shake = 3; }
          if (rec.guarded) fx.push(['shield', Math.min(5, (t - 52) / 3), homeD - dir * 14, hy, 2]);
        }
        if (t >= 52 && rec.dodged) aPose = 'idle';
      } else if (kind === 'beam') {
        const hx = homeA + dir * (8 * sa), hy = GROUND - 16 * sa * 0.55;
        if (t < 50) { drawAura(homeA, GROUND, A.art.w * sa * 0.6, A.art.h * sa, A.col, t, 1.8); aPose = 'item'; kiBall(hx, hy, Math.min(9, 2 + t / 5), A.col, t); if (t > 20) radialLines(hx, hy, t, A.col); }
        else if (t < 100) {
          aPose = 'atk';
          const k = Math.min(1, (t - 50) / 22), tip = hx + (homeD + dir * 30 - hx) * k;
          if (rec.dodged && t > 70) { dFeet = GROUND - Math.min(60, (t - 70) * 4); }
          beam(hx, rec.dodged ? hx + (W * dir) * k : tip, hy, 8 + Math.sin(t) * 1.5, A.col, t);
          kiBall(hx, hy, 10, A.col, t);
          if (!rec.dodged && t >= 72) { fx.push(['explosion', (t - 72) / 3, homeD, hy, rec.guarded ? 2 : 3]); dFlash = t % 4 < 2; view.shake = 4; dx = homeD + dir * Math.min(20, t - 72); }
          if (rec.guarded && t >= 70) fx.push(['shield', Math.min(5, (t - 70) / 3), homeD - dir * 16, hy, 2.5]);
        } else { dx = rec.dodged ? homeD : homeD + dir * 20; if (!rec.dodged && t < 120) fx.push(['smoke', (t - 100) / 4, dx, GROUND - 20, 2]); }
        if (sp && t < 40) banner(tn(sp.name), A.col, t);
      } else if (kind === 'self') {
        drawAura(homeA, GROUND, A.art.w * sa * 0.6, A.art.h * sa, rec.heal ? '#80ff90' : A.col, t, 1.6);
        aPose = 'item';
        for (let i = 0; i < 6; i++) fx.push(['spark', ((t + i * 7) % 30) / 3, homeA + (hash(i, 1) - 0.5) * 50, GROUND - 20 - hash(i, 2) * 50, 1.5]);
        if (t > 20) text(rec.heal ? L('回復 ', 'HP +') + num(rec.heal) : rec.buff === 'stone' ? L('岩鎧護身！', 'Stone Skin!') : L('疾風纏身！', 'Wind at your heels!'), homeA, 60, '#c8ffd0', { align: 'center' });
      }
      if (sp && kind !== 'beam' && kind !== 'self' && t < 36) banner(tn(sp.name), A.col, t);
      if (kind === 'self' && t < 40) banner(tn(sp.name), A.col, t);
      if (A.gold) drawAura(ax, aFeet, A.art.w * sa * 0.6, A.art.h * sa, '#ffd040', t, 1.2);
      if (D.gold) drawAura(dx, dFeet, D.art.w * sd * 0.6, D.art.h * sd, '#ffd040', t, 1.2);
      // shadows on the floor so nobody floats
      for (const [x, s, art, feet] of [[ax, sa, A.art, aFeet], [dx, sd, D.art, dFeet]]) {
        const sw = art.w * s * 0.42 * (1 - Math.min(0.5, (GROUND - feet) / 120));
        ctx.fillStyle = 'rgba(5,4,15,0.45)'; ctx.beginPath(); ctx.ellipse(x, GROUND + 1, sw, 3, 0, 0, Math.PI * 2); ctx.fill();
      }
      const drawA = () => drawFighter(A.art, ax, aFeet, sa, A.art.big ? 'idle' : aPose, t, { gold: A.gold, flash: aFlash });
      const drawD = () => drawFighter(D.art, dx, dFeet, sd, D.art.big ? 'idle' : dPose, t, { gold: D.gold, flash: dFlash, alpha: dAlpha });
      drawD(); drawA();
      for (const [n, i, x, y, s] of fx) fxDraw(n, i, x, y, s);
      if (kind !== 'self') {
        const hitT = { rush: 70, melee: 100, blast: 54, beam: 84 }[kind];
        if (t >= hitT) {
          if (rec.dodged) text(rec.gale ? L('疾風閃避！', 'Gale dodge!') : L('閃避成功！', 'Dodged!'), homeD, 64, '#a8f0ff', { align: 'center' });
          else {
            popNumber(rec.dmg, homeD, 70, t - hitT, rec.failDodge ? '#ffb0a0' : '#ffffff');
            if (rec.guarded) text(L('防禦', 'Guard'), homeD, 36, '#c8d8ff', { align: 'center' });
            if (rec.failDodge) text(L('閃避失敗！', 'Dodge failed!'), homeD, 36, '#ff9080', { align: 'center' });
            if (rec.burn) text(L('氣 -', 'Ki -') + rec.burn, homeD, 92, '#80c8ff', { align: 'center' });
          }
        }
      }
      hud(left, right);
    },
  };
  function finish() {
    if (stopHum) { stopHum(); stopHum = null; }
    view.shake = 0;
    w.done();
  }
  return push(w);
}

// both played the same star: they meet in the middle
export function playTie(rec, left, right, th) {
  for (const s of [left, right]) s.hpShown = s.hpBefore;
  const sl = scaleFor(left.art), sr = scaleFor(right.art);
  return push({
    t: 0,
    update() {
      const t = this.t++;
      if (CINE.fast || UI.auto || (input.pressed('b') && t > 10)) { view.shake = 0; this.done(); return; }
      if (t === 4) sfx('whoosh');
      if (t === 24 || t === 34 || t === 44) sfx('clash');
      if (t >= 50) for (const s of [left, right]) if (s.hpShown > s.hp) s.hpShown = Math.max(s.hp, s.hpShown - Math.max(1, (s.hpBefore - s.hp) / 14));
      if (t > 100) { view.shake = 0; this.done(); }
    },
    draw() {
      const t = this.t;
      backdrop(th, t, '#ffffff', 1);
      const k = Math.min(1, t / 22);
      let lx = 64 + 44 * k, rx = 192 - 44 * k;
      if (t > 50) { const b = Math.min(1, (t - 50) / 14); lx -= 30 * b; rx += 30 * b; }
      for (const [x, s, art] of [[lx, sl, left.art], [rx, sr, right.art]]) { ctx.fillStyle = 'rgba(5,4,15,0.45)'; ctx.beginPath(); ctx.ellipse(x, GROUND + 1, art.w * s * 0.42, 3, 0, 0, Math.PI * 2); ctx.fill(); }
      drawFighter(left.art, lx, GROUND, sl, t > 20 && t < 50 ? (Math.floor(t / 5) % 2 ? 'atk' : 'jump') : 'idle', t, { gold: left.gold });
      drawFighter(right.art, rx, GROUND, sr, right.art.big ? 'idle' : t > 20 && t < 50 ? (Math.floor(t / 5) % 2 ? 'atk' : 'jump') : 'idle', t, { gold: right.gold });
      if (t > 22 && t < 54) { ring(128, 140, (t - 22) * 3 % 40 + 6, '#ffffff', 0.8); fxDraw('spark', (t % 10), 128, 140 + Math.sin(t) * 10, 2); view.shake = 2; }
      if (t >= 54) view.shake = 0;
      text(L('互擊！', 'CLASH!'), W / 2, 48, '#ffe070', { align: 'center' });
      if (t > 50) { popNumber(rec.toP, 64, 70, t - 50); popNumber(rec.toE, 192, 70, t - 50); }
      hud(left, right);
    },
  });
}

// the beam clash: mash Z to push your beam forward. Returns 'left' or 'right'.
// pushL / pushR: relative strengths; playerLeft: whether the player is on the left (mashing)
export function beamClash(left, right, strengthL, strengthR, th) {
  const q = (2 * strengthR) / (strengthL + strengthR); // how hard the enemy pushes
  let stop = null;
  return push({
    t: 0, p: 0, presses: 0, nextAuto: 0,
    update() {
      const t = this.t++;
      if (CINE.fast) { this.done(Math.random() * (CINE.mashRate * 0.06) > 0.36 * q * 0.5 ? 'left' : 'right'); return; }
      if (t === 2) { sfx('clash'); stop = hum(80, 0.14); }
      if (t < 30) return;
      let press = input.pressed('a');
      if (UI.auto) { this.nextAuto -= 1; if (this.nextAuto <= 0) { press = true; this.nextAuto = 60 / CINE.mashRate * (0.8 + Math.random() * 0.4); } }
      if (press) { this.p += 0.06; this.presses++; if (this.presses % 2) sfx('push'); }
      this.p -= 0.0045 * q;
      this.p = Math.max(-1, Math.min(1, this.p));
      if (Math.abs(this.p) >= 1 || t >= 30 + 240) {
        if (stop) stop();
        this.done(this.p >= 0 ? 'left' : 'right');
      }
    },
    draw() {
      const t = this.t;
      backdrop(th, t, '#ffffff', 0);
      const meet = 128 + this.p * 100;
      const sl = scaleFor(left.art), sr = scaleFor(right.art);
      drawAura(56, GROUND, 30, 64, left.col, t, 1.6);
      drawAura(200, GROUND, right.art.big ? 50 : 30, 64, right.col, t, 1.6);
      beam(56 + 16, meet, 124, 7 + Math.sin(t * 0.7), left.col, t);
      beam(200 - 16, meet, 124, 7 + Math.cos(t * 0.7), right.col, t);
      kiBall(meet, 124, 12 + Math.sin(t * 0.9) * 2, '#ffffff', t);
      fxDraw('spark', t % 10, meet, 124 + Math.sin(t) * 6, 2);
      view.shake = 1;
      for (const [x, s, art] of [[56, sl, left.art], [200, sr, right.art]]) { ctx.fillStyle = 'rgba(5,4,15,0.45)'; ctx.beginPath(); ctx.ellipse(x, GROUND + 1, art.w * s * 0.42, 3, 0, 0, Math.PI * 2); ctx.fill(); }
      drawFighter(left.art, 56, GROUND, sl, 'atk', t, { gold: left.gold });
      drawFighter(right.art, 200, GROUND, sr, right.art.big ? 'idle' : 'atk', t, { gold: right.gold });
      // the meter
      windowBox(28, 8, 200, 34);
      text(L('光束對決！', 'BEAM CLASH!'), W / 2, 12, '#ffe070', { align: 'center' });
      ctx.fillStyle = '#05040f'; ctx.fillRect(39, 27, 178, 8);
      const mid = 128 + this.p * 88;
      ctx.fillStyle = left.col; ctx.fillRect(40, 28, Math.round(mid - 40), 6);
      ctx.fillStyle = right.col; ctx.fillRect(Math.round(mid), 28, Math.round(216 - mid), 6);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(mid) - 1, 26, 3, 10);
      if (t >= 30 && (t >> 3) % 2) bigText(L('連打 Z！', 'MASH Z!'), W / 2, 52, '#ffffff', 2, { align: 'center', outline: '#a02020' });
      if (t < 30) bigText(L('準備…', 'Ready...'), W / 2, 52, '#ffe070', 2, { align: 'center' });
      const left_s = 240 - Math.max(0, t - 30);
      ctx.fillStyle = '#a8c8ff'; ctx.fillRect(40, 38, Math.max(0, Math.round(176 * left_s / 240)), 1);
    },
  });
}

// the Golden Flame awakening (or the shorter version later in the game)
export function playGolden(art, long = false) {
  const len = long ? 260 : 120;
  return push({
    t: 0,
    update() {
      const t = this.t++;
      if (CINE.fast || UI.auto || (input.pressed('b') && t > 20)) { view.shake = 0; this.done(); return; }
      if (t === 2) sfx('charge');
      if (t === (long ? 120 : 40)) sfx('gold');
      if (long && (t === 60 || t === 90)) sfx('thunder');
      view.shake = t < (long ? 120 : 40) ? Math.min(4, t / 20) : t < (long ? 160 : 70) ? 3 : 0;
      if (t >= len) { view.shake = 0; this.done(); }
    },
    draw() {
      const t = this.t, burst = long ? 120 : 40;
      const lit = t >= burst;
      for (let y = 0; y < H; y += 4) { ctx.fillStyle = mix(lit ? '#3a2408' : '#0a0618', lit ? '#120a20' : '#05040f', y / H); ctx.fillRect(0, y, W, 4); }
      radialLines(128, 120, t * 2, lit ? '#ffe070' : '#8090ff');
      // lightning in the long version
      if (long && t > 50 && t < burst && t % 30 < 6) {
        ctx.strokeStyle = '#e8f0ff'; ctx.lineWidth = 2; ctx.beginPath();
        let x = 40 + hash(t, 1) * 180, y = 0; ctx.moveTo(x, y);
        while (y < GROUND) { x += (hash(x, y) - 0.5) * 30; y += 14; ctx.lineTo(x, y); }
        ctx.stroke(); ctx.lineWidth = 1;
      }
      ctx.fillStyle = 'rgba(5,4,15,0.5)'; ctx.beginPath(); ctx.ellipse(128, GROUND + 1, 30, 4, 0, 0, Math.PI * 2); ctx.fill();
      if (lit) drawAura(128, GROUND, 44, 100, '#ffd040', t, 2.6);
      else drawAura(128, GROUND, 30, 70, '#8ad8ff', t, 1 + t / burst);
      drawFighter(art, 128, GROUND, 5, lit ? 'atk' : 'item', t, { gold: lit, flash: t >= burst && t < burst + 6 });
      if (t >= burst && t < burst + 14) { ctx.globalAlpha = 1 - (t - burst) / 14; ctx.fillStyle = '#fff8d0'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
      if (lit) { for (let i = 0; i < 4; i++) ring(128, 130, ((t - burst) * 3 + i * 30) % 120, '#ffe070', 0.5); }
      if (t > burst + 10) bigText(L('金焰覺醒！', 'GOLDEN FLAME!'), W / 2, 22, '#ffe070', 2, { align: 'center', outline: '#6a2808', grad: '#fffbe0' });
    },
  });
}
