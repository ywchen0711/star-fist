// The field menu (status, items, save, how to play), the status screen, towns and shops.
import { ctx, W, H, text, textW, windowBox, bar, face, itemIcon, drawCard, drawMoveCard, cursor, paintSky, fighterArt, bigText } from './gfx.js';
import { input } from './input.js';
import { sfx } from './audio.js';
import { push, UI, menu, notice, say, wrap } from './ui.js';
import { L, tn, num } from './i18n.js';
import { HEROES, SPECIALS, ITEMS, needExp } from './data.js';
import * as R from './rules.js';
import { S, save, addItem, fullHeal } from './state.js';
import { TOWNS, BOARDS } from './maps.js';

// ---------- status ----------
export function statusScreen() {
  return push({
    sel: 0,
    update() {
      const n = S.party.length;
      if (UI.auto) { this.done(); return; }
      if (input.repeat('down') || input.repeat('right')) { this.sel = (this.sel + 1) % n; sfx('cursor'); }
      if (input.repeat('up') || input.repeat('left')) { this.sel = (this.sel + n - 1) % n; sfx('cursor'); }
      if ((input.pressed('b') || input.pressed('a')) && this.age > 3) { sfx('cancel'); this.done(); }
    },
    draw() {
      ctx.fillStyle = '#07061a'; ctx.fillRect(0, 0, W, H);
      windowBox(2, 2, 78, H - 4);
      S.party.forEach((m, i) => {
        const y = 10 + i * 34;
        const img = fighterArt({ k: 'c', n: HEROES[m.id].sheet }, 'r').idle[0];
        ctx.globalAlpha = m.ko ? 0.4 : 1; ctx.drawImage(img, 14, y); ctx.globalAlpha = 1;
        text(tn(HEROES[m.id].name), 32, y, i === this.sel ? '#ffe070' : '#f4f4ff');
        bar(32, y + 16, 40, m.hp, R.maxHp(m), '#58e070', 2);
        if (i === this.sel) cursor(6, y + 8, 0);
      });
      const m = S.party[this.sel], h = HEROES[m.id];
      windowBox(82, 2, W - 84, H - 4);
      const f = face(h.sheet);
      if (f) { ctx.fillStyle = '#3a3a7a'; ctx.fillRect(90, 10, 40, 40); ctx.drawImage(f, 91, 11); }
      text(tn(h.name), 138, 10, '#ffe070');
      text(tn(h.title), 138, 24, '#c8c8e8');
      text('Lv ' + m.lv + (h.guest ? L('（客人）', ' (guest)') : ''), 138, 38, '#ffffff');
      let y = 56;
      const row = (a, b, col = '#ffffff') => { text(a, 92, y, '#a8c8ff'); text(b, W - 10, y, col, { align: 'right' }); y += 14; };
      row(L('戰鬥力', 'Power level'), num(R.basePl(m)), '#ffe070');
      row(L('體力', 'HP'), Math.ceil(m.hp) + ' / ' + R.maxHp(m));
      if (!h.guest) row(L('下一級', 'Next level'), num(needExp(m.lv) - m.exp) + ' EXP');
      y += 4;
      text(L('必殺技', 'Special moves'), 92, y, '#ffe070'); y += 14;
      for (const [lv, s] of h.learn) {
        const has = m.lv >= lv;
        text(has ? tn(SPECIALS[s].name) : '？？？', 98, y, has ? '#ffffff' : '#6a6890');
        text(has ? SPECIALS[s].ki + L('氣', ' ki') : 'Lv' + lv, W - 10, y, has ? '#80d8ff' : '#6a6890', { align: 'right' });
        y += 13;
      }
      if (m.id === 'kai' && S.flags.golden) { text(L('金焰覺醒（30氣）', 'Golden Flame (30 ki)'), 98, y, '#ffd040'); y += 13; text(tn(SPECIALS.goldmeteor.name), 98, y, '#ffd040'); text('50' + L('氣', ' ki'), W - 10, y, '#ffd040', { align: 'right' }); }
      text(L('X 返回', 'X: back'), W - 10, H - 16, '#8888b0', { align: 'right' });
    },
  });
}

