// The story: six chapters and an epilogue tournament. Each chapter is a list of steps; a step
// waits on an event spot of the board (or runs at once when `at` is null). E is the toolbox
// main.js hands to every scene.
export const STORY = {
  c1: {
    title: ['第一章　松崖山的隱士', 'Chapter 1: The Hermit of Pinecrag'],
    steps: [
      { id: 'c1_intro', at: null, obj: ['到修練場找師父。', 'Meet the master at the training ground.'], async run(E) {
        E.stage('c1', [{ id: 'kai', n: 'SamuraiBlue', x: 96, f: 'r' }, { id: 'oroso', n: 'Master', x: 160, f: 'l' }]);
        E.music('home');
        await E.say(null, '遙遠的東方有一座松崖山。山頂的小屋裡，住著一位老隱士和他唯一的徒弟。', 'Far to the east stands Pinecrag Mountain. In a hut at its top live an old hermit and his only student.');
        await E.say('oroso', '凱，再一百下。拳要像松根一樣，往下扎。', 'Kai, a hundred more. Your fist must sink like the root of a pine.');
        await E.say('kai', '師父，我已經打了一千下了……', "Master, I've already done a thousand...");
        await E.say('oroso', '那就是一千一百下。', 'Then this makes one thousand one hundred.');
        await E.say('kai', '……是！', '...Yes, Master!');
        E.glow('kai', '#58c8ff', 60);
        await E.say(null, '少年的拳頭上，亮起了淡藍色的光。那是星裔一族才有的「星火」。', 'A pale blue light flickers over the boy\'s fist: star-fire, the gift of the Starborn clan.');
        await E.say('oroso', '（這孩子的星火，一天比一天亮了。）', '(The boy\'s star-fire burns brighter every day.)');
        await E.say('oroso', '早課結束。到修練場來，今天讓你試試真正的對打。', 'Morning drills are over. Come to the training ground; today you try a real bout.');
        E.unstage();
        await E.say(null, '【棋盤移動】按Z從手上選一張移動牌，牌上的星數就是能走的步數。用方向鍵沿著路線走，按Z可以提早停下。閃爍的黃星是下一個目的地。', '[Board] Press Z to pick a movement card; its star number is how far you can walk. Follow the paths with the arrows; Z stops early. The blinking gold star is where to go next.');
      } },
      { id: 'c1_spar', at: 'dojo', obj: ['到修練場找師父。', 'Meet the master at the training ground.'], async run(E) {
        E.stage('c1', [{ id: 'kai', n: 'SamuraiBlue', x: 96, f: 'r' }, { id: 'oroso', n: 'Master', x: 160, f: 'l' }]);
        await E.say('oroso', '來吧。我只用一成力氣。', 'Come. I will use one tenth of my strength.');
        await E.say('oroso', '武者交手，看的是先機與破綻。每回合各出一張牌：牌上的星星多，就先出手。', 'A bout is about timing and openings. Each round we both play a card: more stars strikes first.');
        await E.say('oroso', '牌中間的數字是威力，也是閃避。我攻你守時，你的數字不比我小，就能閃開。', 'The big number is power, and also your dodge. When I attack, if your number is not smaller than mine, you can slip away.');
        await E.say('oroso', '沒把握就防禦，傷害減半。攻擊的時候，拳腳連打不費力，還能聚氣。', 'Unsure? Guard and take half. When you attack, a rush costs nothing and gathers ki.');
        E.unstage();
        await E.battle(['spar'], { noFlee: true, canLose: true, music: 'battle' });
        E.stage('c1', [{ id: 'kai', n: 'SamuraiBlue', x: 96, f: 'r' }, { id: 'oroso', n: 'Master', x: 160, f: 'l' }]);
        await E.say('oroso', '呵呵，不錯。記住：星多先動，數字大才閃得開。氣滿的時候，就用必殺技。', 'Ho ho, not bad. Remember: more stars moves first; a big number dodges. When your ki is full, use a special.');
        await E.say('oroso', '去崖上的瞭望臺吧，晚上的星星很美。', 'Go up to the lookout on the cliff. The stars are lovely at night.');
        E.unstage();
      } },
      { id: 'c1_cliff', at: 'cliff', obj: ['到瞭望臺看星星。', 'Watch the stars from the lookout.'], async run(E) {
        E.stage('c1n', [{ id: 'kai', n: 'SamuraiBlue', x: 110, f: 'r' }], { fx: 'meteors' });
        E.music('reveal');
        await E.say('kai', '流星！一、二、三……三顆！', 'Shooting stars! One, two, three... three of them!');
        await E.wait(40);
        await E.say('kai', '……不對。流星不會轉彎。', '...Wait. Shooting stars don\'t turn.');
        E.addActor({ id: 'oroso', n: 'Master', x: 40, f: 'r' });
        await E.say('oroso', '那是紅色的光……和十二年前一樣。', 'That red light... just like twelve years ago.');
        await E.say('kai', '十二年前？', 'Twelve years ago?');
        await E.say('oroso', '……先別問。光落在東邊的松林。你去山下的松窩村打聽，再到東邊看看。不要逞強。', '...Not now. It fell in the eastern pines. Ask in Pine Hollow village below, then look to the east. Don\'t be reckless.');
        E.unstage();
        E.music('mountain');
      } },
      { id: 'c1_village', at: 'vil', obj: ['到松窩村打聽消息。', 'Ask around in Pine Hollow.'], async run(E) {
        E.stage('c1', [{ id: 'kai', n: 'SamuraiBlue', x: 80, f: 'r' }, { id: 'hunter', n: 'Hunter', x: 150, f: 'l' }, { id: 'boy', n: 'Villager3', x: 180, f: 'l' }]);
        E.music('village');
        await E.say('hunter', '凱！你也看到昨晚的紅光了吧？落在東邊的老火山口附近。', 'Kai! You saw the red light last night? It came down near the old crater in the east.');
        await E.say('hunter', '今天早上，林子裡的熊和蛇全都往這邊逃。我打獵三十年，沒見過這種事。', 'This morning every bear and snake in the woods was running this way. Thirty years a hunter, never seen the like.');
        await E.say('boy', '凱哥哥，是星星掉下來了嗎？可以撿嗎？', 'Kai, did a star fall down? Can we keep it?');
        await E.say('kai', '我去看看。你們待在村子裡。', "I'll go see. You stay in the village.");
        await E.say('hunter', '帶上這些飯糰。別讓你師父擔心。', "Take these rice balls. Don't make your master worry.");
        E.give('riceball', 2);
        E.unstage();
        E.music('mountain');
      } },
      { id: 'c1_crash', at: 'crash', obj: ['調查東邊的墜落地點。', 'Investigate the crash site to the east.'], async run(E) {
        E.stage('c1', [{ id: 'kai', n: 'SamuraiBlue', x: 70, f: 'r' }, { id: 'brakk', n: 'RobotGrey', x: 180, f: 'l' }], { fx: 'crater' });
        E.music('reveal');
        await E.say('brakk', '目標星球，生命能量充沛……嗯？有原住民。戰鬥力……' + '%PL%' + '？哈！垃圾。', 'Target world, rich in life energy... Hm? A native. Power level... %PL%? Ha! Trash.');
        await E.say('kai', '你是誰？為什麼從天上掉下來？', 'Who are you? Why did you fall from the sky?');
        await E.say('brakk', '鐵彗軍團偵察兵，布拉克。小子，你們這顆星球，已經被沃拉克大帝選中了。', 'Brakk, scout of the Iron Comet Legion. Boy, this world has been chosen by Emperor Vorrak.');
        await E.say('brakk', '我們會抽乾這裡所有的生命能量，裝進鐵彗星。草會枯，河會乾，你們會變成灰。', 'We\'ll drain every drop of life from it into the Iron Comet. The grass will wither, the rivers dry up, and you\'ll all turn to ash.');
        await E.say('kai', '我不會讓你這麼做！', "I won't let you!");
        E.unstage();
        await E.battle(['brakk'], { boss: true });
        E.stage('c1', [{ id: 'kai', n: 'SamuraiBlue', x: 90, f: 'r' }, { id: 'brakk', n: 'RobotGrey', x: 170, f: 'l', down: true }], { fx: 'crater' });
        await E.say('brakk', '不、不可能……打著打著，你的戰鬥力還在往上升……你是……星裔？！', 'Im-impossible... your power kept climbing as we fought... you\'re... Starborn?!');
        await E.say('brakk', '大帝……星裔……還活著……', 'Emperor... a Starborn... still lives...');
        E.flash('#ff6060'); E.sfx('boom');
        E.removeActor('brakk');
        await E.say(null, '布拉克的盔甲發出一聲尖響，化成了灰。', 'Brakk\'s armour gives a shrill whine, and crumbles into ash.');
        E.addActor({ id: 'oroso', n: 'Master', x: 30, f: 'r' });
        await E.say('oroso', '凱！……你一個人打倒他了？', 'Kai! ...You beat him on your own?');
        E.unstage();
        E.stage('c1n', [{ id: 'kai', n: 'SamuraiBlue', x: 100, f: 'r' }, { id: 'oroso', n: 'Master', x: 156, f: 'l' }], { fx: 'fire' });
        E.music('sad');
        await E.say('oroso', '十二年前，也有一個軍團的偵察兵來到這座山。', 'Twelve years ago, a Legion scout came to this mountain too.');
        await E.say('oroso', '擋下他的，是你的父母。星裔最後的兩位武者。他們贏了……卻沒能回來。', 'Your parents stopped him: the last two warriors of the Starborn. They won... but they never came home.');
        await E.say('kai', '……師父一直知道。', '...You always knew.');
        await E.say('oroso', '傳說星裔的祖先，是被墜落的星星選中的人。星火在你的血裡流著。我只是不希望你這麼早知道。', 'They say the first Starborn were people chosen by a falling star. Star-fire runs in your blood. I only wished you could learn it later.');
        await E.say('oroso', '布拉克說的收割，會從南方開始。聽說蘆河的水一天比一天少。', 'The harvest he spoke of will begin in the south. They say Reed River is shrinking day by day.');
        await E.say('oroso', '去吧，凱。去找同伴。一個人的星火，照不亮整片夜空。', 'Go, Kai. Find companions. One star-fire cannot light the whole night sky.');
        await E.say('kai', '師父不一起來嗎？', "Won't you come with me?");
        await E.say('oroso', '老人有老人的事。山，也得有人守。', 'An old man has his own work. Someone must guard the mountain.');
        E.unstage();
        await E.nextChapter('c2');
      } },
    ],
  },
  c2: {
    title: ['第二章　乾涸的蘆河', 'Chapter 2: The Thirsting River'],
    steps: [
      { id: 'c2_intro', at: null, obj: ['前往蘆河村。', 'Head for Reed Village.'], async run(E) {
        await E.say(null, '凱一路往南。蘆葦長得比人高，可是河水卻淺得露出了河床。', 'Kai travels south. The reeds grow taller than a man, but the river runs so low its bed shows through.');
        await E.say('kai', '魚都翻肚了……這就是「收割」嗎？', 'The fish are floating belly-up... Is this the "harvest"?');
      } },
      { id: 'c2_gate', at: 'gate', obj: ['前往蘆河村。', 'Head for Reed Village.'], async run(E) {
        E.stage('c2', [{ id: 'kai', n: 'SamuraiBlue', x: 40, f: 'r' }, { id: 'lin', n: 'Cavegirl2', x: 120, f: 'r' }, { id: 'tr', n: 'RobotGreen', x: 190, f: 'l' }]);
        await E.say('lin', '滾出我們的村子！水缸也要搬走，你們是強盜嗎？', "Get out of our village! Taking even our water jars? Are you bandits?");
        await E.say('soldier', '原住民，讓開。所有水源都歸鐵彗軍團。', 'Step aside, native. All water belongs to the Iron Comet Legion.');
        await E.say('kai', '我來幫你！', "I'll help you!");
        await E.say('lin', '誰要你幫——算了，左邊那個交給你！', "Who asked for— fine, the one on the left is yours!");
        E.unstage();
        E.join('lin');
        await E.battle(['trooper', 'trooper'], { noFlee: true });
        E.stage('c2', [{ id: 'kai', n: 'SamuraiBlue', x: 96, f: 'r' }, { id: 'lin', n: 'Cavegirl2', x: 150, f: 'l' }]);
        await E.say('lin', '……我一個人也能贏。', '...I could have won alone.');
        await E.say('kai', '我知道。可是兩個人比較快。', 'I know. But two is faster.');
        await E.say('lin', '哼。我叫琳。你呢？', 'Hmph. I\'m Lin. And you?');
        await E.say('kai', '凱，從松崖山來的。', 'Kai, from Pinecrag Mountain.');
        await E.say('lin', '上游來了一座會吸水的鐵塔，河一天比一天乾。村長說要等，等什麼？等河乾掉嗎？', 'An iron tower came upriver and drinks the water. The river gets lower every day. The village head says wait. Wait for what? For it to run dry?');
        await E.say('lin', '你要去打那座塔，對吧？我跟你去。我的棍子早就想敲爛它了。', "You're going after that tower, right? I'm coming. My staff's been itching to smash it.");
        await E.say(null, '琳成為了同伴！戰鬥開始時可以選誰出戰，戰鬥中也能換人。', 'Lin joins the party! You can choose who fights at the start of a battle, and switch during it.');
        E.unstage();
      } },
      { id: 'c2_village', at: 'vil', obj: ['到蘆河村見村長。', 'See the head of Reed Village.'], async run(E) {
        E.stage('c2', [{ id: 'kai', n: 'SamuraiBlue', x: 70, f: 'r' }, { id: 'lin', n: 'Cavegirl2', x: 96, f: 'r' }, { id: 'elder', n: 'OldMan2', x: 170, f: 'l' }]);
        E.music('village');
        await E.say('elder', '琳，又闖禍了……哦，這位是？', 'Lin, in trouble again... oh, and who is this?');
        await E.say('lin', '爺爺，他叫凱。我們要去把那座吸水塔拆了。', "Grandpa, this is Kai. We're going to tear down that water tower.");
        await E.say('elder', '……攔也攔不住你。塔在東邊的河灣。下游停著一艘鐵船，指揮的是個骷髏一樣的隊長。', "...As if I could stop you. The tower is at the eastern bend. Downstream sits an iron barge, commanded by a captain like a walking skeleton.");
        await E.say('elder', '帶上藥草湯。活著回來。', 'Take some herb broth. Come back alive.');
        E.give('broth', 2);
        E.unstage();
        E.music('river');
      } },
      { id: 'c2_drill', at: 'drill', obj: ['摧毀東邊河灣的吸水塔。', 'Destroy the water tower at the eastern bend.'], async run(E) {
        E.stage('c2', [{ id: 'kai', n: 'SamuraiBlue', x: 50, f: 'r' }, { id: 'lin', n: 'Cavegirl2', x: 76, f: 'r' }, { id: 't1', n: 'RobotGreen', x: 170, f: 'l' }, { id: 't2', n: 'RobotGreen', x: 196, f: 'l' }], { fx: 'drill' });
        await E.say('lin', '就是那個！整條河都被它吸進去了。', "That's it! It's drinking the whole river.");
        await E.say('soldier', '入侵者！保護收割塔！', 'Intruders! Protect the harvester!');
        E.unstage();
        await E.battle(['trooper', 'imp', 'trooper'], { noFlee: true });
        E.stage('c2', [{ id: 'kai', n: 'SamuraiBlue', x: 90, f: 'r' }, { id: 'lin', n: 'Cavegirl2', x: 120, f: 'r' }], { fx: 'drill' });
        E.sfx('boom'); E.shake(20);
        await E.say('lin', '幫浦壞了！……咦，塔還在動？', 'The pump is broken! ...Huh, it\'s still running?');
        await E.say('kai', '有一條線一直通往下游。力量是從那艘船送過來的。', 'There\'s a cable running downstream. The power comes from that barge.');
        E.unstage();
      } },
      { id: 'c2_boss', at: 'boss', obj: ['到下游打倒鐵船的隊長。', 'Defeat the captain of the iron barge downstream.'], async run(E) {
        E.stage('c2', [{ id: 'kai', n: 'SamuraiBlue', x: 50, f: 'r' }, { id: 'lin', n: 'Cavegirl2', x: 76, f: 'r' }, { id: 'sallow', n: 'Skeleton', x: 180, f: 'l' }]);
        await E.say('sallow', '嘖嘖，偵察兵說的星裔小鬼，原來長這樣。', "Tsk tsk. So this is the Starborn brat the scout was squealing about.");
        await E.say('sallow', '大帝會很高興的——如果我把你的頭帶回去。', "The Emperor will be delighted, if I bring him your head.");
        await E.say('lin', '先問問我的棍子答不答應！', 'Ask my staff first!');
        E.unstage();
        await E.battle(['sallow'], { boss: true });
        E.stage('c2', [{ id: 'kai', n: 'SamuraiBlue', x: 80, f: 'r' }, { id: 'lin', n: 'Cavegirl2', x: 106, f: 'r' }, { id: 'sallow', n: 'Skeleton', x: 180, f: 'l', down: true }]);
        await E.say('sallow', '收割……只是開始……鐵彗星……已經在路上了……', 'The harvest... is only the start... the Iron Comet... is already on its way...');
        E.removeActor('sallow'); E.sfx('boom'); E.flash('#80ff80');
        await E.say(null, '鐵船沉入河底。不久，河水嘩啦啦地漲了回來。', 'The barge sinks. Before long, the river comes rushing back.');
        E.addActor({ id: 'fisher', n: 'Villager', x: 190, f: 'l' });
        await E.say('fisher', '謝謝你們！我被抓在船上的時候聽到，他們在西邊的巨石谷也抓了很多人……是石族的人，被逼著挖會發光的石頭。', 'Thank you! When they held me on the barge, I heard they\'ve taken many in Stonegiant Valley to the west... the stone folk, forced to dig glowing rocks.');
        await E.say('lin', '凱，我跟你走。這些傢伙不會只來一次。', "Kai, I'm coming with you. These creeps won't stop at one visit.");
        E.unstage();
        await E.nextChapter('c3');
      } },
    ],
  },
  c3: {
    title: ['第三章　石族的眼淚', 'Chapter 3: Tears of the Stone Folk'],
    steps: [
      { id: 'c3_intro', at: null, obj: ['到行商營地打聽石族的事。', "Ask about the stone folk at the traders' camp."], async run(E) {
        await E.say(null, '巨石谷裡迴盪著敲打聲。那不是石族的歌，是鐵鍊和鎚子的聲音。', 'Hammering echoes through Stonegiant Valley. Not the songs of the stone folk: chains and hammers.');
        await E.say('lin', '好熱……這裡連風都是燙的。', 'So hot... even the wind burns here.');
      } },
      { id: 'c3_camp', at: 'camp', obj: ['到行商營地打聽石族的事。', "Ask about the stone folk at the traders' camp."], async run(E) {
        E.stage('c3', [{ id: 'kai', n: 'SamuraiBlue', x: 60, f: 'r' }, { id: 'lin', n: 'Cavegirl2', x: 86, f: 'r' }, { id: 'trader', n: 'Noble', x: 170, f: 'l' }]);
        E.music('village');
        await E.say('trader', '石族？全被軍團抓去北邊的礦坑了。只逃出來一個年輕的巨人，躲在北邊的洞窟裡。', 'The stone folk? The Legion dragged them all to the northern mine. Only one young giant got away; he hides in the caves to the north.');
        await E.say('trader', '大家叫他「會哭的大石頭」。每天晚上都聽得到他在哭。', 'Folks call him "the crying boulder". You can hear him weep every night.');
        await E.say('kai', '我們去找他。', "Let's go find him.");
        E.unstage();
        E.music('valley');
      } },
      { id: 'c3_taro', at: 'taro', obj: ['到北邊的洞窟找年輕的巨人。', 'Find the young giant in the northern caves.'], async run(E) {
        E.stage('c3', [{ id: 'kai', n: 'SamuraiBlue', x: 40, f: 'r' }, { id: 'lin', n: 'Cavegirl2', x: 66, f: 'r' }, { id: 'taro', n: 'Statue', x: 128, f: 'l' }, { id: 'w', n: 'RobotCamouflage', x: 200, f: 'l' }]);
        await E.say('taro', '不……不要過來……我不回去……', "N-no... don't come closer... I won't go back...");
        await E.say('kai', '我們不是軍團的人！小心，你後面！', "We're not with the Legion! Look out, behind you!");
        E.unstage();
        E.join('taro');
        await E.battle(['watcher', 'watcher'], { noFlee: true });
        E.stage('c3', [{ id: 'kai', n: 'SamuraiBlue', x: 80, f: 'r' }, { id: 'lin', n: 'Cavegirl2', x: 56, f: 'r' }, { id: 'taro', n: 'Statue', x: 150, f: 'l' }]);
        await E.say('taro', '你們……不怕我？', "You're... not afraid of me?");
        await E.say('kai', '你比我高三個頭，可是剛剛一直擋在我們前面。怕什麼？', "You're three heads taller than me, and you kept stepping in front of us. Why be afraid?");
        await E.say('taro', '我叫太郎。我的族人被抓去礦坑。他們挖的不是石頭……是星星的眼淚。', "I'm Taro. My people were taken to the mine. What they dig isn't stone... it's the tears of stars.");
        await E.say('lin', '星星的眼淚？', 'Tears of stars?');
        await E.say('taro', '大地的生命凝固起來，就會發光。軍團把它們燒成燃料。', 'When the land\'s life hardens, it glows. The Legion burns it for fuel.');
        await E.say('taro', '我不喜歡打架。可是……我更不喜歡族人哭。帶我去吧。', "I don't like fighting. But... I like my people crying even less. Take me with you.");
        await E.say(null, '太郎成為了同伴！他的「岩鎧」能大幅減少受到的傷害。', 'Taro joins the party! His Stone Skin greatly reduces the damage he takes.');
        E.unstage();
      } },
      { id: 'c3_mine', at: 'mine', obj: ['解放礦坑裡的石族。', 'Free the stone folk in the mine.'], async run(E) {
        E.stage('c3', [{ id: 'kai', n: 'SamuraiBlue', x: 40, f: 'r' }, { id: 'taro', n: 'Statue', x: 70, f: 'r' }, { id: 'h1', n: 'RobotCamouflage', x: 180, f: 'l' }, { id: 'h2', n: 'RobotCamouflage', x: 206, f: 'l' }]);
        await E.say('soldier', '一隻大石頭逃回來了？抓住他！', 'One of the boulders came back? Grab him!');
        E.unstage();
        await E.battle(['heavy', 'rockmole', 'heavy'], { noFlee: true });
        E.stage('c3', [{ id: 'kai', n: 'SamuraiBlue', x: 60, f: 'r' }, { id: 'lin', n: 'Cavegirl2', x: 34, f: 'r' }, { id: 'taro', n: 'Statue', x: 90, f: 'r' }, { id: 'elder', n: 'GoldStatue', x: 170, f: 'l' }]);
        E.music('sad');
        await E.say('stoneelder', '太郎……你回來了。還帶來了……星裔的孩子？', 'Taro... you came back. And you brought... a child of the Starborn?');
        await E.say('stoneelder', '我們石族記得很古老的故事。很久以前，一位星裔的武者失去了最重要的人。', 'We stone folk remember old tales. Long ago, a Starborn warrior lost the one most dear to him.');
        await E.say('stoneelder', '那一刻，他的星火燒成了金色。那「金焰」，連天上的彗星都能擊落。', 'In that moment his star-fire burned gold. That Golden Flame could strike a comet from the sky.');
        await E.say('kai', '金色的……星火。', 'Golden... star-fire.');
        await E.say('stoneelder', '燒礦石的熔爐在東南邊，看守的是碎顎隊長。熔爐不熄，族人就永遠得挖下去。', 'The furnace that burns the ore lies to the southeast, guarded by Captain Grimjaw. While it burns, my people must keep digging.');
        await E.say('taro', '長老，我會把它熄掉。', "Elder, I'll put it out.");
        E.unstage();
        E.music('valley');
      } },
      { id: 'c3_forge', at: 'forge', obj: ['熄滅東南邊的熔爐。', 'Put out the furnace to the southeast.'], async run(E) {
        E.stage('c3', [{ id: 'kai', n: 'SamuraiBlue', x: 40, f: 'r' }, { id: 'taro', n: 'Statue', x: 70, f: 'r' }, { id: 'grim', b: 'GiantRedSamurai', x: 186, f: 'l' }], { fx: 'forge' });
        await E.say('grimjaw', '嘎嘎嘎！大石頭和小蟲子。剛好，熔爐的燃料不夠了！', "Gah-gah-gah! A big rock and some little bugs. Perfect, the furnace needs fuel!");
        await E.say('taro', '……我生氣了。', "...Now I'm angry.");
        E.unstage();
        await E.battle(['grimjaw'], { boss: true });
        E.stage('c3', [{ id: 'kai', n: 'SamuraiBlue', x: 60, f: 'r' }, { id: 'taro', n: 'Statue', x: 90, f: 'r' }, { id: 'lin', n: 'Cavegirl2', x: 34, f: 'r' }, { id: 'grim', b: 'GiantRedSamurai', x: 186, f: 'l', down: true }], { fx: 'forge' });
        await E.say('grimjaw', '嘎……燈塔……在風鳴高原……赫克絲和維克絲……會把鐵彗星……叫來……', 'Gah... the beacon... on the Windsong Highlands... Hex and Vex... will call the Iron Comet down...');
        E.removeActor('grim'); E.sfx('bigboom'); E.flash('#ffa040'); E.shake(30);
        await E.say(null, '熔爐熄滅了。礦坑裡傳來石族低沉的歌聲。', 'The furnace goes dark. From the mine rises the low song of the stone folk.');
        await E.say('taro', '凱，琳。我想看看……燈塔是什麼樣子。', 'Kai, Lin. I want to see... what this beacon looks like.');
        E.unstage();
        await E.nextChapter('c4');
      } },
    ],
  },
  c4: {
    title: ['第四章　被偷走的風', 'Chapter 4: The Stolen Wind'],
    steps: [
      { id: 'c4_intro', at: null, obj: ['到風神社打聽燈塔的事。', 'Ask about the beacon at the Wind Shrine.'], async run(E) {
        await E.say(null, '高原上的風很奇怪。所有的風，都往東邊的山頭吹去。', 'The wind on the highlands is strange. All of it blows toward the eastern peak.');
        await E.say('taro', '花……都閉起來了。', 'The flowers... have all closed.');
      } },
      { id: 'c4_shrine', at: 'shrine', obj: ['到風神社打聽燈塔的事。', 'Ask about the beacon at the Wind Shrine.'], async run(E) {
        E.stage('c4', [{ id: 'kai', n: 'SamuraiBlue', x: 60, f: 'r' }, { id: 'monk', n: 'Monk', x: 170, f: 'l' }]);
        E.music('village');
        await E.say('monk', '燈塔？那東西一點亮，高原的風就被吸過去了。', 'The beacon? Ever since it lit up, the highland wind has been sucked toward it.');
        await E.say('monk', '我們的風之舞者米菈，跑到北邊的舞臺去跳舞，說要把風叫回來……可是那裡現在到處都是怪物。', 'Our wind dancer Mira ran off to the northern terrace to dance the wind back... but it\'s crawling with monsters now.');
        await E.say('kai', '我們去找她。', "We'll find her.");
        E.unstage();
        E.music('highland');
      } },
      { id: 'c4_mira', at: 'mira', obj: ['到北邊的舞臺找米菈。', 'Find Mira at the northern terrace.'], async run(E) {
        E.stage('c4', [{ id: 'kai', n: 'SamuraiBlue', x: 40, f: 'r' }, { id: 'mira', n: 'Woman', x: 128, f: 'r' }, { id: 'b', n: 'BlueBat', m: true, x: 196, f: 'l' }]);
        await E.say('mira', '風啊風，回來吧，花還等著你——哎呀，又是你們這些蝙蝠！', 'Wind, oh wind, come home, the flowers wait for you— oh no, you bats again!');
        await E.say('kai', '我們來幫忙！', "We'll help!");
        await E.say('mira', '那就跟上我的節拍吧！', 'Then keep up with my rhythm!');
        E.unstage();
        E.join('mira');
        await E.battle(['windbat', 'moth', 'windbat'], { noFlee: true });
        E.stage('c4', [{ id: 'kai', n: 'SamuraiBlue', x: 80, f: 'r' }, { id: 'mira', n: 'Woman', x: 150, f: 'l' }]);
        await E.say('mira', '呼……你們的星火好吵喔，風都被你們嚇跑了。', 'Phew... your star-fire is so loud. You scared the wind away.');
        await E.say('kai', '對、對不起……', 'S-sorry...');
        await E.say('mira', '開玩笑的！我是米菈。那座燈塔在偷風，風被偷走，高原上的花就不會開了。', "Just kidding! I'm Mira. That beacon is stealing the wind, and without wind, the highland flowers won't bloom.");
        await E.say('mira', '我討厭這樣。帶我一起去吧，我會讓你們像風一樣輕。', "I hate it. Take me with you. I'll make you light as the wind.");
        await E.say(null, '米菈成為了同伴！她的「疾風舞」能讓接下來兩次攻擊必定閃開。', 'Mira joins the party! Her Gale Dance makes her surely dodge the next two attacks.');
        E.unstage();
      } },
      { id: 'c4_beacon', at: 'beacon', obj: ['阻止東邊山頭的燈塔。', 'Stop the beacon on the eastern peak.'], async run(E) {
        E.stage('c4', [{ id: 'kai', n: 'SamuraiBlue', x: 40, f: 'r' }, { id: 'mira', n: 'Woman', x: 66, f: 'r' }, { id: 'hex', b: 'TenguRed', x: 168, f: 'l' }, { id: 'vex', b: 'TenguBlue', x: 214, f: 'l' }], { fx: 'beacon' });
        await E.say('hex', '姊姊，妳看，是星裔。', 'Sister, look. A Starborn.');
        await E.say('vex', '妹妹，抓活的。大帝一定想親手收割他。', 'Sister, take him alive. The Emperor will want to harvest him himself.');
        await E.say('mira', '一對烏鴉，吵死了。', "A pair of crows. So noisy.");
        E.unstage();
        await E.battle(['vex', 'hex'], { boss: true });
        E.stage('c4', [{ id: 'kai', n: 'SamuraiBlue', x: 60, f: 'r' }, { id: 'mira', n: 'Woman', x: 86, f: 'r' }, { id: 'lin', n: 'Cavegirl2', x: 34, f: 'r' }, { id: 'hex', b: 'TenguRed', x: 180, f: 'l', down: true }], { fx: 'beacon' });
        await E.say('hex', '太遲了……燈塔……已經點亮了……', 'Too late... the beacon... is already lit...');
        E.removeActor('hex'); E.sfx('thunder'); E.flash('#ffffff');
        E.stage('c4n', [{ id: 'kai', n: 'SamuraiBlue', x: 60, f: 'r' }, { id: 'mira', n: 'Woman', x: 86, f: 'r' }, { id: 'lin', n: 'Cavegirl2', x: 34, f: 'r' }, { id: 'taro', n: 'Statue', x: 112, f: 'r' }], { fx: 'comet' });
        E.music('reveal'); E.sfx('quake'); E.shake(40);
        await E.say(null, '一道光柱衝上夜空。雲層裂開，一顆巨大的鐵色彗星停在了天上。', 'A pillar of light pierces the night. The clouds part, and a vast iron comet comes to rest in the sky.');
        await E.say('lin', '那是……一顆鐵做的月亮？', "Is that... a moon made of iron?");
        await E.say('taro', '有東西……掉下來了。往南邊的火山口。', 'Something is... falling. Toward the crater in the south.');
        await E.say('mira', '風在發抖。我從來沒感覺過風這麼害怕。', "The wind is shaking. I've never felt it so afraid.");
        await E.say('kai', '去南邊。不管那是什麼，我們都要擋下來。', "South, then. Whatever it is, we'll stop it.");
        E.unstage();
        await E.nextChapter('c5');
      } },
    ],
  },
  c5: {
    title: ['第五章　隕坑要塞', 'Chapter 5: The Crater Fortress'],
    steps: [
      { id: 'c5_intro', at: null, obj: ['到灰燼避難所。', 'Go to the Ashfall Refuge.'], async run(E) {
        await E.say(null, '天空落下灰燼。火山口裡，軍團的要塞像一隻趴著的鐵蟲。', 'Ash falls from the sky. In the crater, the Legion fortress crouches like an iron beetle.');
      } },
      { id: 'c5_refuge', at: 'refuge', obj: ['到灰燼避難所。', 'Go to the Ashfall Refuge.'], async run(E) {
        E.stage('c5', [{ id: 'kai', n: 'SamuraiBlue', x: 60, f: 'r' }, { id: 'reb', n: 'RobotGreen', x: 170, f: 'l' }]);
        E.music('village');
        await E.say('rebel', '別、別打！我是逃兵，在這裡幫忙照顧難民。', "D-don't hit me! I'm a deserter. I help look after the refugees here.");
        await E.say('rebel', '要塞的橋上守著傑德。他是大帝手下最強的精英。', "Zed guards the bridge into the fortress. He's the strongest elite the Emperor has.");
        await E.say('rebel', '可是……他跟其他人不一樣。我逃跑那天，他看見了，卻放我走。', "But... he's not like the others. The day I ran, he saw me, and let me go.");
        await E.say('kai', '傑德……', 'Zed...');
        E.unstage();
        E.music('crater');
      } },
      { id: 'c5_gate', at: 'gate', obj: ['突破要塞的大門。', "Break through the fortress gate."], async run(E) {
        E.stage('c5', [{ id: 'kai', n: 'SamuraiBlue', x: 40, f: 'r' }, { id: 'lin', n: 'Cavegirl2', x: 66, f: 'r' }, { id: 's1', n: 'NinjaMasked', x: 180, f: 'l' }, { id: 's2', n: 'NinjaMasked', x: 206, f: 'l' }]);
        await E.say('lin', '影子一樣的守衛……小心，他們的刀從影子裡出來，閃不開！', 'Shadow guards... careful, their blades come out of the shadows. You can\'t dodge them!');
        E.unstage();
        await E.battle(['shadow', 'shadow'], { noFlee: true });
      } },
      { id: 'c5_zed', at: 'zed', obj: ['通過要塞的橋。', "Cross the fortress bridge."], async run(E) {
        E.stage('c5', [{ id: 'kai', n: 'SamuraiBlue', x: 60, f: 'r' }, { id: 'zed', n: 'Vampire', x: 180, f: 'l' }]);
        E.music('reveal');
        await E.say('zed', '你就是那個星裔。布拉克、薩羅、格林，還有那對烏鴉……都是你打倒的？', "So you're the Starborn. Brakk, Sallow, Grimjaw, those two crows... all your doing?");
        await E.say('kai', '是我們打倒的。', 'Ours.');
        await E.say('zed', '我叫傑德。我不在乎收割，也不在乎大帝。我只想知道一件事——', "I'm Zed. I don't care about the harvest, or the Emperor. I only want to know one thing:");
        await E.say('zed', '你有多強。', "How strong you are.");
        E.unstage();
        await E.battle(['zedfoe'], { boss: true });
        E.stage('c5', [{ id: 'kai', n: 'SamuraiBlue', x: 90, f: 'r' }, { id: 'zed', n: 'Vampire', x: 160, f: 'l', down: true }]);
        await E.say('zed', '……我輸了。動手吧。', '...I lost. Finish it.');
        await E.say('kai', '我不殺不想殺我的人。你剛才每一招，都留了一手。', "I don't kill people who don't want to kill me. You held back with every move.");
        await E.say('zed', '……天真。', '...Naive.');
        E.removeActor('zed');
        await E.say(null, '傑德消失在灰燼裡。', 'Zed vanishes into the ash.');
        E.unstage();
        E.music('crater');
      } },
      { id: 'c5_throne', at: 'throne', obj: ['打倒要塞的指揮官。', "Defeat the fortress commander."], async run(E) {
        E.stage('c5', [{ id: 'kai', n: 'SamuraiBlue', x: 40, f: 'r' }, { id: 'taro', n: 'Statue', x: 70, f: 'r' }, { id: 'mordax', b: 'DemonCyclop', x: 186, f: 'l' }]);
        await E.say('mordax', '吾乃摩達克斯將軍。這座要塞，是收割之王的爪。', "I am General Mordax. This fortress is the claw of the Harvest King.");
        await E.say('mordax', '大帝的鐵彗星已經就位。等核心充滿，你們的星球就只剩一顆空殼。', "The Emperor's Iron Comet is in place. When its core is full, your world will be an empty husk.");
        E.unstage();
        await E.battle(['mordax'], { boss: true });
        E.stage('c5', [{ id: 'kai', n: 'SamuraiBlue', x: 60, f: 'r' }, { id: 'taro', n: 'Statue', x: 90, f: 'r' }, { id: 'lin', n: 'Cavegirl2', x: 34, f: 'r' }, { id: 'mira', n: 'Woman', x: 116, f: 'r' }], { fx: 'holo' });
        E.music('final');
        await E.say('vorrak', '摩達克斯，你讓我失望了。', 'Mordax. You disappoint me.');
        await E.say('kai', '你就是……沃拉克！', "You're... Vorrak!");
        await E.say('vorrak', '星裔的幼崽。十二年前，你的父母也像這樣瞪著我的士兵。他們的星火，很好吃。', 'A Starborn cub. Twelve years ago your parents glared at my soldiers just like that. Their star-fire was delicious.');
        E.addActor({ id: 'zed', n: 'Vampire', x: 200, f: 'l' });
        await E.say('vorrak', '還有你，傑德。你放走了星裔。', 'And you, Zed. You let the Starborn go.');
        await E.say('zed', '……我只是輸了。', '...I simply lost.');
        await E.say('vorrak', '那就收割你。', 'Then you shall be harvested.');
        E.flash('#c040ff'); E.sfx('bigboom'); E.shake(30);
        E.moveActor('kai', 176);
        await E.say(null, '一道紫色的光從天而降。凱衝過去，用星火擋下了一半。', 'A violet beam falls from the sky. Kai dives in and blocks half of it with his star-fire.');
        E.music('sad');
        await E.say('zed', '……為什麼救我？', '...Why save me?');
        await E.say('kai', '因為你也是被他搶走一切的人吧。', "Because he took everything from you too, didn't he?");
        await E.say('zed', '我的星球，十年前被收割了。我是唯一活下來的。我替他戰鬥，只是因為……不知道還能做什麼。', "My world was harvested ten years ago. I was the only one left. I fought for him because... I didn't know what else to do.");
        await E.say('zed', '鐵彗星的航道，我知道。我帶你們上去。這次，我為自己戰鬥。', "I know the way to the Iron Comet. I'll take you up there. This time, I fight for myself.");
        await E.say(null, '傑德成為了同伴！', 'Zed joins the party!');
        E.join('zed', 1);
        E.unstage();
        await E.nextChapter('c6');
      } },
    ],
  },
  c6: {
    title: ['第六章　金焰覺醒', 'Chapter 6: The Golden Flame'],
    steps: [
      { id: 'c6_intro', at: null, obj: ['前往鐵彗星的收割核心。', "Reach the Iron Comet's harvest core."], async run(E) {
        E.stage('c6', [{ id: 'kai', n: 'SamuraiBlue', x: 70, f: 'r' }, { id: 'zed', n: 'Vampire', x: 100, f: 'r' }, { id: 'lin', n: 'Cavegirl2', x: 44, f: 'r' }]);
        E.music('comet');
        await E.say(null, '小艇靠上了鐵彗星。腳下遠遠的地方，是他們的星球，藍得讓人想哭。', 'The shuttle docks with the Iron Comet. Far below lies their world, so blue it hurts to look at.');
        await E.say('zed', '核心在中段，王座在最上面。只要大帝倒下，被抽走的生命就會回去。', 'The core is midway, the throne at the top. If the Emperor falls, the stolen life goes home.');
        E.addActor({ id: 'oroso', n: 'Master', x: 190, f: 'l' });
        await E.say('oroso', '老人搭個便車，不算犯規吧？', "An old man hitching a ride, that's not against the rules, is it?");
        await E.say('kai', '師父！？您怎麼……', 'Master?! How did you—');
        await E.say('oroso', '山上的松樹說，徒弟要去打架了。做師父的，總得來看看。', 'The pines on the mountain told me my student was off to fight. A master ought to come and watch.');
        await E.say(null, '奧羅索暫時加入了隊伍！', 'Oroso joins the party for now!');
        E.join('oroso', 1, 24000);
        E.unstage();
      } },
      { id: 'c6_core', at: 'core', obj: ['前往鐵彗星的收割核心。', "Reach the Iron Comet's harvest core."], async run(E) {
        E.stage('c6', [{ id: 'kai', n: 'SamuraiBlue', x: 40, f: 'r' }, { id: 'zed', n: 'Vampire', x: 66, f: 'r' }, { id: 'g1', n: 'KnightGold', x: 180, f: 'l' }, { id: 'g2', n: 'KnightGold', x: 206, f: 'l' }], { fx: 'core' });
        await E.say('mira', '好多的光……是花、是河、是石頭的生命……全被關在這裡。', "So much light... the flowers, the river, the stones... all locked in here.");
        await E.say('soldier', '皇家近衛！格殺勿論！', 'Royal Guard! Cut them down!');
        E.unstage();
        await E.battle(['royal', 'berserker', 'royal'], { noFlee: true });
        E.stage('c6', [{ id: 'kai', n: 'SamuraiBlue', x: 60, f: 'r' }, { id: 'zed', n: 'Vampire', x: 86, f: 'r' }, { id: 'taro', n: 'Statue', x: 34, f: 'r' }], { fx: 'core' });
        await E.say('zed', '核心的護盾解除了。剩下的，就是王座。', 'The core shield is down. All that\'s left is the throne.');
        await E.say('taro', '族人的眼淚……我聽得到。它們想回家。', "My people's tears... I can hear them. They want to go home.");
        E.unstage();
      } },
      { id: 'c6_throne', at: 'throne', obj: ['在王座打倒沃拉克大帝。', 'Defeat Emperor Vorrak at the throne.'], async run(E) {
        E.stage('c6', [{ id: 'kai', n: 'SamuraiBlue', x: 70, f: 'r' }, { id: 'oroso', n: 'Master', x: 30, f: 'r' }, { id: 'vorrak', n: 'SkeletonDemon', x: 186, f: 'l' }], { fx: 'throne' });
        E.music('final');
        await E.say('vorrak', '星裔。你終於來了。', 'Starborn. At last.');
        await E.say('vorrak', '我收割過九十九顆星球。每一顆都有像你這樣的人，每一顆都一樣乾淨地熄滅了。', 'I have harvested ninety-nine worlds. Each had someone like you. Each went out just as cleanly.');
        await E.say('kai', '我們不會熄滅！', "We won't go out!");
        E.unstage();
        await E.battle(['vorrak1'], { boss: true, music: 'final' });
        E.stage('c6', [{ id: 'kai', n: 'SamuraiBlue', x: 70, f: 'r' }, { id: 'oroso', n: 'Master', x: 40, f: 'r' }, { id: 'vorrak', n: 'SkeletonDemon', x: 186, f: 'l' }], { fx: 'throne' });
        await E.say('vorrak', '呵……呵呵呵。很好。好久沒有人逼我脫下這副盔甲了。', 'Heh... heh heh heh. Good. It has been an age since anyone forced me out of this armour.');
        E.flash('#c040ff'); E.sfx('quake'); E.shake(40);
        E.removeActor('vorrak'); E.addActor({ id: 'vorrak2', b: 'DemonCyclop2', hue: 200, x: 190, f: 'l' });
        await E.say('vorrak', '看清楚了。這才是收割者的真面目。', 'Look well. This is the true face of the Harvester.');
        await E.say('vorrak', '第一個，就收割你吧，小星裔。', 'You first, little Starborn.');
        E.flash('#c040ff'); E.sfx('bigboom');
        E.moveActor('oroso', 96);
        await E.say('kai', '師父——！！', 'MASTER!!');
        E.music('lament');
        E.setDown('oroso', true);
        await E.say('oroso', '凱……沒事吧……', 'Kai... are you hurt...?');
        await E.say('kai', '為什麼……為什麼要擋在我前面！', 'Why... why did you step in front of me!');
        await E.say('oroso', '傻孩子……做師父的……本來就該站在徒弟前面……', 'Foolish boy... a master... is meant to stand in front of his student...');
        await E.say('oroso', '聽好……星火……不是憤怒……是為了想保護的人……而燃燒的……', 'Listen... star-fire... is not anger... it burns... for those you want to protect...');
        await E.say('oroso', '你的父母……一定……很驕傲……', 'Your parents... would be... so proud...');
        E.removeActor('oroso');
        E.leave('oroso');
        await E.wait(60);
        await E.say('kai', '…………', '............');
        await E.golden();
        E.flag('golden');
        E.stage('c6', [{ id: 'kai', n: 'SamuraiBlue', x: 80, f: 'r', gold: true }, { id: 'vorrak2', b: 'DemonCyclop2', hue: 200, x: 190, f: 'l' }], { fx: 'throne' });
        E.music('golden');
        await E.say('vorrak', '金、金色的星火！？不可能，那只是傳說！', 'G-golden star-fire?! Impossible, that\'s only a legend!');
        await E.say('kai', '沃拉克。我不會再讓任何人，失去任何東西。', "Vorrak. I won't let anyone lose anything ever again.");
        await E.say(null, '【金焰覺醒】戰鬥中選「金焰覺醒」（30氣），凱的戰鬥力變成五倍。每回合消耗6氣，氣用完就會解除。', '[Golden Flame] In battle choose "Golden Flame" (30 ki) to multiply Kai\'s power level by five. It burns 6 ki a round and ends when his ki runs out.');
        E.unstage();
        await E.battle(['vorrak2'], { boss: true, music: 'golden', goldStart: true });
        E.stage('c6', [{ id: 'kai', n: 'SamuraiBlue', x: 80, f: 'r', gold: true }, { id: 'vorrak2', b: 'DemonCyclop2', hue: 200, x: 190, f: 'l', down: true }], { fx: 'throne' });
        await E.say('vorrak', '這光……不是星火……是星星……本身……', 'This light... is not star-fire... it is... a star itself...');
        E.removeActor('vorrak2'); E.sfx('bigboom'); E.flash('#ffffff'); E.shake(60);
        await E.ending();
      } },
    ],
  },
  c7: {
    title: ['終章　星拳大會', 'Epilogue: The Star Fist Tournament'],
    steps: [
      { id: 'c7_intro', at: null, obj: ['到祭典廣場報名。', 'Sign up at the Festival Square.'], async run(E) {
        E.stage('c7', [{ id: 'kai', n: 'SamuraiBlue', x: 70, f: 'r' }, { id: 'lin', n: 'Cavegirl2', x: 150, f: 'l' }, { id: 'mira', n: 'Woman', x: 176, f: 'l' }]);
        E.music('tourney');
        await E.say(null, '半年後。蘆河村舉辦了第一屆「星拳大會」，紀念那位守護山林的老隱士。', 'Half a year later. Reed Village holds the first Star Fist Tournament, in memory of the old hermit who guarded the mountain.');
        await E.say('lin', '凱！你可是冠軍候補喔，別給我丟臉。', "Kai! You're the favourite, so don't embarrass me.");
        await E.say('mira', '聽說北邊的紀念碑，晚上會發光呢。比完賽一起去看吧。', 'They say the memorial stone to the north glows at night. Let\'s go see it after the matches.');
        E.unstage();
      } },
      { id: 'c7_r1', at: 'ring1', obj: ['第一戰：到第一擂臺。', 'Round 1: go to the first ring.'], async run(E) {
        E.stage('c7', [{ id: 'kai', n: 'SamuraiBlue', x: 70, f: 'r' }, { id: 'ann', n: 'Inspector', x: 128, f: 'l' }, { id: 'boxer', n: 'MonkeyBoxerRed', x: 190, f: 'l' }]);
        await E.say('announcer', '各位觀眾！第一戰，打倒鐵彗軍團的英雄——凱！對手是南方來的赤猿拳王！', 'Ladies and gentlemen! Round one: the hero who toppled the Iron Comet Legion, Kai! Against the Red Ape Boxer from the south!');
        await E.say('boxer', '吼吼！英雄又怎樣，拳頭不會說謊！', 'Hoo hoo! Hero or not, fists don\'t lie!');
        E.unstage();
        await E.battle(['boxer'], { boss: true, music: 'boss' });
      } },
      { id: 'c7_r2', at: 'ring2', obj: ['第二戰：到第二擂臺。', 'Round 2: go to the second ring.'], async run(E) {
        E.stage('c7', [{ id: 'kai', n: 'SamuraiBlue', x: 70, f: 'r' }, { id: 'ronin', n: 'Samurai', x: 190, f: 'l' }]);
        await E.say('ronin', '我是浪人疾風。聽說你的星火會變成金色……讓我開開眼界。', "I am Ronin Gale. They say your star-fire turns gold... let me see it.");
        E.unstage();
        await E.battle(['ronin'], { boss: true, music: 'boss' });
      } },
      { id: 'c7_r3', at: 'ring3', obj: ['決賽：到第三擂臺。', 'The final: go to the third ring.'], async run(E) {
        E.stage('c7', [{ id: 'kai', n: 'SamuraiBlue', x: 70, f: 'r' }, { id: 'tanuki', b: 'GiantRacoonGold', x: 190, f: 'l' }]);
        await E.say('announcer', '決賽！衛冕三十年的傳奇，金狸大力士登場！', 'The final! The legend who has held the title for thirty years: the Golden Tanuki!');
        await E.say('tanuki', '嗯嗯，少年。你師父年輕的時候，也站在這個擂臺上。他把我摔出場外三次。', "Mm-hm, youngster. Your master stood in this very ring when he was young. He threw me out of it three times.");
        await E.say('kai', '師父他……', 'My master...');
        await E.say('tanuki', '來吧！讓老頭子看看，他的徒弟有多強！', "Come! Show this old-timer how strong his student became!");
        E.unstage();
        await E.battle(['tanuki'], { boss: true, music: 'golden' });
        E.stage('c7', [{ id: 'kai', n: 'SamuraiBlue', x: 110, f: 'r' }, { id: 'ann', n: 'Inspector', x: 170, f: 'l' }]);
        await E.say('announcer', '優勝者——凱！新的星拳王誕生了！', 'The winner: Kai! A new Star Fist champion is born!');
        E.give('starfruit', 2);
        await E.say(null, '得到了兩顆星果。聽說北邊的紀念碑在發光……', 'You received two Star Fruits. They say the memorial stone to the north is glowing...');
        E.unstage();
      } },
      { id: 'c7_spirit', at: 'shrine', obj: ['去北邊發光的紀念碑。', 'Visit the glowing memorial stone to the north.'], async run(E) {
        E.stage('c7n', [{ id: 'kai', n: 'SamuraiBlue', x: 80, f: 'r' }, { id: 'sp', n: 'Master', ghost: true, x: 170, f: 'l' }], { fx: 'fire' });
        E.music('sad');
        await E.say('oroso', '冠軍了啊，凱。', 'A champion now, Kai.');
        await E.say('kai', '師父……！', 'Master...!');
        await E.say('oroso', '別哭。星星不會真的消失，只是換了個地方發光。', "Don't cry. Stars never really vanish. They just shine from somewhere else.");
        await E.say('oroso', '來吧，最後一課。這次，我用十成力氣。', 'Come. One last lesson. This time I use all of my strength.');
        E.unstage();
        await E.battle(['spirit'], { boss: true, music: 'golden' });
        E.stage('c7n', [{ id: 'kai', n: 'SamuraiBlue', x: 100, f: 'r' }, { id: 'sp', n: 'Master', ghost: true, x: 160, f: 'l' }], { fx: 'fire' });
        await E.say('oroso', '呵呵……好孩子。你的星火，已經比任何一顆星星都亮了。', 'Ho ho... good boy. Your star-fire shines brighter than any star now.');
        await E.say('oroso', '去照亮你想照亮的人吧。', 'Go, and shine for the ones you want to light.');
        E.removeActor('sp');
        await E.say('kai', '……是，師父。一千一百下，一下都不會少。', '...Yes, Master. One thousand one hundred, not one less.');
        E.unstage();
        await E.epilogueEnd();
      } },
    ],
  },
};

