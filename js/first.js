// X-001 · 최초의 행성 — 세 개의 방(위성)을 고르는 기획전 허브
import { loadData, esc } from './data.js?v=13';
import { hsound } from './home-sound.js?v=3';

const cv = document.getElementById('fp-stage'), g = cv.getContext('2d');
const labelsEl = document.getElementById('fp-labels'), card = document.getElementById('fp-card');
const wipe = document.getElementById('wipe'), loader = document.getElementById('loader');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
let W, H, DPR = Math.min(devicePixelRatio, 2), CX, CY, R, mobile;
function resize() {
  W = innerWidth; H = innerHeight; cv.width = W * DPR; cv.height = H * DPR; g.setTransform(DPR, 0, 0, DPR, 0, 0);
  mobile = W < 820; CX = mobile ? W / 2 : W * 0.66; CY = mobile ? H * 0.36 : H * 0.5; R = Math.min(mobile ? W * 0.2 : W * 0.1, H * 0.13);
}
resize(); addEventListener('resize', resize);

// 별
const STARS = Array.from({ length: 260 }, () => ({ x: Math.random(), y: Math.random(), s: Math.random() < 0.08 ? 1.6 : 0.8, p: Math.random() * 6 }));
let rooms = [], moons = [], hovered = null, entering = null, mx = -1, my = -1;

