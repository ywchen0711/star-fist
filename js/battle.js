// The battle screen: two fighters face off on a side-view stage, both sides play a card, the higher
// star attacks, and each exchange is shown as a close-up. Party members can switch in and out.
import { goldTint } from './gfx.js?v=2';
import { ctx, W, H, text, textW, bigText, windowBox, bar, drawCard, CARD_W, CARD_H, cardBack, paintSky, fighterArt, face, itemIcon, drawTwinkles, mix, hash } from './gfx.js?v=2';
import { input } from './input.js?v=2';
import { sfx, playMusic, currentSong, jingle } from './audio.js?v=2';
import { push, UI, menu, notice, say, wrap, fit } from './ui.js?v=2';
import { L, tn, num } from './i18n.js?v=2';
import { HEROES, ENEMIES, SPECIALS, ITEMS, BLAST_KI, COUNTER_KI, GOLD_COST } from './data.js?v=2';
import * as R from './rules.js?v=2';
import { S } from './state.js?v=2';
import { BOARDS } from './maps.js?v=2';
import { playExchange, playTie, beamClash, playGolden, drawAura, CINE } from './cinema.js?v=2';

export let B = null;
const rand = Math.random;
const FEET = 128;
const nameOf = (f) => tn(R.def(f).name);
const artOf = (f) => (f.foe ? fighterArt(ENEMIES[f.id].spr, 'l') : fighterArt({ k: 'c', n: HEROES[f.id].sheet }, 'r'));
const stageScale = (art, f) => (art.big ? (f && f.foe && ENEMIES[f.id].spr.ss) || 1 : 2);
const alive = () => S.party.filter((m) => !m.ko && m.hp > 0);
export const AUTO = { on: false, log: null };

