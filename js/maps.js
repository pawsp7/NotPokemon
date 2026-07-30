/** Multi-screen maps: town, route, grove */

const TILE = {
  GRASS: 0,
  PATH: 1,
  TALL: 2,
  TREE: 3,
  WATER: 4,
  FLOWER: 5,
  ROCK: 6,
  FLOOR: 7,
};

const TILE_SIZE = 32;
const MAP_W = 20;
const MAP_H = 15;

function isSolid(tile) {
  return tile === TILE.TREE || tile === TILE.WATER || tile === TILE.ROCK;
}

const MAPS = {
  town: {
    id: "town",
    name: "Petalvale",
    bg: "town",
    encounter: false,
    start: { x: 10, y: 12 },
    grid: [
      [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
      [3, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 3],
      [3, 7, 6, 7, 7, 5, 7, 7, 7, 6, 7, 7, 7, 5, 7, 7, 7, 6, 7, 3],
      [3, 7, 7, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 7, 7, 3],
      [3, 7, 7, 1, 7, 7, 7, 7, 7, 1, 7, 7, 7, 7, 7, 7, 1, 7, 7, 3],
      [3, 7, 5, 1, 7, 7, 7, 7, 7, 1, 7, 7, 7, 7, 7, 7, 1, 5, 7, 3],
      [3, 7, 7, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 7, 7, 3],
      [3, 7, 7, 1, 7, 7, 7, 7, 7, 1, 7, 7, 7, 7, 7, 7, 1, 7, 7, 3],
      [3, 7, 7, 1, 7, 7, 7, 7, 7, 1, 7, 7, 7, 7, 7, 7, 1, 7, 7, 3],
      [3, 7, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 7, 3],
      [3, 7, 7, 7, 7, 7, 7, 7, 7, 1, 7, 7, 7, 7, 7, 7, 7, 7, 7, 3],
      [3, 7, 7, 7, 7, 7, 7, 7, 7, 1, 7, 7, 7, 7, 7, 7, 7, 7, 7, 3],
      [3, 7, 7, 5, 7, 7, 7, 7, 7, 1, 7, 7, 7, 7, 7, 5, 7, 7, 7, 3],
      [3, 7, 7, 7, 7, 7, 7, 7, 1, 1, 1, 7, 7, 7, 7, 7, 7, 7, 7, 3],
      [3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    ],
    warps: [{ x: 9, y: 14, to: "route", tx: 2, ty: 2, label: "to Blossom Route" }],
    npcs: [
      {
        id: "healer",
        x: 15,
        y: 5,
        name: "Nurse Sakura",
        kind: "heal",
        lines: ["Welcome to the Petal Shrine.", "I'll mend your party's wounds — rest easy."],
      },
      {
        id: "shop",
        x: 4,
        y: 5,
        name: "Vendor Moss",
        kind: "shop",
        lines: ["Petal goods for travelers!", "Orbs and tonics, fresh as dew."],
      },
      {
        id: "guide",
        x: 10,
        y: 8,
        name: "Elder Bloom",
        kind: "talk",
        lines: [
          "Catch creatures, raise a party, and explore beyond town.",
          "Blossom Route lies south. Mist Grove waits farther east.",
          "Talk to Nurse Sakura to heal. Buy supplies from Moss.",
        ],
      },
    ],
  },

  route: {
    id: "route",
    name: "Blossom Route",
    bg: "route",
    encounter: true,
    start: { x: 2, y: 2 },
    grid: [
      [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
      [3, 0, 5, 0, 0, 2, 2, 0, 0, 5, 0, 0, 0, 2, 2, 0, 6, 0, 5, 3],
      [3, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 3],
      [3, 5, 1, 0, 0, 2, 2, 1, 1, 1, 1, 1, 0, 2, 2, 0, 0, 1, 0, 3],
      [3, 0, 1, 0, 2, 2, 2, 0, 0, 5, 0, 1, 0, 2, 2, 2, 0, 1, 5, 3],
      [3, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 2, 0, 6, 1, 0, 3],
      [3, 5, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 3],
      [3, 0, 4, 4, 0, 0, 5, 0, 1, 0, 2, 2, 0, 0, 0, 0, 0, 1, 5, 3],
      [3, 0, 4, 4, 4, 0, 0, 0, 1, 1, 1, 1, 1, 0, 2, 2, 0, 1, 0, 3],
      [3, 5, 0, 0, 0, 0, 6, 0, 0, 0, 0, 0, 1, 1, 1, 2, 0, 1, 0, 3],
      [3, 0, 2, 2, 0, 0, 0, 0, 5, 0, 2, 0, 0, 0, 1, 1, 1, 1, 5, 3],
      [3, 0, 2, 2, 2, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 2, 2, 0, 0, 3],
      [3, 5, 0, 0, 1, 1, 1, 0, 0, 5, 0, 0, 1, 1, 1, 2, 0, 0, 6, 3],
      [3, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 5, 0, 0, 3],
      [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    ],
    warps: [
      { x: 2, y: 1, to: "town", tx: 9, ty: 12, label: "to Petalvale" },
      { x: 18, y: 8, to: "grove", tx: 2, ty: 7, label: "to Mist Grove" },
    ],
    npcs: [
      {
        id: "scout",
        x: 11,
        y: 6,
        name: "Scout Hana",
        kind: "talk",
        lines: [
          "Tall blossom grass hides the first five creatures.",
          "East path leads into Mist Grove — stranger blooms await.",
        ],
      },
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
      [3, 1, 1, 0, 0, 4, 4, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 3],
      [3, 0, 1, 0, 0, 4, 4, 4, 0, 5, 0, 2, 2, 0, 0, 0, 0, 1, 5, 3],
      [3, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 5, 0, 1, 0, 3],
      [3, 5, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 2, 0, 0, 0, 0, 1, 0, 3],
      [3, 0, 2, 0, 0, 0, 5, 0, 0, 1, 1, 1, 1, 1, 1, 0, 2, 1, 0, 3],
      [3, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 6, 0, 0, 1, 0, 2, 0, 5, 3],
      [3, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 3],
      [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    ],
    warps: [{ x: 1, y: 7, to: "route", tx: 17, ty: 8, label: "to Blossom Route" }],
    npcs: [
      {
        id: "mystic",
        x: 9,
        y: 4,
        name: "Mystic Rei",
        kind: "talk",
        lines: [
          "Five rare blooms haunt this mist…",
          "Mistwing, Thornpaw, Glacilia, Emberose, and Crystalyn.",
          "Raise your party before you wander too deep.",
        ],
      },
    ],
  },
};

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

// Back-compat aliases used by older helpers
function getTile(x, y) {
  return getTileOn(window.__currentMapId || "route", x, y);
}
function isTallGrass(x, y) {
  return isTallGrassOn(window.__currentMapId || "route", x, y);
}
