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
    gojiraMode: false,       // NEW: is Gojira Mode active?
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
    if (now - state._lastShot < C.COFFEE_COOLDOWN * 0.6) return; // faster fire rate
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
    if (state.gojiraMode) return; // already active
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
    HUD.showGojiraModeActivated();   // new HUD call — see hud.js
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
      // Damage drains Gojira Energy instead of HP
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

    // Gojira mode passive drain
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

  function _drawGojiraWeapon(ctx, cx, base, now) {
    // Giant green clawed hand / maw suggestion
    const pulse = Math.sin(now / 180) * 0.15;
    const W = C.SCREEN_W;
    const HY = C.SCREEN_H - C.HUD_H;

    // Glow aura
    const grd = ctx.createRadialGradient(cx, base - 40, 10, cx, base - 40, 160);
    grd.addColorStop(0, `rgba(0,255,100,${0.25 + pulse})`);
    grd.addColorStop(1, 'rgba(0,255,100,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(cx - 160, base - 200, 320, 200);

    // Claws — three thick tapered rects fanning out
    const clawColor = '#1a6630';
    const clawTip   = '#40ff80';
    [
      { offX: -60, rot: -0.35 },
      { offX:   0, rot:  0    },
      { offX:  60, rot:  0.35 },
    ].forEach(({ offX, rot }) => {
      ctx.save();
      ctx.translate(cx + offX, base - 20);
      ctx.rotate(rot);
      ctx.fillStyle = clawColor;
      ctx.fillRect(-14, -120, 28, 110);
      // Tip
      ctx.fillStyle = clawTip;
      ctx.beginPath();
      ctx.moveTo(-14, -120);
      ctx.lineTo( 14, -120);
      ctx.lineTo(  0, -155);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });

    // Lightning charge effect between claws
    ctx.strokeStyle = `rgba(180,255,80,${0.4 + pulse * 2})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 60, base - 80);
    for (let i = 0; i < 8; i++) {
      ctx.lineTo(
        cx - 60 + (i / 7) * 120 + (Math.random() - 0.5) * 20,
        base - 80 + (Math.random() - 0.5) * 40
      );
    }
    ctx.lineTo(cx + 60, base - 80);
    ctx.stroke();
  }

  function _drawHumanWeapon(ctx, cx, base, now, gojiraReady) {
    const SKIN   = '#d4956a';
    const SLEEVE = '#2a3a8a';
    const DARK   = '#1a2a6a';

    const tW = 160, tH = 90;
    const tX = cx - tW / 2, tY = base - tH;
    ctx.fillStyle = SLEEVE;
    ctx.fillRect(tX, tY, tW, tH);
    ctx.fillStyle = DARK;
    ctx.fillRect(tX,        tY, tW,  6);
    ctx.fillRect(tX,        tY, 5,   tH);
    ctx.fillRect(tX+tW-5,   tY, 5,   tH);
    ctx.fillStyle = '#cc2200';
    ctx.fillRect(cx - 12, tY + 2, 24, 5);

    ctx.fillStyle = SLEEVE;
    ctx.fillRect(tX - 44, tY + 8,  48, 26);
    ctx.fillStyle = DARK;
    ctx.fillRect(tX - 44, tY + 8,  48,  4);
    ctx.fillStyle = SLEEVE;
    ctx.fillRect(tX - 46, tY + 32, 32, 22);
    ctx.fillStyle = SKIN;
    ctx.fillRect(cx - 52, base - 54, 28, 18);
    ctx.fillStyle = '#c08058';
    ctx.fillRect(cx - 52, base - 40, 6, 5);
    ctx.fillRect(cx - 44, base - 40, 6, 5);
    ctx.fillRect(cx - 36, base - 40, 6, 5);

    ctx.fillStyle = SLEEVE;
    ctx.fillRect(tX + tW - 4, tY + 8, 48, 26);
    ctx.fillStyle = DARK;
    ctx.fillRect(tX + tW - 4, tY + 8, 48,  4);
    ctx.fillStyle = SLEEVE;
    ctx.fillRect(tX + tW + 14, tY + 32, 32, 22);
    ctx.fillStyle = SKIN;
    ctx.fillRect(cx + 24, base - 54, 28, 18);
    ctx.fillStyle = '#c08058';
    ctx.fillRect(cx + 24, base - 40, 6, 5);
    ctx.fillRect(cx + 32, base - 40, 6, 5);
    ctx.fillRect(cx + 40, base - 40, 6, 5);

    const cupW = 40, cupH = 50;
    const cupX = cx - cupW / 2;
    const cupY = base - 68;

    if (gojiraReady) {
      const pulse = 0.12 + Math.sin(now / 200) * 0.08;
      const grd = ctx.createRadialGradient(cx, cupY + cupH/2, 4, cx, cupY + cupH/2, 90);
      grd.addColorStop(0, `rgba(0,255,100,${pulse + 0.1})`);
      grd.addColorStop(1, 'rgba(0,255,100,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(cx - 90, cupY - 30, 180, 130);
    }

    ctx.fillStyle = gojiraReady ? '#0a2a14' : '#f4eed8';
    ctx.fillRect(cupX, cupY, cupW, cupH);
    ctx.fillStyle = gojiraReady ? '#00cc60' : '#cc3300';
    ctx.fillRect(cupX + 3, cupY + 14, cupW - 6, 14);
    ctx.fillStyle = gojiraReady ? '#80ffc0' : '#ffffff';
    ctx.fillRect(cx - 4, cupY + 18, 8, 6);
    ctx.fillStyle = gojiraReady ? '#0a2a14' : '#f4eed8';
    ctx.fillRect(cupX + 3, cupY + cupH - 6, cupW - 6, 6);
    ctx.fillStyle = '#c8c0a0';
    ctx.fillRect(cupX - 3, cupY,     cupW + 6, 7);
    ctx.fillStyle = '#b0a888';
    ctx.fillRect(cupX - 2, cupY - 5, cupW + 4, 6);
    ctx.fillStyle = '#d0c8a8';
    ctx.fillRect(cx - 5,   cupY - 7, 10,       3);
    ctx.fillStyle = '#c8c0a0';
    ctx.fillRect(cupX + cupW,     cupY + 10, 10,  5);
    ctx.fillRect(cupX + cupW,     cupY + 30, 10,  5);
    ctx.fillRect(cupX + cupW + 6, cupY + 10, 4,  25);

    if (gojiraReady) {
      ctx.strokeStyle = `rgba(0,255,100,${0.4 + Math.sin(now / 180) * 0.4})`;
      ctx.lineWidth = 2;
      ctx.strokeRect(cupX - 2, cupY - 2, cupW + 4, cupH + 4);
    }

    const sOff  = Math.sin(now / 380) * 3;
    const sAlph = 0.35 + Math.sin(now / 290) * 0.15;
    ctx.fillStyle = `rgba(255,255,255,${sAlph})`;
    ctx.fillRect(cx - 10 + sOff,      cupY - 18, 4, 13);
    ctx.fillRect(cx + 2  - sOff,      cupY - 22, 4, 17);
    ctx.fillRect(cx - 18 + sOff * .5, cupY - 13, 3,  8);
  }

  return {
    state, initInput, update, drawWeapon,
    takeDamage, heal, addArmor,
    addScore, addGojiraCharge, addShakeTrauma,
  };
})();
