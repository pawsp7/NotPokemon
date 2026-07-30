/** RPG helpers: party, stats, damage, inventory */

function xpToNext(level) {
  return 12 + level * 10;
}

function calcMaxHp(species, level) {
  return Math.round(species.base.hp + level * 4.2);
}

function calcStat(base, level) {
  return Math.round(base + level * 2.1);
}

function makePartyMember(speciesId, level = 5) {
  const species = getCreatureById(speciesId);
  const maxHp = calcMaxHp(species, level);
  return {
    uid: `${speciesId}-${Math.random().toString(36).slice(2, 7)}`,
    id: speciesId,
    level,
    xp: 0,
    hp: maxHp,
    maxHp,
  };
}

function refreshMemberStats(member) {
  const species = getCreatureById(member.id);
  const ratio = member.maxHp > 0 ? member.hp / member.maxHp : 1;
  member.maxHp = calcMaxHp(species, member.level);
  member.hp = Math.max(1, Math.min(member.maxHp, Math.round(member.maxHp * ratio)));
  return member;
}

function memberAttack(member) {
  return calcStat(getCreatureById(member.id).base.atk, member.level);
}

function memberDefense(member) {
  return calcStat(getCreatureById(member.id).base.def, member.level);
}

function memberSpeed(member) {
  return calcStat(getCreatureById(member.id).base.spd, member.level);
}

function makeWildFighter(species, playerLevel) {
  const level = Math.max(3, playerLevel + Math.floor(Math.random() * 3) - 1);
  const maxHp = calcMaxHp(species, level);
  return {
    id: species.id,
    species,
    level,
    hp: maxHp,
    maxHp,
  };
}

function damageAmount(attackerAtk, defenderDef, move, attackerType, defenderType) {
  const mult = typeMultiplier(move.type, defenderType);
  const raw = move.power + attackerAtk * 0.55 - defenderDef * 0.3;
  const variance = 0.85 + Math.random() * 0.3;
  return {
    dmg: Math.max(3, Math.round(raw * mult * variance)),
    mult,
  };
}

function catchChance(species, wildHpRatio, orbBonus = 0) {
  // easier when weakened
  const base = species.catchRate;
  const weakBonus = (1 - wildHpRatio) * 0.35;
  return Math.min(0.92, base + weakBonus + orbBonus);
}

function gainXp(member, amount) {
  const logs = [];
  member.xp += amount;
  let guard = 0;
  while (member.xp >= xpToNext(member.level) && member.level < 20 && guard < 10) {
    member.xp -= xpToNext(member.level);
    member.level += 1;
    refreshMemberStats(member);
    member.hp = member.maxHp;
    logs.push(`${getCreatureById(member.id).name} grew to Lv.${member.level}!`);
    guard += 1;
  }
  return logs;
}

const SHOP_ITEMS = [
  { id: "orb", name: "Catch Orb", price: 12, desc: "Used to catch wild creatures." },
  { id: "potion", name: "Petal Tonic", price: 10, desc: "Restores 28 HP to one ally." },
  { id: "hi_potion", name: "Bloom Balm", price: 22, desc: "Restores 55 HP to one ally." },
];

function defaultInventory() {
  return { orb: 15, potion: 3, hi_potion: 0 };
}
