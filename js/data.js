// Game data: the fighters, their special moves, the enemies, items and encounter groups.
// Pure data (no DOM), so the headless balance simulation can import it too.

// experience needed to go from level lv to lv+1
export const needExp = (lv) => Math.round(10 * Math.pow(lv, 1.5) + 10);
export const MAX_LV = 60;
// power level grows by the same factor every level
export const PL_GROWTH = 1.13;
// the Golden Flame multiplies Kai's power level
export const GOLD_MULT = 5;
export const GOLD_COST = 30, GOLD_DRAIN = 6;

// ---------- the party ----------
// sheet: the character sprite sheet; ki: the colour of their aura and blasts
export const HEROES = {
  kai: { name: ['凱', 'Kai'], sheet: 'SamuraiBlue', pl0: 420, hp0: 132, ki: '#58c8ff', ki2: '#e8f8ff',
    title: ['星裔少年', 'Starborn boy'],
    learn: [[1, 'meteor'], [4, 'starshot'], [12, 'skyriver'], [22, 'twinstar']] },
  lin: { name: ['琳', 'Lin'], sheet: 'Cavegirl2', pl0: 400, hp0: 124, ki: '#ffb040', ki2: '#fff0c0',
    title: ['蘆河的棍術家', 'staff fighter of Reed River'],
    learn: [[1, 'staffwhirl'], [9, 'moonsplit'], [14, 'bindstaff'], [24, 'heavenstaff']] },
  taro: { name: ['太郎', 'Taro'], sheet: 'Statue', pl0: 380, hp0: 176, ki: '#d0b080', ki2: '#fff0d8',
    title: ['石膚巨人', 'stone-skinned giant'],
    learn: [[1, 'avalanche'], [1, 'stoneskin'], [16, 'earthrend'], [26, 'mountainheart']] },
  mira: { name: ['米菈', 'Mira'], sheet: 'Woman', pl0: 410, hp0: 114, ki: '#70f0b8', ki2: '#e8fff0',
    title: ['風之舞者', 'wind dancer'],
    learn: [[1, 'windblade'], [1, 'galedance'], [19, 'skyspiral'], [23, 'breeze']] },
  zed: { name: ['傑德', 'Zed'], sheet: 'Vampire', pl0: 470, hp0: 140, ki: '#c070ff', ki2: '#f4e0ff',
    title: ['前軍團精英', 'former Legion elite'],
    learn: [[1, 'ironcannon'], [1, 'shadowstep'], [28, 'blackstar']] },
  // the old master only fights beside Kai for a while; his power level is fixed
  oroso: { name: ['奧羅索', 'Oroso'], sheet: 'Master', fixedPl: 3200, hp0: 160, ki: '#f8f0a0', ki2: '#ffffff', guest: true,
    title: ['山中隱士', 'hermit of the mountain'],
    learn: [[1, 'pinepalm'], [1, 'galewave']] },
};

