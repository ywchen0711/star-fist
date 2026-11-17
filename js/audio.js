// Sound: recorded music and jingles from the Ninja Adventure pack (CC0), and sound effects
// synthesized on the spot with Web Audio (pulse waves, noise and sweeps, like a 16-bit sound chip).
let A = null, master, sfxBus, echoIn, noiseBuf;
const waves = {};
export const vol = { music: 0.5, sfx: 0.7 };
export const music = { on: true };
const mv = () => (music.on ? vol.music : 0);

// iPhone and iPad: sound may only start inside a tap or a key press, and the phone can suspend it
// ('interrupted') after a call, Siri or the lock screen. Every tap, click or key wakes it again, the music
// players are woken once inside a tap so they can change tracks later, and a player's volume (which
// iOS will not let a page set) goes through Web Audio there.
let noAudio = false, gestured = false;
const SILENT = 'data:audio/wav;base64,UklGRqQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==';
const tryPlay = (a) => { try { const p = a.play(); if (p && p.then) return p.then(() => { a.ok = true; }); a.ok = true; } catch (e) { /* ignore */ } return Promise.reject(new Error('no play')); };
const resumeCtx = () => { try { const p = A.resume(); if (p && p.catch) p.catch(() => {}); } catch (e) { /* ignore */ } };
const fixedVolume = (() => { try { const t = new Audio(); t.volume = 0.5; return t.volume !== 0.5; } catch (e) { return false; } })();
let pool = null;
// iOS Safari before 18.4 cannot play Ogg, so it gets the AAC (.m4a) copies of the music
const EXT = (() => { try { return new Audio().canPlayType('audio/ogg; codecs="vorbis"') ? '.ogg' : '.m4a'; } catch (e) { return '.m4a'; } })();
const players = () => pool || (pool = [0, 1, 2].map(() => { const a = new Audio(); a.preload = 'auto'; return a; }));
function takePlayer() {
  const ps = players(), a = ps.find((p) => p !== el && p.paused) || ps.find((p) => p !== el);
  a.gen = (a.gen || 0) + 1; a.pause();
  return a;
}
function setVol(a, v) {
  a.muted = v <= 0;
  if (fixedVolume && A && !a.routed) { a.routed = true; try { const s = A.createMediaElementSource(a); a.g = A.createGain(); s.connect(a.g); a.g.connect(A.destination); } catch (e) { a.g = null; } }
  if (a.g) a.g.gain.value = v; else a.volume = v;
}
const getVol = (a) => (a.g ? a.g.gain.value : a.volume);
function wakeMusic() {
  for (const p of players()) if (!p.ok && p !== el) { p.src = SILENT; tryPlay(p).then(() => { if (p !== el) p.pause(); }).catch(() => {}); }
  if (el && el.paused && !el.ended) { setVol(el, getVol(el)); tryPlay(el).catch(() => {}); }
}
export function initAudio() {
  gestured = true;
  wakeMusic();
  if (A) { if (A.state !== 'running') resumeCtx(); return; }
  if (noAudio) return;
  try { A = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { noAudio = true; A = null; return; }
  master = A.createGain(); master.gain.value = 0.8;
  const lp = A.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 7500;
  master.connect(lp); lp.connect(A.destination);
  sfxBus = A.createGain(); sfxBus.gain.value = vol.sfx; sfxBus.connect(master);
  echoIn = A.createGain(); echoIn.gain.value = 0.28;
  const d = A.createDelay(1); d.delayTime.value = 0.18;
  const fb = A.createGain(); fb.gain.value = 0.32;
  const ef = A.createBiquadFilter(); ef.type = 'lowpass'; ef.frequency.value = 2600;
  echoIn.connect(d); d.connect(ef); ef.connect(fb); fb.connect(d); ef.connect(master);
  for (const duty of [0.125, 0.25, 0.5]) {
    const n = 48, re = new Float32Array(n), im = new Float32Array(n);
    for (let k = 1; k < n; k++) re[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * duty);
    waves[duty] = A.createPeriodicWave(re, im);
  }
  noiseBuf = A.createBuffer(1, A.sampleRate, A.sampleRate);
  const ch = noiseBuf.getChannelData(0);
  for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
  if (A.state !== 'running') resumeCtx();
  // one silent sample played inside the tap unlocks Web Audio on iPhone and iPad
  try { const b = A.createBuffer(1, 1, 22050), s = A.createBufferSource(); s.buffer = b; s.connect(A.destination); s.start(0); } catch (e) { /* ignore */ }
  if (el) setVol(el, getVol(el));
  // the jingles are decoded once and played through Web Audio, so they can sound after a battle without a tap
  for (const n of ['gameover', 'item', 'levelup', 'victory']) {
    fetch('assets/jingle/' + n + '.wav').then((r) => r.arrayBuffer()).then((b) => new Promise((ok, no) => { const p = A.decodeAudioData(b, ok, no); if (p && p.catch) p.catch(no); })).then((buf) => { jbuf[n] = buf; }).catch(() => {});
  }
}

// ---------- music ----------
let el = null, pending = null;
const jbuf = {};
export let currentSong = null;
const ONCE = new Set(['ending', 'credits']);
export function playMusic(name, { restart = false } = {}) {
  if (currentSong === name && !restart && el) return;
  stopMusic(0.4);
  currentSong = name;
  if (!name) return;
  const a = takePlayer();
  a.src = 'assets/music/' + name + EXT;
  a.loop = !ONCE.has(name); setVol(a, Math.min(1, mv()));
  el = a;
  if (!gestured) { pending = name; return; }
  tryPlay(a).catch(() => { pending = name; });
}
export function stopMusic(fade = 0) {
  const a = el; el = null; currentSong = null;
  if (!a) return;
  const g = a.gen = (a.gen || 0) + 1;
  if (!fade) { a.pause(); return; }
  const v0 = getVol(a), t0 = performance.now();
  const step = () => { if (a.gen !== g) return; const k = (performance.now() - t0) / (fade * 1000); if (k >= 1) { a.pause(); return; } setVol(a, v0 * (1 - k)); requestAnimationFrame(step); };
  step();
}
export function jingle(n) {
  if (!A) return;
  if (jbuf[n]) { try { const src = A.createBufferSource(), g = A.createGain(); src.buffer = jbuf[n]; g.gain.value = Math.min(1, vol.sfx * 0.8); src.connect(g); g.connect(A.destination); src.start(); return; } catch (e) { /* fall back */ } }
  const a = new Audio('assets/jingle/' + n + '.wav'); a.volume = Math.min(1, vol.sfx * 0.8); a.play().catch(() => {});
}
function setVolumes() { if (el) setVol(el, Math.min(1, mv())); }

// ---------- sound effects ----------
const freq = (m) => 440 * Math.pow(2, (m - 69) / 12);
function tone(m, t, dur, v, type = 0.5, echo = false) {
  const o = A.createOscillator();
  if (waves[type]) o.setPeriodicWave(waves[type]); else o.type = type;
  o.frequency.value = freq(m);
  const g = A.createGain(); g.gain.setValueAtTime(v, t); g.gain.setTargetAtTime(0.0001, t + dur * 0.6, dur * 0.3);
  o.connect(g); g.connect(sfxBus); if (echo) g.connect(echoIn);
  o.start(t); o.stop(t + dur + 0.3);
}
function blip(seq, type = 0.5, v = 0.15, step = 0.05, echo = false) {
  let t = A.currentTime + 0.01;
  for (const m of seq) { if (m) tone(m, t, step * 0.9, v, type, echo); t += step; }
}
function noise(t0, len, f0, f1, v = 0.3, type = 'bandpass', q = 1.2) {
  const n = A.createBufferSource(); n.buffer = noiseBuf;
  const f = A.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(f0, t0); f.frequency.exponentialRampToValueAtTime(f1, t0 + len); f.Q.value = q;
  const g = A.createGain(); g.gain.setValueAtTime(v, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + len);
  n.connect(f); f.connect(g); g.connect(sfxBus); n.start(t0, Math.random() * 0.4); n.stop(t0 + len + 0.05);
}
function sweep(t0, len, f0, f1, type = 0.5, v = 0.15, echo = true) {
  const o = A.createOscillator(); if (waves[type]) o.setPeriodicWave(waves[type]); else o.type = type;
  o.frequency.setValueAtTime(f0, t0); o.frequency.exponentialRampToValueAtTime(f1, t0 + len);
  const g = A.createGain(); g.gain.setValueAtTime(v, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + len);
  o.connect(g); g.connect(sfxBus); if (echo) g.connect(echoIn); o.start(t0); o.stop(t0 + len + 0.05);
}
// a held hum (a beam): returns a stop function
export function hum(f0 = 110, v = 0.12) {
  if (!A) return () => {};
  const t = A.currentTime;
  const o1 = A.createOscillator(); o1.setPeriodicWave(waves[0.25]); o1.frequency.value = f0;
  const o2 = A.createOscillator(); o2.type = 'sawtooth'; o2.frequency.value = f0 * 1.505;
  const lfo = A.createOscillator(), lg = A.createGain(); lfo.frequency.value = 13; lg.gain.value = f0 * 0.05; lfo.connect(lg); lg.connect(o1.frequency); lg.connect(o2.frequency);
  const g = A.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.08);
  const n = A.createBufferSource(); n.buffer = noiseBuf; n.loop = true;
  const nf = A.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = 1800; const ng = A.createGain(); ng.gain.value = v * 0.9;
  n.connect(nf); nf.connect(ng); ng.connect(g);
  o1.connect(g); o2.connect(g); g.connect(sfxBus);
  for (const s of [o1, o2, lfo, n]) s.start(t);
  return () => { const e = A.currentTime; g.gain.cancelScheduledValues(e); g.gain.setValueAtTime(g.gain.value, e); g.gain.linearRampToValueAtTime(0.0001, e + 0.15); for (const s of [o1, o2, lfo, n]) s.stop(e + 0.2); };
}
export function sfx(name) {
  if (!A) return;
  const t = A.currentTime + 0.01;
  switch (name) {
    case 'cursor': blip([88], 0.125, 0.08, 0.03); break;
    case 'ok': blip([81, 88], 0.5, 0.1, 0.04); break;
    case 'cancel': blip([76, 69], 0.5, 0.09, 0.04); break;
    case 'buzz': blip([45, 45], 0.5, 0.1, 0.08); break;
    case 'text': blip([93], 0.125, 0.025, 0.015); break;
    case 'card': noise(t, 0.06, 5000, 2500, 0.18, 'highpass'); break;
    case 'flip': noise(t, 0.05, 3000, 6000, 0.2, 'highpass'); blip([84, 91], 0.25, 0.06, 0.03); break;
    case 'first': blip([79, 86, 91], 0.25, 0.1, 0.05, true); break;
    case 'step': noise(t, 0.04, 900, 400, 0.12); sweep(t, 0.05, 300, 500, 0.5, 0.05, false); break;
    case 'punch': noise(t, 0.08, 2200, 500, 0.5); sweep(t, 0.07, 220, 70, 'triangle', 0.35, false); break;
    case 'kick': noise(t, 0.12, 1500, 250, 0.55); sweep(t, 0.1, 160, 50, 'triangle', 0.4, false); break;
    case 'whoosh': noise(t, 0.16, 800, 4000, 0.18, 'bandpass', 2); break;
    case 'guard': sweep(t, 0.1, 900, 600, 0.125, 0.12); noise(t, 0.08, 3000, 1500, 0.25); break;
    case 'dodge': sweep(t, 0.14, 500, 1800, 0.125, 0.08); noise(t, 0.12, 2000, 6000, 0.12, 'highpass'); break;
    case 'charge': sweep(t, 0.6, 120, 900, 0.25, 0.1); noise(t, 0.6, 400, 3000, 0.12); break;
    case 'blast': sweep(t, 0.3, 900, 200, 0.25, 0.16); noise(t, 0.3, 4000, 600, 0.3); break;
    case 'boom': noise(t, 0.8, 1400, 40, 0.75, 'lowpass'); sweep(t, 0.6, 140, 30, 'triangle', 0.45, false); break;
    case 'bigboom': noise(t, 1.4, 1800, 30, 0.9, 'lowpass'); sweep(t, 1.2, 160, 25, 'triangle', 0.55, false); noise(t + 0.1, 0.8, 5000, 300, 0.3); break;
    case 'clash': for (let i = 0; i < 3; i++) noise(t + i * 0.07, 0.1, 3500, 900, 0.35); sweep(t, 0.3, 1200, 300, 0.125, 0.12); break;
    case 'push': noise(t, 0.05, 1200, 2400, 0.14); break;
    case 'hurt': noise(t, 0.18, 1300, 150, 0.45); sweep(t, 0.16, 260, 60, 'triangle', 0.3, false); break;
    case 'ko': sweep(t, 0.6, 600, 60, 0.5, 0.18); noise(t, 0.5, 1200, 80, 0.4); break;
    case 'power': blip([60, 64, 67, 72, 76, 79, 84], 0.25, 0.09, 0.05, true); break;
    case 'heal': blip([79, 84, 88, 91, 96], 'sine', 0.12, 0.06, true); break;
    case 'buff': blip([72, 79, 84, 91], 0.25, 0.08, 0.05, true); break;
    case 'gold': sweep(t, 1.2, 80, 1600, 0.25, 0.14); noise(t, 1.4, 300, 6000, 0.3); blip([72, 76, 79, 84, 88, 91, 96, 100], 0.5, 0.08, 0.08, true); break;
    case 'thunder': noise(t, 0.5, 4000, 300, 0.6); sweep(t, 0.4, 1600, 80, 0.125, 0.16); break;
    case 'encounter': sweep(t, 0.3, 200, 1800, 0.25, 0.12); sweep(t + 0.1, 0.3, 300, 2600, 0.5, 0.08); noise(t, 0.35, 500, 5000, 0.2); break;
    case 'run': sweep(t, 0.3, 800, 200, 0.25, 0.1); break;
    case 'chest': blip([72, 76, 79, 84, 0, 91], 0.5, 0.1, 0.06, true); break;
    case 'save': blip([84, 88, 91, 96, 91, 96], 'sine', 0.12, 0.08, true); break;
    case 'warp': sweep(t, 0.6, 200, 2000, 0.125, 0.1); sweep(t + 0.15, 0.5, 300, 3000, 0.25, 0.07); break;
    case 'quake': noise(t, 0.9, 300, 40, 0.8, 'lowpass'); sweep(t, 0.7, 80, 30, 'triangle', 0.5, false); break;
    case 'level': blip([72, 76, 79, 84, 79, 84, 88, 91], 0.5, 0.1, 0.07, true); break;
  }
}