// ---------- drawing ----------
function panel(f, x, right) {
  windowBox(x, 2, 124, 48, { accent: right ? '#ff9a8a' : '#8ad8ff' });
  const nm = nameOf(f) + (f.foe ? '' : ' Lv' + f.lv);
  // buffs and the Golden Flame as coloured tags beside the name; if they do not fit, they take turns with the name
  const tags = [];
  if (f.buf && f.buf.stone > 0) tags.push([L('岩', 'ROCK') + f.buf.stone, '#d0b080']);
  if (f.buf && f.buf.gale > 0) tags.push([L('風', 'GALE') + f.buf.gale, '#70f0b8']);
  if (f.gold) tags.push([L('金焰', 'GOLD'), '#ffd040']);
  const tw = tags.reduce((a, g) => a + textW(g[0]) + 4, -4), beside = tw <= 108 - textW(nm) - 6;
  const pages = [];
  for (const g of tags) { const last = pages[pages.length - 1], w = textW(g[0]); if (last && last.w + 4 + w <= 108) { last.t.push(g); last.w += 4 + w; } else pages.push({ t: [g], w }); }
  const ph = beside ? 0 : Math.floor(B.t / 60) % (pages.length + 1);
  if (ph === 0) text(fit(nm, 108), x + 8, 5, f.foe ? '#ffc8b0' : '#ffe070');
  const show = beside ? tags : ph > 0 ? pages[ph - 1].t : [];
  let cx = x + 116;
  for (const [s, c] of show.slice().reverse()) { text(s, cx, 5, c, { align: 'right' }); cx -= textW(s) + 4; }
  text(L('戰鬥力', 'PL'), x + 8, 17, '#a8c8ff');
  text(num(R.pl(f)), x + 116, 17, f.gold ? '#ffd040' : '#ffffff', { align: 'right' });
  const hp = Math.max(0, f.hp), mx = R.maxHp(f);
  text('HP ' + Math.ceil(hp), x + 8, 29, '#d8ffd8');
  text(L('氣 ', 'Ki ') + f.ki, x + 116, 29, f.gold ? '#ffd040' : '#80d8ff', { align: 'right' });
  bar(x + 8, 43, 72, hp, mx, hp / mx < 0.3 ? '#ff5050' : '#58e070', 2);
  bar(x + 86, 43, 30, f.ki, 100, f.gold ? '#ffd040' : '#58c8ff', 2);
}
export function drawBattle() {
  if (!B) return;
  B.t++;
  const t = B.t;
  ctx.drawImage(paintSky(B.theme), 0, 0);
  drawTwinkles(t, 10, 80, 3);
  const p = B.p, e = B.e;
  // bench and queue
  S.party.forEach((m, i) => {
    if (m === p) return;
    const img = fighterArt({ k: 'c', n: HEROES[m.id].sheet }, 'r').idle[0];
    const k = S.party.filter((q) => q !== p).indexOf(m);
    ctx.globalAlpha = m.ko || m.hp <= 0 ? 0.35 : 1;
    ctx.drawImage(img, 4 + k * 13, 112 - (k % 2) * 3);
    ctx.globalAlpha = 1;
  });
  B.foes.forEach((f, i) => {
    if (i <= B.ei || f.ko) return;
    const art = artOf(f), img = art.idle[0];
    const s = art.big ? 16 / art.h : 1;
    ctx.drawImage(img, W - 18 - (i - B.ei - 1) * 14, 128 - img.height * s, img.width * s, img.height * s);
  });
  for (const [f, x, side] of [[p, 76, 'l'], [e, 180, 'r']]) {
    if (!f) continue;
    const art = artOf(f), sc = stageScale(art, f);
    const gone = side === 'r' && B.koT != null;
    const kx = x + (B.hurt && B.hurt.f === f ? (B.hurt.t % 4 < 2 ? 2 : -2) : 0);
    ctx.fillStyle = 'rgba(5,4,15,0.45)'; ctx.beginPath(); ctx.ellipse(x, FEET + 1, art.w * sc * 0.4, 3, 0, 0, Math.PI * 2); ctx.fill();
    if (f.gold) drawAura(x, FEET, art.w * sc * 0.6, art.h * sc, '#ffd040', t, 1.1);
    else if (f.ki >= 80 && !f.foe) drawAura(x, FEET, art.w * sc * 0.55, art.h * sc, R.kiColor(f), t, 0.5);
    let img = art.idle[Math.floor(t / 12) % art.idle.length];
    const w = img.width * sc, h = img.height * sc;
    ctx.save();
    if (gone) { ctx.globalAlpha = Math.max(0, 1 - B.koT / 30); }
    if (f.gold) img = goldTint(img);
    ctx.drawImage(img, Math.round(kx - w / 2), Math.round(FEET - h + (gone ? B.koT / 3 : 0)), w, h);
    ctx.restore();
  }
  if (p) panel(p, 2, false);
  if (e) panel(e, 130, true);
  // revealed cards
  if (B.reveal) {
    const r = B.reveal, k = Math.min(1, r.t / 14);
    r.t++;
    for (const [c, x, win] of [[r.pc, 90, r.cmp > 0], [r.ec, 130, r.cmp < 0]]) {
      if (!c) continue;
      const flip = Math.abs(Math.cos(k * Math.PI));
      const showFace = k > 0.5;
      const ww = Math.max(1, Math.round(CARD_W * flip));
      ctx.save();
      ctx.translate(x + CARD_W / 2, 0); ctx.scale(ww / CARD_W, 1); ctx.translate(-(x + CARD_W / 2), 0);
      drawCard(x, 52, c, { back: !showFace, hl: r.t > 18 && win && (r.t >> 2) % 2 === 0 });
      ctx.restore();
    }
  }
  // the lower window
  windowBox(0, 136, W, 88);
  if (B.msg) wrap(B.msg, 236).slice(0, 4).forEach((l, i) => text(l, 10, 144 + i * 15));
  const r = B.reveal;
  if (r && r.t > 18 && UI.top && UI.top.isReveal) {
    const msg = r.cmp === 0 ? L('同星！互擊', 'Same star: clash!') : r.cmp > 0 ? L('我方先攻！', 'You strike first!') : L('敵方先攻！', 'Enemy strikes first!');
    bigText(msg, 128, 166, r.cmp > 0 ? '#ffe070' : r.cmp < 0 ? '#ff9080' : '#ffffff', 2, { align: 'center' });
  }
}
const goldCache = new WeakMap();
function goldOf(img) {
  let c = goldCache.get(img);
  if (!c) {
    c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const x = c.getContext('2d'); x.drawImage(img, 0, 0); x.globalCompositeOperation = 'source-atop'; x.globalAlpha = 0.38; x.fillStyle = '#ffc830'; x.fillRect(0, 0, c.width, c.height);
    goldCache.set(img, c);
  }
  return c;
}

