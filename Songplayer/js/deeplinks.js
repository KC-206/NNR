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

  /** Copy iframe embed code for chatroom posting */
  function copyEmbed(songId, btnEl) {
    const song = getSong(songId);
    if (!song) return;
    const base  = location.href.replace(/\/[^/]*$/, "/"); // folder base
    const slug  = slugify(song.title);
    const src   = base + "song-card.html?song=" + slug;
    const code  = `<iframe src="${src}" width="400" height="100" frameborder="0" scrolling="no" style="border-radius:10px;overflow:hidden;"></iframe>`;

    navigator.clipboard.writeText(code).then(() => {
      _showFeedback(btnEl);
      Toast.show(`Embed code copied — paste it in the chatroom`);
    }).catch(() => {
      const ta = document.createElement("textarea");
      ta.value = code;
      ta.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      _showFeedback(btnEl);
      Toast.show(`Embed code copied — paste it in the chatroom`);
    });
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

  return { init, copyLink, copyEmbed, getUrl, updateHash, slugify };
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
    const box = document.getElementById("shared-prompt");
    if (!box) return;
    canvas = document.createElement("canvas");
    canvas.id = "rainbow-canvas";
    canvas.style.cssText = "position:fixed; pointer-events:none; z-index:1600;";
    document.body.appendChild(canvas);
    _sizeCanvas();
    window.addEventListener("resize", _sizeCanvas);
  }

  function _sizeCanvas() {
    const box = document.getElementById("shared-prompt");
    if (!box || !canvas) return;
    const r   = box.getBoundingClientRect();
    const pad = 14;
    canvas.width  = Math.round(r.width  + pad * 2);
    canvas.height = Math.round(r.height + pad * 2);
    canvas.style.width  = canvas.width  + "px";
    canvas.style.height = canvas.height + "px";
    canvas.style.left   = (r.left - pad) + "px";
    canvas.style.top    = (r.top  - pad) + "px";
    ctx = canvas.getContext("2d");
  }

  function _loop() {
    if (!active) return;
    rafId = requestAnimationFrame(_loop);
    _draw();
  }

  function _draw() {
    if (!ctx || !canvas) return;
    _sizeCanvas();
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    time += 0.022;

    // Distribute particles along the perimeter of the rounded rect
    const pad = 14, r = 14; // padding and corner radius
    const bx = pad, by = pad, bw = W - pad * 2, bh = H - pad * 2;
    // Perimeter: 4 sides + 4 corners
    const straightPerim = (bw - r * 2) * 2 + (bh - r * 2) * 2;
    const cornerPerim   = 2 * Math.PI * r;
    const totalPerim    = straightPerim + cornerPerim;

    const PARTICLE_COUNT = 80;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Evenly space + travel around perimeter over time
      const t     = ((i / PARTICLE_COUNT) + (time * 0.18)) % 1;
      const dist  = t * totalPerim;
      let px, py, wobble = Math.sin(time * 3 + i * 0.7) * 4;

      // Map dist to a point on the rounded rect perimeter
      const sides = [
        bw - r * 2,  // top
        bh - r * 2,  // right
        bw - r * 2,  // bottom
        bh - r * 2,  // left
      ];
      const cornerArcLen = (Math.PI / 2) * r;
      const segments = [
        sides[0], cornerArcLen,
        sides[1], cornerArcLen,
        sides[2], cornerArcLen,
        sides[3], cornerArcLen,
      ];

      let rem = dist, seg = 0;
      for (let s = 0; s < segments.length; s++) {
        if (rem <= segments[s]) { seg = s; break; }
        rem -= segments[s];
      }

      const norm = rem / segments[seg];
      if (seg === 0) { px = bx + r + norm * sides[0]; py = by; }                              // top
      else if (seg === 1) { const a = -Math.PI/2 + norm*Math.PI/2; px = bx+bw-r + Math.cos(a)*r; py = by+r + Math.sin(a)*r; } // TR corner
      else if (seg === 2) { px = bx+bw - r - norm*sides[1]; py = by+bh; }                    // bottom (reverse)
      else if (seg === 3) { const a = Math.PI/2 + norm*Math.PI/2; px = bx+bw-r + Math.cos(a)*r; py = by+bh-r + Math.sin(a)*r; } // BR corner
      else if (seg === 4) { px = bx+bw - r - norm*sides[2]; py = by+bh; }                    // bottom left
      else if (seg === 5) { const a = Math.PI + norm*Math.PI/2; px = bx+r + Math.cos(a)*r; py = by+bh-r + Math.sin(a)*r; } // BL corner
      else if (seg === 6) { px = bx + r + norm*sides[3]; py = by; }                          // left side
      else                { const a = -Math.PI + norm*Math.PI/2; px = bx+r + Math.cos(a)*r; py = by+r + Math.sin(a)*r; } // TL corner

      // Apply wobble outward from center
      const cx2 = W/2, cy2 = H/2;
      const dx = px - cx2, dy = py - cy2;
      const len = Math.sqrt(dx*dx + dy*dy) || 1;
      px += (dx/len) * wobble;
      py += (dy/len) * wobble;

      const size  = 2.2 + Math.sin(time * 4 + i) * 1.1;
      const hue   = ((i / PARTICLE_COUNT) * 360 + time * 90) % 360;
      const alpha = 0.65 + Math.sin(time * 3 + i * 0.5) * 0.28;

      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${hue}, 100%, 65%, ${alpha})`;
      ctx.fill();

      // Trailing sparkle slightly behind
      const tDist  = ((i / PARTICLE_COUNT) + ((time - 0.006) * 0.18)) % 1;
      ctx.beginPath();
      ctx.arc(px - (dx/len)*3, py - (dy/len)*3, size * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${(hue+40)%360}, 100%, 80%, ${alpha * 0.4})`;
      ctx.fill();
    }
  }

  return { startRainbow, stopRainbow };
})();

