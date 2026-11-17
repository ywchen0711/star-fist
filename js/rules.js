// Battle rules, pure and DOM-free (the balance simulation runs them in node).
//
// Each round both sides are dealt five cards. A card has a STAR value (1-7) and a NUMBER (1-7),
// or a glyph instead of a number: 必 (special: counts as 7, specials cost half ki and hit 30% harder)
// or 氣 (ki: +25 ki at once, counts as 1).
//  1. Both play a card. The higher star attacks; a tie is a clash where both trade blows.
//  2. The attacker picks: rush (free, +8 ki), ki blast (15 ki) or a special move.
//  3. The defender picks: guard (half damage, +6 ki), dodge (works only if the defender's number is
//     at least the attacker's number; a failed dodge takes 20% more), or counter a beam with a beam
//     of their own (20 ki) and push it back in a beam clash.
import { HEROES, SPECIALS, ENEMIES, ITEMS, needExp, MAX_LV, PL_GROWTH, GOLD_MULT, GOLD_COST, GOLD_DRAIN, RUSH_POW, BLAST_POW, BLAST_KI, COUNTER_KI } from './data.js?v=2';

export const KI_MAX = 100;
const clampKi = (f) => { f.ki = Math.max(0, Math.min(KI_MAX, Math.round(f.ki))); };

// ---------- fighters ----------
export function newHero(id, lv = 1) {
  const f = { id, lv, exp: 0, hp: 1, ki: 30, ko: false };
  f.hp = maxHp(f);
  return f;
}
export function newFoe(id) {
  const d = ENEMIES[id];
  if (!d) throw new Error('no enemy ' + id);
  return { id, foe: true, hp: d.hp, ki: d.boss ? 40 : 25, ko: false, buf: {} };
}
export const isFoe = (f) => !!f.foe;
export const def = (f) => (f.foe ? ENEMIES[f.id] : HEROES[f.id]);
export function basePl(f) {
  if (f.foe) return ENEMIES[f.id].pl;
  const h = HEROES[f.id];
  if (h.fixedPl) return f.fixedPl || h.fixedPl;
  return Math.round(h.pl0 * Math.pow(PL_GROWTH, f.lv - 1));
}
export const pl = (f) => basePl(f) * (f.gold ? GOLD_MULT : 1);
// Everyone has an equivalent level: a hero's own, or the level a hero would need for that power level.
// HP and damage both grow with it, so how long a fight lasts depends on the power ratio and the cards.
export function lvEq(f) {
  if (!f.foe && !HEROES[f.id].fixedPl && !f.fixedPl) return f.lv;
  return Math.max(1, 1 + Math.log(basePl(f) / 420) / Math.log(PL_GROWTH));
}
export const scale = (f) => 1 + 0.1 * (lvEq(f) - 1);
export function maxHp(f) {
  if (f.foe) return Math.round(ENEMIES[f.id].hp * scale(f));
  return Math.round(HEROES[f.id].hp0 * scale(f));
}
export function specials(f) {
  if (f.foe) return ENEMIES[f.id].sp.slice();
  const out = HEROES[f.id].learn.filter(([lv]) => f.lv >= lv).map(([, s]) => s);
  if (f.gold) out.push('goldmeteor');
  return out;
}
export const kiColor = (f) => (f.foe ? ENEMIES[f.id].aura || '#ff8060' : f.gold ? '#ffd040' : HEROES[f.id].ki);

// ---------- cards ----------
export function deal(rand, n = 5) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const r = rand();
    const c = { s: 1 + Math.floor(rand() * 7), n: 1 + Math.floor(rand() * 7) };
    if (r < 0.08) c.n = 'S'; else if (r < 0.15) c.n = 'K';
    out.push(c);
  }
  return out;
}
export const cardNum = (c) => (c.n === 'S' ? 7 : c.n === 'K' ? 1 : c.n);
// the number a defender compares when dodging
export const cardDef = (c) => (c.n === 'S' ? 5 : c.n === 'K' ? 1 : c.n);
export const cardF = (c) => (cardNum(c) + 2) / 6;
export function compare(a, b) { return a.s > b.s ? 1 : a.s < b.s ? -1 : 0; }

