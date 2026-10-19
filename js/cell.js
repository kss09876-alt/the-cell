import { loadData, imageUrl, videoEmbed, esc, paras } from './data.js?v=11';

const story = document.getElementById('story');
const wipe = document.getElementById('wipe');
const id = new URLSearchParams(location.search).get('id');

const media = (src, alt = '') => src
  ? `<img src="${esc(imageUrl(src))}" alt="${esc(alt)}" loading="lazy" referrerpolicy="no-referrer" />`
  : `<div class="ph"><span>IMAGE</span></div>`;

// 블록 타입별 렌더러 — 새 연출이 필요하면 여기에 타입을 추가하세요.
const R = {
  cover: (b, c, i) => `
    <section class="b-cover ${b.align ? 'is-' + esc(b.align) : ''}" style="${b.bg ? `--bg:${esc(b.bg)}` : ''}">
      ${b.align === 'cosmos' ? '<canvas class="star-cv" data-mode="drift"></canvas>' : ''}${b.align === 'light' ? '<canvas class="beam-cv"></canvas>' : ''}${b.align === 'sound' ? '<canvas class="rip-cv"></canvas>' : ''}${b.align === 'rice' ? '<canvas class="rice-cv"></canvas>' : ''}
      ${b.media ? `<div class="cover-media parallax" data-speed="0.3">${media(b.media)}</div>` : '<div class="cover-planet"><i class="pl-ring back"></i><i class="pl-body"></i><i class="pl-ring front"></i></div>'}
      <div class="cover-text">
        <p class="eyebrow">X-${String(i + 1).padStart(3, '0')}</p>
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
        ${imgs.some(Boolean) ? imgs.map((s, k) => `<div class="sm-item" data-k="${k}">${media(s)}</div>`).join('') : `<div class="spin-orbit" data-steps="${steps.length}"><i class="so-core"></i><i class="so-ring r1"></i><i class="so-ring r2"></i><i class="so-ring r3"></i><span class="so-arm"><i class="so-planet"></i></span></div>`}
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
  // cosmos: 스크롤하면 별 사이로 빨려 들어가는 워프 + 문장
  cosmos: (b) => `
    <section class="b-cosmos" ${b.bg ? `style="--bg:${esc(b.bg)}"` : ''}>
      <div class="cosmos-sticky"><canvas class="star-cv" data-mode="warp"></canvas>
        <div class="cosmos-text">${b.title ? `<h2>${esc(b.title)}</h2>` : ''}${paras(b.body)}</div></div>
    </section>`,
  // quantum: 확률 구름 — 클릭(관측)하면 한 점으로 붕괴
  quantum: (b) => `
    <section class="b-quantum">
      <div class="q-head reveal">${b.title ? `<h2>${esc(b.title)}</h2>` : ''}${paras(b.body)}</div>
      <div class="q-stage reveal"><canvas class="q-cv"></canvas>
        <div class="q-hud"><span class="q-state">상태: 중첩 (superposition)</span><span class="q-count">관측 0회</span></div>
        <div class="q-tip">화면을 클릭해 관측하기</div></div>
      ${b.caption ? `<p class="caption q-cap">${esc(b.caption)}</p>` : ''}
    </section>`,
  // prism: 프리즘 굴절 (스넬의 법칙으로 계산)
  prism: (b) => `
    <section class="b-lab b-prism">
      <div class="q-head reveal">${b.title ? `<h2>${esc(b.title)}</h2>` : ''}${paras(b.body)}</div>
      <div class="lab-stage reveal"><canvas class="prism-cv"></canvas><div class="q-tip">마우스를 움직여 빛의 각도 바꾸기</div></div>
      ${b.caption ? `<p class="caption q-cap">${esc(b.caption)}</p>` : ''}
    </section>`,
  // shadow: 커서가 광원이 되어 그림자를 드리움
  shadow: (b) => `
    <section class="b-lab b-shadow">
      <div class="q-head reveal">${b.title ? `<h2>${esc(b.title)}</h2>` : ''}${paras(b.body)}</div>
      <div class="lab-stage reveal"><canvas class="shadow-cv"></canvas><div class="q-tip">커서가 광원이 됩니다</div></div>
      ${b.caption ? `<p class="caption q-cap">${esc(b.caption)}</p>` : ''}
    </section>`,
  // soundmap: 지도 위 장소를 눌러 합성된 소리 풍경을 겹쳐 듣기
  soundmap: (b) => `
    <section class="b-lab b-soundmap">
      <div class="q-head reveal">${b.title ? `<h2>${esc(b.title)}</h2>` : ''}${paras(b.body)}</div>
      <div class="lab-stage sm-stage reveal"><canvas class="sm-cv"></canvas><div class="sm-nodes"></div>
        <div class="q-hud"><span class="sm-now">지도 위 장소를 눌러 소리를 켜고 끄세요</span><span class="sm-count">0 / 6</span></div></div>
      ${b.caption ? `<p class="caption q-cap">${esc(b.caption)}</p>` : ''}
    </section>`,
  // listen: 마이크 입력을 실시간 스펙트로그램으로 (녹음·전송 없음)
  listen: (b) => `
    <section class="b-lab b-listen">
      <div class="q-head reveal">${b.title ? `<h2>${esc(b.title)}</h2>` : ''}${paras(b.body)}</div>
      <div class="lab-stage listen-stage reveal"><canvas class="listen-cv"></canvas>
        <button class="listen-btn">● 마이크 켜고 듣기</button>
        <div class="q-hud"><span class="listen-state">대기 중</span><span class="listen-db"></span></div></div>
      ${b.caption ? `<p class="caption q-cap">${esc(b.caption)}</p>` : ''}
    </section>`,
  // chapter: 챕터 표지 (챕터 메뉴에 자동 등록). title=제목, caption=챕터 라벨(예: CHAPTER 01), media=배경 이미지
  chapter: (b) => `
    <section class="b-chapter" data-chapter="${esc(b.caption || '')}" data-title="${esc(b.title || '')}">
      ${b.media ? `<div class="ch-bg parallax" data-speed="0.15">${media(b.media)}</div>` : ''}
      <div class="ch-text reveal"><p class="eyebrow">${esc(b.caption || '')}</p><h2>${esc(b.title || '')}</h2>${paras(b.body)}</div>
    </section>`,
  // records: 항목을 골라 기록 열람. body = "항목::내용||항목::내용"
  records: (b) => {
    const items = String(b.body || '').split('||').map((s) => s.split('::')).filter((x) => x[0]);
    return `<section class="b-records"><div class="wrap reveal">
      ${b.title ? `<h2>${esc(b.title)}</h2>` : ''}
      <div class="rec-tabs" role="tablist">${items.map((it, k) => `<button role="tab" aria-selected="${k === 0}" data-k="${k}">${esc(it[0].trim())}</button>`).join('')}</div>
      <div class="rec-panels">${items.map((it, k) => `<article class="rec-card" data-k="${k}" ${k ? 'hidden' : ''}><h3>${esc(it[0].trim())}</h3>${paras(it[1])}</article>`).join('')}</div>
      ${b.caption ? `<p class="caption src">${esc(b.caption)}</p>` : ''}
    </div></section>`;
  },
  // ricebowl: 쌀알을 그릇으로 옮기면(또는 버튼) 기록이 하나씩 열림. body = "기록|기록|..."
  ricebowl: (b) => {
    const items = String(b.body || '').split('|').map((s) => s.trim()).filter(Boolean);
    return `<section class="b-ricebowl"><div class="wrap">
      <div class="q-head reveal">${b.title ? `<h2>${esc(b.title)}</h2>` : ''}<p>쌀알을 아래 그릇으로 끌어 옮기거나, ‘기록 펼치기’를 눌러 보세요.</p></div>
      <div class="rb-grid">
        <div class="lab-stage rb-stage"><canvas class="rb-cv" aria-hidden="true"></canvas><button class="rb-btn">기록 펼치기 <span class="rb-count">0 / ${items.length}</span></button></div>
        <ol class="rb-list" aria-live="polite">${items.map((s) => `<li hidden>${esc(s)}</li>`).join('')}</ol>
      </div>
      ${b.caption ? `<p class="caption src">${esc(b.caption)}</p>` : ''}
    </div></section>`;
  },
  // boundary: 경계·안내 화면. align=warn 이면 민감 내용 안내. caption = 요약 텍스트
  boundary: (b) => `
    <section class="b-boundary ${b.align === 'warn' ? 'is-warn' : ''}">
      <div class="bd-inner reveal">
        ${b.align === 'warn' ? '<p class="eyebrow warn">관람 안내</p>' : ''}
        <h2>${esc(b.title || '')}</h2>${paras(b.body)}
        <div class="bd-actions">
          <button data-act="continue">계속 보기</button>
          ${b.caption ? '<button data-act="summary">요약만 보기</button>' : ''}
          <button data-act="next">다음 장으로</button>
        </div>
        ${b.caption ? `<div class="bd-summary" hidden>${paras(b.caption)}</div>` : ''}
      </div>
    </section>`,
  // facts: 펼쳐 읽는 기록 카드. body = "제목::내용||제목::내용", caption = 출처
  facts: (b) => {
    const items = String(b.body || '').split('||').map((s) => s.split('::')).filter((x) => x[0]);
    return `<section class="b-facts"><div class="wrap">
      ${b.title ? `<h2 class="reveal">${esc(b.title)}</h2>` : ''}
      <div class="fact-list">${items.map((it, k) => `<details class="fact reveal" ${k === 0 ? 'open' : ''}><summary><span>${String(k + 1).padStart(2, '0')}</span>${esc(it[0].trim())}</summary>${paras(it[1])}</details>`).join('')}</div>
      ${b.caption ? `<p class="caption src">${esc(b.caption)}</p>` : ''}
    </div></section>`;
  },
  // memory: 한 문장을 남기면 빛이 됨 (이 브라우저에만 저장)
  memory: (b) => `
    <section class="b-memory">
      <canvas class="mem-cv" aria-hidden="true"></canvas>
      <div class="mem-inner reveal">
        ${b.title ? `<h2>${esc(b.title)}</h2>` : ''}${paras(b.body)}
        <form class="mem-form">
          <label class="sr" for="mem-in">기억을 위한 한 문장</label>
          <textarea id="mem-in" maxlength="120" rows="2" placeholder="오늘 기억하고 싶은 것을 한 문장으로 (120자 이내, 이름은 적지 않아도 됩니다)"></textarea>
          <div class="mem-row"><span class="mem-len">0 / 120</span>
            <button type="button" class="mem-quiet">조용히 머물기</button>
            <button type="submit" class="mem-go">빛으로 남기기</button></div>
        </form>
        <p class="mem-note">${esc(b.caption || '남긴 문장은 이 브라우저에만 저장되며 다른 사람에게 공개되지 않습니다.')}</p>
      </div>
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
      <p class="eyebrow">END OF X-${String(i + 1).padStart(3, '0')}</p>
      ${next && next.id !== c.id ? `<a class="next" href="cell.html?id=${encodeURIComponent(next.id)}" style="--accent:${esc(next.color)}"><span>${esc(b.title || '다음 행성으로')}</span><strong>${esc(next.title)}</strong></a>` : ''}
      <a class="back" href="./">← 행성계로 돌아가기</a>
    </section>`;
  },
};

(async () => {
  const { cells, blocks } = await loadData();
  const idx = cells.findIndex((c) => c.id === id);
  const cell = cells[idx];
  if (!cell || cell.status !== 'open') {
    story.innerHTML = `<section class="b-end"><p class="eyebrow">NOT FOUND</p><h2>아직 열리지 않은 행성입니다.</h2><a class="back" href="./">← 돌아가기</a></section>`;
    return finish('#7ee0d0');
  }
  document.title = `${cell.title} — XPACE`;
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
  setupStars();
  setupQuantum();
  setupBeams();
  setupPrism();
  setupShadow();
  setupRippleCover();
  setupSoundmap();
  setupListen();
  setupRiceCover();
  setupChapters();
  setupRecords();
  setupRicebowl();
  setupBoundary();
  setupMemory();
  setupBgm(cell);
})();

// ---------- 앰비언트 합성 엔진 ----------
function createAmbient(kind, onState) {
  let ctx, master, sparkleTimer, built = false;
  const rnd = (a, b) => a + Math.random() * (b - a);
  function impulse(sec) {
    const len = ctx.sampleRate * sec, buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = buf.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5); }
    return buf;
  }
  function build() {
    built = true;
    master = ctx.createGain(); master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor(); master.connect(comp).connect(ctx.destination);
    const verb = ctx.createConvolver(); verb.buffer = impulse(5);
    const wet = ctx.createGain(); wet.gain.value = 0.7; verb.connect(wet).connect(master);
    const dry = ctx.createGain(); dry.gain.value = 0.5; dry.connect(master);
    // 드론: A·E 중심의 열린 화음, 살짝 어긋난 두 개의 발진기
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700; lp.Q.value = 0.6;
    const lfo = ctx.createOscillator(), lfoG = ctx.createGain(); lfo.frequency.value = 0.04; lfoG.gain.value = 380;
    lfo.connect(lfoG).connect(lp.frequency); lfo.start();
    lp.connect(dry); lp.connect(verb);
    const PAL = {
      cosmos: { chord: [55, 82.41, 110, 164.81, 246.94], spark: [880, 987.77, 1108.73, 1318.51, 1479.98, 1760, 1975.53, 2217.46], cut: 700 },
      light: { chord: [130.81, 196, 246.94, 329.63, 392], spark: [1046.5, 1174.66, 1318.51, 1567.98, 1975.53, 2093, 2349.32, 2637], cut: 1400 },
    }[kind] || null;
    const pal = PAL || { chord: [55, 82.41, 110, 164.81, 246.94], spark: [880, 1108.73, 1318.51, 1760], cut: 700 };
    lp.frequency.value = pal.cut;
    pal.chord.forEach((f, i) => {
      [-5, 5].forEach((cents, j) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = j ? 'triangle' : 'sine'; o.frequency.value = f; o.detune.value = cents;
        g.gain.value = 0.05 / (1 + i * 0.5);
        const trem = ctx.createOscillator(), tg = ctx.createGain(); trem.frequency.value = rnd(0.03, 0.09); tg.gain.value = g.gain.value * 0.6;
        trem.connect(tg).connect(g.gain); trem.start();
        o.connect(g).connect(lp); o.start();
      });
    });
    // 우주의 바람: 대역통과 노이즈
    const nb = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate), nd = nb.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    const ns = ctx.createBufferSource(); ns.buffer = nb; ns.loop = true;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 500; bp.Q.value = 0.8;
    const nlfo = ctx.createOscillator(), nlg = ctx.createGain(); nlfo.frequency.value = 0.07; nlg.gain.value = 300; nlfo.connect(nlg).connect(bp.frequency); nlfo.start();
    const ng = ctx.createGain(); ng.gain.value = 0.018;
    ns.connect(bp).connect(ng).connect(verb); ns.start();
    // 별빛: 펜타토닉 고음이 무작위로 반짝임
    const notes = pal.spark;
    const sparkle = () => {
      const t = ctx.currentTime, f = notes[(Math.random() * notes.length) | 0];
      const o = ctx.createOscillator(), g = ctx.createGain(), pan = ctx.createStereoPanner();
      o.type = 'sine'; o.frequency.value = f; pan.pan.value = rnd(-0.8, 0.8);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(rnd(0.025, 0.05), t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + rnd(2, 4));
      o.connect(g).connect(pan); pan.connect(verb); pan.connect(dry);
      o.start(t); o.stop(t + 4.2);
      sparkleTimer = setTimeout(sparkle, rnd(900, 3200));
    };
    sparkle();
  }
  return {
    play() {
      try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
      if (!built) build();
      return ctx.resume().then(() => {
        if (ctx.state !== 'running') return;
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
        master.gain.linearRampToValueAtTime(0.55, ctx.currentTime + 3);
        onState(true);
      }).catch(() => {});
    },
    pause() {
      if (!ctx) return;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2);
      setTimeout(() => ctx.suspend(), 1300);
      onState(false);
    },
  };
}

// ---------- 별 (drift: 천천히 흐르는 별 / warp: 스크롤 진행에 따라 가속) ----------
function setupStars() {
  document.querySelectorAll('.star-cv').forEach((cv) => {
    const g = cv.getContext('2d'), mode = cv.dataset.mode;
    const sec = cv.closest('section');
    const dpr = Math.min(devicePixelRatio, 2);
    let w, h, visible = false, mx = 0, my = 0;
    const N = mode === 'warp' ? 900 : 500;
    const stars = Array.from({ length: N }, () => ({ x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2, z: Math.random(), hue: Math.random() < 0.15 ? 200 + Math.random() * 80 : 0 }));
    const size = () => { w = cv.clientWidth; h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size(); addEventListener('resize', size);
    addEventListener('pointermove', (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; });
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) requestAnimationFrame(draw); }).observe(sec);
    let last = performance.now();
    function draw(now) {
      if (!visible) return;
      const dt = Math.min(50, now - last) / 1000; last = now;
      let speed = 0.03;
      if (mode === 'warp') {
        const r = sec.getBoundingClientRect();
        const p = Math.max(0, Math.min(1, -r.top / Math.max(1, r.height - innerHeight)));
        speed = 0.05 + Math.pow(p, 2) * 1.6;
        sec.style.setProperty('--p', p.toFixed(3));
      }
      g.fillStyle = mode === 'warp' ? `rgba(4,5,12,${speed > 0.6 ? 0.35 : 0.9})` : 'rgba(5,6,13,1)';
      g.fillRect(0, 0, w, h);
      const cx = w / 2 - mx * 40, cy = h / 2 - my * 40, f = Math.max(w, h) * 0.6;
      for (const s of stars) {
        const pz = s.z;
        s.z -= speed * dt;
        if (s.z <= 0.02) { s.z = 1; s.x = (Math.random() - 0.5) * 2; s.y = (Math.random() - 0.5) * 2; continue; }
        const sx = cx + (s.x / s.z) * f * 0.5, sy = cy + (s.y / s.z) * f * 0.5;
        if (sx < -50 || sx > w + 50 || sy < -50 || sy > h + 50) continue;
        const a = Math.min(1, (1 - s.z) * 1.4);
        const rad = Math.max(0.4, (1 - s.z) * 2.2);
        g.strokeStyle = g.fillStyle = s.hue ? `hsla(${s.hue},90%,75%,${a})` : `rgba(235,240,255,${a})`;
        if (speed > 0.25) {
          const px = cx + (s.x / pz) * f * 0.5, py = cy + (s.y / pz) * f * 0.5;
          g.lineWidth = rad; g.beginPath(); g.moveTo(px, py); g.lineTo(sx, sy); g.stroke();
        } else { g.beginPath(); g.arc(sx, sy, rad, 0, 6.283); g.fill(); }
      }
      requestAnimationFrame(draw);
    }
  });
}

// ---------- 양자 관측 ----------
function setupQuantum() {
  document.querySelectorAll('.q-stage').forEach((stage) => {
    const cv = stage.querySelector('.q-cv'), g = cv.getContext('2d');
    const stateEl = stage.querySelector('.q-state'), countEl = stage.querySelector('.q-count'), tip = stage.querySelector('.q-tip');
    const dpr = Math.min(devicePixelRatio, 2);
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#9db8ff';
    let w, h, visible = false, count = 0;
    let collapse = null; // {x, y, t}
    const N = 1400;
    const P = Array.from({ length: N }, (_, i) => ({ a: Math.random() * 6.283, r: Math.random(), l: (i % 3) + 1, ph: Math.random() * 6.283, x: 0, y: 0 }));
    const size = () => { w = cv.clientWidth; h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size(); addEventListener('resize', size);
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) requestAnimationFrame(draw); }).observe(stage);
    stage.addEventListener('pointerdown', (e) => {
      const r = cv.getBoundingClientRect();
      // 관측 결과는 확률 분포를 따라 정해진다: 클릭 근처의 입자 하나를 '결과'로 선택
      const cx = e.clientX - r.left, cy = e.clientY - r.top;
      let best = P[0], bd = 1e9;
      for (let i = 0; i < 60; i++) { const p = P[(Math.random() * N) | 0]; const d = (p.x - cx) ** 2 + (p.y - cy) ** 2; if (d < bd) { bd = d; best = p; } }
      collapse = { x: best.x, y: best.y, t: performance.now() };
      count++; countEl.textContent = `관측 ${count}회`;
      stateEl.textContent = `상태: 붕괴 — 위치 (${((best.x / w) * 2 - 1).toFixed(2)}, ${(-(best.y / h) * 2 + 1).toFixed(2)})`;
      tip.classList.add('hide');
      stage.classList.add('flash'); setTimeout(() => stage.classList.remove('flash'), 300);
    });
    function draw(now) {
      if (!visible) return;
      const t = now / 1000;
      g.fillStyle = 'rgba(5,6,13,.28)'; g.fillRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.42;
      let k = 0; // 0 = 중첩, 1 = 완전 붕괴
      if (collapse) {
        const e = (now - collapse.t) / 1000;
        k = e < 0.35 ? e / 0.35 : e < 2.2 ? 1 : Math.max(0, 1 - (e - 2.2) / 1.6);
        if (e > 3.8) { collapse = null; stateEl.textContent = '상태: 중첩 (superposition)'; }
      }
      const ease = k * k * (3 - 2 * k);
      for (const p of P) {
        // 오비탈처럼 보이는 확률 분포 (l = 엽 개수)
        const ang = p.a + t * 0.15 * (p.l % 2 ? 1 : -1);
        const lobe = Math.abs(Math.cos(p.l * ang + Math.sin(t * 0.7 + p.ph) * 0.3));
        const rr = R * (0.15 + 0.85 * Math.sqrt(p.r) * lobe) + Math.sin(t * 3 + p.ph) * 4;
        const ox = cx + Math.cos(ang) * rr, oy = cy + Math.sin(ang) * rr * 0.8;
        const tx = collapse ? collapse.x + Math.cos(p.ph) * 3 * (1 - ease) : ox;
        const ty = collapse ? collapse.y + Math.sin(p.ph) * 3 * (1 - ease) : oy;
        p.x = ox + (tx - ox) * ease; p.y = oy + (ty - oy) * ease;
        g.fillStyle = p.l === 1 ? accent : p.l === 2 ? 'rgba(200,180,255,.8)' : 'rgba(235,240,255,.6)';
        g.fillRect(p.x, p.y, 1.4, 1.4);
      }
      if (collapse && ease > 0.6) {
        const grd = g.createRadialGradient(collapse.x, collapse.y, 0, collapse.x, collapse.y, 40 * ease);
        grd.addColorStop(0, 'rgba(255,255,255,.9)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = grd; g.beginPath(); g.arc(collapse.x, collapse.y, 40 * ease, 0, 6.283); g.fill();
      }
      requestAnimationFrame(draw);
    }
  });
}

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
  if (src.startsWith('ambient')) {
    // 웹오디오로 실시간 합성하는 오리지널 앰비언트 (저작권 걱정 없음)
    const amb = createAmbient(src.split(':')[1] || 'cosmos', setState);
    player = { play: () => amb.play(), pause: () => amb.pause() };
    btn.addEventListener('click', () => { if (playing) { userMuted = true; player.pause(); } else { userMuted = false; player.play(); } });
    player.play();
  } else {
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
        ctrl = c; window.__spCtrl = c;
        c.addListener('playback_update', (e) => { window.__spLast = e.data; setState(!e.data.isPaused && !e.data.isBuffering ? true : (e.data.isBuffering ? playing : false)); });
        // 사용자 활성화가 있을 때만 재생 요청 (활성화 없이 요청하면 막힘)
        c.addListener('ready', () => { if (!userMuted && (pending || navigator.userActivation?.hasBeenActive)) c.play(); });
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
  function closeGate() { const g = gate; if (g) { g.classList.add('out'); setTimeout(() => g.remove(), 600); gate = null; } }
  setTimeout(() => {
    if (playing || userMuted) return;
    gate = document.createElement('div');
    gate.className = 'sound-gate';
    gate.innerHTML = `<div class="sg-inner"><p class="eyebrow">THIS PLANET HAS SOUND</p>
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
  setTimeout(() => wipe.classList.remove('on'), 60);
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
    const orb = sec.querySelector('.spin-orbit'); if (orb) orb.style.setProperty('--k', k);
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

// ================= CELL 002 · 003 인터랙션 =================
// 캔버스 공통: 크기 맞춤 + 화면에 보일 때만 그리기
function canvasLoop(cv, draw, opts = {}) {
  const g = cv.getContext('2d'), dpr = Math.min(devicePixelRatio, 2);
  const st = { w: 0, h: 0, mx: -1, my: -1, inside: false, visible: false };
  const size = () => { st.w = cv.clientWidth; st.h = cv.clientHeight; cv.width = st.w * dpr; cv.height = st.h * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); };
  size(); addEventListener('resize', size);
  const host = opts.host || cv.parentElement;
  host.addEventListener('pointermove', (e) => { const r = cv.getBoundingClientRect(); st.mx = e.clientX - r.left; st.my = e.clientY - r.top; st.inside = true; });
  host.addEventListener('pointerleave', () => { st.inside = false; });
  const tick = (now) => { if (!st.visible) return; draw(g, st, now / 1000); requestAnimationFrame(tick); };
  new IntersectionObserver(([e]) => { st.visible = e.isIntersecting; if (st.visible) requestAnimationFrame(tick); }).observe(host);
  return st;
}