// 방별 위성 그림 (각 방의 시각 언어)
function drawMoon(m, t) {
  const { x, y, r } = m, col = m.room.color || '#fff', k = m.k;
  const gl = g.createRadialGradient(x, y, 0, x, y, r * 3); gl.addColorStop(0, hex(col, 0.35 + m.h * 0.35)); gl.addColorStop(1, hex(col, 0)); g.fillStyle = gl; g.beginPath(); g.arc(x, y, r * 3, 0, 6.283); g.fill();
  g.save(); g.beginPath(); g.arc(x, y, r, 0, 6.283); g.clip();
  if (k === 0) { // 최초의 방: 양자 우주 — 깊은 남색 + 별 입자
    g.fillStyle = '#0b1235'; g.fillRect(x - r, y - r, r * 2, r * 2);
    for (let i = 0; i < 40; i++) { const a = i * 2.4 + t * 0.2, rr = r * ((i * 0.618) % 1); g.fillStyle = `rgba(220,232,255,${0.4 + 0.6 * Math.abs(Math.sin(t * 2 + i))})`; g.fillRect(x + Math.cos(a) * rr, y + Math.sin(a) * rr, 1.6, 1.6); }
  } else if (k === 1) { // 빛의 단면: 프리즘 — 금빛과 무지개 띠
    const lg = g.createLinearGradient(x - r, y - r, x + r, y + r); lg.addColorStop(0, '#3a2a08'); lg.addColorStop(0.5, '#f2c14e'); lg.addColorStop(1, '#5a3a0a'); g.fillStyle = lg; g.fillRect(x - r, y - r, r * 2, r * 2);
    ['#ff5f5f', '#ffb84d', '#fff27a', '#6fe08a', '#5fb8ff', '#9a7bff'].forEach((c, i) => { g.fillStyle = hex(c, 0.35); g.fillRect(x - r, y - r * 0.15 + i * r * 0.09 + Math.sin(t + i) * 2, r * 2, r * 0.08); });
  } else { // 소리의 지도: 붉은 바탕 + 퍼지는 물결
    g.fillStyle = '#4a1414'; g.fillRect(x - r, y - r, r * 2, r * 2);
    g.strokeStyle = 'rgba(255,200,195,.55)'; g.lineWidth = 1.2;
    for (let i = 0; i < 4; i++) { const ph = ((t * 0.5 + i / 4) % 1); g.globalAlpha = 1 - ph; g.beginPath(); g.arc(x - r * 0.2, y + r * 0.1, ph * r * 1.4, 0, 6.283); g.stroke(); }
    g.globalAlpha = 1;
  }
  const sh = g.createRadialGradient(x - r * 0.4, y - r * 0.4, r * 0.1, x, y, r * 1.1); sh.addColorStop(0, 'rgba(255,255,255,.18)'); sh.addColorStop(0.6, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.55)'); g.fillStyle = sh; g.fillRect(x - r, y - r, r * 2, r * 2);
  g.restore();
  g.strokeStyle = hex(col, 0.4 + m.h * 0.6); g.lineWidth = 1; g.beginPath(); g.arc(x, y, r + 3 + m.h * 4, 0, 6.283); g.stroke();
}
function hex(c, a) { const n = parseInt(String(c).replace('#', ''), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; }

function drawPlanet(t) {
  const gl = g.createRadialGradient(CX, CY, 0, CX, CY, R * 3.2); gl.addColorStop(0, 'rgba(160,180,255,.25)'); gl.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gl; g.beginPath(); g.arc(CX, CY, R * 3.2, 0, 6.283); g.fill();
  g.save(); g.beginPath(); g.arc(CX, CY, R, 0, 6.283); g.clip();
  const lg = g.createLinearGradient(0, CY - R, 0, CY + R); lg.addColorStop(0, '#0c1236'); lg.addColorStop(0.45, '#1b2a66'); lg.addColorStop(0.55, '#3a3060'); lg.addColorStop(1, '#0a0e28'); g.fillStyle = lg; g.fillRect(CX - R, CY - R, R * 2, R * 2);
  const by = CY - R * 0.1; const gb = g.createLinearGradient(0, by - R * 0.15, 0, by + R * 0.15); gb.addColorStop(0, 'rgba(242,193,78,0)'); gb.addColorStop(0.5, 'rgba(242,193,78,.7)'); gb.addColorStop(1, 'rgba(242,193,78,0)'); g.fillStyle = gb; g.fillRect(CX - R, by - R * 0.15, R * 2, R * 0.3);
  g.strokeStyle = 'rgba(239,111,108,.5)'; g.lineWidth = 1.5;
  for (let k = 0; k < 3; k++) { g.beginPath(); for (let x = -R; x <= R; x += 3) g.lineTo(CX + x, CY + R * 0.35 + k * 6 + Math.sin(x / 12 + t + k) * 3); g.stroke(); }
  const sh = g.createRadialGradient(CX - R * 0.45, CY - R * 0.45, R * 0.1, CX, CY, R * 1.05); sh.addColorStop(0, 'rgba(255,255,255,.2)'); sh.addColorStop(0.6, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.6)'); g.fillStyle = sh; g.fillRect(CX - R, CY - R, R * 2, R * 2);
  g.restore();
}

function frame(now) {
  const t = now / 1000;
  g.fillStyle = '#04050a'; g.fillRect(0, 0, W, H);
  STARS.forEach((s) => { g.fillStyle = `rgba(230,236,255,${0.25 + 0.5 * Math.abs(Math.sin(t * 0.6 + s.p))})`; g.fillRect(s.x * W, s.y * H, s.s, s.s); });
  // 궤도
  const pos = moons.map((m) => {
    if (!reduced && !entering) m.a += (hovered ? 0.0012 : 0.004) * m.sp;
    const rx = R * m.or, ry = rx * (0.32 + m.k * 0.06), tilt = (m.k - 1) * 0.22;
    const ox = Math.cos(m.a) * rx, oy = Math.sin(m.a) * ry;
    m.x = CX + ox * Math.cos(tilt) - oy * Math.sin(tilt); m.y = CY + ox * Math.sin(tilt) + oy * Math.cos(tilt);
    m.front = Math.sin(m.a) > 0; m.r = R * (0.36 + (m.front ? 0.06 : 0)) * (1 + m.h * 0.2);
    g.save(); g.translate(CX, CY); g.rotate(tilt); g.strokeStyle = hex(m.room.color, 0.16 + m.h * 0.35); g.lineWidth = 1; g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, 6.283); g.stroke(); g.restore();
    return m;
  });
  pos.filter((m) => !m.front).forEach((m) => drawMoon(m, t));
  drawPlanet(t);
  pos.filter((m) => m.front).forEach((m) => drawMoon(m, t));
  // 라벨
  moons.forEach((m) => {
    m.h += ((hovered === m ? 1 : 0) - m.h) * 0.12;
    m.label.style.transform = `translate(-50%,-100%) translate(${m.x}px,${m.y - m.r - 14}px)`;
    m.label.style.opacity = entering ? 0 : 1;
  });
  if (entering) { const k = Math.min(1, (now - entering.t) / 900); g.fillStyle = hex(entering.m.room.color, k * 0.9); g.beginPath(); g.arc(entering.m.x, entering.m.y, entering.m.r + k * Math.hypot(W, H), 0, 6.283); g.fill(); }
  hsound.update({ drag: 0, zoom: 0.4, t, hovering: !!hovered, entering: !!entering });
  requestAnimationFrame(frame);
}

function pick(x, y) { let best = null; moons.forEach((m) => { if (Math.hypot(x - m.x, y - m.y) < m.r + 10 && (!best || m.front)) best = m; }); return best; }
function setHover(m) {
  if (hovered === m) return; hovered = m;
  cv.style.cursor = m ? 'pointer' : 'default';
  moons.forEach((q) => q.label.classList.toggle('on', q === m));
  if (m) {
    card.querySelector('.hc-no').textContent = `ROOM ${String(m.k + 1).padStart(2, '0')}`;
    card.querySelector('.hc-title').textContent = m.room.short;
    card.querySelector('.hc-sub').textContent = m.room.subtitle || '';
    card.querySelector('.hc-meta').textContent = '눌러서 입장';
    card.style.setProperty('--accent', m.room.color);
    card.classList.add('on');
    hsound.hover(m.k + 1, true, ['stars', 'prism', 'ripple'][m.k] || '', Math.max(-0.9, Math.min(0.9, (m.x / W) * 2 - 1)));
  } else { card.classList.remove('on'); hsound.unhover(); }
}
function enter(m) {
  if (entering) return;
  entering = { m, t: performance.now() }; card.classList.remove('on'); hsound.enter(m.k + 1);
  setTimeout(() => { wipe.style.background = m.room.color; wipe.classList.add('on'); }, 700);
  setTimeout(() => { location.href = `cell.html?id=${encodeURIComponent(m.room.id)}`; }, 1150);
}
cv.addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; card.style.transform = `translate(${mx + 18}px, ${my + 18}px)`; if (!entering) setHover(pick(mx, my)); });
cv.addEventListener('pointerleave', () => setHover(null));
cv.addEventListener('click', (e) => { const m = pick(e.clientX, e.clientY); if (m) enter(m); });

