/**
 * audio.js — Audio engine
 *
 * Owns the single HTMLAudioElement and all playback logic:
 * play, pause, seek, volume, queue management, shuffle, repeat.
 *
 * Emits no DOM updates itself — calls into PlayerUI and Catalog
 * (defined later) to sync the interface.
 */

const AudioEngine = (() => {

  const audio = new Audio();
  audio.preload = "metadata";

  // ── Playback ───────────────────────────────────────────

  /** Load and play a song by ID */
  function playSong(id) {
    const song = getSong(id);
    if (!song) return;

    AppState.currentId = id;
    audio.src = song.src;
    audio.volume = AppState.muted ? 0 : AppState.volume;
    audio.play().catch(() => {
      // Autoplay may be blocked by browser before user interaction
    });
    AppState.isPlaying = true;

    // Update play counts and recently played in storage
    const counts = Storage.getCounts();
    counts[id] = (counts[id] || 0) + 1;
    Storage.saveCounts(counts);

    const recent = Storage.getRecent();
    Storage.saveRecent([id, ...recent.filter(x => x !== id)].slice(0, Config.recentMax));

    rebuildQueue();
    PlayerUI.sync();
    Catalog.syncGrid();
    Catalog.renderSidebarList();
  }

  /** Toggle play/pause for the currently loaded song */
  function togglePlay() {
    if (!AppState.currentId) {
      if (SONGS.length) playSong(SONGS[0].id);
      return;
    }
    if (AppState.isPlaying) {
      audio.pause();
      AppState.isPlaying = false;
    } else {
      audio.play().catch(() => {});
      AppState.isPlaying = true;
    }
    PlayerUI.syncPlayPauseButton();
    Catalog.syncGrid();
    Catalog.renderSidebarList();
  }

  /** Skip to the next song in the queue */
  function nextSong() {
    if (!AppState.queue.length) return;
    if (AppState.repeat === "one") {
      audio.currentTime = 0;
      audio.play();
      return;
    }
    AppState.queueIdx = (AppState.queueIdx + 1) % AppState.queue.length;
    playSong(AppState.queue[AppState.queueIdx]);
  }

  /** Go to the previous song, or restart if >3 seconds in */
  function prevSong() {
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    if (!AppState.queue.length) return;
    AppState.queueIdx = (AppState.queueIdx - 1 + AppState.queue.length) % AppState.queue.length;
    playSong(AppState.queue[AppState.queueIdx]);
  }

  // ── Queue ──────────────────────────────────────────────

  /**
   * Rebuild the playback queue from the current filtered view.
   * If shuffle is on, the queue is randomised.
   */
  function rebuildQueue() {
    let ids = Catalog.getFiltered().map(s => s.id);
    if (AppState.shuffle) {
      // Fisher-Yates shuffle
      for (let i = ids.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ids[i], ids[j]] = [ids[j], ids[i]];
      }
    }
    AppState.queue = ids;
    AppState.queueIdx = ids.indexOf(AppState.currentId);
    if (AppState.queueIdx < 0) AppState.queueIdx = 0;
  }

  // ── Modes ──────────────────────────────────────────────

  function toggleShuffle() {
    AppState.shuffle = !AppState.shuffle;
    document.getElementById("btn-shuffle").classList.toggle("active", AppState.shuffle);
    rebuildQueue();
    Toast.show(AppState.shuffle ? "Shuffle on" : "Shuffle off");
  }

  function cycleRepeat() {
    const modes = ["none", "all", "one"];
    AppState.repeat = modes[(modes.indexOf(AppState.repeat) + 1) % modes.length];
    const btn = document.getElementById("btn-repeat");
    btn.classList.toggle("active", AppState.repeat !== "none");
    const labels = { none: "Repeat: Off (R)", all: "Repeat: All (R)", one: "Repeat: One (R)" };
    btn.title = labels[AppState.repeat];
    const msgs   = { none: "Repeat off", all: "Repeat: all songs", one: "Repeat: one song" };
    Toast.show(msgs[AppState.repeat]);
  }

  // ── Volume ─────────────────────────────────────────────

  function setVolume(v) {
    AppState.volume = parseFloat(v);
    audio.volume = AppState.volume;
    if (AppState.volume > 0) {
      AppState.muted = false;
      PlayerUI.syncVolumeIcons();
    }
  }

  function toggleMute() {
    AppState.muted = !AppState.muted;
    audio.volume = AppState.muted ? 0 : AppState.volume;
    PlayerUI.syncVolumeIcons();
  }

  function nudgeVolume(delta) {
    const v = Math.min(1, Math.max(0, AppState.volume + delta));
    document.getElementById("vol-slider").value = v;
    setVolume(v);
  }

  // ── Seeking ────────────────────────────────────────────

  function seekTo(event) {
    if (!audio.duration) return;
    const rect = document.getElementById("progress").getBoundingClientRect();
    audio.currentTime = ((event.clientX - rect.left) / rect.width) * audio.duration;
  }

  // ── Audio element event listeners ─────────────────────

  audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    document.getElementById("prog-fill").style.width = pct + "%";
    document.getElementById("t-cur").textContent = formatTime(audio.currentTime);
  });

  audio.addEventListener("loadedmetadata", () => {
    document.getElementById("t-tot").textContent = formatTime(audio.duration);
  });

  audio.addEventListener("ended", () => {
    if (AppState.repeat === "one") {
      audio.currentTime = 0;
      audio.play();
    } else if (AppState.repeat === "all" || AppState.queueIdx < AppState.queue.length - 1) {
      nextSong();
    } else {
      AppState.isPlaying = false;
      PlayerUI.syncPlayPauseButton();
    }
  });

  // ── Public API ─────────────────────────────────────────

  return {
    playSong,
    togglePlay,
    nextSong,
    prevSong,
    rebuildQueue,
    toggleShuffle,
    cycleRepeat,
    setVolume,
    toggleMute,
    nudgeVolume,
    seekTo,
  };
})();