// --- 빛줄기 커버 ---
function setupBeams() {
  document.querySelectorAll('.beam-cv').forEach((cv) => {
    const motes = Array.from({ length: 140 }, () => ({ x: Math.random(), y: Math.random(), s: Math.random() * 1.6 + 0.4, v: Math.random() * 0.02 + 0.005 }));
    canvasLoop(cv, (g, st, t) => {
      const { w, h } = st;
      g.globalCompositeOperation = 'source-over';
      g.fillStyle = '#0a0906'; g.fillRect(0, 0, w, h);
      g.globalCompositeOperation = 'lighter';
      const mx = st.inside ? st.mx / w - 0.5 : Math.sin(t * 0.2) * 0.3;
      for (let i = 0; i < 6; i++) {
        const a = -Math.PI / 2 + (i - 2.5) * 0.18 + Math.sin(t * 0.3 + i) * 0.06 + mx * 0.4;
        const ox = w * (0.5 + mx * 0.3), oy = -h * 0.15, len = h * 1.6, wid = 60 + 40 * Math.sin(t * 0.5 + i * 2);
        const ex = ox - Math.cos(a) * len, ey = oy - Math.sin(a) * len;
        const grd = g.createLinearGradient(ox, oy, ex, ey);
        const hue = 40 + i * 4;
        grd.addColorStop(0, `hsla(${hue},90%,75%,.22)`); grd.addColorStop(1, `hsla(${hue},90%,60%,0)`);
        g.fillStyle = grd;
        const nx = Math.sin(a) * wid, ny = -Math.cos(a) * wid;
        g.beginPath(); g.moveTo(ox - nx * 0.15, oy - ny * 0.15); g.lineTo(ox + nx * 0.15, oy + ny * 0.15); g.lineTo(ex + nx, ey + ny); g.lineTo(ex - nx, ey - ny); g.fill();
      }
      for (const m of motes) {
        m.y -= m.v * 0.016; m.x += Math.sin(t + m.y * 10) * 0.0004; if (m.y < 0) m.y = 1;
        g.fillStyle = `rgba(255,236,190,${0.25 + 0.35 * Math.sin(t * 2 + m.x * 30) ** 2})`;
        g.beginPath(); g.arc(m.x * w, m.y * h, m.s, 0, 6.283); g.fill();
      }
      g.globalCompositeOperation = 'source-over';
    }, { host: cv.closest('section') });
  });
}

