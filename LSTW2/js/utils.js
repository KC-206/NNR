// ============================================================
//  Utils — Math helpers, easing, noise, geometry
// ============================================================

const Utils = (() => {

  // ── Basic Math ─────────────────────────────────────────
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function lerp(a, b, t)    { return a + (b - a) * t; }
  function dist2(ax, ay, bx, by) {
    const dx = ax - bx, dy = ay - by;
    return dx * dx + dy * dy;
  }
  function dist(ax, ay, bx, by) { return Math.sqrt(dist2(ax, ay, bx, by)); }

  function normalizeAngle(a) {
    while (a < 0)            a += Math.PI * 2;
    while (a >= Math.PI * 2) a -= Math.PI * 2;
    return a;
  }

  // ── Pseudo-random noise (seeded) ───────────────────────
  let _noiseSeed = 12345;
  function seededRand() {
    _noiseSeed = (_noiseSeed * 1664525 + 1013904223) & 0xffffffff;
    return (_noiseSeed >>> 0) / 0xffffffff;
  }

  const _noiseTable = new Float32Array(256);
  for (let i = 0; i < 256; i++) _noiseTable[i] = seededRand();

  function smoothNoise1D(x) {
    const i = Math.floor(x) & 255;
    const f = x - Math.floor(x);
    const u = f * f * (3 - 2 * f);
    return lerp(_noiseTable[i], _noiseTable[(i + 1) & 255], u);
  }

  // ── Easing ─────────────────────────────────────────────
  function easeOutQuad(t)  { return 1 - (1 - t) * (1 - t); }
  function easeInQuad(t)   { return t * t; }
  function easeOutBounce(t) {
    if (t < 1/2.75)   return 7.5625 * t * t;
    if (t < 2/2.75)   { t -= 1.5/2.75;   return 7.5625 * t * t + 0.75; }
    if (t < 2.5/2.75) { t -= 2.25/2.75;  return 7.5625 * t * t + 0.9375; }
    t -= 2.625/2.75;    return 7.5625 * t * t + 0.984375;
  }

  // ── Color Helpers ──────────────────────────────────────
  function rgbStr(r, g, b) { return `rgb(${r|0},${g|0},${b|0})`; }

  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1,3), 16);
    const g = parseInt(hex.slice(3,5), 16);
    const b = parseInt(hex.slice(5,7), 16);
    return [r, g, b];
  }

  // ── Rect / Circle Collision ────────────────────────────
  function circleRect(cx, cy, cr, rx, ry, rw, rh) {
    const nearX = clamp(cx, rx, rx + rw);
    const nearY = clamp(cy, ry, ry + rh);
    return dist2(cx, cy, nearX, nearY) < cr * cr;
  }

  function circleCircle(ax, ay, ar, bx, by, br) {
    return dist2(ax, ay, bx, by) < (ar + br) * (ar + br);
  }

  // ── Screen projection ──────────────────────────────────
  /** Project world point onto screen. Returns {sx, scale, dist} or null. */
  function project(wx, wy, playerX, playerY, playerAngle) {
    const dx = wx - playerX;
    const dy = wy - playerY;
    const d  = Math.sqrt(dx * dx + dy * dy);
    if (d < 0.1) return null;

    // Relative angle, normalised to (-π, π]
    let angle = Math.atan2(dy, dx) - playerAngle;
    // Wrap into (-π, π]
    while (angle >  Math.PI) angle -= Math.PI * 2;
    while (angle < -Math.PI) angle += Math.PI * 2;

    // Cull anything outside FOV (with small margin so edge sprites don't pop)
    if (Math.abs(angle) > C.HALF_FOV + 0.1) return null;

    // tan(angle) is safe here because |angle| < HALF_FOV+0.1 < π/2
    const tanA    = Math.tan(angle);
    const tanHalf = Math.tan(C.HALF_FOV);
    const sx      = (C.SCREEN_W / 2) * (1 + tanA / tanHalf);
    const cosA    = Math.cos(angle);
    const scale   = (C.SCREEN_H / 2) / (d * Math.max(cosA, 0.01));

    // Final safety check — should never trigger now but just in case
    if (!isFinite(sx) || !isFinite(scale)) return null;

    return { sx, scale, dist: d };
  }

  // ── Quip helper ────────────────────────────────────────
  function randomQuip(arr) {
    if (!arr || !arr.length) return '';
    return arr[Math.floor(Math.random() * arr.length)];
  }

  return {
    clamp, lerp, dist2, dist,
    normalizeAngle,
    smoothNoise1D,
    easeOutQuad, easeInQuad, easeOutBounce,
    rgbStr, hexToRgb,
    circleRect, circleCircle,
    project,
    randomQuip,
  };
})();

// ============================================================
//  Dev — tiny on-screen log overlay for debugging
// ============================================================

const Dev = (() => {
  let enabled = false;          // flip to false to hide
  const maxLines = 20;

  function log(msg) {
    if (!enabled) return;
    const box = document.getElementById('devlog');
    if (!box) return;
    box.style.display = 'block';
    const time = performance.now().toFixed(1);
    box.textContent += `[${time}] ${msg}\n`;
    const lines = box.textContent.split('\n');
    if (lines.length > maxLines) {
      box.textContent = lines.slice(lines.length - maxLines).join('\n');
    }
    box.scrollTop = box.scrollHeight;
  }

  function setEnabled(v) {
    enabled = v;
    const box = document.getElementById('devlog');
    if (box) box.style.display = v ? 'block' : 'none';
  }

  return { log, setEnabled };
})();