// people in towns: [who, zh, en] chosen by the current story flags
export const TALK = {
  pinehollow: (f) => [
    ['hunter', '東邊林子的動物都跑出來了。小心點。', 'Every animal in the east woods has fled. Be careful.'],
    ['boy', f.c1_crash ? '凱哥哥打倒了天上掉下來的壞人！好厲害！' : '師父爺爺說，凱哥哥每天要打一千下拳。好累喔。', f.c1_crash ? 'Kai beat the bad guy from the sky! So cool!' : 'Grandpa Master says Kai punches a thousand times a day. So tiring.'],
    ['woman', '村子後面的泉水能消除疲勞。累了就去泡泡吧。', 'The spring behind the village melts away fatigue. Soak in it if you\'re tired.'],
  ],
  reedvillage: (f) => [
    ['elder', f.c2_boss ? '河水回來了。琳那孩子……就拜託你了。' : '琳從小就倔強。她爹娘走得早，是那根棍子陪她長大的。', f.c2_boss ? 'The river is back. Please... look after Lin.' : "Lin has been stubborn since she was small. Her parents passed early; that staff raised her as much as I did."],
    ['fisher', '下游的鐵船晚上會發出嗡嗡聲，魚都不敢靠近。', 'The iron barge downstream hums at night. The fish won\'t go near it.'],
    ['boy', '戰鬥的時候，「必」牌可以讓必殺技便宜一半喔！', 'In a fight, a 必 card makes specials cost half!'],
  ],
  tradercamp: (f) => [
    ['trader', '星星的眼淚？我也想賣，可惜全被軍團搶走了。', 'Tears of stars? I\'d sell them too, but the Legion took every one.'],
    ['scout', '對手的數字比你大時，別閃避，防禦比較安全。', 'When the foe\'s number beats yours, don\'t dodge. Guarding is safer.'],
    ['woman', f.c3_forge ? '石族的歌又回來了。真好聽。' : '晚上常常聽到北邊的洞窟有人在哭。', f.c3_forge ? 'The stone folk are singing again. It\'s beautiful.' : 'At night you can hear someone weeping in the northern caves.'],
  ],
  windshrine: (f) => [
    ['monk', f.c4_mira ? '米菈就拜託各位了。那孩子跳起舞來，連風都會笑。' : '米菈從小就能聽懂風說話。', f.c4_mira ? "Please take care of Mira. When she dances, even the wind laughs." : 'Mira could understand the wind since she was little.'],
    ['scout', '光束對決的時候，拚命連打Z！戰鬥力差太多的話，就很難推回去。', 'In a beam clash, mash Z like mad! If their power is far above yours, it\'s hard to push back.'],
    ['trader', '高原的花三年才開一次，今年卻一朵都沒開。', 'The highland flowers bloom once in three years. This year, not one opened.'],
  ],
  refuge: (f) => [
    ['rebel', '軍團裡，戰鬥力就是一切。大帝的戰鬥力……據說超過十萬。', 'In the Legion, power level is everything. The Emperor\'s... they say it\'s over a hundred thousand.'],
    ['woman', '我們的村子被要塞壓在下面了。可是只要大家都活著，就能再蓋一個。', 'Our village is under that fortress now. But as long as we live, we can build another.'],
    ['boy', '倒下的同伴，喝「醒神茶」就能站起來喔。', 'A fallen friend can get back up with Waking Tea!'],
  ],
  festival: (f) => [
    ['announcer', '星拳大會，三戰全勝就是冠軍！', 'Win all three matches and you are the Star Fist champion!'],
    ['elder', '奧羅索年輕時，也是這個大會的冠軍。', 'When Oroso was young, he too was champion of this tournament.'],
    ['lin', '我也想參賽，可是有人說我太兇了。哼。', 'I wanted to enter too, but someone said I\'m too scary. Hmph.'],
  ],
};
