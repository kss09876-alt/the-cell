import { CONFIG } from './config.js';

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
  } catch (e) {
    console.warn('[THE CELL] 드라이브 시트를 읽지 못해 백업 데이터를 사용합니다:', e.message);
    const fb = await (await fetch(CONFIG.fallbackUrl)).json();
    cells = fb.cells; blocks = fb.blocks; source = 'fallback';
  }
  cells = cells
    .filter((c) => c.id && c.status !== 'hidden')
    .sort((a, b) => Number(a.order) - Number(b.order));
  blocks = blocks.filter((b) => b.cell_id).sort((a, b) => Number(a.order) - Number(b.order));
  cache = { cells, blocks, source };
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
