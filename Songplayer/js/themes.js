/**
 * themes.js — Theme management
 *
 * Applies themes by setting data-theme on <html>.
 * Theme CSS variables are defined in css/themes.css.
 * The chosen theme is persisted to localStorage.
 * Theme selection is exposed as a <select> dropdown in the sidebar.
 */

const ThemeManager = (() => {

  /** All available themes — id must match a [data-theme] block in themes.css */
  const THEMES = [
    { id: "forest",   label: "Forest   — dark woodland greens"     },
    { id: "midnight", label: "Midnight — deep navy and indigo"     },
    { id: "ember",    label: "Ember    — warm amber and copper"    },
    { id: "crimson",  label: "Crimson  — deep blood red"           },
    { id: "violet",   label: "Violet   — deep purple and lavender" },
    { id: "copper",   label: "Copper   — rich metallic bronze"     },
    { id: "obsidian", label: "Obsidian — near-black with grey"     },
    { id: "sage",     label: "Sage     — muted olive and warm grey"},
    { id: "arctic",   label: "Arctic   — ice blue and silver"      },
    { id: "dawn",     label: "Dawn     — soft cream and sage"      },
  ];

  /** Apply a theme and persist the choice */
  function apply(themeId) {
    const theme = THEMES.find(t => t.id === themeId);
    if (!theme) return;
    document.documentElement.setAttribute("data-theme", themeId);
    Storage.saveTheme(themeId);
    const select = document.getElementById("theme-select");
    if (select && select.value !== themeId) select.value = themeId;
  }

  /** Render and bind the theme <select> dropdown */
  function renderDropdown() {
    const select = document.getElementById("theme-select");
    if (!select) return;
    const current = Storage.getTheme();
    select.innerHTML = THEMES.map(t =>
      `<option value="${t.id}" ${t.id === current ? "selected" : ""}>${t.label}</option>`
    ).join("");
    select.addEventListener("change", () => apply(select.value));
  }

  /** Init — load persisted theme and render the dropdown */
  function init() {
    apply(Storage.getTheme());
    renderDropdown();
  }

  return { init, apply, THEMES };
})();
