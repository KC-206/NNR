/**
 * lightbox.js — Full-screen artwork viewer
 *
 * Open by clicking any .card-art or #hero-art image.
 * Close by clicking the backdrop, the ✕ button, or pressing Escape.
 */

const Lightbox = (() => {

  function open(src, title, album) {
    const lb  = document.getElementById("lightbox");
    const img = document.getElementById("lightbox-img");
    if (!lb || !img) return;

    img.src = src;
    document.getElementById("lightbox-title").textContent = title || "";
    document.getElementById("lightbox-album").textContent = album || "";

    lb.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function close() {
    const lb = document.getElementById("lightbox");
    if (!lb) return;
    lb.classList.remove("open");
    document.body.style.overflow = "";
    // Clear src after transition so old image doesn't flash on re-open
    setTimeout(() => {
      const img = document.getElementById("lightbox-img");
      if (img && !document.getElementById("lightbox").classList.contains("open")) {
        img.src = "";
      }
    }, 250);
  }

  /** Wire up click handlers on artwork — called after grid renders */
  function bindGrid() {
    document.getElementById("song-grid").addEventListener("click", e => {
      const img = e.target.closest(".card-art");
      if (!img) return;
      e.stopPropagation();
      // Find which song this card belongs to
      const card   = img.closest(".song-card[data-song-id]");
      const songId = card ? card.dataset.songId : null;
      const song   = songId ? getSong(songId) : null;
      open(img.src, song ? song.title : "", song ? song.album : "");
    });
  }

  /** Wire up click handler on the hero artwork */
  function bindHero() {
    document.getElementById("hero-art").addEventListener("click", () => {
      const img  = document.getElementById("hero-art");
      const song = getSong(AppState.currentId);
      if (!img.src || img.src === blankArt()) return;
      open(img.src, song ? song.title : "", song ? song.album : "");
    });
  }

  function init() {
    bindGrid();
    bindHero();

    // Escape key to close
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") close();
    });
  }

  return { init, open, close };
})();
