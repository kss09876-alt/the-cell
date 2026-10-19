// XPACE — 메인: 중앙의 X를 도는 전시 행성계
import * as THREE from 'three';
import { loadData, imageUrl, esc } from './data.js?v=12';

const canvas = document.getElementById('stage');
const card = document.getElementById('hover-card');
const wipe = document.getElementById('wipe');
const loader = document.getElementById('loader');
const labelsEl = document.getElementById('labels');

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
scene.background = new THREE.Color('#05060b');
const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 400);

scene.add(new THREE.AmbientLight('#8090b0', 0.35));
const sun = new THREE.PointLight('#fff4e0', 3.2, 0, 0); // 감쇠 없음
scene.add(sun);

const world = new THREE.Group();
scene.add(world);

const shortTitle = (t = '') => t.replace(/^(CELL|X)\s*-?\s*\d+\s*·\s*/i, '');
const code = (i) => 'X-' + String(i + 1).padStart(3, '0');

// ---------- 공통 텍스처 ----------
function canvasTex(w, h, draw) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  draw(cv.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
function glow(color = '#ffffff', a = 0.9) {
  const c = new THREE.Color(color);
  const rgb = `${(c.r * 255) | 0},${(c.g * 255) | 0},${(c.b * 255) | 0}`;
  return canvasTex(256, 256, (g) => {
    const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grd.addColorStop(0, `rgba(${rgb},${a})`); grd.addColorStop(0.3, `rgba(${rgb},${a * 0.3})`); grd.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = grd; g.fillRect(0, 0, 256, 256);
  });
}
function sprite(tex, scale, opacity = 1, rotation = 0) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity, rotation }));
  s.scale.set(scale[0], scale[1], 1);
  return s;
}
function shade(hex, l, a = 1) {
  const c = new THREE.Color(hex), hsl = {}; c.getHSL(hsl);
  return `hsla(${hsl.h * 360},${hsl.s * 100}%,${Math.max(0, Math.min(100, (hsl.l + l) * 100))}%,${a})`;
}
// 행성 표면 (등장방형 512x256)
function planetTexture(cell, kind) {
  const base = cell.color || '#7ee0d0';
  return canvasTex(512, 256, (g, w, h) => {
    let seed = [...(cell.id || 'x')].reduce((a, ch) => a + ch.charCodeAt(0), 0);
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    if (kind === 'rice') { // 빛쌀: 어둠 위에 흩어진 흰 쌀알
      g.fillStyle = '#16120d'; g.fillRect(0, 0, w, h);
      const gl = g.createLinearGradient(0, 0, 0, h); gl.addColorStop(0, 'rgba(255,246,228,.85)'); gl.addColorStop(0.45, 'rgba(255,246,228,.25)'); gl.addColorStop(1, 'rgba(20,16,12,0)');
      g.fillStyle = gl; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 900; i++) { const x = rnd() * w, y = Math.pow(rnd(), 1.6) * h; g.save(); g.translate(x, y); g.rotate(rnd() * 6.28); g.fillStyle = `rgba(255,252,240,${0.5 + rnd() * 0.5})`; g.beginPath(); g.ellipse(0, 0, 3, 1.3, 0, 0, 6.283); g.fill(); g.restore(); }
      return;
    }
    if (kind === 'stars') {
      g.fillStyle = '#0a1030'; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 6; i++) { const x = rnd() * w, y = rnd() * h, r = 40 + rnd() * 90; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `hsla(${220 + rnd() * 60},80%,60%,.45)`); gr.addColorStop(1, 'hsla(240,80%,40%,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
      for (let i = 0; i < 700; i++) { g.fillStyle = `rgba(230,238,255,${0.3 + rnd() * 0.7})`; const s = rnd() < 0.05 ? 2 : 1; g.fillRect(rnd() * w, rnd() * h, s, s); }
      return;
    }
    // 가스 행성처럼 띠를 두른 표면
    for (let y = 0; y < h; y++) {
      const v = Math.sin(y * 0.09 + Math.sin(y * 0.021) * 3) * 0.08 + Math.sin(y * 0.33) * 0.03;
      g.fillStyle = shade(base, v - 0.05); g.fillRect(0, y, w, 1);
    }
    for (let i = 0; i < 40; i++) { // 소용돌이
      const x = rnd() * w, y = rnd() * h, rw = 20 + rnd() * 70, rh = 3 + rnd() * 8;
      g.fillStyle = shade(base, (rnd() - 0.5) * 0.25, 0.5);
      g.beginPath(); g.ellipse(x, y, rw, rh, 0, 0, 6.283); g.fill();
    }
    if (kind === 'ripple') {
      g.strokeStyle = 'rgba(255,230,225,.35)'; g.lineWidth = 2;
      for (let k = 1; k < 9; k++) { g.beginPath(); g.ellipse(w * 0.3, h * 0.5, k * 22, k * 11, 0, 0, 6.283); g.stroke(); }
    }
    if (kind === 'coming') { g.fillStyle = 'rgba(5,6,11,.55)'; g.fillRect(0, 0, w, h); }
  });
}

