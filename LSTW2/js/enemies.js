// ============================================================
//  Enemies — All 4 types + boss AI, states, sprite drawing
// ============================================================

const Enemies = (() => {

  // ── Sprite Painter ────────────────────────────────────
  function buildSprites(type) {
    function makeSprite(W, H, drawFn) {
      const c = document.createElement('canvas');
      c.width = W; c.height = H;
      drawFn(c.getContext('2d'), W, H);
      return c;
    }

    const sprites = {};

    if (type === 'spitter') {
      const draw = (ctx, W, H, hurt, dead) => {
        const cx = W/2, cy = H/2 + 4;
        ctx.fillStyle = dead ? '#3a4a30' : (hurt ? '#aaffaa' : '#4a8a40');
        ctx.beginPath(); ctx.arc(cx, cy, 18, 0, Math.PI*2); ctx.fill();
        if (!dead) {
          ctx.strokeStyle = '#206020'; ctx.lineWidth = 2;
          for (let i = 0; i < 8; i++) {
            const a = (i/8)*Math.PI*2;
            ctx.beginPath();
            ctx.moveTo(cx+Math.cos(a)*18, cy+Math.sin(a)*18);
            ctx.lineTo(cx+Math.cos(a)*26, cy+Math.sin(a)*26);
            ctx.stroke();
          }
          ctx.fillStyle = '#ff2020';
          ctx.beginPath(); ctx.arc(cx-7, cy-5, 4, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(cx+7, cy-5, 4, 0, Math.PI*2); ctx.fill();
          ctx.fillStyle = '#000';
          ctx.beginPath(); ctx.arc(cx-7, cy-5, 2, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(cx+7, cy-5, 2, 0, Math.PI*2); ctx.fill();
          ctx.strokeStyle = '#206020'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(cx, cy+5, 6, 0.2, Math.PI-0.2); ctx.stroke();
        } else {
          ctx.strokeStyle = '#ff0000'; ctx.lineWidth = 2;
          [-7,7].forEach(ex => {
            ctx.beginPath(); ctx.moveTo(cx+ex-3,cy-8); ctx.lineTo(cx+ex+3,cy-2); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(cx+ex+3,cy-8); ctx.lineTo(cx+ex-3,cy-2); ctx.stroke();
          });
        }
      };
      sprites.idle   = makeSprite(64, 64, (c,W,H) => draw(c,W,H,false,false));
      sprites.hurt   = makeSprite(64, 64, (c,W,H) => draw(c,W,H,true,false));
      sprites.attack = makeSprite(64, 64, (c,W,H) => { draw(c,W,H,false,false); c.fillStyle='rgba(255,255,0,0.3)'; c.fillRect(0,0,W,H); });
      sprites.death  = makeSprite(64, 64, (c,W,H) => draw(c,W,H,false,true));
    }

    else if (type === 'roller') {
      const draw = (ctx, W, H, hurt, dead) => {
        const cx = W/2, cy = H/2+6;
        ctx.fillStyle = dead ? '#506040' : (hurt ? '#ccffcc' : '#60a050');
        ctx.beginPath(); ctx.arc(cx, cy, 14, 0, Math.PI*2); ctx.fill();
        if (!dead) {
          ctx.strokeStyle = '#304020'; ctx.lineWidth = 2;
          for (let i = 0; i < 12; i++) {
            const a = (i/12)*Math.PI*2;
            ctx.beginPath();
            ctx.moveTo(cx+Math.cos(a)*14, cy+Math.sin(a)*14);
            ctx.lineTo(cx+Math.cos(a)*22, cy+Math.sin(a)*22);
            ctx.stroke();
          }
          ctx.fillStyle = '#ff1010';
          ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI*2); ctx.fill();
        } else {
          ctx.strokeStyle = '#ff4040'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(cx-5,cy-5); ctx.lineTo(cx+5,cy+5); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(cx+5,cy-5); ctx.lineTo(cx-5,cy+5); ctx.stroke();
        }
      };
      sprites.idle   = makeSprite(48, 48, (c,W,H) => draw(c,W,H,false,false));
      sprites.hurt   = makeSprite(48, 48, (c,W,H) => draw(c,W,H,true,false));
      sprites.attack = makeSprite(48, 48, (c,W,H) => { draw(c,W,H,false,false); c.fillStyle='rgba(255,100,0,0.4)'; c.fillRect(0,0,W,H); });
      sprites.death  = makeSprite(48, 48, (c,W,H) => draw(c,W,H,false,true));
    }

    else if (type === 'barrel') {
      const draw = (ctx, W, H, hurt, dead) => {
        const cx = W/2, cy = H*0.55;
        ctx.fillStyle = dead ? '#304828' : (hurt ? '#aaffcc' : '#3a6030');
        ctx.beginPath();
        ctx.ellipse(cx, cy, 16, 22, 0, 0, Math.PI*2); ctx.fill();
        if (!dead) {
          ctx.strokeStyle = '#204018'; ctx.lineWidth = 3;
          [-10, 0, 10].forEach(dy => {
            ctx.beginPath(); ctx.ellipse(cx, cy+dy, 16, 5, 0, 0, Math.PI*2); ctx.stroke();
          });
          ctx.strokeStyle = '#507040'; ctx.lineWidth = 2;
          for (let i = -2; i <= 2; i++) {
            ctx.beginPath(); ctx.moveTo(cx-16, cy+i*6); ctx.lineTo(cx-24, cy+i*6); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(cx+16, cy+i*6); ctx.lineTo(cx+24, cy+i*6); ctx.stroke();
          }
          ctx.fillStyle = '#ff2020';
          ctx.beginPath(); ctx.arc(cx-6, cy-6, 4, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(cx+6, cy-6, 4, 0, Math.PI*2); ctx.fill();
          ctx.fillStyle = '#000';
          ctx.beginPath(); ctx.arc(cx-6, cy-6, 2, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(cx+6, cy-6, 2, 0, Math.PI*2); ctx.fill();
        } else {
          ctx.fillStyle = 'rgba(80,0,0,0.5)'; ctx.fillRect(0,0,W,H);
        }
      };
      sprites.idle   = makeSprite(72, 80, (c,W,H) => draw(c,W,H,false,false));
      sprites.hurt   = makeSprite(72, 80, (c,W,H) => draw(c,W,H,true,false));
      sprites.attack = makeSprite(72, 80, (c,W,H) => { draw(c,W,H,false,false); c.fillStyle='rgba(255,60,0,0.4)'; c.fillRect(0,0,W,H); });
      sprites.death  = makeSprite(72, 80, (c,W,H) => draw(c,W,H,false,true));
    }

    else if (type === 'pricilla') {
      const draw = (ctx, W, H, phase, hurt, dead) => {
        const cx = W/2, cy = H/2;
        const bodyColor = dead ? '#300820' :
                          hurt ? '#ffaacc' :
                          phase === 3 ? '#200010' :
                          phase === 2 ? '#400020' : '#600040';
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.moveTo(cx-24, H-8); ctx.lineTo(cx+24, H-8);
        ctx.lineTo(cx+18, cy+10); ctx.lineTo(cx-18, cy+10);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = dead ? '#503040' : (hurt ? '#ffccdd' : '#f0b0a0');
        ctx.beginPath(); ctx.arc(cx, cy-14, 18, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = dead ? '#403030' : (phase >= 2 ? '#800040' : '#c04060');
        ctx.beginPath();
        ctx.moveTo(cx-18, cy-14);
        ctx.bezierCurveTo(cx-28, cy-52, cx-10, cy-60, cx, cy-58);
        ctx.bezierCurveTo(cx+10, cy-60, cx+28, cy-52, cx+18, cy-14);
        ctx.closePath(); ctx.fill();
        if (!dead) {
          ctx.fillStyle = phase === 3 ? '#ff0000' : '#cc00cc';
          ctx.beginPath(); ctx.arc(cx-7, cy-16, 5, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(cx+7, cy-16, 5, 0, Math.PI*2); ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.beginPath(); ctx.arc(cx-5, cy-17, 2, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(cx+9, cy-17, 2, 0, Math.PI*2); ctx.fill();
          ctx.strokeStyle = '#803050'; ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(cx-8, cy-6);
          ctx.quadraticCurveTo(cx, cy-2, cx+8, cy-6);
          ctx.stroke();
          const clawCol = phase >= 2 ? '#ff0080' : '#cc4080';
          ctx.strokeStyle = clawCol; ctx.lineWidth = 3;
          for (let i = 0; i < 3; i++) {
            ctx.beginPath(); ctx.moveTo(cx-22+i*3, cy+10); ctx.lineTo(cx-26+i*3, cy+24); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(cx+22-i*3, cy+10); ctx.lineTo(cx+26-i*3, cy+24); ctx.stroke();
          }
          if (phase === 3) {
            ctx.strokeStyle = 'rgba(255,0,100,0.6)';
            ctx.lineWidth = 4;
            ctx.beginPath(); ctx.arc(cx, cy, 44, 0, Math.PI*2); ctx.stroke();
          }
        } else {
          ctx.fillStyle = 'rgba(100,0,50,0.6)'; ctx.fillRect(0,0,W,H);
        }
      };
      sprites.idle   = makeSprite(96, 120, (c,W,H) => draw(c,W,H,1,false,false));
      sprites.phase2 = makeSprite(96, 120, (c,W,H) => draw(c,W,H,2,false,false));
      sprites.phase3 = makeSprite(96, 120, (c,W,H) => draw(c,W,H,3,false,false));
      sprites.hurt   = makeSprite(96, 120, (c,W,H) => draw(c,W,H,1,true,false));
      sprites.attack = makeSprite(96, 120, (c,W,H) => { draw(c,W,H,1,false,false); c.fillStyle='rgba(255,0,150,0.4)'; c.fillRect(0,0,W,H); });
      sprites.death  = makeSprite(96, 120, (c,W,H) => draw(c,W,H,1,false,true));
    }

    return sprites;
  }

  // ── Enemy Class ───────────────────────────────────────
  class Enemy {
    constructor(cfg) {
      this.type    = cfg.type;
      this.x       = cfg.x;
      this.y       = cfg.y;
      this.angle   = 0;
      this.state   = 'idle';
      this.dead    = false;
      this.hurtTimer   = 0;
      this.deathTimer  = 0;
      this.stateTimer  = 0;
      this.phase       = 1;
      this._lastFire   = 0;
      this.introPlayed = false;

      switch (cfg.type) {
        case 'spitter':
          this.hp = this.maxHp = C.SPITTER_HP;
          this.speed = C.SPITTER_SPEED;
          this.damage = C.SPITTER_DAMAGE;
          this.fireRate = C.SPITTER_FIRE_RATE;
          this.shotSpeed = C.SPITTER_SHOT_SPEED;
          this.scoreValue = 100;
          break;
        case 'roller':
          this.hp = this.maxHp = C.ROLLER_HP;
          this.speed = C.ROLLER_SPEED;
          this.damage = C.ROLLER_DAMAGE;
          this.fireRate = C.ROLLER_ATTACK_RATE;
          this.scoreValue = 150;
          break;
        case 'barrel':
          this.hp = this.maxHp = C.BARREL_HP;
          this.speed = C.BARREL_SPEED;
          this.damage = C.BARREL_DAMAGE;
          this.fireRate = C.BARREL_FIRE_RATE;
          this.shotSpeed = C.BARREL_SHOT_SPEED;
          this.scoreValue = 250;
          break;
        case 'pricilla':
          this.hp = this.maxHp = C.PRICILLA_HP;
          this.speed = C.PRICILLA_SPEED;
          this.damage = 20;
          this.fireRate = 1500;
          this.shotSpeed = 6;
          this.scoreValue = 5000;
          break;
      }

      this.sprites = buildSprites(cfg.type);
    }

    hit(dmg) {
      if (this.dead) return;
      this.hp -= dmg;
      this.hurtTimer = 0.18;
      this.state = 'hurt';
      Audio2.playEnemyHurt();

      if (this.type === 'pricilla') {
        HUD.showEnemyQuip(Utils.randomQuip(C.PRICILLA_QUIPS_HURT));
        if (this.hp <= C.PRICILLA_PHASE3_HP && this.phase < 3) {
          this.phase = 3;
          HUD.showEnemyQuip(Utils.randomQuip(C.PRICILLA_QUIPS_PHASE3));
          Screens.showDamageFlash('rgba(255,0,100,0.6)');
          Player.addShakeTrauma(0.7);
          this.speed = C.PRICILLA_SPEED * 1.6;
          this.fireRate = 800;
        } else if (this.hp <= C.PRICILLA_PHASE2_HP && this.phase < 2) {
          this.phase = 2;
          HUD.showEnemyQuip(Utils.randomQuip(C.PRICILLA_QUIPS_PHASE2));
          Screens.showDamageFlash('rgba(255,0,100,0.4)');
          Player.addShakeTrauma(0.5);
          this.speed = C.PRICILLA_SPEED * 1.3;
        }
      }

      if (this.hp <= 0) this.die();
    }

    die() {
      this.dead  = true;
      this.state = 'death';
      this.deathTimer = 1.5;
      Player.addScore(this.scoreValue);
      Player.addGojiraCharge(C.GOJIRA_KILL_BONUS);
      Pickups.tryDropPickup(this.x, this.y, this.type);
      GameState.addKill();
      if (this.type === 'pricilla') {
        GameState.setWin();
      } else {
          if (Player.state.gojiraMode) {
                HUD.showPlayerQuip(Utils.randomQuip(C.GOJIRA_MODE_QUIPS));
              } else {
                HUD.showPlayerQuip(Utils.randomQuip(C.PLAYER_KILL_QUIPS));
              }
      }
    }

    update(dt, px, py) {
      if (this.state === 'death') {
        this.deathTimer -= dt;
        return;
      }

      const dx = px - this.x;
      const dy = py - this.y;
      const distToPlayer = Math.sqrt(dx*dx + dy*dy);

      if (this.type === 'pricilla' && !this.introPlayed && distToPlayer < 10) {
        this.introPlayed = true;
        HUD.showEnemyQuip(Utils.randomQuip(C.PRICILLA_QUIPS_IDLE));
        Screens.showDamageFlash('rgba(180,0,100,0.5)');
        Player.addShakeTrauma(0.6);
        Audio2.playGojira();
      }

      if (this.hurtTimer > 0) {
        this.hurtTimer -= dt;
        if (this.hurtTimer <= 0) this.state = distToPlayer < 12 ? 'chase' : 'idle';
        return;
      }

      this.angle = Math.atan2(dy, dx);

      if (distToPlayer > 12) { this.state = 'idle'; return; }

      const hasLOS = checkLOS(this.x, this.y, px, py);
      if (!hasLOS) {
        this.state = 'chase';
        this._moveToward(px, py, dt * this.speed * 0.5);
        return;
      }

      this.state = 'chase';
      const now = performance.now();

      if (this.type === 'roller') {
        if (distToPlayer > C.ROLLER_MELEE_RANGE) {
          this._moveToward(px, py, dt * this.speed);
        } else if (now - this._lastFire > this.fireRate) {
          this._lastFire = now;
          this.state = 'attack';
          Player.takeDamage(this.damage);
        }
      } else {
        const preferredDist = this.type === 'barrel' ? 4.0 : 6.0;
        if (distToPlayer > preferredDist + 1)      this._moveToward(px, py, dt * this.speed);
        else if (distToPlayer < preferredDist - 1) this._moveAway(px, py, dt * this.speed * 0.5);

        if (now - this._lastFire > this.fireRate && distToPlayer < 10) {
          this._lastFire = now;
          this.state = 'attack';
          this._fire(px, py);
          if (this.type === 'pricilla' && this.phase === 3) {
            setTimeout(() => this._fireOffset(px, py,  0.3), 80);
            setTimeout(() => this._fireOffset(px, py, -0.3), 160);
          }
        }
      }
    }

    _moveToward(tx, ty, spd) {
      const ang = Math.atan2(ty - this.y, tx - this.x);
      const nx = this.x + Math.cos(ang) * spd;
      const ny = this.y + Math.sin(ang) * spd;
      const doors = Maps.getDoors();
      if (!doors.isWall(Math.floor(nx), Math.floor(this.y))) this.x = nx;
      if (!doors.isWall(Math.floor(this.x), Math.floor(ny))) this.y = ny;
    }

    _moveAway(tx, ty, spd) {
      this._moveToward(tx + (this.x - tx)*2, ty + (this.y - ty)*2, spd);
    }

    _fire(px, py) {
      const ang = Math.atan2(py - this.y, px - this.x);
      Projectiles.spawnEnemyShot(this.x, this.y, ang, this.damage, this.shotSpeed || 4);
    }

    _fireOffset(px, py, offset) {
      const ang = Math.atan2(py - this.y, px - this.x) + offset;
      Projectiles.spawnEnemyShot(this.x, this.y, ang, this.damage * 0.7, this.shotSpeed || 4);
    }

    getSprite() {
      if (this.state === 'death') return this.sprites.death;
      if (this.hurtTimer > 0)    return this.sprites.hurt;
      if (this.state === 'attack') return this.sprites.attack;
      if (this.type === 'pricilla') {
        if (this.phase === 3 && this.sprites.phase3) return this.sprites.phase3;
        if (this.phase === 2 && this.sprites.phase2) return this.sprites.phase2;
      }
      return this.sprites.idle;
    }
  }

  // ── Line of Sight ─────────────────────────────────────
  function checkLOS(x1, y1, x2, y2) {
    const steps = 20;
    const doors = Maps.getDoors();
    for (let i = 1; i < steps; i++) {
      const t  = i / steps;
      const mx = Math.floor(x1 + (x2 - x1) * t);
      const my = Math.floor(y1 + (y2 - y1) * t);
      if (doors.isWall(mx, my)) return false;
    }
    return true;
  }

  // ── Public API ────────────────────────────────────────
  let enemies = [];

  function spawnForLevel(levelData) {
    enemies = levelData.enemies.map(cfg => new Enemy(cfg));
  }

  function update(dt) {
    const ps = Player.state;
    for (const e of enemies) {
      e.update(dt, ps.x, ps.y);
    }
    enemies = enemies.filter(e => !e.dead || e.deathTimer > 0);
  }

  function getAll() { return enemies; }

  return { spawnForLevel, update, getAll };
})();