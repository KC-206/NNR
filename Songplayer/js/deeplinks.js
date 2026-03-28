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
      // Set up the song visually — artwork, title, queue, hero — but
      // do NOT touch audio.play() at all. The audio element stays clean
      // so the user's first click on the play button works perfectly.
      _prepareWithoutPlay(song);
      _scrollToCard(song.id);

      // Show a gentle non-blocking hint in the player bar area
      Toast.show(`"${song.title}" ready — press play to listen`, 5000);
    }, 300);
  }

  function _prepareWithoutPlay(song) {
    AppState.currentId = song.id;
    AppState.isPlaying = false;

    // Set the audio src so it's preloaded and ready, but don't call play()
    const audio = AudioEngine.getAudioElement();
    audio.src     = song.src;
    audio.preload = "auto";

    // Update recently played
    const recent = Storage.getRecent();
    Storage.saveRecent([song.id, ...recent.filter(x => x !== song.id)].slice(0, Config.recentMax));

    AudioEngine.rebuildQueue();
    PlayerUI.sync();           // updates hero art, title, artist
    Catalog.syncGrid();        // highlights the card
    Catalog.renderSidebarList();
    updateHash(song.id);
  }

  function _scrollToCard(songId) {
    const card = document.querySelector(`.song-card[data-song-id="${songId}"]`);
    if (card) setTimeout(() => card.scrollIntoView({ behavior: "smooth", block: "center" }), 600);
  }

  return { init, copyLink, getUrl, updateHash, slugify };
})();
