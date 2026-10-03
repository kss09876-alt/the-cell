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
})();

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
