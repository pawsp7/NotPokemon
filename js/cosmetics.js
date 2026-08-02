/** Cosmetics, achievements, and unlockables */

const OUTFITS = [
  { id: "cloak_pink", name: "Petal Cloak", desc: "Your starting travel cloak.", unlock: "start" },
  { id: "coat_mint", name: "Mint Trek Coat", desc: "Fresh green for long walks.", unlock: "shop", price: 45 },
  { id: "cape_lavender", name: "Lavender Cape", desc: "A soft mage's wrap.", unlock: "shop", price: 60 },
  { id: "vest_coral", name: "Coral Vest", desc: "Bright explorer gear.", unlock: "achieve", achieve: "shore1" },
];

const ACCESSORIES = [
  { id: "clip_sakura", name: "Sakura Clip", slot: "hair", desc: "A tiny blossom pin.", unlock: "start" },
  { id: "hat_straw", name: "Ribbon Hat", slot: "hat", desc: "Keeps the sun soft.", unlock: "shop", price: 30 },
  { id: "crown_flower", name: "Flower Crown", slot: "hat", desc: "Petals for a champion.", unlock: "achieve", achieve: "catch10" },
  { id: "earrings_pearl", name: "Pearl Drops", slot: "face", desc: "Shorelight earrings.", unlock: "shop", price: 35 },
  { id: "scarf_leaf", name: "Leaf Scarf", slot: "neck", desc: "Woven fern silk.", unlock: "achieve", achieve: "catch5" },
  { id: "pendant_crystal", name: "Crystal Pendant", slot: "neck", desc: "Hums in the mist.", unlock: "achieve", achieve: "grove3" },
  { id: "brooch_rose", name: "Rose Brooch", slot: "chest", desc: "A thorny keepsake.", unlock: "shop", price: 40 },
  { id: "boots_soft", name: "Moss Boots", slot: "feet", desc: "Quiet steps on paths.", unlock: "achieve", achieve: "battles10" },
];

const ACHIEVEMENTS = [
  { id: "catch5", name: "Bloom Buddy", desc: "Record 5 creatures in the Dex." },
  { id: "catch10", name: "Petal Scholar", desc: "Record 10 creatures in the Dex." },
  { id: "catch15", name: "Tide Archivist", desc: "Record all 15 creatures." },
  { id: "grove3", name: "Mist Walker", desc: "Catch 3 Mist Grove creatures." },
  { id: "shore1", name: "Shore Strider", desc: "Catch your first Tidebloom Shore creature." },
  { id: "battles10", name: "Petal Pugilist", desc: "Win 10 wild battles." },
  { id: "pen3", name: "Caretaker", desc: "Keep 3 creatures in the Pen." },
];

function defaultCosmetics() {
  return {
    unlockedOutfits: ["cloak_pink"],
    unlockedAccessories: ["clip_sakura"],
    outfit: "cloak_pink",
    accessory: "clip_sakura",
    unlockedAchievements: [],
  };
}

function isOutfitUnlocked(cosmetics, outfitId) {
  return cosmetics.unlockedOutfits.includes(outfitId);
}

function isAccessoryUnlocked(cosmetics, accId) {
  return cosmetics.unlockedAccessories.includes(accId);
}

function evaluateAchievements(state) {
  const newly = [];
  const cos = state.cosmetics;
  const dex = state.dex;
  const groveCaught = CREATURES.filter((c) => c.area === "grove" && dex.has(c.id)).length;
  const shoreCaught = CREATURES.filter((c) => c.area === "shore" && dex.has(c.id)).length;

  const checks = {
    catch5: () => dex.size >= 5,
    catch10: () => dex.size >= 10,
    catch15: () => dex.size >= 15,
    grove3: () => groveCaught >= 3,
    shore1: () => shoreCaught >= 1,
    battles10: () => (state.battlesWon || 0) >= 10,
    pen3: () => (state.storage || []).length >= 3,
  };

  ACHIEVEMENTS.forEach((a) => {
    if (cos.unlockedAchievements.includes(a.id)) return;
    if (checks[a.id] && checks[a.id]()) {
      cos.unlockedAchievements.push(a.id);
      newly.push(a);
      // unlock linked cosmetics
      OUTFITS.filter((o) => o.unlock === "achieve" && o.achieve === a.id).forEach((o) => {
        if (!cos.unlockedOutfits.includes(o.id)) cos.unlockedOutfits.push(o.id);
      });
      ACCESSORIES.filter((o) => o.unlock === "achieve" && o.achieve === a.id).forEach((o) => {
        if (!cos.unlockedAccessories.includes(o.id)) cos.unlockedAccessories.push(o.id);
      });
    }
  });
  return newly;
}