// --- 프리즘 ---
function setupPrism() {
  const refract = (d, n, eta) => { // d: 입사 단위벡터, n: 입사 쪽을 향한 법선
    const ci = -(n.x * d.x + n.y * d.y), k = 1 - eta * eta * (1 - ci * ci);
    if (k < 0) return null;
    const c = eta * ci - Math.sqrt(k);
    return { x: eta * d.x + c * n.x, y: eta * d.y + c * n.y };
  };
  const hit = (p, d, a, b) => { // 광선 p+t d 와 선분 ab 교차
    const ex = b.x - a.x, ey = b.y - a.y, den = d.x * ey - d.y * ex;
    if (Math.abs(den) < 1e-9) return null;
    const t = ((a.x - p.x) * ey - (a.y - p.y) * ex) / den, u = ((a.x - p.x) * d.y - (a.y - p.y) * d.x) / den;
    return t > 1e-6 && u >= 0 && u <= 1 ? { x: p.x + t * d.x, y: p.y + t * d.y, t } : null;
  };
  const norm = (v) => { const l = Math.hypot(v.x, v.y); return { x: v.x / l, y: v.y / l }; };
  // 색에 따른 굴절률 차이를 실제 유리(약 1.51~1.53)보다 크게 잡아 눈에 보이게 함
  const BANDS = [[0, 1.33], [25, 1.35], [50, 1.37], [110, 1.39], [190, 1.41], [235, 1.43], [270, 1.45]];
  document.querySelectorAll('.prism-cv').forEach((cv) => {
    const tip = cv.parentElement.querySelector('.q-tip');
    cv.parentElement.addEventListener('pointermove', () => tip.classList.add('hide'), { once: true });
    canvasLoop(cv, (g, st, t) => {
      const { w, h } = st, s = Math.min(w, h) * 0.42, cx = w * 0.5, cy = h * 0.55;
      const A = { x: cx, y: cy - s * 0.85 }, B = { x: cx - s * 0.6, y: cy + s * 0.35 }, C = { x: cx + s * 0.6, y: cy + s * 0.35 };
      g.fillStyle = 'rgba(10,9,6,.5)'; g.fillRect(0, 0, w, h);
      const src = st.inside && st.mx < cx - s * 0.3 ? { x: st.mx, y: st.my } : { x: w * 0.06, y: cy + s * 0.25 + Math.sin(t * 0.6) * h * 0.12 };
      const target = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
      const d0 = norm({ x: target.x - src.x, y: target.y - src.y });
      const n1raw = norm({ x: -(B.y - A.y), y: B.x - A.x }); // AB 법선
      const n1 = n1raw.x * d0.x + n1raw.y * d0.y > 0 ? { x: -n1raw.x, y: -n1raw.y } : n1raw;
      const e1 = hit(src, d0, A, B);
      g.globalCompositeOperation = 'lighter';
      if (e1) {
        g.strokeStyle = 'rgba(255,250,235,.95)'; g.lineWidth = 4; g.shadowColor = '#fff'; g.shadowBlur = 16;
        g.beginPath(); g.moveTo(src.x, src.y); g.lineTo(e1.x, e1.y); g.stroke(); g.shadowBlur = 0;
        for (const [hue, n] of BANDS) {
          const d1 = refract(d0, n1, 1 / n); if (!d1) continue;
          let e2 = hit(e1, d1, A, C) || hit(e1, d1, B, C); if (!e2) continue;
          const onAC = !!hit(e1, d1, A, C);
          const fa = onAC ? A : B, fb = C;
          let n2 = norm({ x: -(fb.y - fa.y), y: fb.x - fa.x });
          if (n2.x * d1.x + n2.y * d1.y > 0) n2 = { x: -n2.x, y: -n2.y };
          const d2 = refract(d1, n2, n);
          g.strokeStyle = `hsla(${hue},100%,62%,.35)`; g.lineWidth = 3;
          g.beginPath(); g.moveTo(e1.x, e1.y); g.lineTo(e2.x, e2.y); g.stroke();
          if (!d2) continue; // 전반사
          g.strokeStyle = `hsla(${hue},100%,60%,.85)`; g.lineWidth = 5; g.shadowColor = `hsl(${hue},100%,60%)`; g.shadowBlur = 14;
          g.beginPath(); g.moveTo(e2.x, e2.y); g.lineTo(e2.x + d2.x * w * 2, e2.y + d2.y * w * 2); g.stroke(); g.shadowBlur = 0;
        }
      }
      g.globalCompositeOperation = 'source-over';
      g.fillStyle = 'rgba(200,220,255,.07)'; g.strokeStyle = 'rgba(230,240,255,.7)'; g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(A.x, A.y); g.lineTo(B.x, B.y); g.lineTo(C.x, C.y); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = 'rgba(255,250,235,.9)'; g.beginPath(); g.arc(src.x, src.y, 6, 0, 6.283); g.fill();
    });
  });
}

