/**
 * deeplinks.js — URL hash deep linking
 *
 * Supports URLs like: https://your-site.github.io/#s003
 *
 * On page load:  if a hash is present, auto-play that song.
 * copyLink(id):  copies the deep link URL for a song to clipboard,
 *                briefly shows "✓ Copied!" feedback on the button.
 */

const DeepLinks = (() => {

  /** Build the shareable URL for a given song ID */
  function getUrl(songId) {
    // Strip any existing hash from the current URL, then append the new one.
    // Using href instead of origin+pathname so it works on file:// locally too.
    const base = location.href.replace(/#.*$/, "");
    return `${base}#${songId}`;
  }

  /** Copy the deep link for a song to clipboard.
   *  btnEl is the button that was clicked — used for visual feedback. */
  function copyLink(songId, btnEl) {
    const url  = getUrl(songId);
    const song = getSong(songId);

    navigator.clipboard.writeText(url).then(() => {
      _showFeedback(btnEl);
      Toast.show(`Link copied${song ? ` — "${song.title}"` : ""}`);
    }).catch(() => {
      // Fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      _showFeedback(btnEl);
      Toast.show(`Link copied${song ? ` — "${song.title}"` : ""}`);
    });

    // Update the URL bar to reflect the song without reloading
    history.replaceState(null, "", `#${songId}`);
  }

  /** Brief "✓ Copied" label on the button */
  function _showFeedback(btnEl) {
    if (!btnEl) return;
    const orig = btnEl.innerHTML;
    btnEl.innerHTML = `<svg width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12"/></svg> Copied!`;
    btnEl.style.color         = "var(--accent2)";
    btnEl.style.borderColor   = "var(--accent2)";
    setTimeout(() => {
      btnEl.innerHTML         = orig;
      btnEl.style.color       = "";
      btnEl.style.borderColor = "";
    }, 2000);
  }

  /** On page load — check for a hash and play that song */
  function init() {
    // Handle hash on initial page load
    _handleHash();

    // Handle hash changes (browser back/forward)
    window.addEventListener("hashchange", _handleHash);
  }

  function _handleHash() {
    const hash = location.hash.slice(1); // strip the #
    if (!hash) return;

    const song = getSong(hash);
    if (!song) return;

    // Small delay so the rest of the app finishes initialising first
    setTimeout(() => {
      AudioEngine.playSong(song.id);
      _scrollToCard(song.id);
      Toast.show(`Playing "${song.title}" from shared link`);
    }, 300);
  }

  /** Scroll the song card into view when arriving via deep link */
  function _scrollToCard(songId) {
    const card = document.querySelector(`.song-card[data-song-id="${songId}"]`);
    if (card) {
      setTimeout(() => card.scrollIntoView({ behavior: "smooth", block: "center" }), 600);
    }
  }

  return { init, copyLink, getUrl };
})();
