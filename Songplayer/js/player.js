/**
 * player.js — Player bar and hero section UI
 *
 * sync()               — full sync of all player UI to current state
 * syncPlayPauseButton()— lightweight update for just the play/pause icon
 * syncVolumeIcons()    — update mute/unmute icon
 * syncVinyl()          — spin or stop the vinyl record based on play state
 */

const PlayerUI = (() => {

  // ── Vinyl record ────────────────────────────────────────

  /** Start or stop the vinyl spinning based on AppState.isPlaying */
  function syncVinyl() {
    const wrap = document.getElementById("vinyl-wrap");
    if (!wrap) return;
    wrap.classList.toggle("spinning", AppState.isPlaying);
  }

  /** Update the artwork shown in the vinyl label */
  function _setVinylArt(src) {
    const label = document.getElementById("vinyl-label");
    if (label) {
      label.src = src;
      label.onerror = () => { label.src = blankArt(); };
    }
  }

  // ── Full sync ────────────────────────────────────────────

  /** Full sync — called after a new song is loaded */
  function sync() {
    const song = getSong(AppState.currentId);

    syncPlayPauseButton();
    syncVolumeIcons();
    syncVinyl();

    if (!song) return;

    const art = song.artwork || blankArt();

    // ── Player bar ──────────────────────────────────────
    _setVinylArt(art);
    document.getElementById("p-title").textContent  = song.title;
    document.getElementById("p-artist").textContent = song.artist;
    document.getElementById("t-tot").textContent    = formatTime(song.duration);

    // ── Hero section ────────────────────────────────────
    const heroArt = document.getElementById("hero-art");
    heroArt.onerror = function() { this.onerror = null; this.src = blankArt(); };
    heroArt.src = art;
    document.getElementById("hero-title").textContent  = song.title;
    document.getElementById("hero-artist").textContent = `${song.artist} · ${song.album}`;

    document.getElementById("hero-tags").innerHTML = song.tags.map(t =>
      `<span class="hero-tag" onclick="Catalog.filterTag('${t}')">#${t}</span>`
    ).join("");

    // Show/hide hero action buttons
    document.getElementById("btn-hero-notes").hidden = false;
    document.getElementById("btn-hero-addpl").hidden = false;
    document.getElementById("btn-hero-dl").hidden    = !song.downloadable;
  }

  // ── Individual sync helpers ──────────────────────────────

  /** Update just the play/pause button icon */
  function syncPlayPauseButton() {
    document.getElementById("ico-play").style.display  = AppState.isPlaying ? "none" : "";
    document.getElementById("ico-pause").style.display = AppState.isPlaying ? "" : "none";
    syncVinyl();
  }

  /** Update the mute/volume icon */
  function syncVolumeIcons() {
    document.getElementById("ico-vol").style.display  = AppState.muted ? "none" : "";
    document.getElementById("ico-mute").style.display = AppState.muted ? "" : "none";
  }

  // ── Event binding ────────────────────────────────────────

  /** Bind all player bar event listeners — called once on init */
  function bindEvents() {
    document.getElementById("btn-playpause").addEventListener("click", () => AudioEngine.togglePlay());
    document.getElementById("btn-prev").addEventListener("click",      () => AudioEngine.prevSong());
    document.getElementById("btn-next").addEventListener("click",      () => AudioEngine.nextSong());
    document.getElementById("btn-shuffle").addEventListener("click",   () => AudioEngine.toggleShuffle());
    document.getElementById("btn-repeat").addEventListener("click",    () => AudioEngine.cycleRepeat());
    document.getElementById("vol-btn").addEventListener("click",       () => AudioEngine.toggleMute());
    document.getElementById("vol-slider").addEventListener("input",    e  => AudioEngine.setVolume(e.target.value));
    document.getElementById("progress").addEventListener("click",      e  => AudioEngine.seekTo(e));

    // Hero action buttons
    document.getElementById("btn-hero-notes").addEventListener("click", () => Modals.openLyrics(AppState.currentId));
    document.getElementById("btn-hero-addpl").addEventListener("click", () => Modals.openAddToPlaylist(AppState.currentId));
    document.getElementById("btn-hero-dl").addEventListener("click",    () => Modals.openDownload(AppState.currentId));
  }

  // ── Init ─────────────────────────────────────────────────

  function init() {
    // Set fallback art in vinyl label and hero
    const fb = blankArt();
    _setVinylArt(fb);
    document.getElementById("hero-art").src = fb;

    // Hide hero action buttons until a song is loaded
    document.getElementById("btn-hero-notes").hidden = true;
    document.getElementById("btn-hero-addpl").hidden = true;
    document.getElementById("btn-hero-dl").hidden    = true;

    bindEvents();
  }

  return { init, sync, syncPlayPauseButton, syncVolumeIcons, syncVinyl };
})();