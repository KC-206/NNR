/**
 * keyboard.js — Keyboard shortcut handling
 *
 * Shortcuts are disabled when focus is inside a text input
 * so you can still type in search/password fields.
 *
 * Shortcut map:
 *   Space     — Play / Pause
 *   ←         — Previous song (or restart if >3s in)
 *   →         — Next song
 *   ↑         — Volume up 5%
 *   ↓         — Volume down 5%
 *   S         — Toggle shuffle
 *   R         — Cycle repeat mode
 *   M         — Toggle mute
 */

const Keyboard = (() => {

  const IGNORED_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

  function _isTyping() {
    return IGNORED_TAGS.has(document.activeElement.tagName);
  }

  function bindEvents() {
    document.addEventListener("keydown", e => {
      if (_isTyping()) return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          AudioEngine.togglePlay();
          break;
        case "ArrowRight":
          AudioEngine.nextSong();
          break;
        case "ArrowLeft":
          AudioEngine.prevSong();
          break;
        case "ArrowUp":
          e.preventDefault();
          AudioEngine.nudgeVolume(0.05);
          document.getElementById("vol-slider").value = AppState.volume;
          break;
        case "ArrowDown":
          e.preventDefault();
          AudioEngine.nudgeVolume(-0.05);
          document.getElementById("vol-slider").value = AppState.volume;
          break;
        case "s":
        case "S":
          AudioEngine.toggleShuffle();
          break;
        case "r":
        case "R":
          AudioEngine.cycleRepeat();
          break;
        case "m":
        case "M":
          AudioEngine.toggleMute();
          break;
      }
    });
  }

  return { bindEvents };
})();
