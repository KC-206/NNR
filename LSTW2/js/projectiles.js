// ============================================================
//  Projectiles — Player shots, grenades, enemy shots, Gojira
// ============================================================

const Projectiles = (() => {

  let list      = [];
  let particles = [];
  const MAX_PARTICLES = 80; // hard cap — never let this grow large

  // ── Spawn ─────────────────────────────────────────────
  // NOTE: caller now passes already-offset muzzle x,y
  function spawnPlayerShot(x, y, angle) {
    list.push({
      kind:'coffee', x, y,
      vx: Math.cos(angle) * C.COFFEE_SPEED,
      vy: Math.sin(angle) * C.COFFEE_SPEED,
      damage: C.COFFEE_DAMAGE,
      alive: true, owner:'player', age:0,
    });
  }

  function spawnBaguette(x, y, angle) {
    list.push({
      kind:'baguette', x, y,
      vx: Math.cos(angle) * C.BAGUETTE_SPEED,
      vy: Math.sin(angle) * C.BAGUETTE_SPEED,
      vz: 0.18, z: 0,
      damage: C.BAGUETTE_DAMAGE,
      splash: C.BAGUETTE_SPLASH_R,
      alive: true, owner:'player', age:0,
    });
  }

  function spawnGojira(x, y, angle) {
    list.push({
      kind:'gojira', x, y,
      vx: Math.cos(angle) * 14,
      vy: Math.sin(angle) * 14,
      damage: C.GOJIRA_DAMAGE,
      splash: C.GOJIRA_SPLASH_R,
      alive: true, owner:'player', age:0,
    });
  }
// Gojira Lightning Attack //
  function spawnLightning(x, y, angle) {
    list.push({
      kind: 'lightning', x, y,
      vx: Math.cos(angle) * C.GOJIRA_LIGHTNING_SPEED,
      vy: Math.sin(angle) * C.GOJIRA_LIGHTNING_SPEED,
      damage: C.GOJIRA_LIGHTNING_DAMAGE,
      splash: C.GOJIRA_LIGHTNING_SPLASH,
      alive: true, owner: 'player', age: 0,
    });
  }

  function spawnEnemyShot(x, y, angle, damage, speed) {
    list.push({
      kind:'enemyshot', x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      damage, alive:true, owner:'enemy', age:0,
    });
  }

  // ── Particles — spawn sparingly ───────────────────────
  function spawnTrailParticle(x, y, kind) {
    if (particles.length >= MAX_PARTICLES) return; // don't add if at cap
    const isEnemy = kind === 'enemyshot';
    particles.push({
      x, y,
      vx: (Math.random()-0.5)*0.03,
      vy: (Math.random()-0.5)*0.03,
      life: C.TRAIL_LIFE, maxLife: C.TRAIL_LIFE,
      r: isEnemy ? 0   : 80,
      g: isEnemy ? 200 : 50,
      b: isEnemy ? 0   : 0,
      size: 0.05,
    });
  }

  function spawnExplosion(x, y, radius, color) {
    Audio2.playExplosion();
    Player.addShakeTrauma(0.6);
    const count = Math.min(C.EXPLOSION_PARTICLES, MAX_PARTICLES - particles.length);
    for (let i = 0; i < count; i++) {
      const ang = (i / count) * Math.PI * 2 + Math.random() * 0.3;
      const spd = 0.05 + Math.random() * 0.1;
      const [er, eg, eb] = color || [255, 140, 30];
      particles.push({
        x: x + (Math.random()-0.5)*0.3,
        y: y + (Math.random()-0.5)*0.3,
        vx: Math.cos(ang)*spd, vy: Math.sin(ang)*spd,
        life: 20+Math.random()*15, maxLife: 35,
        r:er, g:eg, b:eb, size:0.07,
        gravity: 0.002,
      });
    }
  }

  // ── Collision helpers ─────────────────────────────────
  function checkPlayerHits(enemies) {
    for (const p of list) {
      if (!p.alive || p.owner !== 'player') continue;
      for (const e of enemies) {
        if (e.dead) continue;
        const d2 = Utils.dist2(p.x, p.y, e.x, e.y);
        const isAoe = p.kind === 'baguette' || p.kind === 'gojira';
        const hitR  = isAoe ? (p.splash * p.splash) : 0.36;

        if (d2 < hitR) {
          if (isAoe) {
            for (const t of enemies) {
              if (!t.dead) {
                const td = Utils.dist(p.x, p.y, t.x, t.y);
                if (td < p.splash) {
                  const dmg = Math.round(p.damage * (1 - td / p.splash));
                  t.hit(dmg);
                  HUD.spawnDmgNum(
                    C.SCREEN_W/2 + (Math.random()*60-30),
                    C.SCREEN_H/2 - 40,
                    dmg, td < 0.5 ? 'crit' : 'dmg-num'
                  );
                }
              }
            }
            spawnExplosion(p.x, p.y, p.splash,
              p.kind === 'gojira' ? [0,255,100] : [255,140,30]);
          } else {
            e.hit(p.damage);
            HUD.spawnDmgNum(
              C.SCREEN_W/2 + (Math.random()*50-25),
              C.SCREEN_H/2 - 30,
              p.damage, 'dmg-num'
            );
          }
          p.alive = false;
          break;
        }
      }
    }
  }

  function checkEnemyHits() {
    const ps = Player.state;
    for (const p of list) {
      if (!p.alive || p.owner !== 'enemy') continue;
      if (Utils.dist2(p.x, p.y, ps.x, ps.y) < 0.09) {
        Player.takeDamage(p.damage);
        p.alive = false;
      }
    }
  }

  function checkWallHits() {
    const doors = Maps.getDoors();
    for (const p of list) {
      if (!p.alive) continue;
      if (doors.isWall(Math.floor(p.x), Math.floor(p.y))) {
        if (p.kind === 'baguette' || p.kind === 'gojira') {
          spawnExplosion(p.x, p.y, p.splash,
            p.kind === 'gojira' ? [0,255,100] : [255,140,30]);
        }
        p.alive = false;
      }
    }
  }

  // ── Update ────────────────────────────────────────────
  function update(dt, enemies) {
    for (const p of list) {
      if (!p.alive) continue;
      p.age += dt;

      if (Math.random() < 0.12 && particles.length < MAX_PARTICLES) {
        spawnTrailParticle(p.x, p.y, p.kind);
      }

      if (p.kind === 'baguette') {
        p.vz -= C.BAGUETTE_GRAVITY;
        p.z  += p.vz;
        if (p.z <= 0 && p.age > 0.2) {
          spawnExplosion(p.x, p.y, p.splash);
          for (const e of enemies) {
            if (!e.dead) {
              const td = Utils.dist(p.x, p.y, e.x, e.y);
              if (td < p.splash) e.hit(Math.round(p.damage*(1-td/p.splash)));
            }
          }
          p.alive = false;
          continue;
        }
      }

      if (p.age > 3) { p.alive = false; continue; }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }

    checkWallHits();
    checkPlayerHits(enemies);
    checkEnemyHits();

    for (const pt of particles) {
      pt.life--;
      pt.x += pt.vx;
      pt.y += pt.vy;
      if (pt.gravity) pt.vy += pt.gravity;
    }

    list      = list.filter(p => p.alive);
    particles = particles.filter(pt => pt.life > 0);
  }

  function reset()         { list = []; particles = []; }
  function getAll()        { return list; }
  function getParticles()  { return particles; }

  return {
    spawnPlayerShot, spawnBaguette, spawnGojira, spawnEnemyShot, spawnLightning,
    update, reset, getAll, getParticles,
  };
})();