// ---------- special moves ----------
// kind: melee (a close-up rush), beam (can be met with a counter-beam), buff, heal, drain (melee that burns the target's ki)
// pow: base damage (a plain rush is 24, a ki blast 32); ki: cost; nododge: cannot be dodged
export const SPECIALS = {
  meteor: { name: ['流星拳', 'Meteor Fist'], kind: 'melee', pow: 48, ki: 20, desc: ['燃起星火的連續重拳。', 'A flurry of star-fire punches.'] },
  starshot: { name: ['星火彈', 'Star-fire Shot'], kind: 'beam', pow: 58, ki: 28, desc: ['從掌心射出的星火光束。', 'A beam of star-fire from the palm.'] },
  skyriver: { name: ['天河破', 'Sky River Breaker'], kind: 'beam', pow: 86, ki: 45, desc: ['像銀河般奔流的巨大光束。', 'A huge beam that pours like the Milky Way.'] },
  twinstar: { name: ['雙星連擊', 'Twin Star Barrage'], kind: 'melee', pow: 78, ki: 38, nododge: true, desc: ['快到無法閃避的雙星連打。', 'Two-star strikes too fast to dodge.'] },
  goldmeteor: { name: ['金焰流星', 'Golden Meteor'], kind: 'beam', pow: 132, ki: 50, gold: true, desc: ['金焰覺醒時才能使出的終極一擊。', 'The final blow, only in the Golden Flame.'] },
  pinepalm: { name: ['古松掌', 'Old Pine Palm'], kind: 'melee', pow: 62, ki: 25, desc: ['老松般沉穩的一掌。', 'A palm strike as steady as an old pine.'] },
  galewave: { name: ['山嵐波', 'Mountain Gale Wave'], kind: 'beam', pow: 82, ki: 40, desc: ['山間的風化為氣浪。', 'The mountain wind turned into a wave of ki.'] },
  staffwhirl: { name: ['棍旋風', 'Staff Whirlwind'], kind: 'melee', pow: 46, ki: 18, desc: ['旋轉長棍的連打。', 'A spinning staff combo.'] },
  moonsplit: { name: ['碎月擊', 'Moon-Splitting Strike'], kind: 'melee', pow: 66, ki: 32, desc: ['從天而降的劈擊。', 'A strike that falls from the sky.'] },
  bindstaff: { name: ['縛龍棍', 'Dragon-Binding Staff'], kind: 'drain', pow: 40, ki: 22, burn: 35, desc: ['擊中後打散對手35點氣。', 'Hits and scatters 35 of the foe\'s ki.'] },
  heavenstaff: { name: ['擎天棍', 'Heaven-Pillar Staff'], kind: 'melee', pow: 94, ki: 48, desc: ['長棍化為擎天之柱。', 'The staff becomes a pillar holding up the sky.'] },
  avalanche: { name: ['山崩拳', 'Avalanche Fist'], kind: 'melee', pow: 55, ki: 24, desc: ['像山崩一樣的重拳。', 'A punch like a falling mountain.'] },
  stoneskin: { name: ['岩鎧', 'Stone Skin'], kind: 'buff', buff: 'stone', ki: 20, desc: ['三回合內受到的傷害減少四成。', 'Take 40% less damage for 3 rounds.'] },
  earthrend: { name: ['地裂震', 'Earth Rend'], kind: 'melee', pow: 80, ki: 38, nododge: true, desc: ['震裂大地，無法閃避。', 'Splits the ground; cannot be dodged.'] },
  mountainheart: { name: ['山心', 'Mountain Heart'], kind: 'heal', heal: 0.4, ki: 35, desc: ['回復自己四成體力。', 'Restores 40% of own HP.'] },
  windblade: { name: ['鳴風刃', 'Singing Wind Blade'], kind: 'beam', pow: 56, ki: 26, desc: ['會唱歌的風之刃。', 'A blade of wind that sings.'] },
  galedance: { name: ['疾風舞', 'Gale Dance'], kind: 'buff', buff: 'gale', ki: 25, desc: ['接下來兩次攻擊必定閃開。', 'Surely dodge the next two attacks.'] },
  skyspiral: { name: ['天翔旋', 'Skyward Spiral'], kind: 'melee', pow: 82, ki: 40, desc: ['乘風旋轉升空的連踢。', 'A spinning flight of kicks.'] },
  breeze: { name: ['癒風', 'Healing Breeze'], kind: 'heal', heal: 0.35, ki: 30, desc: ['回復自己三成半體力。', 'Restores 35% of own HP.'] },
  ironcannon: { name: ['鐵彗砲', 'Iron Comet Cannon'], kind: 'beam', pow: 70, ki: 34, desc: ['軍團精英的光砲。', 'The cannon of a Legion elite.'] },
  shadowstep: { name: ['影步斬', 'Shadow Step'], kind: 'melee', pow: 62, ki: 28, nododge: true, desc: ['從影子裡出手，無法閃避。', 'Strikes from the shadows; cannot be dodged.'] },
  blackstar: { name: ['黑星爆', 'Black Star Burst'], kind: 'beam', pow: 102, ki: 50, desc: ['壓縮成黑星的氣彈。', 'Ki crushed into a black star.'] },
  // enemy moves
  claw: { name: ['裂爪', 'Rending Claw'], kind: 'melee', pow: 40, ki: 20 },
  venom: { name: ['毒牙', 'Venom Fang'], kind: 'drain', pow: 30, ki: 18, burn: 20 },
  legionshot: { name: ['軍團光彈', 'Legion Shot'], kind: 'beam', pow: 50, ki: 24 },
  bonescythe: { name: ['骨鐮', 'Bone Scythe'], kind: 'melee', pow: 60, ki: 28 },
  crush: { name: ['碎顎鉗', 'Jaw Crusher'], kind: 'melee', pow: 70, ki: 30 },
  cyclone: { name: ['黑旋風', 'Black Cyclone'], kind: 'beam', pow: 64, ki: 30 },
  thunderfeather: { name: ['雷羽', 'Thunder Feather'], kind: 'beam', pow: 72, ki: 32 },
  eyebeam: { name: ['魔眼砲', 'Evil Eye Cannon'], kind: 'beam', pow: 86, ki: 40 },
  cometfist: { name: ['彗星拳', 'Comet Fist'], kind: 'melee', pow: 80, ki: 35 },
  voidnova: { name: ['虛空新星', 'Void Nova'], kind: 'beam', pow: 118, ki: 50 },
  tyrant: { name: ['暴君之怒', "Tyrant's Wrath"], kind: 'melee', pow: 100, ki: 45, nododge: true },
};
export const RUSH_POW = 24, BLAST_POW = 32, BLAST_KI = 15, COUNTER_KI = 20;

