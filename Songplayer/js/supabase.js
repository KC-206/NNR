/**
 * supabase.js — Global play tracking and loved songs via Supabase
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
  let myLoves     = new Set();  // song IDs loved by this browser fingerprint
  let loveCounts  = {};         // { songId: totalLoveCount }
  let globalPlays = {};         // { songId: globalPlayCount }
  let fingerprint = null;
  let initialized  = false;

  // ── Browser fingerprint — prevents one person spamming loves ──
  // Not cryptographically secure but a good enough friction barrier
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
    };
    if (options.prefer) headers["Prefer"] = options.prefer;

    const res = await fetch(SUPABASE_URL + "/rest/v1/" + path, {
      method:  options.method  || "GET",
      headers,
      body:    options.body    || undefined,
    });

    if (res.status === 204 || res.status === 201) {
      const text = await res.text();
      if (!text || text === "" || text === "null") return null;
      try { return JSON.parse(text); } catch { return null; }
    }
    if (!res.ok) throw new Error("Supabase " + res.status + ": " + await res.text());
    const text = await res.text();
    if (!text || text === "") return null;
    try { return JSON.parse(text); } catch { return null; }
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
    if (!res.ok) throw new Error("RPC " + fn + " failed: " + await res.text());
    return res.json().catch(() => null);
  }

  // ── Init ──────────────────────────────────────────────────
  async function init() {
    if (!SUPABASE_URL.includes("supabase.co")) {
      console.info("SupabaseDB: not configured — add your URL and anon key to supabase.js");
      return;
    }

    try {
      _fingerprint();
      await Promise.all([_loadLoveCounts(), _loadMyLoves(), _loadPlayCounts()]);
      initialized = true;
      console.info("SupabaseDB: ready —", Object.keys(loveCounts).length, "songs with loves");
      // Re-render cards now we have love state
      if (typeof Catalog !== "undefined") Catalog.renderGrid();
    } catch(e) {
      console.warn("SupabaseDB: init failed —", e.message);
    }
  }

  async function _loadLoveCounts() {
    const rows = await _api("song_loves?select=song_id");
    loveCounts = {};
    if (rows) rows.forEach(r => { loveCounts[r.song_id] = (loveCounts[r.song_id] || 0) + 1; });
  }

  async function _loadPlayCounts() {
    const rows = await _api("song_plays?select=song_id,play_count");
    if (rows) rows.forEach(r => { globalPlays[r.song_id] = r.play_count || 0; });
  }

  async function _loadMyLoves() {
    const fp   = _fingerprint();
    const rows = await _api("song_loves?fingerprint=eq." + fp + "&select=song_id");
    myLoves    = new Set(rows.map(r => r.song_id));
  }

  // ── Track a play (global — all visitors) ──────────────────
  async function trackPlay(songId) {
    if (!initialized) return;
    try {
      await _rpc("increment_play_count", { p_song_id: songId });
    } catch(e) {
      console.warn("SupabaseDB: trackPlay failed —", e.message);
    }
  }

  // ── Toggle love on a song ─────────────────────────────────
  async function toggleLove(songId) {
    if (!initialized) {
      Toast.show("Connect Supabase to save loves");
      return;
    }

    const wasLoved = myLoves.has(songId);

    // Optimistic update — update UI immediately
    if (wasLoved) {
      myLoves.delete(songId);
      loveCounts[songId] = Math.max(0, (loveCounts[songId] || 1) - 1);
    } else {
      myLoves.add(songId);
      loveCounts[songId] = (loveCounts[songId] || 0) + 1;
    }
    if (typeof Catalog !== "undefined") Catalog.syncGrid();

    try {
      if (wasLoved) {
        await _api(
          "song_loves?song_id=eq." + encodeURIComponent(songId) +
          "&fingerprint=eq." + _fingerprint(),
          { method: "DELETE" }
        );
        Toast.show("Removed like");
      } else {
        await _api("song_loves", {
          method: "POST",
          prefer: "return=minimal,resolution=ignore-duplicates",
          body:   JSON.stringify({ song_id: songId, fingerprint: _fingerprint() }),
        });
        Toast.show("♥ Liked!");
      }
      // Confirmed — re-render to show accurate state
      if (typeof Catalog !== "undefined") Catalog.syncGrid();
    } catch(e) {
      // Revert on failure
      if (wasLoved) { myLoves.add(songId); loveCounts[songId]++; }
      else          { myLoves.delete(songId); loveCounts[songId] = Math.max(0, loveCounts[songId] - 1); }
      if (typeof Catalog !== "undefined") Catalog.syncGrid();
      console.warn("SupabaseDB: toggleLove failed —", e.message);
      Toast.show("Could not save love — try again");
    }
  }

  // ── Getters ───────────────────────────────────────────────
  function isLoved(songId)         { return myLoves.has(songId); }
  function getLoveCount(songId)    { return loveCounts[songId] || 0; }
  function getGlobalPlayCount(songId) { return globalPlays[songId] || 0; }
  function isReady()               { return initialized; }

  return { init, trackPlay, toggleLove, isLoved, getLoveCount, getGlobalPlayCount, isReady };
})();