// ---------- items on the field ----------
export async function itemMenu() {
  for (;;) {
    const ids = Object.keys(S.items).filter((k) => S.items[k] > 0);
    if (!ids.length) { await notice('沒有道具。', 'No items.', { frames: 40 }); return; }
    const r = await menu(ids.map((id) => ({ label: tn(ITEMS[id].name), sub: '×' + S.items[id], icon: (x, y) => itemIcon(ITEMS[id].icon, x, y) })), {
      x: 8, y: 24, w: 160, rows: 7, title: L('道具', 'Items'),
      hint: (sel, xx, yy, w, h) => { windowBox(8, yy + h + 2, 240, 24); text(tn(ITEMS[ids[sel]].desc), 16, yy + h + 8, '#e0e4ff'); },
    });
    if (r < 0) return;
    const id = ids[r];
    const t = await menu(S.party.map((m) => ({ label: tn(HEROES[m.id].name), sub: Math.ceil(m.hp) + '/' + R.maxHp(m) })), { x: 96, y: 40, w: 150, title: L('對誰使用', 'Use on') });
    if (t < 0) continue;
    const res = R.useItem(S.party[t], id);
    if (!res) { sfx('buzz'); await notice('沒有效果。', 'It has no effect.', { frames: 40 }); continue; }
    addItem(id, -1); sfx('heal');
  }
}

// ---------- how to play ----------
const PAGES = [
  { t: ['棋盤移動', 'Moving on the board'], body: ['手上有五張移動牌。選一張，牌上的星數就是最多能走的步數。用方向鍵沿著路線走，按Z提早停下。', 'You hold five movement cards. Pick one: its star number is how many steps you may walk. Follow the paths with the arrows; press Z to stop early.'], pic: 'move' },
  { t: ['地點', 'Places on the board'], body: ['紅星：一定會遇敵。房子：城鎮，可以休息和買東西。藍池：泉水，回復體力。寶箱：道具。閃爍的黃星：故事的下一站。白點：可能遇到野生的敵人。', 'Red star: a fight. Houses: a town to rest and shop. Pool: a spring that heals. Chest: an item. Blinking gold star: where the story goes next. White dot: wild foes may appear.'] },
  { t: ['戰鬥牌', 'Battle cards'], body: ['每回合雙方各拿五張戰鬥牌。上方的星星是「先攻值」，中間的數字是「威力」，同時也是「閃避值」。', 'Each round both sides draw five battle cards. The stars on top are initiative; the big number is power, and also your dodge value.'], pic: 'cards' },
  { t: ['誰先攻', 'Who attacks'], body: ['雙方同時出牌，星多的一方攻擊。星數相同就互擊，雙方各受一點傷害。', 'Both play a card at once. More stars attacks. The same stars means a clash: both take a little damage.'] },
  { t: ['攻擊', 'Attacking'], body: ['拳腳連打：不耗氣，還能集氣。氣功彈：15氣。必殺技：耗氣多，威力大。必牌會讓必殺技半價、威力加三成；氣牌立刻+25氣。', 'Rush: free and builds ki. Ki blast: 15 ki. Specials: cost more, hit harder. A 必 card halves the cost and adds 30% power; a 氣 card gives +25 ki at once.'] },
  { t: ['防守', 'Defending'], body: ['防禦：傷害減半。閃避：我方數字≥對方數字時完全閃開，失敗則多受兩成。對方用光束時可以迎擊，進入光束對決，連打Z把光束推回去！', 'Guard: half damage. Dodge: avoids everything if your number is at least theirs, or takes 20% more if not. Against a beam you can counter: in the beam clash, mash Z to push it back!'] },
  { t: ['戰鬥力', 'Power level'], body: ['每個人都有戰鬥力。戰鬥力高的一方打得更痛、挨打更輕。升級會提高戰鬥力。敵人的戰鬥力不會跟著你變強。', "Everyone has a power level. Higher power hits harder and takes less. Leveling up raises it. Enemies don't grow with you."] },
  { t: ['換人與道具', 'Switching and items'], body: ['換人或用道具會用掉這回合，敵人會趁機攻擊（我方自動防禦）。有人倒下時可以派下一位上場。', 'Switching or using an item spends the round, and the enemy gets a free attack (you guard automatically). When someone falls, send in the next fighter.'] },
];
export function howToPlay() {
  return push({
    page: 0,
    update() {
      if (UI.auto) { this.done(); return; }
      if (input.repeat('right') || (input.pressed('a') && this.age > 3)) { if (this.page < PAGES.length - 1) { this.page++; sfx('cursor'); } else if (input.pressed('a')) { this.done(); } }
      if (input.repeat('left') && this.page > 0) { this.page--; sfx('cursor'); }
      if (input.pressed('b') && this.age > 3) { sfx('cancel'); this.done(); }
    },
    draw() {
      ctx.fillStyle = '#07061a'; ctx.fillRect(0, 0, W, H);
      const p = PAGES[this.page];
      windowBox(6, 6, W - 12, H - 12);
      text(tn(p.t), 16, 14, '#ffe070');
      text((this.page + 1) + '/' + PAGES.length, W - 16, 14, '#8888b0', { align: 'right' });
      wrap(tn(p.body), 222).forEach((l, i) => text(l, 16, 34 + i * 15));
      if (p.pic === 'cards') {
        drawCard(40, 140, { s: 5, n: 3 }); drawCard(90, 140, { s: 2, n: 7 }); drawCard(140, 140, { s: 4, n: 'S' }); drawCard(190, 140, { s: 6, n: 'K' });
      }
      if (p.pic === 'move') [3, 5, 2, 6, 4].forEach((n, i) => drawMoveCard(60 + i * 28, 150, n, { hl: i === 1 }));
      text(L('←→ 翻頁　X 關閉', '←→ pages  X: close'), W / 2, H - 22, '#8888b0', { align: 'center' });
    },
  });
}

