// ============================================================
//  Main — Game loop, state machine, init, level loading
// ============================================================

const GameState = (() => {

  const state = {
    screen:     'intro',
    levelIndex: 0,
    running:    false,
    lastTime:   0,
    killCount:  0,
    frameCount: 0,
    exitWarned: false,
  };

  function _loadLevel(index) {
    const levelData = Maps.load(index);
    Player.state.x      = levelData.playerStart.x;
    Player.state.y      = levelData.playerStart.y;
    Player.state.angle  = levelData.playerStart.angle;
    Player.state.hasKey = false;
    state.exitWarned    = false;
    Enemies.spawnForLevel(levelData);
    Pickups.spawnForLevel(levelData);
    Projectiles.reset();
    HUD.resetMinimap();
    return levelData;
  }

  function startGame() {
    state.levelIndex        = 0;
    state.killCount         = 0;
    Player.state.hp         = C.PLAYER_START_HP;
    Player.state.armor      = C.PLAYER_START_ARMOR;
    Player.state.baguettes  = C.BAGUETTE_START_AMMO;
    Player.state.gojiraCharge = 0;
    Player.state.score      = 0;

    const levelData = _loadLevel(0);
    state.screen = 'transition';

    Screens.showTransition(0, levelData, () => {
      Audio2.playMusic(0);
      state.screen   = 'game';
      state.running  = true;
      state.lastTime = performance.now();
      requestAnimationFrame(loop);
    });
  }

  function nextLevel() {
    state.running = false;
    state.levelIndex++;
    if (state.levelIndex >= Maps.getLevelCount()) {
      setWin();
      return;
    }

    const levelData = _loadLevel(state.levelIndex);

    Screens.dissolveToTransition(state.levelIndex, levelData, () => {
      Audio2.playMusic(state.levelIndex);
      state.screen   = 'game';
      state.running  = true;
      state.lastTime = performance.now();
      requestAnimationFrame(loop);
    });
  }

  function setGameOver() {
    if (state.screen === 'gameover') return;
    state.running = false;
    state.screen  = 'gameover';
    Audio2.stopMusic();
    Audio2.playGameOver();
    setTimeout(() => Screens.showGameOver(Player.state.score, state.killCount), 600);
  }

  function setWin() {
    if (state.screen === 'win') return;
    state.running = false;
    state.screen  = 'win';
    Audio2.stopMusic();
    setTimeout(() => Screens.showWin(Player.state.score, state.killCount), 400);
  }

  function restartGame() {
    state.running = false;
    state.screen  = 'intro';
    Screens.initIntro();
  }

  function addKill() { state.killCount++; }

  function loop(timestamp) {
    if (!state.running) return;
    const dt = Math.min((timestamp - state.lastTime) / 1000, 0.05);
    state.lastTime = timestamp;
    state.frameCount++;

    Player.update(dt);
    Enemies.update(dt);
    Projectiles.update(dt, Enemies.getAll());
    Pickups.update(dt);

    const doors  = Maps.getDoors();
    const onExit = doors.isExit(
      Math.floor(Player.state.x),
      Math.floor(Player.state.y)
    );

    if (onExit) {
      if (Player.state.hasKey) {
        nextLevel();
        return;
      } else if (!state.exitWarned) {
        state.exitWarned = true;
        HUD.showPlayerQuip("I need the key before I can leave.");
      }
    } else {
      state.exitWarned = false;
    }

    Renderer.render(Player.state, Maps.getLevel());
    HUD.draw(Player.state, state.levelIndex, Enemies.getAll());
    requestAnimationFrame(loop);
  }

  return {
    get currentScreen()     { return state.screen; },
    get currentLevelIndex() { return state.levelIndex; },
    startGame,
    nextLevel,
    setGameOver,
    setWin,
    restartGame,
    addKill,
  };
})();

// ── Boot ────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  Renderer.init(document.getElementById('canvas-game'));
  HUD.init(document.getElementById('canvas-hud'));
  Player.initInput(document.getElementById('canvas-game'));
  Screens.initIntro();
});
