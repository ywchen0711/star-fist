// Boot, the main loop, the title screen, story stages, chapter flow, the ending and credits,
// and the test hooks on window.G.
import { ctx, W, H, present, text, textW, bigText, windowBox, paintSky, drawTwinkles, fighterArt, loadImages, mix, hash, bayer, drawStar, view, drawCard, cursor, canvas } from './gfx.js?v=2';
import { input, pollInput, endInput, setupTouch } from './input.js?v=2';
import { initAudio, playMusic, sfx, jingle } from './audio.js?v=2';
import { UI, uiTick, push, say, talk, menu, notice, wait, wrap } from './ui.js?v=2';
import { L, tn, setLang, LANG, num } from './i18n.js?v=2';
import { HEROES, ENEMIES, ITEMS, PEOPLE } from './data.js?v=2';
import * as R from './rules.js?v=2';
import { S, reset, save, load, hasSave, addMember, removeMember, member, addItem, fullHeal, moveHand } from './state.js?v=2';
import { BOARDS, TOWNS, CHAPTERS } from './maps.js?v=2';
import { FIELD, drawField, pickCard, walkSteps, pathTo, setBoard, node } from './field.js?v=2';
import { battle, drawBattle, B, AUTO } from './battle.js?v=2';
import { fieldMenu, town, setTownTalk, howToPlay } from './menu.js?v=2';
import { STORY, TALK } from './story.js?v=2';
import { CINE, playGolden, drawAura, drawFighter, beamClash, playExchange } from './cinema.js?v=2';

// ---------- loading ----------
const CHARS = ['SamuraiBlue', 'Master', 'Cavegirl2', 'Statue', 'Woman', 'Vampire', 'OldMan', 'OldMan2', 'Villager', 'Villager2', 'Villager3', 'Villager4', 'Villager5', 'Princess', 'GoldStatue', 'Monk', 'Monk2', 'Eskimo', 'Noble', 'Inspector', 'Hunter', 'NinjaLeaf',
  'RobotGrey', 'RobotGreen', 'RobotCamouflage', 'Skeleton', 'Knight', 'NinjaMasked', 'GladiatorBlue', 'DemonGreen', 'DemonRed', 'KnightGold', 'SkeletonDemon', 'MonkeyBoxerRed', 'Samurai', 'Tengu2'];
const MONS = ['Bear', 'Snake', 'Owl', 'Mole', 'Lizard', 'KappaGreen', 'Mushroom', 'Reptile', 'Mole2', 'Cyclope', 'Butterfly', 'Eye2', 'SpiderRed', 'BlueBat', 'Skull', 'Larva2', 'SkullBlue', 'Beast2', 'Beast'];
const BOSSES = ['GiantRedSamurai', 'TenguRed', 'TenguBlue', 'DemonCyclop', 'DemonCyclop2', 'GiantRacoonGold'];
const FACES = [...new Set([...CHARS, ...MONS, ...BOSSES])];
const FXS = ['explosion', 'spark', 'circle', 'cutx', 'shield', 'smoke', 'thunder', 'boost', 'rock'];
const ICONS = ['Onigiri', 'LifePot', 'MilkPot', 'Nut', 'TeaLeaf'];

let scene = 'boot';
const T = { dark: 0, flash: 0, flashCol: '#fff' };
function fade(to, n = 16) {
  const from = T.dark;
  return push({ update() { T.dark = from + (to - from) * Math.min(1, this.age / (UI.auto ? 1 : n)); if (this.age >= (UI.auto ? 1 : n)) { T.dark = to; this.done(); } }, draw() {} });
}