// ---------- enemies ----------
// spr: k = c (a character sheet), m (a monster sheet), b (a boss idle strip, frame width fw)
// hue: rotate the colours (a recoloured sprite reads as a new creature)
// hp: toughness; the real max HP grows with the enemy's power level, like a hero's grows with level
const e = (o) => o;
export const ENEMIES = {
  // chapter 1: Pinecrag Mountain
  bear: e({ name: ['岩熊', 'Crag Bear'], spr: { k: 'm', n: 'Bear' }, pl: 230, hp: 62, sp: ['claw'], exp: 17, coin: 6 }),
  viper: e({ name: ['青鱗蛇', 'Jade Viper'], spr: { k: 'm', n: 'Snake' }, pl: 170, hp: 46, sp: ['venom'], exp: 13, coin: 4 }),
  owl: e({ name: ['夜梟', 'Night Owl'], spr: { k: 'm', n: 'Owl' }, pl: 200, hp: 52, sp: [], exp: 15, coin: 5 }),
  spar: e({ name: ['奧羅索（留手）', 'Oroso (holding back)'], spr: { k: 'c', n: 'Master' }, pl: 360, hp: 70, sp: [], exp: 24, coin: 0, aura: '#f8f0a0' }),
  brakk: e({ name: ['偵察兵布拉克', 'Scout Brakk'], spr: { k: 'c', n: 'RobotGrey' }, pl: 820, hp: 120, sp: ['legionshot'], exp: 90, coin: 40, boss: true, aura: '#ff5050' }),
  // chapter 2: Reed River
  mole: e({ name: ['泥鼴', 'Mud Mole'], spr: { k: 'm', n: 'Mole' }, pl: 560, hp: 58, sp: ['claw'], exp: 60, coin: 9 }),
  imp: e({ name: ['河童', 'River Imp'], spr: { k: 'm', n: 'KappaGreen' }, pl: 640, hp: 62, sp: ['venom'], exp: 66, coin: 10 }),
  lizard: e({ name: ['沼蜥', 'Marsh Lizard'], spr: { k: 'm', n: 'Lizard' }, pl: 700, hp: 66, sp: ['claw'], exp: 70, coin: 11 }),
  sporecap: e({ name: ['孢子菇', 'Spore Cap'], spr: { k: 'm', n: 'Mushroom' }, pl: 600, hp: 54, sp: ['venom'], exp: 62, coin: 10 }),
  trooper: e({ name: ['鐵兵', 'Iron Trooper'], spr: { k: 'c', n: 'RobotGreen' }, pl: 850, hp: 70, sp: ['legionshot'], exp: 78, coin: 16, aura: '#ff6060' }),
  sallow: e({ name: ['骸骨隊長薩羅', 'Captain Sallow'], spr: { k: 'c', n: 'Skeleton' }, pl: 2300, hp: 190, sp: ['bonescythe', 'legionshot'], exp: 300, coin: 120, boss: true, aura: '#b0ffb0' }),
  // chapter 3: Stonegiant Valley
  rockmole: e({ name: ['岩鼴', 'Rock Mole'], spr: { k: 'm', n: 'Mole2' }, pl: 1500, hp: 62, sp: ['claw'], exp: 125, coin: 16 }),
  drake: e({ name: ['崖龍', 'Crag Drake'], spr: { k: 'm', n: 'Reptile' }, pl: 1850, hp: 70, sp: ['claw'], exp: 140, coin: 18 }),
  heavy: e({ name: ['重裝兵', 'Heavy Trooper'], spr: { k: 'c', n: 'RobotCamouflage' }, pl: 2100, hp: 74, sp: ['legionshot'], exp: 150, coin: 24, aura: '#ff6060' }),
  watcher: e({ name: ['獨眼監視者', 'Legion Watcher'], spr: { k: 'm', n: 'Cyclope' }, pl: 1950, hp: 64, sp: ['legionshot'], exp: 135, coin: 20 }),
  grimjaw: e({ name: ['碎顎隊長格林', 'Captain Grimjaw'], spr: { k: 'b', n: 'GiantRedSamurai', fw: 96, ss: 1.5, cs: 2 }, pl: 5800, hp: 220, sp: ['crush', 'legionshot'], exp: 550, coin: 200, boss: true, aura: '#ff7040' }),
  // chapter 4: Windsong Highlands
  moth: e({ name: ['颶風蛾', 'Gale Moth'], spr: { k: 'm', n: 'Butterfly' }, pl: 3100, hp: 62, sp: ['cyclone'], exp: 200, coin: 26 }),
  drifteye: e({ name: ['浮游眼', 'Drifting Eye'], spr: { k: 'm', n: 'Eye2' }, pl: 3500, hp: 66, sp: ['legionshot'], exp: 215, coin: 28 }),
  spider: e({ name: ['赤蛛', 'Red Spider'], spr: { k: 'm', n: 'SpiderRed' }, pl: 3300, hp: 66, sp: ['venom'], exp: 210, coin: 27 }),
  windbat: e({ name: ['風蝠', 'Wind Bat'], spr: { k: 'm', n: 'BlueBat' }, pl: 3000, hp: 58, sp: ['claw'], exp: 195, coin: 25 }),
  lancer: e({ name: ['軍團槍兵', 'Legion Lancer'], spr: { k: 'c', n: 'Knight' }, pl: 4300, hp: 76, sp: ['claw', 'legionshot'], exp: 240, coin: 36, aura: '#ff6060' }),
  hex: e({ name: ['赫克絲', 'Hex'], spr: { k: 'b', n: 'TenguRed', fw: 82, ss: 1.25, cs: 2 }, pl: 11000, hp: 170, sp: ['thunderfeather', 'cyclone'], exp: 700, coin: 260, boss: true, aura: '#ff5070' }),
  vex: e({ name: ['維克絲', 'Vex'], spr: { k: 'b', n: 'TenguBlue', fw: 68, ss: 1.5, cs: 2 }, pl: 10200, hp: 160, sp: ['cyclone', 'claw'], exp: 650, coin: 240, boss: true, aura: '#60a0ff' }),
  // chapter 5: Crater Fortress
  shadow: e({ name: ['影衛', 'Shadow Guard'], spr: { k: 'c', n: 'NinjaMasked' }, pl: 8200, hp: 70, sp: ['shadowstep'], exp: 310, coin: 44, aura: '#a060ff' }),
  gladiator: e({ name: ['軍團角鬥士', 'Legion Gladiator'], spr: { k: 'c', n: 'GladiatorBlue' }, pl: 9200, hp: 78, sp: ['crush'], exp: 340, coin: 48, aura: '#ff6060' }),
  brute: e({ name: ['軍團蠻兵', 'Legion Brute'], spr: { k: 'c', n: 'DemonGreen' }, pl: 8700, hp: 80, sp: ['claw', 'legionshot'], exp: 330, coin: 46, aura: '#ff6060' }),
  drone: e({ name: ['骷髏無人機', 'Skull Drone'], spr: { k: 'm', n: 'Skull' }, pl: 7600, hp: 64, sp: ['legionshot'], exp: 300, coin: 42 }),
  grub: e({ name: ['隕蟲', 'Crater Grub'], spr: { k: 'm', n: 'Larva2' }, pl: 7200, hp: 66, sp: ['venom'], exp: 290, coin: 40 }),
  zedfoe: e({ name: ['傑德', 'Zed'], spr: { k: 'c', n: 'Vampire' }, pl: 26000, hp: 260, sp: ['ironcannon', 'shadowstep'], exp: 1000, coin: 0, boss: true, aura: '#c070ff' }),
  mordax: e({ name: ['摩達克斯將軍', 'General Mordax'], spr: { k: 'b', n: 'DemonCyclop', fw: 50, ss: 1.5, cs: 2.5 }, pl: 34000, hp: 300, sp: ['eyebeam', 'cometfist'], exp: 1400, coin: 400, boss: true, aura: '#ff4040' }),
  // chapter 6: the Iron Comet
  royal: e({ name: ['皇家近衛', 'Royal Guard'], spr: { k: 'c', n: 'KnightGold' }, pl: 18500, hp: 76, sp: ['cometfist'], exp: 420, coin: 70, aura: '#ffd040' }),
  berserker: e({ name: ['軍團狂戰士', 'Legion Berserker'], spr: { k: 'c', n: 'DemonRed' }, pl: 17500, hp: 80, sp: ['cometfist', 'claw'], exp: 410, coin: 66, aura: '#ff4040' }),
  voiddrone: e({ name: ['虛空無人機', 'Void Drone'], spr: { k: 'm', n: 'SkullBlue' }, pl: 16500, hp: 66, sp: ['legionshot'], exp: 380, coin: 62 }),
  cometbeast: e({ name: ['彗星獸', 'Comet Beast'], spr: { k: 'm', n: 'Beast2' }, pl: 19500, hp: 82, sp: ['claw'], exp: 430, coin: 72 }),
  corebeast: e({ name: ['熔核獸', 'Core Beast'], spr: { k: 'm', n: 'Beast' }, pl: 20500, hp: 84, sp: ['claw', 'eyebeam'], exp: 450, coin: 76 }),
  vorrak1: e({ name: ['沃拉克大帝', 'Emperor Vorrak'], spr: { k: 'c', n: 'SkeletonDemon' }, pl: 80000, hp: 380, sp: ['voidnova', 'tyrant'], exp: 1800, coin: 0, boss: true, aura: '#b040ff' }),
  vorrak2: e({ name: ['沃拉克・真身', 'Vorrak, True Form'], spr: { k: 'b', n: 'DemonCyclop2', fw: 50, ss: 1.5, cs: 2.5, hue: 200 }, pl: 200000, hp: 280, sp: ['voidnova', 'tyrant', 'eyebeam'], exp: 4000, coin: 0, boss: true, aura: '#c040ff' }),
  // after the story: the Star Fist Tournament
  boxer: e({ name: ['赤猿拳王', 'Red Ape Boxer'], spr: { k: 'c', n: 'MonkeyBoxerRed' }, pl: 140000, hp: 260, sp: ['cometfist'], exp: 1200, coin: 300, boss: true, aura: '#ff8040' }),
  ronin: e({ name: ['浪人疾風', 'Ronin Gale'], spr: { k: 'c', n: 'Samurai' }, pl: 220000, hp: 280, sp: ['shadowstep', 'cyclone'], exp: 1800, coin: 400, boss: true, aura: '#80e0ff' }),
  tanuki: e({ name: ['金狸大力士', 'Golden Tanuki'], spr: { k: 'b', n: 'GiantRacoonGold', fw: 60, ss: 1.25, cs: 2 }, pl: 320000, hp: 300, sp: ['crush', 'tyrant'], exp: 2600, coin: 600, boss: true, aura: '#ffd040' }),
  spirit: e({ name: ['奧羅索之魂', "Oroso's Spirit"], spr: { k: 'c', n: 'Master', ghost: true }, pl: 500000, hp: 340, sp: ['pinepalm', 'galewave'], exp: 5000, coin: 0, boss: true, aura: '#a0e8ff' }),
};

