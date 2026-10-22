// X-005 · 빛쌀 — 장면을 따라 변하는 사운드 (Web Audio 실시간 합성, 외부 음원 없음)
// 드론(화음) + 쌀알처럼 떨어지는 맑은 음 + 장면별 질감(맥박, 바람, 물결)

const NOTE = (m) => 440 * Math.pow(2, (m - 69) / 12);
// 장면별 설정: chord = MIDI 음, bright = 필터(Hz), grains = 초당 맑은 음 수, scale = 맑은 음에 쓰는 음, pulse/wind/vol
const SC = {
  prologue: { chord: [38, 45, 50], bright: 900, grains: 0.25, scale: [74, 77, 81, 86], vol: 0.7 },
  work:     { chord: [38, 45, 52, 57], bright: 1500, grains: 0.6, scale: [74, 76, 81, 83, 86], vol: 0.8 },
  life:     { chord: [41, 48, 53, 57, 60], bright: 2200, grains: 0.9, scale: [72, 74, 77, 79, 81, 84], vol: 0.85 },
  hunger:   { chord: [41, 48, 53, 56], bright: 1400, grains: 0.4, scale: [72, 75, 77, 80], vol: 0.75, thin: true },
  demand:   { chord: [38, 45, 50, 53], bright: 1300, grains: 0.3, scale: [74, 77, 81], vol: 0.8, pulse: 0.55 },
  street:   { chord: [38, 44, 50, 51], bright: 900, grains: 0.1, scale: [74, 75], vol: 0.75, pulse: 0.8 },
  spread:   { chord: [34, 41, 46, 52], bright: 1100, grains: 0.5, scale: [70, 74, 76, 81], vol: 0.7 },
  erased:   { chord: [38, 45, 48], bright: 700, grains: 0.15, scale: [72, 74], vol: 0.6, wind: 0.25 },
  boundary: { chord: [38, 50], bright: 500, grains: 0, scale: [], vol: 0.45 },
  mine:     { chord: [26, 33, 38], bright: 380, grains: 0.06, scale: [62, 65], vol: 0.7, wind: 0.6 },
  truth:    { chord: [31, 38, 43, 50], bright: 800, grains: 0.25, scale: [67, 74, 79], vol: 0.7, rise: true },
  share:    { chord: [41, 48, 53, 57, 64], bright: 2000, grains: 0.8, scale: [72, 77, 79, 81, 84], vol: 0.8 },
  light:    { chord: [38, 45, 50, 54, 57, 64], bright: 3000, grains: 1.2, scale: [74, 78, 81, 83, 86, 90], vol: 0.85 },
  archive:  { chord: [38, 45, 50, 57], bright: 1600, grains: 0.3, scale: [74, 81, 86], vol: 0.5 },
};

let ctx, master, filt, wet, dry, rev, bellBus, voices = [], windSrc, windGain, pulseGain, on = false, started = false, cur = '', nextGrain = 0, nextPulse = 0, freezeDuck = 1;

function impulse(sec = 4.5) {
  const len = ctx.sampleRate * sec, b = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
  return b;
}

function build() {
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
  const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3; comp.connect(master);
  rev = ctx.createConvolver(); rev.buffer = impulse();
  wet = ctx.createGain(); wet.gain.value = 0.55; rev.connect(wet); wet.connect(comp);
  dry = ctx.createGain(); dry.gain.value = 0.6; dry.connect(comp);
  filt = ctx.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = 900; filt.Q.value = 0.4;
  filt.connect(dry); filt.connect(rev);
  bellBus = ctx.createGain(); bellBus.gain.value = 1; bellBus.connect(dry); bellBus.connect(rev);
  // 드론 보이스 6개 (각각 살짝 어긋난 두 오실레이터)
  for (let k = 0; k < 6; k++) {
    const g = ctx.createGain(); g.gain.value = 0; g.connect(filt);
    const o1 = ctx.createOscillator(), o2 = ctx.createOscillator();
    o1.type = 'sine'; o2.type = 'triangle'; o2.detune.value = 7 + k;
    const g2 = ctx.createGain(); g2.gain.value = 0.35; o2.connect(g2); g2.connect(g);
    o1.connect(g);
    // 느린 숨결(LFO)
    const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.05 + k * 0.017; lg.gain.value = 0.25; lfo.connect(lg);
    const vg = ctx.createGain(); vg.gain.value = 1; lg.connect(vg.gain);
    g.disconnect(); g.connect(vg); vg.connect(filt);
    o1.start(); o2.start(); lfo.start();
    voices.push({ o1, o2, g });
  }
  // 바람/물결 질감 (필터된 노이즈)
  const nb = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate), nd = nb.getChannelData(0);
  let last = 0; for (let i = 0; i < nd.length; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; nd[i] = last * 3.5; }
  windSrc = ctx.createBufferSource(); windSrc.buffer = nb; windSrc.loop = true;
  const wf = ctx.createBiquadFilter(); wf.type = 'bandpass'; wf.frequency.value = 500; wf.Q.value = 0.7;
  const wl = ctx.createOscillator(), wlg = ctx.createGain(); wl.frequency.value = 0.08; wlg.gain.value = 250; wl.connect(wlg); wlg.connect(wf.frequency); wl.start();
  windGain = ctx.createGain(); windGain.gain.value = 0; windSrc.connect(wf); wf.connect(windGain); windGain.connect(dry); windGain.connect(rev); windSrc.start();
  pulseGain = ctx.createGain(); pulseGain.gain.value = 0; pulseGain.connect(dry); pulseGain.connect(rev);
}