export async function fieldMenu() {
  for (;;) {
    const k = await menu([
      { label: L('狀態', 'Status') }, { label: L('道具', 'Items') }, { label: L('紀錄', 'Save') }, { label: L('玩法說明', 'How to play') }, { label: L('關閉', 'Close') },
    ], { x: 8, y: 24, w: 110 });
    if (k === 0) await statusScreen();
    else if (k === 1) await itemMenu();
    else if (k === 2) { const ok = save(); sfx(ok ? 'save' : 'buzz'); await notice(ok ? '已經紀錄了。' : '無法紀錄。', ok ? 'Saved.' : 'Could not save.', { frames: 50 }); }
    else if (k === 3) await howToPlay();
    else return;
  }
}

// ---------- towns ----------
let townTalk = null;
export function setTownTalk(f) { townTalk = f; }
export async function shop(stock) {
  for (;;) {
    const r = await menu(stock.map((id) => ({ label: tn(ITEMS[id].name), sub: ITEMS[id].price + L('幣', 'c'), icon: (x, y) => itemIcon(ITEMS[id].icon, x, y), disabled: S.coins < ITEMS[id].price })), {
      x: 8, y: 24, w: 170, rows: 6, title: L('買什麼？　◎', 'Buy what?  ◎') + S.coins,
      hint: (sel, xx, yy, w, h) => { windowBox(8, yy + h + 2, 240, 38); text(tn(ITEMS[stock[sel]].desc), 16, yy + h + 8, '#e0e4ff'); text(L('持有 ', 'Have ') + (S.items[stock[sel]] || 0), 16, yy + h + 22, '#a8c8ff'); },
    });
    if (r < 0) return;
    const id = stock[r];
    if (S.coins < ITEMS[id].price) { sfx('buzz'); continue; }
    S.coins -= ITEMS[id].price; addItem(id, 1); sfx('chest');
  }
}
export async function town(id, drawBg) {
  const tw = TOWNS[id];
  void drawBg;
  await notice(tn(tw.name), null, { frames: 40, y: 60 });
  for (;;) {
    const k = await menu([
      { label: L('休息', 'Rest') }, { label: L('商店', 'Shop') }, { label: L('交談', 'Talk') }, { label: L('紀錄', 'Save') }, { label: L('離開', 'Leave') },
    ], { x: 8, y: 24, w: 110, title: tn(tw.name), auto: () => 4 });
    if (k === 0) { fullHeal(); sfx('heal'); await notice('全員的體力都回復了。', 'Everyone is rested and healed.', { frames: 50 }); }
    else if (k === 1) await shop(tw.shop);
    else if (k === 2) { if (townTalk) await townTalk(tw.talk); }
    else if (k === 3) { const ok = save(); sfx(ok ? 'save' : 'buzz'); await notice(ok ? '已經紀錄了。' : '無法紀錄。', ok ? 'Saved.' : 'Could not save.', { frames: 50 }); }
    else return;
  }
}
void textW; void paintSky; void bigText; void say; void BOARDS;