// ---------- the stage: side-view story scenes ----------
const ST = { theme: null, actors: [], fx: null, t: 0 };
function stageTheme(key) {
  const night = key.endsWith('n');
  const base = BOARDS[night ? key.slice(0, -1) : key].sky;
  if (!night) return base;
  return { ...base, sky: [mix(base.sky[0], '#000010', 0.4), mix(base.sky[1], '#06041a', 0.55), mix(base.sky[2], '#1a1040', 0.7)], stars: 110 };
}
function actorArt(a) {
  if (a.b) return fighterArt({ k: 'b', n: a.b, ...Object.values(ENEMIES).find((e) => e.spr.n === a.b).spr, hue: a.hue }, a.f);
  if (a.m) return fighterArt({ k: 'm', n: a.n }, a.f);
  return fighterArt({ k: 'c', n: a.n, ghost: a.ghost }, a.f);
}
function drawStage() {
  ST.t++;
  const t = ST.t;
  ctx.drawImage(paintSky(ST.theme, W, H, 150), 0, 0);
  drawTwinkles(t, 14, 100, 5);
  const fx = ST.fx;
  if (fx === 'meteors' || fx === 'comet') {
    for (let i = 0; i < 3; i++) {
      const k = ((t * 0.008 + i * 0.33) % 1);
      const x = 40 + i * 70 + k * 120, y = 10 + k * 90 + Math.sin(k * 3 + i) * 10;
      for (let j = 0; j < 18; j++) { ctx.globalAlpha = 1 - j / 18; ctx.fillStyle = j < 3 ? '#ffffff' : '#ff6050'; ctx.fillRect(Math.round(x - j * 3), Math.round(y - j * 2.2), 2, 2); }
      ctx.globalAlpha = 1;
    }
  }
  if (fx === 'comet') {
    // the Iron Comet hangs in the sky
    const cx = 170, cy = 40;
    for (let y = -16; y <= 16; y++) for (let x = -26; x <= 26; x++) {
      if ((x * x) / 676 + (y * y) / 256 > 1) continue;
      const lit = (-x - y) / 30 + (bayer(x + 50, y + 50) - 0.5) * 0.4;
      ctx.fillStyle = lit > 0.4 ? '#9a9ab8' : lit > -0.1 ? '#5a5a78' : '#2a2a40';
      ctx.fillRect(cx + x, cy + y, 1, 1);
    }
    for (let i = 0; i < 6; i++) { ctx.fillStyle = (t >> 3) % 2 ? '#ff4060' : '#c040ff'; ctx.fillRect(cx - 18 + i * 7, cy + 2 + (i % 2) * 4, 2, 1); }
  }
  if (fx === 'beacon') {
    ctx.fillStyle = '#3a3a58'; ctx.fillRect(120, 70, 16, 80); ctx.fillStyle = '#5a5a80'; ctx.fillRect(120, 70, 3, 80);
    ctx.globalAlpha = 0.5 + Math.sin(t * 0.2) * 0.2; ctx.fillStyle = '#ff5070'; ctx.fillRect(124, 0, 8, 72); ctx.globalAlpha = 1;
  }
  if (fx === 'drill') {
    ctx.fillStyle = '#4a4a5a'; ctx.fillRect(116, 60, 24, 90); ctx.fillStyle = '#6a6a80'; ctx.fillRect(116, 60, 4, 90);
    for (let i = 0; i < 5; i++) { ctx.fillStyle = '#4ab0e0'; ctx.fillRect(122 + Math.round(Math.sin(t * 0.3 + i) * 2), 150 - ((t * 2 + i * 18) % 90), 4, 4); }
  }
  if (fx === 'forge') { for (let i = 0; i < 30; i++) { const k = (t * 0.02 + hash(i, 1)) % 1; ctx.fillStyle = k < 0.3 ? '#ffe070' : '#ff6020'; ctx.fillRect(128 + (hash(i, 2) - 0.5) * 40, 150 - k * 70, 2, 2); } ctx.fillStyle = '#2a1a14'; ctx.fillRect(108, 130, 40, 20); }
  if (fx === 'crater') { ctx.fillStyle = '#2a1a1a'; ctx.beginPath(); ctx.ellipse(190, 152, 40, 8, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#ff6040'; ctx.fillRect(176, 150, 28, 1); for (let i = 0; i < 6; i++) { const k = (t * 0.01 + i / 6) % 1; ctx.globalAlpha = 1 - k; ctx.fillStyle = '#8a8a9a'; ctx.fillRect(184 + i * 3, 140 - k * 40, 3, 3); } ctx.globalAlpha = 1; }
  if (fx === 'fire') { for (let i = 0; i < 24; i++) { const k = (t * 0.03 + hash(i, 1)) % 1; ctx.fillStyle = k < 0.4 ? '#ffe070' : '#ff5020'; ctx.fillRect(Math.round(128 + (hash(i, 2) - 0.5) * 10 * (1 - k)), Math.round(150 - k * 22), 2, 2); } ctx.fillStyle = '#3a2214'; ctx.fillRect(120, 150, 16, 2); }
  if (fx === 'core' || fx === 'throne') {
    ctx.fillStyle = fx === 'core' ? '#203050' : '#2a1838';
    for (let x = 0; x < W; x += 32) { ctx.fillRect(x, 40, 3, 110); }
    if (fx === 'core') { const r = 18 + Math.sin(t * 0.1) * 3; ctx.globalAlpha = 0.6; ctx.fillStyle = '#80ffd0'; ctx.beginPath(); ctx.arc(128, 80, r, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(128, 80, r * 0.4, 0, Math.PI * 2); ctx.fill(); }
  }
  if (fx === 'town') {
    for (const [hx, w, h, roof] of [[20, 44, 30, '#a83828'], [86, 56, 38, '#3a5aa8'], [160, 48, 32, '#a87028'], [214, 40, 28, '#3a7a48']]) {
      const by = 150;
      ctx.fillStyle = '#05040f'; ctx.fillRect(hx - 1, by - h - 1, w + 2, h + 2);
      ctx.fillStyle = '#d8c8a0'; ctx.fillRect(hx, by - h, w, h);
      ctx.fillStyle = '#b8a880'; ctx.fillRect(hx, by - h, w, 3);
      for (let k = 0; k < 10; k++) { ctx.fillStyle = k === 0 ? '#05040f' : roof; ctx.fillRect(hx - 6 + k, by - h - 10 + k, w + 12 - k * 2, 1); }
      ctx.fillStyle = '#4a2a18'; ctx.fillRect(hx + w / 2 - 4, by - 14, 8, 14);
      ctx.fillStyle = (t >> 5) % 3 ? '#ffd870' : '#ffe8a0'; ctx.fillRect(hx + 5, by - h + 8, 7, 6); ctx.fillRect(hx + w - 12, by - h + 8, 7, 6);
    }
  }
  if (fx === 'holo') { ctx.globalAlpha = 0.35 + Math.sin(t * 0.3) * 0.1; ctx.fillStyle = '#c040ff'; ctx.fillRect(150, 20, 80, 100); ctx.globalAlpha = 1; for (let y = 20; y < 120; y += 3) { ctx.fillStyle = 'rgba(255,200,255,0.15)'; ctx.fillRect(150, y, 80, 1); } }
  for (const a of ST.actors) {
    if (a.tx != null) { const d = a.tx - a.x; a.x += Math.sign(d) * Math.min(Math.abs(d), 3); if (Math.abs(d) < 1) a.tx = null; }
    const art = actorArt(a), sc = art.big ? art.ss : 2;
    ctx.fillStyle = 'rgba(5,4,15,0.45)'; ctx.beginPath(); ctx.ellipse(a.x, 151, art.w * sc * 0.4, 3, 0, 0, Math.PI * 2); ctx.fill();
    if (a.gold) drawAura(a.x, 150, art.w * sc * 0.6, art.h * sc, '#ffd040', t, 1.1);
    if (a.glow > 0) { a.glow--; drawAura(a.x, 150, art.w * sc * 0.6, art.h * sc, a.glowCol, t, 0.8); }
    const img = art.idle[Math.floor((t + a.x) / 14) % art.idle.length];
    const w = img.width * sc, h = img.height * sc;
    if (a.down) { ctx.save(); ctx.translate(Math.round(a.x), 150 - w / 2 + 2); ctx.rotate(-Math.PI / 2 * (a.f === 'l' ? -1 : 1)); ctx.drawImage(img, -h / 2, -w / 2, h, w); ctx.restore(); }
    else drawFighter(art, a.x, 151, sc, 'idle', t + a.x, { gold: a.gold });
  }
}

// ---------- the toolbox for story scenes ----------
let curStep = null;
const E = {
  say: (who, zh, en) => { const p = num(R.pl(S.party[0])); return say(who, zh.replace('%PL%', p), (en || zh).replace('%PL%', p)); },
  talk, wait, notice,
  sfx: (n) => sfx(n),
  music: (n) => playMusic(n),
  stage(key, actors, { fx = null } = {}) { ST.theme = stageTheme(key); ST.actors = actors.map((a) => ({ ...a })); ST.fx = fx; scene = 'stage'; },
  unstage() { scene = 'field'; },
  addActor(a) { ST.actors.push({ ...a }); },
  removeActor(id) { ST.actors = ST.actors.filter((a) => a.id !== id); },
  moveActor(id, x) { const a = ST.actors.find((q) => q.id === id); if (a) a.tx = x; },
  setDown(id, v) { const a = ST.actors.find((q) => q.id === id); if (a) a.down = v; },
  glow(id, col, n) { const a = ST.actors.find((q) => q.id === id); if (a) { a.glow = n; a.glowCol = col; } },
  flash(col) { T.flash = 12; T.flashCol = col; },
  shake(n) { view.shake = 3; setTimeout(() => { view.shake = 0; }, n * 16); },
  async battle(ids, opts = {}) { const prev = scene; scene = 'battle'; const r = await battle(ids, opts); scene = prev === 'battle' ? 'field' : prev; return r; },
  join(id, delta = -1, pl = null) {
    const top = S.party.filter((m) => !HEROES[m.id].guest).reduce((a, m) => Math.max(a, m.lv), 1);
    const m = addMember(id, Math.max(1, top + delta));
    if (pl) { m.fixedPl = pl; m.hp = R.maxHp(m); }
    sfx('level');
  },
  leave(id) { removeMember(id); },
  give(id, n = 1) { addItem(id, n); sfx('chest'); },
  flag(f) { S.flags[f] = true; },
  async golden() { await playGolden(fighterArt({ k: 'c', n: 'SamuraiBlue' }, 'r'), true); },
  async nextChapter(id) { if (curStep) S.flags[curStep.id] = true; await fade(1, 30); S.node = null; setBoard(id); moveHand(); fullHeal(); await chapterCard(id); save(); scene = 'field'; await fade(0, 20); },
  async ending() { if (curStep) S.flags[curStep.id] = true; await endingScene(); },
  async epilogueEnd() { if (curStep) S.flags[curStep.id] = true; await epilogueScene(); },
};
setTownTalk(async (key) => {
  const people = TALK[key](S.flags);
  const k = await menu(people.map(([who]) => ({ label: tn(PEOPLE[who].name) })), { x: 120, y: 24, w: 128, title: L('和誰說話？', 'Talk to whom?') });
  if (k < 0) return;
  const [who, zh, en] = people[k];
  await say(who, zh, en);
});
function chapterCard(id) {
  const ch = STORY[id];
  playMusic(BOARDS[id].music);
  return push({
    update() { if (UI.auto || this.age > 150 || (this.age > 30 && input.pressed('a'))) this.done(); },
    draw() {
      ctx.fillStyle = '#05040f'; ctx.fillRect(0, 0, W, H);
      drawTwinkles(this.age, 30, 224, 9);
      const [a, b] = tn(ch.title).split(/[　:：]\s*/);
      text(a, W / 2, 84, '#a8c8ff', { align: 'center' });
      bigText(b || '', W / 2, 104, '#ffe070', 2, { align: 'center', grad: '#fffbe0' });
    },
  });
}

// ---------- chapters ----------
async function runStep(step) {
  curStep = step;
  await step.run(E);
  S.flags[step.id] = true;
  curStep = null;
  if (scene === 'stage') scene = 'field';
}
const currentStep = () => (STORY[S.chapter] ? STORY[S.chapter].steps.find((s) => !S.flags[s.id]) : null);
function lowHp() { const al = S.party.filter((m) => !m.ko); return al.reduce((a, m) => a + m.hp / R.maxHp(m), 0) / Math.max(1, al.length) < 0.55; }
function autoTarget(step) {
  // the auto-player heads for a rest stop when hurt, otherwise for the story
  if (lowHp()) {
    let best = null, bd = 1e9;
    for (const n of Object.values(FIELD.board.nodes)) if (n.k === 's' || n.k === 't') { const p = pathTo(S.node, n.id); if (p && p.length < bd && p.length > 0) { bd = p.length; best = n.id; } }
    if (best && bd <= 8) return best;
  }
  if (G.grind && step && step.boss !== false && needGrind()) {
    // wander to the nearest fight node
    let best = null, bd = 1e9;
    for (const n of Object.values(FIELD.board.nodes)) if (n.k === 'f' && n.id !== S.node) { const p = pathTo(S.node, n.id); if (p && p.length < bd) { bd = p.length; best = n.id; } }
    if (best) return best;
  }
  return step ? step.at : null;
}
const GRIND = { c1: 5, c2: 10, c3: 15, c4: 20, c5: 26, c6: 31, c7: 40 };
function needGrind() { return S.party[0].lv < (G.grindLv ? G.grindLv[S.chapter] : GRIND[S.chapter]) && /boss|crash|forge|beacon|throne|zed|shrine|ring/.test((currentStep() || {}).at || '') ; }
async function playChapters() {
  scene = 'field';
  for (;;) {
    if (!STORY[S.chapter]) return;
    const step = currentStep();
    if (!step && UI.auto) return;
    FIELD.objective = step ? step.at : null;
    FIELD.objText = step ? tn(step.obj) : L('故事結束了。自由地四處走走吧。', 'The story is over. Wander as you like.');
    if (step && (step.at === null || step.at === S.node)) { await runStep(step); if (G.stopAt && S.flags[G.stopAt]) return; continue; }
    scene = 'field';
    const target = UI.auto ? autoTarget(step) : step ? step.at : null;
    const autoPick = () => {
      const p = pathTo(S.node, target) || [];
      const d = p.length;
      let bi = 0, bv = 1e9;
      S.hand.forEach((n, i) => { const v = n >= d ? n - d : 100 + (d - n); if (v < bv) { bv = v; bi = i; } });
      return bi;
    };
    const k = await pickCard(autoPick);
    if (k === 'menu') { await fieldMenu(); continue; }
    const n = S.hand.splice(k, 1)[0];
    moveHand();
    const queue = [];
    FIELD.moving = true;
    const end = await walkSteps(n, (id) => {
      const nd = node(id);
      if (nd.k === 'c' && !S.flags['chest_' + S.chapter + '_' + id]) {
        S.flags['chest_' + S.chapter + '_' + id] = true;
        const [it, cnt] = nd.extra.split(':');
        addItem(it, +cnt); sfx('chest');
        queue.push([L('得到了 ' + tn(ITEMS[it].name) + ' ×' + cnt + '！', 'Found ' + tn(ITEMS[it].name) + ' ×' + cnt + '!')]);
      }
      if (step && id === step.at) return 'stop';
      if (UI.auto && id === target) return 'stop';
      return null;
    }, () => { const p = pathTo(S.node, target); return p && p.length ? p[0] : null; });
    FIELD.moving = false;
    for (const [m] of queue) await notice(m, m, { frames: 50 });
    if (step && end === step.at) continue;
    await resolveNode(node(end));
    if (G.stopAt && S.flags[G.stopAt]) return;
  }
}
async function resolveNode(nd) {
  const b = FIELD.board;
  if (nd.k === 'f' && b.enc.length) {
    const groups = b.enc.filter((g) => g.length > 1);
    const g = groups[Math.floor(Math.random() * groups.length)] || b.enc[0];
    await E.battle(g);
  } else if (nd.k === 't') {
    if (UI.auto) await autoTown(TOWNS[b.towns[nd.id]]);
    else {
      const tw = TOWNS[b.towns[nd.id]];
      const folk = TALK[tw.talk](S.flags).map(([who]) => PEOPLE[who].face).filter((f) => CHARS.includes(f));
      E.stage(S.chapter, [{ id: 'kai', n: 'SamuraiBlue', x: 44, f: 'r' }, ...folk.map((n, i) => ({ id: 'f' + i, n, x: 150 + i * 34, f: 'l' }))], { fx: 'town' });
      await town(b.towns[nd.id]);
      E.unstage();
    }
  } else if (nd.k === 's') {
    fullHeal(); sfx('heal');
    await notice('在泉水邊休息。全員回復了！', 'You rest by the spring. Everyone is healed!', { frames: 60 });
    save();
  } else if (nd.k === '.' && b.enc.length && Math.random() < b.rate) {
    const g = b.enc[Math.floor(Math.random() * b.enc.length)];
    await E.battle(g);
  }
}
async function autoTown(tw) {
  fullHeal();
  // buy healing for the road, keeping some coins
  for (const id of ['elixir', 'broth', 'riceball']) {
    if (!tw.shop.includes(id)) continue;
    while ((S.items[id] || 0) < 4 && S.coins >= ITEMS[id].price * 2) { S.coins -= ITEMS[id].price; addItem(id, 1); }
  }
  if (tw.shop.includes('tea') && !S.items.tea && S.coins > 200) { S.coins -= ITEMS.tea.price; addItem('tea', 1); }
}

// ---------- the ending, the credits, the epilogue ----------
async function endingScene() {
  await fade(1, 40);
  E.stage('c6', [], { fx: null });
  ST.theme = { sky: ['#04020c', '#0a0820', '#1a2a5a'], ground: '#05040f', planet: [128, 120, 60, '#4a8ad0'], stars: 140 };
  ST.fx = 'lightrain';
  playMusic('ending');
  await fade(0, 40);
  await say(null, '鐵彗星碎成了千萬顆流星。被抽走的生命化成光雨，落回了大地。', 'The Iron Comet shatters into a thousand shooting stars. The stolen life falls back to the land as a rain of light.');
  await say(null, '蘆河漲滿了水，巨石谷響起了歌聲，高原上的花一齊開了。', 'Reed River swells full, song rises from Stonegiant Valley, and every flower on the highlands opens at once.');
  await fade(1, 30);
  E.stage('c1', [{ id: 'kai', n: 'SamuraiBlue', x: 70, f: 'r' }, { id: 'lin', n: 'Cavegirl2', x: 110, f: 'r' }, { id: 'taro', n: 'Statue', x: 140, f: 'l' }, { id: 'mira', n: 'Woman', x: 170, f: 'l' }, { id: 'zed', n: 'Vampire', x: 210, f: 'l' }]);
  await fade(0, 30);
  await say('lin', '這就是你長大的地方啊。好高。', 'So this is where you grew up. It\'s so high.');
  await say('taro', '松樹的味道……很溫柔。', 'The pines smell... so gentle.');
  await say('mira', '風說，這裡的老爺爺每天都在山頂等日出。', 'The wind says the old man here waited for the sunrise on the peak every day.');
  await say('zed', '……我沒有家可以回。這裡，可以讓我待一陣子嗎？', "...I have no home to return to. Could I stay here a while?");
  await say('kai', '當然。師父說過，山也得有人守。', 'Of course. Master always said someone must guard the mountain.');
  await say('kai', '……一千一百下。我們開始吧。', '...One thousand one hundred. Let\'s begin.');
  await fade(1, 40);
  await credits(false);
  S.flags.cleared = true;
  await notice('感謝遊玩！通關後的「星拳大會」開放了。', 'Thanks for playing! The post-game Star Fist Tournament is now open.', { frames: 200 });
  S.party = S.party.filter((m) => m.id !== 'oroso');
  await E.nextChapter('c7');
}
async function epilogueScene() {
  await fade(1, 40);
  playMusic('credits');
  await credits(true);
  S.flags.alldone = true; window.ALLDONE = (window.ALLDONE || 0) + 1;
  save();
  throw new Error('__title__');
}
function credits(short) {
  const lines = [
    ['星拳傳說', 'Legend of the Star Fist', 2],
    ['', ''],
    ['── 登場人物 ──', '- Cast -'],
    ['凱　琳　太郎　米菈　傑德', 'Kai  Lin  Taro  Mira  Zed'],
    ['大師奧羅索', 'Master Oroso'],
    ['沃拉克大帝與鐵彗軍團', 'Emperor Vorrak and the Iron Comet Legion'],
    ['', ''],
    ['── 美術・音樂・效果 ──', '- Art, music, effects -'],
    ['Ninja Adventure Asset Pack', 'Ninja Adventure Asset Pack'],
    ['by Pixel-boy & AAA (CC0)', 'by Pixel-boy & AAA (CC0)'],
    ['', ''],
    ['── 字型 ──', '- Font -'],
    ['俐方體11號 Cubic 11', 'Cubic 11'],
    ['', ''],
    ['── 故事・程式・卡牌設計 ──', '- Story, code, cards -'],
    ['為本作原創', 'Original to this game'],
    ['', ''],
    ['謝謝你玩到最後', 'Thank you for playing'],
    [short ? '～完～' : '', short ? '- The End -' : ''],
  ];
  return push({
    update() { const len = lines.length * 22 + H + 40; if (UI.auto || this.age > len * 2 || (this.age > 60 && input.pressed('b'))) this.done(); },
    draw() {
      ctx.fillStyle = '#05040f'; ctx.fillRect(0, 0, W, H);
      drawTwinkles(this.age, 40, 224, 4);
      const y0 = H + 10 - this.age / 2;
      lines.forEach(([zh, en, big], i) => {
        const y = y0 + i * 22;
        if (y < -30 || y > H) return;
        if (big) bigText(L(zh, en), W / 2, y, '#ffe070', 2, { align: 'center', grad: '#fffbe0' });
        else text(L(zh, en), W / 2, y, zh.startsWith('──') ? '#a8c8ff' : '#f4f4ff', { align: 'center' });
      });
    },
  });
}

// ---------- the title ----------
let titleT = 0;
function drawTitle() {
  titleT++;
  const t = titleT;
  for (let y = 0; y < H; y += 2) { ctx.fillStyle = mix('#05030f', '#2a1450', Math.pow(y / H, 1.5)); ctx.fillRect(0, y, W, 2); }
  for (let i = 0; i < 120; i++) {
    const x = Math.floor(hash(i, 1) * W), y = Math.floor(hash(i, 2) * H);
    const tw = (t / 20 + hash(i, 3) * 10) % 6;
    ctx.fillStyle = tw < 0.5 ? '#ffffff' : hash(i, 4) < 0.3 ? '#fff0b0' : '#7880c0';
    ctx.fillRect(x, y, 1, 1);
  }
  // the world below
  const pr = 150, pcx = 128, pcy = H + 110;
  for (let y = pcy - pr; y < H; y++) for (let x = 0; x < W; x += 1) {
    const d = Math.hypot(x - pcx, y - pcy);
    if (d > pr) continue;
    const lit = (pr - d) / 26 + (bayer(x, y) - 0.5) * 0.6 - (x - pcx) / 300;
    ctx.fillStyle = d > pr - 2 ? '#8ad8ff' : lit > 1.6 ? '#3a7ac0' : lit > 0.8 ? '#2a5a98' : '#1a3a70';
    if (hash(x >> 2, y >> 2, 6) > 0.72 && d < pr - 3) ctx.fillStyle = lit > 1.2 ? '#4a9a5a' : '#2a6a3a';
    ctx.fillRect(x, y, 1, 1);
  }
  // the comet
  const k = (t % 600) / 600, cx = -40 + k * 340, cy = 30 + k * 40;
  for (let j = 0; j < 40; j++) { ctx.globalAlpha = (1 - j / 40) * 0.8; ctx.fillStyle = j < 4 ? '#ffffff' : j < 14 ? '#ffd070' : '#ff7050'; ctx.fillRect(Math.round(cx - j * 3), Math.round(cy - j * 0.4), 3 - (j > 20 ? 1 : 0), 2); }
  ctx.globalAlpha = 1;
  // Kai on a ledge with his aura
  const art = fighterArt({ k: 'c', n: 'SamuraiBlue' }, 'r');
  ctx.fillStyle = '#100c22'; ctx.beginPath(); ctx.moveTo(150, H); ctx.lineTo(176, 164); ctx.lineTo(224, 160); ctx.lineTo(256, 172); ctx.lineTo(256, H); ctx.fill();
  drawAura(224, 162, 26, 48, '#58c8ff', t, 1.2);
  drawFighter(art, 224, 163, 3, 'idle', t, {});
  // the logo
  drawStar(42, 38, 14, '#ffd040');
  bigText(L('星拳傳說', '星拳傳說'), W / 2 + 8, 26, '#ffd860', 3, { align: 'center', outline: '#3a1408', grad: '#fff8d0' });
  bigText('LEGEND OF THE STAR FIST', W / 2, 70, '#a8d8ff', 1, { align: 'center', outline: '#0a0820' });
}
async function title() {
  scene = 'title';
  playMusic('title');
  for (;;) {
    const opts = [{ k: 'new', label: L('新的旅程', 'New Game') }];
    if (hasSave()) opts.push({ k: 'cont', label: L('繼續', 'Continue') });
    opts.push({ k: 'lang', label: L('語言：中文', 'Language: English') }, { k: 'help', label: L('玩法說明', 'How to Play') });
    const r = await menu(opts, { x: (w) => (W - w) / 2, y: 96, w: 128, cancel: false, start: hasSave() ? 1 : 0 });
    const c = opts[r].k;
    if (c === 'lang') { setLang(LANG === 'en' ? 'zh' : 'en'); continue; }
    if (c === 'help') { await howToPlay(); continue; }
    if (c === 'cont') { if (load()) return 'cont'; await notice('讀取失敗。', 'Could not load.'); continue; }
    return 'new';
  }
}

// ---------- the loop ----------
function frame(show = true) {
  pollInput();
  if (input.pressed('a') || input.pressed('b')) initAudio();
  const steps = G.speed || 1;
  for (let i = 0; i < steps; i++) {
    uiTick();
    UI.update();
    if (i < steps - 1) endInput();
  }
  draw();
  endInput();
  if (show) present();
}
function draw() {
  if (scene === 'title') drawTitle();
  else if (scene === 'field') drawField(FIELD.objective, { moving: FIELD.moving, pick: UI.top && UI.top.isPick });
  else if (scene === 'stage') drawStage();
  else if (scene === 'battle') drawBattle();
  else { ctx.fillStyle = '#05040f'; ctx.fillRect(0, 0, W, H); }
  UI.draw();
  if (T.flash > 0) { ctx.globalAlpha = T.flash / 12; ctx.fillStyle = T.flashCol; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; T.flash--; }
  if (T.dark > 0) { ctx.globalAlpha = T.dark; ctx.fillStyle = '#05040f'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  if (ST.fx === 'lightrain' && scene === 'stage') for (let i = 0; i < 40; i++) { const k = (ST.t * 0.01 + hash(i, 1)) % 1; ctx.fillStyle = i % 3 ? '#a8f0ff' : '#ffe070'; ctx.fillRect(Math.floor(hash(i, 2) * W), Math.floor(k * 150), 1, 3); }
}
let last = 0, acc = 0;
function loop(ts) {
  if (!last) last = ts;
  acc += Math.min(100, ts - last); last = ts;
  let n = 0;
  // 60 ticks a second on any screen (120 Hz ProMotion, 30 Hz Low Power Mode); only the last one is shown
  while (acc >= 1000 / 60 && n < 4) { acc -= 1000 / 60; n++; }
  for (let i = 0; i < n; i++) frame(i === n - 1);
  requestAnimationFrame(loop);
}

// ---------- the game ----------
async function newGame() {
  reset();
  setBoard('c1');
  moveHand();
  await chapterCard('c1');
}
async function game() {
  for (;;) {
    try {
      const r = G.skipTitle ? G.skipTitle : await title();
      G.skipTitle = null;
      if (r === 'new') await newGame();
      else if (r === 'cont') { setBoard(S.chapter); moveHand(); playMusic(BOARDS[S.chapter].music); }
      await fade(0, 1);
      await playChapters();
      if (G.stopAt) { G.stopped = true; await push({ update() {}, draw() {} }); }
    } catch (e) {
      if (String(e.message) !== '__title__') { console.error(e); G.error = String(e.stack || e); }
      UI.clear(); T.dark = 0; view.shake = 0;
    }
  }
}

// ---------- test hooks ----------
const G = (window.G = {
  S, FIELD, UI, CINE, AUTO, STORY, R,
  get B() { return B; },
  get scene() { return scene; },
  speed: 1,
  newGame() { G.skipTitle = 'new'; UI.clear(); },
  setAuto(on) { UI.auto = on; CINE.fast = on; },
  // jump to a chapter (and step), building a fitting party
  go(ch, stepId = null, lv = null) {
    reset();
    const order = CHAPTERS.indexOf(ch);
    const joins = [['lin', 1], ['taro', 2], ['mira', 3], ['zed', 5]];
    const LV = { c1: 1, c2: 5, c3: 10, c4: 15, c5: 21, c6: 27, c7: 34 };
    S.party[0].lv = lv || LV[ch];
    for (const [id, c] of joins) if (order > c || (order === c && stepId && STORY[ch].steps.findIndex((s) => s.id === stepId) > STORY[ch].steps.findIndex((s) => s.id === ({ lin: 'c2_gate', taro: 'c3_taro', mira: 'c4_mira', zed: 'c5_throne' })[id]))) S.party.push(R.newHero(id, S.party[0].lv - 1));
    for (const m of S.party) m.hp = R.maxHp(m);
    for (const c of CHAPTERS.slice(0, order)) for (const s of STORY[c].steps) S.flags[s.id] = true;
    if (order >= 6) S.flags.golden = true;
    if (stepId) for (const s of STORY[ch].steps) { if (s.id === stepId) break; S.flags[s.id] = true; }
    S.items = { riceball: 3, broth: 3 };
    S.coins = 200;
    S.node = null; setBoard(ch); moveHand();
    G.skipTitle = 'cont'; UI.clear();
  },
  // show a beam clash or the awakening on their own (screenshots)
  demoClash() {
    scene = 'battle';
    const mk = (f) => ({ name: tn(R.def(f).name), art: f.foe ? fighterArt(ENEMIES[f.id].spr, 'l') : fighterArt({ k: 'c', n: HEROES[f.id].sheet }, 'r'), col: R.kiColor(f), gold: !!f.gold, hp: f.hp, hpMax: R.maxHp(f), hpBefore: f.hp });
    const k = R.newHero('kai', 30), v = R.newFoe('vorrak1');
    return beamClash(mk(k), mk(v), 1, 1, BOARDS.c6.sky);
  },
  // play one close-up with made-up numbers: G.demoExchange('kai', 'grimjaw', { t: 'sp', id: 'skyriver' }, { guarded: true })
  demoExchange(heroId, foeId, act, extra = {}, heroAttacks = true, gold = false) {
    scene = 'battle';
    const h = R.newHero(heroId, 30), f = R.newFoe(foeId);
    h.gold = gold;
    const mk = (x) => ({ name: tn(R.def(x).name), art: x.foe ? fighterArt(ENEMIES[x.id].spr, 'l') : fighterArt({ k: 'c', n: HEROES[x.id].sheet }, 'r'), col: R.kiColor(x), gold: !!x.gold, hp: x.hp, hpMax: R.maxHp(x), hpBefore: x.hp });
    const Lh = mk(h), Rf = mk(f);
    const rec = { act, dmg: 123, toAtt: 0, dodged: false, guarded: false, clash: null, heal: 0, buff: null, burn: 0, ...extra };
    (heroAttacks ? Rf : Lh).hp = Math.max(1, (heroAttacks ? Rf : Lh).hp - rec.dmg);
    return playExchange(rec, Lh, Rf, heroAttacks, BOARDS.c3.sky);
  },
  demoTown(id) { return town(id); },
  demoCredits() { return credits(true); },
  demoGolden() { return playGolden(fighterArt({ k: 'c', n: 'SamuraiBlue' }, 'r'), true); },
  async runBattle(ids, opts = {}) { scene = 'battle'; const r = await battle(ids, opts); scene = 'field'; return r; },
  save, load,
  setLang,
  stopAt: null,
  error: null,
});

await document.fonts.load('12px Cubic11').catch(() => {});
await loadImages([
  ...CHARS.map((n) => ['c:' + n, 'assets/chars/' + n + '.png']),
  ...MONS.map((n) => ['m:' + n, 'assets/mon/' + n + '.png']),
  ...BOSSES.map((n) => ['b:' + n, 'assets/boss/' + n + '.png']),
  ...FACES.map((n) => ['f:' + n, 'assets/face/' + n + '.png']),
  ...FXS.map((n) => ['x:' + n, 'assets/fx/' + n + '.png']),
  ...ICONS.map((n) => ['i:' + n, 'assets/items/' + n + '.png']),
]);
setupTouch();
setLang(LANG);
requestAnimationFrame(loop);
// iPhone and iPad close background tabs without warning: the game already saves at chapters and springs,
// so it also keeps the journey when the page is hidden while standing on the board
const keep = () => { if (scene === 'field' && !FIELD.moving && !G.stopAt) save(); };
addEventListener('pagehide', keep);
document.addEventListener('visibilitychange', () => { if (document.hidden) keep(); });
window.READY = true;
game();
void textW; void windowBox; void drawCard; void cursor; void canvas; void wrap; void jingle; void member; void ENEMIES; void AUTO;
