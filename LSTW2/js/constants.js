// ============================================================
//  LAURIE 2: DECAF RISING — Constants
//  All tunable game values live here. Edit freely.
// ============================================================

const C = {

  // ── Canvas / Viewport ──────────────────────────────────
  SCREEN_W: 800,
  SCREEN_H: 600,
  FOV: Math.PI / 3,           // 60° field of view
  HALF_FOV: Math.PI / 6,
  RAY_COUNT: 800,              // one ray per column
  MAX_DEPTH: 20,               // max raycast distance (map units)
  WALL_H_SCALE: 1.0,           // wall height multiplier

  // ── Player ─────────────────────────────────────────────
  PLAYER_SPEED: 3.5,           // map units per second
  PLAYER_ROT_SPEED: 2.2,       // radians per second (keyboard)
  PLAYER_MOUSE_SENS: 0.0025,   // mouse sensitivity
  PLAYER_START_HP: 100,
  PLAYER_START_ARMOR: 0,
  PLAYER_MAX_HP: 100,
  PLAYER_MAX_ARMOR: 100,
  PLAYER_COLLISION_R: 0.25,    // collision radius in map units

  // ── Weapons ────────────────────────────────────────────
  COFFEE_DAMAGE: 12,
  COFFEE_RANGE: 16,
  COFFEE_COOLDOWN: 180,        // ms between shots
  COFFEE_SPEED: 12,

  BAGUETTE_DAMAGE: 55,
  BAGUETTE_SPLASH_R: 1.8,      // map units
  BAGUETTE_START_AMMO: 3,
  BAGUETTE_SPEED: 6,
  BAGUETTE_GRAVITY: 0.012,

  GOJIRA_DAMAGE: 999,
  GOJIRA_SPLASH_R: 4.0,
  GOJIRA_CHARGE_RATE: 6.08,    // per second
  GOJIRA_KILL_BONUS: 15,       // charge added per kill

  // ── Enemies ────────────────────────────────────────────
  SPITTER_HP: 40,
  SPITTER_SPEED: 1.4,
  SPITTER_DAMAGE: 8,
  SPITTER_FIRE_RATE: 2200,     // ms between shots
  SPITTER_SHOT_SPEED: 5,

  ROLLER_HP: 25,
  ROLLER_SPEED: 3.8,
  ROLLER_DAMAGE: 15,
  ROLLER_MELEE_RANGE: 0.7,
  ROLLER_ATTACK_RATE: 800,

  BARREL_HP: 150,
  BARREL_SPEED: 0.8,
  BARREL_DAMAGE: 22,
  BARREL_FIRE_RATE: 3500,
  BARREL_SHOT_SPEED: 3.5,

  PRICILLA_HP: 600,
  PRICILLA_SPEED: 1.8,
  PRICILLA_PHASE2_HP: 300,
  PRICILLA_PHASE3_HP: 120,

  // ── Pickups ────────────────────────────────────────────
  COFFEE_CUP_HEAL: 25,
  ARMOR_SHARD_AMOUNT: 20,
  ENERGY_CANISTER_AMOUNT: 30,

  // ── Rendering ──────────────────────────────────────────
  TEXTURE_SIZE: 64,
  SPRITE_SCALE: 1.0,
  TORCH_FLICKER_SPEED: 0.08,
  TORCH_FLICKER_AMP: 0.18,

  // ── HUD ────────────────────────────────────────────────
  HUD_H: 80,                   // height of top HUD bar in px
  MINIMAP_SIZE: 160,
  MINIMAP_CELL: 8,

  // ── Particles ──────────────────────────────────────────
  TRAIL_LIFE: 18,              // frames a trail particle lives
  EXPLOSION_PARTICLES: 32,
  CONFETTI_COUNT: 200,

  // ── Screen Shake ───────────────────────────────────────
  SHAKE_DECAY: 0.9,
  SHAKE_MAGNITUDE: 18,

// Gojira Mode
  GOJIRA_MODE_DRAIN_RATE:   8,      // energy drained per second while active
  GOJIRA_LIGHTNING_DAMAGE: 60,      // damage per lightning breath hit
  GOJIRA_LIGHTNING_SPEED:  18,      // faster than coffee
  GOJIRA_LIGHTNING_SPLASH: 1.2,     // splash radius


  // ── Colors (level palettes) ────────────────────────────
  PALETTE: [
    // Level 1 — Cactus Flats
    {
      ceiling:  ['#3a2010', '#200c06'],
      floor:    ['#8B6914', '#5a4010'],
      fog:      '#1a0a04',
      wallBase: [210, 140, 60],   // RGB for distance shading
      accent:   '#c87020',
    },
    // Level 2 — Molten Corridors
    {
      ceiling:  ['#200808', '#0a0202'],
      floor:    ['#4a1a08', '#200a04'],
      fog:      '#0f0404',
      wallBase: [200, 80, 30],
      accent:   '#ff4020',
    },
    // Level 3 — Pricilla's Lair
    {
      ceiling:  ['#080818', '#020208'],
      floor:    ['#1a1a3a', '#0a0a18'],
      fog:      '#04040f',
      wallBase: [80, 60, 160],
      accent:   '#8060ff',
    },
  ],

  // ── Quips ──────────────────────────────────────────────
  PLAYER_QUIPS: [
    "That's for my morning blend!",
    "Decaf my foot!",
    "Extra hot, extra angry!",
    "You messed with the wrong barista!",
    "I take my justice like my espresso — fast and dark!",
    "Single origin beatdown incoming!",
  ],
  PLAYER_KILL_QUIPS: [
  "Extra foam, extra pain!",
  "That's for the decaf!",
  "Full strength only!",
  "Caffeinated justice!",
  "No refills for you.",
  "Should've ordered herbal tea.",
  "Grounds for termination.",
],
  PLAYER_HURT_QUIPS: [
  "Ow! My espresso!",
  "That's gonna leave a mark...",
  "Not the baguette arm!",
  "You'll pay for that!",
  "My croissant!!",
],

PLAYER_BAGUETTE_QUIPS: [
  "Taste the carbs!",
  "Baguette LAUNCH!",
  "Fully loaded sourdough!",
  "Pain ordinaire... PAIN EXTRAORDINAIRE!",
],

PLAYER_GOJIRA_QUIPS: [
  "GOJIRAAAAA!",
  "Maximum espresso!",
  "FEEL THE ROAST!",
  "DECAF THIS!",
],
  PRICILLA_QUIPS_IDLE: [
    "You can't stop DECAF, Pippa!",
    "Your beans are WEAK!",
    "I've already won. You just don't know it yet.",
    "How's the headache from withdrawal? 😈",
  ],
  PRICILLA_QUIPS_HURT: [
    "A lucky shot, nothing more!",
    "You scratched my MANICURE!",
    "Oh, it is ON now.",
    "I felt that. Good. Now I'm angry.",
  ],
  PRICILLA_QUIPS_PHASE2: [
    "Fine. TIME FOR PHASE TWO.",
    "You want the real Pricilla? HERE SHE IS.",
    "No more games. Only PAIN.",
  ],
  PRICILLA_QUIPS_PHASE3: [
    "IMPOSSIBLE! I AM DECAF INCARNATE!",
    "You'll need a refill for THIS!",
    "WITNESS MY FINAL FORM!",
  ],
GOJIRA_MODE_QUIPS: [
  "SKREEEONK!!",
  "FEEL MY ATOMIC BREATH!!",
  "I AM BECOME LIZARD!!",
  "YOUR SUFFERING PLEASES ME!!",
  "GOJIRA HUNGERS!!",
  "THIS CITY IS MINE!!",
  "YOU CALL THAT AN ATTACK?!",
  "RAAAAAAAHHH!!",
  ],
};

// Freeze to prevent accidental mutation
Object.freeze(C);
Object.freeze(C.PALETTE);
