/**
 * modals.js — Modal management
 *
 * open(id)  / close(id) — generic open/close
 * openLyrics(songId)       — show lyrics/notes for a song
 * openAddToPlaylist(songId)— show add-to-playlist picker
 * openCreatePlaylist()     — show new playlist form
 * openDownload(songId)     — show password-protected download prompt
 */

const Modals = (() => {

  // ── Generic helpers ────────────────────────────────────

  function open(id) {
    document.getElementById(id).classList.add("open");
  }

  function close(id) {
    document.getElementById(id).classList.remove("open");
  }

  function closeAll() {
    document.querySelectorAll(".backdrop").forEach(el => el.classList.remove("open"));
  }

  // ── Lyrics / Notes ─────────────────────────────────────

  function openLyrics(songId) {
    if (!songId) return;
    const song = getSong(songId);
    if (!song) return;

    document.getElementById("lyrics-modal-title").textContent = song.title;

    const body = document.getElementById("lyrics-body");
    if (song.notes && song.notes.trim()) {
      body.className = "";
      body.textContent = song.notes;
    } else {
      body.className = "empty";
      body.textContent = "No notes or lyrics have been added for this track.";
    }
    open("lyrics-modal");
  }

  // ── Add to Playlist ────────────────────────────────────

  function openAddToPlaylist(songId) {
    if (!songId) return;
    AppState.plTarget = songId;

    _renderPlaylistOptions(songId);
    open("addpl-modal");
  }

  function _renderPlaylistOptions(songId) {
    const playlists = Storage.getPlaylists();
    const container = document.getElementById("pl-options");

    if (!playlists.length) {
      container.innerHTML = `<div class="pl-options-empty">No playlists yet — create one below.</div>`;
      return;
    }

    container.innerHTML = playlists.map(pl => {
      const hasSong = pl.songs.includes(songId);
      return `
        <div class="pl-option ${hasSong ? "has-song" : ""}" data-pl-id="${pl.id}">
          <span>
            ${pl.name}
            <span class="text-muted" style="font-size:10px">(${pl.songs.length})</span>
          </span>
          <span class="pl-check">✓</span>
        </div>
      `;
    }).join("");

    // Attach click handlers after rendering
    container.querySelectorAll(".pl-option").forEach(el => {
      el.addEventListener("click", () => {
        Playlists.toggleSong(el.dataset.plId, AppState.plTarget);
        // Re-render options to reflect the new state
        _renderPlaylistOptions(AppState.plTarget);
        // If we're currently viewing this playlist, refresh the grid
        if (AppState.view.startsWith("pl_")) {
          Catalog.renderGrid();
          Catalog.renderSidebarList();
        }
        Playlists.renderNav();
      });
    });
  }

  // ── Create Playlist ────────────────────────────────────

  function openCreatePlaylist() {
    close("addpl-modal"); // close the parent modal if open
    document.getElementById("pl-name-input").value = "";
    open("create-pl-modal");
    setTimeout(() => document.getElementById("pl-name-input").focus(), 120);
  }

  function confirmCreatePlaylist() {
    const name = document.getElementById("pl-name-input").value.trim();
    if (!name) return;
    Playlists.create(name);
    close("create-pl-modal");
    Toast.show(`"${name}" created`);
  }

  // ── Download ───────────────────────────────────────────

  function openDownload(songId) {
    if (!songId) return;
    const song = getSong(songId);
    if (!song || !song.downloadable) return;

    AppState.dlTarget = songId;
    document.getElementById("dl-pw").value = "";
    document.getElementById("dl-err").classList.remove("show");
    open("dl-modal");
    setTimeout(() => document.getElementById("dl-pw").focus(), 120);
  }

  function confirmDownload() {
    const pw  = document.getElementById("dl-pw").value;
    const err = document.getElementById("dl-err");

    if (pw !== Config.downloadPassword) {
      err.classList.add("show");
      const modal = document.querySelector("#dl-modal .modal");
      modal.classList.add("animate-shake");
      setTimeout(() => modal.classList.remove("animate-shake"), 450);
      return;
    }

    const song = getSong(AppState.dlTarget);
    if (!song) return;

    close("dl-modal");
    Toast.show(`Preparing download…`);

    // Fetch as blob so it downloads correctly on both file:// and https://
    fetch(song.src)
      .then(r => {
        if (!r.ok) throw new Error("File not found");
        return r.blob();
      })
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a   = document.createElement("a");
        a.href     = url;
        a.download = `${song.title}.mp3`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 5000);
        Toast.show(`Downloading "${song.title}"`);
      })
      .catch(() => {
        Toast.show("⚠ Could not fetch the file — check the src path in songs.js");
      });
  }

  // ── Bind events (called once on init) ─────────────────

  function bindEvents() {
    // Close buttons with data-close attribute
    document.querySelectorAll("[data-close]").forEach(btn => {
      btn.addEventListener("click", () => close(btn.dataset.close));
    });

    // Click on backdrop (outside modal) to close
    document.querySelectorAll(".backdrop").forEach(backdrop => {
      backdrop.addEventListener("click", e => {
        if (e.target === backdrop) close(backdrop.id);
      });
    });

    // Confirmation buttons
    document.getElementById("btn-confirm-playlist").addEventListener("click", confirmCreatePlaylist);
    document.getElementById("btn-confirm-dl").addEventListener("click", confirmDownload);
    document.getElementById("btn-new-pl-from-modal").addEventListener("click", openCreatePlaylist);

    // Enter key in playlist name field
    document.getElementById("pl-name-input").addEventListener("keydown", e => {
      if (e.key === "Enter") confirmCreatePlaylist();
    });

    // Enter key in download password field
    document.getElementById("dl-pw").addEventListener("keydown", e => {
      if (e.key === "Enter") confirmDownload();
    });

    // Escape to close all modals
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") closeAll();
    });
  }

  return {
    open,
    close,
    closeAll,
    openLyrics,
    openAddToPlaylist,
    openCreatePlaylist,
    confirmCreatePlaylist,
    openDownload,
    confirmDownload,
    bindEvents,
  };
})();
