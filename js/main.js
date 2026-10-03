import * as THREE from 'three';
import { CONFIG } from './config.js';
import { loadData, imageUrl, esc } from './data.js';

const canvas = document.getElementById('stage');
const card = document.getElementById('hover-card');
const wipe = document.getElementById('wipe');
const loader = document.getElementById('loader');

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
scene.background = new THREE.Color('#0b0b0d');
scene.fog = new THREE.Fog('#0b0b0d', 9, 22);
const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
const CAM_Z = 11;
camera.position.set(0, 0, CAM_Z);

scene.add(new THREE.AmbientLight('#ffffff', 1.1));
const key = new THREE.DirectionalLight('#ffffff', 1.6);
key.position.set(4, 6, 8);
scene.add(key);
const rim = new THREE.DirectionalLight('#7ee0d0', 0.6);
rim.position.set(-6, -3, -4);
scene.add(rim);

const world = new THREE.Group();
scene.add(world);

// ---------- 텍스처 ----------
function shade(hex, amt) {
  const c = new THREE.Color(hex);
  const hsl = {}; c.getHSL(hsl);
  c.setHSL(hsl.h, hsl.s, Math.max(0, Math.min(1, hsl.l + amt)));
  return '#' + c.getHexString();
}
function faceTexture(cell, idx, kind) {
  const s = 512, cv = document.createElement('canvas');
  cv.width = cv.height = s;
  const g = cv.getContext('2d');
  const base = cell.color || '#7ee0d0';
  g.fillStyle = kind === 'front' ? base : kind === 'top' ? shade(base, 0.08) : shade(base, -0.18);
  g.fillRect(0, 0, s, s);
  // 미세 격자
  g.strokeStyle = 'rgba(0,0,0,.08)'; g.lineWidth = 1;
  for (let i = 32; i < s; i += 32) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, s); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(s, i); g.stroke(); }
  g.strokeStyle = 'rgba(0,0,0,.55)'; g.lineWidth = 6; g.strokeRect(3, 3, s - 6, s - 6);
  g.fillStyle = '#0b0b0d';
  if (kind === 'front') {
    g.font = '800 150px Pretendard, sans-serif';
    g.fillText(String(idx + 1).padStart(3, '0'), 36, 170);
    g.font = '700 38px Pretendard, sans-serif';
    const t = (cell.title || '').replace(/^CELL\s*\d+\s*·\s*/i, '');
    wrap(g, t, 36, 360, s - 72, 46, 2);
    g.font = '500 24px Pretendard, sans-serif';
    g.fillText((cell.artist || '').slice(0, 30), 36, 470);
  } else {
    g.font = '700 28px Pretendard, sans-serif';
    g.fillText('THE CELL', 36, 70);
    g.font = '500 22px Pretendard, sans-serif';
    g.fillText(cell.period || '', 36, s - 40);
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}
function wrap(g, text, x, y, maxW, lh, maxLines) {
  const chars = [...text]; let line = '', lines = 0;
  for (const ch of chars) {
    if (g.measureText(line + ch).width > maxW) { g.fillText(line, x, y); y += lh; line = ch; if (++lines >= maxLines - 1) break; }
    else line += ch;
  }
  g.fillText(line, x, y);
}

// ---------- 큐브 생성 ----------
const cubes = [];
const geo = new THREE.BoxGeometry(1, 1, 1);
const edgeGeo = new THREE.EdgesGeometry(geo);

function makeCube(cell, idx) {
  const open = cell.status === 'open';
  let mesh;
  if (open) {
    const mat = (k) => new THREE.MeshStandardMaterial({ map: faceTexture(cell, idx, k), roughness: 0.55, metalness: 0.05 });
    const side = mat('side'), top = mat('top');
    const front = mat('front');
    // BoxGeometry 면 순서: +x, -x, +y, -y, +z, -z
    mesh = new THREE.Mesh(geo, [side, side, top, side, front, side]);
    if (cell.thumbnail) {
      new THREE.TextureLoader().setCrossOrigin('anonymous').load(imageUrl(cell.thumbnail, 800), (t) => {
        t.colorSpace = THREE.SRGBColorSpace; front.map = t; front.needsUpdate = true;
      });
    }
  } else {
    mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: cell.color || '#444', transparent: true, opacity: 0.08, roughness: 1 }));
  }
  const edges = new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({ color: open ? '#0b0b0d' : (cell.color || '#888'), transparent: true, opacity: open ? 0.4 : 0.55 }));
  mesh.add(edges);
  mesh.userData = { cell, idx, open, home: new THREE.Vector3(), phase: Math.random() * Math.PI * 2, hover: 0 };
  return mesh;
}

