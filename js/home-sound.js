// XPACE 홈 — 우주 공간 사운드 (Web Audio 실시간 합성, 외부 음원 없음)
// 깊은 우주 드론 + 중심 X의 맥동 + 별빛 같은 먼 음 + 드래그 바람 + 행성마다 다른 음색

const NOTE = (m) => 440 * Math.pow(2, (m - 69) / 12);
const LYD = [62, 64, 66, 69, 71, 74, 76, 78, 81, 83, 86]; // D 리디안 (떠 있는 듯한 음계)
const PLANET_NOTE = [74, 78, 81, 83, 86, 88, 90, 93];    // 행성 순서별 음
const KEY = 'xpace-sound';

let ctx, master, dry, rev, wet, padF, windF, windG, coreG, bus, hoverV = null, on = false, nextStar = 0;

function impulse(sec) {
  const len = Math.floor(ctx.sampleRate * sec), b = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.2); }
  return b;
}
function noiseBuf(sec, brown = true) {
  const b = ctx.createBuffer(1, ctx.sampleRate * sec, ctx.sampleRate), d = b.getChannelData(0); let l = 0;
  for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; if (brown) { l = (l + 0.02 * w) / 1.02; d[i] = l * 3.5; } else d[i] = w; }
  return b;
}

function build() {
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  master = ctx.createGain(); master.gain.value = 0;
  const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 3;
  comp.connect(master); master.connect(ctx.destination);
  rev = ctx.createConvolver(); rev.buffer = impulse(6);
  wet = ctx.createGain(); wet.gain.value = 0.7; rev.connect(wet); wet.connect(comp);
  dry = ctx.createGain(); dry.gain.value = 0.55; dry.connect(comp);
  bus = ctx.createGain(); bus.connect(dry); bus.connect(rev);

  // 1) 깊은 우주 드론: D1 · A1 · E2 (사인, 아주 느린 흔들림)
  [26, 33, 40].forEach((m, k) => {
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.value = NOTE(m);
    g.gain.value = [0.16, 0.09, 0.05][k];
    const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = 0.03 + k * 0.021; lg.gain.value = 1.2; l.connect(lg); lg.connect(o.detune);
    o.connect(g); g.connect(bus); o.start(); l.start();
  });
  // 2) 반짝이는 높은 패드: 톱니파 군집을 저역 필터로 감싸 천천히 열고 닫음
  padF = ctx.createBiquadFilter(); padF.type = 'lowpass'; padF.frequency.value = 900; padF.Q.value = 2;
  const padG = ctx.createGain(); padG.gain.value = 0.022; padF.connect(padG); padG.connect(bus);
  [62, 69, 74, 78, 81].forEach((m, k) => {
    const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = NOTE(m); o.detune.value = (k - 2) * 6; o.connect(padF); o.start();
  });
  const pl = ctx.createOscillator(), plg = ctx.createGain(); pl.frequency.value = 0.045; plg.gain.value = 500; pl.connect(plg); plg.connect(padF.frequency); pl.start();
  // 3) 중심 X의 맥동 (화면 속 X가 커졌다 작아지는 주기와 같음)
  coreG = ctx.createGain(); coreG.gain.value = 0;
  const co = ctx.createOscillator(); co.type = 'sine'; co.frequency.value = NOTE(50);
  const co2 = ctx.createOscillator(); co2.type = 'sine'; co2.frequency.value = NOTE(57) * 1.002;
  co.connect(coreG); co2.connect(coreG); coreG.connect(bus); co.start(); co2.start();
  // 4) 우주 바람 (드래그 속도에 반응)
  const ws = ctx.createBufferSource(); ws.buffer = noiseBuf(4, false); ws.loop = true;
  windF = ctx.createBiquadFilter(); windF.type = 'bandpass'; windF.frequency.value = 600; windF.Q.value = 1.4;
  windG = ctx.createGain(); windG.gain.value = 0.004;
  ws.connect(windF); windF.connect(windG); windG.connect(dry); windG.connect(rev); ws.start();
}

// 별빛 같은 먼 음
function star(m, vel = 1, pan = 0, when = 0, decay = 4) {
  const t = ctx.currentTime + when, f = NOTE(m);
  const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.05 * vel, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
  const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
  const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = f * 3.01; const g2 = ctx.createGain(); g2.gain.value = 0.12; o2.connect(g2); g2.connect(g);
  const p = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
  o.connect(g); if (p) { p.pan.value = pan; g.connect(p); p.connect(bus); } else g.connect(bus);
  o.start(t); o2.start(t); o.stop(t + decay + 0.1); o2.stop(t + decay + 0.1);
}
function whoosh(dur = 1.4, up = true, vel = 1) {
  const t = ctx.currentTime, s = ctx.createBufferSource(); s.buffer = noiseBuf(2, false);
  const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 2.5;
  f.frequency.setValueAtTime(up ? 200 : 3000, t); f.frequency.exponentialRampToValueAtTime(up ? 4000 : 250, t + dur);
  const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.18 * vel, t + dur * 0.7); g.gain.linearRampToValueAtTime(0, t + dur);
  s.connect(f); f.connect(g); g.connect(dry); g.connect(rev); s.start(t); s.stop(t + dur + 0.05);
}