// --- 그림자 ---
function setupShadow() {
  document.querySelectorAll('.shadow-cv').forEach((cv) => {
    const tip = cv.parentElement.querySelector('.q-tip');
    cv.parentElement.addEventListener('pointermove', () => tip.classList.add('hide'), { once: true });
    const boxes = [[0.3, 0.35, 0.07], [0.62, 0.3, 0.05], [0.5, 0.62, 0.09], [0.78, 0.62, 0.045], [0.2, 0.7, 0.04]].map(([x, y, r], i) => ({ x, y, r, a: i, sp: (i % 2 ? 1 : -1) * (0.15 + i * 0.05) }));
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#f2c14e';
    canvasLoop(cv, (g, st, t) => {
      const { w, h } = st, m = Math.min(w, h);
      const L = st.inside ? { x: st.mx, y: st.my } : { x: w * (0.5 + Math.cos(t * 0.4) * 0.3), y: h * (0.5 + Math.sin(t * 0.55) * 0.3) };
      const grd = g.createRadialGradient(L.x, L.y, 0, L.x, L.y, Math.max(w, h) * 0.8);
      grd.addColorStop(0, '#fff3cf'); grd.addColorStop(0.08, '#f2c14e'); grd.addColorStop(0.45, '#5a4310'); grd.addColorStop(1, '#0a0906');
      g.fillStyle = grd; g.fillRect(0, 0, w, h);
      const polys = boxes.map((b) => {
        const a = b.a + t * b.sp, cx = b.x * w, cy = b.y * h, r = b.r * m * 1.4;
        return [0, 1, 2, 3].map((k) => ({ x: cx + Math.cos(a + k * Math.PI / 2) * r, y: cy + Math.sin(a + k * Math.PI / 2) * r }));
      });
      g.fillStyle = 'rgba(10,9,6,.88)';
      for (const P of polys) for (let k = 0; k < 4; k++) {
        const p1 = P[k], p2 = P[(k + 1) % 4], far = 4000;
        const q1 = { x: p1.x + (p1.x - L.x) * far / Math.hypot(p1.x - L.x, p1.y - L.y), y: p1.y + (p1.y - L.y) * far / Math.hypot(p1.x - L.x, p1.y - L.y) };
        const q2 = { x: p2.x + (p2.x - L.x) * far / Math.hypot(p2.x - L.x, p2.y - L.y), y: p2.y + (p2.y - L.y) * far / Math.hypot(p2.x - L.x, p2.y - L.y) };
        g.beginPath(); g.moveTo(p1.x, p1.y); g.lineTo(p2.x, p2.y); g.lineTo(q2.x, q2.y); g.lineTo(q1.x, q1.y); g.fill();
      }
      for (const P of polys) {
        g.fillStyle = '#16120a'; g.strokeStyle = accent; g.lineWidth = 1.5;
        g.beginPath(); P.forEach((p, k) => (k ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y))); g.closePath(); g.fill(); g.stroke();
      }
      g.fillStyle = '#fff'; g.beginPath(); g.arc(L.x, L.y, 5, 0, 6.283); g.fill();
    });
  });
}

