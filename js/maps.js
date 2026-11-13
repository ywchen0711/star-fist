// The region boards. Each is a star chart of nodes joined by paths; Kai moves along them by the
// star number of a movement card. Node kinds: . plain (wild encounters), f fight, t town,
// s spring (rest), c chest, e an event spot (the story places scenes on these).
function parse(src) {
  const nodes = {};
  for (const ln of src.trim().split('\n')) {
    const [id, x, y, k, extra] = ln.trim().split(/\s+/);
    nodes[id] = { id, x: +x, y: +y, k, extra: extra || null, links: [] };
  }
  return nodes;
}
function link(nodes, src) {
  for (const pair of src.trim().split(/\s+/)) {
    const [a, b] = pair.split('-');
    if (!nodes[a] || !nodes[b]) throw new Error('bad link ' + pair);
    nodes[a].links.push(b); nodes[b].links.push(a);
  }
}
function board(o) { o.nodes = parse(o.nodes); link(o.nodes, o.links); delete o.links; return o; }

export const BOARDS = {
  c1: board({
    name: ['松崖山', 'Pinecrag Mountain'], music: 'mountain', start: 'home',
    look: { base: '#1c3a32', alt: '#24463a', deco: 'pine', peaks: [[150, 18, 26], [196, 22, 20], [26, 160, 18]], river: null },
    sky: { sky: ['#140c38', '#5a2c6a', '#e8885a'], far: '#3a2650', near: '#243a34', ground: '#3a5a3a', planet: [204, 26, 9, '#d8c8f0'], accent: '#8ac080' },
    nodes: `
      home 40 40 s
      n1 66 34 .
      dojo 92 46 e
      n2 70 64 .
      n3 118 30 .
      cliff 148 40 e
      n4 100 76 f
      n5 130 66 .
      n6 172 64 c riceball:2
      n7 56 92 .
      n8 92 104 f
      vil 128 100 t
      n9 164 96 .
      n10 200 88 f
      n11 36 124 s
      n12 72 134 .
      n13 110 140 f
      n14 150 128 .
      n15 190 122 .
      crash 226 112 e
      n16 228 150 c broth:1
      n17 176 154 f`,
    links: 'home-n1 n1-dojo n1-n2 dojo-n3 n3-cliff dojo-n4 n2-n4 n2-n7 n4-n5 n5-cliff n5-n6 n6-n10 n4-n8 n7-n8 n8-vil vil-n5 vil-n9 n9-n10 n10-crash n7-n11 n11-n12 n12-n8 n12-n13 n13-vil n13-n14 n14-n9 n14-n15 n15-crash n15-n17 n17-n16 n16-crash',
    enc: [['bear'], ['viper'], ['owl'], ['viper', 'viper'], ['bear', 'owl']], rate: 0.22,
    towns: { vil: 'pinehollow' },
  }),
  c2: board({
    name: ['蘆河', 'Reed River'], music: 'river', start: 'a',
    look: { base: '#1a3a3a', alt: '#204840', deco: 'reed', river: [[256, 14], [200, 24], [150, 22], [120, 46], [90, 84], [60, 120], [30, 150], [0, 176]] },
    sky: { sky: ['#081830', '#1c4a6a', '#6ab0b0'], far: '#1a3a50', near: '#1a4038', ground: '#2a5040', planet: [40, 24, 7, '#f0f0d0'], accent: '#70c0a0' },
    nodes: `
      a 20 40 .
      b 48 30 .
      c 76 42 f
      rv 104 28 .
      gate 84 70 e
      vil 114 62 t
      d 52 64 .
      e 32 94 c kipill:1
      f 142 44 .
      g 172 34 f
      h 204 46 .
      i 234 62 c riceball:3
      j 142 84 .
      k 176 76 f
      l 70 104 f
      m 104 114 .
      n 138 120 s
      o 172 110 .
      drill 208 100 e
      p 60 142 .
      q 96 152 f
      r 134 154 .
      s 172 148 f
      boss 216 142 e`,
    links: 'a-b b-c c-rv rv-f c-gate d-gate a-d d-e gate-vil vil-j vil-f f-g g-h h-i h-k f-j j-k k-drill e-l l-m m-j m-n n-o o-drill o-k l-p p-q q-r r-n r-s s-boss drill-boss',
    enc: [['mole'], ['imp'], ['lizard', 'mole'], ['sporecap', 'imp'], ['trooper'], ['lizard', 'sporecap']], rate: 0.22,
    towns: { vil: 'reedvillage' },
  }),
  c3: board({
    name: ['巨石谷', 'Stonegiant Valley'], music: 'valley', start: 'a',
    look: { base: '#3a2a22', alt: '#4a3428', deco: 'rock', peaks: [[20, 30, 22], [240, 20, 24], [120, 168, 20]] },
    sky: { sky: ['#1a1020', '#5a3a30', '#d09050'], far: '#4a2e2a', near: '#3a2620', ground: '#6a4a34', planet: [60, 30, 12, '#e8a070'], ring: true, accent: '#c09060' },
    nodes: `
      a 24 150 .
      b 52 136 .
      c 40 110 f
      camp 80 120 t
      d 64 88 .
      e 100 92 f
      f 36 70 c broth:1
      g 72 58 .
      taro 108 50 e
      h 120 140 .
      i 152 128 f
      j 136 98 .
      k 168 88 s
      l 144 40 f
      m 180 30 .
      n 214 40 c kipill:2
      mine 198 70 e
      o 188 150 .
      p 220 146 f
      q 212 108 .
      forge 238 128 e`,
    links: 'a-b b-c b-camp c-d d-camp camp-e c-f f-g d-g g-taro taro-e e-j camp-h h-i i-j j-k k-mine taro-l l-m m-n n-mine mine-q k-q i-o o-p p-forge q-forge',
    enc: [['rockmole'], ['drake'], ['heavy'], ['watcher', 'rockmole'], ['drake', 'watcher'], ['heavy', 'rockmole']], rate: 0.24,
    towns: { camp: 'tradercamp' },
  }),
  c4: board({
    name: ['風鳴高原', 'Windsong Highlands'], music: 'highland', start: 'a',
    look: { base: '#22483a', alt: '#2c5a44', deco: 'grass', clouds: true },
    sky: { sky: ['#0c1840', '#3a6ab0', '#b0e0f0'], far: '#5a80a8', near: '#3a6a50', ground: '#4a8a5a', planet: [210, 30, 14, '#f8f0e0'], accent: '#a0e0a0', stars: 30 },
    nodes: `
      a 28 160 .
      b 56 146 .
      c 40 120 f
      d 84 128 .
      shrine 70 96 t
      e 36 80 c tea:1
      f 104 100 f
      mira 102 64 e
      g 130 126 .
      h 160 142 f
      i 136 88 .
      j 168 102 s
      k 66 48 .
      l 132 40 f
      m 166 56 .
      n 196 122 .
      o 200 84 f
      p 232 144 c elixir:1
      q 192 28 c broth:2
      beacon 228 52 e`,
    links: 'a-b b-c b-d c-shrine d-shrine shrine-e shrine-f d-g g-h f-i i-mira mira-k k-e mira-l l-m l-q q-beacon m-beacon i-j g-j h-n n-p n-o j-o o-beacon m-o',
    enc: [['moth'], ['drifteye'], ['spider', 'windbat'], ['lancer'], ['moth', 'drifteye'], ['windbat', 'windbat'], ['lancer', 'spider']], rate: 0.24,
    towns: { shrine: 'windshrine' },
  }),
  c5: board({
    name: ['隕坑要塞', 'Crater Fortress'], music: 'crater', start: 'a',
    look: { base: '#2a1418', alt: '#381a1c', deco: 'lava' },
    sky: { sky: ['#100408', '#4a1018', '#d04a24'], far: '#3a1414', near: '#2a1010', ground: '#3a2420', planet: [190, 34, 22, '#8a8aa8'], accent: '#ff7040', stars: 40 },
    nodes: `
      a 24 36 .
      b 52 48 .
      refuge 40 78 t
      c 82 32 f
      d 78 70 .
      e 110 52 f
      f 60 106 c starfruit:1
      g 100 98 .
      gate 138 80 e
      h 140 40 .
      i 172 30 f
      j 130 124 f
      k 90 142 s
      l 166 112 .
      zed 182 72 e
      m 206 40 c elixir:1
      n 200 132 f
      o 228 102 .
      throne 230 62 e
      p 160 152 .
      q 212 160 c tea:1`,
    links: 'a-b b-c b-refuge refuge-d d-e c-e c-h h-i i-m m-throne refuge-f f-g d-g g-gate e-gate gate-zed h-zed zed-throne g-j j-k k-f j-l l-zed l-n n-o o-throne j-p p-q q-n',
    enc: [['shadow'], ['gladiator'], ['brute', 'drone'], ['grub', 'grub'], ['drone', 'shadow'], ['gladiator', 'grub']], rate: 0.24,
    towns: { refuge: 'refuge' },
  }),
  c6: board({
    name: ['鐵彗星', 'The Iron Comet'], music: 'comet', start: 'dock',
    look: { base: '#1a1a30', alt: '#222240', deco: 'metal' },
    sky: { sky: ['#04020c', '#1a0c3a', '#4a2a7a'], far: '#2a2448', near: '#3a3a58', ground: '#40405a', planet: [60, 92, 30, '#4a8ad0'], accent: '#c070ff', stars: 110 },
    nodes: `
      dock 28 150 .
      b 60 150 .
      c 60 120 f
      d 92 132 .
      e 28 104 c starfruit:1
      f 92 100 .
      g 124 116 f
      h 60 76 .
      i 124 80 s
      j 156 98 .
      k 92 52 f
      l 156 60 f
      core 188 80 e
      m 124 36 .
      n 188 40 c elixir:2
      o 188 130 f
      p 220 110 .
      q 156 148 c kipill:3
      throne 226 40 e
      r 222 72 .`,
    links: 'dock-b b-c b-d c-e c-f d-f d-g f-h f-i g-i g-j h-k k-m i-l l-j j-core m-n n-throne l-core core-r r-throne j-o o-p p-r g-q q-o m-l',
    enc: [['royal'], ['berserker'], ['voiddrone', 'cometbeast'], ['corebeast'], ['royal', 'voiddrone'], ['berserker', 'cometbeast']], rate: 0.24,
    towns: {},
  }),
  c7: board({
    name: ['星拳大會', 'Star Fist Tournament'], music: 'tourney', start: 'a',
    look: { base: '#1e3a3a', alt: '#284a44', deco: 'reed', lanterns: true, river: [[256, 170], [180, 160], [120, 166], [60, 176]] },
    sky: { sky: ['#0a1030', '#2a3a7a', '#e8a060'], far: '#2a3060', near: '#2a4040', ground: '#6a5a40', planet: [200, 26, 8, '#f8f0d0'], accent: '#ffd070' },
    nodes: `
      a 40 140 .
      b 76 150 .
      hall 64 108 t
      ring1 112 122 e
      c 100 78 .
      f 60 60 c starfruit:1
      ring2 150 96 e
      d 142 54 s
      e 190 132 .
      ring3 192 84 e
      shrine 224 42 e`,
    links: 'a-b a-hall b-ring1 hall-ring1 hall-c c-f c-ring2 ring1-ring2 ring2-d d-ring3 ring2-e e-ring3 ring3-shrine d-shrine',
    enc: [], rate: 0,
    towns: { hall: 'festival' },
  }),
};
export const CHAPTERS = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7'];

// towns: shop stock and the people you can talk to
export const TOWNS = {
  pinehollow: { name: ['松窩村', 'Pine Hollow'], shop: ['riceball', 'kipill'], talk: 'pinehollow', bg: 'c1' },
  reedvillage: { name: ['蘆河村', 'Reed Village'], shop: ['riceball', 'broth', 'kipill'], talk: 'reedvillage', bg: 'c2' },
  tradercamp: { name: ['行商營地', "Traders' Camp"], shop: ['riceball', 'broth', 'kipill', 'tea'], talk: 'tradercamp', bg: 'c3' },
  windshrine: { name: ['風神社', 'Wind Shrine'], shop: ['broth', 'kipill', 'tea', 'elixir'], talk: 'windshrine', bg: 'c4' },
  refuge: { name: ['灰燼避難所', 'Ashfall Refuge'], shop: ['broth', 'kipill', 'tea', 'elixir'], talk: 'refuge', bg: 'c5' },
  festival: { name: ['祭典廣場', 'Festival Square'], shop: ['broth', 'kipill', 'tea', 'elixir', 'starfruit'], talk: 'festival', bg: 'c7' },
};