// ---------- widgets ----------
function pause(frames) { return push({ update() { if (UI.auto || CINE.fast || this.age >= frames || (this.age > 6 && input.pressed('a'))) this.done(); }, draw() {} }); }
function showReveal(pc, ec, cmp) {
  B.reveal = { pc, ec, cmp, t: 0 };
  sfx('flip');
  return push({ isReveal: true, update() { if (this.age === 18) sfx(cmp === 0 ? 'clash' : 'first'); if (UI.auto || CINE.fast || this.age > 46 || (this.age > 20 && input.pressed('a'))) this.done(); }, draw() {} });
}
// pick one of five cards; resolves with the index or -1 (back)
function pickBattleCard() {
  B.msg = null;
  return push({
    sel: 2,
    update() {
      if (UI.auto) { if (this.age > 1) this.done(R.aiCard(B.p, B.e, B.hand, 3, rand)); return; }
      if (input.repeat('left')) { this.sel = (this.sel + 4) % 5; sfx('card'); }
      if (input.repeat('right')) { this.sel = (this.sel + 1) % 5; sfx('card'); }
      if (input.pressed('a') && this.age > 3) { sfx('ok'); this.done(this.sel); }
      else if (input.pressed('b') && this.age > 3) { sfx('cancel'); this.done(-1); }
    },
    draw() {
      text(L('選一張戰鬥牌', 'Play a battle card'), 10, 141, '#ffe070');
      text(L('★多先攻 數字=威力/閃避', '★ first · number: power/dodge'), 246, 141, '#a8c8ff', { align: 'right' });
      B.hand.forEach((c, i) => drawCard(18 + i * 46, 160, c, { hl: i === this.sel, lift: i === this.sel ? 5 : 0 }));
      const c = B.hand[this.sel];
      const desc = c.n === 'S' ? L('必：數字當7，必殺技半價且威力+30%', '必: counts as 7; specials half ki, +30%') : c.n === 'K' ? L('氣：立刻+25氣，數字當1', '氣: +25 ki now; counts as 1') : L('星 ' + c.s + '　數字 ' + c.n, 'Star ' + c.s + '  Number ' + c.n);
      text(desc, 128, 212, '#e0e4ff', { align: 'center' });
    },
  });
}
function actionLabel(a, card) {
  if (a.t === 'rush') return { label: L('拳腳連打', 'Rush'), sub: L('+8氣', '+8 ki') };
  if (a.t === 'blast') return { label: L('氣功彈', 'Ki Blast'), sub: BLAST_KI + L('氣', ' ki') };
  return { label: tn(SPECIALS[a.id].name), sub: R.spCost(a.id, card) + L('氣', ' ki') };
}
function allActions(f, card) {
  const out = [{ t: 'rush' }, { t: 'blast' }];
  for (const s of R.specials(f)) out.push({ t: 'sp', id: s });
  return out;
}
async function chooseAction(p, e, pc, ec) {
  const acts = allActions(p, pc);
  const items = acts.map((a) => ({ ...actionLabel(a, pc), disabled: R.actionCost(a, pc) > p.ki }));
  const r = await menu(items, {
    x: 4, y: 140, w: 128, rows: 5, cancel: false, title: L('攻擊方式', 'Attack'),
    auto: () => acts.indexOf(acts.find((a) => JSON.stringify(a) === JSON.stringify(R.aiAction(p, e, pc, ec, 3, rand)))),
    hint: (sel) => {
      const a = acts[sel];
      let d = a.t === 'rush' ? L('不耗氣的連打，還能集氣。', 'Free combo; builds ki.') : a.t === 'blast' ? L('氣彈。可能被對手迎擊。', 'A ki ball. Can be countered.') : tn(SPECIALS[a.id].desc || ['', '']);
      if (a.t === 'sp' && SPECIALS[a.id].kind === 'beam') d += L('（光束）', ' (beam)');
      const lines = wrap(d, 112);
      lines.slice(0, 3).forEach((l, i) => text(l, 138, 146 + i * 14, '#e0e4ff'));
      if (!R.isSelf(a)) {
        const dodge = R.dodgeWorks(ec, pc, a, e);
        text(dodge ? L('⚠ 對手能閃避！', '⚠ Foe can dodge!') : L('對手無法閃避', "Foe can't dodge"), 138, 192, dodge ? '#ff9080' : '#a8f0a8');
        const est = R.rawDamage(p, e, R.actionPow(a, pc), pc, () => 0.5);
        text(L('預估傷害 ', 'Est. dmg ') + num(est), 138, 206, '#ffe070');
      }
    },
  });
  return acts[Math.max(0, r)];
}
async function chooseResponse(p, e, pc, ec, act) {
  const beamOk = R.isBeam(act) && p.ki >= COUNTER_KI;
  const dodge = R.dodgeWorks(pc, ec, act, null);
  const opts = [
    { r: 'guard', label: L('防禦', 'Guard'), sub: L('傷害減半', 'half dmg') },
    { r: 'dodge', label: L('閃避', 'Dodge'), sub: !R.canDodge(act) ? L('無法', 'no') : dodge ? L('○會成功', 'OK') : L('✕會失敗', 'fails'), subCol: dodge && R.canDodge(act) ? '#a8f0a8' : '#ff9080' },
  ];
  if (R.isBeam(act)) opts.push({ r: 'counter', label: L('迎擊', 'Counter'), sub: COUNTER_KI + L('氣', ' ki'), disabled: !beamOk });
  const what = act.t === 'rush' ? L('連打', 'a rush') : act.t === 'blast' ? L('氣功彈', 'a ki blast') : tn(SPECIALS[act.id].name);
  const r = await menu(opts, {
    x: 4, y: 140, w: 124, cancel: false, title: L('防守', 'Defend'),
    auto: () => { const a = R.aiResponse(p, e, pc, ec, act, 3, rand); return Math.max(0, opts.findIndex((o) => o.r === a)); },
    hint: (sel) => {
      wrap(nameOf(e) + L(' 要使出 ', ' uses ') + what + L('！', '!'), 112).slice(0, 2).forEach((l, i) => text(l, 136, 146 + i * 14, '#ffc8b0'));
      const o = opts[sel].r;
      const d = o === 'guard' ? L('受到的傷害減半，+6氣。', 'Take half damage. +6 ki.') : o === 'dodge' ? L('我方數字≥對方數字才成功；失敗多受兩成傷害。', 'Works if your number ≥ theirs. Failing takes 20% more.') : L('用光束頂回去！連打Z推回對方。', 'Fire back! Mash Z to push.');
      wrap(d, 114).slice(0, 3).forEach((l, i) => text(l, 136, 178 + i * 13, '#e0e4ff'));
    },
  });
  return opts[Math.max(0, r)].r;
}
async function chooseFighter(title, forced) {
  const list = S.party.filter((m) => m !== B.p || forced === 'any');
  const items = list.map((m) => ({ label: tn(HEROES[m.id].name) + ' Lv' + m.lv, sub: m.ko || m.hp <= 0 ? L('倒下', 'down') : num(R.pl(m)), disabled: m.ko || m.hp <= 0 || m === B.p }));
  const r = await menu(items, { x: 6, y: 140, w: 150, title, cancel: !forced, auto: () => { let bi = -1, bv = -1; list.forEach((m, i) => { if (!m.ko && m.hp > 0 && m !== B.p && R.pl(m) * (m.hp / R.maxHp(m) + 0.3) > bv) { bv = R.pl(m) * (m.hp / R.maxHp(m) + 0.3); bi = i; } }); return bi; } });
  return r < 0 ? null : list[r];
}
async function chooseItem() {
  const ids = Object.keys(S.items).filter((k) => S.items[k] > 0);
  if (!ids.length) return null;
  const r = await menu(ids.map((id) => ({ label: tn(ITEMS[id].name), sub: '×' + S.items[id], icon: (x, y) => itemIcon(ITEMS[id].icon, x, y) })), { x: 6, y: 140, w: 150, rows: 5, title: L('道具', 'Items') });
  if (r < 0) return null;
  const id = ids[r];
  const tgt = await menu(S.party.map((m) => ({ label: tn(HEROES[m.id].name), sub: Math.ceil(m.hp) + '/' + R.maxHp(m) })), { x: 100, y: 140, w: 150, title: L('對誰使用', 'Use on') });
  if (tgt < 0) return null;
  const m = S.party[tgt];
  const res = R.useItem(m, id);
  if (!res) { sfx('buzz'); await notice('沒有效果。', 'It has no effect.', { frames: 40, y: 150 }); return null; }
  S.items[id]--; if (S.items[id] <= 0) delete S.items[id];
  sfx('heal');
  await notice(tn(HEROES[m.id].name) + L('：', ': ') + (res.revived ? L('復活了！', 'revived!') : (res.hp ? L('體力+', 'HP +') + res.hp + ' ' : '') + (res.ki ? L('氣+', 'Ki +') + res.ki : '')), null, { frames: 50, y: 150 });
  return id;
}