// ---------- damage ----------
export const RATIO_EXP = 0.6;
export const ratio = (a, d) => Math.max(0.05, Math.min(12, Math.pow(pl(a) / pl(d), RATIO_EXP)));
export function spCost(sp, card) { const k = SPECIALS[sp].ki; return card && card.n === 'S' ? Math.ceil(k / 2) : k; }
export function actionPow(act, card) {
  if (act.t === 'rush') return RUSH_POW;
  if (act.t === 'blast') return BLAST_POW;
  const s = SPECIALS[act.id];
  return (s.pow || 0) * (card && card.n === 'S' ? 1.3 : 1);
}
export const isBeam = (act) => act.t === 'blast' || (act.t === 'sp' && SPECIALS[act.id].kind === 'beam');
export const canDodge = (act) => !(act.t === 'sp' && SPECIALS[act.id].nododge);
export const isSelf = (act) => act.t === 'sp' && ['buff', 'heal'].includes(SPECIALS[act.id].kind);
export function rawDamage(a, d, pow, card, rand = Math.random) {
  return Math.max(1, Math.round(pow * cardF(card) * ratio(a, d) * scale(d) * (0.92 + rand() * 0.16)));
}
export function actionCost(act, card) { return act.t === 'blast' ? BLAST_KI : act.t === 'sp' ? spCost(act.id, card) : 0; }
export function legalActions(f, card) {
  const out = [{ t: 'rush' }];
  if (f.ki >= BLAST_KI) out.push({ t: 'blast' });
  for (const s of specials(f)) if (f.ki >= spCost(s, card)) out.push({ t: 'sp', id: s });
  return out;
}
export function dodgeWorks(defCard, attCard, act, defender) {
  if (!canDodge(act)) return false;
  if (defender && defender.buf && defender.buf.gale > 0) return true;
  return cardDef(defCard) >= cardNum(attCard);
}
// beam clash strength
export function clashStrength(f, card, act) {
  return Math.pow(pl(f), 0.8) * cardF(card) * (act ? Math.max(1, actionPow(act, card) / BLAST_POW) : 1);
}
export function clashOdds(att, attCard, act, dfn, defCard) {
  const a = clashStrength(att, attCard, act), d = clashStrength(dfn, defCard, null);
  return Math.pow(a, 1.6) / (Math.pow(a, 1.6) + Math.pow(d, 1.6));
}

// ---------- one round ----------
export function startRound(p, e, pc, ec) {
  for (const [f, c] of [[p, pc], [e, ec]]) {
    if (!f) continue;
    f.ki += 4;
    if (c && c.n === 'K') f.ki += 25;
    clampKi(f);
  }
}
// The attacker hits the defender. clashWinner: 'att' | 'def' (only used when the response is counter)
// returns a record the battle screen turns into a close-up.
export function exchange(att, dfn, attCard, defCard, act, resp, clashWinner, rand = Math.random) {
  const r = { act, resp, attId: att.id, defId: dfn.id, dmg: 0, toAtt: 0, dodged: false, guarded: false, clash: null, heal: 0, buff: null, burn: 0, failDodge: false };
  att.buf = att.buf || {}; dfn.buf = dfn.buf || {};
  att.ki -= actionCost(act, attCard);
  if (act.t === 'rush') att.ki += 8;
  if (isSelf(act)) {
    const s = SPECIALS[act.id];
    if (s.kind === 'heal') { const h = Math.round(maxHp(att) * s.heal); r.heal = Math.min(h, maxHp(att) - att.hp); att.hp += r.heal; }
    if (s.kind === 'buff') { r.buff = s.buff; if (s.buff === 'stone') att.buf.stone = 3; if (s.buff === 'gale') att.buf.gale = 2; }
    clampKi(att); clampKi(dfn);
    return r;
  }
  const pow = actionPow(act, attCard);
  let dmg = rawDamage(att, dfn, pow, attCard, rand);
  if (resp === 'counter' && isBeam(act) && dfn.ki >= COUNTER_KI) {
    dfn.ki -= COUNTER_KI;
    r.clash = { winner: clashWinner };
    if (clashWinner === 'def') {
      r.toAtt = Math.round(rawDamage(dfn, att, (pow + BLAST_POW) / 2, defCard, rand) * 1.25);
      if (att.buf.stone > 0) r.toAtt = Math.round(r.toAtt * 0.6);
      att.hp = Math.max(0, att.hp - r.toAtt);
      dmg = 0;
    } else dmg = Math.round(dmg * 1.25);
  } else if (dfn.buf.gale > 0 && canDodge(act)) {
    dfn.buf.gale--; r.dodged = true; r.gale = true; dmg = 0; dfn.ki += 4;
  } else if (resp === 'dodge') {
    if (dodgeWorks(defCard, attCard, act, null)) { r.dodged = true; dmg = 0; dfn.ki += 4; }
    else { dmg = Math.round(dmg * 1.2); r.failDodge = true; }
  } else if (resp === 'guard') { r.guarded = true; dmg = Math.round(dmg * 0.5); dfn.ki += 6; }
  if (dmg > 0 && dfn.buf.stone > 0) dmg = Math.round(dmg * 0.6);
  if (dmg > 0) dmg = Math.max(1, dmg);
  r.dmg = dmg;
  dfn.hp = Math.max(0, dfn.hp - dmg);
  if (act.t === 'sp' && SPECIALS[act.id].burn && dmg > 0) { r.burn = Math.min(dfn.ki, SPECIALS[act.id].burn); dfn.ki -= r.burn; }
  clampKi(att); clampKi(dfn);
  return r;
}
// both cards show the same star: they meet in the middle and trade blows
export function clash(p, e, pc, ec, rand = Math.random) {
  const a = Math.round(rawDamage(p, e, RUSH_POW, pc, rand) * 0.5), b = Math.round(rawDamage(e, p, RUSH_POW, ec, rand) * 0.5);
  e.hp = Math.max(0, e.hp - a); p.hp = Math.max(0, p.hp - b);
  p.ki += 5; e.ki += 5; clampKi(p); clampKi(e);
  return { tie: true, toE: a, toP: b };
}
// once a round is over: buffs wear off, the Golden Flame burns ki
export function endRound(f) {
  if (!f) return null;
  f.buf = f.buf || {};
  if (f.buf.stone > 0) f.buf.stone--;
  let reverted = false;
  if (f.gold) { f.ki -= GOLD_DRAIN; if (f.ki <= 0) { f.ki = 0; f.gold = false; reverted = true; } }
  clampKi(f);
  if (f.hp <= 0) f.ko = true;
  return reverted;
}
export const canGold = (f, flags) => !f.foe && f.id === 'kai' && flags && flags.golden && !f.gold && f.ki >= GOLD_COST;
export function goGold(f) { f.gold = true; f.ki -= GOLD_COST; clampKi(f); }

