import { loadData, imageUrl, videoEmbed, esc, paras } from './data.js';

const story = document.getElementById('story');
const wipe = document.getElementById('wipe');
const id = new URLSearchParams(location.search).get('id');

const media = (src, alt = '') => src
  ? `<img src="${esc(imageUrl(src))}" alt="${esc(alt)}" loading="lazy" referrerpolicy="no-referrer" />`
  : `<div class="ph"><span>IMAGE</span></div>`;

// 블록 타입별 렌더러 — 새 연출이 필요하면 여기에 타입을 추가하세요.
const R = {
  cover: (b, c, i) => `
    <section class="b-cover" style="${b.bg ? `--bg:${esc(b.bg)}` : ''}">
      ${b.media ? `<div class="cover-media parallax" data-speed="0.3">${media(b.media)}</div>` : '<div class="cover-cube"><i></i><i></i><i></i><i></i><i></i><i></i></div>'}
      <div class="cover-text">
        <p class="eyebrow">CELL ${String(i + 1).padStart(3, '0')}</p>
        <h1 class="split">${esc(b.title || c.title)}</h1>
        <p class="sub reveal">${esc(b.body || c.subtitle)}</p>
        <p class="meta reveal">${esc([c.artist, c.period].filter(Boolean).join(' · '))}</p>
      </div>
      <div class="scroll-cue">SCROLL</div>
    </section>`,
  text: (b) => `
    <section class="b-text ${b.align === 'center' ? 'center' : ''}" ${b.bg ? `style="--bg:${esc(b.bg)}"` : ''}>
      <div class="wrap reveal">${b.title ? `<h2>${esc(b.title)}</h2>` : ''}${paras(b.body)}</div>
    </section>`,
  image: (b) => `
    <section class="b-image ${b.align === 'full' ? 'full' : ''}">
      <figure class="reveal"><div class="frame parallax" data-speed="0.12">${media(b.media, b.caption)}</div>
      ${b.caption ? `<figcaption>${esc(b.caption)}</figcaption>` : ''}</figure>
    </section>`,
  gallery: (b) => {
    const items = (b.media ? b.media.split(',') : ['', '', '']).map((s) => s.trim());
    return `<section class="b-gallery"><div class="track">${items.map((s, k) => `<figure class="reveal" style="--d:${k * 0.1}s">${media(s)}</figure>`).join('')}</div>
      ${b.caption ? `<p class="caption">${esc(b.caption)}</p>` : ''}</section>`;
  },
  quote: (b) => `
    <section class="b-quote" ${b.bg ? `style="--bg:${esc(b.bg)}"` : ''}>
      <blockquote class="reveal"><p>“${esc(b.body)}”</p>${b.caption ? `<cite>— ${esc(b.caption)}</cite>` : ''}</blockquote>
    </section>`,
  video: (b) => `
    <section class="b-video"><div class="wrap reveal">
      ${b.title ? `<h2>${esc(b.title)}</h2>` : ''}
      <div class="ratio">${b.media ? `<iframe src="${esc(videoEmbed(b.media))}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe>` : '<div class="ph"><span>VIDEO</span></div>'}</div>
      ${b.caption ? `<p class="caption">${esc(b.caption)}</p>` : ''}
    </div></section>`,
  // sticky: 한쪽은 고정된 미디어(큐브), 다른 쪽은 스크롤되는 단계 텍스트. body를 '|'로 구분
  sticky: (b) => {
    const steps = String(b.body || '').split('|').map((s) => s.trim()).filter(Boolean);
    const imgs = (b.media || '').split(',').map((s) => s.trim());
    return `<section class="b-sticky" style="--n:${steps.length}">
      <div class="sticky-media">
        ${imgs.some(Boolean) ? imgs.map((s, k) => `<div class="sm-item" data-k="${k}">${media(s)}</div>`).join('') : `<div class="spin-cube" data-steps="${steps.length}"><i></i><i></i><i></i><i></i><i></i><i></i></div>`}
        ${b.title ? `<h2>${esc(b.title)}</h2>` : ''}
      </div>
      <div class="sticky-steps">${steps.map((s, k) => `<div class="step" data-k="${k}"><span>${String(k + 1).padStart(2, '0')}</span><p>${esc(s)}</p></div>`).join('')}</div>
    </section>`;
  },
  // wave: 스크롤·포인터에 반응하는 파형 캔버스 위에 문장
  wave: (b) => `
    <section class="b-wave" ${b.bg ? `style="--bg:${esc(b.bg)}"` : ''}>
      <canvas class="wave-cv"></canvas>
      <div class="wave-text reveal">${b.title ? `<h2>${esc(b.title)}</h2>` : ''}${paras(b.body)}</div>
    </section>`,
  // timeline: body = "연도 내용|연도 내용|..."
  timeline: (b) => {
    const items = String(b.body || '').split(/\||\n/).map((s) => s.trim()).filter(Boolean);
    return `<section class="b-timeline">
      ${b.title ? `<h2 class="reveal">${esc(b.title)}</h2>` : ''}
      <ol>${items.map((s) => { const m = s.match(/^(\S+)\s+(.*)$/) || [, '', s]; return `<li class="reveal"><span class="yr">${esc(m[1])}</span><p>${esc(m[2])}</p></li>`; }).join('')}</ol>
    </section>`;
  },
  // piano: 웹오디오 건반. align=detuned 이면 어긋난 조율로 시작
  piano: (b) => `
    <section class="b-piano">
      <div class="wrap reveal">
        ${b.title ? `<h2>${esc(b.title)}</h2>` : ''}${paras(b.body)}
        <div class="piano" data-detuned="${b.align === 'detuned' ? 1 : 0}"></div>
        <div class="piano-ctl">
          <label><input type="checkbox" class="detune-toggle" ${b.align === 'detuned' ? 'checked' : ''}/> <span>조율 풀기</span></label>
          <span class="piano-hint">키보드 A–K · W E T Y U 로도 연주할 수 있어요</span>
        </div>
        ${b.caption ? `<p class="caption">${esc(b.caption)}</p>` : ''}
      </div>
    </section>`,
  end: (b, c, i, all) => {
    const open = all.filter((x) => x.status === 'open');
    const pos = open.findIndex((x) => x.id === c.id);
    const next = open[(pos + 1) % open.length];
    return `<section class="b-end">
      <p class="eyebrow">END OF CELL ${String(i + 1).padStart(3, '0')}</p>
      ${next && next.id !== c.id ? `<a class="next" href="cell.html?id=${encodeURIComponent(next.id)}" style="--accent:${esc(next.color)}"><span>${esc(b.title || '다음 셀로')}</span><strong>${esc(next.title)}</strong></a>` : ''}
      <a class="back" href="./">← 큐브 그리드로 돌아가기</a>
    </section>`;
  },
};

(async () => {
  const { cells, blocks } = await loadData();
  const idx = cells.findIndex((c) => c.id === id);
  const cell = cells[idx];
  if (!cell || cell.status !== 'open') {
    story.innerHTML = `<section class="b-end"><p class="eyebrow">NOT FOUND</p><h2>열려 있지 않은 셀입니다.</h2><a class="back" href="./">← 돌아가기</a></section>`;
    return finish('#7ee0d0');
  }
  document.title = `${cell.title} — THE CELL`;
  document.documentElement.style.setProperty('--accent', cell.color || '#7ee0d0');
  document.getElementById('cell-label').textContent = cell.title;
  let bs = blocks.filter((b) => b.cell_id === cell.id);
  if (!bs.some((b) => b.type === 'cover')) bs = [{ type: 'cover' }, ...bs];
  if (!bs.some((b) => b.type === 'end')) bs.push({ type: 'end' });
  story.innerHTML = bs.map((b) => (R[b.type] || R.text)(b, cell, idx, cells)).join('');
  splitTitles();
  finish(cell.color);
  setupScroll();
  setupWaves();
  setupPianos();
  setupBgm(cell);
})();

// ---------- BGM ----------
// cells 시트 bgm 칸: Spotify 링크(앨범/트랙/플레이리스트) 또는 오디오 파일(드라이브 링크·mp3 URL)
// 진입 즉시 자동재생을 시도하고, 브라우저가 막으면 '소리와 함께 입장' 게이트를 띄워 첫 클릭에 재생합니다.
function setupBgm(cell) {
  const src = (cell.bgm || '').trim();
  if (!src) return;
  const box = document.createElement('div');
  box.className = 'bgm';
  box.innerHTML = `<button class="bgm-btn" aria-pressed="false"><span class="eq"><i></i><i></i><i></i></span><span class="lbl">BGM</span></button>`;
  document.body.appendChild(box);
  const btn = box.querySelector('.bgm-btn'), lbl = box.querySelector('.lbl');
  let userMuted = false, playing = false;
  const setState = (p) => { playing = p; box.classList.toggle('playing', p); btn.setAttribute('aria-pressed', String(p)); lbl.textContent = p ? 'SOUND ON' : 'SOUND OFF'; if (p) closeGate(); };

  let player; // { play(), pause() }
  const sp = src.match(/open\.spotify\.com\/(?:intl-\w+\/)?(album|track|playlist)\/(\w+)/);
  if (sp) {
    const panel = document.createElement('div');
    panel.className = 'bgm-panel';
    panel.innerHTML = `<div class="sp-host"></div><p>Spotify · 로그인하지 않으면 30초 미리듣기</p>`;
    box.appendChild(panel);
    let ctrl, pending = false;
    player = { play: () => (ctrl ? ctrl.play() : (pending = true)), pause: () => ctrl && ctrl.pause() };
    window.onSpotifyIframeApiReady = (API) => {
      API.createController(panel.querySelector('.sp-host'), { uri: `spotify:${sp[1]}:${sp[2]}`, width: '100%', height: 152, theme: 'dark' }, (c) => {
        ctrl = c;
        c.addListener('playback_update', (e) => setState(!e.data.isPaused && !e.data.isBuffering ? true : (e.data.isBuffering ? playing : false)));
        c.addListener('ready', () => { if (pending || !userMuted) c.play(); });
      });
    };
    const s = document.createElement('script'); s.src = 'https://open.spotify.com/embed/iframe-api/v1'; s.async = true; document.head.appendChild(s);
    btn.addEventListener('click', () => { if (playing) { userMuted = true; player.pause(); } else { userMuted = false; player.play(); } });
  } else {
    const id = src.match(/\/d\/([\w-]{20,})/)?.[1] || (/^[\w-]{20,}$/.test(src) ? src : '');
    const audio = new Audio(id ? `https://drive.google.com/uc?export=download&id=${id}` : src);
    audio.loop = true; audio.volume = 0.6;
    audio.addEventListener('playing', () => setState(true));
    audio.addEventListener('pause', () => setState(false));
    player = { play: () => audio.play().catch(() => {}), pause: () => audio.pause() };
    btn.addEventListener('click', () => { if (playing) { userMuted = true; player.pause(); } else { userMuted = false; player.play(); } });
    player.play(); // 즉시 자동재생 시도
  }

  // 사용자 첫 상호작용(클릭·키·터치)에 재생
  const kick = (e) => {
    if (e.target.closest && (e.target.closest('.bgm') || e.target.closest('.sound-gate'))) return;
    if (!userMuted && !playing) player.play();
    ['pointerdown', 'keydown', 'touchstart'].forEach((t) => removeEventListener(t, kick, true));
  };
  ['pointerdown', 'keydown', 'touchstart'].forEach((t) => addEventListener(t, kick, true));

  // 자동재생이 막혔으면 게이트 표시
  let gate;
  function closeGate() { if (gate) { gate.classList.add('out'); setTimeout(() => gate && gate.remove(), 600); gate = null; } }
  setTimeout(() => {
    if (playing || userMuted) return;
    gate = document.createElement('div');
    gate.className = 'sound-gate';
    gate.innerHTML = `<div class="sg-inner"><p class="eyebrow">THIS CELL HAS SOUND</p>
      <button class="sg-on"><span class="eq"><i></i><i></i><i></i></span> 소리와 함께 입장</button>
      <button class="sg-off">소리 없이 보기</button></div>`;
    document.body.appendChild(gate);
    gate.querySelector('.sg-on').addEventListener('click', () => { userMuted = false; player.play(); closeGate(); });
    gate.querySelector('.sg-off').addEventListener('click', () => { userMuted = true; closeGate(); });
  }, 1600);
}