// ---------- items ----------
// icon: a picture from the pack, or 'starfruit' (drawn in code); hp: the share of max HP restored
export const ITEMS = {
  riceball: { name: ['飯糰', 'Rice Ball'], icon: 'Onigiri', hp: 0.3, price: 12, desc: ['回復三成體力。', 'Restores 30% HP.'] },
  broth: { name: ['藥草湯', 'Herb Broth'], icon: 'LifePot', hp: 0.6, price: 45, desc: ['回復六成體力。', 'Restores 60% HP.'] },
  elixir: { name: ['靈泉水', 'Spring Elixir'], icon: 'MilkPot', hp: 1, price: 160, desc: ['體力全滿。', 'Restores all HP.'] },
  kipill: { name: ['氣丹', 'Ki Pill'], icon: 'Nut', ki: 50, price: 30, desc: ['回復50點氣。', 'Restores 50 ki.'] },
  starfruit: { name: ['星果', 'Star Fruit'], icon: 'starfruit', hp: 1, ki: 100, price: 400, desc: ['星裔傳說的果實，體力與氣全滿。', 'The Starborn fruit: full HP and ki.'] },
  tea: { name: ['醒神茶', 'Waking Tea'], icon: 'TeaLeaf', revive: 0.5, price: 90, desc: ['讓倒下的同伴以一半體力復活。', 'Revives a fallen ally with half HP.'] },
};