// ---------- AI ----------
// skill 0 (beasts) .. 3 (the emperor): how carefully it picks
export function aiCard(me, foe, hand, skill, rand) {
  let best = 0, bs = -1e9;
  hand.forEach((c, i) => {
    let s = c.s * 1.1 + cardNum(c) * 0.55;
    if (c.n === 'S' && specials(me).some((sp) => me.ki >= spCost(sp, c))) s += 2.5;
    if (c.n === 'K' && me.ki < 45) s += 2.2;
    s += rand() * (3.2 - skill);
    if (s > bs) { bs = s; best = i; }
  });
  return best;
}
export function aiAction(me, foe, myCard, foeCard, skill, rand) {
  const acts = legalActions(me, myCard);
  const foeDodges = (act) => dodgeWorks(foeCard, myCard, act, foe);
  const lowHp = me.hp < maxHp(me) * 0.42;
  let best = acts[0], bs = -1e9;
  for (const a of acts) {
    let v;
    if (isSelf(a)) {
      const s = SPECIALS[a.id];
      if (s.kind === 'heal') v = lowHp ? 3.2 : -1;
      else if (s.buff === 'stone') v = me.buf && me.buf.stone > 0 ? -1 : ratio(foe, me) > 0.9 ? 1.9 : 1.0;
      else v = me.buf && me.buf.gale > 0 ? -1 : 1.7;
    } else {
      const pow = actionPow(a, myCard);
      const est = rawDamage(me, foe, pow, myCard, () => 0.5);
      v = pow / RUSH_POW;
      if (foeDodges(a)) v *= 0.12;
      if (isBeam(a) && foe.ki >= COUNTER_KI) v *= 0.85;
      v -= actionCost(a, myCard) * 0.022;
      if (a.t === 'rush') v += 0.15;
      if (est >= foe.hp && !foeDodges(a)) v += 3 - actionCost(a, myCard) * 0.01;
    }
    v += (rand() - 0.5) * (1.6 - skill * 0.4);
    if (v > bs) { bs = v; best = a; }
  }
  return best;
}
export function aiResponse(me, att, myCard, attCard, act, skill, rand) {
  if (isSelf(act)) return 'none';
  if (dodgeWorks(myCard, attCard, act, me)) return 'dodge';
  if (isBeam(act) && me.ki >= COUNTER_KI) {
    const odds = 1 - clashOdds(att, attCard, act, me, myCard);
    if (odds > 0.5 - skill * 0.03 || (rand() < 0.15 && odds > 0.3)) return 'counter';
  }
  if (skill === 0 && rand() < 0.12) return 'dodge';
  return 'guard';
}

// ---------- growth ----------
export function gainExp(f, n) {
  const out = { levels: 0, learned: [], plBefore: basePl(f) };
  if (f.foe || HEROES[f.id].guest) return out;
  f.exp += n;
  while (f.lv < MAX_LV && f.exp >= needExp(f.lv)) {
    f.exp -= needExp(f.lv);
    const hpBefore = maxHp(f);
    f.lv++; out.levels++;
    f.hp += maxHp(f) - hpBefore;
    for (const [lv, s] of HEROES[f.id].learn) if (lv === f.lv) out.learned.push(s);
  }
  out.plAfter = basePl(f);
  return out;
}
// a hero who joins late starts at a level close to the party's
export function joinLevel(party, minus = 1) {
  const lv = party.filter((m) => !HEROES[m.id].guest).reduce((a, m) => Math.max(a, m.lv), 1);
  return Math.max(1, lv - minus);
}
export function useItem(f, id) {
  const it = ITEMS[id];
  const r = { hp: 0, ki: 0, revived: false };
  if (it.revive) { if (!f.ko && f.hp > 0) return null; f.ko = false; f.hp = Math.max(1, Math.round(maxHp(f) * it.revive)); r.revived = true; r.hp = f.hp; return r; }
  if (f.ko || f.hp <= 0) return null;
  if (it.hp) { const h = Math.min(Math.round(it.hp * maxHp(f)), maxHp(f) - f.hp); f.hp += h; r.hp = h; }
  if (it.ki) { const k = Math.min(it.ki, KI_MAX - f.ki); f.ki += k; r.ki = k; }
  if (!r.hp && !r.ki) return null;
  return r;
}
export function mulberry(seed) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
