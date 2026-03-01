// ============================================================
//  HUD — Bottom bar, boss bar, minimap, quip bubbles, dmg nums
// ============================================================

const HUD = (() => {

  let hudCanvas, hudCtx;
  let minimapVisible = true;
  let minimapExplored = new Set();

  // ── Talking animation ─────────────────────────────────
  let mouthTalking  = false;
  let mouthOpenness = 0;
  let _talkFrameId  = null;
  const WAH_DUR     = 0.12;

  function startTalking(numWahs) {
    mouthTalking  = true;
    mouthOpenness = 0;
    const totalMs = numWahs * WAH_DUR * 1000;
    const startT  = performance.now();
    function animateMouth() {
      const elapsed = performance.now() - startT;
      const t = (elapsed % (WAH_DUR * 1000)) / (WAH_DUR * 1000);
      mouthOpenness = Math.sin(t * Math.PI);
      if (elapsed < totalMs) {
        _talkFrameId = requestAnimationFrame(animateMouth);
      } else {
        mouthTalking  = false;
        mouthOpenness = 0;
        _talkFrameId  = null;
      }
    }
    cancelAnimationFrame(_talkFrameId);
    _talkFrameId = requestAnimationFrame(animateMouth);
  }

  // ── Face portrait ─────────────────────────────────────
  const faceCanvas = document.createElement('canvas');
  faceCanvas.width = 100; faceCanvas.height = 100;
  const faceCtx = faceCanvas.getContext('2d');

   function drawFace(hp, gojiraCharge) {
    const c = faceCtx;
    const w = 100, h = 100;
    const hpPct  = hp / C.PLAYER_MAX_HP;
    const gReady = gojiraCharge >= 100;

    const inGojira =
      typeof Player !== 'undefined' &&
      Player.state &&
      Player.state.gojiraMode;

    c.clearRect(0,0,w,h);
    c.fillStyle = '#1a0800'; c.fillRect(0,0,w,h);
    c.strokeStyle = '#ff6600'; c.lineWidth = 2; c.strokeRect(0,0,w,h);

if (inGojira) {
  // ── GOJIRA PORTRAIT (friendlier pixel art) ──────────────

  // === DORSAL SPIKES ===
  c.fillStyle = '#2a4a2e';
  c.beginPath(); c.moveTo(50,6); c.lineTo(44,22); c.lineTo(56,22); c.closePath(); c.fill();
  c.fillStyle = '#243e28';
  [[37,10],[63,10]].forEach(([x,y]) => {
    c.beginPath(); c.moveTo(x,y); c.lineTo(x-4,22); c.lineTo(x+4,22); c.closePath(); c.fill();
  });
  c.fillStyle = '#1e3422';
  [[24,16],[76,16]].forEach(([x,y]) => {
    c.beginPath(); c.moveTo(x,y); c.lineTo(x-3,24); c.lineTo(x+3,24); c.closePath(); c.fill();
  });


  // === HEAD BASE — rounder, softer ===
  c.fillStyle = '#2e4e32';
  // Main head as a rounder rect
  c.beginPath();
  c.roundRect(14, 22, 72, 64, 12);
  c.fill();

  // Subtle scale shading — two tone, not too harsh
  c.fillStyle = '#263e2a';
  c.beginPath(); c.roundRect(16, 24, 32, 28, 8); c.fill(); // left cheek
  c.beginPath(); c.roundRect(52, 24, 32, 28, 8); c.fill(); // right cheek
  c.fillStyle = '#324c36';
  c.beginPath(); c.roundRect(34, 22, 32, 18, 6); c.fill(); // forehead highlight
 
// === PINK BOW 🎀 (drawn after head so it covers spikes) ===
  const bowX = 50, bowY = 20;

  // Bow left loop
  c.fillStyle = '#ff6eb4';
  c.beginPath();
  c.moveTo(bowX, bowY + 2);
  c.lineTo(bowX - 20, bowY - 10);
  c.lineTo(bowX - 22, bowY + 6);
  c.lineTo(bowX - 5, bowY + 8);
  c.closePath();
  c.fill();

  // Bow right loop
  c.beginPath();
  c.moveTo(bowX, bowY + 2);
  c.lineTo(bowX + 20, bowY - 10);
  c.lineTo(bowX + 22, bowY + 6);
  c.lineTo(bowX + 5, bowY + 8);
  c.closePath();
  c.fill();

  // Bow shading (darker pink on loops)
  c.fillStyle = '#c73d80';
  c.beginPath();
  c.moveTo(bowX - 3, bowY + 4);
  c.lineTo(bowX - 20, bowY - 2);
  c.lineTo(bowX - 20, bowY + 6);
  c.lineTo(bowX - 5, bowY + 8);
  c.closePath();
  c.fill();
  c.beginPath();
  c.moveTo(bowX + 3, bowY + 4);
  c.lineTo(bowX + 20, bowY - 2);
  c.lineTo(bowX + 20, bowY + 6);
  c.lineTo(bowX + 5, bowY + 8);
  c.closePath();
  c.fill();

  // Bow highlights
  c.fillStyle = '#ffaad4';
  c.fillRect(bowX - 16, bowY - 4, 7, 5);
  c.fillRect(bowX + 10, bowY - 4, 7, 5);

  // Center knot (covers spike base)
  c.fillStyle = '#ff6eb4';
  c.beginPath(); c.roundRect(bowX - 6, bowY - 4, 12, 12, 3); c.fill();
  c.fillStyle = '#c73d80';
  c.beginPath(); c.roundRect(bowX - 3, bowY - 1, 6, 6, 2); c.fill();
  c.fillStyle = '#ffaad4';
  c.fillRect(bowX - 2, bowY, 3, 3);

  // === BROW RIDGES — softer, slight tilt not extreme ===
  c.fillStyle = '#1a2e1c';
  c.beginPath();
  c.moveTo(18,38); c.lineTo(38,33); c.lineTo(38,38); c.lineTo(18,40);
  c.closePath(); c.fill();
  c.beginPath();
  c.moveTo(82,38); c.lineTo(62,33); c.lineTo(62,38); c.lineTo(82,40);
  c.closePath(); c.fill();

  // === EYE SOCKETS ===
  c.fillStyle = '#0d150e';
  c.beginPath(); c.roundRect(20, 36, 20, 14, 4); c.fill();
  c.beginPath(); c.roundRect(60, 36, 20, 14, 4); c.fill();

  // Eye glow — rich purple, more luminous
  c.fillStyle = '#6a0d99';
  c.beginPath(); c.roundRect(21, 37, 18, 12, 3); c.fill();
  c.beginPath(); c.roundRect(61, 37, 18, 12, 3); c.fill();

  c.fillStyle = '#c060ee';
  c.beginPath(); c.roundRect(22, 38, 14, 9, 3); c.fill();
  c.beginPath(); c.roundRect(62, 38, 14, 9, 3); c.fill();

  // Bright iris center
  c.fillStyle = '#e8a0ff';
  c.beginPath(); c.roundRect(25, 39, 8, 6, 2); c.fill();
  c.beginPath(); c.roundRect(65, 39, 8, 6, 2); c.fill();

  // Pupil — softer oval, not harsh slit
  c.fillStyle = '#1a0028';
  c.beginPath(); c.roundRect(28, 39, 3, 6, 1); c.fill();
  c.beginPath(); c.roundRect(68, 39, 3, 6, 1); c.fill();

  // Catchlight (makes eyes feel alive)
  c.fillStyle = '#ffffff';
  c.fillRect(26, 39, 2, 2);
  c.fillRect(66, 39, 2, 2);

  // === SNOUT — softer, rounder ===
  c.fillStyle = '#2a4a2e';
  c.beginPath(); c.roundRect(34, 50, 32, 18, 8); c.fill();
  // Nostrils
  c.fillStyle = '#0e1e10';
  c.beginPath(); c.roundRect(38, 56, 7, 5, 2); c.fill();
  c.beginPath(); c.roundRect(55, 56, 7, 5, 2); c.fill();
  // Snout highlight
  c.fillStyle = '#3a5e3e';
  c.beginPath(); c.roundRect(40, 51, 20, 6, 3); c.fill();

  // === CHEEK HIGHLIGHTS ===
  c.fillStyle = '#3a5e40';
  c.beginPath(); c.roundRect(18, 48, 14, 10, 4); c.fill();
  c.beginPath(); c.roundRect(68, 48, 14, 10, 4); c.fill();

  // === UPPER JAW — not too deep ===
  c.fillStyle = '#263e2a';
  c.fillRect(18, 68, 64, 8);

  // Upper teeth — fewer, more spaced, not wall-of-horror
  c.fillStyle = '#ece8cc';
  for (let i = 0; i < 7; i++) {
    const tx = 22 + i * 9;
    c.beginPath();
    c.moveTo(tx, 69); c.lineTo(tx+6, 69); c.lineTo(tx+3, 75);
    c.closePath(); c.fill();
  }

  // === ANIMATED JAW ===
  const jawOpen = mouthTalking ? Math.floor(mouthOpenness * 10) : 1;

  // Inner mouth — dark but not pitch black
  c.fillStyle = '#120a18';
  c.fillRect(20, 75, 60, 6 + jawOpen);

  // Subtle inner glow (hint of atomic breath potential)
  c.fillStyle = '#1e0a2a';
  c.fillRect(28, 77, 44, 2 + Math.floor(jawOpen * 0.5));

  // Lower teeth — smaller, tidier
  c.fillStyle = '#ece8cc';
  const lowerY = 80 + jawOpen;
  for (let i = 0; i < 6; i++) {
    const tx = 24 + i * 9;
    c.beginPath();
    c.moveTo(tx, lowerY); c.lineTo(tx+6, lowerY); c.lineTo(tx+3, lowerY-5);
    c.closePath(); c.fill();
  }

  // === LOWER JAW / CHIN — rounded ===
  c.fillStyle = '#2a4a2e';
  c.beginPath(); c.roundRect(18, lowerY, 64, 10, [0,0,6,6]); c.fill();

  // === NECK ===
  c.fillStyle = '#263e2a';
  c.fillRect(30, lowerY + 8, 40, 12);
  // Neck highlight
  c.fillStyle = '#2e4a32';
  c.fillRect(38, lowerY + 10, 24, 8);

  return;
}

    // ── ORIGINAL HUMAN PORTRAIT ─────────────────────────
    c.fillStyle = '#3d1f00';
    c.fillRect(10,14,80,78); c.fillRect(8,20,16,60); c.fillRect(76,20,16,60);
    const skinColor = hpPct > 0.6 ? '#d4956a' : hpPct > 0.3 ? '#b87855' : '#8c5038';
    c.fillStyle = skinColor;
    c.beginPath(); c.ellipse(50,46,26,30,0,0,Math.PI*2); c.fill();
    c.fillStyle = '#3d1f00';
    c.beginPath(); c.ellipse(50,20,28,16,0,0,Math.PI); c.fill();
    c.fillRect(10,16,18,30); c.fillRect(72,16,18,30);
    c.fillStyle = '#5c3000'; c.fillRect(42,10,6,24);
    c.fillStyle = '#2a1000';
    c.beginPath(); c.moveTo(26,32); c.lineTo(40,29); c.lineTo(40,31); c.lineTo(26,34); c.fill();
    c.beginPath(); c.moveTo(60,29); c.lineTo(74,32); c.lineTo(74,34); c.lineTo(60,31); c.fill();
    if (gReady) {
      c.fillStyle = '#fff8cc'; c.fillRect(26,35,16,11); c.fillRect(58,35,16,11);
      c.fillStyle = '#cc8800'; c.fillRect(30,37,8,7);   c.fillRect(62,37,8,7);
      c.fillStyle = '#000';    c.fillRect(32,38,4,5);   c.fillRect(64,38,4,5);
      c.fillStyle = 'rgba(255,220,0,0.25)';
      c.fillRect(22,32,28,18); c.fillRect(54,32,28,18);
    } else if (hpPct > 0.6) {
      c.fillStyle = '#e8ffe8'; c.fillRect(26,35,16,10); c.fillRect(58,35,16,10);
      c.fillStyle = '#2d7a3a'; c.fillRect(29,37,10,6);  c.fillRect(61,37,10,6);
      c.fillStyle = '#000';    c.fillRect(31,38,5,4);   c.fillRect(63,38,5,4);
    } else if (hpPct > 0.3) {
      c.fillStyle = '#e8ffe8'; c.fillRect(26,36,16,7);  c.fillRect(58,36,16,7);
      c.fillStyle = '#2d7a3a'; c.fillRect(29,37,10,5);  c.fillRect(61,37,10,5);
      c.fillStyle = '#000';    c.fillRect(31,38,5,3);   c.fillRect(63,38,5,3);
      c.fillStyle = skinColor; c.fillRect(26,35,16,5);  c.fillRect(58,35,16,5);
    } else {
      c.fillStyle = '#e8ffe8'; c.fillRect(26,37,16,5);  c.fillRect(58,37,16,5);
      c.fillStyle = '#2d7a3a'; c.fillRect(29,38,10,3);  c.fillRect(61,38,10,3);
      c.fillStyle = 'rgba(80,0,80,0.4)';
      c.fillRect(24,33,12,8); c.fillRect(62,36,10,6);
    }
    c.fillStyle = hpPct > 0.6 ? '#c07850' : '#a05a38';
    c.fillRect(47,48,6,8); c.fillRect(44,54,4,3); c.fillRect(52,54,4,3);
    if (hpPct > 0.5) {
      c.fillStyle = 'rgba(220,100,80,0.22)';
      c.beginPath(); c.ellipse(28,52,8,5,0,0,Math.PI*2); c.fill();
      c.beginPath(); c.ellipse(72,52,8,5,0,0,Math.PI*2); c.fill();
    }
    const jawDrop = Math.floor(mouthOpenness * 10);
    const mouthY  = 64, mouthW = 22, mouthX = 50 - mouthW/2;
    if (gReady && !mouthTalking) {
      c.fillStyle = '#cc2200'; c.fillRect(mouthX,mouthY,mouthW,8);
      c.fillStyle = '#fff';
      for (let i=0;i<4;i++) c.fillRect(mouthX+2+i*5,mouthY+1,4,5);
      c.fillStyle = '#ff4444'; c.fillRect(mouthX+2,mouthY+5,mouthW-4,2);
    } else if (mouthTalking) {
      const openH = 4 + jawDrop;
      c.fillStyle = '#cc4422'; c.fillRect(mouthX-2,mouthY-1,mouthW+4,4);
      c.fillStyle = '#330000'; c.fillRect(mouthX,mouthY+3,mouthW,openH);
      c.fillStyle = '#f0f0e0'; c.fillRect(mouthX+1,mouthY+3,mouthW-2,Math.min(4,openH));
      if (openH > 6) { c.fillStyle='#ff6655'; c.fillRect(mouthX+4,mouthY+5,mouthW-8,openH-3); }
      c.fillStyle = '#b03318'; c.fillRect(mouthX-2,mouthY+3+openH,mouthW+4,3);
    } else if (hpPct > 0.5) {
      c.fillStyle = '#cc4422'; c.fillRect(mouthX,mouthY,mouthW,5);
      c.fillStyle = '#fff';
      for (let i=0;i<3;i++) c.fillRect(mouthX+3+i*6,mouthY+1,4,3);
    } else if (hpPct > 0.25) {
      c.fillStyle = '#aa3311'; c.fillRect(mouthX+2,mouthY+2,mouthW-4,4);
    } else {
      c.fillStyle = '#cc2200'; c.fillRect(mouthX,mouthY,mouthW,5);
      c.fillStyle = '#ddd';
      for (let i=0;i<5;i++) c.fillRect(mouthX+1+i*4,mouthY+1,3,3);
    }
    c.fillStyle = '#cc3300';
    c.fillRect(17,46,5,6); c.fillRect(78,46,5,6);
    c.fillStyle = '#2a3a8a'; c.fillRect(10,88,80,12);
    c.fillStyle = '#1a2a6a'; c.fillRect(44,88,12,12);
    c.fillStyle = '#cc2200'; c.fillRect(56,90,5,5); c.fillRect(58,88,1,2);
  }


  function init(canvas) {
    hudCanvas = canvas;
    hudCtx    = canvas.getContext('2d');
  }

  function toggleMinimap() { minimapVisible = !minimapVisible; }

  // ── Main HUD Draw ─────────────────────────────────────
  function draw(player, levelIndex, enemies) {
    const ctx  = hudCtx;
    ctx.clearRect(0, 0, hudCanvas.width, hudCanvas.height);
    const ps   = player;
    const pal  = C.PALETTE[Math.min(levelIndex, C.PALETTE.length - 1)];
    const HY   = hudCanvas.height - C.HUD_H;

    // Background
    const grd = ctx.createLinearGradient(0, HY, 0, hudCanvas.height);
    grd.addColorStop(0, 'rgba(22,9,2,0.98)');
    grd.addColorStop(1, 'rgba(12,5,1,0.98)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, HY, C.SCREEN_W, C.HUD_H);

    // Border
    ctx.strokeStyle = pal.accent; ctx.lineWidth = 2;
    ctx.strokeRect(1, HY + 1, C.SCREEN_W - 2, C.HUD_H - 2);

    // Separator line along the top edge of HUD
    ctx.beginPath();
    ctx.moveTo(0, HY); ctx.lineTo(C.SCREEN_W, HY);
    ctx.stroke();

    const LABEL_Y = HY + 18;
    const BAR_Y   = HY + 22;
    const BAR_H   = 20;
    const VAL_Y   = BAR_Y + BAR_H + 11;

    // ── HEALTH ──
    ctx.fillStyle = '#ff6060'; ctx.font = 'bold 10px Courier New'; ctx.textAlign = 'left';
    ctx.fillText('HEALTH', 10, LABEL_Y);
    _drawBarPlain(ctx, 10, BAR_Y, 130, BAR_H, ps.hp / C.PLAYER_MAX_HP, '#ff4040', '#5a0000');
    ctx.fillStyle = '#ff8080'; ctx.font = '10px Courier New';
    ctx.fillText(Math.ceil(ps.hp / C.PLAYER_MAX_HP * 100) + '%', 10, VAL_Y);

    // ── ARMOR ──
    ctx.fillStyle = '#80a8ff'; ctx.font = 'bold 10px Courier New';
    ctx.fillText('ARMOR', 152, LABEL_Y);
    _drawBarPlain(ctx, 152, BAR_Y, 130, BAR_H, ps.armor / C.PLAYER_MAX_ARMOR, '#6090ff', '#1a2560');
    ctx.fillStyle = '#90b0ff'; ctx.font = '10px Courier New';
    ctx.fillText(Math.ceil(ps.armor / C.PLAYER_MAX_ARMOR * 100) + '%', 152, VAL_Y);

    // ── BAGUETTES ──
    ctx.fillStyle = '#a07030'; ctx.font = 'bold 10px Courier New'; ctx.textAlign = 'center';
    ctx.fillText('BAGUETTES', 318, LABEL_Y);
    ctx.fillStyle = '#f0c060'; ctx.font = 'bold 26px Courier New';
    ctx.fillText('x' + ps.baguettes, 318, BAR_Y + BAR_H - 1);

    // ── FACE (centered) ──
    drawFace(ps.hp, ps.gojiraCharge);
    const faceX = Math.floor(C.SCREEN_W / 2) - 34;
    ctx.drawImage(faceCanvas, faceX, HY + 3, 68, 68);
    ctx.strokeStyle = pal.accent; ctx.lineWidth = 2;
    ctx.strokeRect(faceX, HY + 3, 68, 68);

    // ── GOJIRA ──
    const gjX   = Math.floor(C.SCREEN_W / 2) + 46;
    const gjW   = 140;
    const gjPct = Utils.clamp(ps.gojiraCharge / 100, 0, 1);
    const gjReady = gjPct >= 1;
    ctx.fillStyle = gjReady ? '#ffe080' : '#c08030';
    ctx.font = 'bold 10px Courier New'; ctx.textAlign = 'left';
    ctx.fillText(gjReady ? 'GOJIRA GO!' : 'GOJIRA', gjX, LABEL_Y);
    ctx.fillStyle = '#1a1000'; ctx.fillRect(gjX, BAR_Y, gjW, BAR_H);
    const gjGrd = ctx.createLinearGradient(gjX, 0, gjX + gjW, 0);
    gjGrd.addColorStop(0, '#994400'); gjGrd.addColorStop(1, '#ffaa00');
    ctx.fillStyle = gjGrd; ctx.fillRect(gjX, BAR_Y, gjW * gjPct, BAR_H);
    ctx.strokeStyle = gjReady
      ? `rgba(255,220,0,${0.6 + Math.sin(Date.now()/200)*0.4})`
      : '#604010';
    ctx.lineWidth = 1; ctx.strokeRect(gjX, BAR_Y, gjW, BAR_H);
    ctx.fillStyle = gjReady ? '#ffe080' : '#c08030';
    ctx.font = '10px Courier New';
    ctx.fillText(Math.floor(gjPct * 100) + '%', gjX, VAL_Y);

    // ── SCORE ──
    const scX = gjX + gjW + 18;
    ctx.fillStyle = '#d4b060'; ctx.font = 'bold 10px Courier New';
    ctx.fillText('SCORE', scX, LABEL_Y);
    ctx.fillStyle = '#f0d080'; ctx.font = 'bold 16px Courier New';
    ctx.fillText(ps.score.toString().padStart(7, '0'), scX, BAR_Y + BAR_H - 2);
    ctx.fillStyle = '#c08040'; ctx.font = '10px Courier New';
    ctx.fillText('LVL ' + (levelIndex + 1), scX, VAL_Y);

    // ── KEY ──
    if (ps.hasKey) {
      ctx.font = '20px sans-serif'; ctx.textAlign = 'right';
      ctx.fillText('🗝', C.SCREEN_W - 8, BAR_Y + BAR_H);
    }

    // ── Controls hint ──
    ctx.fillStyle = 'rgba(180,130,60,0.55)'; ctx.font = '9px Courier New'; ctx.textAlign = 'left';
    ctx.fillText('WASD=Move  Space=Shoot  G=Baguette  E=Gojira  TAB=Map  M=Mute', 10, hudCanvas.height - 5);

    // ── Boss bar (appears just above the HUD) ──
      const boss = enemies.find(e => e.type === 'pricilla' && !e.dead);
    if (boss) {
      const bw   = 400, bh = 18;
      const bx   = Math.floor(C.SCREEN_W / 2) - bw / 2;
      const by   = 32;                            // TOP of screen
      const bPct = boss.hp / boss.maxHp;

      // dark backdrop
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(bx - 4, by - 22, bw + 8, bh + 30);

      // bar background
      ctx.fillStyle = '#1a0008';
      ctx.fillRect(bx, by, bw, bh);

      // bar fill
      const bGrd = ctx.createLinearGradient(bx, 0, bx + bw, 0);
      bGrd.addColorStop(0,   '#400020');
      bGrd.addColorStop(0.5, '#cc0060');
      bGrd.addColorStop(1,   '#ff80c0');
      ctx.fillStyle = bGrd;
      ctx.fillRect(bx, by, bw * bPct, bh);

      // outline
      ctx.strokeStyle = '#ff00aa';
      ctx.lineWidth   = 2;
      ctx.strokeRect(bx, by, bw, bh);

      // phase pips
      [C.PRICILLA_PHASE2_HP / C.PRICILLA_HP, C.PRICILLA_PHASE3_HP / C.PRICILLA_HP].forEach(frac => {
        const pipX = bx + bw * frac;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(pipX, by);
        ctx.lineTo(pipX, by + bh);
        ctx.stroke();
      });

      // label ABOVE the bar
      ctx.fillStyle = '#ffd0e8';
      ctx.font      = 'bold 12px Courier New';
      ctx.textAlign = 'center';
      ctx.fillText('✦ PRICILLA ✦  ' + Math.ceil(boss.hp) + ' / ' + boss.maxHp,
                   bx + bw / 2, by - 6);
      ctx.textAlign = 'left';
    }

    if (minimapVisible) drawMinimap(ctx, player, levelIndex);

  }

  // ── Bar helpers ───────────────────────────────────────
  function _drawBarPlain(ctx, x, y, w, h, pct, fillColor, bgColor) {
    ctx.fillStyle = bgColor; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = fillColor; ctx.fillRect(x, y, w * Utils.clamp(pct, 0, 1), h);
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1; ctx.strokeRect(x, y, w, h);
  }

  function drawBar(ctx, x, y, w, h, pct, fillColor, bgColor, label) {
    _drawBarPlain(ctx, x, y, w, h, pct, fillColor, bgColor);
    if (label) {
      ctx.fillStyle = '#ffffffcc'; ctx.font = '9px Courier New';
      ctx.fillText(label + ' ' + Math.ceil(pct * 100), x + 3, y + h - 3);
    }
  }

  // ── Minimap ───────────────────────────────────────────
  function drawMinimap(ctx, player, levelIndex) {
    const map = Maps.getMap();
    if (!map) return;
    const cell = C.MINIMAP_CELL, size = C.MINIMAP_SIZE;
    const HY = hudCanvas.height - C.HUD_H;
    const ox = C.SCREEN_W - size - 10;
    const oy = HY - size - 10;   // sits just above the HUD
    const px = Math.floor(player.x), py = Math.floor(player.y);
    for (let dx=-4;dx<=4;dx++)
      for (let dy=-4;dy<=4;dy++)
        minimapExplored.add(`${px+dx},${py+dy}`);
    ctx.fillStyle='rgba(0,0,0,0.75)'; ctx.fillRect(ox,oy,size,size);
    for (let row=0;row<map.length;row++) {
      for (let col=0;col<map[row].length;col++) {
        if (!minimapExplored.has(`${col},${row}`)) continue;
        const v=map[row][col], cx=ox+col*cell, cy=oy+row*cell;
        if (cx<ox||cy<oy||cx+cell>ox+size||cy+cell>oy+size) continue;
        ctx.fillStyle=(v===0||v===9)?'#302010':v===6?'#806020':'#806040';
        ctx.fillRect(cx,cy,cell-1,cell-1);
      }
    }
    for (const e of Enemies.getAll()) {
      if (e.dead) continue;
      const ex=ox+e.x*cell, ey=oy+e.y*cell;
      if (ex<ox||ey<oy||ex>ox+size||ey>oy+size) continue;
      ctx.fillStyle=e.type==='pricilla'?'#ff00cc':'#ff4040';
      ctx.beginPath(); ctx.arc(ex,ey,3,0,Math.PI*2); ctx.fill();
    }
    const mapPX=ox+player.x*cell, mapPY=oy+player.y*cell;
    ctx.fillStyle='#f0d080';
    ctx.beginPath(); ctx.arc(mapPX,mapPY,4,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='#f0d080'; ctx.lineWidth=2;
    ctx.beginPath();
    ctx.moveTo(mapPX,mapPY);
    ctx.lineTo(mapPX+Math.cos(player.angle)*10,mapPY+Math.sin(player.angle)*10);
    ctx.stroke();
    ctx.strokeStyle='#c87020'; ctx.lineWidth=1; ctx.strokeRect(ox,oy,size,size);
    ctx.fillStyle='#806040'; ctx.font='9px Courier New'; ctx.textAlign='left';
    ctx.fillText('[TAB] MAP', ox+2, oy+size-2);
  }

// GOJIRA MODE
function showGojiraModeActivated() {
  const el = document.createElement('div');
  el.textContent = '☢️ GOJIRA MODE ACTIVATED ☢️';
  el.style.cssText = `
    position:absolute;
    top:40%;
    left:50%;
    transform:translate(-50%,-50%);
    font-family:'Courier New',monospace;
    font-size:28px;
    font-weight:bold;
    color:#40ff80;
    text-shadow:0 0 20px #00ff60,0 0 40px #00cc40;
    letter-spacing:4px;
    z-index:10;
    pointer-events:none;
    white-space:nowrap;
    opacity:1;
    transition:opacity 0.12s;
  `;
  const container = document.getElementById('damage-numbers');
  if (!container) return;
  container.appendChild(el);

  // Blink on/off for ~2 seconds
  let visible = true;
  let elapsed = 0;
  const interval = 200; // ms

  const id = setInterval(() => {
    elapsed += interval;
    visible = !visible;
    el.style.opacity = visible ? '1' : '0';
    if (elapsed >= 2000) {
      clearInterval(id);
      if (el.parentNode) el.parentNode.removeChild(el);
    }
  }, interval);
}



  // ── Quip System ───────────────────────────────────────
  let playerQuipTimer = 0, enemyQuipTimer = 0;

  function showPlayerQuip(text) {
    if (!text) return;
    const el = document.getElementById('quip-player');
    el.textContent = '💬 Pippa: ' + text;
    el.classList.add('visible');
    Audio2.playQuipSound(true);
    startTalking(3);
    clearTimeout(playerQuipTimer);
    playerQuipTimer = setTimeout(() => el.classList.remove('visible'), 3500);
  }

  function showEnemyQuip(text) {
    if (!text) return;
    const el = document.getElementById('quip-enemy');
    el.textContent = '💀 Pricilla: ' + text;
    el.classList.add('visible');
    Audio2.playQuipSound(false);
    startTalking(4);
    clearTimeout(enemyQuipTimer);
    enemyQuipTimer = setTimeout(() => el.classList.remove('visible'), 4000);
  }

  // ── Floating Damage Numbers ───────────────────────────
  function spawnDmgNum(x, y, text, cls) {
    const container = document.getElementById('damage-numbers');
    if (!container) return;
    const el = document.createElement('div');
    el.className   = 'dmg-num ' + (cls || '');
    el.textContent = text;
    el.style.left  = x + 'px';
    el.style.top   = y + 'px';
    container.appendChild(el);
    setTimeout(() => { if (el.parentNode) el.remove(); }, 850);
  }

  function resetMinimap() { minimapExplored = new Set(); }

  return {
    init, draw, toggleMinimap,
    showPlayerQuip, showEnemyQuip,
    spawnDmgNum, resetMinimap, showGojiraModeActivated,
  };
})();