// ---------- 배경 별 ----------
(() => {
  const n = 2500, pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const r = 80 + Math.random() * 60, th = Math.random() * 6.283, ph = Math.acos(2 * Math.random() - 1);
    pos.set([r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th)], i * 3);
    const c = new THREE.Color().setHSL(Math.random() < 0.2 ? 0.6 : 0.1, 0.4, 0.75 + Math.random() * 0.25);
    col.set([c.r, c.g, c.b], i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.45, vertexColors: true, transparent: true, opacity: 0.9, map: glow('#ffffff', 1), depthWrite: false, blending: THREE.AdditiveBlending })));
})();

// ---------- 중앙의 X ----------
const core = new THREE.Group();
world.add(core);
core.add(new THREE.Mesh(new THREE.SphereGeometry(0.75, 48, 48), new THREE.MeshBasicMaterial({ color: '#fff6e6' })));
core.add(sprite(glow('#ffd9a0', 1), [6, 6], 0.9));
core.add(sprite(glow('#9db8ff', 0.8), [11, 11], 0.35));
const armTex = canvasTex(512, 32, (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, w, 0);
  gr.addColorStop(0, 'rgba(255,240,220,0)'); gr.addColorStop(0.5, 'rgba(255,248,235,1)'); gr.addColorStop(1, 'rgba(255,240,220,0)');
  g.fillStyle = gr; g.fillRect(0, h * 0.35, w, h * 0.3);
});
const arms = [sprite(armTex, [9, 0.55], 0.95, Math.PI / 4), sprite(armTex, [9, 0.55], 0.95, -Math.PI / 4)];
arms.forEach((a) => core.add(a));

// ---------- 행성 ----------
const planets = [];
const sphereGeo = new THREE.SphereGeometry(1, 64, 48);

function orbitLine(r, color) {
  const pts = []; for (let i = 0; i <= 160; i++) { const a = (i / 160) * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r)); }
  return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.16 }));
}
function ringMesh(inner, outer) {
  const geo = new THREE.RingGeometry(inner, outer, 128, 1);
  const pos = geo.attributes.position, uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) { const d = Math.hypot(pos.getX(i), pos.getY(i)); uv.setXY(i, (d - inner) / (outer - inner), 0.5); }
  const tex = canvasTex(256, 4, (g, w) => {
    for (let x = 0; x < w; x++) { const k = x / w; const a = (0.25 + 0.5 * Math.abs(Math.sin(k * 22))) * Math.sin(k * Math.PI); g.fillStyle = `hsla(${30 + k * 300},90%,72%,${a})`; g.fillRect(x, 0, 1, 4); }
  });
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
  m.rotation.x = -Math.PI / 2 + 0.35;
  return m;
}

