/**
 * app.js — Application entry point
 *
 * Contains:
 *   Toast   — lightweight notification utility
 *   App     — init function that wires all modules together
 *
 * Load order in index.html must be:
 *   config → songs → state → themes → audio → catalog →
 *   player → playlists → modals → keyboard → app (this file)
 */

// ── Toast notification utility ─────────────────────────────

const Toast = (() => {
  let _timer = null;

  function show(message, durationMs = 2400) {
    const el = document.getElementById("toast");
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(_timer);
    _timer = setTimeout(() => el.classList.remove("show"), durationMs);
  }

  return { show };
})();

// ── Application bootstrap ──────────────────────────────────

const App = (() => {

  function init() {
    // 1. Apply persisted theme and render theme swatches
    ThemeManager.init();

    // 2. Populate static site name / tagline from config
    document.getElementById("site-name").textContent    = Config.siteName;
    document.getElementById("site-tagline").textContent = Config.tagline;
    document.title = Config.siteName;

    // 3. Build sidebar navigation items
    _renderSidebarNav();

    // 4. Render initial catalog state
    Catalog.renderTags();
    Catalog.renderGrid();
    Catalog.renderSidebarList();

    // 5. Render playlists
    Playlists.renderNav();

    // 6. Init player bar UI and bind its events
    PlayerUI.init();

    // 7. Bind modal events
    Modals.bindEvents();

    // 8. Bind keyboard shortcuts
    Keyboard.bindEvents();

    // 10. Bind sidebar search and sort controls
    document.getElementById("search-input").addEventListener("input", e =>
      Catalog.setSearch(e.target.value)
    );
    document.getElementById("sort-select").addEventListener("change", e =>
      Catalog.setSort(e.target.value)
    );

    // 11. Bind new playlist button
    document.getElementById("btn-new-playlist").addEventListener("click", () =>
      Modals.openCreatePlaylist()
    );

    // 12. Init deep links (reads URL hash, handles shared song links)
    DeepLinks.init();

    // 13. Init visualizer (off by default, restored from localStorage)
    Visualizer.init(AudioEngine.getAudioElement());

    // 14. Init sparkle system
    Sparkles.init();

    // 15. Init lightbox
    Lightbox.init();
  }

  /** Build the static nav items in the sidebar */
  function _renderSidebarNav() {
    const nav = document.getElementById("sidebar-nav");
    const items = [
      {
        view: "all",
        label: "All Songs",
        icon: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                 <path d="M9 18V5l12-2v13"/>
                 <circle cx="6" cy="18" r="3"/>
                 <circle cx="18" cy="16" r="3"/>
               </svg>`,
      },
      {
        view: "recent",
        label: "Recently Played",
        icon: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                 <circle cx="12" cy="12" r="10"/>
                 <polyline points="12,6 12,12 16,14"/>
               </svg>`,
      },
      {
        view: "popular",
        label: "Most Played",
        icon: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                 <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
                 <polyline points="17,6 23,6 23,12"/>
               </svg>`,
      },
    ];

    nav.innerHTML = items.map(item => `
      <button class="nav-item ${item.view === "all" ? "active" : ""}" data-view="${item.view}">
        ${item.icon}
        ${item.label}
      </button>
    `).join("");

    nav.querySelectorAll(".nav-item").forEach(btn => {
      btn.addEventListener("click", () => Catalog.setView(btn.dataset.view, btn));
    });
  }

  return { init };
})();

// ── Start the app when the DOM is ready ───────────────────
document.addEventListener("DOMContentLoaded", () => App.init());
