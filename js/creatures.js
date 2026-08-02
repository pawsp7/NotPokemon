/** 15 floral hybrids — Route, Grove, Shore */
const TYPES = ["Fairy", "Water", "Grass", "Electric", "Rock", "Ghost", "Dark", "Ice", "Fire", "Psychic"];

const TYPE_CHART = {
  Fairy: { Dark: 1.5, Fire: 0.75, Rock: 0.75 },
  Water: { Fire: 1.5, Rock: 1.5, Grass: 0.75 },
  Grass: { Water: 1.5, Rock: 1.5, Fire: 0.75 },
  Electric: { Water: 1.5, Grass: 0.75, Rock: 0.75 },
  Rock: { Fire: 1.5, Ice: 1.5, Grass: 0.75 },
  Ghost: { Ghost: 1.5, Psychic: 1.5, Dark: 0.75 },
  Dark: { Ghost: 1.5, Psychic: 1.5, Fairy: 0.75 },
  Ice: { Grass: 1.5, Fairy: 0.75, Fire: 0.75 },
  Fire: { Grass: 1.5, Ice: 1.5, Water: 0.75, Rock: 0.75 },
  Psychic: { Fairy: 1.25, Dark: 0.75, Ghost: 0.75 },
};

const CREATURES = [
  {
    id: "bloomvu",
    name: "Bloomvu",
    type: "Fairy",
    area: "route",
    catchRate: 0.5,
    description: "A blossom fox crowned in sakura. Petals trail wherever it trots.",
    colors: { glow: "#ffc4d4" },
    weight: 26,
    base: { hp: 42, atk: 38, def: 34, spd: 40 },
    moves: [
      { name: "Petal Tap", power: 18, type: "Fairy", accuracy: 1, desc: "A soft petal cuff.", effect: null },
      { name: "Bloom Dash", power: 24, type: "Fairy", accuracy: 0.95, desc: "Dashes in a petal swirl.", effect: { id: "glow", chance: 0.35, turns: 3 } },
    ],
  },
  {
    id: "lilypurr",
    name: "Lilypurr",
    type: "Water",
    area: "route",
    catchRate: 0.58,
    description: "A pond cat wrapped in lily pads. Dew beads cling to its whiskers.",
    colors: { glow: "#b8dcf0" },
    weight: 28,
    base: { hp: 40, atk: 36, def: 36, spd: 38 },
    moves: [
      { name: "Dew Slap", power: 18, type: "Water", accuracy: 1, desc: "A damp whisker slap.", effect: null },
      { name: "Lily Splash", power: 24, type: "Water", accuracy: 0.95, desc: "Soaks the foe in pondwater.", effect: { id: "wet", chance: 0.4, turns: 3 } },
    ],
  },
  {
    id: "fernkit",
    name: "Fernkit",
    type: "Grass",
    area: "route",
    catchRate: 0.55,
    description: "A soft rabbit sprouting fern curls. It naps under petal shade.",
    colors: { glow: "#c8e8b0" },
    weight: 24,
    base: { hp: 44, atk: 34, def: 38, spd: 36 },
    moves: [
      { name: "Leaf Nibble", power: 16, type: "Grass", accuracy: 1, desc: "A gentle leafy bite.", effect: null },
      { name: "Fern Whip", power: 22, type: "Grass", accuracy: 0.95, desc: "Whips with curling fronds.", effect: { id: "thorns", chance: 0.35, turns: 3 } },
    ],
  },
  {
    id: "petalamp",
    name: "Petalamp",
    type: "Electric",
    area: "route",
    catchRate: 0.48,
    description: "A moth whose wisteria wings spark with gentle static pollen.",
    colors: { glow: "#ffe8a0" },
    weight: 18,
    base: { hp: 36, atk: 42, def: 30, spd: 44 },
    moves: [
      { name: "Pollen Zap", power: 20, type: "Electric", accuracy: 0.95, desc: "Sparks through pollen dust.", effect: { id: "pollen", chance: 0.4, turns: 3 } },
      { name: "Static Flutter", power: 26, type: "Electric", accuracy: 0.9, desc: "A buzzing wing dash.", effect: { id: "glow", chance: 0.3, turns: 3 } },
    ],
  },
  {
    id: "roseroot",
    name: "Roseroot",
    type: "Rock",
    area: "route",
    catchRate: 0.42,
    description: "A stony cub laced with rose vines. Soft moss grows in its cracks.",
    colors: { glow: "#e0d0c0" },
    weight: 14,
    base: { hp: 48, atk: 40, def: 46, spd: 28 },
    moves: [
      { name: "Pebble Toss", power: 18, type: "Rock", accuracy: 0.95, desc: "Lobs a mossy pebble.", effect: null },
      { name: "Rose Crush", power: 26, type: "Rock", accuracy: 0.9, desc: "Crushes with vine-wrapped stone.", effect: { id: "thorns", chance: 0.3, turns: 3 } },
    ],
  },
  {
    id: "mistwing",
    name: "Mistwing",
    type: "Ghost",
    area: "grove",
    catchRate: 0.45,
    description: "A mist moth that drifts through fog. Touching it feels like cool silk.",
    colors: { glow: "#d8c8f0" },
    weight: 20,
    base: { hp: 38, atk: 40, def: 32, spd: 46 },
    moves: [
      { name: "Veil Touch", power: 18, type: "Ghost", accuracy: 1, desc: "A chilling silk brush.", effect: null },
      { name: "Phantom Gust", power: 25, type: "Ghost", accuracy: 0.95, desc: "A foggy gust that may sleep.", effect: { id: "sleep", chance: 0.3, turns: 2 } },
    ],
  },
  {
    id: "thornpaw",
    name: "Thornpaw",
    type: "Dark",
    area: "grove",
    catchRate: 0.44,
    description: "A bramble cat crowned in thorns and roses. Soft steps, sharp glare.",
    colors: { glow: "#c8a0b8" },
    weight: 16,
    base: { hp: 40, atk: 44, def: 34, spd: 42 },
    moves: [
      { name: "Bramble Scratch", power: 20, type: "Dark", accuracy: 1, desc: "Scratches with thorny pads.", effect: { id: "thorns", chance: 0.35, turns: 3 } },
      { name: "Night Bloom", power: 26, type: "Dark", accuracy: 0.9, desc: "A shadowy rose burst.", effect: { id: "poison", chance: 0.25, turns: 3 } },
    ],
  },
  {
    id: "glacilia",
    name: "Glacilia",
    type: "Ice",
    area: "grove",
    catchRate: 0.46,
    description: "A frost hare with crystal blossom ears. Breath like winter sugar.",
    colors: { glow: "#c8e8f8" },
    weight: 18,
    base: { hp: 42, atk: 38, def: 36, spd: 40 },
    moves: [
      { name: "Frost Nuzzle", power: 18, type: "Ice", accuracy: 1, desc: "A chilly nuzzle.", effect: null },
      { name: "Crystal Flurry", power: 25, type: "Ice", accuracy: 0.9, desc: "A flurry that may freeze.", effect: { id: "freeze", chance: 0.25, turns: 2 } },
    ],
  },
  {
    id: "emberose",
    name: "Emberose",
    type: "Fire",
    area: "grove",
    catchRate: 0.43,
    description: "A rose-fire fox. Warm petals flicker along its ember mane.",
    colors: { glow: "#ffc090" },
    weight: 17,
    base: { hp: 40, atk: 46, def: 32, spd: 44 },
    moves: [
      { name: "Ember Kiss", power: 20, type: "Fire", accuracy: 1, desc: "A warm spark kiss.", effect: { id: "burn", chance: 0.3, turns: 3 } },
      { name: "Roseflare", power: 27, type: "Fire", accuracy: 0.9, desc: "Blooms into a flare.", effect: { id: "burn", chance: 0.2, turns: 3 } },
    ],
  },
  {
    id: "crystalyn",
    name: "Crystalyn",
    type: "Psychic",
    area: "grove",
    catchRate: 0.4,
    description: "A crystal fawn whose antlers hum with soft thought-flowers.",
    colors: { glow: "#e0d0ff" },
    weight: 12,
    base: { hp: 44, atk: 42, def: 38, spd: 38 },
    moves: [
      { name: "Mind Petal", power: 19, type: "Psychic", accuracy: 1, desc: "A thought-petal strike.", effect: null },
      { name: "Prism Gaze", power: 28, type: "Psychic", accuracy: 0.9, desc: "A gaze that may sleep.", effect: { id: "sleep", chance: 0.3, turns: 2 } },
    ],
  },
  {
    id: "pearlotter",
    name: "Pearlotter",
    type: "Water",
    area: "shore",
    catchRate: 0.52,
    description: "A seafoam otter with a pearl-blossom collar. Loves tide pools.",
    colors: { glow: "#a8e0e8" },
    weight: 22,
    base: { hp: 42, atk: 40, def: 34, spd: 44 },
    moves: [
      { name: "Pearl Slap", power: 18, type: "Water", accuracy: 1, desc: "Slaps with a pearl.", effect: null },
      { name: "Tide Twirl", power: 25, type: "Water", accuracy: 0.95, desc: "Twirl that soaks the foe.", effect: { id: "wet", chance: 0.45, turns: 3 } },
    ],
  },
  {
    id: "coralclaw",
    name: "Coralclaw",
    type: "Rock",
    area: "shore",
    catchRate: 0.46,
    description: "A coral crab whose shell blooms like a reef flower.",
    colors: { glow: "#f0a8b8" },
    weight: 16,
    base: { hp: 46, atk: 44, def: 48, spd: 28 },
    moves: [
      { name: "Shell Pinch", power: 20, type: "Rock", accuracy: 1, desc: "A coral pincer pinch.", effect: null },
      { name: "Reef Crush", power: 27, type: "Rock", accuracy: 0.9, desc: "Crushes with reef weight.", effect: { id: "thorns", chance: 0.3, turns: 3 } },
    ],
  },
  {
    id: "kelpsong",
    name: "Kelpsong",
    type: "Grass",
    area: "shore",
    catchRate: 0.5,
    description: "A sandy seal pup wearing a kelp ribbon that hums softly.",
    colors: { glow: "#d8e8b0" },
    weight: 20,
    base: { hp: 48, atk: 34, def: 40, spd: 32 },
    moves: [
      { name: "Kelp Hug", power: 16, type: "Grass", accuracy: 1, desc: "A wrapping kelp hug.", effect: { id: "thorns", chance: 0.3, turns: 3 } },
      { name: "Shore Lullaby", power: 14, type: "Grass", accuracy: 0.95, desc: "A song that may sleep.", effect: { id: "sleep", chance: 0.4, turns: 2 } },
    ],
  },
  {
    id: "anemist",
    name: "Anemist",
    type: "Psychic",
    area: "shore",
    catchRate: 0.42,
    description: "A petal anemone-jellyfish that drifts on moonlit tide thoughts.",
    colors: { glow: "#f0c0e0" },
    weight: 14,
    base: { hp: 40, atk: 42, def: 36, spd: 40 },
    moves: [
      { name: "Drift Pulse", power: 19, type: "Psychic", accuracy: 1, desc: "A pulsing mindwave.", effect: null },
      { name: "Anemone Veil", power: 22, type: "Psychic", accuracy: 0.95, desc: "A veil that may poison.", effect: { id: "poison", chance: 0.35, turns: 3 } },
    ],
  },
  {
    id: "nightdrift",
    name: "Nightdrift",
    type: "Dark",
    area: "shore",
    catchRate: 0.38,
    description: "A pearl-dark eel that trails sakura sparks through midnight surf.",
    colors: { glow: "#c0a0d0" },
    weight: 11,
    base: { hp: 38, atk: 48, def: 32, spd: 46 },
    moves: [
      { name: "Ink Ribbon", power: 20, type: "Dark", accuracy: 1, desc: "Lashes with inky ribbon.", effect: { id: "pollen", chance: 0.3, turns: 3 } },
      { name: "Night Current", power: 28, type: "Dark", accuracy: 0.9, desc: "A dark undertow strike.", effect: { id: "sleep", chance: 0.2, turns: 2 } },
    ],
  },
];

function getCreatureById(id) {
  return CREATURES.find((c) => c.id === id);
}

/** Battle / UI move slot cap */
const MAX_MOVES = 2;

function activeMoves(creature) {
  const list = creature?.moves || [];
  return list.slice(0, MAX_MOVES);
}

function creaturesForArea(area) {
  return CREATURES.filter((c) => c.area === area);
}

function rollWildEncounter(area, excludeIds = []) {
  const pool = creaturesForArea(area).filter((c) => !excludeIds.includes(c.id));
  const source = pool.length ? pool : creaturesForArea(area);
  if (!source.length) return CREATURES[0];
  const total = source.reduce((sum, c) => sum + c.weight, 0);
  let roll = Math.random() * total;
  for (const creature of source) {
    roll -= creature.weight;
    if (roll <= 0) return creature;
  }
  return source[source.length - 1];
}

function typeMultiplier(moveType, targetType) {
  const row = TYPE_CHART[moveType];
  if (!row) return 1;
  return row[targetType] || 1;
}

function areaDisplayName(area) {
  if (area === "grove") return "Mist Grove";
  if (area === "shore") return "Tidebloom Shore";
  if (area === "town") return "Petalvale";
  if (area === "pen") return "Creature Pen";
  return "Blossom Route";
}
