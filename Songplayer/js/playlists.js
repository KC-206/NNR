/**
 * playlists.js — Playlist management
 *
 * Playlists are persisted in localStorage as an array of:
 *   { id: "pl_<timestamp>", name: "My Playlist", songs: ["s001", "s003", ...] }
 */

const Playlists = (() => {

  // ── CRUD ───────────────────────────────────────────────

  /** Create a new empty playlist */
  function create(name) {
    const playlists = Storage.getPlaylists();
    const pl = {
      id:    `pl_${Date.now()}`,
      name:  name.trim(),
      songs: [],
    };
    playlists.push(pl);
    Storage.savePlaylists(playlists);
    renderNav();
    return pl;
  }

  /** Delete a playlist by ID */
  function remove(id) {
    if (!confirm("Delete this playlist?")) return;
    let playlists = Storage.getPlaylists();
    playlists = playlists.filter(p => p.id !== id);
    Storage.savePlaylists(playlists);

    // If the deleted playlist was active, fall back to "all"
    if (AppState.view === id) {
      Catalog.setView("all", document.querySelector(".nav-item[data-view='all']"));
    } else {
      renderNav();
    }
    Toast.show("Playlist deleted");
  }

  /** Add or remove a song from a playlist (toggle) */
  function toggleSong(playlistId, songId) {
    const playlists = Storage.getPlaylists();
    const pl = playlists.find(p => p.id === playlistId);
    if (!pl) return;

    if (pl.songs.includes(songId)) {
      pl.songs = pl.songs.filter(x => x !== songId);
      Toast.show("Removed from playlist");
    } else {
      pl.songs.push(songId);
      Toast.show(`Added to "${pl.name}"`);
    }
    Storage.savePlaylists(playlists);
  }

  // ── Rendering ──────────────────────────────────────────

  /** Render the playlist list in the sidebar */
  function renderNav() {
    const playlists = Storage.getPlaylists();
    const container = document.getElementById("playlist-nav");

    if (!playlists.length) {
      container.innerHTML = `<div class="empty-state">No playlists yet</div>`;
      return;
    }

    container.innerHTML = playlists.map(pl => `
      <button class="pl-nav-item ${AppState.view === pl.id ? "active" : ""}"
              data-pl-id="${pl.id}">
        <span class="pl-name">${pl.name}</span>
        <span class="pl-del" data-del-id="${pl.id}" title="Delete playlist">✕</span>
      </button>
    `).join("");

    // Event delegation for playlist nav clicks
    container.querySelectorAll(".pl-nav-item").forEach(btn => {
      btn.addEventListener("click", () => {
        Catalog.setView(btn.dataset.plId, btn);
      });
    });
    container.querySelectorAll(".pl-del").forEach(btn => {
      btn.addEventListener("click", e => {
        e.stopPropagation();
        remove(btn.dataset.delId);
      });
    });
  }

  return { create, remove, toggleSong, renderNav };
})();