// ---------- wave ----------
function setupWaves() {
  document.querySelectorAll('.wave-cv').forEach((cv) => {
    const g = cv.getContext('2d');
    const sec = cv.parentElement;
    let w, h, mx = 0.5, visible = false;
    const dpr = Math.min(devicePixelRatio, 2);
    const size = () => { w = cv.clientWidth; h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size(); addEventListener('resize', size);
    sec.addEventListener('pointermove', (e) => { mx = e.clientX / innerWidth; });
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) requestAnimationFrame(draw); }).observe(sec);
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#fff';
    function draw(now) {
      if (!visible) return;
      const r = sec.getBoundingClientRect();
      const p = 1 - (r.top + r.height) / (innerHeight + r.height); // 0→1 스크롤 진행
      g.clearRect(0, 0, w, h);
      const lines = 28;
      for (let i = 0; i < lines; i++) {
        const k = i / (lines - 1);
        const y0 = h * (0.15 + k * 0.7);
        const amp = (h / 18) * Math.sin(Math.PI * k) * (0.3 + p * 1.4);
        g.beginPath();
        for (let x = 0; x <= w; x += 6) {
          const t = x / w;
          const env = Math.exp(-Math.pow((t - mx) * 3, 2));
          const y = y0 + Math.sin(t * 18 + now / 900 + i * 0.5) * amp * env + Math.sin(t * 71 + i) * amp * 0.15 * p;
          x ? g.lineTo(x, y) : g.moveTo(x, y);
        }
        g.strokeStyle = i % 7 === 3 ? accent : `rgba(242,241,236,${0.08 + 0.18 * Math.sin(Math.PI * k)})`;
        g.lineWidth = i % 7 === 3 ? 1.4 : 1;
        g.stroke();
      }
      requestAnimationFrame(draw);
    }
  });
}