function setScene(id) {
  const s = SC[id] || SC.prologue, t = ctx.currentTime;
  voices.forEach((v, k) => {
    const m = s.chord[k];
    if (m) { const f = NOTE(m); v.o1.frequency.setTargetAtTime(f, t, 1.2); v.o2.frequency.setTargetAtTime(f, t, 1.2); v.g.gain.setTargetAtTime((0.11 / Math.sqrt(s.chord.length)) * (m < 40 ? 1.3 : 1), t, 1.6); }
    else v.g.gain.setTargetAtTime(0, t, 1.2);
  });
  windGain.gain.setTargetAtTime((s.wind || 0) * 0.5, t, 2);
  cur = id;
}

// 맑은 음 (쌀알이 유리에 닿는 듯한 소리)
function bell(m, vel = 1, when = 0) {
  if (!ctx) return;
  const t = ctx.currentTime + when, f = NOTE(m);
  const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.06 * vel, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 3.2);
  const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
  const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = f * 2.76; const g2 = ctx.createGain(); g2.gain.value = 0.18; o2.connect(g2); g2.connect(g);
  o.connect(g); g.connect(bellBus);
  o.start(t); o2.start(t); o.stop(t + 3.3); o2.stop(t + 3.3);
}
function thump(when = 0, vel = 1) {
  const t = ctx.currentTime + when, o = ctx.createOscillator(), g = ctx.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(70, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.25);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.22 * vel, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
  o.connect(g); g.connect(pulseGain); o.start(t); o.stop(t + 0.6);
}

export const sound = {
  get on() { return on; },
  async start() {
    if (!ctx) build();
    if (ctx.state === 'suspended') await ctx.resume();
    started = true; on = true; master.gain.setTargetAtTime(0.9, ctx.currentTime, 1.5);
    setScene(cur || 'prologue');
  },
  stop() { on = false; if (ctx) master.gain.setTargetAtTime(0, ctx.currentTime, 0.4); },
  toggle() { return on ? (this.stop(), false) : (this.start(), true); },
  // 매 프레임 호출
  update(id, p, st) {
    if (!ctx || !on) return;
    if (id !== cur) setScene(id);
    const s = SC[id] || SC.prologue, t = ctx.currentTime;
    // 밝기: 장면 값 + 진행(진실규명은 점점 밝아짐, 굶주림은 점점 어두워짐)
    let br = s.bright;
    if (s.rise) br *= 0.7 + p * 1.2;
    if (s.thin) br *= 1 - p * 0.55;
    if (id === 'mine') br *= 1 - Math.min(1, p) * 0.4;
    filt.frequency.setTargetAtTime(br, t, 0.6);
    // 오후 7시의 멈춤: 음악이 숨을 멈춤
    const target = st.freeze ? 0.06 : 1;
    freezeDuck += (target - freezeDuck) * (st.freeze ? 0.08 : 0.02);
    master.gain.setTargetAtTime(0.9 * s.vol * freezeDuck, t, 0.3);
    // 굶주림: 위쪽 화음이 하나씩 빠져나감
    if (s.thin) voices.forEach((v, k) => { if (k >= 2 && s.chord[k]) v.g.gain.setTargetAtTime(0.05 * Math.max(0, 1 - p * 1.4 + (k - 2) * -0.25), t, 0.8); });
    // 맑은 음
    if (s.grains && t > nextGrain && !st.freeze) {
      const dens = s.grains * (id === 'demand' ? 0.6 + p : 1) * (id === 'light' ? 1 + (st.lamps || 0) * 0.04 : 1);
      bell(s.scale[Math.floor(Math.random() * s.scale.length)], 0.5 + Math.random() * 0.5);
      nextGrain = t + (0.4 + Math.random() * 1.6) / dens;
    }
    // 맥박 (요구 → 거리)
    const pulse = s.pulse ? s.pulse * (id === 'demand' ? Math.min(1, p * 1.5) : 1) * (id === 'street' && p > 0.86 ? 0.2 : 1) : 0;
    pulseGain.gain.setTargetAtTime(st.freeze ? 0 : pulse, t, 0.3);
    if (pulse > 0.02 && t > nextPulse) { thump(0, 1); thump(0.32, 0.55); nextPulse = t + (id === 'street' ? 1.15 : 1.5); }
  },
  // 인터랙션 효과음
  ping(kind) {
    if (!ctx || !on) return;
    const pick = (a) => a[Math.floor(Math.random() * a.length)];
    if (kind === 'enter') { [74, 81, 86].forEach((m, i) => bell(m, 0.9, i * 0.18)); }
    if (kind === 'bowl') bell(pick([72, 74, 77, 79, 81]), 0.9);
    if (kind === 'bowlsDone') [65, 72, 77, 81, 84].forEach((m, i) => bell(m, 0.8, i * 0.14));
    if (kind === 'voice') { bell(pick([62, 65, 69]), 0.8); thump(0, 0.5); }
    if (kind === 'reveal') bell(pick([69, 72]), 0.6);
    if (kind === 'fix') [76, 74].forEach((m, i) => bell(m, 0.7, i * 0.25));
    if (kind === 'share') bell(pick([77, 79, 81, 84]), 0.9);
    if (kind === 'lamp') bell(pick([81, 83, 86, 88, 90]), 0.85);
    if (kind === 'memory') [74, 78, 81, 86, 90].forEach((m, i) => bell(m, 0.8, i * 0.2));
    if (kind === 'slide') bell(pick([74, 76, 81]), 0.5);
  },
  // 영상 재생 중에는 줄이기
  duck(v) { if (ctx && on) { dry.gain.setTargetAtTime(0.6 * v, ctx.currentTime, 0.5); wet.gain.setTargetAtTime(0.55 * v, ctx.currentTime, 0.5); } },
};