// 행성 음색: 머무는 동안 지속되는 소리
function planetVoice(i, open, fx, pan) {
  const t = ctx.currentTime, m = open ? PLANET_NOTE[i % PLANET_NOTE.length] : 50;
  const out = ctx.createGain(); out.gain.setValueAtTime(0, t); out.gain.linearRampToValueAtTime(open ? 0.05 : 0.03, t + 0.4);
  const p = ctx.createStereoPanner ? ctx.createStereoPanner() : null; if (p) { p.pan.value = pan; out.connect(p); p.connect(bus); } else out.connect(bus);
  const nodes = [];
  const osc = (type, freq, gain, det = 0) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.value = freq; o.detune.value = det; g.gain.value = gain; o.connect(g); g.connect(out); o.start(); nodes.push(o); return o; };
  if (!open) { osc('sine', NOTE(38), 0.8); osc('sine', NOTE(45), 0.4, 5); }
  else if (fx === 'stars') { osc('sine', NOTE(m - 12), 0.6); osc('triangle', NOTE(m), 0.25, 4); const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = 7; lg.gain.value = 0.3; l.connect(lg); lg.connect(out.gain); l.start(); nodes.push(l); }
  else if (fx === 'prism') { [1, 1.5, 2, 3].forEach((h, k) => osc('sine', NOTE(m - 12) * h, 0.5 / (k + 1), k * 3)); }
  else if (fx === 'ripple') { const o = osc('sine', NOTE(m - 12), 0.7); const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = 2.2; lg.gain.value = 18; l.connect(lg); lg.connect(o.detune); l.start(); nodes.push(l); osc('sine', NOTE(m - 5), 0.2); }
  else if (fx === 'rice') { osc('sine', NOTE(m - 12), 0.6); osc('sine', NOTE(m - 5), 0.25, 3); osc('triangle', NOTE(m - 24), 0.3); }
  else { osc('sine', NOTE(m - 12), 0.6); osc('sine', NOTE(m - 5), 0.3); }
  return { out, nodes };
}

export const hsound = {
  get on() { return on; },
  get pref() { try { return localStorage.getItem(KEY); } catch (e) { return null; } },
  async start() {
    if (!ctx) build();
    if (ctx.state === 'suspended') await ctx.resume();
    on = true; master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setTargetAtTime(0.85, ctx.currentTime, 2);
    try { localStorage.setItem(KEY, 'on'); } catch (e) {}
    // 시작 신호: 멀리서 X가 울림
    [62, 69, 74, 81].forEach((m, k) => star(m, 0.7, (k - 1.5) * 0.3, k * 0.22, 5));
  },
  // 클릭 없이 바로 재생 시도 (브라우저가 허용하면 true)
  async tryAuto() {
    try {
      if (!ctx) build();
      await Promise.race([ctx.resume(), new Promise((r) => setTimeout(r, 450))]);
      if (ctx.state === 'running') { await this.start(); return true; }
    } catch (e) {}
    return false;
  },
  stop() { on = false; if (ctx) master.gain.setTargetAtTime(0, ctx.currentTime, 0.3); try { localStorage.setItem(KEY, 'off'); } catch (e) {} },
  toggle() { if (on) { this.stop(); return false; } this.start(); return true; },
  // 매 프레임: drag = 카메라 회전 속도, zoom = 0(가까움)~1(멂), t = 초, hovering
  update({ drag = 0, zoom = 0.5, t = 0, hovering = false, entering = false }) {
    if (!ctx || !on) return;
    const now = ctx.currentTime;
    windG.gain.setTargetAtTime(0.004 + Math.min(0.09, drag * 1.6), now, 0.15);
    windF.frequency.setTargetAtTime(500 + Math.min(2500, drag * 40000), now, 0.2);
    padF.frequency.setTargetAtTime(700 + (1 - zoom) * 1600 + (hovering ? 600 : 0), now, 0.8);
    coreG.gain.setTargetAtTime(0.012 + Math.max(0, Math.sin(t * 1.4)) * 0.028, now, 0.12);
    if (now > nextStar && !entering) {
      star(LYD[Math.floor(Math.random() * LYD.length)] + (Math.random() < 0.3 ? 12 : 0), 0.35 + Math.random() * 0.4, Math.random() * 1.6 - 0.8, 0, 5);
      nextStar = now + 1.8 + Math.random() * 4.5;
    }
  },
  hover(i, open, fx, pan) {
    if (!ctx || !on) return;
    this.unhover();
    const m = open ? PLANET_NOTE[i % PLANET_NOTE.length] : 50;
    star(m, open ? 0.9 : 0.4, pan, 0, open ? 3 : 1.5);
    hoverV = planetVoice(i, open, fx, pan);
  },
  unhover() {
    if (!hoverV || !ctx) return;
    const v = hoverV, t = ctx.currentTime; hoverV = null;
    v.out.gain.cancelScheduledValues(t); v.out.gain.setTargetAtTime(0, t, 0.25);
    setTimeout(() => v.nodes.forEach((n) => { try { n.stop(); } catch (e) {} }), 1500);
  },
  enter(i) {
    if (!ctx || !on) return;
    this.unhover();
    whoosh(1.3, true, 1);
    const base = PLANET_NOTE[i % PLANET_NOTE.length];
    [base - 24, base - 12, base - 5, base, base + 4].forEach((m, k) => star(m, 0.8, 0, k * 0.09, 3));
    master.gain.setTargetAtTime(0, ctx.currentTime + 0.9, 0.25);
  },
  ui(open) { if (ctx && on) star(open ? 81 : 74, 0.5, 0, 0, 1.6); },
  tick() { if (ctx && on) star(86, 0.25, 0, 0, 0.8); },
};
