/** Unique creatures found on Meadow Route */
const CREATURES = [
  {
    id: "pyrokit",
    name: "Pyrokit",
    type: "Fire",
    catchRate: 0.55,
    description: "A fox-kit whose tail tip never cools. Prefers sunlit grass.",
    colors: {
      body: "#e07a3a",
      accent: "#ffd27a",
      dark: "#8b3a1a",
      eye: "#2a1a10",
      glow: "#ffb347",
    },
    weight: 28,
  },
  {
    id: "aquibble",
    name: "Aquibble",
    type: "Water",
    catchRate: 0.6,
    description: "A puddle-dweller that hops between dewdrops after rain.",
    colors: {
      body: "#4a9fd4",
      accent: "#b8e4ff",
      dark: "#1f5f88",
      eye: "#102030",
      glow: "#7ec8ff",
    },
    weight: 30,
  },
  {
    id: "verdwing",
    name: "Verdwing",
    type: "Grass",
    catchRate: 0.52,
    description: "A leafy moth that fans soft pollen trails through meadows.",
    colors: {
      body: "#5cb85c",
      accent: "#c8f0a0",
      dark: "#2e6b2e",
      eye: "#1a2810",
      glow: "#9ee87a",
    },
    weight: 24,
  },
  {
    id: "voltmite",
    name: "Voltmite",
    type: "Electric",
    catchRate: 0.48,
    description: "A beetle that stores static in its shell and crackles when startled.",
    colors: {
      body: "#f0d040",
      accent: "#fff4a8",
      dark: "#a88410",
      eye: "#201800",
      glow: "#ffe566",
    },
    weight: 18,
  },
  {
    id: "gravpaw",
    name: "Gravpaw",
    type: "Rock",
    catchRate: 0.42,
    description: "A stony cub whose paws leave tiny pebble prints on the path.",
    colors: {
      body: "#9a8570",
      accent: "#d4c4a8",
      dark: "#5a4a38",
      eye: "#1c1810",
      glow: "#c8b090",
    },
    weight: 12,
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
