/**
 * catalog.js — Song catalog: filtering, sorting, and rendering
 *
 * getFiltered()       — returns songs matching current state filters
 * renderGrid()        — renders the main song card grid
 * renderSidebarList() — renders the compact sidebar track list
 * renderTags()        — renders the tag filter chips
 * setView()           — switches the active view (all/recent/popular/playlist)
 * filterTag()         — toggles a tag filter
 * setSearch()         — updates the search query
 * setSort()           — updates the sort order
 */

const Catalog = (() => {

  // ── Filtering & Sorting ────────────────────────────────

  /** Returns the filtered + sorted array of songs for the current state */
  function getFiltered() {
    let list = _getBaseList();

    // Tag filter
    if (AppState.tag) {
      list = list.filter(s => s.tags.includes(AppState.tag));
    }

    // Search filter (title, artist, album, tags)
    if (AppState.query) {
      const q = AppState.query.toLowerCase();
      list = list.filter(s =>
        s.title.toLowerCase().includes(q)  ||
        s.artist.toLowerCase().includes(q) ||
        s.album.toLowerCase().includes(q)  ||
        s.tags.some(t => t.includes(q))
      );
    }

    // Sort
    return _sorted(list);
  }

  /** Base list before tag/search filtering — varies by view */
  function _getBaseList() {
    const counts = Storage.getCounts();

    if (AppState.view === "recent") {
      return Storage.getRecent().map(id => getSong(id)).filter(Boolean);
    }
    if (AppState.view === "popular") {
      return [...SONGS]
        .filter(s => counts[s.id])
        .sort((a, b) => (counts[b.id] || 0) - (counts[a.id] || 0));
    }
    if (AppState.view.startsWith("pl_")) {
      const playlists = Storage.getPlaylists();
      const pl = playlists.find(p => p.id === AppState.view);
      return pl ? pl.songs.map(id => getSong(id)).filter(Boolean) : [];
    }
    return [...SONGS]; // "all"
  }

  function _sorted(list) {
    const counts = Storage.getCounts();
    if (AppState.sort === "title")    return [...list].sort((a, b) => a.title.localeCompare(b.title));
    if (AppState.sort === "plays")    return [...list].sort((a, b) => (counts[b.id] || 0) - (counts[a.id] || 0));
    if (AppState.sort === "duration") return [...list].sort((a, b) => a.duration - b.duration);
    return list; // "default" = date added order (SONGS array order)
  }

  // ── View / Filter controls ─────────────────────────────

  /** Switch the active view and re-render */
  function setView(viewId, activeBtnEl) {
    AppState.view = viewId;
    AppState.tag  = null; // clear tag filter on view change

    // Update nav active states
    document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".pl-nav-item").forEach(b => b.classList.remove("active"));
    if (activeBtnEl) activeBtnEl.classList.add("active");

    // Update section title
    const labels = { all: "All Songs", recent: "Recently Played", popular: "Most Played" };
    const playlists = Storage.getPlaylists();
    const pl = playlists.find(p => p.id === viewId);
    document.getElementById("section-title").textContent = labels[viewId] || (pl ? pl.name : "Playlist");

    renderTags();
    renderGrid();
    renderSidebarList();
  }

  /** Toggle a tag filter chip */
  function filterTag(tag) {
    AppState.tag = AppState.tag === tag ? null : tag;
    document.querySelectorAll(".tag-chip").forEach(c =>
      c.classList.toggle("active", c.dataset.tag === AppState.tag)
    );
    renderGrid();
    renderSidebarList();
    AudioEngine.rebuildQueue();
  }

  function setSearch(query) {
    AppState.query = query;
    renderGrid();
    renderSidebarList();
  }

  function setSort(value) {
    AppState.sort = value;
    renderGrid();
  }

  // ── Rendering ──────────────────────────────────────────

  /** Render the main song card grid */
  function renderGrid() {
    const songs   = getFiltered();
    const counts  = Storage.getCounts();
    const noRes   = document.getElementById("no-results");
    const grid    = document.getElementById("song-grid");
    const countEl = document.getElementById("song-count");

    noRes.style.display = songs.length ? "none" : "block";
    countEl.textContent = songs.length === SONGS.length
      ? `${songs.length} songs`
      : `${songs.length} / ${SONGS.length}`;

    grid.innerHTML = songs.map((s, i) => {
      const isPlaying = s.id === AppState.currentId;
      const playIcon  = isPlaying && AppState.isPlaying
        ? `<svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`
        : `<svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;

      return `
        <div class="song-card ${isPlaying ? "playing" : ""}"
             style="animation-delay:${Math.min(i * 28, 300)}ms"
             ondblclick="AudioEngine.playSong('${s.id}')">
          <div class="card-art-wrap">
            <img class="card-art" src="${s.artwork || blankArt()}" alt="${_esc(s.title)}" loading="lazy"
                 onerror="this.src='${blankArt()}'">
            <div class="card-overlay">
              <div class="card-play" onclick="event.stopPropagation(); AudioEngine.playSong('${s.id}')">
                ${playIcon}
              </div>
            </div>
          </div>
          <div class="card-body">
            <div class="card-title">${_esc(s.title)}</div>
            <div class="card-meta">
              ${_esc(s.album)} · ${formatTime(s.duration)}${counts[s.id] ? ` · ▶ ${counts[s.id]}` : ""}
            </div>
            <div class="card-tags">
              ${s.tags.map(t =>
                `<span class="card-tag" onclick="event.stopPropagation(); Catalog.filterTag('${t}')">#${t}</span>`
              ).join("")}
            </div>
            <div class="card-actions">
              <button class="card-btn"
                      onclick="event.stopPropagation(); Modals.openLyrics('${s.id}')"
                      title="Lyrics / Notes">
                <svg width="10" height="10" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                </svg>
                Notes
              </button>
              <button class="card-btn"
                      onclick="event.stopPropagation(); Modals.openAddToPlaylist('${s.id}')"
                      title="Add to playlist">
                <svg width="10" height="10" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Playlist
              </button>
              ${s.downloadable ? `
              <button class="card-btn dl"
                      onclick="event.stopPropagation(); Modals.openDownload('${s.id}')"
                      title="Download">
                <svg width="10" height="10" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                DL
              </button>` : ""}
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  /** Render the compact sidebar track list */
  function renderSidebarList() {
    document.getElementById("sidebar-list").innerHTML = getFiltered().map(s => `
      <div class="track-row ${s.id === AppState.currentId ? "playing" : ""}"
           onclick="AudioEngine.playSong('${s.id}')">
        <img class="tr-art" src="${s.artwork || blankArt()}" alt=""
             onerror="this.src='${blankArt()}'">
        <div class="tr-info">
          <div class="tr-title">${_esc(s.title)}</div>
          <div class="tr-tags">${s.tags.map(t => `#${t}`).join(" ")}</div>
        </div>
        <div class="bars">
          <span style="height:3px"></span>
          <span style="height:7px"></span>
          <span style="height:5px"></span>
        </div>
        <div class="tr-dur">${formatTime(s.duration)}</div>
      </div>
    `).join("");
  }

  /** Render tag filter chips from all unique tags in the catalog */
  function renderTags() {
    const allTags = [...new Set(SONGS.flatMap(s => s.tags))].sort();
    document.getElementById("tags-area").innerHTML = allTags.map(t => `
      <span class="tag-chip ${AppState.tag === t ? "active" : ""}" data-tag="${t}"
            onclick="Catalog.filterTag('${t}')">#${t}</span>
    `).join("");
  }

  /** Escape HTML to prevent XSS in generated markup */
  function _esc(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  return {
    getFiltered,
    setView,
    filterTag,
    setSearch,
    setSort,
    renderGrid,
    renderSidebarList,
    renderTags,
  };
})();
