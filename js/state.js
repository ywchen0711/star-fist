// The saved state: the party, items, coins, story flags and where Kai stands on the board.
import { newHero, maxHp, joinLevel, deal } from './rules.js?v=2';
import { HEROES } from './data.js?v=2';

export const S = {};
export function reset() {
  for (const k of Object.keys(S)) delete S[k];
  Object.assign(S, {
    party: [newHero('kai', 1)],
    items: { riceball: 3 },
    coins: 30,
    flags: {},
    chapter: 'c1',
    node: null,
    hand: [],
    steps: 0,
    fights: 0,
    playTime: 0,
  });
}
reset();
export const member = (id) => S.party.find((m) => m.id === id);
export function addMember(id, lv = null) {
  if (member(id)) return member(id);
  const f = newHero(id, lv || (HEROES[id].guest ? 1 : joinLevel(S.party, 1)));
  S.party.push(f);
  return f;
}
export function removeMember(id) { S.party = S.party.filter((m) => m.id !== id); }
export function addItem(id, n = 1) { S.items[id] = (S.items[id] || 0) + n; if (S.items[id] <= 0) delete S.items[id]; }
export function fullHeal() { for (const m of S.party) { m.hp = maxHp(m); m.ki = 30; m.ko = false; m.gold = false; m.buf = {}; } }
export function moveHand(rand = Math.random) { while (S.hand.length < 5) S.hand.push(1 + Math.floor(rand() * 6) + (rand() < 0.15 ? 1 : 0)); }
void deal;

const KEY = 'starfist-save';
export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); return true; } catch (e) { return false; }
}
export function hasSave() { try { return !!localStorage.getItem(KEY); } catch (e) { return false; } }
export function load() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY));
    if (!d || !d.party) return false;
    reset();
    Object.assign(S, d);
    for (const m of S.party) { m.gold = false; m.buf = {}; }
    return true;
  } catch (e) { return false; }
}
