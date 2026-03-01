// ============================================================
//  Renderer — Raycasting engine, textures, sprite billboard
// ============================================================

const Renderer = (() => {

  let gameCanvas, ctx;
  let imageData, buf32;
  const zBuffer = new Float32Array(C.SCREEN_W);

  function init(canvas) {
    gameCanvas = canvas;
    ctx = canvas.getContext('2d');
    imageData = ctx.createImageData(C.SCREEN_W, C.SCREEN_H);
    buf32 = new Uint32Array(imageData.data.buffer);
  }

  function rgba(r, g, b, a) {
    return ((a&0xff)<<24)|((b&0xff)<<16)|((g&0xff)<<8)|(r&0xff);
  }

  function getTorchBoost(mx, my, time, torchWalls) {
    if (!torchWalls) return 0;
    for (const [tx, ty] of torchWalls) {
      const d2 = (mx-tx)*(mx-tx)+(my-ty)*(my-ty);
      if (d2 < 9) {
        const flicker = Utils.smoothNoise1D(time * C.TORCH_FLICKER_SPEED + tx*3.7);
        return (1 - d2/9) * (flicker * C.TORCH_FLICKER_AMP + 0.1);
      }
    }
    return 0;
  }

  // ── Main Render ───────────────────────────────────────
  function render(player, level) {
    const W      = C.SCREEN_W;
    const RH     = C.SCREEN_H;
    const halfRH = RH / 2;
    const px     = player.x + player.shakeX / 60;
    const py     = player.y + player.shakeY / 60;
    const ang    = player.angle;
    const pal    = C.PALETTE[level.paletteIndex] || C.PALETTE[0];
    const textures   = Maps.getTextures();
    const doors      = Maps.getDoors();
    const torchWalls = level.torchWalls;
    const time       = performance.now() / 1000;

    // ── Floor & Ceiling ───────────────────────────────
    for (let y = 0; y < RH; y++) {
      const isCeil  = y < halfRH;
      const rowDist = halfRH / (Math.abs(y - halfRH) + 0.001);
      const t = y / RH;
      let baseR, baseG, baseB;

      if (isCeil) {
        const [c1r,c1g,c1b] = Utils.hexToRgb(pal.ceiling[0]);
        const [c2r,c2g,c2b] = Utils.hexToRgb(pal.ceiling[1]);
        const ft = t * 2;
        baseR = Utils.lerp(c1r,c2r,ft);
        baseG = Utils.lerp(c1g,c2g,ft);
        baseB = Utils.lerp(c1b,c2b,ft);
      } else {
        const [f1r,f1g,f1b] = Utils.hexToRgb(pal.floor[0]);
        const [f2r,f2g,f2b] = Utils.hexToRgb(pal.floor[1]);
        const ft = (t - 0.5) * 2;
        baseR = Utils.lerp(f1r,f2r,ft);
        baseG = Utils.lerp(f1g,f2g,ft);
        baseB = Utils.lerp(f1b,f2b,ft);
      }
      const shade = Math.max(0.05, 1 - rowDist / C.MAX_DEPTH * 0.6);
      const pr = baseR*shade|0, pg = baseG*shade|0, pb = baseB*shade|0;
      const rowOffset = y * W;
      for (let x = 0; x < W; x++) buf32[rowOffset + x] = rgba(pr, pg, pb, 255);
    }

    // ── Walls (DDA) ───────────────────────────────────
    for (let col = 0; col < W; col++) {
      const rayAngle = ang - C.HALF_FOV + (col / W) * C.FOV;
      const cosRay = Math.cos(rayAngle);
      const sinRay = Math.sin(rayAngle);

      let mapX = Math.floor(px), mapY = Math.floor(py);
      const deltaX = Math.abs(1 / (cosRay || 0.00001));
      const deltaY = Math.abs(1 / (sinRay || 0.00001));

      let stepX, sideDistX, stepY, sideDistY;
      if (cosRay < 0) { stepX=-1; sideDistX=(px-mapX)*deltaX; }
      else            { stepX= 1; sideDistX=(mapX+1-px)*deltaX; }
      if (sinRay < 0) { stepY=-1; sideDistY=(py-mapY)*deltaY; }
      else            { stepY= 1; sideDistY=(mapY+1-py)*deltaY; }

      let hit=false, side=0, cellVal=0;
      for (let depth = 0; depth < C.MAX_DEPTH * 2; depth++) {
        if (sideDistX < sideDistY) { sideDistX+=deltaX; mapX+=stepX; side=0; }
        else                       { sideDistY+=deltaY; mapY+=stepY; side=1; }
        cellVal = doors.getCell(mapX, mapY);
        if (cellVal > 0) {
          if (cellVal === 6 && doors.isDoorOpen(mapX, mapY)) continue;
          hit = true; break;
        }
      }

      if (!hit) { zBuffer[col] = C.MAX_DEPTH; continue; }

      const perpDist = Math.max(0.1, side === 0 ? sideDistX-deltaX : sideDistY-deltaY);
      zBuffer[col] = perpDist;

      const wallH   = Math.min(RH * 2, (RH / perpDist) * C.WALL_H_SCALE) | 0;
      const wallTop = Math.max(0,    (halfRH - wallH/2) | 0);
      const wallBot = Math.min(RH-1, (halfRH + wallH/2) | 0);

      let wallX = (side === 0 ? py + perpDist*sinRay : px + perpDist*cosRay);
      wallX -= Math.floor(wallX);

      // Choose texture based on tile:
      // 1–6 use their own textures, 9 = exit panel, fallback to 2 otherwise.
      let texKey;
      if (cellVal >= 1 && cellVal <= 6) {
        texKey = cellVal;
      } else if (cellVal === 9) {
        texKey = 9;
      } else {
        texKey = 2;
      }

      const tex = textures[texKey];
      if (!tex) { zBuffer[col] = perpDist; continue; }

      const texColX = Math.floor(wallX * C.TEXTURE_SIZE);
      const torch   = getTorchBoost(mapX, mapY, time, torchWalls);

      for (let y = wallTop; y < wallBot; y++) {
        const texColY = Math.floor(((y - wallTop) / (wallBot - wallTop)) * C.TEXTURE_SIZE);
        const ti      = (texColY * C.TEXTURE_SIZE + texColX) * 4;
        let r = tex.data[ti], g = tex.data[ti+1], b = tex.data[ti+2];
        let shade = Math.max(0, 1 - perpDist / C.MAX_DEPTH * 1.3) + torch;
        if (side === 1) shade *= 0.72;
        shade = Utils.clamp(shade, 0, 1.2);
        buf32[y * W + col] = rgba(r*shade|0, g*shade|0, b*shade|0, 255);
      }
    }

    ctx.putImageData(imageData, 0, 0);
    renderSprites(px, py, ang, level);
    renderParticles(px, py, ang);
    Player.drawWeapon(ctx, player.gojiraCharge >= 100);
  }

  // ── Sprite Billboard ──────────────────────────────────
  function renderSprites(px, py, ang, level) {
    const enemies = Enemies.getAll();
    const pickups = Pickups.getAll();
    const projs   = Projectiles.getAll();
    const midY    = C.SCREEN_H / 2;
    const time    = performance.now() / 1000;

    const sprites = [];

    for (const e of enemies) {
      const proj = Utils.project(e.x, e.y, px, py, ang);
      if (proj) sprites.push({...proj, kind:'enemy', ref:e});
    }
    for (const pk of pickups) {
      if (!pk.alive) continue;
      const bobY = Math.sin(pk.bobPhase) * 0.08;
      const proj = Utils.project(pk.x, pk.y + bobY, px, py, ang);
      if (proj) sprites.push({...proj, kind:'pickup', ref:pk});
    }
    for (const p of projs) {
      const proj = Utils.project(p.x, p.y, px, py, ang);
      if (proj) sprites.push({...proj, kind:'proj', ref:p});
    }

    sprites.sort((a, b) => b.dist - a.dist);

    for (const sp of sprites) {
      const { dist, kind, ref } = sp;
      const sx    = sp.sx;
      const scale = Math.min(sp.scale, 6);
      const zIdx  = Utils.clamp(Math.floor(sx), 0, C.SCREEN_W - 1);

      if (!isFinite(sx) || !isFinite(scale)) continue;

      if (kind === 'enemy') {
        const img = ref.getSprite();
        if (!img) continue;
        const spriteW = Math.min(img.width  * scale * 0.7, 300);
        const spriteH = Math.min(img.height * scale * 0.7, 400);
        const drawX   = sx - spriteW / 2;
        const drawY   = midY - spriteH / 2;
        if (drawX + spriteW < 0 || drawX > C.SCREEN_W) continue;
        if (dist > zBuffer[zIdx] + 0.5) continue;
        ctx.globalAlpha = 1;
        ctx.drawImage(img, drawX, drawY, spriteW, spriteH);
        if (!ref.dead && ref.hp < ref.maxHp) {
          const barW = spriteW * 0.8, barX = sx - barW/2, barY = drawY - 10;
          ctx.fillStyle = '#400'; ctx.fillRect(barX, barY, barW, 5);
          ctx.fillStyle = '#0f0'; ctx.fillRect(barX, barY, barW * (ref.hp/ref.maxHp), 5);
        }
      }

      else if (kind === 'pickup') {
        const img = Pickups.getSprite(ref.type);
        if (!img) continue;
        const sw = Math.min(img.width  * scale * 0.5, 80);
        const sh = Math.min(img.height * scale * 0.5, 80);
        const dx = sx - sw / 2;
        const dy = midY - sh / 2;
        if (dx + sw < 0 || dx > C.SCREEN_W) continue;
        if (dist > zBuffer[zIdx] + 0.3) continue;
        ctx.globalAlpha = 0.7 + Math.sin(time * 3) * 0.3;
        ctx.drawImage(img, dx, dy, sw, sh);
        ctx.globalAlpha = 1;
      }

      else if (kind === 'proj') {
        if (dist > zBuffer[zIdx] + 1.5) continue;

        const r = Utils.clamp(scale * 0.25, 2, 14);

        const midY   = C.SCREEN_H / 2;
        const bottom = C.SCREEN_H * 0.80;
        const t      = Utils.clamp(dist / 8, 0, 1);
        const cy     = bottom - (bottom - midY) * t;

        if (ref.kind === 'coffee') {
          const img = Pickups.getSprite('armor');
          if (!img) {
            ctx.fillStyle = '#3a1a00';
            ctx.beginPath(); ctx.arc(sx, cy, r, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#c08040';
            ctx.beginPath(); ctx.arc(sx - r*0.3, cy - r*0.3, r*0.4, 0, Math.PI*2); ctx.fill();
          } else {
            const baseSize = 18;
            const sw = baseSize * (r / 6);
            const sh = baseSize * (r / 6);
            const dx = sx - sw / 2;
            const dy = cy - sh / 2;
            if (dx + sw < 0 || dx > C.SCREEN_W) continue;
            ctx.globalAlpha = 1;
            ctx.drawImage(img, dx, dy, sw, sh);
          }
        } else if (ref.kind === 'lightning') {
          const gr = Math.min(r * 1.5, 18);
          const grd = ctx.createRadialGradient(sx, cy, 0, sx, cy, gr * 2);
          grd.addColorStop(0,   'rgba(180,255,100,1)');
          grd.addColorStop(0.4, 'rgba(0,255,80,0.8)');
          grd.addColorStop(1,   'rgba(0,180,50,0)');
          ctx.fillStyle = grd;
          ctx.beginPath(); ctx.arc(sx, cy, gr * 2, 0, Math.PI*2); ctx.fill();
          ctx.strokeStyle = 'rgba(220,255,150,0.9)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(sx - gr, cy);
          for (let i = 1; i <= 6; i++) {
            ctx.lineTo(
              sx - gr + (i / 6) * gr * 2,
              cy + (Math.random() - 0.5) * gr
            );
          }
          ctx.lineTo(sx + gr, cy);
          ctx.stroke();
        } else if (ref.kind === 'enemyshot') {
          const grd = ctx.createRadialGradient(sx, cy, 0, sx, cy, r*1.5);
          grd.addColorStop(0, 'rgba(100,255,100,1)');
          grd.addColorStop(1, 'rgba(0,200,0,0)');
          ctx.fillStyle = grd;
          ctx.beginPath(); ctx.arc(sx, cy, r*1.5, 0, Math.PI*2); ctx.fill();
        } else if (ref.kind === 'baguette') {
          ctx.fillStyle = '#d4a050';
          ctx.fillRect(sx - r, cy - r*0.4, r*2, r*0.8);
        } else if (ref.kind === 'gojira') {
          const gr  = Math.min(r, 10);
          const grd = ctx.createRadialGradient(sx, cy, 0, sx, cy, gr*2);
          grd.addColorStop(0, 'rgba(0,255,100,0.9)');
          grd.addColorStop(1, 'rgba(0,100,50,0)');
          ctx.fillStyle = grd;
          ctx.beginPath(); ctx.arc(sx, cy, gr*2, 0, Math.PI*2); ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

    }
  }

  // ── Particle Rendering ────────────────────────────────
  function renderParticles(px, py, ang) {
    const particles = Projectiles.getParticles();
    const midY = C.SCREEN_H / 2;
    for (const pt of particles) {
      const proj = Utils.project(pt.x, pt.y, px, py, ang);
      if (!proj) continue;
      const { sx, dist } = proj;
      if (!isFinite(sx)) continue;
      const scale = Math.min(proj.scale, 6);
      const zIdx  = Utils.clamp(Math.floor(sx), 0, C.SCREEN_W - 1);
      if (dist > zBuffer[zIdx] + 0.5) continue;
      const alpha = pt.life / pt.maxLife;
      const r     = Utils.clamp(scale * pt.size * 8, 1, 8);
      ctx.globalAlpha = alpha * 0.8;
      ctx.fillStyle = `rgb(${pt.r|0},${pt.g|0},${pt.b|0})`;
      ctx.beginPath(); ctx.arc(sx, midY, r, 0, Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  return { init, render };
})();