function makePlanet(cell, i, total) {
  const open = cell.status === 'open';
  const fx = open ? cell.fx || '' : 'coming';
  const radius = open ? 0.55 + ((i * 37) % 5) * 0.06 : 0.38;
  const orbitR = 3.2 + i * 1.55;
  const group = new THREE.Group();
  const tex = planetTexture(cell, fx);
  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85, metalness: 0, transparent: !open, opacity: open ? 1 : 0.55 });
  if (fx === 'rice') { mat.emissiveMap = tex; mat.emissive = new THREE.Color('#fff4e0'); mat.emissiveIntensity = 0.35; }
  if (fx === 'stars') { mat.emissiveMap = tex; mat.emissive = new THREE.Color('#ffffff'); mat.emissiveIntensity = 0.55; }
  const body = new THREE.Mesh(sphereGeo, mat);
  body.scale.setScalar(radius);
  body.rotation.z = 0.3;
  group.add(body);
  const atmo = sprite(glow(cell.color || '#ffffff', 0.9), [radius * 3.4, radius * 3.4], open ? 0.45 : 0.15);
  group.add(atmo);
  const extra = {};
  if (fx === 'prism') { extra.ring = ringMesh(radius * 1.4, radius * 2.3); group.add(extra.ring); }
  if (fx === 'rice') {
    const n = 90, p = new Float32Array(n * 3);
    for (let k = 0; k < n; k++) { const r = radius * (1.25 + Math.random() * 0.9), th = Math.random() * 6.283, ph = Math.acos(2 * Math.random() - 1); p.set([r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th)], k * 3); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(p, 3));
    extra.dust = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.08, map: glow('#fff4e0', 1), color: '#fff4e0', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    group.add(extra.dust);
    const pts = []; for (let a = 0; a <= 96; a++) { const t = (a / 96) * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(t) * radius * 1.6, 0, Math.sin(t) * radius * 1.6)); }
    extra.redline = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: '#c8382f', transparent: true, opacity: 0.7 }));
    extra.redline.rotation.x = 0.35; group.add(extra.redline);
  }
  if (fx === 'stars') {
    const n = 120, p = new Float32Array(n * 3);
    for (let k = 0; k < n; k++) { const r = radius * (1.3 + Math.random() * 0.8), th = Math.random() * 6.283, ph = Math.acos(2 * Math.random() - 1); p.set([r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th)], k * 3); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(p, 3));
    extra.dust = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.09, map: glow('#dbe6ff', 1), color: '#dbe6ff', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    group.add(extra.dust);
  }
  if (fx === 'ripple') {
    extra.waves = [0, 1, 2].map((k) => {
      const pts = []; for (let a = 0; a <= 64; a++) { const t = (a / 64) * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(t), 0, Math.sin(t))); }
      const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: cell.color, transparent: true, opacity: 0.5 }));
      l.userData.k = k; group.add(l); return l;
    });
  }
  const orbit = orbitLine(orbitR, cell.color || '#ffffff');
  world.add(orbit); world.add(group);

  const planet = {
    cell, i, open, group, body, atmo, orbit, label: null, extra, radius, orbitR,
    angle: (i / total) * Math.PI * 2 + 0.6, speed: 0.22 / Math.pow(orbitR / 3, 1.3), spin: 0.25 + Math.random() * 0.2, hover: 0, intro: 0,
  };
  if (labelsEl) {
    const label = document.createElement('button');
    label.className = 'p-label' + (open ? '' : ' is-coming');
    label.style.setProperty('--accent', cell.color || '#7ee0d0');
    label.innerHTML = `<b>${code(i)}</b><span>${esc(open ? shortTitle(cell.title) : 'Coming soon')}</span>`;
    label.addEventListener('click', () => open && enter(planet));
    label.addEventListener('pointerenter', () => { labelHover = planet; });
    label.addEventListener('pointerleave', () => { labelHover = null; });
    labelsEl.appendChild(label);
    planet.label = label;
  }
  body.userData.planet = planet;
  planets.push(planet);
  if (open && cell.thumbnail) {
    new THREE.TextureLoader().setCrossOrigin('anonymous').load(imageUrl(cell.thumbnail, 1024), (t) => { t.colorSpace = THREE.SRGBColorSpace; mat.map = t; mat.needsUpdate = true; });
  }
  return planet;
}

// ---------- 카메라 / 인터랙션 ----------
const state = { az: 0.6, tAz: 0.6, el: 0.42, tEl: 0.42, dist: 20, tDist: 20, baseDist: 20, dragging: false, moved: 0, hovered: null, entering: null, mx: 0, my: 0 };
let labelHover = null;
const ray = new THREE.Raycaster();
const ptr = new THREE.Vector2(-9, -9);

