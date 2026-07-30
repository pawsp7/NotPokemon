/** Blossom Route collision map — walkable meadow with encounter grass */
const TILE = {
  GRASS: 0,
  PATH: 1,
  TALL: 2,
  TREE: 3,
  WATER: 4,
  FLOWER: 5,
  ROCK: 6,
};

const TILE_SIZE = 32;
const MAP_W = 20;
const MAP_H = 15;

/**
 * Roughly matches the painted sakura route:
 * border trees, winding path, tall grass pockets, lily pond, rocks.
 */
const MEADOW_MAP = [
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
];

function isSolid(tile) {
  return tile === TILE.TREE || tile === TILE.WATER || tile === TILE.ROCK;
}

function getTile(x, y) {
  if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return TILE.TREE;
  return MEADOW_MAP[y][x];
}

function isTallGrass(x, y) {
  return getTile(x, y) === TILE.TALL;
}
