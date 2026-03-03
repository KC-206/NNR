// ============================================================
//  Maps — Level data, texture definitions, door system
//  Map format: 0=empty, 1-6=wall types, 9=door, 8=spawn area
//  Pickups and enemies defined separately per level
// ============================================================

const Maps = (() => {

  // ── Door PNG texture slot ─────────────────────────────
  let _doorImageData = null;

  function setDoorTexture(imgData) {
    _doorImageData = imgData;
    if (textures) textures[9] = imgData;
  }

  // ── Texture Painter (canvas pixel art) ─────────────────
  function buildTextures(paletteIndex) {
    const pal = C.PALETTE[paletteIndex];
    const textures = {};

    function makeTexture(drawFn) {
      const oc = document.createElement('canvas');
      oc.width = oc.height = C.TEXTURE_SIZE;
      const ox = oc.getContext('2d');
      drawFn(ox, oc.width, oc.height);
      return ox.getImageData(0, 0, C.TEXTURE_SIZE, C.TEXTURE_SIZE);
    }

    // Wall type 1: Adobe brick (warm tan)
    textures[1] = makeTexture((ctx, W, H) => {
      ctx.fillStyle = '#c8a060';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#7a5030';
      for (let y = 0; y < H; y += 12) {
        ctx.fillRect(0, y, W, 2);
      }
      for (let y = 0; y < H; y += 24) {
        for (let x = 0; x < W; x += 16) {
          ctx.fillRect(x, y + 12, 2, 12);
        }
        for (let x = 8; x < W; x += 16) {
          ctx.fillRect(x, y, 2, 12);
        }
      }
      ctx.fillStyle = 'rgba(0,0,0,0.08)';
      for (let i = 0; i < 80; i++) {
        const px = Math.random() * W | 0;
        const py = Math.random() * H | 0;
        ctx.fillRect(px, py, 2, 2);
      }
    });

    // Wall type 2: Dark stone
    textures[2] = makeTexture((ctx, W, H) => {
      ctx.fillStyle = '#504030';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#382818';
      for (let y = 0; y < H; y += 10) {
        for (let x = 0; x < W; x += 10) {
          if ((x + y) % 20 === 0) ctx.fillRect(x, y, 9, 9);
        }
      }
      ctx.fillStyle = '#605040';
      for (let i = 0; i < 40; i++) {
        const px = Math.random() * W | 0;
        const py = Math.random() * H | 0;
        ctx.fillRect(px, py, 3, 1);
      }
    });

    // Wall type 3: Cactus-green moss wall
    textures[3] = makeTexture((ctx, W, H) => {
      ctx.fillStyle = '#3a5830';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#507840';
      for (let i = 0; i < 60; i++) {
        const px = Math.random() * W | 0;
        const py = Math.random() * H | 0;
        ctx.fillRect(px, py, 3, 5);
      }
      ctx.fillStyle = '#284020';
      for (let y = 0; y < H; y += 8) ctx.fillRect(0, y, W, 1);
    });

    // Wall type 4: Lava/molten rock (level 2)
    textures[4] = makeTexture((ctx, W, H) => {
      ctx.fillStyle = '#2a0800';
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = '#ff6020';
      ctx.lineWidth = 2;
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * W, 0);
        let cx = Math.random() * W, cy = H / 2;
        ctx.quadraticCurveTo(cx, cy, Math.random() * W, H);
        ctx.stroke();
      }
      ctx.fillStyle = 'rgba(255,80,0,0.3)';
      for (let i = 0; i < 20; i++) {
        const px = Math.random() * W | 0;
        const py = Math.random() * H | 0;
        ctx.fillRect(px, py, 4, 2);
      }
    });

    // Wall type 5: Crystal/underground lair (level 3)
    textures[5] = makeTexture((ctx, W, H) => {
      ctx.fillStyle = '#0a0820';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#4030a0';
      for (let i = 0; i < 8; i++) {
        const px = Math.random() * W | 0;
        const py = Math.random() * H | 0;
        const size = 4 + Math.random() * 10;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + size, py + size * 2);
        ctx.lineTo(px - size, py + size * 2);
        ctx.closePath();
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(120,80,255,0.4)';
      for (let i = 0; i < 30; i++) {
        ctx.fillRect(Math.random()*W|0, Math.random()*H|0, 2, 2);
      }
    });

    // Wall type 6: Metal door (procedural fallback)
    textures[6] = makeTexture((ctx, W, H) => {
      ctx.fillStyle = '#606060';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#808080';
      ctx.fillRect(4, 4, W-8, H-8);
      ctx.fillStyle = '#404040';
      ctx.fillRect(0, H/2-2, W, 4);
      ctx.fillRect(W/2-2, 0, 4, H);
      ctx.fillStyle = '#a0a0a0';
      [[8,8],[W-12,8],[8,H-12],[W-12,H-12]].forEach(([x,y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI*2);
        ctx.fill();
      });
    });

    // Exit panel (tile 9)
    textures[9] = makeTexture((ctx, W, H) => {
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#40ff80';
      ctx.fillRect(W*0.2, H*0.2, W*0.6, H*0.6);
      ctx.strokeStyle = '#80ffb0';
      ctx.lineWidth = 3;
      ctx.strokeRect(W*0.2, H*0.2, W*0.6, H*0.6);
    });

    // ── Override door texture with PNG if loaded ──
    if (_doorImageData) textures[9] = _doorImageData;

    return textures;
  }

  // ── Level Definitions ──────────────────────────────────

  const levels = [

    // ─── LEVEL 1: The Cactus Flats ────────────────────────
    {
      name: 'THE CACTUS FLATS',
      blurb: 'A scorched desert wasteland, thick with mutant cacti. The air smells of burnt espresso.',
      paletteIndex: 0,
      musicTrack: 0,
      map: [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,1,1,0,0,1,0,1,1,1,0,0,1,1,1,0,0,0,1],
        [1,0,1,0,0,0,6,0,1,0,0,0,0,0,0,1,0,1,0,1],
        [1,0,1,1,0,0,1,0,1,0,1,1,0,0,0,1,0,1,0,1],
        [1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,1,0,1],
        [1,1,1,1,0,0,1,1,1,0,1,0,1,1,1,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,1,0,1,0,1,0,0,0,0,1,0,1],
        [1,0,1,0,1,1,0,0,1,0,0,0,1,0,1,1,0,1,0,1],
        [1,0,1,0,0,1,0,0,6,0,0,0,0,0,1,0,0,0,0,1],
        [1,0,1,1,0,1,0,0,1,0,1,1,0,0,1,0,1,1,0,1],
        [1,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,0,1],
        [1,1,1,0,1,1,1,0,1,0,1,0,1,1,1,0,1,0,1,1],
        [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,1],
        [1,0,1,1,1,0,1,0,1,1,0,0,1,0,1,1,1,0,1,1],
        [1,0,0,0,1,0,6,0,1,0,0,0,0,0,1,0,0,0,0,1],
        [1,1,0,0,1,0,1,0,1,0,1,1,0,0,1,0,1,1,0,1],
        [1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,1],
        [1,0,1,1,0,0,1,0,1,1,1,0,1,1,0,0,0,9,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      ],
      playerStart: { x: 1.5, y: 1.5, angle: 0 },
      enemies: [
        { type: 'spitter', x: 11.5, y: 5.5  },
        { type: 'spitter', x: 13.5, y: 8.5  },
        { type: 'roller',  x: 7.5,  y: 8.5  },
        { type: 'roller',  x: 11.5, y: 12.5 },
        { type: 'barrel',  x: 16.5, y: 6.5  },
        { type: 'spitter', x: 7.5,  y: 14.5 },
        { type: 'roller',  x: 9.5,  y: 16.5 },
        { type: 'barrel',  x: 15.5, y: 15.5 },
        { type: 'spitter', x: 18.5, y: 10.5 },
      ],
      pickups: [
        { type: 'goldengojira', x: 16.5, y: 3.5 },
        { type: 'coffee',  x: 3.5,  y: 3.5  },
        { type: 'baguette',x: 9.5,  y: 7.5  },
        { type: 'armor',   x: 11.5, y: 11.5 },
        { type: 'coffee',  x: 5.5,  y: 15.5 },
        { type: 'key',     x: 17.5, y: 17.5 },
        { type: 'energy',  x: 13.5, y: 4.5  },
      ],
      torchWalls: [[3,1],[6,5],[10,9],[15,13]],
    },

    // ─── LEVEL 2: The Molten Corridors ────────────────────
    {
      name: 'THE MOLTEN CORRIDORS',
      blurb: 'Magma seeps through cracks in the floor. Ancient cactus constructs patrol the burning halls.',
      paletteIndex: 1,
      musicTrack: 1,
      map: [
        [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
        [2,0,0,0,2,0,0,0,0,0,2,0,0,0,0,0,0,0,0,2],
        [2,0,4,0,2,0,4,4,0,0,2,0,4,4,0,0,4,0,0,2],
        [2,0,0,0,6,0,0,4,0,0,6,0,0,4,0,0,0,0,0,2],
        [2,2,0,2,2,2,0,2,2,0,2,2,0,2,2,2,0,2,2,2],
        [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
        [2,0,2,2,0,2,0,2,2,0,2,0,2,2,0,2,0,2,0,2],
        [2,0,2,0,0,2,0,2,0,0,2,0,2,0,0,6,0,2,0,2],
        [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2],
        [2,2,2,0,2,2,2,0,2,2,2,0,2,2,2,2,0,2,2,2],
        [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
        [2,0,4,4,0,0,4,0,4,4,0,4,0,0,4,4,0,0,0,2],
        [2,0,4,0,0,0,0,0,4,0,0,0,0,0,4,0,0,0,0,2],
        [2,0,0,0,2,2,0,0,0,0,2,2,0,0,0,0,2,2,0,2],
        [2,2,0,2,2,0,2,2,0,2,2,0,2,2,0,2,2,0,2,2],
        [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
        [2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,0,2,2],
        [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
        [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,0,2],
        [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
      ],
      playerStart: { x: 1.5, y: 1.5, angle: 0 },
      enemies: [
        { type: 'spitter', x: 5.5,  y: 2.5  },
        { type: 'barrel',  x: 9.5,  y: 5.5  },
        { type: 'roller',  x: 3.5,  y: 8.5  },
        { type: 'roller',  x: 14.5, y: 3.5  },
        { type: 'barrel',  x: 7.5,  y: 12.5 },
        { type: 'spitter', x: 16.5, y: 10.5 },
        { type: 'spitter', x: 11.5, y: 14.5 },
        { type: 'barrel',  x: 5.5,  y: 16.5 },
        { type: 'roller',  x: 12.5, y: 17.5 },
        { type: 'spitter', x: 17.5, y: 15.5 },
        { type: 'roller',  x: 7.5,  y: 9.5  },
        { type: 'barrel',  x: 16.5, y: 17.5 },
      ],
      pickups: [
        { type: 'goldengojira', x: 17.5, y: 3.5 },
        { type: 'coffee',  x: 6.5,  y: 4.5  },
        { type: 'baguette',x: 13.5, y: 7.5  },
        { type: 'armor',   x: 8.5,  y: 14.5 },
        { type: 'coffee',  x: 15.5, y: 12.5 },
        { type: 'energy',  x: 10.5, y: 10.5 },
        { type: 'key',     x: 12.5, y: 18.5 },
        { type: 'baguette',x: 3.5,  y: 16.5 },
      ],
      torchWalls: [[2,2],[6,3],[11,9],[14,15]],
    },

    // ─── LEVEL 3: Pricilla's Lair ─────────────────────────
    {
      name: "PRICILLA'S LAIR",
      blurb: "She's been waiting. The crystals hum with dark energy. This ends today.",
      paletteIndex: 2,
      musicTrack: 2,
      map: [
        [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
        [5,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,5],
        [5,0,5,5,0,0,5,0,5,5,5,0,0,5,5,5,0,0,0,5],
        [5,0,5,0,0,0,6,0,5,0,0,0,0,0,0,5,0,5,0,5],
        [5,0,5,5,0,0,5,0,5,0,5,5,0,0,0,5,0,5,0,5],
        [5,0,0,0,0,0,5,0,0,0,5,0,0,0,0,0,0,5,0,5],
        [5,5,5,5,0,0,5,5,5,0,5,0,5,5,5,0,0,0,0,5],
        [5,0,0,0,0,0,0,0,5,0,5,0,5,0,0,0,0,5,0,5],
        [5,0,5,0,5,5,0,0,5,0,0,0,5,0,5,5,0,5,0,5],
        [5,0,5,0,0,5,0,0,6,0,0,0,0,0,5,0,0,0,0,5],
        [5,0,5,5,0,5,0,0,5,0,5,5,0,0,5,0,5,5,0,5],
        [5,0,0,0,0,0,0,0,5,0,5,0,0,0,0,0,5,0,0,5],
        [5,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5],
        [5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5],
        [5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5],
        [5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5],
        [5,5,0,0,5,0,5,5,0,0,5,0,5,5,0,5,5,0,5,5],
        [5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5],
        [5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,0,5],
        [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
      ],
      playerStart: { x: 1.5, y: 1.5, angle: 0 },
      enemies: [
        { type: 'spitter',  x: 5.5,  y: 3.5  },
        { type: 'barrel',   x: 11.5, y: 5.5  },
        { type: 'roller',   x: 3.5,  y: 9.5  },
        { type: 'spitter',  x: 15.5, y: 7.5  },
        { type: 'barrel',   x: 9.5,  y: 10.5 },
        { type: 'roller',   x: 13.5, y: 11.5 },
        { type: 'pricilla', x: 10.5, y: 14.5 },
      ],
      pickups: [
        { type: 'goldengojira', x: 14.5, y: 3.5 },
        { type: 'coffee',  x: 4.5,  y: 2.5  },
        { type: 'armor',   x: 9.5,  y: 4.5  },
        { type: 'baguette',x: 6.5,  y: 8.5  },
        { type: 'coffee',  x: 15.5, y: 10.5 },
        { type: 'energy',  x: 11.5, y: 13.5 },
        { type: 'key',     x: 17.5, y: 17.5 },
        { type: 'energy',  x: 5.5,  y: 14.5 },
        { type: 'baguette',x: 16.5, y: 14.5 },
      ],
      torchWalls: [[2,2],[9,9],[13,13],[16,16]],
    },
  ];

  // ── Door State Manager ─────────────────────────────────

  class DoorManager {
    constructor(mapGrid) {
      this.grid = mapGrid.map(row => [...row]);
      this.doorStates = {};
    }

    isDoor(x, y) { return this.grid[y] && this.grid[y][x] === 6; }
    isExit(x, y) { return this.grid[y] && this.grid[y][x] === 9; }
    isWall(x, y) {
      if (!this.grid[y] || !this.grid[y][x]) return false;
      const v = this.grid[y][x];
      const key = `${x},${y}`;
      if (v === 6) {
        const state = this.doorStates[key];
        return !state || !state.open;
      }
      return v !== 0 && v !== 9;
    }
    getCell(x, y) { return this.grid[y] ? this.grid[y][x] : 1; }

    tryOpenDoor(x, y, hasKey) {
      if (!this.isDoor(x, y)) return false;
      const key = `${x},${y}`;
      if (!this.doorStates[key]) {
        if (!hasKey) return false;
        this.doorStates[key] = { open: false, timer: 0, opening: true };
        Audio2.playDoorOpen();
      }
      return true;
    }

    update(dt) {
      for (const key in this.doorStates) {
        const d = this.doorStates[key];
        if (d.opening) {
          d.timer += dt;
          if (d.timer > 0.8) { d.open = true; d.opening = false; }
        }
      }
    }

    isDoorOpen(x, y) {
      const key = `${x},${y}`;
      return this.doorStates[key]?.open === true;
    }
  }

  // ── Public API ─────────────────────────────────────────

  let currentLevel = 0;
  let doorManager  = null;
  let textures     = {};

  function isClear(map, tx, ty) {
    if (ty < 0 || ty >= map.length || tx < 0 || tx >= map[0].length) return false;
    const v = map[ty][tx];
    return v === 0 || v === 9;
  }

  function load(levelIndex) {
    currentLevel = levelIndex;
    const lv = levels[levelIndex];
    doorManager  = new DoorManager(lv.map);
    textures     = buildTextures(lv.paletteIndex);

    // ← ADD THIS — re-apply door PNG after buildTextures in case timing varies
    if (_doorImageData) textures[9] = _doorImageData;

   // Audio2.playMusic(lv.musicTrack);

    // Validate enemy positions
    const badEnemies = [];
    lv.enemies = lv.enemies.filter(e => {
      const tx = Math.floor(e.x);
      const ty = Math.floor(e.y);
      if (isClear(lv.map, tx, ty)) return true;
      badEnemies.push(`${e.type} @ (${e.x},${e.y}) → tile [${tx},${ty}] = ${lv.map[ty]?.[tx]}`);
      return false;
    });
    if (badEnemies.length)
      console.warn(`[Maps] Level ${levelIndex+1} — removed ${badEnemies.length} wall-spawned enemies:\n` + badEnemies.join('\n'));

    // Validate pickup positions
    const badPickups = [];
    lv.pickups = lv.pickups.filter(p => {
      const tx = Math.floor(p.x);
      const ty = Math.floor(p.y);
      if (isClear(lv.map, tx, ty)) return true;
      badPickups.push(`${p.type} @ (${p.x},${p.y}) → tile [${tx},${ty}] = ${lv.map[ty]?.[tx]}`);
      return false;
    });
    if (badPickups.length)
      console.warn(`[Maps] Level ${levelIndex+1} — removed ${badPickups.length} wall-spawned pickups:\n` + badPickups.join('\n'));

    return lv;
  }

  function getLevel()      { return levels[currentLevel]; }
  function getMap()        { return levels[currentLevel].map; }
  function getDoors()      { return doorManager; }
  function getTextures()   { return textures; }
  function getLevelCount() { return levels.length; }

  return {
    load, getLevel, getMap, getDoors, getTextures, getLevelCount, setDoorTexture,
  };
})();
