// ============================================================
//  Player — state, input, movement, weapon draw, damage
// ============================================================

const Player = (() => {

  const state = {
    x: 2, y: 2, angle: 0,
    hp: 100, maxHp: 100,
    armor: 0, maxArmor: 100,
    baguettes: 3,
    gojiraCharge: 90,
    score: 0,
    hasKey: false,
    shakeX: 0, shakeY: 0,
    shakeTrauma: 0,
    bobPhase: 0,
    _lastShot: 0,
    _lastBaguette: 0,
    gojiraMode: false,
  };

  const keys = {};
  let _muted = false;

  function toggleMute() {
    _muted = !_muted;
    const bgm = document.getElementById('bgm');
    if (bgm) bgm.muted = _muted;
    if (typeof Audio2 !== 'undefined') Audio2.setMuted(_muted);
    HUD.showPlayerQuip(_muted ? '🔇 Sound OFF' : '🔊 Sound ON');
  }

  function initInput(canvas) {
    window.addEventListener('keydown', e => {
      keys[e.code] = true;
      if (e.code === 'Space') tryFirePrimary();
      if (e.code === 'KeyG')  tryFireBaguette();
      if (e.code === 'KeyE')  tryActivateGojira();
      if (e.code === 'KeyJ')  cheat();
      if (e.code === 'KeyM')  toggleMute();
      if (e.code === 'Tab')   { HUD.toggleMinimap(); e.preventDefault(); }
    });
    window.addEventListener('keyup', e => { keys[e.code] = false; });

    canvas.addEventListener('click', () => canvas.requestPointerLock());
    document.addEventListener('pointerlockchange', () => {});

    document.addEventListener('mousemove', e => {
      if (document.pointerLockElement === canvas) {
        const dx = (e.movementX || 0) * C.PLAYER_MOUSE_SENS;
        if (isFinite(dx)) state.angle += dx;
      }
    });

    canvas.addEventListener('mousedown', e => {
      if (e.button === 0) tryFirePrimary();
    });
  }

  // ── Firing ────────────────────────────────────────────
  function tryFirePrimary() {
    if (state.gojiraMode) {
      tryFireLightning();
    } else {
      tryFireCoffee();
    }
  }

  function tryFireCoffee() {
    const now = performance.now();
    if (now - state._lastShot < C.COFFEE_COOLDOWN) return;
    state._lastShot = now;

    const dirX   = Math.cos(state.angle);
    const dirY   = Math.sin(state.angle);
    const rightX = -dirY;
    const rightY =  dirX;
    const shotX  = state.x + dirX * 0.35 + rightX * 0.08;
    const shotY  = state.y + dirY * 0.35 + rightY * 0.08;

    Projectiles.spawnPlayerShot(shotX, shotY, state.angle);
    Audio2.playCoffeeShot();
    state.bobPhase += 0.3;
    HUD.showPlayerQuip(Utils.randomQuip(C.PLAYER_SHOOT_QUIPS));
  }

  function tryFireLightning() {
    const now = performance.now();
    if (now - state._lastShot < C.COFFEE_COOLDOWN * 0.6) return;
    state._lastShot = now;

    const dirX  = Math.cos(state.angle);
    const dirY  = Math.sin(state.angle);
    const shotX = state.x + dirX * 0.35;
    const shotY = state.y + dirY * 0.35;

    Projectiles.spawnLightning(shotX, shotY, state.angle);
    Audio2.playGojiraRoar();
    state.bobPhase += 0.5;
    //HUD.showPlayerQuip(Utils.randomQuip(C.GOJIRA_MODE_QUIPS));
  }

  function tryFireBaguette() {
    if (state.baguettes <= 0) { HUD.showPlayerQuip("Out of baguettes!"); return; }
    const now = performance.now();
    if (now - state._lastBaguette < 1000) return;
    state._lastBaguette = now;
    state.baguettes--;

    const dirX = Math.cos(state.angle);
    const dirY = Math.sin(state.angle);
    Projectiles.spawnBaguette(
      state.x + dirX * 0.35,
      state.y + dirY * 0.35,
      state.angle
    );
    Audio2.playExplosion();
    HUD.showPlayerQuip(Utils.randomQuip(C.PLAYER_BAGUETTE_QUIPS));
  }

  function tryActivateGojira() {
    if (state.gojiraMode) return;
    if (state.gojiraCharge < 100) {
      HUD.showPlayerQuip("Gojira not ready!");
      return;
    }
    _enterGojiraMode();
  }

  // ── Gojira Mode ────────────────────────────────────────
  function _enterGojiraMode() {
    state.gojiraMode = true;
    Audio2.playGojira();
    Screens.showDamageFlash('rgba(0,255,100,0.4)');
    addShakeTrauma(0.5);
    HUD.showGojiraModeActivated();
    HUD.showPlayerQuip("☢️ GOJIRA MODE!! ☢️");
  }

  function _exitGojiraMode() {
    state.gojiraMode    = false;
    state.gojiraCharge  = 0;
    Screens.showDamageFlash('rgba(0,100,50,0.3)');
    HUD.showPlayerQuip("Gojira energy depleted...");
  }

  // ── Damage / Healing ──────────────────────────────────
  function takeDamage(amount) {
    if (state.gojiraMode) {
      state.gojiraCharge -= amount;
      addShakeTrauma(0.3);
      Audio2.playGojiraRoar();
      if (state.gojiraCharge <= 0) {
        state.gojiraCharge = 0;
        _exitGojiraMode();
      }
      return;
    }

    if (state.armor > 0) {
      const absorbed = Math.min(state.armor, amount * 0.6);
      state.armor -= absorbed;
      amount      -= absorbed;
    }
    state.hp = Math.max(0, state.hp - amount);
    Audio2.playPlayerHurt();
    Screens.showDamageFlash('rgba(255,0,0,0.35)');
    addShakeTrauma(0.5);
    if (state.hp <= 0) GameState.setGameOver();
  }

  function heal(amount) {
    state.hp = Math.min(state.maxHp, state.hp + amount);
    Screens.showDamageFlash('rgba(0,255,0,0.25)');
    HUD.showPlayerQuip(Utils.randomQuip(C.PLAYER_HEAL_QUIPS));
    HUD.spawnDmgNum(
      C.SCREEN_W/2 + (Math.random()*60-30),
      C.SCREEN_H/2 - 30,
      '+' + amount, 'heal'
    );
  }

  function addArmor(amount) {
    state.armor = Math.min(state.maxArmor, state.armor + amount);
    HUD.showPlayerQuip(Utils.randomQuip(C.PLAYER_ARMOR_QUIPS));
  }

  function addScore(n)        { state.score += n; }
  function addGojiraCharge(n) { state.gojiraCharge = Math.min(100, state.gojiraCharge + n); }
  function addShakeTrauma(t)  { state.shakeTrauma = Math.min(1, state.shakeTrauma + t); }

  function cheat() {
    state.hp           = state.maxHp;
    state.armor        = state.maxArmor;
    state.baguettes   += 5;
    state.gojiraCharge = 100;
    Screens.showDamageFlash('rgba(255,255,0,0.25)');
    HUD.showPlayerQuip("CHEAT ACTIVATED ☕");
  }

  // ── Update ────────────────────────────────────────────
  function update(dt) {
    const spd  = C.PLAYER_SPEED     * dt;
    const turn = C.PLAYER_ROT_SPEED * dt;
    const doors = Maps.getDoors();

    if (keys['KeyQ'] || keys['ArrowLeft'])  state.angle -= turn;
    if (keys['ArrowRight'])                 state.angle += turn;
    if (!isFinite(state.angle)) state.angle = 0;

    const cosA = Math.cos(state.angle);
    const sinA = Math.sin(state.angle);
    const cosR = Math.cos(state.angle + Math.PI / 2);
    const sinR = Math.sin(state.angle + Math.PI / 2);

    let moveX = 0, moveY = 0;
    if (keys['KeyW'] || keys['ArrowUp'])   { moveX += cosA*spd; moveY += sinA*spd; }
    if (keys['KeyS'] || keys['ArrowDown']) { moveX -= cosA*spd; moveY -= sinA*spd; }
    if (keys['KeyA'])                      { moveX -= cosR*spd; moveY -= sinR*spd; }
    if (keys['KeyD'])                      { moveX += cosR*spd; moveY += sinR*spd; }

    const nx = state.x + moveX;
    const ny = state.y + moveY;
    const margin = 0.3;
    if (!doors.isWall(Math.floor(nx + Math.sign(moveX)*margin), Math.floor(state.y))) state.x = nx;
    if (!doors.isWall(Math.floor(state.x), Math.floor(ny + Math.sign(moveY)*margin))) state.y = ny;

    const moving = keys['KeyW']||keys['KeyS']||keys['KeyA']||keys['KeyD'];
    if (moving) state.bobPhase += dt * 8;

    state.shakeTrauma = Math.max(0, state.shakeTrauma - dt * 2.5);
    const shk = state.shakeTrauma * state.shakeTrauma;
    state.shakeX = (Math.random()*2-1) * shk * C.SHAKE_MAGNITUDE;
    state.shakeY = (Math.random()*2-1) * shk * C.SHAKE_MAGNITUDE;

    if (state.gojiraMode) {
      state.gojiraCharge -= C.GOJIRA_MODE_DRAIN_RATE * dt;
      if (state.gojiraCharge <= 0) {
        state.gojiraCharge = 0;
        _exitGojiraMode();
      }
    } else if (state.gojiraCharge < 100) {
      state.gojiraCharge = Math.min(100, state.gojiraCharge + C.GOJIRA_CHARGE_RATE * dt);
    }

    if (keys['Space']) tryFirePrimary();
  }

  // ── Weapon / Character Draw ───────────────────────────
  function drawWeapon(ctx, gojiraReady) {
    const W    = C.SCREEN_W;
    const HY   = C.SCREEN_H - C.HUD_H;
    const bob  = Math.sin(state.bobPhase) * 5;
    const cx   = W / 2;
    const base = HY + bob;
    const now  = Date.now();

    if (state.gojiraMode) {
      _drawGojiraWeapon(ctx, cx, base, now);
    } else {
      _drawHumanWeapon(ctx, cx, base, now, gojiraReady);
    }
  }

  // ── Gojira Weapon ─────────────────────────────────────
 function _drawGojiraWeapon(ctx, cx, base, now, firingT = 0) {
  const pulse  = Math.sin(now / 180) * 0.15;
  const pulse2 = Math.sin(now / 90)  * 0.5 + 0.5;

  // ── NECK / SHOULDERS ──
  ctx.fillStyle = '#1a3224';
  ctx.fillRect(cx - 50, base - 30, 100, 32);
  // Shoulder slope left
  ctx.fillStyle = '#1e3828';
  ctx.beginPath();
  ctx.moveTo(cx - 50, base - 30);
  ctx.lineTo(cx - 90, base - 10);
  ctx.lineTo(cx - 90, base + 2);
  ctx.lineTo(cx - 50, base - 14);
  ctx.closePath();
  ctx.fill();
  // Shoulder slope right
  ctx.beginPath();
  ctx.moveTo(cx + 50, base - 30);
  ctx.lineTo(cx + 90, base - 10);
  ctx.lineTo(cx + 90, base + 2);
  ctx.lineTo(cx + 50, base - 14);
  ctx.closePath();
  ctx.fill();

  // ── BACK OF HEAD — large rounded mass ──
  ctx.fillStyle = '#1e3828';
  ctx.beginPath();
  ctx.ellipse(cx, base - 80, 72, 60, 0, 0, Math.PI * 2);
  ctx.fill();

  // Scale texture rows across back of head
  ctx.fillStyle = '#162e20';
  for (let row = 0; row < 4; row++) {
    for (let col = -3; col <= 3; col++) {
      const sx = cx + col * 26 + (row % 2) * 13;
      const sy = base - 50 - row * 22;
      // Clamp to rough ellipse shape
      const dx = (sx - cx) / 72;
      const dy = (sy - (base - 80)) / 60;
      if (dx*dx + dy*dy > 0.85) continue;
      ctx.beginPath();
      ctx.ellipse(sx, sy, 9, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Subtle head highlight
  ctx.fillStyle = '#243e2c';
  ctx.beginPath();
  ctx.ellipse(cx + 10, base - 100, 28, 22, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // ── DORSAL SPIKES running down the spine ──
  // Spikes get smaller toward bottom (perspective)
  const spineSpikes = [
    { y: base - 155, h: 55, w: 13 },
    { y: base - 140, h: 44, w: 11 },
    { y: base - 122, h: 36, w: 10 },
    { y: base - 104, h: 28, w:  9 },
    { y: base -  86, h: 20, w:  7 },
  ];

  spineSpikes.forEach(({ y, h, w }, i) => {
    const spikeGlow = 0.12 + pulse + firingT * 0.5;
    // Glow behind spike
    ctx.fillStyle = `rgba(120,40,200,${spikeGlow})`;
    ctx.beginPath();
    ctx.moveTo(cx - w - 4, y + h);
    ctx.lineTo(cx + w + 4, y + h);
    ctx.lineTo(cx,         y - 10);
    ctx.closePath();
    ctx.fill();
    // Spike body dark
    ctx.fillStyle = '#1a3020';
    ctx.beginPath();
    ctx.moveTo(cx - w, y + h);
    ctx.lineTo(cx + w, y + h);
    ctx.lineTo(cx,     y);
    ctx.closePath();
    ctx.fill();
    // Spike highlight edge
    ctx.fillStyle = '#2e5038';
    ctx.beginPath();
    ctx.moveTo(cx, y + h);
    ctx.lineTo(cx + w, y + h);
    ctx.lineTo(cx, y);
    ctx.closePath();
    ctx.fill();
  });

  // ── PINK BOW 🎀 — sits above top spike ──
  const bowX = cx;
  const bowY = base - 130;

  ctx.fillStyle = '#ff6eb4';
  ctx.beginPath();
  ctx.moveTo(bowX, bowY + 2);
  ctx.lineTo(bowX - 20, bowY - 10);
  ctx.lineTo(bowX - 22, bowY + 6);
  ctx.lineTo(bowX - 5,  bowY + 8);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(bowX, bowY + 2);
  ctx.lineTo(bowX + 20, bowY - 10);
  ctx.lineTo(bowX + 22, bowY + 6);
  ctx.lineTo(bowX + 5,  bowY + 8);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#c73d80';
  ctx.beginPath();
  ctx.moveTo(bowX - 3, bowY + 4);
  ctx.lineTo(bowX - 20, bowY - 2);
  ctx.lineTo(bowX - 20, bowY + 6);
  ctx.lineTo(bowX - 5,  bowY + 8);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(bowX + 3, bowY + 4);
  ctx.lineTo(bowX + 20, bowY - 2);
  ctx.lineTo(bowX + 20, bowY + 6);
  ctx.lineTo(bowX + 5,  bowY + 8);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#ffaad4';
  ctx.fillRect(bowX - 16, bowY - 4, 7, 5);
  ctx.fillRect(bowX + 10, bowY - 4, 7, 5);

  ctx.fillStyle = firingT > 0 ? `rgba(220,100,255,${0.6 + firingT * 0.4})` : '#ff6eb4';
  ctx.beginPath(); ctx.roundRect(bowX - 6, bowY - 4, 12, 12, 3); ctx.fill();
  ctx.fillStyle = '#c73d80';
  ctx.beginPath(); ctx.roundRect(bowX - 3, bowY - 1, 6, 6, 2); ctx.fill();
  ctx.fillStyle = '#ffaad4';
  ctx.fillRect(bowX - 2, bowY, 3, 3);

  // ── IDLE: ENERGY GLOW around spikes ──
  if (firingT < 0.8) {
    const idleAlpha = (1 - firingT) * 0.6;
    const swirl = now / 400;
    // Soft purple aura drifting up along the spine
    for (let i = 0; i < 4; i++) {
      const angle  = swirl * (0.8 + i * 0.3) + i * 1.2;
      const ox     = cx + Math.cos(angle) * 18;
      const oy     = base - 100 + Math.sin(angle * 0.5) * 30;
      const grd    = ctx.createRadialGradient(ox, oy, 0, ox, oy, 14);
      grd.addColorStop(0, `rgba(180,60,255,${idleAlpha})`);
      grd.addColorStop(1, 'rgba(100,0,180,0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(ox, oy, 14, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── FIRING: BEAM shoots up from between the spikes ──
  if (firingT > 0) {
    const beamAlpha = Math.min(firingT * 1.5, 1.0);
    const beamW     = 20 + firingT * 30;
    const beamOriginY = base - 155;

    // Outer glow cone going upward
    const outerGrd = ctx.createLinearGradient(cx, beamOriginY, cx, beamOriginY - 320);
    outerGrd.addColorStop(0,   `rgba(180,40,255,${beamAlpha * 0.6})`);
    outerGrd.addColorStop(0.5, `rgba(120,20,200,${beamAlpha * 0.3})`);
    outerGrd.addColorStop(1,   'rgba(80,0,160,0)');
    ctx.fillStyle = outerGrd;
    ctx.beginPath();
    ctx.moveTo(cx - beamW,       beamOriginY);
    ctx.lineTo(cx + beamW,       beamOriginY);
    ctx.lineTo(cx + beamW * 2.2, beamOriginY - 320);
    ctx.lineTo(cx - beamW * 2.2, beamOriginY - 320);
    ctx.closePath();
    ctx.fill();

    // Main beam
    const mainGrd = ctx.createLinearGradient(cx, beamOriginY, cx, beamOriginY - 300);
    mainGrd.addColorStop(0,    `rgba(255,220,255,${beamAlpha})`);
    mainGrd.addColorStop(0.15, `rgba(210,80,255,${beamAlpha * 0.95})`);
    mainGrd.addColorStop(0.6,  `rgba(140,20,240,${beamAlpha * 0.7})`);
    mainGrd.addColorStop(1,    'rgba(80,0,180,0)');
    ctx.fillStyle = mainGrd;
    ctx.beginPath();
    ctx.moveTo(cx - beamW * 0.4, beamOriginY);
    ctx.lineTo(cx + beamW * 0.4, beamOriginY);
    ctx.lineTo(cx + beamW * 0.9, beamOriginY - 300);
    ctx.lineTo(cx - beamW * 0.9, beamOriginY - 300);
    ctx.closePath();
    ctx.fill();

    // White hot core
    const coreGrd = ctx.createLinearGradient(cx, beamOriginY, cx, beamOriginY - 200);
    coreGrd.addColorStop(0,   `rgba(255,255,255,${beamAlpha})`);
    coreGrd.addColorStop(0.3, `rgba(240,180,255,${beamAlpha * 0.9})`);
    coreGrd.addColorStop(1,   'rgba(180,40,255,0)');
    ctx.fillStyle = coreGrd;
    ctx.beginPath();
    ctx.moveTo(cx - 8,  beamOriginY);
    ctx.lineTo(cx + 8,  beamOriginY);
    ctx.lineTo(cx + 18, beamOriginY - 200);
    ctx.lineTo(cx - 18, beamOriginY - 200);
    ctx.closePath();
    ctx.fill();
  }
}

  // ── Human / Barista Weapon ────────────────────────────
  function _drawHumanWeapon(ctx, cx, base, now, gojiraReady) {
  const SKIN    = '#d4956a';
  const SHADOW  = '#b8754a';
  const SHIRT   = '#4a7a9b';
  const SHIRT_D = '#2e5a7a';
  const APRON   = '#e8d8a0';
  const APRON_D = '#c8b880';
  const HAIR    = '#3a2010';
  const HAIR_H  = '#5a3820'; // hair highlight

  // ── TORSO — shirt ──
  ctx.fillStyle = SHIRT;
  ctx.fillRect(cx - 44, base - 80, 88, 72);
  ctx.fillStyle = SHIRT_D;
  ctx.fillRect(cx - 44, base - 80, 10, 72);
  ctx.fillRect(cx + 34,  base - 80, 10, 72);

  // ── APRON BACK STRAPS (just the crossed straps visible from behind) ──
  ctx.fillStyle = APRON_D;
  // Cross strap left-to-right
  ctx.fillRect(cx - 20, base - 80, 8, 36);
  ctx.fillRect(cx + 12,  base - 80, 8, 36);

  // ── BACK OF HEAD ──
  // Neck
  ctx.fillStyle = SKIN;
  ctx.fillRect(cx - 10, base - 100, 20, 22);
  ctx.fillStyle = SHADOW;
  ctx.fillRect(cx - 10, base - 100, 4, 22);
  ctx.fillRect(cx + 6,  base - 100, 4, 22);

  // Head base
  ctx.fillStyle = SKIN;
  ctx.beginPath();
  ctx.ellipse(cx, base - 120, 28, 24, 0, 0, Math.PI * 2);
  ctx.fill();

  // Long hair — main body falling down over shoulders
  ctx.fillStyle = HAIR;
  // Top of head
  ctx.fillRect(cx - 28, base - 148, 56, 30);
  ctx.beginPath();
  ctx.ellipse(cx, base - 148, 28, 12, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  // Hair falling left side
  ctx.fillRect(cx - 34, base - 140, 18, 70);
  ctx.beginPath();
  ctx.ellipse(cx - 26, base - 72, 9, 6, 0.2, 0, Math.PI * 2);
  ctx.fill();
  // Hair falling right side
  ctx.fillRect(cx + 16, base - 140, 18, 70);
  ctx.beginPath();
  ctx.ellipse(cx + 26, base - 72, 9, 6, -0.2, 0, Math.PI * 2);
  ctx.fill();
  // Hair center back
  ctx.fillRect(cx - 12, base - 140, 24, 60);

  // Hair highlights
  ctx.fillStyle = HAIR_H;
  ctx.fillRect(cx - 6, base - 146, 6, 50);
  ctx.fillRect(cx + 4, base - 140, 4, 40);

  // Hair ends / wisps
  ctx.fillStyle = HAIR;
  ctx.fillRect(cx - 30, base - 80, 8, 16);
  ctx.fillRect(cx + 22,  base - 80, 8, 16);
  ctx.fillRect(cx - 10, base - 82, 20, 14);

  // Small ear peek through hair (left side)
  ctx.fillStyle = SKIN;
  ctx.fillRect(cx - 30, base - 126, 5, 8);
  ctx.fillStyle = SHADOW;
  ctx.fillRect(cx - 30, base - 124, 3, 4);

  // ── LEFT ARM — relaxed at side ──
  ctx.fillStyle = SHIRT;
  ctx.fillRect(cx - 60, base - 76, 18, 50);
  ctx.fillStyle = SHIRT_D;
  ctx.fillRect(cx - 60, base - 76, 5, 50);
  ctx.fillStyle = SKIN;
  ctx.fillRect(cx - 62, base - 30, 22, 16);
  ctx.fillStyle = SHADOW;
  ctx.fillRect(cx - 62, base - 18, 22, 4);

  // ── RIGHT ARM — raised, holding cup ──
  ctx.fillStyle = SHIRT;
  ctx.fillRect(cx + 28, base - 90, 20, 48);
  ctx.fillStyle = SHIRT_D;
  ctx.fillRect(cx + 44, base - 90, 4, 48);
  // Forearm
  ctx.fillStyle = SKIN;
  ctx.fillRect(cx + 30, base - 120, 16, 34);
  ctx.fillStyle = SHADOW;
  ctx.fillRect(cx + 42, base - 120, 4, 34);
  // Hand gripping cup
  ctx.fillStyle = SKIN;
  ctx.fillRect(cx + 28, base - 128, 20, 14);
  ctx.fillStyle = SHADOW;
  ctx.fillRect(cx + 28, base - 118, 20, 4);

  // ── CUP ──
  const cupW = 32;
  const cupH = 42;
  const cupX = cx + 18;
  const cupY = base - 154;

  // Gojira ready aura
  if (gojiraReady) {
    const pulse = 0.12 + Math.sin(now / 200) * 0.08;
    const grd = ctx.createRadialGradient(cupX + cupW/2, cupY + cupH/2, 4, cupX + cupW/2, cupY + cupH/2, 80);
    grd.addColorStop(0, `rgba(0,255,100,${pulse + 0.15})`);
    grd.addColorStop(1, 'rgba(0,255,100,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(cupX - 50, cupY - 20, 160, 120);
  }

  // Cup body
  ctx.fillStyle = gojiraReady ? '#0a2a14' : '#f4eed8';
  ctx.fillRect(cupX, cupY, cupW, cupH);
  // Band
  ctx.fillStyle = gojiraReady ? '#00cc60' : '#cc3300';
  ctx.fillRect(cupX + 2, cupY + 12, cupW - 4, 12);
  // Band shine
  ctx.fillStyle = gojiraReady ? '#80ffc0' : '#ffffff';
  ctx.fillRect(cupX + 6, cupY + 15, 6, 5);
  // Base taper
  ctx.fillStyle = gojiraReady ? '#0a2a14' : '#f4eed8';
  ctx.fillRect(cupX + 2, cupY + cupH - 5, cupW - 4, 5);
  // Lid
  ctx.fillStyle = '#c8c0a0';
  ctx.fillRect(cupX - 2, cupY, cupW + 4, 6);
  ctx.fillStyle = '#b0a888';
  ctx.fillRect(cupX - 1, cupY - 4, cupW + 2, 5);
  // Lid tab
  ctx.fillStyle = '#d0c8a8';
  ctx.fillRect(cupX + cupW/2 - 4, cupY - 6, 8, 3);
  // Handle
  ctx.fillStyle = '#c8c0a0';
  ctx.fillRect(cupX + cupW,     cupY + 8,  8, 4);
  ctx.fillRect(cupX + cupW,     cupY + 26, 8, 4);
  ctx.fillRect(cupX + cupW + 5, cupY + 8,  3, 22);

  // Gojira ready border
  if (gojiraReady) {
    ctx.strokeStyle = `rgba(0,255,100,${0.4 + Math.sin(now / 180) * 0.4})`;
    ctx.lineWidth = 2;
    ctx.strokeRect(cupX - 2, cupY - 2, cupW + 4, cupH + 4);
  }

  // ── STEAM ──
  const sOff  = Math.sin(now / 380) * 3;
  const sAlph = 0.35 + Math.sin(now / 290) * 0.15;
  ctx.fillStyle = `rgba(255,255,255,${sAlph})`;
  ctx.fillRect(cupX + 6  + sOff,       cupY - 16, 4, 12);
  ctx.fillRect(cupX + 14 - sOff * 0.5, cupY - 20, 4, 16);
  ctx.fillRect(cupX + 22 + sOff,       cupY - 12, 3,  8);
}

  return {
    state, initInput, update, drawWeapon,
    takeDamage, heal, addArmor,
    addScore, addGojiraCharge, addShakeTrauma,
  };
})();