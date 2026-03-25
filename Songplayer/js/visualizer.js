/**
 * visualizer.js — Background audio visualizer for the hero section
 *
 * Styles: bars | wave | orbs | particles
 * Off by default. Toggle + style choice saved to localStorage.
 * Colors pulled from active CSS theme variables.
 */

const Visualizer = (() => {

  // ── State ────────────────────────────────────────────────
  let enabled    = false;
  let style      = "bars";
  let ctx        = null;   // canvas 2d context
  let analyser   = null;   // Web Audio AnalyserNode
  let source     = null;   // MediaElementSourceNode
  let audioCtx   = null;   // AudioContext
  let rafId      = null;   // requestAnimationFrame id
  let dataArray        = null;   // Uint8Array of frequency data
  let timeDomainArray  = null;   // Uint8Array of waveform data
  let particles        = [];     // for particles style

  const STORAGE_KEY_ON    = "hh_viz_on";
  const STORAGE_KEY_STYLE = "hh_viz_style";

  // ── Init ─────────────────────────────────────────────────
  function init(audioElement) {
    // Restore saved prefs
    enabled = localStorage.getItem(STORAGE_KEY_ON)    === "true";
    style   = localStorage.getItem(STORAGE_KEY_STYLE) || "bars";

    _setupCanvas();
    _syncUI();

    // Wire up toggle button
    document.getElementById("viz-toggle").addEventListener("click", toggle);

    // Wire up style selector
    document.getElementById("viz-style-select").addEventListener("change", e => {
      setStyle(e.target.value);
    });

    // Connect audio when user first interacts (browser autoplay policy)
    document.addEventListener("click", () => _connectAudio(audioElement), { once: true });

    // Also try connecting immediately if context is already allowed
    _connectAudio(audioElement);

    if (enabled) _startLoop();
  }

  function _connectAudio(audioElement) {
    if (audioCtx) return;

    // On file:// protocol, createMediaElementSource causes CORS silence.
    // Skip the connection entirely — visualizer shows idle animation locally,
    // and works fully on GitHub Pages (https://).
    if (location.protocol === "file:") {
      console.info("Visualizer: local file — audio analyser disabled to preserve playback");
      return;
    }

    try {
      audioCtx  = new (window.AudioContext || window.webkitAudioContext)();
      analyser  = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      dataArray      = new Uint8Array(analyser.frequencyBinCount);
      timeDomainArray = new Uint8Array(analyser.fftSize);
      source    = audioCtx.createMediaElementSource(audioElement);
      source.connect(analyser);
      analyser.connect(audioCtx.destination);
    } catch(e) {
      console.warn("Visualizer: could not connect audio", e);
    }
  }

  function _setupCanvas() {
    const canvas = document.getElementById("viz-canvas");
    if (!canvas) return;
    ctx = canvas.getContext("2d");
    _resizeCanvas();
    window.addEventListener("resize", _resizeCanvas);
  }

  function _resizeCanvas() {
    const canvas = document.getElementById("viz-canvas");
    const hero   = document.getElementById("hero");
    if (!canvas || !hero) return;
    const rect    = hero.getBoundingClientRect();
    canvas.width  = Math.round(rect.width);
    canvas.height = Math.round(rect.height);
  }

  // ── Public controls ──────────────────────────────────────
  function toggle() {
    enabled = !enabled;
    localStorage.setItem(STORAGE_KEY_ON, enabled);
    _syncUI();
    if (enabled) {
      _startLoop();
    } else {
      _stopLoop();
      _clearCanvas();
    }
  }

  function setStyle(newStyle) {
    style = newStyle;
    localStorage.setItem(STORAGE_KEY_STYLE, style);
    particles = []; // reset particles on style change
    document.getElementById("viz-style-select").value = style;
  }

  function _syncUI() {
    const btn    = document.getElementById("viz-toggle");
    const picker = document.getElementById("viz-style-wrap");
    if (btn) {
      btn.classList.toggle("active", enabled);
      btn.title = enabled ? "Visualizer on — click to turn off" : "Turn on visualizer";
    }
    if (picker) picker.style.display = enabled ? "flex" : "none";
  }

  // ── Draw loop ────────────────────────────────────────────
  function _startLoop() {
    if (rafId) return;
    _loop();
  }

  function _stopLoop() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  function _loop() {
    if (!enabled) return;
    rafId = requestAnimationFrame(_loop);
    _draw();
  }

  function _clearCanvas() {
    if (!ctx) return;
    const canvas = document.getElementById("viz-canvas");
    if (canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // ── Color helper — reads CSS theme variables ─────────────
  function _getAccentColor(alpha) {
    const root   = document.documentElement;
    const styles = getComputedStyle(root);
    // Parse --accent as rgb values
    const raw = styles.getPropertyValue("--accent").trim();
    // Convert hex to rgb
    if (raw.startsWith("#")) {
      const hex = raw.slice(1);
      const r = parseInt(hex.slice(0,2), 16);
      const g = parseInt(hex.slice(2,4), 16);
      const b = parseInt(hex.slice(4,6), 16);
      return `rgba(${r},${g},${b},${alpha})`;
    }
    return `rgba(110,158,132,${alpha})`; // forest fallback
  }

  function _getAccentRGB() {
    const root   = document.documentElement;
    const styles = getComputedStyle(root);
    const raw    = styles.getPropertyValue("--accent").trim();
    if (raw.startsWith("#")) {
      const hex = raw.slice(1);
      return {
        r: parseInt(hex.slice(0,2), 16),
        g: parseInt(hex.slice(2,4), 16),
        b: parseInt(hex.slice(4,6), 16),
      };
    }
    return { r: 110, g: 158, b: 132 };
  }

  // ── Draw ─────────────────────────────────────────────────
  function _draw() {
    const canvas = document.getElementById("viz-canvas");
    if (!ctx || !canvas) return;

    // Keep canvas in sync with hero dimensions on every frame
    const hero = document.getElementById("hero");
    if (hero) {
      const rect = hero.getBoundingClientRect();
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width  = w;
        canvas.height = h;
      }
    }

    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    // Frequency data for bars/orbs/particles
    let data = new Uint8Array(128).fill(8);
    if (analyser) {
      analyser.getByteFrequencyData(dataArray);
      data = dataArray;
    }

    // Time-domain (waveform) data for wave style — spans full canvas width
    let waveData = new Uint8Array(256).fill(128);
    if (analyser && timeDomainArray) {
      analyser.getByteTimeDomainData(timeDomainArray);
      waveData = timeDomainArray;
    }

    switch (style) {
      case "bars":      _drawBars(ctx, W, H, data);      break;
      case "wave":      _drawWave(ctx, W, H, waveData);  break;
      case "orbs":      _drawOrbs(ctx, W, H, data);      break;
      case "particles": _drawParticles(ctx, W, H, data); break;
    }
  }

  // ── Bars ─────────────────────────────────────────────────
  function _drawBars(ctx, W, H, data) {
    const count   = 64;
    const barW    = (W / count) * 0.7;
    const gap     = (W / count) * 0.3;
    const maxH    = H * 0.7;
    const accent  = _getAccentRGB();

    for (let i = 0; i < count; i++) {
      const val    = data[i] / 255;
      const barH   = val * maxH;
      const x      = i * (barW + gap) + gap / 2;
      const y      = H - barH;
      const alpha  = 0.12 + val * 0.25;

      const grad = ctx.createLinearGradient(0, y, 0, H);
      grad.addColorStop(0, `rgba(${accent.r},${accent.g},${accent.b},${alpha})`);
      grad.addColorStop(1, `rgba(${accent.r},${accent.g},${accent.b},0.02)`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, [2, 2, 0, 0]);
      ctx.fill();
    }
  }

  // ── Wave ─────────────────────────────────────────────────
  function _drawWave(ctx, W, H, data) {
    const accent = _getAccentRGB();
    const sliceW = W / data.length;
    const midY   = H * 0.65;

    ctx.lineWidth   = 1.5;
    ctx.strokeStyle = `rgba(${accent.r},${accent.g},${accent.b},0.35)`;
    ctx.shadowBlur  = 8;
    ctx.shadowColor = `rgba(${accent.r},${accent.g},${accent.b},0.2)`;
    ctx.beginPath();

    for (let i = 0; i < data.length; i++) {
      const v  = data[i] / 128 - 1;
      const x  = i * sliceW;
      const y  = midY + v * H * 0.3;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Mirror wave, fainter
    ctx.lineWidth   = 1;
    ctx.strokeStyle = `rgba(${accent.r},${accent.g},${accent.b},0.12)`;
    ctx.beginPath();
    for (let i = 0; i < data.length; i++) {
      const v  = data[i] / 128 - 1;
      const x  = i * sliceW;
      const y  = midY - v * H * 0.15;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // ── Orbs ─────────────────────────────────────────────────
  let _orbOffset = 0;
  function _drawOrbs(ctx, W, H, data) {
    const accent = _getAccentRGB();
    _orbOffset  += 0.008;

    // 5 slow-drifting orbs driven by different frequency bands
    const orbs = [
      { fx: 2,  fy: 0.35, band: 4  },
      { fx: 5,  fy: 0.55, band: 12 },
      { fx: 3,  fy: 0.45, band: 8  },
      { fx: 7,  fy: 0.65, band: 20 },
      { fx: 4,  fy: 0.25, band: 30 },
    ];

    orbs.forEach((o, i) => {
      const energy = data[o.band] / 255;
      const x = W * (0.15 + i * 0.18) + Math.sin(_orbOffset * o.fx + i) * W * 0.06;
      const y = H * o.fy + Math.cos(_orbOffset * o.fy * 2 + i) * H * 0.12;
      const r = 40 + energy * 90;

      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, `rgba(${accent.r},${accent.g},${accent.b},${0.08 + energy * 0.18})`);
      grad.addColorStop(1, `rgba(${accent.r},${accent.g},${accent.b},0)`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // ── Particles ────────────────────────────────────────────
  function _drawParticles(ctx, W, H, data) {
    const accent = _getAccentRGB();
    // Get bass energy (low frequencies)
    let bass = 0;
    for (let i = 0; i < 8; i++) bass += data[i];
    bass = bass / (8 * 255);

    // Spawn new particles on beats
    if (bass > 0.45 && particles.length < 80) {
      for (let i = 0; i < 3; i++) {
        particles.push({
          x:  Math.random() * W,
          y:  H * (0.4 + Math.random() * 0.5),
          vx: (Math.random() - 0.5) * 1.5,
          vy: -(0.3 + Math.random() * 1.2 + bass * 2),
          life: 1,
          size: 1.5 + Math.random() * 3,
        });
      }
    }

    // Update and draw
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => {
      p.x    += p.vx;
      p.y    += p.vy;
      p.vy   += 0.03; // gravity
      p.life -= 0.012;

      ctx.globalAlpha = p.life * 0.5;
      ctx.fillStyle   = `rgb(${accent.r},${accent.g},${accent.b})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  // ── Resume audio context on play (browser policy) ────────
  function resume() {
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
  }

  return { init, toggle, setStyle, resume };
})();

// ════════════════════════════════════════════════════════
//  SPARKLE SYSTEM — slow drifting sparkles around the title
// ════════════════════════════════════════════════════════
const Sparkles = (() => {
  let sCtx      = null;
  let sparks    = [];
  let sRafId    = null;
  let sEnabled  = false;

  const MAX_SPARKS = 35;

  function init() {
    const canvas = document.getElementById("sparkle-canvas");
    if (!canvas) return;
    sCtx = canvas.getContext("2d");
    _resize();
    window.addEventListener("resize", _resize);
  }

  function _resize() {
    const canvas = document.getElementById("sparkle-canvas");
    const hero   = document.getElementById("hero");
    if (!canvas || !hero) return;
    const rect    = hero.getBoundingClientRect();
    canvas.width  = Math.round(rect.width);
    canvas.height = Math.round(rect.height);
  }

  function start() {
    if (sRafId) return;
    sEnabled = true;
    _loop();
  }

  function stop() {
    sEnabled = false;
    if (sRafId) { cancelAnimationFrame(sRafId); sRafId = null; }
    if (sCtx) {
      const canvas = document.getElementById("sparkle-canvas");
      if (canvas) sCtx.clearRect(0, 0, canvas.width, canvas.height);
    }
    sparks = [];
  }

  function _loop() {
    if (!sEnabled) return;
    sRafId = requestAnimationFrame(_loop);
    _draw();
  }

  function _draw() {
    const canvas = document.getElementById("sparkle-canvas");
    if (!sCtx || !canvas) return;

    // Keep canvas sized to hero
    const hero = document.getElementById("hero");
    if (hero) {
      const r = hero.getBoundingClientRect();
      const w = Math.round(r.width), h = Math.round(r.height);
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    }

    const W = canvas.width, H = canvas.height;
    sCtx.clearRect(0, 0, W, H);

    // Spawn new sparks gradually
    if (sparks.length < MAX_SPARKS && Math.random() < 0.25) {
      sparks.push(_newSpark(W, H));
    }

    // Get accent color
    const raw = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
    let r = 110, g = 158, b = 132;
    if (raw.startsWith("#")) {
      r = parseInt(raw.slice(1,3), 16);
      g = parseInt(raw.slice(3,5), 16);
      b = parseInt(raw.slice(5,7), 16);
    }

    // Update and draw sparks
    sparks = sparks.filter(s => s.life > 0);
    sparks.forEach(s => {
      s.x    += s.vx;
      s.y    += s.vy;
      s.vy   -= 0.012; // slow rise
      s.rot  += s.rotV;
      s.life -= s.decay;

      const alpha = Math.min(s.life, 1) * s.maxAlpha;
      sCtx.save();
      sCtx.translate(s.x, s.y);
      sCtx.rotate(s.rot);
      sCtx.globalAlpha = alpha;

      // Draw a 4-pointed star sparkle
      const sz = s.size;
      sCtx.fillStyle = `rgb(${r},${g},${b})`;
      sCtx.beginPath();
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const ox = Math.cos(angle) * sz;
        const oy = Math.sin(angle) * sz;
        const ix = Math.cos(angle + Math.PI / 4) * sz * 0.3;
        const iy = Math.sin(angle + Math.PI / 4) * sz * 0.3;
        i === 0 ? sCtx.moveTo(ox, oy) : sCtx.lineTo(ox, oy);
        sCtx.lineTo(ix, iy);
      }
      sCtx.closePath();
      sCtx.fill();

      sCtx.restore();
    });
  }

  function _newSpark(W, H) {
    // Sparks originate in the center/right area where the title sits
    const x = W * 0.3 + Math.random() * W * 0.65;
    const y = H * 0.1 + Math.random() * H * 0.8;
    return {
      x, y,
      vx:      (Math.random() - 0.5) * 0.6,
      vy:      -(0.1 + Math.random() * 0.4),
      rot:     Math.random() * Math.PI * 2,
      rotV:    (Math.random() - 0.5) * 0.04,
      size:    1.5 + Math.random() * 3.5,
      life:    1,
      decay:   0.004 + Math.random() * 0.006,
      maxAlpha: 0.15 + Math.random() * 0.25,
    };
  }

  return { init, start, stop };
})();