function layout() {
  const n = cubes.length;
  const aspect = innerWidth / innerHeight;
  const cols = aspect > 1.3 ? 4 : aspect > 0.8 ? 3 : 2;
  const rows = Math.ceil(n / cols);
  const gap = 1.75;
  cubes.forEach((m, i) => {
    const c = i % cols, r = Math.floor(i / cols);
    m.userData.home.set((c - (cols - 1) / 2) * gap, -(r - (rows - 1) / 2) * gap, ((c + r) % 2 ? -0.35 : 0.35));
  });
  const h = rows * gap + 1;
  const fitZ = (h / 2) / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) + 1;
  const fitZw = ((cols * gap + 1) / 2) / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) / aspect + 1;
  state.baseZ = Math.max(CAM_Z * 0.8, fitZ, fitZw);
}

// ---------- 상태 / 인터랙션 ----------
const state = { baseZ: CAM_Z, zoom: 0, rotX: 0, rotY: 0, tRotX: -0.12, tRotY: 0.25, mx: 0, my: 0, dragging: false, moved: 0, hovered: null, entering: null, t0: performance.now() };
const ray = new THREE.Raycaster();
const ptr = new THREE.Vector2(-9, -9);

canvas.addEventListener('pointerdown', (e) => { state.dragging = true; state.moved = 0; state.px = e.clientX; state.py = e.clientY; canvas.setPointerCapture(e.pointerId); });
canvas.addEventListener('pointermove', (e) => {
  ptr.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  state.mx = ptr.x; state.my = ptr.y;
  if (state.dragging) {
    const dx = e.clientX - state.px, dy = e.clientY - state.py;
    state.moved += Math.abs(dx) + Math.abs(dy);
    state.tRotY += dx * 0.005; state.tRotX += dy * 0.004;
    state.tRotX = Math.max(-0.8, Math.min(0.8, state.tRotX));
    state.px = e.clientX; state.py = e.clientY;
  }
  card.style.transform = `translate(${e.clientX + 18}px, ${e.clientY + 18}px)`;
});
canvas.addEventListener('pointerup', (e) => {
  state.dragging = false;
  if (state.moved < 6) {
    ptr.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    const hit = pick();
    if (hit && hit.userData.open) enter(hit);
  }
});
canvas.addEventListener('pointerleave', () => { ptr.set(-9, -9); });
canvas.addEventListener('wheel', (e) => { state.zoom = Math.max(-4, Math.min(5, state.zoom + e.deltaY * 0.004)); }, { passive: true });

function pick() {
  ray.setFromCamera(ptr, camera);
  const hits = ray.intersectObjects(cubes, false);
  return hits.length ? hits[0].object : null;
}

function setHover(m) {
  if (state.hovered === m) return;
  state.hovered = m;
  canvas.style.cursor = m && m.userData.open ? 'pointer' : 'grab';
  if (m) {
    const c = m.userData.cell;
    card.querySelector('.hc-no').textContent = 'CELL ' + String(m.userData.idx + 1).padStart(3, '0');
    card.querySelector('.hc-title').textContent = m.userData.open ? c.title.replace(/^CELL\s*\d+\s*·\s*/i, '') : 'Coming soon';
    card.querySelector('.hc-sub').textContent = m.userData.open ? (c.subtitle || '') : '';
    card.querySelector('.hc-meta').textContent = [c.artist, c.period].filter(Boolean).join(' · ');
    card.style.setProperty('--accent', c.color || '#7ee0d0');
    card.classList.add('on');
  } else card.classList.remove('on');
}

function enter(m) {
  if (state.entering) return;
  state.entering = { m, t: performance.now() };
  card.classList.remove('on');
  wipe.style.background = m.userData.cell.color || '#7ee0d0';
  setTimeout(() => wipe.classList.add('on'), 650);
  setTimeout(() => { location.href = `cell.html?id=${encodeURIComponent(m.userData.cell.id)}`; }, 1150);
}
export function openById(id) { const m = cubes.find((c) => c.userData.cell.id === id); if (m) enter(m); }