// the music switch: the button, the M key and the saved choice
const MKEY = 'starfist-music';
try { music.on = localStorage.getItem(MKEY) !== 'off'; } catch (e) { /* private mode */ }
export function setMusic(on) {
  music.on = on; setVolumes();
  try { localStorage.setItem(MKEY, on ? 'on' : 'off'); } catch (e) { /* private mode */ }
  const b = document.getElementById('musicBtn'); if (b) b.classList.toggle('off', !on);
}
if (typeof document !== 'undefined') {
  const b = document.getElementById('musicBtn');
  if (b) { b.classList.toggle('off', !music.on); b.addEventListener('click', (e) => { e.stopPropagation(); initAudio(); setMusic(!music.on); }); }
  addEventListener('keydown', (e) => { if (e.code === 'KeyM' && !e.repeat) setMusic(!music.on); });
}

// wake the sound on every tap, click or key (capture, so on-screen pads that stop the click still count),
// rest it while the page is hidden and bring it back after the lock screen, a call or another app
if (typeof document !== 'undefined') {
  for (const ev of ['touchend', 'click', 'keydown']) addEventListener(ev, () => initAudio(), true);
  const rest = () => {
    if (document.hidden) { if (el) el.pause(); if (A && A.state === 'running') { try { A.suspend(); } catch (e) { /* ignore */ } } return; }
    if (!gestured) return;
    if (A && A.state !== 'running') resumeCtx();
    if (el && el.paused && !el.ended) tryPlay(el).catch(() => {});
  };
  document.addEventListener('visibilitychange', rest); addEventListener('pageshow', rest); addEventListener('focus', rest);
  // iOS 17+: play the game's music even when the ring/silent switch is on silent
  try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* older iOS */ }
}