// --- 소리 커버: 퍼져나가는 파문 ---
function setupRippleCover() {
  document.querySelectorAll('.rip-cv').forEach((cv) => {
    const rings = [];
    const sec = cv.closest('section');
    sec.addEventListener('pointerdown', (e) => { const r = cv.getBoundingClientRect(); rings.push({ x: e.clientX - r.left, y: e.clientY - r.top, t0: performance.now() / 1000, big: true }); });
    let next = 0;
    canvasLoop(cv, (g, st, t) => {
      const { w, h } = st;
      g.fillStyle = 'rgba(14,8,8,.35)'; g.fillRect(0, 0, w, h);
      if (t > next) { rings.push({ x: w * (0.15 + Math.random() * 0.7), y: h * (0.15 + Math.random() * 0.7), t0: t }); next = t + 0.5 + Math.random() * 0.9; }
      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i], age = Math.max(0, t - r.t0), life = r.big ? 5 : 3.5;
        if (age > life) { rings.splice(i, 1); continue; }
        for (let k = 0; k < 3; k++) {
          const rad = (age - k * 0.25) * (r.big ? 160 : 90); if (rad <= 0) continue;
          g.strokeStyle = `rgba(239,111,108,${(1 - age / life) * (0.55 - k * 0.15)})`; g.lineWidth = r.big ? 2 : 1.2;
          g.beginPath(); g.arc(r.x, r.y, rad, 0, 6.283); g.stroke();
        }
      }
    }, { host: sec });
  });
}