canvas.addEventListener('pointerdown', (e) => { state.dragging = true; state.moved = 0; state.px = e.clientX; state.py = e.clientY; canvas.setPointerCapture(e.pointerId); });
canvas.addEventListener('pointermove', (e) => {
  ptr.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  state.mx = ptr.x; state.my = ptr.y;
  if (state.dragging) {
    const dx = e.clientX - state.px, dy = e.clientY - state.py;
    state.moved += Math.abs(dx) + Math.abs(dy);
    state.tAz += dx * 0.005; state.tEl = Math.max(0.08, Math.min(1.25, state.tEl + dy * 0.003));
    state.px = e.clientX; state.py = e.clientY;
  }
  card.style.transform = `translate(${e.clientX + 18}px, ${e.clientY + 18}px)`;
});
canvas.addEventListener('pointerup', (e) => {
  state.dragging = false;
  if (state.moved < 6) {
    ptr.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    const p = pick(); if (p && p.open) enter(p);
  }
});
canvas.addEventListener('pointerleave', () => ptr.set(-9, -9));
canvas.addEventListener('wheel', (e) => { state.tDist = Math.max(state.baseDist * 0.45, Math.min(state.baseDist * 1.6, state.tDist + e.deltaY * 0.02)); }, { passive: true });

function pick() {
  ray.setFromCamera(ptr, camera);
  const hits = ray.intersectObjects(planets.map((p) => p.body), false);
  return hits.length ? hits[0].object.userData.planet : null;
}
function setHover(p) {
  if (state.hovered === p) return;
  state.hovered = p;
  canvas.style.cursor = p && p.open ? 'pointer' : 'grab';
  planets.forEach((q) => q.label && q.label.classList.toggle('on', q === p));
  if (p) {
    const c = p.cell;
    card.querySelector('.hc-no').textContent = code(p.i);
    card.querySelector('.hc-title').textContent = p.open ? shortTitle(c.title) : 'Coming soon';
    card.querySelector('.hc-sub').textContent = p.open ? c.subtitle || '' : '아직 빛나지 않은 행성';
    card.querySelector('.hc-meta').textContent = [c.artist, c.period].filter(Boolean).join(' · ');
    card.style.setProperty('--accent', c.color || '#7ee0d0');
    card.classList.add('on');
  } else card.classList.remove('on');
}
function enter(p) {
  if (state.entering) return;
  state.entering = { p, t: performance.now(), from: camera.position.clone() };
  card.classList.remove('on');
  document.body.classList.add('landing');
  wipe.style.background = p.cell.color || '#7ee0d0';
  setTimeout(() => wipe.classList.add('on'), 900);
  setTimeout(() => { location.href = p.cell.url || `cell.html?id=${encodeURIComponent(p.cell.id)}`; }, 1400);
}

