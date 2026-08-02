(() => {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const battleCanvas = document.getElementById("battle-sprite");
  const battleCtx = battleCanvas.getContext("2d");
  const allyCanvas = document.getElementById("ally-sprite");
  const allyCtx = allyCanvas.getContext("2d");
  const styleCanvas = document.getElementById("style-preview");
  const styleCtx = styleCanvas.getContext("2d");

  const screens = {
    title: document.getElementById("screen-title"),
    dialogue: document.getElementById("screen-dialogue"),
    shop: document.getElementById("screen-shop"),
    party: document.getElementById("screen-party"),
    skills: document.getElementById("screen-skills"),
    style: document.getElementById("screen-style"),
    pen: document.getElementById("screen-pen"),
    bag: document.getElementById("screen-bag"),
    battle: document.getElementById("screen-battle"),
    dex: document.getElementById("screen-dex"),
    win: document.getElementById("screen-win"),
  };

  const ui = {
    loc: document.getElementById("loc-pill"),
    money: document.getElementById("money-count"),
    orbs: document.getElementById("orb-count"),
    caught: document.getElementById("caught-count"),
    msg: document.getElementById("msg"),
    areaHint: document.getElementById("area-hint"),
    battleLog: document.getElementById("battle-log"),
    battleName: document.getElementById("battle-name"),
    battleType: document.getElementById("battle-type"),
    allyName: document.getElementById("ally-name"),
    allyHpFill: document.getElementById("ally-hp-fill"),
    allyHpText: document.getElementById("ally-hp-text"),
    foeHpFill: document.getElementById("foe-hp-fill"),
    foeHpText: document.getElementById("foe-hp-text"),
    mainActions: document.getElementById("battle-main-actions"),
    moveActions: document.getElementById("battle-move-actions"),
    dexList: document.getElementById("dex-list"),
    partyList: document.getElementById("party-list"),
    bagList: document.getElementById("bag-list"),
    bagTarget: document.getElementById("bag-target"),
    bagTargets: document.getElementById("bag-targets"),
    shopList: document.getElementById("shop-list"),
    shopMoney: document.getElementById("shop-money"),
    dlgName: document.getElementById("dlg-name"),
    dlgText: document.getElementById("dlg-text"),
    btnStart: document.getElementById("btn-start"),
    skillsBody: document.getElementById("skills-body"),
    outfitList: document.getElementById("outfit-list"),
    accessoryList: document.getElementById("accessory-list"),
    achieveList: document.getElementById("achieve-list"),
    styleSummary: document.getElementById("style-summary"),
    penList: document.getElementById("pen-list"),
  };

  const state = {
    mode: "title",
    ready: false,
    mapId: "town",
    player: { x: 10, y: 12, facing: "down", moving: false, px: 0, py: 0, tx: 0, ty: 0, t: 0, step: 0 },
    keys: new Set(),
    money: 80,
    inventory: defaultInventory(),
    party: [],
    storage: [],
    dex: new Set(),
    cosmetics: defaultCosmetics(),
    starter: null,
    battlesWon: 0,
    encounterCooldown: 0,
    wild: null,
    battleBusy: false,
    dialogue: null,
    bagItem: null,
    dexFilter: "all",
    shopTab: "items",
    penTab: "storage",
    animTime: 0,
    grassWave: 0,
    petals: [],
    selectedSkillUid: null,
  };

  window.__currentMapId = "town";
  const MOVE_DURATION = 0.12;
  const TOTAL_CREATURES = 15;

  for (let i = 0; i < 24; i++) {
    state.petals.push({
      x: Math.random() * 640,
      y: Math.random() * 480,
      s: 2 + Math.random() * 3,
      sp: 10 + Math.random() * 24,
      drift: 6 + Math.random() * 14,
      phase: Math.random() * Math.PI * 2,
      color: Math.random() > 0.45 ? "#ffb7c8" : "#fff5f8",
    });
  }

  function showScreen(name) {
    Object.entries(screens).forEach(([key, el]) => {
      const on = key === name;
      el.classList.toggle("hidden", !on);
      el.setAttribute("aria-hidden", on ? "false" : "true");
    });
  }

  function hideOverlays() {
    Object.values(screens).forEach((el) => {
      el.classList.add("hidden");
      el.setAttribute("aria-hidden", "true");
    });
  }

  function setMsg(text) {
    ui.msg.textContent = text;
  }

  function lead() {
    return state.party.find((m) => m.hp > 0) || state.party[0] || null;
  }

  function trainerLevel() {
    if (!state.party.length) return 5;
    return Math.round(state.party.reduce((s, m) => s + m.level, 0) / state.party.length);
  }

  function notifyAchievements() {
    const newly = evaluateAchievements(state);
    if (newly.length) {
      const names = newly.map((a) => a.name).join(", ");
      setMsg(`Achievement unlocked: ${names}!`);
    }
  }

  function updateHud() {
    const map = getMap(state.mapId);
    ui.loc.textContent = map?.name || state.mapId;
    ui.money.textContent = `❀ ${state.money}`;
    ui.orbs.textContent = `Orbs: ${state.inventory.orb}`;
    ui.caught.textContent = `Dex: ${state.dex.size}/${TOTAL_CREATURES}`;
    const hints = {
      town: "Petalvale · Space talk · East to Pen · South to Route",
      route: "Blossom Route · East Grove · South Shore",
      grove: "Mist Grove · Spend skill points after leveling",
      shore: "Tidebloom Shore · Five coastal blooms",
      pen: "Creature Pen · Space on Keeper to manage storage",
    };
    ui.areaHint.textContent = hints[state.mapId] || map?.name || "";
  }

  function placePlayer(x, y) {
    const p = state.player;
    p.x = x; p.y = y; p.tx = x; p.ty = y;
    p.px = x * TILE_SIZE; p.py = y * TILE_SIZE;
    p.moving = false;
  }

  function enterMap(mapId, x, y) {
    state.mapId = mapId;
    window.__currentMapId = mapId;
    const map = getMap(mapId);
    placePlayer(x ?? map.start.x, y ?? map.start.y);
    state.encounterCooldown = 0.6;
    updateHud();
    setMsg(`Entered ${map.name}.`);
  }

  function resetGame() {
    if (!state.ready || !state.starter) return;
    state.money = 80;
    state.inventory = defaultInventory();
    state.party = [makePartyMember(state.starter, 5)];
    state.storage = [];
    state.dex = new Set([state.starter]);
    state.cosmetics = defaultCosmetics();
    state.battlesWon = 0;
    state.wild = null;
    state.battleBusy = false;
    state.dialogue = null;
    enterMap("town");
    state.mode = "play";
    hideOverlays();
    setMsg(`${getCreatureById(state.starter).name} joins you! Visit the Pen, Style closet, and head south.`);
    updateHud();
  }

  function facingTile() {
    const p = state.player;
    let x = p.x, y = p.y;
    if (p.facing === "up") y -= 1;
    if (p.facing === "down") y += 1;
    if (p.facing === "left") x -= 1;
    if (p.facing === "right") x += 1;
    return { x, y };
  }

  function tryMove(dx, dy) {
    if (state.mode !== "play" || state.player.moving) return;
    const p = state.player;
    const nx = p.x + dx;
    const ny = p.y + dy;
    if (dx > 0) p.facing = "right";
    else if (dx < 0) p.facing = "left";
    else if (dy > 0) p.facing = "down";
    else if (dy < 0) p.facing = "up";

    if (npcAt(state.mapId, nx, ny)) {
      setMsg("Press Space to talk.");
      return;
    }

    // hitbox-aware: check destination pixel occupancy
    const destPx = nx * TILE_SIZE;
    const destPy = ny * TILE_SIZE;
    const isWarp = !!warpAt(state.mapId, nx, ny);
    if (!isWarp && !canOccupyPixels(state.mapId, destPx, destPy)) {
      setMsg("Something blocks the way.");
      return;
    }
    if (!isWarp && tileBlocked(state.mapId, nx, ny) && !warpAt(state.mapId, nx, ny)) {
      setMsg("Something blocks the way.");
      return;
    }

    p.moving = true;
    p.tx = nx; p.ty = ny; p.t = 0; p.step += 1;
  }

  function finishStep() {
    const p = state.player;
    p.x = p.tx; p.y = p.ty;
    p.px = p.x * TILE_SIZE; p.py = p.y * TILE_SIZE;
    p.moving = false;

    const warp = warpAt(state.mapId, p.x, p.y);
    if (warp) {
      enterMap(warp.to, warp.tx, warp.ty);
      setMsg(warp.label);
      return;
    }

    const map = getMap(state.mapId);
    if (!map.encounter || state.encounterCooldown > 0) return;
    if (isTallGrassOn(state.mapId, p.x, p.y) && Math.random() < 0.22) startBattle();
    else if (isTallGrassOn(state.mapId, p.x, p.y)) setMsg("The grass whispers…");
  }

  function interact() {
    if (state.mode !== "play") return;
    const { x, y } = facingTile();
    const npc = npcAt(state.mapId, x, y) || npcAt(state.mapId, state.player.x, state.player.y);
    if (!npc) {
      // pen creature view
      if (state.mapId === "pen") {
        const slot = getMap("pen").pens.find((s) => s.x === x && s.y === y);
        if (slot) {
          const idx = getMap("pen").pens.indexOf(slot);
          const stored = state.storage[idx];
          if (stored) {
            const sp = getCreatureById(stored.id);
            setMsg(`${sp.name} Lv.${stored.level} rests happily in the pen.`);
            return;
          }
        }
      }
      setMsg("Nothing to talk to.");
      return;
    }
    openDialogue(npc);
  }

  function openDialogue(npc) {
    state.dialogue = { npc, i: 0 };
    state.mode = "dialogue";
    ui.dlgName.textContent = npc.name;
    ui.dlgText.textContent = npc.lines[0];
    showScreen("dialogue");
  }

  function advanceDialogue() {
    if (!state.dialogue) return;
    const { npc } = state.dialogue;
    state.dialogue.i += 1;
    if (state.dialogue.i < npc.lines.length) {
      ui.dlgText.textContent = npc.lines[state.dialogue.i];
      return;
    }
    hideOverlays();
    if (npc.kind === "heal") {
      state.party.forEach((m) => { m.hp = m.maxHp; });
      setMsg("Your party was fully healed at the Petal Shrine.");
      state.mode = "play";
    } else if (npc.kind === "shop") {
      openShop();
    } else if (npc.kind === "style") {
      openStyle();
    } else if (npc.kind === "pen") {
      openPen();
    } else {
      state.mode = "play";
      setMsg(`${npc.name} nods kindly.`);
    }
    state.dialogue = null;
  }

  function openShop() {
    state.mode = "shop";
    state.shopTab = "items";
    document.querySelectorAll(".shop-tab").forEach((t) => t.classList.toggle("active", t.dataset.shop === "items"));
    renderShop();
    showScreen("shop");
  }

  function renderShop() {
    ui.shopMoney.textContent = `Your petals: ${state.money}`;
    ui.shopList.innerHTML = "";
    if (state.shopTab === "items") {
      SHOP_ITEMS.forEach((item) => {
        const li = document.createElement("li");
        li.className = "shop-item";
        li.innerHTML = `<div><strong>${item.name}</strong><p class="hint" style="margin:0.2rem 0 0">${item.desc}</p></div>`;
        const btn = document.createElement("button");
        btn.className = "cta";
        btn.style.minWidth = "90px";
        btn.textContent = `${item.price}❀`;
        btn.onclick = () => {
          if (state.money < item.price) return setMsg("Not enough petals.");
          state.money -= item.price;
          state.inventory[item.id] = (state.inventory[item.id] || 0) + 1;
          updateHud();
          renderShop();
          setMsg(`Bought ${item.name}.`);
        };
        li.appendChild(btn);
        ui.shopList.appendChild(li);
      });
    } else {
      [...OUTFITS, ...ACCESSORIES]
        .filter((o) => o.unlock === "shop")
        .forEach((item) => {
          const isOutfit = !!OUTFITS.find((o) => o.id === item.id);
          const owned = isOutfit
            ? isOutfitUnlocked(state.cosmetics, item.id)
            : isAccessoryUnlocked(state.cosmetics, item.id);
          const li = document.createElement("li");
          li.className = "shop-item";
          const thumb = isOutfit
            ? `assets/world/player_${item.id}.png`
            : `assets/cosmetics/${item.id}.png`;
          li.innerHTML = `<div style="display:flex;gap:0.5rem;align-items:center"><img src="${thumb}" width="40" height="40" alt=""/><div><strong>${item.name}</strong><p class="hint" style="margin:0.2rem 0 0">${item.desc}</p></div></div>`;
          const btn = document.createElement("button");
          btn.className = owned ? "ghost" : "cta";
          btn.style.minWidth = "90px";
          btn.textContent = owned ? "Owned" : `${item.price}❀`;
          btn.disabled = owned;
          btn.onclick = () => {
            if (state.money < item.price) return setMsg("Not enough petals.");
            state.money -= item.price;
            if (isOutfit) state.cosmetics.unlockedOutfits.push(item.id);
            else state.cosmetics.unlockedAccessories.push(item.id);
            updateHud();
            renderShop();
            setMsg(`Unlocked ${item.name}!`);
          };
          li.appendChild(btn);
          ui.shopList.appendChild(li);
        });
    }
  }

  function closeMenuToPlay() {
    state.mode = "play";
    hideOverlays();
  }

  function openParty() {
    if (state.mode === "battle" || state.mode === "title") return;
    state.mode = "party";
    renderParty();
    showScreen("party");
  }

  function renderParty() {
    ui.partyList.innerHTML = "";
    state.party.forEach((m, idx) => {
      const sp = getCreatureById(m.id);
      const li = document.createElement("li");
      li.className = `party-item${idx === 0 ? " lead" : ""}`;
      li.innerHTML = `
        <img src="${ASSET_URLS[m.id]}" alt="${sp.name}" />
        <div>
          <strong>${sp.name}</strong> · Lv.${m.level}
          <div class="hp-bar"><i style="width:${Math.round((m.hp / m.maxHp) * 100)}%"></i></div>
          <span>${m.hp}/${m.maxHp} · Skills ${m.skillPoints || 0}</span>
        </div>
        <span class="type-tag type-${sp.type.toLowerCase()}">${sp.type}</span>`;
      li.onclick = () => {
        if (idx === 0) return;
        const [picked] = state.party.splice(idx, 1);
        state.party.unshift(picked);
        renderParty();
        setMsg(`${getCreatureById(picked.id).name} is now the lead.`);
      };
      ui.partyList.appendChild(li);
    });
  }

  function openSkills() {
    if (state.mode === "battle" || state.mode === "title") return;
    state.mode = "skills";
    if (!state.selectedSkillUid && state.party[0]) state.selectedSkillUid = state.party[0].uid;
    renderSkills();
    showScreen("skills");
  }

  function renderSkills() {
    const body = ui.skillsBody;
    body.innerHTML = "";
    if (!state.party.length) {
      body.innerHTML = "<p>No party members.</p>";
      return;
    }
    const tabs = document.createElement("div");
    tabs.className = "dex-tabs";
    state.party.forEach((m) => {
      const sp = getCreatureById(m.id);
      const b = document.createElement("button");
      b.className = `ghost dex-tab${m.uid === state.selectedSkillUid ? " active" : ""}`;
      b.textContent = sp.name;
      b.onclick = () => { state.selectedSkillUid = m.uid; renderSkills(); };
      tabs.appendChild(b);
    });
    body.appendChild(tabs);

    const m = state.party.find((p) => p.uid === state.selectedSkillUid) || state.party[0];
    state.selectedSkillUid = m.uid;
    refreshMemberStats(m);
    const sp = getCreatureById(m.id);
    const box = document.createElement("div");
    box.className = "skills-card";
    box.innerHTML = `
      <div class="skills-head">
        <img src="${ASSET_URLS[m.id]}" width="64" height="64" alt=""/>
        <div>
          <strong>${sp.name}</strong> Lv.${m.level}<br/>
          Points available: <b>${m.skillPoints || 0}</b><br/>
          ATK ${memberAttack(m)} · DEF ${memberDefense(m)} · SPD ${memberSpeed(m)} · HP ${m.maxHp}
        </div>
      </div>`;
    const rows = document.createElement("div");
    rows.className = "skills-rows";
    ["hp", "atk", "def", "spd"].forEach((key) => {
      const row = document.createElement("div");
      row.className = "skill-row";
      row.innerHTML = `<span>${key.toUpperCase()} · ${m.skills[key] || 0}</span>`;
      const btn = document.createElement("button");
      btn.className = "cta";
      btn.textContent = "+";
      btn.disabled = !(m.skillPoints > 0);
      btn.onclick = () => {
        if (spendSkill(m, key)) {
          setMsg(`Invested in ${sp.name}'s ${key.toUpperCase()}.`);
          renderSkills();
        }
      };
      row.appendChild(btn);
      rows.appendChild(row);
    });
    box.appendChild(rows);
    body.appendChild(box);
  }

  function openStyle() {
    if (state.mode === "battle" || state.mode === "title") return;
    state.mode = "style";
    renderStyle();
    showScreen("style");
  }

  function renderStyle() {
    const cos = state.cosmetics;
    const outfit = OUTFITS.find((o) => o.id === cos.outfit);
    const acc = ACCESSORIES.find((a) => a.id === cos.accessory);
    ui.styleSummary.textContent = `${outfit?.name || "—"} · ${acc?.name || "None"}`;
    styleCtx.clearRect(0, 0, 128, 128);
    styleCtx.fillStyle = "#f7d0dc";
    styleCtx.fillRect(0, 0, 128, 128);
    drawPlayer(styleCtx, 48, 48, "down", 0, cos.outfit, cos.accessory, state.animTime);

    ui.outfitList.innerHTML = "";
    OUTFITS.forEach((o) => {
      const unlocked = isOutfitUnlocked(cos, o.id);
      const li = document.createElement("li");
      li.className = "shop-item";
      li.innerHTML = `<div style="display:flex;gap:.5rem;align-items:center"><img src="assets/world/player_${o.id}.png" width="40" height="40"/><div><strong>${o.name}</strong><p class="hint" style="margin:.2rem 0 0">${unlocked ? o.desc : "Locked — " + (o.unlock === "shop" ? "buy in Boutique" : "achievement")}</p></div></div>`;
      const btn = document.createElement("button");
      btn.className = cos.outfit === o.id ? "ghost" : "cta";
      btn.textContent = !unlocked ? "Locked" : cos.outfit === o.id ? "Wearing" : "Wear";
      btn.disabled = !unlocked || cos.outfit === o.id;
      btn.onclick = () => { cos.outfit = o.id; renderStyle(); setMsg(`Wearing ${o.name}.`); };
      li.appendChild(btn);
      ui.outfitList.appendChild(li);
    });

    ui.accessoryList.innerHTML = "";
    ACCESSORIES.forEach((a) => {
      const unlocked = isAccessoryUnlocked(cos, a.id);
      const li = document.createElement("li");
      li.className = "shop-item";
      li.innerHTML = `<div style="display:flex;gap:.5rem;align-items:center"><img src="assets/cosmetics/${a.id}.png" width="40" height="40"/><div><strong>${a.name}</strong><p class="hint" style="margin:.2rem 0 0">${unlocked ? a.desc : "Locked"}</p></div></div>`;
      const btn = document.createElement("button");
      btn.className = cos.accessory === a.id ? "ghost" : "cta";
      btn.textContent = !unlocked ? "Locked" : cos.accessory === a.id ? "Equipped" : "Equip";
      btn.disabled = !unlocked || cos.accessory === a.id;
      btn.onclick = () => { cos.accessory = a.id; renderStyle(); setMsg(`Equipped ${a.name}.`); };
      li.appendChild(btn);
      ui.accessoryList.appendChild(li);
    });

    ui.achieveList.innerHTML = "";
    ACHIEVEMENTS.forEach((a) => {
      const done = cos.unlockedAchievements.includes(a.id);
      const li = document.createElement("li");
      li.className = "shop-item";
      li.innerHTML = `<div><strong>${done ? "✓ " : ""}${a.name}</strong><p class="hint" style="margin:.2rem 0 0">${a.desc}</p></div><span class="type-tag">${done ? "Done" : "…"}</span>`;
      ui.achieveList.appendChild(li);
    });
  }

  function openPen() {
    if (state.mode === "battle" || state.mode === "title") return;
    state.mode = "pen";
    state.penTab = "storage";
    document.querySelectorAll(".pen-tab").forEach((t) => t.classList.toggle("active", t.dataset.pen === "storage"));
    renderPen();
    showScreen("pen");
  }

  function renderPen() {
    ui.penList.innerHTML = "";
    if (state.penTab === "storage") {
      if (!state.storage.length) {
        ui.penList.innerHTML = `<li class="party-item"><div><strong>Pen is empty</strong><p class="hint">Deposit party creatures to store them.</p></div></li>`;
        return;
      }
      state.storage.forEach((m, idx) => {
        const sp = getCreatureById(m.id);
        const li = document.createElement("li");
        li.className = "party-item";
        li.innerHTML = `<img src="${ASSET_URLS[m.id]}"/><div><strong>${sp.name}</strong> Lv.${m.level}<br/><span>${m.hp}/${m.maxHp} HP</span></div>`;
        const btn = document.createElement("button");
        btn.className = "cta";
        btn.textContent = "Withdraw";
        btn.onclick = () => {
          if (state.party.length >= 3) return setMsg("Party is full (max 3).");
          const [pulled] = state.storage.splice(idx, 1);
          state.party.push(pulled);
          notifyAchievements();
          renderPen();
          updateHud();
          setMsg(`${sp.name} rejoined the party.`);
        };
        li.appendChild(btn);
        ui.penList.appendChild(li);
      });
    } else if (state.penTab === "party") {
      state.party.forEach((m, idx) => {
        const sp = getCreatureById(m.id);
        const li = document.createElement("li");
        li.className = "party-item";
        li.innerHTML = `<img src="${ASSET_URLS[m.id]}"/><div><strong>${sp.name}</strong> Lv.${m.level}</div>`;
        const btn = document.createElement("button");
        btn.className = "ghost";
        btn.textContent = "Deposit";
        btn.disabled = state.party.length <= 1;
        btn.onclick = () => {
          if (state.party.length <= 1) return setMsg("Keep at least one party member.");
          if (state.storage.length >= 8) return setMsg("Pen stalls are full.");
          const [dep] = state.party.splice(idx, 1);
          state.storage.push(dep);
          notifyAchievements();
          renderPen();
          updateHud();
          setMsg(`${sp.name} rests in the Pen.`);
        };
        li.appendChild(btn);
        ui.penList.appendChild(li);
      });
    } else {
      CREATURES.filter((c) => state.dex.has(c.id)).forEach((c) => {
        const li = document.createElement("li");
        li.className = "party-item";
        li.innerHTML = `<img src="${ASSET_URLS[c.id]}"/><div><strong>${c.name}</strong><p class="hint" style="margin:.2rem 0 0">${c.description}</p></div><span class="type-tag type-${c.type.toLowerCase()}">${c.type}</span>`;
        ui.penList.appendChild(li);
      });
    }
  }

  function openBag() {
    if (state.mode === "battle" || state.mode === "title") return;
    state.mode = "bag";
    state.bagItem = null;
    ui.bagTarget.classList.add("hidden");
    renderBag();
    showScreen("bag");
  }

  function renderBag() {
    ui.bagList.innerHTML = "";
    [
      { id: "orb", name: "Catch Orb", desc: "Catch wild creatures in battle." },
      { id: "potion", name: "Petal Tonic", desc: "Restore 28 HP." },
      { id: "hi_potion", name: "Bloom Balm", desc: "Restore 55 HP." },
    ].forEach((item) => {
      const count = state.inventory[item.id] || 0;
      const li = document.createElement("li");
      li.className = "shop-item";
      li.innerHTML = `<div><strong>${item.name} ×${count}</strong><p class="hint" style="margin:0.2rem 0 0">${item.desc}</p></div>`;
      if (item.id !== "orb" && count > 0) {
        const btn = document.createElement("button");
        btn.className = "ghost";
        btn.textContent = "Use";
        btn.onclick = () => {
          state.bagItem = item.id;
          ui.bagTarget.classList.remove("hidden");
          ui.bagTargets.innerHTML = "";
          state.party.forEach((m) => {
            const sp = getCreatureById(m.id);
            const b = document.createElement("button");
            b.className = "starter-card";
            b.innerHTML = `<img src="${ASSET_URLS[m.id]}" alt=""/><span>${sp.name}</span>`;
            b.onclick = () => {
              const heal = item.id === "hi_potion" ? 55 : 28;
              const before = m.hp;
              m.hp = Math.min(m.maxHp, m.hp + heal);
              state.inventory[item.id] -= 1;
              setMsg(`${sp.name} recovered ${m.hp - before} HP.`);
              ui.bagTarget.classList.add("hidden");
              renderBag();
              updateHud();
            };
            ui.bagTargets.appendChild(b);
          });
        };
        li.appendChild(btn);
      }
      ui.bagList.appendChild(li);
    });
  }

  // ---- Battle ----
  function startBattle() {
    if (!lead() || lead().hp <= 0) {
      setMsg("Your party is too weary. Heal in Petalvale!");
      return;
    }
    const species = rollWildEncounter(state.mapId, []);
    state.wild = makeWildFighter(species, trainerLevel());
    state.mode = "battle";
    state.battleBusy = false;
    state.encounterCooldown = 0.9;
    ui.battleName.textContent = `${species.name} Lv.${state.wild.level}`;
    ui.battleType.textContent = species.type;
    ui.battleType.className = `type-tag type-${species.type.toLowerCase()}`;
    ui.battleLog.textContent = `A wild ${species.name} appeared!`;
    ui.mainActions.classList.remove("hidden");
    ui.moveActions.classList.add("hidden");
    updateBattleBars();
    drawBattleSprites();
    showScreen("battle");
    setMsg(`Battle! ${species.name}`);
  }

  function updateBattleBars() {
    const ally = lead();
    const sp = getCreatureById(ally.id);
    ui.allyName.textContent = `${sp.name} Lv.${ally.level}`;
    const ap = Math.max(0, ally.hp / ally.maxHp);
    ui.allyHpFill.style.width = `${Math.round(ap * 100)}%`;
    ui.allyHpFill.classList.toggle("low", ap < 0.35);
    ui.allyHpText.textContent = `${ally.hp}/${ally.maxHp}`;
    const wp = Math.max(0, state.wild.hp / state.wild.maxHp);
    ui.foeHpFill.style.width = `${Math.round(wp * 100)}%`;
    ui.foeHpFill.classList.toggle("low", wp < 0.35);
    ui.foeHpText.textContent = `${state.wild.hp}/${state.wild.maxHp}`;
  }

  function drawBattleSprites(shakeX = 0) {
    battleCtx.clearRect(0, 0, battleCanvas.width, battleCanvas.height);
    allyCtx.clearRect(0, 0, allyCanvas.width, allyCanvas.height);
    if (state.wild) drawCreature(battleCtx, state.wild.species, battleCanvas.width / 2 + shakeX, battleCanvas.height / 2 + 8, 1.05);
    const ally = lead();
    if (ally) drawCreature(allyCtx, getCreatureById(ally.id), allyCanvas.width / 2, allyCanvas.height / 2 + 6, 0.85);
  }

  function showMoves() {
    const ally = lead();
    const sp = getCreatureById(ally.id);
    ui.mainActions.classList.add("hidden");
    ui.moveActions.classList.remove("hidden");
    ui.moveActions.innerHTML = "";
    sp.moves.forEach((move) => {
      const btn = document.createElement("button");
      btn.className = "cta";
      btn.textContent = move.name;
      btn.onclick = () => playerAttack(move);
      ui.moveActions.appendChild(btn);
    });
    const back = document.createElement("button");
    back.className = "ghost";
    back.textContent = "Back";
    back.onclick = () => {
      ui.moveActions.classList.add("hidden");
      ui.mainActions.classList.remove("hidden");
    };
    ui.moveActions.appendChild(back);
  }

  function playerAttack(move) {
    if (state.battleBusy || !state.wild) return;
    state.battleBusy = true;
    ui.moveActions.classList.add("hidden");
    const ally = lead();
    const sp = getCreatureById(ally.id);
    const { dmg, mult } = damageAmount(memberAttack(ally), calcStat(state.wild.species.base.def, state.wild.level), move, move.type, state.wild.species.type);
    state.wild.hp = Math.max(0, state.wild.hp - dmg);
    let msg = `${sp.name} used ${move.name}! (${dmg})`;
    if (mult > 1) msg += " It's strong!";
    if (mult < 1) msg += " It's weak…";
    ui.battleLog.textContent = msg;
    updateBattleBars();
    drawBattleSprites();
    setTimeout(() => (state.wild.hp <= 0 ? winBattle() : foeTurn()), 650);
  }

  function foeTurn() {
    const ally = lead();
    const foe = state.wild;
    const move = foe.species.moves[Math.floor(Math.random() * foe.species.moves.length)];
    const { dmg } = damageAmount(calcStat(foe.species.base.atk, foe.level), memberDefense(ally), move, move.type, getCreatureById(ally.id).type);
    ally.hp = Math.max(0, ally.hp - dmg);
    ui.battleLog.textContent = `Wild ${foe.species.name} used ${move.name}! (${dmg})`;
    updateBattleBars();
    drawBattleSprites();
    setTimeout(() => {
      if (ally.hp <= 0) {
        const next = state.party.find((m) => m.hp > 0);
        if (!next) {
          ui.battleLog.textContent = "Your party fainted… Returning to Petalvale.";
          setTimeout(() => {
            state.party.forEach((m) => (m.hp = Math.max(1, Math.floor(m.maxHp * 0.4))));
            endBattle();
            enterMap("town");
            setMsg("You stumbled back to Petalvale to recover.");
          }, 900);
          return;
        }
        const idx = state.party.indexOf(next);
        const [n] = state.party.splice(idx, 1);
        state.party.unshift(n);
        ui.battleLog.textContent = `${getCreatureById(n.id).name} steps forward!`;
        updateBattleBars();
        drawBattleSprites();
      }
      state.battleBusy = false;
      ui.mainActions.classList.remove("hidden");
    }, 700);
  }

  function winBattle() {
    const foe = state.wild;
    const ally = lead();
    const xp = 8 + foe.level * 3;
    const money = 6 + foe.level * 2;
    state.money += money;
    state.battlesWon += 1;
    const logs = gainXp(ally, xp);
    ui.battleLog.textContent = `Defeated ${foe.species.name}! +${xp} XP, +${money}❀`;
    if (logs[0]) ui.battleLog.textContent += " " + logs[0];
    updateHud();
    notifyAchievements();
    setTimeout(() => { endBattle(); setMsg(`Won! ${foe.species.name} fled into petals.`); }, 900);
  }

  function tryCatch() {
    if (state.battleBusy || !state.wild) return;
    if ((state.inventory.orb || 0) <= 0) {
      ui.battleLog.textContent = "No Catch Orbs left!";
      return;
    }
    state.battleBusy = true;
    state.inventory.orb -= 1;
    updateHud();
    ui.mainActions.classList.add("hidden");
    ui.battleLog.textContent = `You throw a Catch Orb at ${state.wild.species.name}…`;
    const chance = catchChance(state.wild.species, state.wild.hp / state.wild.maxHp);
    const success = Math.random() < chance;
    let shakes = 0;
    const iv = setInterval(() => {
      shakes += 1;
      drawBattleSprites((shakes % 2 === 0 ? 1 : -1) * 7);
      ui.battleLog.textContent = `The Orb shakes… (${shakes}/3)`;
      if (shakes >= 3) {
        clearInterval(iv);
        if (success) {
          battleCtx.clearRect(0, 0, battleCanvas.width, battleCanvas.height);
          drawOrb(battleCtx, battleCanvas.width / 2, battleCanvas.height / 2);
          const sp = state.wild.species;
          state.dex.add(sp.id);
          const member = makePartyMember(sp.id, state.wild.level);
          if (state.party.length < 3) {
            state.party.push(member);
            ui.battleLog.textContent = `Gotcha! ${sp.name} joined your party!`;
          } else if (state.storage.length < 8) {
            state.storage.push(member);
            ui.battleLog.textContent = `Gotcha! ${sp.name} was sent to the Creature Pen!`;
          } else {
            ui.battleLog.textContent = `Gotcha! ${sp.name} recorded in Dex (party & pen full).`;
            state.money += 8;
          }
          updateHud();
          notifyAchievements();
          setTimeout(() => { endBattle(); checkWin(); }, 900);
        } else {
          ui.battleLog.textContent = `Oh no! ${state.wild.species.name} broke free!`;
          drawBattleSprites();
          setTimeout(() => foeTurn(), 500);
        }
      }
    }, 400);
  }

  function endBattle() {
    state.wild = null;
    state.battleBusy = false;
    state.mode = "play";
    hideOverlays();
    state.encounterCooldown = 0.7;
    updateHud();
  }

  function checkWin() {
    if (state.dex.size >= TOTAL_CREATURES) {
      state.mode = "win";
      showScreen("win");
      setMsg("All fifteen creatures documented!");
      notifyAchievements();
    }
  }

  function renderDex() {
    ui.dexList.innerHTML = "";
    CREATURES.filter((c) => state.dexFilter === "all" || c.area === state.dexFilter).forEach((creature) => {
      const owned = state.dex.has(creature.id);
      const li = document.createElement("li");
      li.className = `dex-item${owned ? "" : " locked"}`;
      const thumb = document.createElement("div");
      thumb.className = "dex-thumb";
      if (owned) {
        const img = document.createElement("img");
        img.src = ASSET_URLS[creature.id];
        img.alt = creature.name;
        thumb.appendChild(img);
      } else thumb.textContent = "?";
      const areaLabel = creature.area === "grove" ? "Mist Grove" : creature.area === "shore" ? "Tidebloom Shore" : "Blossom Route";
      const info = document.createElement("div");
      info.innerHTML = `<h3>${owned ? creature.name : "???"}</h3><p>${owned ? creature.description : "Not yet discovered."}</p><p class="hint" style="margin:0.15rem 0 0">${areaLabel}</p>`;
      const tag = document.createElement("span");
      tag.className = `type-tag type-${creature.type.toLowerCase()}`;
      tag.textContent = owned ? creature.type : "—";
      li.append(thumb, info, tag);
      ui.dexList.appendChild(li);
    });
  }

  function openDex() {
    if (state.mode === "battle" || state.mode === "title") return;
    state.mode = "dex";
    renderDex();
    showScreen("dex");
  }

  function drawWorld() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const map = getMap(state.mapId);
    const bg = IMAGES[map.bg];
    if (bg) {
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = "#e8b8c8";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // fence overlay hint on pen
    if (state.mapId === "pen") {
      for (let y = 0; y < MAP_H; y++) {
        for (let x = 0; x < MAP_W; x++) {
          if (getTileOn("pen", x, y) === TILE.FENCE) {
            ctx.fillStyle = "rgba(140, 100, 70, 0.18)";
            ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          }
        }
      }
    }

    if (map.encounter) {
      for (let y = 0; y < MAP_H; y++) {
        for (let x = 0; x < MAP_W; x++) {
          if (getTileOn(state.mapId, x, y) !== TILE.TALL) continue;
          const pulse = 0.07 + Math.sin(state.grassWave * 2 + x * 0.4 + y * 0.3) * 0.04;
          ctx.fillStyle = `rgba(255, 183, 200, ${pulse})`;
          ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }
    }

    (map.warps || []).forEach((w) => drawWarp(ctx, w, state.animTime));
    (map.npcs || []).forEach((n) => drawNpc(ctx, n, state.animTime));

    // pen creatures
    if (state.mapId === "pen") {
      (map.pens || []).forEach((slot, i) => {
        const m = state.storage[i];
        if (m) drawPenCreature(ctx, m.id, slot, state.animTime);
        else {
          // empty stall marker
          ctx.strokeStyle = "rgba(196,95,132,0.35)";
          ctx.strokeRect(slot.x * TILE_SIZE + 4, slot.y * TILE_SIZE + 4, 24, 24);
        }
      });
    }

    for (const p of state.petals) {
      ctx.globalAlpha = 0.65;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.s, p.s * 0.6, p.phase + state.animTime, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    const p = state.player;
    drawPlayer(ctx, p.px, p.py, p.facing, p.step, state.cosmetics.outfit, state.cosmetics.accessory, state.animTime);

    const g = ctx.createRadialGradient(320, 240, 150, 320, 240, 430);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(74, 42, 50, 0.18)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // ---- Input ----
  const keyMap = {
    ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
    w: "up", W: "up", s: "down", S: "down", a: "left", A: "left", d: "right", D: "right",
  };

  const menuModes = ["party", "bag", "dex", "shop", "skills", "style", "pen"];

  window.addEventListener("keydown", (e) => {
    if (e.key === " " || e.code === "Space") {
      e.preventDefault();
      if (state.mode === "dialogue") advanceDialogue();
      else interact();
      return;
    }
    if (e.key === "Escape") {
      if (menuModes.includes(state.mode)) closeMenuToPlay();
      return;
    }
    if (e.key === "e" || e.key === "E") state.mode === "dex" ? closeMenuToPlay() : openDex();
    if (e.key === "p" || e.key === "P") state.mode === "party" ? closeMenuToPlay() : openParty();
    if (e.key === "b" || e.key === "B") state.mode === "bag" ? closeMenuToPlay() : openBag();
    if (e.key === "k" || e.key === "K") state.mode === "skills" ? closeMenuToPlay() : openSkills();
    if (e.key === "c" || e.key === "C") state.mode === "style" ? closeMenuToPlay() : openStyle();
    const dir = keyMap[e.key];
    if (!dir) return;
    e.preventDefault();
    state.keys.add(dir);
  });
  window.addEventListener("keyup", (e) => {
    const dir = keyMap[e.key];
    if (dir) state.keys.delete(dir);
  });

  document.querySelectorAll(".starter-card[data-starter]").forEach((card) => {
    card.addEventListener("click", () => {
      document.querySelectorAll(".starter-card[data-starter]").forEach((c) => c.classList.remove("selected"));
      card.classList.add("selected");
      state.starter = card.dataset.starter;
      ui.btnStart.disabled = false;
      ui.btnStart.textContent = `Start with ${getCreatureById(state.starter).name}`;
    });
  });

  ui.btnStart.addEventListener("click", resetGame);
  document.getElementById("btn-replay").addEventListener("click", () => {
    showScreen("title");
    state.mode = "title";
    ui.btnStart.disabled = !state.starter;
  });
  document.getElementById("btn-dlg-next").addEventListener("click", advanceDialogue);
  document.getElementById("btn-shop-close").addEventListener("click", closeMenuToPlay);
  document.getElementById("btn-party").addEventListener("click", () => (state.mode === "party" ? closeMenuToPlay() : openParty()));
  document.getElementById("btn-party-close").addEventListener("click", closeMenuToPlay);
  document.getElementById("btn-skills").addEventListener("click", () => (state.mode === "skills" ? closeMenuToPlay() : openSkills()));
  document.getElementById("btn-skills-close").addEventListener("click", closeMenuToPlay);
  document.getElementById("btn-style").addEventListener("click", () => (state.mode === "style" ? closeMenuToPlay() : openStyle()));
  document.getElementById("btn-style-close").addEventListener("click", closeMenuToPlay);
  document.getElementById("btn-pen-close").addEventListener("click", closeMenuToPlay);
  document.getElementById("btn-bag").addEventListener("click", () => (state.mode === "bag" ? closeMenuToPlay() : openBag()));
  document.getElementById("btn-bag-close").addEventListener("click", closeMenuToPlay);
  document.getElementById("btn-dex").addEventListener("click", () => (state.mode === "dex" ? closeMenuToPlay() : openDex()));
  document.getElementById("btn-dex-close").addEventListener("click", closeMenuToPlay);
  document.getElementById("btn-fight").addEventListener("click", () => { if (!state.battleBusy) showMoves(); });
  document.getElementById("btn-throw").addEventListener("click", tryCatch);
  document.getElementById("btn-item").addEventListener("click", () => {
    if (state.battleBusy) return;
    if ((state.inventory.potion || 0) <= 0 && (state.inventory.hi_potion || 0) <= 0) {
      ui.battleLog.textContent = "No healing items!";
      return;
    }
    const itemId = (state.inventory.potion || 0) > 0 ? "potion" : "hi_potion";
    const ally = lead();
    const heal = itemId === "hi_potion" ? 55 : 28;
    const before = ally.hp;
    ally.hp = Math.min(ally.maxHp, ally.hp + heal);
    state.inventory[itemId] -= 1;
    state.battleBusy = true;
    ui.mainActions.classList.add("hidden");
    ui.battleLog.textContent = `Used item! (+${ally.hp - before} HP)`;
    updateBattleBars();
    updateHud();
    setTimeout(() => foeTurn(), 600);
  });
  document.getElementById("btn-flee").addEventListener("click", () => {
    if (state.battleBusy) return;
    if (Math.random() < 0.7) { endBattle(); setMsg("Got away safely."); }
    else {
      state.battleBusy = true;
      ui.mainActions.classList.add("hidden");
      ui.battleLog.textContent = "Couldn't escape!";
      setTimeout(() => foeTurn(), 500);
    }
  });

  document.querySelectorAll(".dex-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".dex-tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      state.dexFilter = tab.dataset.area;
      renderDex();
    });
  });
  document.querySelectorAll(".shop-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".shop-tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      state.shopTab = tab.dataset.shop;
      renderShop();
    });
  });
  document.querySelectorAll(".pen-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".pen-tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      state.penTab = tab.dataset.pen;
      renderPen();
    });
  });

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    state.animTime += dt;
    state.grassWave += dt * 3;
    for (const p of state.petals) {
      p.y += p.sp * dt;
      p.x += Math.sin(state.animTime * 1.4 + p.phase) * p.drift * dt;
      if (p.y > 490) { p.y = -6; p.x = Math.random() * 640; }
    }
    if (state.encounterCooldown > 0) state.encounterCooldown -= dt;

    if (state.mode === "play") {
      const p = state.player;
      if (p.moving) {
        p.t += dt / MOVE_DURATION;
        const t = Math.min(1, p.t);
        const ease = t * t * (3 - 2 * t);
        p.px = (p.x + (p.tx - p.x) * ease) * TILE_SIZE;
        p.py = (p.y + (p.ty - p.y) * ease) * TILE_SIZE;
        if (t >= 1) finishStep();
      } else {
        if (state.keys.has("up")) tryMove(0, -1);
        else if (state.keys.has("down")) tryMove(0, 1);
        else if (state.keys.has("left")) tryMove(-1, 0);
        else if (state.keys.has("right")) tryMove(1, 0);
      }
    }

    if (state.ready) drawWorld();
    requestAnimationFrame(frame);
  }

  placePlayer(10, 12);
  updateHud();
  showScreen("title");
  setMsg("Loading…");

  loadImages()
    .then(() => {
      state.ready = true;
      const sky = document.querySelector(".battle-sky");
      if (sky && IMAGES.battle) {
        sky.style.backgroundImage = `url(${ASSET_URLS.battle})`;
        sky.style.backgroundSize = "cover";
        sky.style.backgroundPosition = "center";
      }
      setMsg("Choose a starter to begin.");
      drawWorld();
    })
    .catch((err) => {
      console.error(err);
      setMsg("Failed to load art assets: " + err.message);
    });

  requestAnimationFrame(frame);
})();
