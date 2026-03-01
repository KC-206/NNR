// ============================================================
//  Audio — Web Audio API, procedural SFX, music routing
//  AudioContext is created lazily on first user gesture
// ============================================================

const Audio2 = (() => {

  let ctx = null;
  let masterGain = null;
  let musicSource = null;
  let musicGain = null;
  let _muted = false;
  let _savedGain = 0.8;

  // Roar buffer for gojiraroar.mp3
  let _roarBuffer = null;

  function init() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.8;
    masterGain.connect(ctx.destination);
    musicGain = ctx.createGain();
    musicGain.gain.value = 0.35;
    musicGain.connect(masterGain);
  }

  function resume() {
    init();
    if (ctx && ctx.state === 'suspended') ctx.resume();
    _loadRoar(); // kick off roar loading
  }

  // Toggle mute for all SFX — called from Player.toggleMute()
  function setMuted(val) {
    _muted = val;
    if (!masterGain || !ctx) return;
    if (_muted) {
      _savedGain = masterGain.gain.value || 0.8;
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
    } else {
      masterGain.gain.setValueAtTime(_savedGain, ctx.currentTime);
    }
  }

  // ── Core Helpers ──────────────────────────────────────
  function osc(type, freq, duration, gainVal, startTime, dest) {
    if (!ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, startTime);
    g.gain.setValueAtTime(gainVal, startTime);
    g.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    o.connect(g); g.connect(dest || masterGain);
    o.start(startTime); o.stop(startTime + duration + 0.01);
  }

  function noise(duration, gainVal, startTime) {
    if (!ctx) return;
    const bufSize = ctx.sampleRate * duration;
    const buf  = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    const g   = ctx.createGain();
    src.buffer = buf;
    g.gain.setValueAtTime(gainVal, startTime);
    g.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    src.connect(g); g.connect(masterGain);
    src.start(startTime);
  }

  // ── SFX ───────────────────────────────────────────────
  function playCoffeeShot() {
    if (!ctx) return;
    const t = ctx.currentTime;
    osc('sine', 180, 0.08, 0.5, t);
    osc('sine', 60,  0.12, 0.4, t + 0.02);
    noise(0.06, 0.15, t);
  }

  function playEnemyHurt() {
    if (!ctx) return;
    const t = ctx.currentTime;
    osc('sawtooth', 600, 0.08, 0.3, t);
    osc('sawtooth', 300, 0.1,  0.2, t + 0.06);
  }

  function playExplosion() {
    if (!ctx) return;
    const t = ctx.currentTime;
    osc('sine', 80, 0.5, 1.0, t);
    osc('sine', 20, 0.5, 0.8, t + 0.05);
    noise(0.4, 0.6, t);
  }

  function playPlayerHurt() {
    if (!ctx) return;
    const t = ctx.currentTime;
    osc('sawtooth', 220, 0.1, 0.4, t);
    osc('sine', 160, 0.12, 0.25, t + 0.05);
  }

  function playGojira() {
    if (!ctx) return;
    const t = ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      osc('sawtooth', 40 + i*15, 1.2, 0.3, t + i*0.05);
    }
    noise(1.0, 0.4, t);
    osc('sawtooth', 800,  0.3, 0.2, t + 0.1);
    osc('sawtooth', 1200, 0.2, 0.15, t + 0.2);
  }

  // ── Load & play Gojira roar file ──────────────────────
  async function _loadRoar() {
    if (_roarBuffer || !ctx) return;
    try {
      const resp = await fetch('gojiraroar.mp3');  // adjust path if in /audio/
      if (!resp.ok) return;
      const arrayBuf = await resp.arrayBuffer();
      _roarBuffer = await ctx.decodeAudioData(arrayBuf);
    } catch(e) {
      // If missing, we just fall back to synthetic roar
    }
  }

  function playGojiraRoar() {
    if (!ctx) return;
    if (_roarBuffer) {
      const src = ctx.createBufferSource();
      const g   = ctx.createGain();
      src.buffer = _roarBuffer;
      g.gain.value = 0.8;
      src.connect(g); g.connect(masterGain);
      src.start(ctx.currentTime);
    } else {
      // Fallback synthetic roar if file isn't loaded
      const t = ctx.currentTime;
      for (let i = 0; i < 3; i++) {
        osc('sawtooth', 60 + i*20, 0.4, 0.5, t + i*0.04);
      }
      noise(0.5, 0.3, t);
    }
  }

  function playGameOver() {
    if (!ctx) return;
    const t = ctx.currentTime;
    [466, 440, 415, 311].forEach((f, i) => osc('sawtooth', f, 0.4, 0.4, t + i*0.28));
  }

  function playWinFanfare() {
    if (!ctx) return;
    const t = ctx.currentTime;
    [523, 659, 784, 1047].forEach((f, i) => osc('square', f, 0.25, 0.35, t + i*0.18));
    osc('square', 1047, 0.5, 0.4, t + 0.72);
  }

  // ── Quip / Talk sound — wah wah wah ──────────────────
  // When isPlayer && Player.state.gojiraMode, use a deeper,
  // more monstrous variant.
  function playQuipSound(isPlayer) {
    if (!ctx) return;

    const inGojira =
      isPlayer &&
      typeof Player !== 'undefined' &&
      Player.state &&
      Player.state.gojiraMode;

    const t = ctx.currentTime;

    // Human vs monster parameters
    const wahDur   = inGojira ? 0.18 : 0.12;
    const wahs     = isPlayer ? 3 : 4;
    const baseFreq = inGojira ? 120 : (isPlayer ? 220 : 160); // deeper for Gojira
    const gainBase = inGojira ? 1.0 : 0.8;

    for (let i = 0; i < wahs; i++) {
      const start  = t + i * wahDur;
      const o      = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const g      = ctx.createGain();

      o.type = 'sawtooth';
      o.frequency.value = baseFreq + (i % 2 === 0 ? 0 : (inGojira ? -20 : 30));

      filter.type = 'bandpass';
      if (inGojira) {
        filter.frequency.setValueAtTime(250,           start);
        filter.frequency.linearRampToValueAtTime(900,  start + wahDur * 0.5);
        filter.frequency.linearRampToValueAtTime(250,  start + wahDur);
        filter.Q.value = 6;
      } else {
        filter.frequency.setValueAtTime(400,           start);
        filter.frequency.linearRampToValueAtTime(1800, start + wahDur * 0.5);
        filter.frequency.linearRampToValueAtTime(400,  start + wahDur);
        filter.Q.value = 4;
      }

      g.gain.setValueAtTime(0, start);
      g.gain.linearRampToValueAtTime(gainBase, start + 0.01);
      g.gain.linearRampToValueAtTime(gainBase * 0.8, start + wahDur * 0.8);
      g.gain.exponentialRampToValueAtTime(0.001, start + wahDur + 0.03);

      o.connect(filter); filter.connect(g); g.connect(masterGain);
      o.start(start); o.stop(start + wahDur + 0.06);
    }
  }

  function playPickup(type) {
    if (!ctx) return;
    const t = ctx.currentTime;
    if (type === 'health') {
      osc('sine', 440, 0.1, 0.3, t); osc('sine', 660, 0.1, 0.3, t+0.1);
    } else if (type === 'armor') {
      osc('square', 330, 0.08, 0.25, t); osc('square', 440, 0.08, 0.25, t+0.1);
    } else if (type === 'key') {
      osc('sine', 880,  0.12, 0.3,  t);
      osc('sine', 1100, 0.1,  0.25, t+0.12);
      osc('sine', 1320, 0.08, 0.2,  t+0.24);
    } else {
      osc('sine', 550, 0.12, 0.2, t);
    }
  }

  function playDoorOpen() {
    if (!ctx) return;
    const t = ctx.currentTime;
    noise(0.3, 0.2, t);
    osc('sawtooth', 120, 0.3, 0.15, t);
  }

  // ── Music ─────────────────────────────────────────────
  const MUSIC_TRACKS = [
    'audio/level1.mp3',
    'audio/level2.mp3',
    'audio/level3.mp3',
    'audio/boss.mp3',
  ];

  async function playMusic(trackIndex) {
    stopMusic();
    if (!ctx) return;
    const path = MUSIC_TRACKS[trackIndex] || MUSIC_TRACKS[0];
    try {
      const resp = await fetch(path);
      if (!resp.ok) return;
      const arrayBuf = await resp.arrayBuffer();
      const audioBuf = await ctx.decodeAudioData(arrayBuf);
      musicSource = ctx.createBufferSource();
      musicSource.buffer = audioBuf;
      musicSource.loop = true;
      musicSource.connect(musicGain);
      musicSource.start(0);
    } catch(e) { /* no audio file — game still works */ }
  }

  function stopMusic() {
    if (musicSource) {
      try { musicSource.stop(); } catch(e) {}
      musicSource = null;
    }
  }

  return {
    init, resume, setMuted,
    playCoffeeShot, playEnemyHurt, playExplosion,
    playPlayerHurt, playGojira, playGojiraRoar, playGameOver, playWinFanfare,
    playQuipSound, playPickup, playDoorOpen,
    playMusic, stopMusic,
  };
})();
