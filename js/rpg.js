/** RPG helpers: party, stats, skills, damage, inventory */

function xpToNext(level) {
  return 12 + level * 10;
}

function calcMaxHp(species, level, skills = {}) {
  return Math.round(species.base.hp + level * 4.2 + (skills.hp || 0) * 3);
}

function calcStat(base, level, bonus = 0) {
  return Math.round(base + level * 2.1 + bonus * 2);
}

function makePartyMember(speciesId, level = 5) {
  const species = getCreatureById(speciesId);
  const skills = { hp: 0, atk: 0, def: 0, spd: 0 };
  const maxHp = calcMaxHp(species, level, skills);
  return {
    uid: `${speciesId}-${Math.random().toString(36).slice(2, 7)}`,
    id: speciesId,
    level,
    xp: 0,
    hp: maxHp,
    maxHp,
    skills,
    skillPoints: 1,
  };
}

function refreshMemberStats(member) {
  const species = getCreatureById(member.id);
  const skills = member.skills || { hp: 0, atk: 0, def: 0, spd: 0 };
  member.skills = skills;
  if (member.skillPoints == null) member.skillPoints = 0;
  const ratio = member.maxHp > 0 ? member.hp / member.maxHp : 1;
  member.maxHp = calcMaxHp(species, member.level, skills);
  member.hp = Math.max(0, Math.min(member.maxHp, Math.round(member.maxHp * ratio)));
  return member;
}

function memberAttack(member) {
  return calcStat(getCreatureById(member.id).base.atk, member.level, member.skills?.atk || 0);
}

function memberDefense(member) {
  return calcStat(getCreatureById(member.id).base.def, member.level, member.skills?.def || 0);
}

function memberSpeed(member) {
  return calcStat(getCreatureById(member.id).base.spd, member.level, member.skills?.spd || 0);
}

function spendSkill(member, key) {
  if (!member.skillPoints || member.skillPoints <= 0) return false;
  if (!["hp", "atk", "def", "spd"].includes(key)) return false;
  member.skills[key] = (member.skills[key] || 0) + 1;
  member.skillPoints -= 1;
  refreshMemberStats(member);
  if (key === "hp") member.hp = Math.min(member.maxHp, member.hp + 3);
  return true;
}

function makeWildFighter(species, playerLevel) {
  const level = Math.max(3, playerLevel + Math.floor(Math.random() * 3) - 1);
  const maxHp = calcMaxHp(species, level, {});
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
    member.skillPoints = (member.skillPoints || 0) + 1;
    refreshMemberStats(member);
    member.hp = member.maxHp;
    logs.push(`${getCreatureById(member.id).name} grew to Lv.${member.level}! (+1 skill)`);
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

/** Player hitbox inset inside a tile (pixels) */
const PLAYER_HITBOX = { w: 14, h: 12, ox: 9, oy: 18 };
const NPC_HITBOX = { w: 18, h: 18, ox: 7, oy: 10 };

function hitboxAtTile(tx, ty, box) {
  return {
    x: tx * TILE_SIZE + box.ox,
    y: ty * TILE_SIZE + box.oy,
    w: box.w,
    h: box.h,
  };
}

function playerHitbox(px, py) {
  return {
    x: px + PLAYER_HITBOX.ox,
    y: py + PLAYER_HITBOX.oy,
    w: PLAYER_HITBOX.w,
    h: PLAYER_HITBOX.h,
  };
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