// ---------- people who talk ----------
export const PEOPLE = {
  kai: { name: ['凱', 'Kai'], face: 'SamuraiBlue' },
  oroso: { name: ['奧羅索', 'Oroso'], face: 'Master' },
  lin: { name: ['琳', 'Lin'], face: 'Cavegirl2' },
  taro: { name: ['太郎', 'Taro'], face: 'Statue' },
  mira: { name: ['米菈', 'Mira'], face: 'Woman' },
  zed: { name: ['傑德', 'Zed'], face: 'Vampire' },
  vorrak: { name: ['沃拉克', 'Vorrak'], face: 'SkeletonDemon' },
  brakk: { name: ['布拉克', 'Brakk'], face: 'RobotGrey' },
  sallow: { name: ['薩羅', 'Sallow'], face: 'Skeleton' },
  grimjaw: { name: ['格林', 'Grimjaw'], face: 'GiantRedSamurai' },
  hex: { name: ['赫克絲', 'Hex'], face: 'TenguRed' },
  vex: { name: ['維克絲', 'Vex'], face: 'TenguBlue' },
  mordax: { name: ['摩達克斯', 'Mordax'], face: 'DemonCyclop' },
  elder: { name: ['村長', 'Village Head'], face: 'OldMan2' },
  boy: { name: ['村裡的孩子', 'Village Child'], face: 'Villager3' },
  fisher: { name: ['漁夫', 'Fisherman'], face: 'Villager' },
  woman: { name: ['村婦', 'Villager'], face: 'Villager5' },
  stoneelder: { name: ['石族長老', 'Stone Elder'], face: 'GoldStatue' },
  monk: { name: ['風神社的僧人', 'Wind Shrine Monk'], face: 'Monk' },
  trader: { name: ['行商', 'Trader'], face: 'Noble' },
  hunter: { name: ['獵人', 'Hunter'], face: 'Hunter' },
  scout: { name: ['巡山人', 'Ranger'], face: 'NinjaLeaf' },
  announcer: { name: ['大會司儀', 'Announcer'], face: 'Inspector' },
  shopkeep: { name: ['雜貨店', 'Store'], face: 'Villager2' },
  boxer: { name: ['赤猿拳王', 'Red Ape Boxer'], face: 'MonkeyBoxerRed' },
  ronin: { name: ['浪人疾風', 'Ronin Gale'], face: 'Samurai' },
  tanuki: { name: ['金狸大力士', 'Golden Tanuki'], face: 'GiantRacoonGold' },
  rebel: { name: ['軍團逃兵', 'Legion Deserter'], face: 'RobotGreen' },
  soldier: { name: ['軍團士兵', 'Legion Soldier'], face: 'RobotGreen' },
  narr: { name: null, face: null },
};
