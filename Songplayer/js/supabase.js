/**
 * supabase.js — Global play tracking and liked songs via Supabase
 *
 * ════════════════════════════════════════════════════════
 *  SETUP — fill in your Supabase project details below
 *  See SUPABASE_SETUP.md for step-by-step instructions
 * ════════════════════════════════════════════════════════
 */

const SupabaseDB = (() => {

  // ── ★ YOUR SUPABASE CONFIG — edit these two lines ★ ──────
  const SUPABASE_URL     = "https://dmhfwtbwobyjhfvuycnc.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_PNRDZsxEb9c5Jd5NJKzRvw_n4m39kFq";
  // ──────────────────────────────────────────────────────────

  // ── State ─────────────────────────────────────────────────
  let myLikes      = new Set();  // song IDs liked by this browser fingerprint
  let likeCounts   = {};         // { songId: totalLikeCount }
  let globalPlays  = {};         // { songId: globalPlayCount }
  let fingerprint  = null;
  let initialized  = false;

  // ── Browser fingerprint ────────────────────────────────────
  function _fingerprint() {
    if (fingerprint) return fingerprint;
    const raw = [
      navigator.userAgent,
      screen.width + "x" + screen.height,
      screen.colorDepth,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      navigator.language,
      navigator.hardwareConcurrency || 0,
    ].join("|");
    let h = 0;
    for (let i = 0; i < raw.length; i++) { h = Math.imul(31, h) + raw.charCodeAt(i) | 0; }
    fingerprint = "fp_" + Math.abs(h).toString(36);
    return fingerprint;
  }

  // ── Low-level API helper ───────────────────────────────────
  async function _api(path, options = {}) {
    const headers = {
      "apikey":        SUPABASE_ANON_KEY,
      "Authorization": "Bearer " + SUPABASE_ANON_KEY,
      "Content-Type":  "application/json",
      // Always request minimal return — avoids empty-body JSON parse errors
      "Prefer":        options.prefer || "return=minimal",
    };

    const res = await fetch(SUPABASE_URL + "/rest/v1/" + path, {
      method:  options.method || "GET",
      headers,
      body:    options.body   || undefined,
    });

    // 204 No Content and 200/201 with empty body are all success
    if (res.status === 204 || res.status === 201) return null;
    if (!res.ok) {
      const text = await res.text().catch(() => res.status);
      throw new Error("Supabase " + res.status + ": " + text);
    }
    // GET requests return JSON; write requests with return=minimal return empty
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  }

  async function _rpc(fn, params = {}) {
    const res = await fetch(SUPABASE_URL + "/rest/v1/rpc/" + fn, {
      method:  "POST",
      headers: {
        "apikey":        SUPABASE_ANON_KEY,
        "Authorization": "Bearer " + SUPABASE_ANON_KEY,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => res.status);
      throw new Error("RPC " + fn + " failed: " + text);
    }
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  }

  // ── Init ──────────────────────────────────────────────────
  async function init() {
    if (!SUPABASE_URL.includes("supabase.co")) {
      console.info("SupabaseDB: not configured — add your URL and anon key to supabase.js");
      return;
    }

    try {
      _fingerprint();
      await Promise.all([_loadLikeCounts(), _loadMyLikes(), _loadGlobalPlays()]);
      initialized = true;
      console.info("SupabaseDB: ready");
      // Full render once on init so global play counts and like state show
      if (typeof Catalog !== "undefined") { Catalog.renderGrid(); Catalog.syncLoveButtons(); }
    } catch(e) {
      console.warn("SupabaseDB: init failed —", e.message);
    }
  }

  async function _loadLikeCounts() {
    const rows = await _api("song_loves?select=song_id");
    likeCounts = {};
    if (rows) rows.forEach(r => { likeCounts[r.song_id] = (likeCounts[r.song_id] || 0) + 1; });
  }

  async function _loadMyLikes() {
    const fp   = _fingerprint();
    const rows = await _api("song_loves?fingerprint=eq." + fp + "&select=song_id");
    myLikes    = new Set(rows ? rows.map(r => r.song_id) : []);
  }

  async function _loadGlobalPlays() {
    const rows = await _api("song_plays?select=song_id,play_count");
    globalPlays = {};
    if (rows) rows.forEach(r => { globalPlays[r.song_id] = r.play_count; });
  }

  // ── Track a play (global — all visitors) ──────────────────
  async function trackPlay(songId) {
    if (!initialized) return;
    try {
      await _rpc("increment_play_count", { p_song_id: songId });
      // Update local cache so count shows immediately without reload
      globalPlays[songId] = (globalPlays[songId] || 0) + 1;
      // Don't re-render grid on every play — too disruptive
    } catch(e) {
      console.warn("SupabaseDB: trackPlay failed —", e.message);
    }
  }

  // ── Toggle like on a song ─────────────────────────────────
  async function toggleLike(songId) {
    if (!initialized) {
      Toast.show("Connect Supabase to save likes");
      return;
    }

    const wasLiked = myLikes.has(songId);

    // Optimistic update — update local state immediately
    if (wasLiked) {
      myLikes.delete(songId);
      likeCounts[songId] = Math.max(0, (likeCounts[songId] || 1) - 1);
    } else {
      myLikes.add(songId);
      likeCounts[songId] = (likeCounts[songId] || 0) + 1;
    }

    // Full re-render so heart icon and count update immediately
    if (typeof Catalog !== "undefined") Catalog.syncLoveButtons();

    try {
      if (wasLiked) {
        await _api(
          "song_loves?song_id=eq." + encodeURIComponent(songId) +
          "&fingerprint=eq." + _fingerprint(),
          { method: "DELETE" }
        );
        Toast.show("Removed from likes");
      } else {
        await _api("song_loves", {
          method: "POST",
          prefer: "resolution=ignore-duplicates,return=minimal",
          body:   JSON.stringify({ song_id: songId, fingerprint: _fingerprint() }),
        });
        Toast.show("♥ Liked!");
      }
      // Re-render again after confirmed server response
      if (typeof Catalog !== "undefined") Catalog.syncLoveButtons();
    } catch(e) {
      // Revert optimistic update on failure
      if (wasLiked) { myLikes.add(songId); likeCounts[songId] = (likeCounts[songId] || 0) + 1; }
      else          { myLikes.delete(songId); likeCounts[songId] = Math.max(0, (likeCounts[songId] || 1) - 1); }
      if (typeof Catalog !== "undefined") Catalog.syncLoveButtons();
      console.warn("SupabaseDB: toggleLike failed —", e.message);
      Toast.show("Could not save — try again");
    }
  }

  // ── Getters ───────────────────────────────────────────────
  function isLiked(songId)          { return myLikes.has(songId); }
  function getLikeCount(songId)     { return likeCounts[songId]  || 0; }
  function getGlobalPlays(songId)   { return globalPlays[songId] || 0; }
  function isReady()                { return initialized; }

  return { init, trackPlay, toggleLike, isLiked, getLikeCount, getGlobalPlays, isReady };
})();
