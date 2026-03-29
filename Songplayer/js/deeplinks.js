/**
 * deeplinks.js — URL hash deep linking with human-readable slugs
 *
 * URLs like: https://your-site.github.io/NNR/Songplayer/#its-pie
 *
 * On page load:  finds the song, loads it visually (artwork, title, queue)
 *                but does NOT attempt autoplay — user clicks play to start.
 * copyLink(id):  copies a slug-based URL to clipboard.
 * updateHash():  updates the URL bar when a song plays.
 */

const DeepLinks = (() => {

  /** Convert a song title to a URL-safe slug */
  function slugify(title) {
    return title
      .toLowerCase()
      .replace(/[''`]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  /** Find a song by slug — tries title match first, falls back to ID */
  function findBySlug(slug) {
    if (!slug) return null;
    const byId = SONGS.find(s => s.id === slug);
    if (byId) return byId;
    return SONGS.find(s => slugify(s.title) === slug) || null;
  }

  /** Build the shareable URL for a given song ID */
  function getUrl(songId) {
    const song = getSong(songId);
    const hash = song ? slugify(song.title) : songId;
    const base = location.href.replace(/#.*$/, "");
    return `${base}#${hash}`;
  }

  /** Update the URL bar to reflect the currently playing song */
  function updateHash(songId) {
    const song = getSong(songId);
    if (!song) return;
    history.replaceState(null, "", `#${slugify(song.title)}`);
  }

  /** Copy the deep link for a song to clipboard */
  function copyLink(songId, btnEl) {
    const url  = getUrl(songId);
    const song = getSong(songId);

    navigator.clipboard.writeText(url).then(() => {
      _showFeedback(btnEl);
      Toast.show(`Link copied — "${song ? song.title : songId}"`);
    }).catch(() => {
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      _showFeedback(btnEl);
      Toast.show(`Link copied — "${song ? song.title : songId}"`);
    });
    history.replaceState(null, "", `#${slugify(song ? song.title : songId)}`);
  }

  function _showFeedback(btnEl) {
    if (!btnEl) return;
    const orig = btnEl.innerHTML;
    btnEl.innerHTML = `<svg width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12"/></svg>`;
    btnEl.style.color       = "var(--accent2)";
    btnEl.style.borderColor = "var(--accent2)";
    setTimeout(() => {
      btnEl.innerHTML         = orig;
      btnEl.style.color       = "";
      btnEl.style.borderColor = "";
    }, 2000);
  }

  /** On page load — check for a hash and prepare that song */
  function init() {
    _handleHash();
    window.addEventListener("hashchange", _handleHash);
  }

  function _handleHash() {
    const hash = location.hash.slice(1);
    if (!hash) return;
    const song = findBySlug(hash);
    if (!song) return;

    setTimeout(() => {
      _prepareWithoutPlay(song);
      _scrollToCard(song.id);
      _showSharedPrompt(song);
      SharedPrompt.startRainbow();
    }, 300);
  }

  function _prepareWithoutPlay(song) {
    AppState.currentId = song.id;
    AppState.isPlaying = false;
    const audio = AudioEngine.getAudioElement();
    audio.src     = song.src;
    audio.preload = "auto";
    const recent = Storage.getRecent();
    Storage.saveRecent([song.id, ...recent.filter(x => x !== song.id)].slice(0, Config.recentMax));
    AudioEngine.rebuildQueue();
    PlayerUI.sync();
    Catalog.syncGrid();
    Catalog.renderSidebarList();
    updateHash(song.id);
  }

  function _showSharedPrompt(song) {
    const existing = document.getElementById("shared-prompt");
    if (existing) existing.remove();

    const art = (song.artwork && !(window._failedArt && window._failedArt.has(song.artwork)))
      ? song.artwork : blankArt();

    const el = document.createElement("div");
    el.id = "shared-prompt";
    el.innerHTML = `
      <div id="shared-prompt-art-wrap">
        <img id="shared-prompt-art" src="${art}" onerror="this.src=blankArt()" alt="">
      </div>
      <div id="shared-prompt-info">
        <div id="shared-prompt-eye">Someone shared this song with you</div>
        <div id="shared-prompt-title">${song.title}</div>
        <div id="shared-prompt-artist">${song.artist || "Huntress"}</div>
      </div>
      <button id="shared-prompt-play">
        <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        Play
      </button>
      <button id="shared-prompt-close">✕</button>
    `;

    document.body.appendChild(el);

    // Dismiss helpers
    function dismiss() {
      el.classList.add("hiding");
      SharedPrompt.stopRainbow();
      setTimeout(() => el.remove(), 300);
    }

    document.getElementById("shared-prompt-play").addEventListener("click", () => {
      dismiss();
      // Slight delay so dismiss animation starts before play
      setTimeout(() => AudioEngine.togglePlay(), 50);
    });

    document.getElementById("shared-prompt-close").addEventListener("click", dismiss);

    // Also dismiss when user clicks any other song
    window._sharedPromptDismiss = dismiss;

    // Animate in
    requestAnimationFrame(() => el.classList.add("visible"));
  }

  function _scrollToCard(songId) {
    const card = document.querySelector(`.song-card[data-song-id="${songId}"]`);
    if (card) setTimeout(() => card.scrollIntoView({ behavior: "smooth", block: "center" }), 600);
  }

  return { init, copyLink, getUrl, updateHash, slugify };
})();

// ════════════════════════════════════════════════════════
//  SharedPrompt — rainbow particle ring around play button
// ════════════════════════════════════════════════════════
const SharedPrompt = (() => {
  let rafId   = null;
  let canvas  = null;
  let ctx     = null;
  let time    = 0;
  let active  = false;

  function startRainbow() {
    active = true;
    _ensureCanvas();
    if (!rafId) _loop();
  }

  function stopRainbow() {
    active = false;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    if (canvas) { canvas.remove(); canvas = null; ctx = null; }
  }

  function _ensureCanvas() {
    if (canvas) return;
    const btn = document.getElementById("btn-playpause");
    if (!btn) return;
    canvas = document.createElement("canvas");
    canvas.id = "rainbow-canvas";
    canvas.style.cssText = `
      position:fixed; pointer-events:none; z-index:200;
      border-radius:50%;
    `;
    document.body.appendChild(canvas);
    _sizeCanvas();
    window.addEventListener("resize", _sizeCanvas);
  }

  function _sizeCanvas() {
    const btn = document.getElementById("btn-playpause");
    if (!btn || !canvas) return;
    const r   = btn.getBoundingClientRect();
    const pad = 28;
    const sz  = Math.max(r.width, r.height) + pad * 2;
    canvas.width  = sz;
    canvas.height = sz;
    canvas.style.width  = sz + "px";
    canvas.style.height = sz + "px";
    canvas.style.left   = (r.left + r.width  / 2 - sz / 2) + "px";
    canvas.style.top    = (r.top  + r.height / 2 - sz / 2) + "px";
    ctx = canvas.getContext("2d");
  }

  function _loop() {
    if (!active) return;
    rafId = requestAnimationFrame(_loop);
    _draw();
  }

  function _draw() {
    if (!ctx || !canvas) return;
    // Reposition in case player bar moved
    _sizeCanvas();
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;
    const radius = cx - 8;

    ctx.clearRect(0, 0, W, H);
    time += 0.025;

    const PARTICLE_COUNT = 48;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const baseAngle  = (i / PARTICLE_COUNT) * Math.PI * 2;
      const wobble     = Math.sin(time * 2.5 + i * 0.4) * 0.18;
      const angle      = baseAngle + time + wobble;
      const radiusVar  = radius + Math.sin(time * 3 + i * 0.7) * 6;
      const x          = cx + Math.cos(angle) * radiusVar;
      const y          = cy + Math.sin(angle) * radiusVar;
      const size       = 2.5 + Math.sin(time * 4 + i) * 1.2;
      const hue        = ((i / PARTICLE_COUNT) * 360 + time * 80) % 360;
      const alpha      = 0.6 + Math.sin(time * 3 + i * 0.5) * 0.3;

      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${hue}, 100%, 65%, ${alpha})`;
      ctx.fill();

      // Trailing sparkle
      const tx = cx + Math.cos(angle - 0.15) * (radiusVar - 4);
      const ty = cy + Math.sin(angle - 0.15) * (radiusVar - 4);
      ctx.beginPath();
      ctx.arc(tx, ty, size * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${(hue + 30) % 360}, 100%, 80%, ${alpha * 0.4})`;
      ctx.fill();
    }
  }

  return { startRainbow, stopRainbow };
})();