// --- 사운드맵: 웹오디오로 합성한 6개의 장소 ---
let smCtx;
function noiseBuf(ctx, sec, type = 'white') {
  const len = ctx.sampleRate * sec, b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; if (type === 'brown') { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; } else d[i] = w; }
  return b;
}
const PLACES = [
  { id: 'rain', name: '골목의 비', x: 0.22, y: 0.3 },
  { id: 'sea', name: '바닷가', x: 0.12, y: 0.78 },
  { id: 'subway', name: '지하철 승강장', x: 0.55, y: 0.55 },
  { id: 'birds', name: '새벽 공원', x: 0.8, y: 0.22 },
  { id: 'bell', name: '산사의 종', x: 0.86, y: 0.76 },
  { id: 'steps', name: '횡단보도', x: 0.45, y: 0.2 },
];
function makePlace(ctx, id, out) {
  const nodes = [], timers = [];
  const src = (buf, loop = true) => { const s = ctx.createBufferSource(); s.buffer = buf; s.loop = loop; nodes.push(s); return s; };
  const filt = (type, f, q = 1) => { const b = ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b; };
  const gain = (v) => { const g = ctx.createGain(); g.gain.value = v; return g; };
  const lfo = (f, depth, param) => { const o = ctx.createOscillator(), g = gain(depth); o.frequency.value = f; o.connect(g).connect(param); o.start(); nodes.push(o); };
  const every = (fn, a, b) => { const go = () => { fn(); timers.push(setTimeout(go, a + Math.random() * (b - a))); }; go(); };
  const blip = (f0, f1, dur, vol, type = 'sine', to = out) => {
    const t = ctx.currentTime, o = ctx.createOscillator(), g = gain(0); o.type = type;
    o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(to); o.start(t); o.stop(t + dur + 0.05);
  };
  if (id === 'rain') {
    const s = src(noiseBuf(ctx, 3)); s.connect(filt('highpass', 900)).connect(filt('lowpass', 7000)).connect(gain(0.12)).connect(out); s.start();
    const drop = noiseBuf(ctx, 0.05);
    every(() => { const d = src(drop, false), bp = filt('bandpass', 1500 + Math.random() * 4000, 6); d.connect(bp).connect(gain(0.25 + Math.random() * 0.3)).connect(out); d.start(); }, 40, 220);
  } else if (id === 'sea') {
    const s = src(noiseBuf(ctx, 4, 'brown')), lp = filt('lowpass', 500), g = gain(0.25);
    s.connect(lp).connect(g).connect(out); s.start();
    lfo(0.09, 0.22, g.gain); lfo(0.09, 400, lp.frequency);
  } else if (id === 'subway') {
    const s = src(noiseBuf(ctx, 4, 'brown')), lp = filt('lowpass', 180), g = gain(0.4);
    s.connect(lp).connect(g).connect(out); s.start(); lfo(0.05, 0.25, g.gain);
    every(() => { blip(784, 784, 0.6, 0.06, 'triangle'); setTimeout(() => blip(659, 659, 0.9, 0.06, 'triangle'), 450); }, 7000, 12000);
  } else if (id === 'birds') {
    every(() => { const n = 2 + (Math.random() * 4) | 0, base = 2200 + Math.random() * 1800; for (let i = 0; i < n; i++) setTimeout(() => blip(base, base * (1.3 + Math.random() * 0.5), 0.07 + Math.random() * 0.08, 0.05), i * 110); }, 600, 2600);
  } else if (id === 'bell') {
    const strike = () => { [1, 2.41, 2.98, 4.17, 5.43].forEach((m, i) => { const t = ctx.currentTime, o = ctx.createOscillator(), g = gain(0); o.frequency.value = 98 * m; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.12 / (i + 1), t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 9 - i); o.connect(g).connect(out); o.start(t); o.stop(t + 9.2); }); };
    every(strike, 6500, 9000);
  } else if (id === 'steps') {
    const thump = noiseBuf(ctx, 0.08);
    let k = 0;
    every(() => { const d = src(thump, false); d.connect(filt('lowpass', 300 + Math.random() * 200)).connect(gain(0.5)).connect(out); d.start(); if (++k % 24 === 0) blip(1000, 1000, 0.12, 0.04, 'square'); }, 380, 560);
  }
  return { stop() { timers.forEach(clearTimeout); nodes.forEach((n) => { try { n.stop(); } catch (e) {} }); } };
}
function setupSoundmap() {
  document.querySelectorAll('.sm-stage').forEach((stage) => {
    const cv = stage.querySelector('.sm-cv'), wrap = stage.querySelector('.sm-nodes');
    const now = stage.querySelector('.sm-now'), cnt = stage.querySelector('.sm-count');
    const active = new Map(), rings = [];
    // 추상적인 도시 지도 (고정 난수)
    let seed = 7; const rr = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    const roads = Array.from({ length: 22 }, () => ({ x1: rr(), y1: rr(), x2: rr(), y2: rr(), w: rr() < 0.25 ? 3 : 1 }));
    PLACES.forEach((p) => {
      const b = document.createElement('button');
      b.className = 'sm-node'; b.style.left = p.x * 100 + '%'; b.style.top = p.y * 100 + '%';
      b.innerHTML = `<i></i><span>${p.name}</span>`;
      b.addEventListener('click', () => {
        smCtx = smCtx || new (window.AudioContext || window.webkitAudioContext)(); smCtx.resume();
        if (active.has(p.id)) { const a = active.get(p.id); a.g.gain.linearRampToValueAtTime(0, smCtx.currentTime + 0.8); setTimeout(() => a.place.stop(), 900); active.delete(p.id); b.classList.remove('on'); }
        else {
          const g = smCtx.createGain(), pan = smCtx.createStereoPanner(); pan.pan.value = (p.x - 0.5) * 1.6;
          g.gain.value = 0; g.gain.linearRampToValueAtTime(1, smCtx.currentTime + 1.2); g.connect(pan).connect(smCtx.destination);
          active.set(p.id, { place: makePlace(smCtx, p.id, g), g }); b.classList.add('on');
          rings.push({ p, t0: performance.now() / 1000, big: true });
        }
        now.textContent = active.size ? '지금 듣는 곳: ' + PLACES.filter((q) => active.has(q.id)).map((q) => q.name).join(' · ') : '지도 위 장소를 눌러 소리를 켜고 끄세요';
        cnt.textContent = `${active.size} / ${PLACES.length}`;
      });
      wrap.appendChild(b);
    });
    let next = 0;
    const st = canvasLoop(cv, (g, st, t) => {
      const { w, h } = st;
      g.fillStyle = '#0e0808'; g.fillRect(0, 0, w, h);
      g.strokeStyle = 'rgba(242,241,236,.07)';
      for (const r of roads) { g.lineWidth = r.w; g.beginPath(); g.moveTo(r.x1 * w, r.y1 * h); g.lineTo(r.x2 * w, r.y2 * h); g.stroke(); }
      if (t > next && active.size) { const ids = [...active.keys()]; rings.push({ p: PLACES.find((q) => q.id === ids[(Math.random() * ids.length) | 0]), t0: t }); next = t + 0.35; }
      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i], age = Math.max(0, t - r.t0), life = r.big ? 3 : 2.4;
        if (age > life || !r.p) { rings.splice(i, 1); continue; }
        g.strokeStyle = `rgba(239,111,108,${(1 - age / life) * (r.big ? 0.8 : 0.4)})`; g.lineWidth = r.big ? 2 : 1;
        g.beginPath(); g.arc(r.p.x * w, r.p.y * h, age * (r.big ? 140 : 80), 0, 6.283); g.stroke();
      }
    });
    // 셀을 떠나면 소리 정리
    addEventListener('pagehide', () => active.forEach((a) => a.place.stop()));
  });
}

