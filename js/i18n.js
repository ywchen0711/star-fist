// Language: Traditional Chinese (Taiwan) or English. Text is written as L('中文', 'English'),
// and data tables keep [zh, en] pairs read through tn().
const KEY = 'starfist-lang';
function initial() {
  try { const v = localStorage.getItem(KEY); if (v === 'zh' || v === 'en') return v; } catch (e) { /* no storage */ }
  try { return /^zh/i.test(navigator.language) ? 'zh' : 'en'; } catch (e) { return 'en'; }
}
export let LANG = initial();
export function setLang(l) {
  LANG = l;
  try { localStorage.setItem(KEY, l); } catch (e) { /* private mode */ }
  try { document.documentElement.lang = l === 'en' ? 'en' : 'zh-Hant'; const mb = document.getElementById('menuBtn'); if (mb) mb.textContent = l === 'en' ? 'MENU' : '選單'; } catch (e) { /* node */ }
}
export const isEn = () => LANG === 'en';
export const L = (zh, en) => (LANG === 'en' ? en : zh);
export const tn = (v) => (Array.isArray(v) ? (LANG === 'en' ? v[1] : v[0]) : v);
// thousands separators for power levels
export const num = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
