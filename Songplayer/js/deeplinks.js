/**
 * deeplinks.js — URL hash deep linking with human-readable slugs
 *
 * URLs like: https://your-site.github.io/NNR/Songplayer/#its-pie
 *
 * On page load:  if a hash is present, find and auto-play that song.
 * copyLink(id):  copies a slug-based URL to clipboard.
 * updateHash():  updates the URL bar when a song plays (called by AudioEngine).
 */

const DeepLinks = (() => {

  /** Convert a song title to a URL-safe slug */
  function slugify(title) {
    return title
      .toLowerCase()
      .replace(/[''`]/g, "")        // strip apostrophes
      .replace(/[^a-z0-9]+/g, "-")  // non-alphanumeric → hyphen
      .replace(/^-+|-+$/g, "");     // trim leading/trailing hyphens
  }

  /** Find a song by slug — tries title match first, falls back to ID */
  function findBySlug(slug) {
    if (!slug) return null;
    // Direct ID match (backwards compatibility with old #s003 style links)
    const byId = SONGS.find(s => s.id === slug);
    if (byId) return byId;
    // Slug match against title
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

  /** Brief "✓ Copied" feedback on the button */
  function _showFeedback(btnEl) {
    if (!btnEl) return;
    const orig = btnEl.innerHTML;
    btnEl.innerHTML = `<svg width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12"/></svg>`;
    btnEl.style.color       = "var(--accent2)";
    btnEl.style.borderColor = "var(--accent2)";
    setTimeout(() => {
      btnEl.innerHTML       = orig;
      btnEl.style.color     = "";
      btnEl.style.borderColor = "";
    }, 2000);
  }

  /** On page load — check for a hash and play that song */
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
      // Load the song but don't attempt autoplay — just set it up ready to go.
      // We call the internal load without play so the audio element isn't left
      // in a broken state by a blocked autoplay attempt.
      _loadSongWithoutPlay(song);
      _scrollToCard(song.id);
      _showAutoplayPrompt(song);
    }, 300);
  }

  function _loadSongWithoutPlay(song) {
    // Update AppState and UI exactly like playSong() does, minus the audio.play() call
    AppState.currentId = song.id;
    const audio = AudioEngine.getAudioElement();
    audio.src = song.src;
    audio.load(); // reset the element cleanly
    AppState.isPlaying = false;

    // Update play counts and recently played
    const counts = Storage.getCounts();
    counts[song.id] = (counts[song.id] || 0) + 1;
    Storage.saveCounts(counts);
    const recent = Storage.getRecent();
    Storage.saveRecent([song.id, ...recent.filter(x => x !== song.id)].slice(0, Config.recentMax));

    AudioEngine.rebuildQueue();
    PlayerUI.sync();
    Catalog.syncGrid();
    Catalog.renderSidebarList();
    DeepLinks.updateHash(song.id);
  }

  function _showAutoplayPrompt(song) {
    // Remove any existing prompt
    const existing = document.getElementById("autoplay-prompt");
    if (existing) existing.remove();

    const prompt = document.createElement("div");
    prompt.id = "autoplay-prompt";
    prompt.innerHTML = `
      <div id="autoplay-prompt-inner">
        <img id="autoplay-art" src="${song.artwork || blankArt()}" alt="">
        <div id="autoplay-text">
          <div id="autoplay-title">${song.title}</div>
          <div id="autoplay-sub">Shared with you · tap to play</div>
        </div>
        <button id="autoplay-btn">
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        </button>
        <button id="autoplay-dismiss">✕</button>
      </div>
    `;

    // Play directly on the user's click gesture
    prompt.querySelector("#autoplay-btn").addEventListener("click", () => {
      prompt.remove();
      const audio = AudioEngine.getAudioElement();
      audio.play().then(() => {
        AppState.isPlaying = true;
        PlayerUI.syncPlayPauseButton();
        Catalog.syncGrid();
        Catalog.renderSidebarList();
        if (typeof Sparkles !== "undefined") Sparkles.start();
        Toast.show(`Playing "${song.title}"`);
      }).catch(() => {
        Toast.show("Tap play to start");
      });
    });
    // Dismiss
    prompt.querySelector("#autoplay-dismiss").addEventListener("click", () => prompt.remove());

    document.body.appendChild(prompt);

    // Auto-dismiss after 12 seconds
    setTimeout(() => { if (prompt.parentNode) prompt.remove(); }, 12000);
  }

  function _scrollToCard(songId) {
    const card = document.querySelector(`.song-card[data-song-id="${songId}"]`);
    if (card) setTimeout(() => card.scrollIntoView({ behavior: "smooth", block: "center" }), 600);
  }

  return { init, copyLink, getUrl, updateHash, slugify };
})();
