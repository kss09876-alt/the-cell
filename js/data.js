import { CONFIG } from './config.js?v=14';
import { lang, tr } from './i18n.js?v=1';

// 공개 구글 시트를 gviz JSON 엔드포인트로 읽어 [{col: value}] 배열로 변환
async function fetchSheet(id) {
  const url = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:json&headers=1&t=${Date.now()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('sheet ' + res.status);
  const txt = await res.text();
  const json = JSON.parse(txt.slice(txt.indexOf('{'), txt.lastIndexOf('}') + 1));
  if (json.status === 'error') throw new Error('sheet error');
  const cols = json.table.cols.map((c) => (c.label || c.id || '').trim());
  return json.table.rows.map((r) =>
    Object.fromEntries(cols.map((c, i) => {
      const cell = r.c[i];
      const v = cell ? (cell.v ?? cell.f ?? '') : '';
      return [c, String(v).trim()];
    }))
  );
}

let cache;
export async function loadData() {
  if (cache) return cache;
  let cells, blocks, source = 'drive';
  try {
    [cells, blocks] = await Promise.all([fetchSheet(CONFIG.cellsSheetId), fetchSheet(CONFIG.blocksSheetId)]);
    if (!cells.length || !('id' in cells[0])) throw new Error('empty');
    // 시트에 아직 블록이 입력되지 않은 전시는 저장소의 백업 데이터로 채움 (새 전시 미리 공개용)
    try {
      const fb = await (await fetch(CONFIG.fallbackUrl)).json();
      const has = new Set(blocks.map((b) => b.cell_id));
      fb.cells.forEach((fc) => {
        if (has.has(fc.id)) return;
        const fbBlocks = fb.blocks.filter((b) => b.cell_id === fc.id);
        if (!fbBlocks.length) return;
        const i = cells.findIndex((c) => c.id === fc.id);
        if (i >= 0) cells[i] = { ...cells[i], ...fc }; else cells.push(fc);
        blocks = blocks.concat(fbBlocks);
      });
    } catch (e2) {}
  } catch (e) {
    console.warn('[THE CELL] 드라이브 시트를 읽지 못해 백업 데이터를 사용합니다:', e.message);
    const fb = await (await fetch(CONFIG.fallbackUrl)).json();
    cells = fb.cells; blocks = fb.blocks; source = 'fallback';
  }
  cells = cells
    .filter((c) => c.id && c.status !== 'hidden')
    .sort((a, b) => Number(a.order) - Number(b.order));
  blocks = blocks.filter((b) => b.cell_id).sort((a, b) => Number(a.order) - Number(b.order));
  // 다국어: 시트의 title_en 같은 칸 → data/i18n.json → 한국어 원문 순서로 사용
  if (lang !== 'ko') {
    let tx = { cells: {}, blocks: {} };
    try { tx = await (await fetch('data/i18n.json?v=1')).json(); } catch (e) {}
    const loc = (row, fields, t) => { const o = { ...row }; fields.forEach((f) => { const own = row[`${f}_${lang}`]; o[f] = own != null && String(own).trim() !== '' ? own : (t && t[f]) || row[f]; }); return o; };
    cells = cells.map((c) => loc(c, ['title', 'subtitle', 'artist', 'period'], tx.cells?.[c.id]?.[lang]));
    blocks = blocks.map((b) => loc(b, ['title', 'body', 'caption'], tx.blocks?.[`${b.cell_id}:${b.order}`]?.[lang]));
  }
  // 기획전 묶기: 멤버 전시는 행성 목록에서 빠지고, 첫 멤버 자리에 기획전 행성이 들어감
  const all = cells.slice(), top = [];
  const groups = (CONFIG.groups || []).map((g) => ({ ...g, title: tr(g.title), subtitle: tr(g.subtitle), artist: tr(g.artist), status: 'open', isGroup: true, rooms: [] }));
  cells.forEach((c) => {
    const g = groups.find((x) => x.members.includes(c.id));
    if (!g) { top.push(c); return; }
    if (!g.rooms.length) top.push(g);
    g.rooms.push(c);
  });
  groups.forEach((g) => g.rooms.sort((a, b) => g.members.indexOf(a.id) - g.members.indexOf(b.id)));
  // 번호 다시 매기기 (X-001, X-002 …)
  top.forEach((c, i) => {
    const code = 'X-' + String(i + 1).padStart(3, '0');
    c.code = code;
    const name = String(c.title || '').replace(/^\s*(?:CELL|X)[-\s]?\d+\s*[·:|-]\s*/i, '');
    c.title = `${code} · ${name}`;
    if (c.isGroup) g_rooms(c, code);
  });
  function g_rooms(g, code) {
    g.rooms.forEach((r, k) => {
      r.group = g; r.room = k + 1; r.code = `${code}-${k + 1}`;
      r.short = String(r.title || '').replace(/^\s*(?:CELL|X)[-\s]?\d+\s*[·:|-]\s*/i, '');
      r.title = `${g.title} · ROOM ${String(k + 1).padStart(2, '0')} — ${r.short}`;
    });
  }
  cache = { cells: top, all, groups, blocks, source };
  return cache;
}

// 드라이브 파일 ID / 공유 링크 / 일반 URL → 이미지 URL
export function driveId(v) {
  if (!v) return '';
  const m = String(v).match(/\/d\/([\w-]{20,})/) || String(v).match(/[?&]id=([\w-]{20,})/);
  if (m) return m[1];
  if (/^[\w-]{20,}$/.test(v)) return v;
  return '';
}
export function imageUrl(v, w = 2000) {
  if (!v) return '';
  const id = driveId(v);
  if (id) return `https://lh3.googleusercontent.com/d/${id}=w${w}`;
  return v;
}
export function videoEmbed(v) {
  if (!v) return '';
  const yt = String(v).match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?rel=0`;
  const vm = String(v).match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  const id = driveId(v);
  if (id) return `https://drive.google.com/file/d/${id}/preview`;
  return v;
}
export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
export function paras(s) {
  return String(s ?? '').split(/\n+/).filter(Boolean).map((p) => `<p>${esc(p)}</p>`).join('');
}
