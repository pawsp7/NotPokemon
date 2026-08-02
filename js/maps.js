/** Multi-screen maps with NPC sprites, icons, hitboxes, path-aligned warps */

const TILE = {
  GRASS: 0,
  PATH: 1,
  TALL: 2,
  TREE: 3,
  WATER: 4,
  FLOWER: 5,
  ROCK: 6,
  FLOOR: 7,
  FENCE: 8,
  BUILDING: 9,
  LEDGE: 10,
};

const TILE_SIZE = 32;
const MAP_W = 20;
const MAP_H = 15;

function isSolid(tile) {
  return (
    tile === TILE.TREE ||
    tile === TILE.WATER ||
    tile === TILE.ROCK ||
    tile === TILE.FENCE ||
    tile === TILE.BUILDING ||
    tile === TILE.LEDGE
  );
}

const MAPS = {
  town: {
    id: "town",
    name: "Petalvale",
    bg: "town",
    encounter: false,
    start: { x: 10, y: 12 },
    // Buildings, fences, water, crystal, stall blocked; paths kept open
    grid: [
      [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3],
      [3, 9, 9, 9, 8, 7, 7, 7, 9, 9, 1, 9, 9, 7, 9, 9, 9, 9, 7, 3],
      [3, 9, 9, 9, 8, 5, 7, 7, 9, 9, 1, 9, 9, 5, 9, 9, 9, 9, 7, 3],
      [3, 8, 8, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
      [3, 7, 5, 1, 9, 9, 9, 7, 7, 1, 7, 7, 7, 9, 9, 7, 1, 5, 7, 3],
      [3, 7, 7, 1, 9, 9, 9, 7, 7, 1, 7, 7, 9, 9, 9, 7, 1, 7, 7, 3],
      [3, 7, 7, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 7, 7, 3],
      [3, 4, 4, 1, 7, 7, 7, 7, 6, 6, 6, 7, 7, 7, 7, 7, 1, 7, 5, 3],
      [3, 4, 4, 1, 7, 7, 7, 7, 6, 7, 6, 7, 7, 9, 9, 7, 1, 7, 7, 3],
      [3, 7, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
      [3, 9, 9, 9, 7, 7, 7, 7, 7, 1, 7, 7, 7, 7, 9, 9, 9, 4, 4, 3],
      [3, 9, 9, 9, 7, 5, 7, 7, 7, 1, 7, 7, 5, 7, 9, 9, 9, 4, 4, 3],
      [3, 8, 8, 1, 1, 1, 7, 7, 7, 1, 7, 7, 7, 1, 1, 1, 8, 8, 7, 3],
      [3, 7, 7, 7, 7, 7, 7, 7, 1, 1, 1, 7, 7, 7, 7, 7, 7, 7, 7, 3],
      [3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    ],
    warps: [
      { x: 10, y: 14, to: "route", tx: 10, ty: 2, label: "↓ Blossom Route", icon: "warp", dir: "down" },
      { x: 9, y: 14, to: "route", tx: 10, ty: 2, label: "↓ Blossom Route", icon: "warp", dir: "down" },
      { x: 18, y: 9, to: "pen", tx: 4, ty: 12, label: "→ Creature Pen", icon: "pen", dir: "right" },
      { x: 10, y: 0, to: "route", tx: 10, ty: 2, label: "↑ Blossom Route", icon: "warp", dir: "up" },
    ],
    npcs: [
      { id: "healer", x: 15, y: 6, name: "Nurse Sakura", kind: "heal", sprite: "nurse", icon: "heal",
        lines: ["Welcome to the Petal Shrine.", "I'll mend your party's wounds — rest easy."] },
      { id: "shop", x: 4, y: 6, name: "Vendor Moss", kind: "shop", sprite: "vendor", icon: "shop",
        lines: ["Petal goods and boutique looks!", "Orbs, tonics, and outfits await."] },
      { id: "guide", x: 10, y: 9, name: "Elder Bloom", kind: "talk", sprite: "elder", icon: "talk",
        lines: [
          "Catch creatures, raise skills, and style your look.",
          "South stairs lead to Blossom Route. East path opens the Pen.",
          "Use the location menu above to teleport between areas.",
        ] },
      { id: "stylist", x: 7, y: 4, name: "Tailor Pip", kind: "style", sprite: "scout", icon: "mirror",
        lines: ["Need a new cloak or clip?", "Open the Style menu anytime with C — or talk to me!"] },
    ],
  },

  route: {
    id: "route",
    name: "Blossom Route",
    bg: "route",
    encounter: true,
    start: { x: 10, y: 2 },
    // Path spine north→south center, east branch to grove, ledges & trees solid
    grid: [
      [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3],
      [3, 0, 5, 0, 2, 2, 0, 10, 10, 10, 1, 10, 10, 10, 0, 2, 6, 0, 5, 3],
      [3, 0, 0, 0, 2, 2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 2, 0, 0, 0, 3],
      [3, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 3],
      [3, 0, 1, 0, 2, 2, 2, 0, 0, 5, 1, 0, 2, 2, 2, 0, 0, 1, 5, 3],
      [3, 0, 1, 0, 2, 2, 0, 0, 0, 0, 1, 0, 0, 2, 2, 0, 6, 1, 0, 3],
      [3, 5, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 3],
      [3, 0, 0, 4, 4, 0, 5, 0, 1, 0, 1, 0, 0, 0, 4, 4, 0, 1, 5, 3],
      [3, 0, 0, 4, 4, 4, 0, 0, 1, 1, 1, 1, 1, 1, 4, 4, 0, 1, 1, 1],
      [3, 5, 0, 0, 0, 0, 6, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 3],
      [3, 0, 2, 2, 0, 0, 0, 0, 5, 0, 1, 0, 2, 1, 1, 2, 0, 0, 5, 3],
      [3, 0, 2, 2, 2, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 2, 2, 0, 0, 3],
      [3, 5, 0, 0, 0, 0, 1, 0, 0, 5, 1, 0, 0, 0, 0, 2, 0, 0, 6, 3],
      [3, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 5, 0, 0, 3],
      [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    ],
    warps: [
      { x: 10, y: 0, to: "town", tx: 10, ty: 13, label: "↑ Petalvale", icon: "warp", dir: "up" },
      { x: 19, y: 8, to: "grove", tx: 2, ty: 7, label: "→ Mist Grove", icon: "warp", dir: "right" },
      { x: 18, y: 8, to: "grove", tx: 2, ty: 7, label: "→ Mist Grove", icon: "warp", dir: "right" },
      { x: 10, y: 14, to: "shore", tx: 10, ty: 2, label: "↓ Tidebloom Shore", icon: "warp", dir: "down" },
    ],
    npcs: [
      { id: "scout", x: 12, y: 6, name: "Scout Hana", kind: "talk", sprite: "scout", icon: "talk",
        lines: [
          "Tall grass hides the first five creatures.",
          "North stairs return to town. East path enters Mist Grove. South path reaches the shore.",
        ] },
    ],
  },

  grove: {
    id: "grove",
    name: "Mist Grove",
    bg: "grove",
    encounter: true,
    start: { x: 2, y: 7 },
    grid: [
      [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
      [3, 0, 0, 5, 0, 2, 2, 2, 0, 0, 5, 0, 2, 2, 0, 0, 6, 0, 0, 3],
      [3, 0, 1, 1, 1, 1, 0, 2, 0, 1, 1, 1, 1, 0, 2, 0, 0, 5, 0, 3],
      [3, 5, 1, 0, 2, 1, 0, 0, 0, 1, 0, 2, 1, 1, 1, 1, 1, 1, 0, 3],
      [3, 0, 1, 0, 2, 1, 1, 1, 1, 1, 0, 2, 2, 0, 0, 0, 0, 1, 5, 3],
      [3, 0, 1, 0, 0, 0, 0, 5, 0, 1, 0, 0, 2, 2, 2, 0, 6, 1, 0, 3],
      [3, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 2, 0, 0, 0, 1, 0, 3],
      [1, 1, 1, 0, 0, 4, 4, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 3],
      [3, 0, 1, 0, 0, 4, 4, 4, 0, 5, 0, 2, 2, 0, 0, 0, 0, 1, 5, 3],
      [3, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 5, 0, 1, 0, 3],
      [3, 5, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 2, 0, 0, 0, 0, 1, 0, 3],
      [3, 0, 2, 0, 0, 0, 5, 0, 0, 1, 1, 1, 1, 1, 1, 0, 2, 1, 0, 3],
      [3, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 6, 0, 0, 1, 0, 2, 0, 5, 3],
      [3, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 3],
      [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    ],
    warps: [
      { x: 0, y: 7, to: "route", tx: 17, ty: 8, label: "← Blossom Route", icon: "warp", dir: "left" },
      { x: 1, y: 7, to: "route", tx: 17, ty: 8, label: "← Blossom Route", icon: "warp", dir: "left" },
    ],
    npcs: [
      { id: "mystic", x: 9, y: 4, name: "Mystic Rei", kind: "talk", sprite: "mystic", icon: "talk",
        lines: [
          "Five rare blooms haunt this mist…",
          "Spend skill points after leveling — open Skills from Party.",
        ] },
    ],
  },

  shore: {
    id: "shore",
    name: "Tidebloom Shore",
    bg: "shore",
    encounter: true,
    start: { x: 10, y: 2 },
    grid: [
      [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3],
      [3, 0, 5, 0, 2, 2, 0, 0, 5, 0, 1, 0, 0, 2, 2, 0, 6, 0, 5, 3],
      [3, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 3],
      [3, 5, 1, 0, 0, 2, 2, 0, 0, 0, 1, 0, 2, 2, 0, 0, 0, 1, 0, 3],
      [3, 0, 1, 0, 2, 2, 2, 2, 0, 5, 1, 0, 2, 2, 2, 0, 0, 1, 5, 3],
      [3, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 2, 0, 6, 1, 0, 3],
      [3, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 3],
      [3, 5, 4, 4, 0, 0, 5, 0, 1, 0, 2, 0, 0, 0, 4, 4, 0, 1, 5, 3],
      [3, 0, 4, 4, 4, 0, 0, 0, 1, 1, 1, 1, 1, 0, 4, 4, 0, 1, 0, 3],
      [3, 0, 0, 0, 0, 0, 6, 0, 0, 0, 2, 0, 1, 0, 0, 0, 0, 1, 0, 3],
      [3, 0, 2, 2, 0, 0, 0, 0, 5, 0, 2, 0, 1, 1, 1, 2, 0, 1, 5, 3],
      [3, 5, 2, 2, 2, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 2, 2, 0, 0, 3],
      [3, 0, 0, 0, 1, 1, 1, 0, 0, 5, 0, 0, 0, 0, 0, 2, 0, 0, 6, 3],
      [3, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 5, 0, 0, 3],
      [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    ],
    warps: [{ x: 10, y: 0, to: "route", tx: 10, ty: 13, label: "↑ Blossom Route", icon: "warp", dir: "up" }],
    npcs: [
      { id: "tidekeeper", x: 14, y: 6, name: "Tidekeeper Ume", kind: "talk", sprite: "mystic", icon: "talk",
        lines: [
          "Five coastal blooms live in the tide grass.",
          "Pearlotter, Coralclaw, Kelpsong, Anemist, and Nightdrift.",
        ] },
    ],
  },

  pen: {
    id: "pen",
    name: "Creature Pen",
    bg: "pen",
    encounter: false,
    start: { x: 4, y: 12 },
    grid: [
      [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
      [3, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 3],
      [3, 8, 0, 0, 5, 0, 0, 0, 5, 0, 0, 0, 5, 0, 0, 0, 5, 0, 8, 3],
      [3, 8, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 8, 3],
      [3, 8, 5, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 5, 8, 3],
      [3, 8, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 8, 3],
      [3, 8, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 8, 3],
      [3, 8, 5, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 5, 8, 3],
      [3, 8, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 8, 3],
      [3, 8, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 8, 3],
      [3, 8, 5, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 5, 8, 3],
      [3, 8, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 8, 3],
      [3, 8, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 8, 3],
      [3, 8, 8, 8, 1, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 3],
      [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    ],
    pens: [
      { x: 4, y: 4 }, { x: 7, y: 4 }, { x: 12, y: 4 }, { x: 15, y: 4 },
      { x: 4, y: 7 }, { x: 7, y: 7 }, { x: 12, y: 7 }, { x: 15, y: 7 },
    ],
    warps: [{ x: 4, y: 13, to: "town", tx: 17, ty: 9, label: "← Petalvale", icon: "warp", dir: "down" }],
    npcs: [
      { id: "keeper", x: 9, y: 11, name: "Pen Keeper Ren", kind: "pen", sprite: "vendor", icon: "pen",
        lines: ["Welcome to the Creature Pen!", "Deposit party friends here, or admire your Dex blooms."] },
    ],
  },
};

/** Teleport destinations for the location dropdown */
const TRAVEL_POINTS = [
  { id: "town", name: "Petalvale", x: 10, y: 12 },
  { id: "route", name: "Blossom Route", x: 10, y: 3 },
  { id: "grove", name: "Mist Grove", x: 2, y: 7 },
  { id: "shore", name: "Tidebloom Shore", x: 10, y: 2 },
  { id: "pen", name: "Creature Pen", x: 4, y: 12 },
];

function getMap(id) {
  return MAPS[id];
}

function getTileOn(mapId, x, y) {
  const map = MAPS[mapId];
  if (!map) return TILE.TREE;
  if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return TILE.TREE;
  return map.grid[y][x];
}

function isTallGrassOn(mapId, x, y) {
  return getTileOn(mapId, x, y) === TILE.TALL;
}

function npcAt(mapId, x, y) {
  const map = MAPS[mapId];
  return map?.npcs?.find((n) => n.x === x && n.y === y) || null;
}

function warpAt(mapId, x, y) {
  const map = MAPS[mapId];
  return map?.warps?.find((w) => w.x === x && w.y === y) || null;
}

/** Tile blocked for movement, including NPC footprints */
function tileBlocked(mapId, x, y) {
  if (isSolid(getTileOn(mapId, x, y))) return true;
  if (npcAt(mapId, x, y)) return true;
  return false;
}

/**
 * Pixel-hitbox aware movement check for a proposed top-left tile pixel position.
 * Samples the player's feet hitbox against solid tiles and NPC boxes.
 */
function canOccupyPixels(mapId, px, py) {
  const box = playerHitbox(px, py);
  const samples = [
    [box.x, box.y],
    [box.x + box.w - 1, box.y],
    [box.x, box.y + box.h - 1],
    [box.x + box.w - 1, box.y + box.h - 1],
    [box.x + box.w / 2, box.y + box.h / 2],
  ];
  for (const [sx, sy] of samples) {
    const tx = Math.floor(sx / TILE_SIZE);
    const ty = Math.floor(sy / TILE_SIZE);
    if (isSolid(getTileOn(mapId, tx, ty))) return false;
  }
  const map = getMap(mapId);
  for (const n of map.npcs || []) {
    const nb = hitboxAtTile(n.x, n.y, NPC_HITBOX);
    if (rectsOverlap(box, nb)) return false;
  }
  return true;
}

function getTile(x, y) {
  return getTileOn(window.__currentMapId || "route", x, y);
}
function isTallGrass(x, y) {
  return isTallGrassOn(window.__currentMapId || "route", x, y);
}