// ---------- piano (Web Audio) ----------
let actx;
function setupPianos() {
  const WHITE = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const KEYMAP = { a: 0, w: 1, s: 2, e: 3, d: 4, f: 5, t: 6, g: 7, y: 8, h: 9, u: 10, j: 11, k: 12 };
  document.querySelectorAll('.piano').forEach((el) => {
    const keys = [];
    const offsets = []; // 어긋난 조율용 센트 오프셋 (고정 난수)
    for (let n = 0; n < 25; n++) offsets.push((Math.sin(n * 12.9898) * 43758.5453 % 1) * 60);
    for (let n = 0; n < 25; n++) {
      const pc = n % 12, black = [1, 3, 6, 8, 10].includes(pc);
      const k = document.createElement('button');
      k.className = 'key ' + (black ? 'black' : 'white');
      k.setAttribute('aria-label', 'note ' + n);
      if (!black) k.dataset.label = WHITE[[0, 2, 4, 5, 7, 9, 11].indexOf(pc)] + (n >= 12 ? (n === 24 ? 6 : 5) : 4);
      k.dataset.n = n;
      el.appendChild(k); keys.push(k);
    }
    const toggle = el.parentElement.querySelector('.detune-toggle');
    const play = (n) => {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === 'suspended') actx.resume();
      const detuned = toggle && toggle.checked;
      const f = 261.63 * Math.pow(2, n / 12 + (detuned ? offsets[n] / 1200 : 0));
      const t = actx.currentTime;
      const out = actx.createGain();
      out.gain.setValueAtTime(0, t);
      out.gain.linearRampToValueAtTime(0.32, t + 0.008);
      out.gain.exponentialRampToValueAtTime(0.001, t + (detuned ? 2.2 : 3.2));
      const lp = actx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = detuned ? 1800 : 4200;
      out.connect(lp).connect(actx.destination);
      [[1, 1], [2, 0.35], [3, 0.12], [4.02, 0.05]].forEach(([m, a]) => {
        const o = actx.createOscillator(), og = actx.createGain();
        o.type = m === 1 ? 'triangle' : 'sine';
        o.frequency.value = f * m * (detuned ? 1 + (Math.random() - 0.5) * 0.006 : 1);
        og.gain.value = a; o.connect(og).connect(out); o.start(t); o.stop(t + 3.3);
      });
      if (detuned) { // 물에 잠긴 피아노의 잡음
        const len = actx.sampleRate * 0.25, buf = actx.createBuffer(1, len, actx.sampleRate), d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3) * 0.12;
        const ns = actx.createBufferSource(); ns.buffer = buf; ns.connect(out); ns.start(t);
      }
      const key = keys[n]; key.classList.add('on'); setTimeout(() => key.classList.remove('on'), 180);
      el.dispatchEvent(new CustomEvent('note', { detail: n }));
    };
    el.addEventListener('pointerdown', (e) => { const k = e.target.closest('.key'); if (k) { e.preventDefault(); play(Number(k.dataset.n)); } });
    el.addEventListener('pointerover', (e) => { const k = e.target.closest('.key'); if (k && e.buttons) play(Number(k.dataset.n)); });
    addEventListener('keydown', (e) => {
      if (e.repeat || e.metaKey || e.ctrlKey) return;
      const r = el.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
      const n = KEYMAP[e.key.toLowerCase()]; if (n !== undefined) play(n + 12 * 0);
    });
  });
}