// ---------- 사운드 (홈과 같은 설정을 공유) ----------
const sndBtn = document.getElementById('btn-sound');
function sndUI() { sndBtn.classList.toggle('on', hsound.on); sndBtn.setAttribute('aria-pressed', String(hsound.on)); sndBtn.querySelector('span').textContent = hsound.on ? 'SOUND ON' : 'SOUND OFF'; }
sndBtn.addEventListener('click', () => { hsound.toggle(); setTimeout(sndUI, 30); });
const GEST = ['pointerdown', 'keydown', 'touchstart'];
let closeGate = null;
const firstGesture = (e) => {
  if (e.target && e.target.closest && e.target.closest('#btn-sound, .snd-gate')) return;
  GEST.forEach((ev) => removeEventListener(ev, firstGesture));
  if (hsound.pref !== 'off' && !hsound.on) hsound.start().then(sndUI).catch(() => {});
  if (closeGate) { closeGate(); closeGate = null; }
};
GEST.forEach((ev) => addEventListener(ev, firstGesture, { passive: true }));
function sndGate(onStart) {
  const gt = document.createElement('div'); gt.className = 'snd-gate';
  gt.innerHTML = '<div class="g-in"><p class="g-k">X-001 · XPACE 개관 기획전</p><p class="g-t">최초의 행성</p><button class="g-b"><i><b></b><b></b><b></b></i>입장하기</button><button class="g-s">소리 없이 보기</button><p class="g-n">헤드폰을 권장합니다</p></div>';
  document.body.appendChild(gt);
  const close = () => { gt.classList.add('out'); setTimeout(() => gt.remove(), 1000); };
  gt.querySelector('.g-s').addEventListener('click', (e) => { e.stopPropagation(); onStart(false); close(); });
  gt.addEventListener('click', () => { onStart(true); close(); });
  return close;
}
function autoSound() {
  if (hsound.pref === 'off') return;
  hsound.tryAuto().then((ok) => {
    if (ok) { GEST.forEach((ev) => removeEventListener(ev, firstGesture)); sndUI(); return; }
    closeGate = sndGate((withSound) => { GEST.forEach((ev) => removeEventListener(ev, firstGesture)); if (withSound) hsound.start().then(sndUI); else { hsound.stop(); sndUI(); } });
  });
}
addEventListener('pageshow', (e) => { if (e.persisted) location.reload(); });

// ---------- 시작 ----------
(async () => {
  const { groups } = await loadData();
  const grp = groups.find((x) => x.id === 'g001') || groups[0];
  rooms = grp ? grp.rooms : [];
  if (grp) {
    document.querySelector('.fp-hero .eyebrow').textContent = `${grp.code} · XPACE 개관 기획전`;
    document.querySelector('.fp-hero h1').textContent = grp.title.replace(/^X-\d+ · /, '');
    document.querySelector('.fp-start').href = `cell.html?id=${encodeURIComponent(rooms[0]?.id || 'c001')}`;
  }
  moons = rooms.map((room, k) => {
    const l = document.createElement('button'); l.className = 'p-label'; l.style.setProperty('--accent', room.color || '#fff');
    l.innerHTML = `<b>ROOM ${String(k + 1).padStart(2, '0')}</b><span>${esc(room.short)}</span>`;
    labelsEl.appendChild(l);
    const m = { room, k, a: k * 2.1 + 0.4, or: 1.9 + k * 0.75, sp: 1 - k * 0.2, h: 0, label: l, x: 0, y: 0, r: 10 };
    l.addEventListener('click', () => enter(m)); l.addEventListener('pointerenter', () => setHover(m)); l.addEventListener('pointerleave', () => setHover(null));
    return m;
  });
  document.querySelector('.fp-rooms').innerHTML = rooms.map((r, k) => `
    <a class="fp-room" href="cell.html?id=${encodeURIComponent(r.id)}" style="--accent:${esc(r.color || '#fff')}">
      <span class="no">ROOM ${String(k + 1).padStart(2, '0')}</span>
      <strong>${esc(r.short)}</strong>
      <span class="sub">${esc(r.subtitle || '')}</span>
      <span class="go">입장 →</span>
    </a>`).join('');
  document.querySelectorAll('.fp-room').forEach((a, k) => a.addEventListener('pointerenter', () => hsound.hover(k + 1, true, ['stars', 'prism', 'ripple'][k], 0)));
  loader.classList.add('done');
  autoSound();
  requestAnimationFrame(frame);
})();