// ---------- the close-up glue ----------
function side(f) {
  return { name: nameOf(f), art: artOf(f), col: R.kiColor(f), gold: !!f.gold, hp: f.hp, hpMax: R.maxHp(f), hpBefore: f.hp };
}
async function doExchange(att, dfn, ac, dc, act, resp) {
  const attLeft = !att.foe;
  const L0 = attLeft ? side(att) : side(dfn), R0 = attLeft ? side(dfn) : side(att);
  let winner = null;
  if (resp === 'counter' && R.isBeam(act) && dfn.ki >= COUNTER_KI) {
    const sA = R.clashStrength(att, ac, act), sD = R.clashStrength(dfn, dc, null);
    const sl = attLeft ? sA : sD, sr = attLeft ? sD : sA;
    let w;
    if (AUTO.sim) w = rand() < R.clashOdds(att, ac, act, dfn, dc) ? (attLeft ? 'left' : 'right') : (attLeft ? 'right' : 'left');
    else w = await beamClash(L0, R0, sl, sr, B.theme);
    winner = (w === 'left') === attLeft ? 'att' : 'def';
  }
  const rec = R.exchange(att, dfn, ac, dc, act, resp, winner, rand);
  L0.hp = attLeft ? att.hp : dfn.hp; R0.hp = attLeft ? dfn.hp : att.hp;
  if (!AUTO.sim) await playExchange(rec, L0, R0, attLeft, B.theme);
  B.log && B.log.push(rec);
  return rec;
}
// the enemy gets a free attack while the player switches, uses an item or fails to flee
async function freeAttack() {
  const p = B.p, e = B.e;
  const ec = B.ehand[R.aiCard(e, p, B.ehand, ENEMIES[e.id].boss ? 2 : 1, rand)];
  const dummy = { s: 1, n: 1 };
  R.startRound(null, e, null, ec);
  const act = R.aiAction(e, p, ec, dummy, ENEMIES[e.id].boss ? 2 : 1, rand);
  B.msg = nameOf(e) + L(' 趁機攻擊！', ' attacks!');
  await pause(30);
  await doExchange(e, p, ec, dummy, act, 'guard');
}

