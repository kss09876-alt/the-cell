// XPACE 다국어: 한국어(기본) · English · 简体中文 · 日本語
// 언어 결정 순서: 주소의 ?lang= → 지난번 선택(localStorage) → 브라우저 언어 → 한국어
import { DICT } from './i18n-dict.js?v=1';

export const LANGS = [
  { id: 'ko', short: 'KO', name: '한국어' },
  { id: 'en', short: 'EN', name: 'English' },
  { id: 'zh', short: '中文', name: '简体中文' },
  { id: 'ja', short: '日本語', name: '日本語' },
];
const ok = (l) => LANGS.some((x) => x.id === l);
export const lang = (() => {
  const q = new URLSearchParams(location.search).get('lang');
  if (ok(q)) { try { localStorage.setItem('xpace-lang', q); } catch (e) {} return q; }
  try { const s = localStorage.getItem('xpace-lang'); if (ok(s)) return s; } catch (e) {}
  const n = (navigator.language || 'ko').slice(0, 2).toLowerCase();
  return ok(n) ? n : 'ko';
})();
document.documentElement.lang = lang === 'zh' ? 'zh-Hans' : lang;
document.documentElement.dataset.lang = lang;

// 중국어·일본어 글꼴 (Pretendard에 없는 글자를 위해)
if (lang === 'zh' || lang === 'ja') {
  const l = document.createElement('link'); l.rel = 'stylesheet';
  l.href = lang === 'zh' ? 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;700;900&display=swap' : 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;700;900&display=swap';
  document.head.appendChild(l);
}

// 한국어 문장을 그대로 키로 쓰는 번역: 번역이 없으면 한국어를 그대로 보여줌
export function tr(ko, vars) {
  let s = (lang !== 'ko' && DICT[lang] && DICT[lang][ko]) || ko;
  if (vars) Object.entries(vars).forEach(([k, v]) => { s = s.split(`{${k}}`).join(v); });
  return s;
}
// 데이터 행에서 언어별 칸(title_en 등)을 우선 사용
export function pick(row, field) {
  if (!row) return '';
  if (lang !== 'ko') { const v = row[`${field}_${lang}`]; if (v != null && String(v).trim() !== '') return v; }
  return row[field] ?? '';
}

export function setLang(l) {
  try { localStorage.setItem('xpace-lang', l); } catch (e) {}
  const u = new URL(location.href); u.searchParams.delete('lang');
  location.href = u.pathname + u.search + u.hash;
}

// 상단 언어 선택: <div class="lang-sw"> 버튼 + 펼침 목록
export function langSwitcher(container, opts = {}) {
  const box = document.createElement('div'); box.className = 'lang-sw' + (opts.cls ? ' ' + opts.cls : '');
  const cur = LANGS.find((x) => x.id === lang);
  box.innerHTML = `<button class="lang-btn" aria-haspopup="true" aria-expanded="false" title="Language">${cur.short}</button>
    <ul class="lang-list" hidden>${LANGS.map((x) => `<li><button data-l="${x.id}" class="${x.id === lang ? 'on' : ''}">${x.name}</button></li>`).join('')}</ul>`;
  const btn = box.querySelector('.lang-btn'), list = box.querySelector('.lang-list');
  btn.addEventListener('click', (e) => { e.stopPropagation(); list.hidden = !list.hidden; btn.setAttribute('aria-expanded', String(!list.hidden)); });
  list.addEventListener('click', (e) => { const b = e.target.closest('[data-l]'); if (b && b.dataset.l !== lang) setLang(b.dataset.l); else list.hidden = true; });
  document.addEventListener('click', () => { list.hidden = true; btn.setAttribute('aria-expanded', 'false'); });
  if (opts.before) container.insertBefore(box, opts.before); else container.appendChild(box);
  return box;
}
