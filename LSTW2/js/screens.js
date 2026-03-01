// ============================================================
//  Screens — Intro crawl, title, transition, gameover, win
// ============================================================

const Screens = (() => {

  // ── Show a screen by name ─────────────────────────────
  function show(name) {
    document.querySelectorAll('.screen').forEach(s => {
      s.classList.remove('active');
      s.style.display = 'none';
    });
    const el = document.getElementById('screen-' + name);
    if (!el) return;
    el.classList.add('active');
    const flexScreens = ['title','transition','gameover','win'];
    el.style.display = flexScreens.includes(name) ? 'flex' : 'block';
  }

  // ── 1. INTRO — scrolling crawl ────────────────────────
  let introRunning = false;
  let introSkipped = false;

  function initIntro() {
    introSkipped = false;
    show('intro');

    if (!introRunning) {
      introRunning = true;
      _runIntroCanvas();
    }

    function skipHandler(e) {
      if (introSkipped) return;
      introSkipped  = true;
      introRunning  = false;
      document.removeEventListener('keydown', skipHandler);
      document.removeEventListener('click',   skipHandler);
      showTitle();
    }

    setTimeout(() => {
      document.addEventListener('keydown', skipHandler);
      document.addEventListener('click',   skipHandler);
    }, 600);

    setTimeout(() => {
      if (!introSkipped) {
        introSkipped = true;
        introRunning = false;
        document.removeEventListener('keydown', skipHandler);
        document.removeEventListener('click',   skipHandler);
        showTitle();
      }
    }, 23000);
  }

 function _runIntroCanvas() {
  const canvas = document.getElementById('canvas-intro');
  const ctx    = canvas.getContext('2d');
  let frame    = 0;

  function tick() {
    if (!introRunning) return;

    // 1) Brighter dusk gradient instead of near‑black
    const g = ctx.createLinearGradient(0, 0, 0, 600);
    g.addColorStop(0.0, '#302440');  // top sky (not black)
    g.addColorStop(0.4, '#3b2c4c');  // mid sky
    g.addColorStop(1.0, '#5b3f30');  // warm desert glow
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 800, 600);

    // 2) Softer, fewer stars
    for (let i = 0; i < 80; i++) {
      const x = (i * 137.5 + frame * 0.2) % 800;
      const y = (i * 73.1) % 300; // upper half of sky
      const bright = 0.4 + Math.sin(i + frame * 0.04) * 0.2;
      ctx.fillStyle = 'rgba(240,232,208,' + bright + ')';
      ctx.fillRect(x | 0, y | 0, 1, 1);
    }

    // 3) Ground silhouette (same shapes, slightly lighter colors)
    ctx.fillStyle = '#3a2116';
    ctx.beginPath(); ctx.moveTo(0, 600);
    for (let x = 0; x <= 800; x += 20) {
      const y = 430 + Math.sin(x * 0.015 + frame * 0.01) * 25
                      + Math.sin(x * 0.008 + frame * 0.007) * 18;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(800, 600); ctx.closePath(); ctx.fill();

    ctx.fillStyle = '#2b170f';
    [80, 200, 380, 560, 700].forEach(cx => {
      const cy = 400 + Math.sin(cx * 0.05) * 15;
      ctx.fillRect(cx - 5,  cy - 60, 10, 60);
      ctx.fillRect(cx - 20, cy - 40, 15,  8);
      ctx.fillRect(cx + 5,  cy - 30, 15,  8);
      ctx.fillRect(cx - 5,  cy - 80, 10, 25);
    });

    // 4) Moon, slightly softer
    ctx.fillStyle = '#f4e8d0';
    ctx.beginPath(); ctx.arc(680, 80, 35, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3b2c4c';
    ctx.beginPath(); ctx.arc(668, 75, 32, 0, Math.PI * 2); ctx.fill();

    frame++;
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

  // ── 2. TITLE ──────────────────────────────────────────
  let titleCanvasRunning = false;

  function showTitle() {
    show('title');
    if (!titleCanvasRunning) {
      titleCanvasRunning = true;
      _runTitleCanvas();
    }
    document.getElementById('btn-start').onclick = () => {
      Audio2.resume();
      GameState.startGame();
    };
  }

  function _runTitleCanvas() {
    const canvas = document.getElementById('canvas-title');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let frame = 0;
    function tick() {
      ctx.fillStyle = '#050200';
      ctx.fillRect(0,0,800,600);
      for (let i = 0; i < 120; i++) {
        const x = (i*137.5 + frame*0.1)%800;
        const y = (i*73.1 + frame*0.05)%600;
        const a = 0.2 + Math.sin(i+frame*0.02)*0.2;
        ctx.fillStyle = 'rgba(240,200,100,'+a+')';
        ctx.fillRect(x|0, y|0, 1, 1);
      }
      ctx.fillStyle = '#120900';
      ctx.beginPath(); ctx.moveTo(0,600);
      for (let x=0;x<=800;x+=30) {
        ctx.lineTo(x, 500+Math.sin(x*0.01+frame*0.004)*30);
      }
      ctx.lineTo(800,600); ctx.closePath(); ctx.fill();
      frame++;
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ── 3. TRANSITION ─────────────────────────────────────
  function showTransition(levelIndex, levelData, onContinue) {
    const screen = document.getElementById('screen-transition');

    // Hide all transition background images
    const bg1 = document.getElementById('transition-bg-1');
    const bg2 = document.getElementById('transition-bg-2');
    const bg3 = document.getElementById('transition-bg-3');
    if (bg1) bg1.style.display = 'none';
    if (bg2) bg2.style.display = 'none';
    if (bg3) bg3.style.display = 'none';

    // Show the one for this level (0 → l1, 1 → l2, 2 → l3)
    if (levelIndex === 0 && bg1) bg1.style.display = 'block';
    if (levelIndex === 1 && bg2) bg2.style.display = 'block';
    if (levelIndex === 2 && bg3) bg3.style.display = 'block';

    document.getElementById('transition-level-num').textContent  = 'LEVEL ' + (levelIndex + 1);
    document.getElementById('transition-level-name').textContent = levelData.name;
    document.getElementById('transition-blurb').textContent      = levelData.blurb;

    show('transition');

    if (document.pointerLockElement) document.exitPointerLock();

    function proceed() {
      document.removeEventListener('keydown', keyHandler);
      document.getElementById('btn-continue').onclick = null;
      show('game');
      onContinue();
    }

    function keyHandler(e) {
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE') {
        proceed();
      }
    }

    document.addEventListener('keydown', keyHandler);
    document.getElementById('btn-continue').onclick = proceed;
  }

 // ── 4. GAME OVER ──────────────────────────────────────
let gameoverRunning = false;
function showGameOver(score, kills) {
  show('gameover');
  gameoverRunning = true;
  if (document.pointerLockElement) document.exitPointerLock();

  const g1 = document.getElementById('gameover-bg-1');
  const g2 = document.getElementById('gameover-bg-2');
  const g3 = document.getElementById('gameover-bg-3');
  if (g1) g1.style.display = 'none';
  if (g2) g2.style.display = 'none';
  if (g3) g3.style.display = 'none';

  // Use the current levelIndex directly (0,1,2)
  const idx = GameState.currentLevelIndex;   // no "|| 0" here

  if (idx === 0 && g1)      g1.style.display = 'block';   // died in level 1
  else if (idx === 1 && g2) g2.style.display = 'block';   // died in level 2
  else if (g3)              g3.style.display = 'block';   // died in level 3 or anything else

  document.getElementById('gameover-stats').textContent =
    'SCORE: ' + score + '  |  ENEMIES SLAIN: ' + kills;

  const canvas = document.getElementById('canvas-gameover');
  const ctx    = canvas.getContext('2d');

  (function drawNoise() {
    if (!gameoverRunning) return;
    ctx.fillStyle = 'rgba(8,0,0,0.6)';   // semi‑transparent so BG shows through
    ctx.fillRect(0,0,800,600);
    const img = ctx.createImageData(800,600);
    const d = img.data;
    for (let i=0;i<d.length;i+=4) {
      const v = Math.random()<0.04 ? Math.random()*60 : 0;
      d[i]=v*1.5; d[i+1]=v*0.3; d[i+2]=v*0.3; d[i+3]=80;
    }
    ctx.putImageData(img,0,0);
    if (Math.random()<0.08) {
      ctx.fillStyle='rgba(255,50,50,0.12)';
      ctx.fillRect(0,Math.random()*600,800,2+Math.random()*5);
    }
    requestAnimationFrame(drawNoise);
  })();

  document.getElementById('btn-restart').onclick = () => {
    gameoverRunning = false;
    GameState.restartGame();
  };
}


  // ── 5. WIN ────────────────────────────────────────────
 let winRunning = false;
function showWin(score, kills) {
  show('win');
  winRunning = true;
  if (document.pointerLockElement) document.exitPointerLock();

  document.getElementById('win-stats').textContent =
    'SCORE: ' + score + '  |  ENEMIES ELIMINATED: ' + kills;

  Audio2.playWinFanfare();

  const canvas = document.getElementById('canvas-confetti');
  const ctx    = canvas.getContext('2d');
  const colors = ['#f0d080','#ff8040','#40ff80','#4080ff','#ff40c0','#ffe040'];
  const pieces = Array.from({length: C.CONFETTI_COUNT}, () => ({
    x:Math.random()*800, y:Math.random()*-200,
    vx:(Math.random()-0.5)*2, vy:1.5+Math.random()*2,
    rot:Math.random()*Math.PI*2, rotV:(Math.random()-0.5)*0.2,
    w:6+Math.random()*10, h:4+Math.random()*6,
    color:colors[Math.floor(Math.random()*colors.length)],
  }));

  (function drawConfetti() {
    if (!winRunning) return;
    ctx.clearRect(0,0,800,600);
    for (const p of pieces) {
      p.x += p.vx; p.y += p.vy; p.rot += p.rotV;
      if (p.y > 650) { p.y = -20; p.x = Math.random()*800; }
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot);
      ctx.fillStyle = p.color; ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);
      ctx.restore();
    }
    requestAnimationFrame(drawConfetti);
  })();

  document.getElementById('btn-play-again').onclick = () => {
    winRunning = false;
    GameState.restartGame();
  };
}


  // ── Flash overlay ─────────────────────────────────────
  let flashTimer = null;
  function showDamageFlash(color) {
    const el = document.getElementById('flash-overlay');
    el.style.background = color;
    el.style.opacity    = '1';
    clearTimeout(flashTimer);
    flashTimer = setTimeout(() => { el.style.opacity = '0'; }, 80);
  }

  // ── Level dissolve (rows) before transition screen ───
  function dissolveToTransition(levelIndex, levelData, onContinue) {
    const gameCanvas = document.getElementById('canvas-game');
    const hudCanvas  = document.getElementById('canvas-hud');
    const overlay    = document.getElementById('canvas-transition-overlay');
    if (!gameCanvas || !overlay) {
      showTransition(levelIndex, levelData, onContinue);
      return;
    }

    const octx = overlay.getContext('2d');
    const W = overlay.width;
    const H = overlay.height;

    // Copy current game + HUD into overlay
    octx.clearRect(0, 0, W, H);
    octx.drawImage(gameCanvas, 0, 0, W, H);
    if (hudCanvas) octx.drawImage(hudCanvas, 0, 0, W, H);

    overlay.style.pointerEvents = 'none';
    overlay.style.opacity = '1';
    overlay.style.display = 'block';

    const rowHeight = 6;
    const numRows   = Math.ceil(H / rowHeight);
    const duration  = 700;
    const start     = performance.now();

    const filled = new Array(numRows).fill(false);

    function step(now) {
      const t = Math.min(1, (now - start) / duration);

      octx.save();
      octx.globalCompositeOperation = 'source-over';

      // Phase 1: top and bottom move towards the middle
      const half      = (numRows / 2) | 0;
      const phase1End = 0.6;
      const progress  = Math.min(1, t / phase1End);
      const maxOffset = half;
      const offset    = Math.floor(progress * maxOffset);

      for (let i = 0; i < offset; i++) {
        const topIndex = i;
        if (topIndex >= 0 && topIndex < numRows && !filled[topIndex]) {
          const y     = topIndex * rowHeight;
          const alpha = 0.8 + 0.2 * (i / maxOffset);
          octx.fillStyle = 'rgba(0, 0, 0,' + alpha + ')';
          octx.fillRect(0, y, W, rowHeight);
          filled[topIndex] = true;
        }

        const bottomIndex = numRows - 1 - i;
        if (bottomIndex >= 0 && bottomIndex < numRows && !filled[bottomIndex]) {
          const y     = bottomIndex * rowHeight;
          const alpha = 0.8 + 0.2 * (i / maxOffset);
          octx.fillStyle = 'rgba(0, 0, 0,' + alpha + ')';
          octx.fillRect(0, y, W, rowHeight);
          filled[bottomIndex] = true;
        }
      }

      // Phase 2: fill any remaining gaps toward their nearest side
      if (t >= phase1End) {
        const p2 = (t - phase1End) / (1 - phase1End);
        for (let r = 0; r < numRows; r++) {
          if (!filled[r]) {
            const distTop    = r;
            const distBottom = numRows - 1 - r;
            const distMin    = Math.min(distTop, distBottom);
            const maxDist    = half;

            if (distMin <= p2 * maxDist) {
              const y     = r * rowHeight;
              const alpha = 0.7 + 0.3 * (1 - distMin / maxDist);
              octx.fillStyle = 'rgba(0, 0, 0,' + alpha + ')';
              octx.fillRect(0, y, W, rowHeight);
              filled[r] = true;
            }
          }
        }
      }

      octx.restore();

      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        overlay.style.opacity  = '0';
        overlay.style.display  = 'none';
        showTransition(levelIndex, levelData, onContinue);
      }
    }

    requestAnimationFrame(step);
  }

  return {
    show,
    initIntro,
    showTitle,
    showTransition,
    dissolveToTransition,
    showGameOver,
    showWin,
    showDamageFlash
  };
})();