// ---------- the battle ----------
// foeIds: enemy ids, fought one after another. opts: { boss, noFlee, canLose, music, theme, intro }
export async function battle(foeIds, opts = {}) {
  const snapshot = JSON.stringify({ party: S.party, items: S.items });
  for (;;) {
    const r = await battleOnce(foeIds, opts);
    if (r === 'title') throw new Error('__title__');
    if (r !== 'retry') return r;
    S.retries = (S.retries || 0) + 1;
    const s = JSON.parse(snapshot);
    S.party = s.party; S.items = s.items;
  }
}
async function battleOnce(foeIds, opts) {
  const prevSong = currentSong;
  const skill = (f) => (ENEMIES[f.id].boss ? (f.id.startsWith('vorrak') || f.id === 'spirit' ? 3 : 2) : ENEMIES[f.id].sp.length ? 1 : 0);
  B = { t: 0, foes: foeIds.map(R.newFoe), ei: 0, p: null, e: null, hand: [], ehand: [], msg: null, reveal: null, koT: null, theme: opts.theme || BOARDS[S.chapter].sky, log: AUTO.log, exp: 0, coins: 0, rounds: 0 };
  B.e = B.foes[0];
  for (const m of S.party) { m.ki = 30; m.gold = false; m.buf = {}; if (m.hp <= 0) m.ko = true; }
  if (!AUTO.sim) playMusic(opts.music || (opts.boss ? 'boss' : 'battle'));
  if (!AUTO.sim) sfx('encounter');
  B.msg = B.foes.length > 1 ? L(nameOf(B.e) + '等 ' + B.foes.length + ' 個敵人擋住了去路！', nameOf(B.e) + ' and others block the way!') : L(nameOf(B.e) + ' 出現了！', nameOf(B.e) + ' appears!');
  if (alive().length === 0) return 'lose';
  const kai = S.party.find((m) => m.id === 'kai');
  if (opts.goldStart && kai && !kai.ko && kai.hp > 0) { B.p = kai; kai.gold = true; kai.ki = 100; }
  else if (alive().length > 1) B.p = await chooseFighter(L('誰出戰？', 'Who fights?'), true);
  B.p = B.p || alive()[0];
  if (opts.intro) await opts.intro();
  let result = null;
  while (!result) {
    const p = B.p, e = B.e;
    B.hand = R.deal(rand); B.ehand = R.deal(rand); B.reveal = null; B.rounds++;
    B.msg = null;
    // the command
    let pc = null;
    while (!pc) {
      const cmds = [{ c: 'fight', label: L('出牌', 'Fight') }];
      if (alive().length > 1) cmds.push({ c: 'switch', label: L('換人', 'Switch') });
      if (Object.keys(S.items).length) cmds.push({ c: 'item', label: L('道具', 'Items') });
      if (R.canGold(p, S.flags)) cmds.push({ c: 'gold', label: L('金焰覺醒', 'Golden Flame'), col: '#ffd040' });
      if (!opts.noFlee && !opts.boss) cmds.push({ c: 'flee', label: L('逃跑', 'Flee') });
      const autoCmd = () => {
        if (R.canGold(p, S.flags) && (ENEMIES[e.id].boss || R.pl(e) > R.pl(p))) return cmds.findIndex((c) => c.c === 'gold');
        const items = Object.keys(S.items);
        if (p.hp < R.maxHp(p) * 0.3 && items.some((i) => ITEMS[i].hp) && (ENEMIES[e.id].boss || p.hp < R.maxHp(p) * 0.2)) return cmds.findIndex((c) => c.c === 'item');
        return 0;
      };
      const k = await menu(cmds, { x: 4, y: 140, w: 100, cancel: false, auto: autoCmd, hint: () => {
        text(fit(nameOf(p) + L(' 的回合', "'s turn"), W - 120), 112, 146, '#ffe070');
        text(L('氣 ', 'Ki ') + p.ki + '/100', 112, 162, '#80d8ff');
        text(fit(L('對手 ', 'Foe: ') + nameOf(e), W - 120), 112, 178, '#ffc8b0');
        const left = B.foes.length - B.ei - 1;
        if (left > 0) text(L('後面還有 ' + left + ' 個', left + ' more waiting'), 112, 194, '#c8c8e8');
      } });
      const c = cmds[k].c;
      if (c === 'fight') {
        const i = await pickBattleCard();
        if (i >= 0) pc = B.hand[i];
      } else if (c === 'gold') {
        if (!AUTO.sim) await playGolden(artOf(p), false);
        R.goGold(p); sfx('power');
      } else if (c === 'switch') {
        const m = await chooseFighter(L('換誰上場？', 'Switch to?'), false);
        if (m) { if (p.gold) p.gold = false; B.p = m; B.msg = tn(HEROES[m.id].name) + L(' 上場！', ' steps in!'); await pause(24); await freeAttack(); pc = 'skip'; }
      } else if (c === 'item') {
        if (UI.auto) {
          const id = ['elixir', 'broth', 'riceball', 'starfruit'].find((i) => S.items[i]);
          if (id) { R.useItem(p, id); S.items[id]--; if (!S.items[id]) delete S.items[id]; S.itemsUsed = (S.itemsUsed || 0) + 1; await freeAttack(); pc = 'skip'; }
          else pc = B.hand[R.aiCard(p, e, B.hand, 3, rand)];
        } else if (await chooseItem()) { await freeAttack(); pc = 'skip'; }
      } else if (c === 'flee') {
        const chance = Math.max(0.2, Math.min(0.9, 0.5 + 0.25 * (R.pl(p) / R.pl(e) - 1)));
        if (rand() < chance) { sfx('run'); B.msg = L('順利逃走了。', 'Got away safely.'); await pause(40); result = 'flee'; pc = 'skip'; }
        else { B.msg = L('逃不掉！', "Couldn't escape!"); await pause(30); await freeAttack(); pc = 'skip'; }
      }
    }
    if (pc !== 'skip') {
      const ec = B.ehand[R.aiCard(e, p, B.ehand, skill(e), rand)];
      R.startRound(p, e, pc, ec);
      const cmp = R.compare(pc, ec);
      await showReveal(pc, ec, cmp);
      if (cmp === 0) {
        const L0 = side(p), R0 = side(e);
        const rec = R.clash(p, e, pc, ec, rand);
        L0.hp = p.hp; R0.hp = e.hp;
        if (!AUTO.sim) await playTie(rec, L0, R0, B.theme);
      } else if (cmp > 0) {
        const act = await chooseAction(p, e, pc, ec);
        const resp = R.aiResponse(e, p, ec, pc, act, skill(e), rand);
        await doExchange(p, e, pc, ec, act, resp);
      } else {
        const act = R.aiAction(e, p, ec, pc, skill(e), rand);
        const resp = R.isSelf(act) ? 'none' : await chooseResponse(p, e, pc, ec, act);
        await doExchange(e, p, ec, pc, act, resp);
      }
      B.reveal = null;
    }
    if (result) break;
    // the end of the round
    if (R.endRound(B.p)) { B.msg = L('金焰熄滅了…', 'The Golden Flame fades...'); await pause(40); }
    R.endRound(B.e);
    if (B.e.hp <= 0) {
      B.e.ko = true;
      sfx('ko');
      B.koT = 0;
      await push({ update() { B.koT++; if (UI.auto || CINE.fast || B.koT > 30) this.done(); }, draw() {} });
      B.koT = null;
      B.exp += ENEMIES[B.e.id].exp; B.coins += ENEMIES[B.e.id].coin;
      B.msg = L(nameOf(B.e) + ' 被打倒了！', nameOf(B.e) + ' is defeated!');
      await pause(36);
      B.ei++;
      if (B.ei >= B.foes.length) { result = 'win'; break; }
      B.e = B.foes[B.ei];
      B.msg = L(nameOf(B.e) + ' 上前來了！', nameOf(B.e) + ' steps forward!');
      await pause(36);
    }
    if (B.p.hp <= 0) {
      B.p.ko = true; B.p.gold = false;
      B.msg = L(nameOf(B.p) + ' 倒下了…', nameOf(B.p) + ' is down...');
      sfx('ko');
      await pause(40);
      if (!alive().length) { result = 'lose'; break; }
      B.p = await chooseFighter(L('誰接著上？', 'Who goes next?'), true);
      B.p = B.p || alive()[0];
    }
  }
  for (const m of S.party) { m.gold = false; m.buf = {}; }
  if (result === 'win') {
    if (!AUTO.sim) jingle('victory');
    S.fights++;
    S.coins += B.coins;
    B.msg = L('勝利！得到經驗 ' + B.exp + '、星幣 ' + B.coins + '。', 'Victory! ' + B.exp + ' EXP and ' + B.coins + ' coins.');
    await pause(70);
    for (const m of S.party) {
      if (m.ko || m.hp <= 0) { m.ko = false; m.hp = 1; continue; }
      const g = R.gainExp(m, B.exp);
      if (g.levels) {
        sfx('level');
        B.msg = L(tn(HEROES[m.id].name) + ' 升到 Lv' + m.lv + '！戰鬥力 ' + num(g.plBefore) + ' → ' + num(g.plAfter), tn(HEROES[m.id].name) + ' reached Lv' + m.lv + '! PL ' + num(g.plBefore) + ' → ' + num(g.plAfter));
        await pause(80);
        for (const s of g.learned) { sfx('power'); B.msg = L(tn(HEROES[m.id].name) + ' 學會了「' + tn(SPECIALS[s].name) + '」！', tn(HEROES[m.id].name) + ' learned ' + tn(SPECIALS[s].name) + '!'); await pause(80); }
      }
    }
  }
  if (result === 'lose') {
    if (opts.canLose) { for (const m of S.party) { m.ko = false; m.hp = Math.max(1, m.hp); } B = null; return 'lose'; }
    if (!AUTO.sim) { playMusic(null); jingle('gameover'); }
    B.msg = L('全員倒下了……', 'Everyone has fallen...');
    await pause(60);
    const k = await menu([{ label: L('再戰一次', 'Try again') }, { label: L('回到標題', 'Back to title') }], { x: 70, y: 150, w: 116, cancel: false });
    B = null;
    if (k === 0) return 'retry';
    return 'title';
  }
  B = null;
  if (!AUTO.sim && prevSong && opts.restoreMusic !== false) playMusic(prevSong);
  return result;
}
void textW; void bigText; void face; void cardBack; void CARD_H; void mix; void hash; void say; void GOLD_COST;