// ---------- 루프 ----------
const v = new THREE.Vector3(), target = new THREE.Vector3(), up = new THREE.Vector3();
let last = performance.now(), t0 = performance.now();
function tick(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  const t = (now - t0) / 1000;
  if (!state.entering) setHover(labelHover || pick());
  const slow = state.hovered || state.entering ? 0.15 : 1;
  if (!state.dragging && !state.entering) state.tAz += dt * 0.02;

  core.rotation.y += dt * 0.1;
  const pulse = 1 + Math.sin(t * 1.4) * 0.04;
  arms[0].material.rotation = Math.PI / 4 + Math.sin(t * 0.3) * 0.05;
  arms[1].material.rotation = -Math.PI / 4 - Math.sin(t * 0.3) * 0.05;
  arms.forEach((a) => a.scale.set(9 * pulse, 0.55, 1));

  planets.forEach((p) => {
    p.intro = Math.min(1.6, p.intro + dt * 0.8);
    const e = 1 - Math.pow(1 - Math.max(0, Math.min(1, p.intro * 1.4 - p.i * 0.12)), 3);
    p.angle += dt * p.speed * slow;
    const r = p.orbitR * (0.6 + 0.4 * e);
    p.group.position.set(Math.cos(p.angle) * r, Math.sin(p.angle * 2 + p.i) * 0.08, Math.sin(p.angle) * r);
    p.body.rotation.y += dt * p.spin;
    p.hover += ((state.hovered === p ? 1 : 0) - p.hover) * 0.12;
    p.body.scale.setScalar(p.radius * (0.2 + 0.8 * e) * (1 + p.hover * 0.25));
    p.atmo.material.opacity = ((p.open ? 0.4 : 0.12) + p.hover * 0.45 + Math.sin(t * 1.5 + p.i) * 0.05) * e;
    p.orbit.material.opacity = (0.12 + p.hover * 0.45) * e;
    if (p.extra.ring) { p.extra.ring.rotation.z += dt * 0.15; p.extra.ring.material.opacity = (0.75 + p.hover * 0.25) * e; }
    if (p.extra.redline) { p.extra.redline.rotation.y += dt * 0.2; p.extra.redline.material.opacity = (0.45 + p.hover * 0.5) * e; }
    if (p.extra.dust) { p.extra.dust.rotation.y += dt * 0.4; p.extra.dust.material.size = 0.07 + Math.abs(Math.sin(t * 3)) * 0.05; }
    if (p.extra.waves) p.extra.waves.forEach((l) => { const ph = (t * 0.45 + l.userData.k / 3) % 1; l.scale.setScalar(p.radius * (1.1 + ph * 1.8)); l.material.opacity = (1 - ph) * 0.6 * e; });
  });

  // 카메라
  state.az += (state.tAz - state.az) * 0.06;
  state.el += (state.tEl - state.el) * 0.06;
  state.dist += (state.tDist - state.dist) * 0.06;
  if (state.entering) {
    const { p } = state.entering;
    const k = Math.min(1, (now - state.entering.t) / 1300), ease = k * k * (3 - 2 * k);
    p.group.getWorldPosition(target);
    up.set(0, p.radius * 0.8, 0);
    v.copy(target).normalize().multiplyScalar(-p.radius * 3.2).add(target).add(up); // X 쪽(빛이 드는 면)에서 다가감
    camera.position.lerpVectors(state.entering.from, v, ease);
    camera.lookAt(target);
  } else {
    camera.position.set(
      Math.cos(state.az) * Math.cos(state.el) * state.dist + state.mx * 0.6,
      Math.sin(state.el) * state.dist + state.my * 0.4,
      Math.sin(state.az) * Math.cos(state.el) * state.dist);
    camera.lookAt(0, 0, 0);
  }

  // 라벨
  planets.forEach((p) => {
    if (!p.label) return;
    p.group.getWorldPosition(v); v.y += p.radius * 1.7; v.project(camera);
    p.label.style.opacity = v.z > 1 || state.entering ? 0 : 1;
    p.label.style.transform = `translate(-50%,-100%) translate(${(v.x * 0.5 + 0.5) * innerWidth}px,${(-v.y * 0.5 + 0.5) * innerHeight}px)`;
  });

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

function resize() {
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  const maxR = planets.length ? planets[planets.length - 1].orbitR + 1.2 : 10;
  const fit = maxR / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  state.baseDist = camera.aspect >= 1 ? fit * 0.72 : fit / camera.aspect * 0.62;
  state.tDist = state.dist = state.baseDist;
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
  await document.fonts.ready.catch(() => {});
  cells.forEach((c, i) => makePlanet(c, i, cells.length));
  document.getElementById('cell-list').innerHTML = cells.map((c, i) => `
    <li class="${c.status === 'open' ? '' : 'is-coming'}" style="--accent:${esc(c.color || '#7ee0d0')}">
      ${c.status === 'open' ? `<a href="${esc(c.url || 'cell.html?id=' + encodeURIComponent(c.id))}">` : '<div>'}
        <span class="no">${code(i)}</span>
        <span class="t">${esc(shortTitle(c.title) || 'Coming soon')}</span>
        <span class="m">${esc([c.artist, c.period].filter(Boolean).join(' · '))}</span>
      ${c.status === 'open' ? '</a>' : '</div>'}
    </li>`).join('');
  resize();
  t0 = last = performance.now();
  loader.classList.add('done');
  requestAnimationFrame(tick);
})();
