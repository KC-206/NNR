/**
 * config.js — Site-wide configuration
 *
 * This is the only file (besides songs.js) you should need
 * to edit for basic site customisation.
 */

const Config = Object.freeze({
  /** Displayed in the sidebar header */
  siteName: "Huntress Harmonies",

  /** Displayed below the site name */
  tagline: "Music Catalog",

  /**
   * Password required to download any track marked downloadable: true.
   * NOTE: This password is visible in the page source — it provides a
   * friction barrier for casual visitors, not cryptographic security.
   */
  downloadPassword: "huntress",

  /** Theme applied on first visit (before localStorage preference is set) */
  defaultTheme: "forest",

  /** Maximum number of tracks stored in Recently Played history */
  recentMax: 100,

  /** localStorage key names — change these if you run multiple instances */
  storageKeys: {
    counts:    "hh_counts",
    recent:    "hh_recent",
    playlists: "hh_playlists",
    theme:     "hh_theme",
  },
});
