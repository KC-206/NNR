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
  const draw = (ctx, W, H, hurt, dead, attacking) => {
    const cx = W / 2, cy = H / 2 + 6;

    // ── Colors ──
    const bodyCol  = dead ? '#3a4a30' : hurt ? '#b0ffb0' : '#3a7a34';
    const darkCol  = dead ? '#2a3a20' : hurt ? '#80dd80' : '#265a22';
    const lightCol = dead ? '#4a5a38' : hurt ? '#d0ffd0' : '#58a050';
    const spineCol = dead ? '#2a3a20' : '#1a4418';

    // ── BODY — segmented barrel cactus ──
    // Main body
    ctx.fillStyle = bodyCol;
    ctx.beginPath();
    ctx.roundRect(cx - 16, cy - 20, 32, 38, 8);
    ctx.fill();

    // Vertical rib shading (cactus segments)
    ctx.fillStyle = darkCol;
    ctx.fillRect(cx - 16, cy - 20, 5, 38);
    ctx.fillRect(cx + 11, cy - 20, 5, 38);
    ctx.fillStyle = lightCol;
    ctx.fillRect(cx - 4, cy - 20, 8, 38);

    // Horizontal band lines
    ctx.strokeStyle = darkCol; ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(cx - 16, cy - 10 + i * 12);
      ctx.lineTo(cx + 16, cy - 10 + i * 12);
      ctx.stroke();
    }

    // Rounded top cap
    ctx.fillStyle = bodyCol;
    ctx.beginPath();
    ctx.ellipse(cx, cy - 20, 16, 8, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = lightCol;
    ctx.beginPath();
    ctx.ellipse(cx, cy - 22, 8, 4, 0, Math.PI, 0);
    ctx.fill();

    // Flat bottom
    ctx.fillStyle = darkCol;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 18, 16, 5, 0, 0, Math.PI);
    ctx.fill();

    if (!dead) {
      // ── ARMS — stubby cactus stumps ──
      // Left arm
      ctx.fillStyle = bodyCol;
      ctx.beginPath();
      ctx.roundRect(cx - 28, cy - 8, 14, 10, 4);
      ctx.fill();
      ctx.fillStyle = darkCol;
      ctx.fillRect(cx - 28, cy - 8, 4, 10);
      ctx.fillStyle = lightCol;
      ctx.fillRect(cx - 22, cy - 8, 4, 10);
      // Left arm cap
      ctx.fillStyle = bodyCol;
      ctx.beginPath();
      ctx.ellipse(cx - 21, cy - 8, 7, 4, 0, Math.PI, 0);
      ctx.fill();

      // Right arm
      ctx.fillStyle = bodyCol;
      ctx.beginPath();
      ctx.roundRect(cx + 14, cy - 8, 14, 10, 4);
      ctx.fill();
      ctx.fillStyle = darkCol;
      ctx.fillRect(cx + 24, cy - 8, 4, 10);
      ctx.fillStyle = lightCol;
      ctx.fillRect(cx + 18, cy - 8, 4, 10);
      // Right arm cap
      ctx.fillStyle = bodyCol;
      ctx.beginPath();
      ctx.ellipse(cx + 21, cy - 8, 7, 4, 0, Math.PI, 0);
      ctx.fill();

      // ── SPINES — short sharp lines ──
      ctx.strokeStyle = spineCol; ctx.lineWidth = 1.5;
      // Body spines
      const bodySpines = [
        [-18,-14,-24,-18],[-18,-2,-24,-2],[-18,10,-24,14],
        [18,-14,24,-18],[18,-2,24,-2],[18,10,24,14],
        [-4,-28,0,-34],[4,-28,0,-34],
        [-8,-28,-10,-34],[8,-28,10,-34],
      ];
      bodySpines.forEach(([x1,y1,x2,y2]) => {
        ctx.beginPath();
        ctx.moveTo(cx+x1, cy+y1);
        ctx.lineTo(cx+x2, cy+y2);
        ctx.stroke();
      });
      // Arm spines
      [[-26,-12,-28,-17],[-26,-6,-28,-10],[20,-12,22,-17],[20,-6,22,-10]].forEach(([x1,y1,x2,y2]) => {
        ctx.beginPath();
        ctx.moveTo(cx+x1, cy+y1);
        ctx.lineTo(cx+x2, cy+y2);
        ctx.stroke();
      });

      // ── EYES — angry/mean ──
      // Whites
      ctx.fillStyle = '#fff8e8';
      ctx.beginPath(); ctx.roundRect(cx - 12, cy - 16, 9, 8, 2); ctx.fill();
      ctx.beginPath(); ctx.roundRect(cx + 3,  cy - 16, 9, 8, 2); ctx.fill();

      // Angry brow crease
      ctx.fillStyle = darkCol;
      ctx.beginPath();
      ctx.moveTo(cx - 13, cy - 18); ctx.lineTo(cx - 3, cy - 16);
      ctx.lineTo(cx - 3, cy - 15); ctx.lineTo(cx - 13, cy - 17);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + 13, cy - 18); ctx.lineTo(cx + 3, cy - 16);
      ctx.lineTo(cx + 3, cy - 15); ctx.lineTo(cx + 13, cy - 17);
      ctx.closePath(); ctx.fill();

      // Irises
      const irisCol = attacking ? '#ff6600' : '#cc2200';
      ctx.fillStyle = irisCol;
      ctx.beginPath(); ctx.arc(cx - 8,  cy - 12, 3, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 7,  cy - 12, 3, 0, Math.PI*2); ctx.fill();

      // Pupils
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.arc(cx - 8,  cy - 12, 1.5, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 7,  cy - 12, 1.5, 0, Math.PI*2); ctx.fill();

      // Catchlights
      ctx.fillStyle = '#fff';
      ctx.fillRect(cx - 9, cy - 14, 2, 2);
      ctx.fillRect(cx + 6, cy - 14, 2, 2);

      // ── MOUTH — snarling spit mouth ──
      if (attacking) {
        // Open, spitting
        ctx.fillStyle = '#1a0000';
        ctx.beginPath(); ctx.roundRect(cx - 9, cy - 4, 18, 10, 3); ctx.fill();
        // Tongue / spit energy
        ctx.fillStyle = '#60ff40';
        ctx.beginPath(); ctx.arc(cx, cy + 2, 4, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = 'rgba(96,255,64,0.5)';
        ctx.beginPath(); ctx.arc(cx, cy + 2, 7, 0, Math.PI*2); ctx.fill();
        // Teeth
        ctx.fillStyle = '#f0e8c0';
        for (let i = 0; i < 4; i++) {
          ctx.fillRect(cx - 8 + i * 5, cy - 4, 3, 4);
          ctx.fillRect(cx - 7 + i * 5, cy + 6, 3, 4);
        }
      } else {
        // Resting sneer
        ctx.fillStyle = '#1a0000';
        ctx.beginPath(); ctx.roundRect(cx - 8, cy - 2, 16, 6, 2); ctx.fill();
        // Small teeth
        ctx.fillStyle = '#f0e8c0';
        for (let i = 0; i < 3; i++) {
          ctx.fillRect(cx - 5 + i * 5, cy - 2, 3, 3);
        }
        // Drool drop
        ctx.fillStyle = '#60ff40';
        ctx.beginPath(); ctx.arc(cx + 3, cy + 6, 2, 0, Math.PI*2); ctx.fill();
      }

    } else {
      // ── DEAD — tipped over, Xs for eyes ──
      ctx.strokeStyle = '#ff2020'; ctx.lineWidth = 2;
      [-7, 7].forEach(ex => {
        ctx.beginPath(); ctx.moveTo(cx+ex-4, cy-18); ctx.lineTo(cx+ex+4, cy-10); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx+ex+4, cy-18); ctx.lineTo(cx+ex-4, cy-10); ctx.stroke();
      });
      // Droop mouth
      ctx.strokeStyle = spineCol; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy - 2, 6, 0.3, Math.PI - 0.3, true);
      ctx.stroke();
      // Fallen spines
      ctx.strokeStyle = spineCol; ctx.lineWidth = 1.5;
      [[-10,22,-14,26],[-2,24,-4,30],[6,23,8,29]].forEach(([x1,y1,x2,y2]) => {
        ctx.beginPath();
        ctx.moveTo(cx+x1, cy+y1); ctx.lineTo(cx+x2, cy+y2); ctx.stroke();
      });
    }
  };

  sprites.idle   = makeSprite(64, 64, (c,W,H) => draw(c,W,H, false, false, false));
  sprites.hurt   = makeSprite(64, 64, (c,W,H) => draw(c,W,H, true,  false, false));
  sprites.attack = makeSprite(64, 64, (c,W,H) => draw(c,W,H, false, false, true));
  sprites.death  = makeSprite(64, 64, (c,W,H) => draw(c,W,H, false, true,  false));
}


