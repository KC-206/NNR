/**
 * state.js — Application state and localStorage abstraction
 *
 * AppState  — single mutable state object for runtime state
 * Storage   — clean API over localStorage (keyed via Config)
 */

/** Runtime state — mutated by the various modules */
const AppState = {
  currentId:  null,     // ID of the currently loaded song
  isPlaying:  false,    // Is audio currently playing?
  shuffle:    false,    // Shuffle mode enabled?
  repeat:     "none",   // "none" | "all" | "one"
  muted:      false,    // Is volume muted?
  volume:     0.8,      // Volume level 0–1
  tag:        null,     // Active tag filter (null = none)
  query:      "",       // Active search string
  view:       "all",    // "all" | "recent" | "popular" | "pl_<id>"
  sort:       "default",// "default" | "title" | "plays" | "duration"
  queue:      [],       // Ordered array of song IDs for playback
  queueIdx:   0,        // Current position within queue
  dlTarget:   null,     // Song ID pending download confirmation
  plTarget:   null,     // Song ID pending add-to-playlist action
};

/** Persistent storage helpers — all data keyed via Config */
const Storage = {
  getCounts()     { return JSON.parse(localStorage.getItem(Config.storageKeys.counts)    || "{}"); },
  saveCounts(v)   { localStorage.setItem(Config.storageKeys.counts,    JSON.stringify(v)); },

  getRecent()     { return JSON.parse(localStorage.getItem(Config.storageKeys.recent)    || "[]"); },
  saveRecent(v)   { localStorage.setItem(Config.storageKeys.recent,    JSON.stringify(v)); },

  getPlaylists()  { return JSON.parse(localStorage.getItem(Config.storageKeys.playlists) || "[]"); },
  savePlaylists(v){ localStorage.setItem(Config.storageKeys.playlists, JSON.stringify(v)); },

  getTheme()      { return localStorage.getItem(Config.storageKeys.theme) || Config.defaultTheme; },
  saveTheme(v)    { localStorage.setItem(Config.storageKeys.theme, v); },
};

/** Helper — format seconds as M:SS */
function formatTime(seconds) {
  const s = Math.floor(seconds || 0);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** Helper — get a song object by ID */
function getSong(id) {
  return SONGS.find(s => s.id === id) || null;
}

/** Helper — placeholder SVG art for songs without artwork */
function blankArt() {
  return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect fill='%231c2529' width='400' height='400'/%3E%3Ccircle cx='200' cy='200' r='55' fill='none' stroke='%23232e33' stroke-width='2'/%3E%3Ccircle cx='200' cy='200' r='12' fill='%23232e33'/%3E%3C/svg%3E";
}