// ---------- 루프 ----------
const tmpV = new THREE.Vector3();
function tick(now) {
  const t = (now - state.t0) / 1000;
  if (!state.dragging && !state.entering) state.tRotY += 0.0006;
  state.rotX += (state.tRotX + state.my * 0.08 - state.rotX) * 0.06;
  state.rotY += (state.tRotY + state.mx * 0.12 - state.rotY) * 0.06;
  world.rotation.set(state.rotX, state.rotY, 0);

  if (!state.entering) setHover(pick());

  cubes.forEach((m, i) => {
    const u = m.userData;
    const intro = Math.min(1, Math.max(0, (t - i * 0.06) / 1.1));
    const e = 1 - Math.pow(1 - intro, 3);
    const isH = state.hovered === m && u.open;
    u.hover += ((isH ? 1 : 0) - u.hover) * 0.12;
    const fz = Math.sin(t * 0.9 + u.phase) * 0.08;
    m.position.set(u.home.x, u.home.y + fz, u.home.z - (1 - e) * 14 + u.hover * 0.8);
    m.rotation.x = Math.sin(t * 0.4 + u.phase) * 0.15 * (1 - u.hover) + (1 - e) * 2;
    m.rotation.y = Math.cos(t * 0.35 + u.phase) * 0.25 * (1 - u.hover) - world.rotation.y * u.hover;
    const s = (0.15 + 0.85 * e) * (1 + u.hover * 0.12);
    m.scale.setScalar(s);
    const dim = state.hovered && state.hovered !== m && state.hovered.userData.open ? 0.35 : 1;
    if (Array.isArray(m.material)) m.material.forEach((mt) => { mt.emissive?.setScalar(0); mt.color.setScalar(THREE.MathUtils.lerp(mt.color.r, dim, 0.1)); });
  });

  if (state.entering) {
    const m = state.entering.m;
    const k = Math.min(1, (now - state.entering.t) / 1000);
    const e = k * k * (3 - 2 * k);
    m.getWorldPosition(tmpV);
    camera.position.lerp(tmpV.clone().add(new THREE.Vector3(0, 0, 1.6)), e * 0.18);
    camera.lookAt(tmpV);
    m.rotation.set(0, -world.rotation.y, 0);
  } else {
    camera.position.x += (state.mx * 0.4 - camera.position.x) * 0.05;
    camera.position.y += (state.my * 0.3 - camera.position.y) * 0.05;
    camera.position.z += (state.baseZ + state.zoom - camera.position.z) * 0.08;
    camera.lookAt(0, 0, 0);
  }
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

function resize() {
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  layout();
}
addEventListener('resize', resize);
addEventListener('pageshow', (e) => { if (e.persisted) location.reload(); });

// ---------- 패널 ----------
function bindPanel(btnId, panelId) {
  const btn = document.getElementById(btnId), panel = document.getElementById(panelId);
  btn.addEventListener('click', () => {
    const open = panel.hidden;
    document.querySelectorAll('.panel').forEach((p) => (p.hidden = true));
    document.querySelectorAll('.nav-btn').forEach((b) => b.setAttribute('aria-expanded', 'false'));
    panel.hidden = !open; btn.setAttribute('aria-expanded', String(open));
  });
  panel.addEventListener('click', (e) => { if (e.target === panel) panel.hidden = true; });
}
bindPanel('btn-index', 'index-panel');
bindPanel('btn-about', 'about-panel');
addEventListener('keydown', (e) => { if (e.key === 'Escape') document.querySelectorAll('.panel').forEach((p) => (p.hidden = true)); });

// ---------- 시작 ----------
(async () => {
  const { cells, source } = await loadData();
  document.body.dataset.source = source;
  const list = [...cells];
  while (list.length < CONFIG.minCubes) list.push({ id: '_empty' + list.length, status: 'empty', color: '#3a3a40', title: '' });
  await document.fonts.ready.catch(() => {});
  list.forEach((c, i) => { const m = makeCube(c, i); cubes.push(m); world.add(m); });

  document.getElementById('cell-list').innerHTML = cells.map((c, i) => `
    <li class="${c.status === 'open' ? '' : 'is-coming'}" style="--accent:${esc(c.color || '#7ee0d0')}">
      ${c.status === 'open' ? `<a href="cell.html?id=${encodeURIComponent(c.id)}">` : '<div>'}
        <span class="no">${String(i + 1).padStart(3, '0')}</span>
        <span class="t">${esc(c.title.replace(/^CELL\s*\d+\s*·\s*/i, '') || 'Coming soon')}</span>
        <span class="m">${esc([c.artist, c.period].filter(Boolean).join(' · '))}</span>
      ${c.status === 'open' ? '</a>' : '</div>'}
    </li>`).join('');

  resize();
  state.t0 = performance.now();
  loader.classList.add('done');
  requestAnimationFrame(tick);
})();