function finish(color) {
  wipe.style.background = color;
  document.getElementById('loader').classList.add('done');
  requestAnimationFrame(() => requestAnimationFrame(() => wipe.classList.remove('on')));
  document.querySelectorAll('a[href]').forEach((a) => a.addEventListener('click', (e) => {
    if (e.metaKey || e.ctrlKey || a.target) return;
    e.preventDefault();
    wipe.style.background = a.style.getPropertyValue('--accent') || '#0b0b0d';
    wipe.classList.add('on');
    setTimeout(() => (location.href = a.href), 450);
  }));
}
addEventListener('pageshow', (e) => { if (e.persisted) wipe.classList.remove('on'); });

function splitTitles() {
  document.querySelectorAll('.split').forEach((el) => {
    el.innerHTML = [...el.textContent].map((ch, i) => `<span style="--i:${i}">${ch === ' ' ? '&nbsp;' : esc(ch)}</span>`).join('');
  });
}

function setupScroll() {
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.15 });
  document.querySelectorAll('.reveal, .split, .b-cover').forEach((el) => io.observe(el));

  const stepIO = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    const sec = e.target.closest('.b-sticky'); const k = Number(e.target.dataset.k);
    sec.querySelectorAll('.step').forEach((s) => s.classList.toggle('on', Number(s.dataset.k) === k));
    sec.querySelectorAll('.sm-item').forEach((s, j, arr) => s.classList.toggle('on', j === Math.min(k, arr.length - 1)));
    const cube = sec.querySelector('.spin-cube'); if (cube) cube.style.setProperty('--k', k);
  }), { rootMargin: '-45% 0px -45% 0px' });
  document.querySelectorAll('.step').forEach((s) => stepIO.observe(s));

  const bar = document.getElementById('progress-bar');
  const px = [...document.querySelectorAll('.parallax')];
  let ticking = false;
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    px.forEach((el) => {
      const r = el.parentElement.getBoundingClientRect();
      const off = (r.top + r.height / 2 - innerHeight / 2) * Number(el.dataset.speed || 0.1);
      el.style.transform = `translate3d(0, ${-off}px, 0)`;
    });
    document.body.classList.toggle('scrolled', scrollY > 40);
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
}
