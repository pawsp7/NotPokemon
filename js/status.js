/** Status effects & move helpers */

const STATUS_INFO = {
  burn: { name: "Burn", desc: "Takes light fire chip damage each turn.", color: "#e07040" },
  poison: { name: "Poison", desc: "Takes poison chip damage each turn.", color: "#a060c0" },
  sleep: { name: "Sleep", desc: "May skip turns until waking.", color: "#80a0d0" },
  freeze: { name: "Freeze", desc: "May skip turns until thawing.", color: "#70c8e8" },
  wet: { name: "Soaked", desc: "Defense softens while soaked.", color: "#5090c8" },
  pollen: { name: "Pollen", desc: "Accuracy dips in a pollen haze.", color: "#e8c860" },
  thorns: { name: "Thorns", desc: "Attack softens under bramble weight.", color: "#708050" },
  glow: { name: "Glow", desc: "Speed rises in a soft bloom light.", color: "#f0a0c8" },
  focus: { name: "Focus", desc: "Attack rises with clear focus.", color: "#c090e0" },
  ward: { name: "Ward", desc: "Defense rises behind a petal ward.", color: "#90b878" },
};

function formatMove(move) {
  const bits = [`${move.power} dmg`, move.type];
  if (move.accuracy != null && move.accuracy < 1) bits.push(`${Math.round(move.accuracy * 100)}% acc`);
  if (move.effect) {
    const info = STATUS_INFO[move.effect.id];
    const chance = move.effect.chance != null ? Math.round(move.effect.chance * 100) : 100;
    bits.push(`${chance}% ${info?.name || move.effect.id}`);
  }
  return bits.join(" · ");
}

function moveEffectLabel(move) {
  if (!move.effect) return "No extra effect";
  const info = STATUS_INFO[move.effect.id];
  const chance = move.effect.chance != null ? Math.round(move.effect.chance * 100) : 100;
  return `${chance}% chance: ${info?.name || move.effect.id} — ${info?.desc || ""}`;
}

function applyStatus(target, effectId, turns = 3) {
  if (!target || !effectId) return false;
  // beneficial self-buffs overwrite; harmful overwrite unless same
  target.status = { id: effectId, turns };
  return true;
}

function clearStatus(target) {
  if (target) target.status = null;
}

function statusDefenseMod(fighter) {
  const id = fighter?.status?.id;
  if (id === "wet") return 0.85;
  if (id === "ward") return 1.2;
  return 1;
}

function statusAttackMod(fighter) {
  const id = fighter?.status?.id;
  if (id === "thorns") return 0.85;
  if (id === "focus") return 1.2;
  if (id === "burn") return 0.9;
  return 1;
}

function statusSpeedMod(fighter) {
  const id = fighter?.status?.id;
  if (id === "glow") return 1.25;
  if (id === "freeze" || id === "sleep") return 0.5;
  return 1;
}

/** Returns { skip, log } for start-of-turn status handling */
function tickStatusStart(fighter, label) {
  if (!fighter?.status) return { skip: false, log: null };
  const st = fighter.status;
  st.turns -= 1;
  if (st.id === "sleep") {
    if (st.turns <= 0 || Math.random() < 0.35) {
      clearStatus(fighter);
      return { skip: false, log: `${label} woke up!` };
    }
    return { skip: true, log: `${label} is asleep…` };
  }
  if (st.id === "freeze") {
    if (st.turns <= 0 || Math.random() < 0.4) {
      clearStatus(fighter);
      return { skip: false, log: `${label} thawed out!` };
    }
    return { skip: true, log: `${label} is frozen solid!` };
  }
  if (st.turns <= 0 && ["glow", "focus", "ward", "wet", "pollen", "thorns"].includes(st.id)) {
    const name = STATUS_INFO[st.id]?.name || st.id;
    clearStatus(fighter);
    return { skip: false, log: `${label}'s ${name} faded.` };
  }
  return { skip: false, log: null };
}

/** End-of-turn chip damage */
function tickStatusEnd(fighter, label) {
  if (!fighter?.status) return null;
  const st = fighter.status;
  if (st.id === "burn" || st.id === "poison") {
    const chip = Math.max(2, Math.round(fighter.maxHp * (st.id === "burn" ? 0.06 : 0.05)));
    fighter.hp = Math.max(0, fighter.hp - chip);
    if (st.turns <= 0) clearStatus(fighter);
    return `${label} is hurt by ${STATUS_INFO[st.id].name}! (-${chip})`;
  }
  return null;
}

function tryInflictMoveEffect(move, user, target, userLabel, targetLabel) {
  if (!move?.effect) return null;
  const chance = move.effect.chance ?? 1;
  if (Math.random() > chance) return null;
  const id = move.effect.id;
  const selfBuff = ["glow", "focus", "ward"].includes(id);
  const who = selfBuff ? user : target;
  const whoLabel = selfBuff ? userLabel : targetLabel;
  const turns = move.effect.turns ?? (selfBuff ? 3 : 3);
  applyStatus(who, id, turns);
  const info = STATUS_INFO[id];
  return `${whoLabel} gained ${info?.name || id}!`;
}