else if (type === 'roller') {
  const draw = (ctx, W, H, hurt, dead, attacking, spinAngle) => {
    const cx = W / 2, cy = H / 2 + 4;
    const r = 16;

    const bodyCol  = dead ? '#3a4a2e' : hurt ? '#b8ffb8' : '#3e7838';
    const darkCol  = dead ? '#2a3820' : hurt ? '#80d880' : '#285a22';
    const lightCol = dead ? '#4e5e3a' : hurt ? '#d8ffd8' : '#5aaa50';
    const spineCol = dead ? '#283820' : '#1a3e16';

    ctx.save();
    if (!dead) ctx.translate(cx, cy);
    else        ctx.translate(cx, cy + 4);

    // ── SHADOW ──
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(0, r + 3, r * 0.9, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── OUTER SPINES (back layer, drawn first) ──
    ctx.strokeStyle = spineCol; ctx.lineWidth = 1.5;
    const spineCount = 18;
    for (let i = 0; i < spineCount; i++) {
      const a = (i / spineCount) * Math.PI * 2 + (spinAngle || 0);
      const inner = r + 1, outer = r + 10 + (i % 3) * 3;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * inner, Math.sin(a) * inner);
      ctx.lineTo(Math.cos(a) * outer, Math.sin(a) * outer);
      ctx.stroke();
      // Spine tip dot
      ctx.fillStyle = spineCol;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * outer, Math.sin(a) * outer, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // ── SHORT MID SPINES ──
    ctx.strokeStyle = darkCol; ctx.lineWidth = 1;
    for (let i = 0; i < 12; i++) {
      const a = ((i + 0.5) / 12) * Math.PI * 2 + (spinAngle || 0);
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * (r - 1), Math.sin(a) * (r - 1));
      ctx.lineTo(Math.cos(a) * (r + 5),  Math.sin(a) * (r + 5));
      ctx.stroke();
    }

    // ── BODY BASE ──
    ctx.fillStyle = bodyCol;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();

    // ── SCALE SEGMENTS — rotating with spin ──
    const segCount = 6;
    for (let i = 0; i < segCount; i++) {
      const a = (i / segCount) * Math.PI * 2 + (spinAngle || 0);
      const sx = Math.cos(a) * r * 0.45;
      const sy = Math.sin(a) * r * 0.45;
      ctx.fillStyle = i % 2 === 0 ? darkCol : lightCol;
      ctx.beginPath();
      ctx.arc(sx, sy, r * 0.38, 0, Math.PI * 2);
      ctx.fill();
    }

    // ── BODY OVERLAY (top tint to unify) ──
    ctx.fillStyle = bodyCol;
    ctx.globalAlpha = 0.55;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;

    // ── HIGHLIGHT ──
    ctx.fillStyle = lightCol;
    ctx.beginPath();
    ctx.arc(-r * 0.3, -r * 0.3, r * 0.38, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.beginPath();
    ctx.arc(-r * 0.28, -r * 0.28, r * 0.2, 0, Math.PI * 2);
    ctx.fill();

    if (!dead) {
      // ── CYCLOPS EYE ──
      // Socket
      ctx.fillStyle = '#0d1a0c';
      ctx.beginPath(); ctx.arc(-2, -3, 7, 0, Math.PI * 2); ctx.fill();

      // Iris
      const irisCol = attacking ? '#ff4400' : '#cc1a00';
      ctx.fillStyle = irisCol;
      ctx.beginPath(); ctx.arc(-2, -3, 5, 0, Math.PI * 2); ctx.fill();

      // Inner iris ring
      ctx.fillStyle = attacking ? '#ff8800' : '#881000';
      ctx.beginPath(); ctx.arc(-2, -3, 3, 0, Math.PI * 2); ctx.fill();

      // Pupil
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.arc(-2, -3, 1.8, 0, Math.PI * 2); ctx.fill();

      // Catchlights
      ctx.fillStyle = '#fff';
      ctx.fillRect(-4, -6, 2, 2);
      ctx.fillRect(-1, -5, 1, 1);

      // Eye glow if attacking
      if (attacking) {
        ctx.fillStyle = 'rgba(255,80,0,0.3)';
        ctx.beginPath(); ctx.arc(-2, -3, 10, 0, Math.PI * 2); ctx.fill();
      }

      // ── MOUTH — jagged ──
      if (attacking) {
        ctx.fillStyle = '#1a0000';
        ctx.beginPath();
        ctx.moveTo(-8, 5);
        ctx.lineTo(-5, 3); ctx.lineTo(-2, 7);
        ctx.lineTo(1, 3);  ctx.lineTo(4, 7);
        ctx.lineTo(7, 3);  ctx.lineTo(8, 5);
        ctx.lineTo(8, 9);  ctx.lineTo(-8, 9);
        ctx.closePath(); ctx.fill();
        // Teeth
        ctx.fillStyle = '#f0e8c0';
        [[-7,5],[-3,5],[1,5],[5,5]].forEach(([x,y]) => {
          ctx.beginPath();
          ctx.moveTo(x, y); ctx.lineTo(x+2, y); ctx.lineTo(x+1, y+3);
          ctx.closePath(); ctx.fill();
        });
      } else {
        // Smug line mouth
        ctx.strokeStyle = darkCol; ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-6, 6);
        ctx.quadraticCurveTo(-2, 9, 5, 6);
        ctx.stroke();
      }

      // ── SPEED LINES if attacking ──
      if (attacking) {
        ctx.strokeStyle = 'rgba(255,140,0,0.5)'; ctx.lineWidth = 1.5;
        [[-28,-8],[-30,0],[-28,8],[-26,-4],[-26,4]].forEach(([x,y]) => {
          ctx.beginPath();
          ctx.moveTo(x, y); ctx.lineTo(x + 10, y);
          ctx.stroke();
        });
      }

    } else {
      // ── DEAD — cracked, deflated, X eyes ──
      // Crack lines
      ctx.strokeStyle = darkCol; ctx.lineWidth = 1.2;
      [
        [0,-r, 4,-6], [4,-6, 10,-2], [4,-6, 2,4],
        [-4,-r*0.6, -8,0], [-8,0, -4,8],
      ].forEach(([x1,y1,x2,y2]) => {
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      });

      // X eye
      ctx.strokeStyle = '#ff2020'; ctx.lineWidth = 2;
      [[-2,-3]].forEach(([ex,ey]) => {
        ctx.beginPath(); ctx.moveTo(ex-4,ey-4); ctx.lineTo(ex+4,ey+4); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ex+4,ey-4); ctx.lineTo(ex-4,ey+4); ctx.stroke();
      });

      // Sad droopy mouth
      ctx.strokeStyle = darkCol; ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-5, 7);
      ctx.quadraticCurveTo(0, 4, 5, 7);
      ctx.stroke();
    }

    ctx.restore();
  };

  // Pass a spin angle that increments per frame for idle/attack
  let spinAngle = 0;
  sprites.idle   = makeSprite(56, 56, (c,W,H) => draw(c,W,H, false, false, false, spinAngle));
  sprites.hurt   = makeSprite(56, 56, (c,W,H) => draw(c,W,H, true,  false, false, spinAngle + 0.4));
  sprites.attack = makeSprite(56, 56, (c,W,H) => draw(c,W,H, false, false, true,  spinAngle + 0.8));
  sprites.death  = makeSprite(56, 56, (c,W,H) => draw(c,W,H, false, true,  false, 0));
}


