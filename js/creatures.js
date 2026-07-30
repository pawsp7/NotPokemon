/** Floral hybrid creatures of Blossom Route — pastel sakura style */
const CREATURES = [
  {
    id: "bloomvu",
    name: "Bloomvu",
    type: "Fairy",
    catchRate: 0.5,
    description: "A blossom fox crowned in sakura. Petals trail wherever it trots.",
    colors: {
      body: "#f3d0dc",
      light: "#fff0f5",
      mid: "#e8a8bc",
      dark: "#8b4a5c",
      outline: "#5c3040",
      eye: "#3a1824",
      flower: "#f2a0b8",
      flowerDeep: "#d4688a",
      glow: "#ffc4d4",
    },
    weight: 26,
  },
  {
    id: "lilypurr",
    name: "Lilypurr",
    type: "Water",
    catchRate: 0.58,
    description: "A pond cat wrapped in lily pads. Dew beads cling to its whiskers.",
    colors: {
      body: "#c8dff0",
      light: "#eef7ff",
      mid: "#8eb8d8",
      dark: "#4a6f8a",
      outline: "#3a5068",
      eye: "#243848",
      flower: "#f0b8d0",
      flowerDeep: "#c878a0",
      glow: "#b8dcf0",
    },
    weight: 28,
  },
  {
    id: "fernkit",
    name: "Fernkit",
    type: "Grass",
    catchRate: 0.55,
    description: "A soft rabbit sprouting fern curls. It naps under petal shade.",
    colors: {
      body: "#d8eccc",
      light: "#f2faec",
      mid: "#a8d090",
      dark: "#5a8050",
      outline: "#3f5a38",
      eye: "#243820",
      flower: "#f0c8a8",
      flowerDeep: "#d09070",
      glow: "#c8e8b0",
    },
    weight: 24,
  },
  {
    id: "petalamp",
    name: "Petalamp",
    type: "Electric",
    catchRate: 0.48,
    description: "A moth whose wisteria wings spark with gentle static pollen.",
    colors: {
      body: "#f5e4b8",
      light: "#fff8e4",
      mid: "#e0c878",
      dark: "#9a8040",
      outline: "#6a5830",
      eye: "#382818",
      flower: "#d8b8f0",
      flowerDeep: "#a070c8",
      glow: "#ffe8a0",
    },
    weight: 18,
  },
  {
    id: "roseroot",
    name: "Roseroot",
    type: "Rock",
    catchRate: 0.42,
    description: "A stony cub laced with rose vines. Soft moss grows in its cracks.",
    colors: {
      body: "#d4c0b0",
      light: "#f0e4d8",
      mid: "#b09888",
      dark: "#6a5848",
      outline: "#4a3a30",
      eye: "#2a2018",
      flower: "#e890a0",
      flowerDeep: "#b85868",
      glow: "#e0d0c0",
    },
    weight: 14,
  },
];

function getCreatureById(id) {
  return CREATURES.find((c) => c.id === id);
}

function rollWildEncounter(excludeIds = []) {
  const pool = CREATURES.filter((c) => !excludeIds.includes(c.id));
  const source = pool.length ? pool : CREATURES;
  const total = source.reduce((sum, c) => sum + c.weight, 0);
  let roll = Math.random() * total;
  for (const creature of source) {
    roll -= creature.weight;
    if (roll <= 0) return creature;
  }
  return source[source.length - 1];
}
