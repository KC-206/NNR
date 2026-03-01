// ============================================================
//  Pickups — All pickup types, bob animation, billboard render
// ============================================================


const ArmorSprite = new Image();
ArmorSprite.src = 'armor.png';  

const BaguetteSprite = new Image();
BaguetteSprite.src = 'baguette.png'; 

const CoffeeSprite = new Image();
CoffeeSprite.src = 'coffee.png';  

const KeySprite = new Image();
KeySprite.src = 'key.png';  


const Pickups = (() => {

  let list = [];

  // ── Spawn from level data ──────────────────────────────
  function spawnForLevel(levelData) {
    list = levelData.pickups.map(cfg => ({
      type: cfg.type,
      x: cfg.x,
      y: cfg.y,
      bobPhase: Math.random() * Math.PI * 2,
      alive: true,
      collected: false,
    }));
  }

  // ── Random drop on enemy death ─────────────────────────
  function tryDropPickup(x, y, enemyType) {
    const roll = Math.random();
    let type = null;
    if (enemyType === 'barrel' && roll < 0.4)  type = 'armor';
    else if (roll < 0.35)                       type = 'coffee';
    else if (roll < 0.45)                       type = 'baguette';
    if (type) list.push({ type, x, y, bobPhase: 0, alive: true, collected: false });
  }

  // ── Pickup Sprites (procedural) ────────────────────────
  const spriteCache = {};

  function getSprite(type) {
    if (spriteCache[type]) return spriteCache[type];
    const c = document.createElement('canvas');
    c.width = c.height = 48;
    const ctx = c.getContext('2d');

    if (type === 'coffee') {
      if (CoffeeSprite && CoffeeSprite.complete && CoffeeSprite.naturalWidth > 0) {
        spriteCache[type] = CoffeeSprite;
        return CoffeeSprite;
      }
      // Cup body
      ctx.fillStyle = '#f0e0c0';
      ctx.beginPath();
      ctx.moveTo(10, 12); ctx.lineTo(38, 12);
      ctx.lineTo(34, 42); ctx.lineTo(14, 42);
      ctx.closePath(); ctx.fill();
      // Coffee liquid
      ctx.fillStyle = '#3a1a00';
      ctx.fillRect(12, 14, 24, 10);
      // Crema
      ctx.fillStyle = '#c08040';
      ctx.beginPath(); ctx.ellipse(24, 14, 12, 4, 0, 0, Math.PI*2); ctx.fill();
      // Handle
      ctx.strokeStyle = '#d0c0a0'; ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(38, 27, 8, -Math.PI/2, Math.PI/2);
      ctx.stroke();
      // Steam
      ctx.strokeStyle = 'rgba(200,200,200,0.7)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(19,10); ctx.bezierCurveTo(15,4,23,1,19,-2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(29,10); ctx.bezierCurveTo(25,4,33,1,29,-2); ctx.stroke();
    }

   else if (type === 'armor') {
      // Use file sprite instead of procedural
      if (ArmorSprite && ArmorSprite.complete && ArmorSprite.naturalWidth > 0) {
        spriteCache[type] = ArmorSprite;
        return ArmorSprite;
      }
      // Fallback: keep your old procedural shield until the image loads
      ctx.fillStyle = '#8090b0';
      ctx.beginPath();
      ctx.moveTo(24, 4);
      ctx.lineTo(40, 12);
      ctx.lineTo(40, 28);
      ctx.lineTo(24, 44);
      ctx.lineTo(8, 28);
      ctx.lineTo(8, 12);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#a0b0d0';
      ctx.beginPath();
      ctx.moveTo(24, 10);
      ctx.lineTo(34, 16);
      ctx.lineTo(34, 26);
      ctx.lineTo(24, 36);
      ctx.lineTo(14, 26);
      ctx.lineTo(14, 16);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#c0d0f0';
      ctx.beginPath(); ctx.arc(24, 24, 5, 0, Math.PI*2); ctx.fill();
    }

    else if (type === 'baguette') {
      // Use file sprite instead of procedural
      if (BaguetteSprite && BaguetteSprite.complete && BaguetteSprite.naturalWidth > 0) {
        spriteCache[type] = BaguetteSprite;
        return BaguetteSprite;
      }
      ctx.save(); ctx.translate(24,24); ctx.rotate(-0.5);
      ctx.fillStyle = '#d4a050';
      ctx.beginPath();
      ctx.ellipse(0, 0, 20, 7, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#c08030';
      ctx.beginPath();
      ctx.ellipse(0, -2, 18, 5, 0, 0, Math.PI*2); ctx.fill();
      // Score lines
      ctx.strokeStyle = '#a06020'; ctx.lineWidth = 1.5;
      [-8,-2,4,10].forEach(x => {
        ctx.beginPath();
        ctx.moveTo(x, -5); ctx.lineTo(x+4, 5); ctx.stroke();
      });
      ctx.restore();
    }

    else if (type === 'key') {
      if (KeySprite && KeySprite.complete && KeySprite.naturalWidth > 0) {
        spriteCache[type] = KeySprite;
        return KeySprite;
      }
      ctx.fillStyle = '#f0c020';
      ctx.beginPath(); ctx.arc(16, 20, 10, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#c09000';
      ctx.beginPath(); ctx.arc(16, 20, 6, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#f0c020';
      ctx.fillRect(24, 17, 16, 6);
      ctx.fillRect(32, 23, 4, 6);
      ctx.fillRect(37, 23, 4, 6);
    }

    else if (type === 'energy') {
      // Green energy canister
      ctx.fillStyle = '#20a040';
      ctx.fillRect(14, 8, 20, 32);
      ctx.fillStyle = '#10601a';
      ctx.fillRect(14, 8, 20, 4);
      ctx.fillRect(14, 36, 20, 4);
      ctx.fillStyle = '#60ff80';
      ctx.fillRect(18, 14, 12, 20);
      ctx.fillStyle = '#fff';
      ctx.fillRect(20, 16, 8, 3);
      ctx.fillRect(20, 22, 8, 3);
      ctx.fillRect(20, 28, 8, 3);
    }

    spriteCache[type] = c;
    return c;
  }

  // ── Update ─────────────────────────────────────────────
  function update(dt) {
    const ps = Player.state;
    for (const pk of list) {
      if (!pk.alive) continue;
      pk.bobPhase += dt * 2.5;

      // Pickup radius check
      const d2 = Utils.dist2(ps.x, ps.y, pk.x, pk.y);
      if (d2 < 0.4 * 0.4) {
        collect(pk);
      }
    }
    list = list.filter(pk => pk.alive);
  }

  function collect(pk) {
    pk.alive = false;
    switch (pk.type) {
      case 'coffee':
        Player.heal(C.COFFEE_CUP_HEAL);
        Audio2.playPickup('health');
        break;
      case 'armor':
        Player.addArmor(C.ARMOR_SHARD_AMOUNT);
        Audio2.playPickup('armor');
        break;
      case 'baguette':
        Player.state.baguettes = Math.min(99, Player.state.baguettes + 2);
        Audio2.playPickup('ammo');
        break;
      case 'key':
        Player.state.hasKey = true;
        Audio2.playPickup('key');
        HUD.showPlayerQuip("I found a key! Time to move on!");
        break;
      case 'energy':
        Player.addGojiraCharge(C.ENERGY_CANISTER_AMOUNT);
        Audio2.playPickup('energy');
        break;
    }
  }

  function reset() { list = []; }
  function getAll() { return list; }

  return {
    spawnForLevel, tryDropPickup, getSprite,
    update, reset, getAll,
  };
})();