else if (type === 'barrel') {
  const draw = (ctx, W, H, hurt, dead, attacking) => {
    const cx = W / 2, cy = H * 0.54;

    const bodyCol  = dead ? '#304828' : hurt ? '#b0ffcc' : '#3a6a30';
    const darkCol  = dead ? '#1e3018' : hurt ? '#70cc90' : '#264a1e';
    const lightCol = dead ? '#405838' : hurt ? '#d0ffd8' : '#559848';
    const spineCol = dead ? '#1a2e14' : '#162a10';
    const ribCol   = dead ? '#223620' : '#1e4018';

    // ── SHADOW ──
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 24, 18, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── MAIN BODY — fat barrel ──
    ctx.fillStyle = bodyCol;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 20, 26, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── VERTICAL SHADING COLUMNS ──
    ctx.fillStyle = darkCol;
    // Left shadow
    ctx.beginPath();
    ctx.ellipse(cx - 12, cy, 8, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    // Right shadow
    ctx.beginPath();
    ctx.ellipse(cx + 12, cy, 8, 24, 0, 0, Math.PI * 2);
    ctx.fill();

    // Light centre column
    ctx.fillStyle = lightCol;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 7, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    // Subtle secondary highlight
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.beginPath();
    ctx.ellipse(cx - 4, cy - 6, 5, 12, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // ── HORIZONTAL RIB BANDS ──
    ctx.strokeStyle = ribCol; ctx.lineWidth = 2;
    [-14, -6, 2, 10, 18].forEach(dy => {
      ctx.beginPath();
      ctx.ellipse(cx, cy + dy, 20, 5, 0, 0, Math.PI * 2);
      ctx.stroke();
    });

    // ── TOP CAP ──
    ctx.fillStyle = lightCol;
    ctx.beginPath();
    ctx.ellipse(cx, cy - 26, 20, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = bodyCol;
    ctx.beginPath();
    ctx.ellipse(cx, cy - 27, 14, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // Top crown spines
    ctx.strokeStyle = spineCol; ctx.lineWidth = 1.5;
    [[-8,-32,-10,-38],[-3,-33,-3,-40],[3,-33,3,-40],[8,-32,10,-38],[0,-33,0,-40]].forEach(([x1,y1,x2,y2]) => {
      ctx.beginPath();
      ctx.moveTo(cx+x1, cy+y1); ctx.lineTo(cx+x2, cy+y2); ctx.stroke();
    });

    // ── BOTTOM BASE ──
    ctx.fillStyle = darkCol;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 24, 18, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    if (!dead) {
      // ── SIDE SPINE CLUSTERS ──
      ctx.strokeStyle = spineCol; ctx.lineWidth = 1.5;
      // Left side
      [[-14,-16],[-14,-6],[-14,4],[-14,14]].forEach(([bx,by]) => {
        [[-6,-3],[-8,0],[-6,3]].forEach(([ox,oy]) => {
          ctx.beginPath();
          ctx.moveTo(cx+bx, cy+by);
          ctx.lineTo(cx+bx+ox, cy+by+oy);
          ctx.stroke();
          ctx.fillStyle = spineCol;
          ctx.beginPath();
          ctx.arc(cx+bx+ox, cy+by+oy, 1, 0, Math.PI*2);
          ctx.fill();
        });
      });
      // Right side
      [[14,-16],[14,-6],[14,4],[14,14]].forEach(([bx,by]) => {
        [[6,-3],[8,0],[6,3]].forEach(([ox,oy]) => {
          ctx.beginPath();
          ctx.moveTo(cx+bx, cy+by);
          ctx.lineTo(cx+bx+ox, cy+by+oy);
          ctx.stroke();
          ctx.fillStyle = spineCol;
          ctx.beginPath();
          ctx.arc(cx+bx+ox, cy+by+oy, 1, 0, Math.PI*2);
          ctx.fill();
        });
      });

      // ── EYES — sunk into body, mean ──
      // Sockets
      ctx.fillStyle = '#0c1a0a';
      ctx.beginPath(); ctx.roundRect(cx-14, cy-18, 10, 9, 2); ctx.fill();
      ctx.beginPath(); ctx.roundRect(cx+4,  cy-18, 10, 9, 2); ctx.fill();

      // Brow ridge (angry slant)
      ctx.fillStyle = darkCol;
      ctx.beginPath();
      ctx.moveTo(cx-15, cy-20); ctx.lineTo(cx-3, cy-18);
      ctx.lineTo(cx-3,  cy-17); ctx.lineTo(cx-15, cy-19);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx+15, cy-20); ctx.lineTo(cx+3, cy-18);
      ctx.lineTo(cx+3,  cy-17); ctx.lineTo(cx+15, cy-19);
      ctx.closePath(); ctx.fill();

      // Irises
      const irisCol = attacking ? '#ff5500' : '#bb1800';
      ctx.fillStyle = irisCol;
      ctx.beginPath(); ctx.arc(cx-9, cy-14, 3.5, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx+9, cy-14, 3.5, 0, Math.PI*2); ctx.fill();

      // Pupils
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.arc(cx-9, cy-14, 1.8, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx+9, cy-14, 1.8, 0, Math.PI*2); ctx.fill();

      // Catchlights
      ctx.fillStyle = '#fff';
      ctx.fillRect(cx-11, cy-16, 2, 2);
      ctx.fillRect(cx+7,  cy-16, 2, 2);

      // Eye glow if attacking
      if (attacking) {
        ctx.fillStyle = 'rgba(255,80,0,0.25)';
        ctx.beginPath(); ctx.arc(cx-9, cy-14, 8, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx+9, cy-14, 8, 0, Math.PI*2); ctx.fill();
      }

      // ── MOUTH ──
      if (attacking) {
        // Wide open roar
        ctx.fillStyle = '#140004';
        ctx.beginPath(); ctx.roundRect(cx-12, cy-6, 24, 12, 3); ctx.fill();
        // Top teeth
        ctx.fillStyle = '#ede8c0';
        for (let i=0; i<5; i++) ctx.fillRect(cx-10+i*5, cy-6, 4, 5);
        // Bottom teeth
        for (let i=0; i<4; i++) ctx.fillRect(cx-8+i*5, cy+1, 4, 5);
        // Inner glow
        ctx.fillStyle = 'rgba(255,60,0,0.3)';
        ctx.fillRect(cx-8, cy-2, 16, 5);
      } else {
        // Grumpy downward line
        ctx.strokeStyle = darkCol; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx-9, cy-4);
        ctx.quadraticCurveTo(cx, cy-8, cx+9, cy-4);
        ctx.stroke();
        // Fang
        ctx.fillStyle = '#ede8c0';
        ctx.beginPath();
        ctx.moveTo(cx-3, cy-4); ctx.lineTo(cx+1, cy-4); ctx.lineTo(cx-1, cy); ctx.closePath(); ctx.fill();
      }

    } else {
      // ── DEAD — cracked barrel, X eyes, slumped ──
      // Dark overlay
      ctx.fillStyle = 'rgba(0,0,0,0.30)';
      ctx.beginPath();
      ctx.ellipse(cx, cy, 20, 26, 0, 0, Math.PI * 2);
      ctx.fill();

      // Crack lines
      ctx.strokeStyle = darkCol; ctx.lineWidth = 1.2;
      [
        [0,-26, 4,-14], [4,-14, -2,-4], [4,-14, 10,0],
        [-6,-20, -10,-8], [-10,-8, -4,4],
        [8,-10, 12,4],
      ].forEach(([x1,y1,x2,y2]) => {
        ctx.beginPath();
        ctx.moveTo(cx+x1, cy+y1); ctx.lineTo(cx+x2, cy+y2); ctx.stroke();
      });

      // X eyes
      ctx.strokeStyle = '#ff2020'; ctx.lineWidth = 2;
      [[-9,-14],[9,-14]].forEach(([ex,ey]) => {
        ctx.beginPath(); ctx.moveTo(cx+ex-4, cy+ey-4); ctx.lineTo(cx+ex+4, cy+ey+4); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx+ex+4, cy+ey-4); ctx.lineTo(cx+ex-4, cy+ey+4); ctx.stroke();
      });

      // Sad droopy mouth
      ctx.strokeStyle = darkCol; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx-8, cy-2);
      ctx.quadraticCurveTo(cx, cy+2, cx+8, cy-2);
      ctx.stroke();

      // Fallen spines scattered
      ctx.strokeStyle = spineCol; ctx.lineWidth = 1.5;
      [[-20,20,-14,26],[-10,26,-8,32],[4,24,8,30],[16,22,20,28]].forEach(([x1,y1,x2,y2]) => {
        ctx.beginPath();
        ctx.moveTo(cx+x1, cy+y1); ctx.lineTo(cx+x2, cy+y2); ctx.stroke();
      });
    }
  };

  sprites.idle   = makeSprite(72, 80, (c,W,H) => draw(c,W,H, false, false, false));
  sprites.hurt   = makeSprite(72, 80, (c,W,H) => draw(c,W,H, true,  false, false));
  sprites.attack = makeSprite(72, 80, (c,W,H) => draw(c,W,H, false, false, true));
  sprites.death  = makeSprite(72, 80, (c,W,H) => draw(c,W,H, false, true,  false));
}


 else if (type === 'pricilla') {
  const draw = (ctx, W, H, phase, hurt, dead) => {
    const cx = W / 2;

    // ── Layout anchors ──
    const crownBase = 26;
    const headCY    = 44;
    const torsoTop  = 58;
    const torsoBot  = 82;
    const robeTop   = 80;
    const baseY     = 108;

    // ── Color scheme ──
    const bodyCol  = dead ? '#1a2e18' : hurt ? '#b0ffb8' :
                     phase===3 ? '#0a1e08' : phase===2 ? '#163a12' : '#1e5018';
    const darkCol  = dead ? '#101e0e' : hurt ? '#70cc80' :
                     phase===3 ? '#061204' : phase===2 ? '#0c2808' : '#143a10';
    const lightCol = dead ? '#2a3e28' : hurt ? '#d0ffd4' :
                     phase===3 ? '#1a3016' : phase===2 ? '#285a22' : '#367a2e';
    const spineCol = '#081408';
    const eyeCol   = phase===3 ? '#ff2200' : phase===2 ? '#ff6600' : '#40ff40';
    const clawCol  = phase===2 ? '#80ff00' : '#40cc20';

    // ── SHADOW ──
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(cx, baseY + 4, 32, 6, 0, 0, Math.PI*2);
    ctx.fill();

    // ── PHASE AURA ──
    if (!dead && phase >= 2) {
      const auraR = phase===3 ? 'rgba(60,255,0,0.35)' : 'rgba(40,200,20,0.22)';
      ctx.fillStyle = auraR;
      ctx.beginPath();
      ctx.ellipse(cx, (torsoTop+baseY)/2, 44+(phase-2)*10, 60+(phase-2)*12, 0, 0, Math.PI*2);
      ctx.fill();
    }

    // ── ROBE / LOWER BODY ──
    ctx.fillStyle = bodyCol;
    ctx.beginPath();
    ctx.moveTo(cx-34, baseY);
    ctx.lineTo(cx-20, robeTop);
    ctx.lineTo(cx+20, robeTop);
    ctx.lineTo(cx+34, baseY);
    ctx.closePath(); ctx.fill();

    // Robe side shading
    ctx.fillStyle = darkCol;
    ctx.beginPath();
    ctx.moveTo(cx-34, baseY); ctx.lineTo(cx-20, robeTop);
    ctx.lineTo(cx-14, robeTop); ctx.lineTo(cx-22, baseY);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx+34, baseY); ctx.lineTo(cx+20, robeTop);
    ctx.lineTo(cx+14, robeTop); ctx.lineTo(cx+22, baseY);
    ctx.closePath(); ctx.fill();

    // Robe highlight strip
    ctx.fillStyle = lightCol;
    ctx.beginPath();
    ctx.moveTo(cx-5, baseY); ctx.lineTo(cx-3, robeTop);
    ctx.lineTo(cx+3, robeTop); ctx.lineTo(cx+5, baseY);
    ctx.closePath(); ctx.fill();

    // Robe horizontal bands
    ctx.strokeStyle = darkCol; ctx.lineWidth = 1.5;
    [10, 20].forEach(dy => {
      const w = 22 + dy * 0.6;
      ctx.beginPath();
      ctx.moveTo(cx-w, baseY-dy); ctx.lineTo(cx+w, baseY-dy); ctx.stroke();
    });

    // Robe hem spines
    if (!dead) {
      ctx.strokeStyle = spineCol; ctx.lineWidth = 1.5;
      for (let i=0; i<8; i++) {
        const hx = cx - 30 + i * 9;
        ctx.beginPath(); ctx.moveTo(hx, baseY); ctx.lineTo(hx-2, baseY+8); ctx.stroke();
      }
    }

    // ── TORSO ──
    ctx.fillStyle = bodyCol;
    ctx.beginPath();
    ctx.roundRect(cx-16, torsoTop, 32, torsoBot-torsoTop, 4);
    ctx.fill();

    // Torso shading columns
    ctx.fillStyle = darkCol;
    ctx.fillRect(cx-16, torsoTop, 6, torsoBot-torsoTop);
    ctx.fillRect(cx+10, torsoTop, 6, torsoBot-torsoTop);
    ctx.fillStyle = lightCol;
    ctx.fillRect(cx-3, torsoTop, 6, torsoBot-torsoTop);

    // Torso ribs
    ctx.strokeStyle = darkCol; ctx.lineWidth = 1.5;
    [torsoTop+8, torsoTop+16, torsoTop+22].forEach(ry => {
      ctx.beginPath(); ctx.moveTo(cx-16,ry); ctx.lineTo(cx+16,ry); ctx.stroke();
    });

    // Torso spine clusters
    if (!dead) {
      ctx.strokeStyle = spineCol; ctx.lineWidth = 1.5;
      [torsoTop+8, torsoTop+18].forEach(sy => {
        [[-16,-5],[-21,-2],[-16,5]].forEach(([ox,oy]) => {
          ctx.beginPath(); ctx.moveTo(cx-14,sy); ctx.lineTo(cx+ox,sy+oy); ctx.stroke();
          ctx.fillStyle=spineCol; ctx.beginPath(); ctx.arc(cx+ox,sy+oy,1.2,0,Math.PI*2); ctx.fill();
        });
        [[16,-5],[21,-2],[16,5]].forEach(([ox,oy]) => {
          ctx.beginPath(); ctx.moveTo(cx+14,sy); ctx.lineTo(cx+ox,sy+oy); ctx.stroke();
          ctx.fillStyle=spineCol; ctx.beginPath(); ctx.arc(cx+ox,sy+oy,1.2,0,Math.PI*2); ctx.fill();
        });
      });
    }

    // ── ARMS ──
    if (!dead) {
      const armY = torsoTop + 6;
      [0,1].forEach(side => {
        const s = side===0 ? -1 : 1;
        ctx.fillStyle = bodyCol;
        ctx.beginPath();
        ctx.moveTo(cx + s*14, armY);
        ctx.lineTo(cx + s*24, armY+10);
        ctx.lineTo(cx + s*36, armY+26);
        ctx.lineTo(cx + s*38, armY+44);
        ctx.lineTo(cx + s*30, armY+44);
        ctx.lineTo(cx + s*28, armY+26);
        ctx.lineTo(cx + s*18, armY+12);
        ctx.lineTo(cx + s*10, armY);
        ctx.closePath(); ctx.fill();

        ctx.fillStyle = darkCol;
        ctx.beginPath();
        ctx.moveTo(cx+s*14, armY);
        ctx.lineTo(cx+s*24, armY+10);
        ctx.lineTo(cx+s*36, armY+26);
        ctx.lineTo(cx+s*38, armY+44);
        ctx.lineTo(cx+s*36, armY+44);
        ctx.lineTo(cx+s*34, armY+26);
        ctx.lineTo(cx+s*22, armY+10);
        ctx.lineTo(cx+s*13, armY);
        ctx.closePath(); ctx.fill();

        // Arm spines
        ctx.strokeStyle = spineCol; ctx.lineWidth = 1.5;
        [[s*26,armY+12,s*32,armY+8],
         [s*32,armY+24,s*40,armY+20],
         [s*34,armY+36,s*42,armY+34]].forEach(([ox1,oy1,ox2,oy2]) => {
          ctx.beginPath(); ctx.moveTo(cx+ox1,oy1); ctx.lineTo(cx+ox2,oy2); ctx.stroke();
          ctx.fillStyle=spineCol; ctx.beginPath(); ctx.arc(cx+ox2,oy2,1.2,0,Math.PI*2); ctx.fill();
        });

        // Claws
        ctx.strokeStyle = clawCol; ctx.lineWidth = 2;
        const hx = cx + s*34, hy = armY+44;
        [[0,0,s*4,12],[s*(-2),0,s*(-2),12],[s*4,0,s*8,10]].forEach(([x1,y1,x2,y2]) => {
          ctx.beginPath(); ctx.moveTo(hx+x1,hy+y1); ctx.lineTo(hx+x2,hy+y2); ctx.stroke();
        });
      });
    }

    // ── HEAD ──
    ctx.fillStyle = bodyCol;
    ctx.beginPath();
    ctx.roundRect(cx-18, crownBase, 36, headCY-crownBase+18, 6);
    ctx.fill();

    ctx.fillStyle = darkCol;
    ctx.fillRect(cx-18, crownBase, 7, headCY-crownBase+18);
    ctx.fillRect(cx+11, crownBase, 7, headCY-crownBase+18);
    ctx.fillStyle = lightCol;
    ctx.fillRect(cx-3, crownBase, 6, headCY-crownBase+18);

    ctx.strokeStyle = darkCol; ctx.lineWidth = 1;
    [crownBase+10, crownBase+20].forEach(ry => {
      ctx.beginPath(); ctx.moveTo(cx-18,ry); ctx.lineTo(cx+18,ry); ctx.stroke();
    });

    // ── CROWN ──
    ctx.strokeStyle = spineCol; ctx.lineWidth = 2;
    [
      [cx-18, crownBase,   cx-32, crownBase-22],
      [cx-12, crownBase-2, cx-18, crownBase-28],
      [cx-5,  crownBase-4, cx-7,  crownBase-34],
      [cx,    crownBase-4, cx,    crownBase-38],
      [cx+5,  crownBase-4, cx+7,  crownBase-34],
      [cx+12, crownBase-2, cx+18, crownBase-28],
      [cx+18, crownBase,   cx+32, crownBase-22],
    ].forEach(([x1,y1,x2,y2]) => {
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      ctx.fillStyle=spineCol;
      ctx.beginPath(); ctx.arc(x2,y2,1.8,0,Math.PI*2); ctx.fill();
    });

    ctx.strokeStyle = darkCol; ctx.lineWidth = 1.5;
    [
      [cx-15, crownBase,   cx-22, crownBase-16],
      [cx-8,  crownBase-2, cx-12, crownBase-22],
      [cx+8,  crownBase-2, cx+12, crownBase-22],
      [cx+15, crownBase,   cx+22, crownBase-16],
    ].forEach(([x1,y1,x2,y2]) => {
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
    });

    // Phase 3 extra crown spines
    if (!dead && phase===3) {
      ctx.strokeStyle = 'rgba(60,255,0,0.75)'; ctx.lineWidth = 1.5;
      [
        [cx-22, crownBase+4, cx-42, crownBase-16],
        [cx+22, crownBase+4, cx+42, crownBase-16],
        [cx-3,  crownBase-4, cx-10, crownBase-42],
        [cx+3,  crownBase-4, cx+10, crownBase-42],
      ].forEach(([x1,y1,x2,y2]) => {
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
        ctx.fillStyle='rgba(60,255,0,0.75)';
        ctx.beginPath(); ctx.arc(x2,y2,1.5,0,Math.PI*2); ctx.fill();
      });
    }

    if (!dead) {
      // ── EYE SOCKETS ──
      ctx.fillStyle = '#080a08';
      ctx.beginPath(); ctx.roundRect(cx-17, headCY-8, 13, 11, 2); ctx.fill();
      ctx.beginPath(); ctx.roundRect(cx+4,  headCY-8, 13, 11, 2); ctx.fill();

      // Angry brows
      ctx.fillStyle = darkCol;
      ctx.beginPath();
      ctx.moveTo(cx-18,headCY-11); ctx.lineTo(cx-3,headCY-8);
      ctx.lineTo(cx-3,headCY-7);  ctx.lineTo(cx-18,headCY-10);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx+18,headCY-11); ctx.lineTo(cx+3,headCY-8);
      ctx.lineTo(cx+3,headCY-7);  ctx.lineTo(cx+18,headCY-10);
      ctx.closePath(); ctx.fill();

      // Iris
      ctx.fillStyle = eyeCol;
      ctx.beginPath(); ctx.roundRect(cx-16, headCY-7, 11, 9, 2); ctx.fill();
      ctx.beginPath(); ctx.roundRect(cx+5,  headCY-7, 11, 9, 2); ctx.fill();

      // Inner iris glow
      const innerEye = phase===3 ? '#ff9060' : phase===2 ? '#c0ff60' : '#90ff90';
      ctx.fillStyle = innerEye;
      ctx.beginPath(); ctx.roundRect(cx-14, headCY-6, 7, 7, 1); ctx.fill();
      ctx.beginPath(); ctx.roundRect(cx+7,  headCY-6, 7, 7, 1); ctx.fill();

      // Slit pupils
      ctx.fillStyle = '#000';
      ctx.fillRect(cx-12, headCY-6, 3, 7);
      ctx.fillRect(cx+9,  headCY-6, 3, 7);

      // Catchlights
      ctx.fillStyle = '#fff';
      ctx.fillRect(cx-15, headCY-6, 2, 2);
      ctx.fillRect(cx+6,  headCY-6, 2, 2);

      // Eye glow halo
      if (phase >= 2) {
        ctx.fillStyle = phase===3 ? 'rgba(255,60,0,0.3)' : 'rgba(100,255,0,0.25)';
        ctx.beginPath(); ctx.arc(cx-10, headCY-2, 10, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx+10, headCY-2, 10, 0, Math.PI*2); ctx.fill();
      }

      // Nose nub
      ctx.fillStyle = darkCol;
      ctx.beginPath(); ctx.roundRect(cx-2, headCY+3, 4, 4, 1); ctx.fill();

      // ── MOUTH ──
      if (phase === 3) {
        ctx.fillStyle = '#060e04';
        ctx.beginPath(); ctx.roundRect(cx-13, headCY+7, 26, 12, 3); ctx.fill();
        ctx.fillStyle = 'rgba(60,255,0,0.45)';
        ctx.fillRect(cx-9, headCY+9, 18, 6);
        ctx.fillStyle = '#eee8c0';
        for (let i=0;i<5;i++) ctx.fillRect(cx-11+i*5, headCY+7,  4, 5);
        for (let i=0;i<4;i++) ctx.fillRect(cx-9 +i*5, headCY+14, 4, 4);
      } else {
        ctx.strokeStyle = darkCol; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx-11, headCY+9);
        ctx.quadraticCurveTo(cx, headCY+14, cx+11, headCY+9);
        ctx.stroke();
        ctx.fillStyle = '#ede8c0';
        const fangs = phase===2 ? [-6,-1,4,9] : [-6,4];
        fangs.forEach(fx => {
          ctx.beginPath();
          ctx.moveTo(cx+fx,   headCY+9);
          ctx.lineTo(cx+fx+4, headCY+9);
          ctx.lineTo(cx+fx+2, headCY+15);
          ctx.closePath(); ctx.fill();
        });
      }

      // Head side spines
      ctx.strokeStyle = spineCol; ctx.lineWidth = 1.5;
      [
        [cx-18,headCY-4, cx-27,headCY-9],
        [cx-18,headCY+4, cx-27,headCY+4],
        [cx-18,headCY+10,cx-26,headCY+14],
        [cx+18,headCY-4, cx+27,headCY-9],
        [cx+18,headCY+4, cx+27,headCY+4],
        [cx+18,headCY+10,cx+26,headCY+14],
      ].forEach(([x1,y1,x2,y2]) => {
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
        ctx.fillStyle=spineCol; ctx.beginPath(); ctx.arc(x2,y2,1.2,0,Math.PI*2); ctx.fill();
      });

      // Phase 3 orbit rings
      if (phase===3) {
        ctx.strokeStyle = 'rgba(60,255,0,0.55)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cx, (torsoTop+baseY)/2, 52, 0, Math.PI*2); ctx.stroke();
        ctx.strokeStyle = 'rgba(100,255,40,0.3)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(cx, (torsoTop+baseY)/2, 44, 0, Math.PI*2); ctx.stroke();
      }

    } else {
      // ── DEAD ──
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath(); ctx.ellipse(cx, (crownBase+baseY)/2, 36, 50, 0, 0, Math.PI*2); ctx.fill();

      // Cracks
      ctx.strokeStyle = darkCol; ctx.lineWidth = 1.2;
      [
        [cx,   crownBase-4,  cx+6, headCY-4],
        [cx+6, headCY-4,     cx-2, headCY+8],
        [cx-8, crownBase+8,  cx-14,headCY+2],
        [cx-4, torsoTop+8,   cx+8, torsoTop+24],
        [cx+8, torsoTop+24,  cx+2, torsoTop+40],
      ].forEach(([x1,y1,x2,y2]) => {
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      });

      // X eyes
      ctx.strokeStyle = '#ff0044'; ctx.lineWidth = 2;
      [cx-10, cx+10].forEach(ex => {
        const ey = headCY - 2;
        ctx.beginPath(); ctx.moveTo(ex-5,ey-5); ctx.lineTo(ex+5,ey+5); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ex+5,ey-5); ctx.lineTo(ex-5,ey+5); ctx.stroke();
      });

      // Droopy mouth
      ctx.strokeStyle = darkCol; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx-10, headCY+10);
      ctx.quadraticCurveTo(cx, headCY+7, cx+10, headCY+10);
      ctx.stroke();

      // Toppled crown spines
      ctx.strokeStyle = spineCol; ctx.lineWidth = 1.5;
      [
        [cx-16,crownBase, cx-20,crownBase+10],
        [cx-4, crownBase-4, cx-6,crownBase+12],
        [cx+4, crownBase-4, cx+4,crownBase+14],
        [cx+16,crownBase, cx+20,crownBase+10],
      ].forEach(([x1,y1,x2,y2]) => {
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      });
    }
  };

  sprites.idle   = makeSprite(96, 120, (c,W,H) => draw(c,W,H, 1, false, false));
  sprites.phase2 = makeSprite(96, 120, (c,W,H) => draw(c,W,H, 2, false, false));
  sprites.phase3 = makeSprite(96, 120, (c,W,H) => draw(c,W,H, 3, false, false));
  sprites.hurt   = makeSprite(96, 120, (c,W,H) => draw(c,W,H, 1, true,  false));
  sprites.attack = makeSprite(96, 120, (c,W,H) => draw(c,W,H, 1, false, false));
  sprites.death  = makeSprite(96, 120, (c,W,H) => draw(c,W,H, 1, false, true));
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
      this.quipCooldown = 0;

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
        // Only quip if cooldown is over and pass a random chance
        if (this.quipCooldown <= 0 && Math.random() < 0.4) {
          HUD.showEnemyQuip(Utils.randomQuip(C.PRICILLA_QUIPS_HURT));
          this.quipCooldown = 3.0;   // 3 seconds before she can quip again
        }
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
      if (this.quipCooldown > 0) {
        this.quipCooldown -= dt;
      }
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