// --- 마이크 스펙트로그램 ---
function setupListen() {
  document.querySelectorAll('.listen-stage').forEach((stage) => {
    const cv = stage.querySelector('.listen-cv'), btn = stage.querySelector('.listen-btn');
    const stEl = stage.querySelector('.listen-state'), dbEl = stage.querySelector('.listen-db');
    let analyser, stream, ctx, data, col = 0;
    const g = cv.getContext('2d');
    const size = () => { cv.width = cv.clientWidth; cv.height = cv.clientHeight; g.fillStyle = '#0e0808'; g.fillRect(0, 0, cv.width, cv.height); };
    size(); addEventListener('resize', size);
    const stop = () => { stream && stream.getTracks().forEach((tr) => tr.stop()); stream = null; analyser = null; btn.textContent = '● 마이크 켜고 듣기'; btn.classList.remove('on'); stEl.textContent = '꺼짐'; dbEl.textContent = ''; };
    btn.addEventListener('click', async () => {
      if (stream) return stop();
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); await ctx.resume();
        analyser = ctx.createAnalyser(); analyser.fftSize = 1024; analyser.smoothingTimeConstant = 0.5;
        ctx.createMediaStreamSource(stream).connect(analyser); // 스피커로 내보내지 않음
        data = new Uint8Array(analyser.frequencyBinCount);
        btn.textContent = '■ 마이크 끄기'; btn.classList.add('on'); stEl.textContent = '듣는 중 — 녹음·전송되지 않습니다';
        const draw = () => {
          if (!analyser) return;
          analyser.getByteFrequencyData(data);
          const H = cv.height, W = cv.width, x = col % W;
          let sum = 0;
          for (let y = 0; y < H; y++) {
            const i = Math.floor(Math.pow(1 - y / H, 2) * data.length * 0.7); // 저음을 아래에, 로그 비슷하게
            const v = data[i] / 255; sum += v;
            g.fillStyle = `hsla(${360 - v * 60},${60 + v * 40}%,${8 + v * 60}%,1)`; g.fillRect(x, y, 2, 1);
          }
          g.fillStyle = 'rgba(242,241,236,.6)'; g.fillRect((x + 2) % W, 0, 1, H);
          col += 2;
          dbEl.textContent = '상대 음량 ' + Math.round((sum / H) * 100);
          requestAnimationFrame(draw);
        };
        draw();
      } catch (e) { stEl.textContent = '마이크를 사용할 수 없어요 (권한을 확인해 주세요)'; stop(); stEl.textContent = '마이크 권한이 없어요'; }
    });
    addEventListener('pagehide', stop);
  });
}

// ================= X-005 빛쌀 인터랙션 =================
// --- 커버: 어둠 속 한 톨의 쌀알이 커서를 따라 움직임 ---
function riceGrain(g, x, y, len, rot, alpha = 1, glow = 18) {
  g.save(); g.translate(x, y); g.rotate(rot);
  g.shadowColor = `rgba(255,248,230,${0.8 * alpha})`; g.shadowBlur = glow;
  const grd = g.createLinearGradient(-len, 0, len, 0);
  grd.addColorStop(0, `rgba(235,226,205,${alpha})`); grd.addColorStop(0.5, `rgba(255,253,246,${alpha})`); grd.addColorStop(1, `rgba(225,214,190,${alpha})`);
  g.fillStyle = grd; g.beginPath(); g.ellipse(0, 0, len, len * 0.42, 0, 0, 6.283); g.fill();
  g.restore();
}
function setupRiceCover() {
  document.querySelectorAll('.rice-cv').forEach((cv) => {
    const sec = cv.closest('section');
    const p = { x: 0, y: 0, vx: 0, vy: 0, rot: 0.4 };
    const dust = Array.from({ length: 90 }, () => ({ x: Math.random(), y: Math.random(), s: Math.random() * 1.2 + 0.3, v: Math.random() * 0.01 + 0.002 }));
    let init = false;
    const zoomBtn = document.createElement('button');
    zoomBtn.className = 'rice-zoom'; zoomBtn.textContent = '가까이 보기';
    zoomBtn.addEventListener('click', () => { const nx = sec.nextElementSibling; nx && nx.scrollIntoView({ behavior: 'smooth' }); });
    sec.querySelector('.cover-text')?.appendChild(zoomBtn);
    canvasLoop(cv, (g, st, t) => {
      const { w, h } = st;
      if (!init) { p.x = w / 2; p.y = h * 0.28; init = true; }
      g.fillStyle = '#050505'; g.fillRect(0, 0, w, h);
      for (const d of dust) { d.y -= d.v * 0.016; if (d.y < 0) d.y = 1; g.fillStyle = `rgba(255,245,225,${0.15 + 0.2 * Math.sin(t + d.x * 20) ** 2})`; g.fillRect(d.x * w, d.y * h, d.s, d.s); }
      const tx = st.inside ? st.mx : w / 2 + Math.sin(t * 0.5) * 30, ty = st.inside ? st.my : h * 0.28 + Math.cos(t * 0.7) * 10;
      p.vx += (tx - p.x) * 0.004; p.vy += (ty - p.y) * 0.004; p.vx *= 0.9; p.vy *= 0.9; p.x += p.vx; p.y += p.vy;
      p.rot += (Math.atan2(p.vy, p.vx || 0.001) * 0.2 - p.rot) * 0.02 + 0.002;
      const halo = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, 140);
      halo.addColorStop(0, 'rgba(255,240,210,.18)'); halo.addColorStop(1, 'rgba(255,240,210,0)');
      g.fillStyle = halo; g.fillRect(p.x - 140, p.y - 140, 280, 280);
      riceGrain(g, p.x, p.y, 16 + Math.sin(t * 1.2) * 0.8, p.rot, 1, 26);
    }, { host: sec });
  });
}

// --- 챕터 메뉴 ---
function setupChapters() {
  const chs = [...document.querySelectorAll('.b-chapter')];
  if (!chs.length) return;
  const nav = document.createElement('nav');
  nav.className = 'ch-nav'; nav.setAttribute('aria-label', '챕터 메뉴');
  nav.innerHTML = `<button class="ch-toggle" aria-expanded="false">CHAPTERS</button><ol>${chs.map((c, k) => { c.id = 'ch-' + (k + 1); return `<li><a href="#ch-${k + 1}"><span>${String(k + 1).padStart(2, '0')}</span>${esc(c.dataset.title)}</a></li>`; }).join('')}</ol>`;
  document.body.appendChild(nav);
  const tg = nav.querySelector('.ch-toggle');
  tg.addEventListener('click', () => { const o = nav.classList.toggle('open'); tg.setAttribute('aria-expanded', String(o)); });
  nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); e.stopImmediatePropagation(); document.querySelector(a.getAttribute('href')).scrollIntoView({ behavior: 'smooth' }); nav.classList.remove('open'); }, true));
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    const k = chs.indexOf(e.target);
    nav.querySelectorAll('li').forEach((li, j) => li.classList.toggle('on', j === k));
    tg.textContent = `${String(k + 1).padStart(2, '0')} / ${String(chs.length).padStart(2, '0')}  CHAPTERS`;
  }), { rootMargin: '-40% 0px -55% 0px' });
  chs.forEach((c) => io.observe(c));
  // 각 챕터 구간(다음 챕터 전까지)도 현재 위치로 인식
  addEventListener('scroll', () => {
    let k = -1; chs.forEach((c, j) => { if (c.getBoundingClientRect().top < innerHeight * 0.5) k = j; });
    nav.classList.toggle('show', k >= 0);
    if (k >= 0) { nav.querySelectorAll('li').forEach((li, j) => li.classList.toggle('on', j === k)); tg.textContent = `${String(k + 1).padStart(2, '0')} / ${String(chs.length).padStart(2, '0')}  CHAPTERS`; }
  }, { passive: true });
}

// --- 기록 탭 ---
function setupRecords() {
  document.querySelectorAll('.b-records').forEach((sec) => {
    const tabs = [...sec.querySelectorAll('[role=tab]')], cards = [...sec.querySelectorAll('.rec-card')];
    const show = (k) => { tabs.forEach((t, j) => t.setAttribute('aria-selected', String(j === k))); cards.forEach((c, j) => (c.hidden = j !== k)); };
    tabs.forEach((t, k) => {
      t.addEventListener('click', () => show(k));
      t.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { const n = (k + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length; show(n); tabs[n].focus(); } });
    });
  });
}

// --- 쌀알 옮기기 ---
function setupRicebowl() {
  document.querySelectorAll('.b-ricebowl').forEach((sec) => {
    const cv = sec.querySelector('.rb-cv'), btn = sec.querySelector('.rb-btn'), cnt = sec.querySelector('.rb-count');
    const lis = [...sec.querySelectorAll('.rb-list li')];
    let opened = 0, drag = null;
    const open = () => {
      if (opened >= lis.length) return;
      lis[opened].hidden = false; lis[opened].classList.add('in'); opened++;
      cnt.textContent = `${opened} / ${lis.length}`;
      if (opened >= lis.length) { btn.disabled = true; btn.firstChild.textContent = '모든 기록을 펼쳤습니다 '; }
    };
    btn.addEventListener('click', open);
    let grains = [];
    const st = canvasLoop(cv, (g, st, t) => {
      const { w, h } = st;
      if (!grains.length && w) grains = Array.from({ length: 28 }, () => ({ x: w * (0.1 + Math.random() * 0.8), y: h * (0.08 + Math.random() * 0.35), r: Math.random() * 6.28, home: true, fall: 0 }));
      g.fillStyle = '#0a0806'; g.fillRect(0, 0, w, h);
      const bx = w / 2, by = h * 0.82, bw = Math.min(w * 0.36, 220);
      // 그릇
      g.strokeStyle = 'rgba(255,248,230,.55)'; g.lineWidth = 2;
      g.beginPath(); g.ellipse(bx, by - 30, bw, 18, 0, 0, 6.283); g.stroke();
      g.beginPath(); g.moveTo(bx - bw, by - 30); g.quadraticCurveTo(bx, by + 60, bx + bw, by - 30); g.stroke();
      const fill = Math.min(1, opened / Math.max(1, lis.length));
      if (fill > 0) { g.fillStyle = `rgba(255,246,225,${0.12 + fill * 0.2})`; g.beginPath(); g.ellipse(bx, by - 26 + (1 - fill) * 20, bw * (0.55 + fill * 0.4), 12, 0, 0, 6.283); g.fill(); }
      for (const gr of grains) {
        if (gr.inBowl) { gr.fall = Math.min(1, gr.fall + 0.05); }
        riceGrain(g, gr.x, gr.y, 7, gr.r, gr.inBowl ? 0.85 : 1, drag === gr ? 22 : 10);
      }
      g.fillStyle = 'rgba(242,241,236,.4)'; g.font = '12px Pretendard, sans-serif'; g.textAlign = 'center';
      g.fillText('그릇', bx, by + 52);
      st.bowl = { bx, by, bw };
    });
    const pos = (e) => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    cv.parentElement.addEventListener('pointerdown', (e) => {
      if (e.target === btn || btn.contains(e.target)) return;
      const p = pos(e);
      drag = grains.filter((g) => !g.inBowl).sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y))[0];
      if (drag && Math.hypot(drag.x - p.x, drag.y - p.y) > 40) drag = null;
      if (drag) cv.parentElement.setPointerCapture(e.pointerId);
    });
    cv.parentElement.addEventListener('pointermove', (e) => { if (!drag) return; const p = pos(e); drag.x = p.x; drag.y = p.y; drag.r += 0.05; });
    cv.parentElement.addEventListener('pointerup', () => {
      if (!drag) return;
      const b = st.bowl;
      if (b && Math.abs(drag.x - b.bx) < b.bw && drag.y > b.by - 80 && drag.y < b.by + 40) {
        drag.inBowl = true; drag.x = b.bx + (Math.random() - 0.5) * b.bw * 1.2; drag.y = b.by - 26 + (Math.random() - 0.5) * 12; open();
      }
      drag = null;
    });
  });
}

// --- 경계·안내 화면 ---
function setupBoundary() {
  document.querySelectorAll('.b-boundary').forEach((sec) => {
    sec.querySelectorAll('[data-act]').forEach((b) => b.addEventListener('click', () => {
      const act = b.dataset.act;
      if (act === 'continue') { const nx = sec.nextElementSibling; nx && nx.scrollIntoView({ behavior: 'smooth' }); }
      if (act === 'summary') { const s = sec.querySelector('.bd-summary'); s.hidden = !s.hidden; b.textContent = s.hidden ? '요약만 보기' : '요약 닫기'; if (!s.hidden) s.focus?.(); }
      if (act === 'next') {
        let n = sec.nextElementSibling;
        while (n && !n.classList.contains('b-chapter') && !n.classList.contains('b-end')) n = n.nextElementSibling;
        n && n.scrollIntoView({ behavior: 'smooth' });
      }
    }));
  });
}

// --- 기억 한 문장 → 빛 ---
function setupMemory() {
  document.querySelectorAll('.b-memory').forEach((sec) => {
    const cv = sec.querySelector('.mem-cv'), form = sec.querySelector('.mem-form'), ta = sec.querySelector('textarea');
    const len = sec.querySelector('.mem-len'), note = sec.querySelector('.mem-note');
    const KEY = 'xpace-bitssal-memories';
    let saved = [];
    try { saved = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) {}
    const lights = Array.from({ length: 70 }, () => ({ x: Math.random(), y: 0.25 + Math.random() * 0.7, r: Math.random() * 1.6 + 0.6, ph: Math.random() * 6.28, mine: false }));
    saved.forEach((s) => lights.push({ x: s.x, y: s.y, r: 3, ph: Math.random() * 6.28, mine: true, text: s.text }));
    let born = null, hover = null;
    ta.addEventListener('input', () => { len.textContent = `${ta.value.length} / 120`; });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = ta.value.trim().slice(0, 120);
      if (!text) { ta.focus(); return; }
      const l = { x: Math.random() < 0.5 ? 0.08 + Math.random() * 0.17 : 0.75 + Math.random() * 0.17, y: 0.25 + Math.random() * 0.6, r: 3, ph: 0, mine: true, text, t0: performance.now() };
      lights.push(l); born = l;
      try { saved.push({ x: l.x, y: l.y, text }); localStorage.setItem(KEY, JSON.stringify(saved.slice(-30))); } catch (e2) {}
      ta.value = ''; len.textContent = '0 / 120';
      note.textContent = '당신의 문장이 빛이 되었습니다. 빛 위에 마우스를 올리면 문장을 다시 볼 수 있어요. (이 브라우저에만 저장됩니다)';
    });
    sec.querySelector('.mem-quiet').addEventListener('click', () => { form.classList.add('quiet'); note.textContent = '잠시 머물러도 좋습니다. 빛은 계속 이곳에 있습니다.'; });
    cv.parentElement.addEventListener('pointermove', (e) => {
      const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      hover = lights.filter((l) => l.mine).find((l) => Math.hypot((l.x - x) * r.width, (l.y - y) * r.height) < 16) || null;
    });
    canvasLoop(cv, (g, st, t) => {
      const { w, h } = st;
      g.fillStyle = 'rgba(5,5,5,.35)'; g.fillRect(0, 0, w, h);
      for (const l of lights) {
        const tw = 0.5 + 0.5 * Math.sin(t * 1.3 + l.ph);
        let rr = l.r * (l.mine ? 1.4 + tw * 0.6 : 0.8 + tw * 0.5);
        if (l.t0) { const k = Math.min(1, (performance.now() - l.t0) / 1800); rr *= 1 + (1 - k) * 2.5; }
        const gr = g.createRadialGradient(l.x * w, l.y * h, 0, l.x * w, l.y * h, rr * 6);
        gr.addColorStop(0, l.mine ? 'rgba(255,250,235,.95)' : `rgba(255,240,215,${0.35 + tw * 0.3})`); gr.addColorStop(1, 'rgba(255,240,215,0)');
        g.fillStyle = gr; g.beginPath(); g.arc(l.x * w, l.y * h, rr * 6, 0, 6.283); g.fill();
        l.y -= 0.00004;
        if (l.y < 0.05) l.y = 0.95;
      }
      const sh = hover || (born && performance.now() - born.t0 < 5000 ? born : null);
      if (sh) {
        g.font = '15px Pretendard, sans-serif'; g.textAlign = 'center'; g.fillStyle = 'rgba(255,250,235,.95)';
        g.fillText('“' + sh.text + '”', Math.min(w - 160, Math.max(160, sh.x * w)), sh.y * h - 26);
      }
    }, { host: sec });
  });
}
