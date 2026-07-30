(() => {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const battleCanvas = document.getElementById("battle-sprite");
  const battleCtx = battleCanvas.getContext("2d");
  const allyCanvas = document.getElementById("ally-sprite");
  const allyCtx = allyCanvas.getContext("2d");

  const screens = {
    title: document.getElementById("screen-title"),
    dialogue: document.getElementById("screen-dialogue"),
    shop: document.getElementById("screen-shop"),
    party: document.getElementById("screen-party"),
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
    dex: new Set(),
    starter: null,
    encounterCooldown: 0,
    wild: null,
    battleBusy: false,
    dialogue: null,
    bagItem: null,
    dexFilter: "all",
    animTime: 0,
    grassWave: 0,
    petals: [],
  };

  window.__currentMapId = "town";
  const MOVE_DURATION = 0.14;

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

  function updateHud() {
    const map = getMap(state.mapId);
    ui.loc.textContent = map?.name || state.mapId;
    ui.money.textContent = `❀ ${state.money}`;
    ui.orbs.textContent = `Orbs: ${state.inventory.orb}`;
    ui.caught.textContent = `Dex: ${state.dex.size}/10`;
    ui.areaHint.textContent =
      state.mapId === "town"
        ? "Petalvale · Space to talk · South to Blossom Route"
        : state.mapId === "route"
          ? "Blossom Route · Tall grass · East to Mist Grove"
          : "Mist Grove · Rare blooms in the mist";
  }

  function placePlayer(x, y) {
    const p = state.player;
    p.x = x;
    p.y = y;
    p.tx = x;
    p.ty = y;
    p.px = x * TILE_SIZE;
    p.py = y * TILE_SIZE;
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
    state.dex = new Set([state.starter]);
    state.wild = null;
    state.battleBusy = false;
    state.dialogue = null;
    state.bagItem = null;
    enterMap("town");
    state.mode = "play";
    hideOverlays();
    setMsg(`${getCreatureById(state.starter).name} joins you! Talk to townsfolk, then head south.`);
    updateHud();
  }

  function facingTile() {
    const p = state.player;
    let x = p.x;
    let y = p.y;
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

    // warp standing on edge tiles handled after step; also allow stepping onto warp
    if (npcAt(state.mapId, nx, ny)) {
      setMsg("Press Space to talk.");
      return;
    }
    if (isSolid(getTileOn(state.mapId, nx, ny))) {
      // allow warp tiles even if mapped oddly
      if (!warpAt(state.mapId, nx, ny)) {
        setMsg("Something blocks the way.");
        return;
      }
    }

    p.moving = true;
    p.tx = nx;
    p.ty = ny;
    p.t = 0;
    p.step += 1;
  }

  function finishStep() {
    const p = state.player;
    p.x = p.tx;
    p.y = p.ty;
    p.px = p.x * TILE_SIZE;
    p.py = p.y * TILE_SIZE;
    p.moving = false;

    const warp = warpAt(state.mapId, p.x, p.y);
    if (warp) {
      enterMap(warp.to, warp.tx, warp.ty);
      setMsg(warp.label);
      return;
    }

    const map = getMap(state.mapId);
    if (!map.encounter || state.encounterCooldown > 0) return;
    if (isTallGrassOn(state.mapId, p.x, p.y) && Math.random() < 0.22) {
      startBattle();
    } else if (isTallGrassOn(state.mapId, p.x, p.y)) {
      setMsg("The grass whispers…");
    }
  }

  function interact() {
    if (state.mode !== "play") return;
    const { x, y } = facingTile();
    const npc = npcAt(state.mapId, x, y) || npcAt(state.mapId, state.player.x, state.player.y);
    if (!npc) {
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
    // finished lines → action
    hideOverlays();
    if (npc.kind === "heal") {
      state.party.forEach((m) => {
        m.hp = m.maxHp;
      });
      setMsg("Your party was fully healed at the Petal Shrine.");
      state.mode = "play";
    } else if (npc.kind === "shop") {
      openShop();
    } else {
      state.mode = "play";
      setMsg(`${npc.name} nods kindly.`);
    }
    state.dialogue = null;
  }

  function openShop() {
    state.mode = "shop";
    ui.shopMoney.textContent = `Your petals: ${state.money}`;
    ui.shopList.innerHTML = "";
    SHOP_ITEMS.forEach((item) => {
      const li = document.createElement("li");
      li.className = "shop-item";
      li.innerHTML = `<div><strong>${item.name}</strong><p class="hint" style="margin:0.2rem 0 0">${item.desc}</p></div>`;
      const btn = document.createElement("button");
      btn.className = "cta";
      btn.style.minWidth = "90px";
      btn.textContent = `${item.price}❀`;
      btn.onclick = () => buyItem(item);
      li.appendChild(btn);
      ui.shopList.appendChild(li);
    });
    showScreen("shop");
  }

  function buyItem(item) {
    if (state.money < item.price) {
      setMsg("Not enough petals.");
      return;
    }
    state.money -= item.price;
    state.inventory[item.id] = (state.inventory[item.id] || 0) + 1;
    ui.shopMoney.textContent = `Your petals: ${state.money}`;
    updateHud();
    setMsg(`Bought ${item.name}.`);
  }

  function openParty() {
    if (state.mode === "battle" || state.mode === "title") return;
    state._prev = state.mode === "play" ? "play" : state.mode;
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
          <span>${m.hp}/${m.maxHp} HP · XP ${m.xp}/${xpToNext(m.level)}</span>
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
    const entries = [
      { id: "orb", name: "Catch Orb", desc: "Catch wild creatures in battle." },
      { id: "potion", name: "Petal Tonic", desc: "Restore 28 HP." },
      { id: "hi_potion", name: "Bloom Balm", desc: "Restore 55 HP." },
    ];
    entries.forEach((item) => {
      const count = state.inventory[item.id] || 0;
      const li = document.createElement("li");
      li.className = "shop-item";
      li.innerHTML = `<div><strong>${item.name} ×${count}</strong><p class="hint" style="margin:0.2rem 0 0">${item.desc}</p></div>`;
      if (item.id !== "orb" && count > 0) {
        const btn = document.createElement("button");
        btn.className = "ghost";
        btn.textContent = "Use";
        btn.onclick = () => chooseBagTarget(item.id);
        li.appendChild(btn);
      }
      ui.bagList.appendChild(li);
    });
  }

  function chooseBagTarget(itemId) {
    state.bagItem = itemId;
    ui.bagTarget.classList.remove("hidden");
    ui.bagTargets.innerHTML = "";
    state.party.forEach((m) => {
      const sp = getCreatureById(m.id);
      const btn = document.createElement("button");
      btn.className = "starter-card";
      btn.innerHTML = `<img src="${ASSET_URLS[m.id]}" alt=""/><span>${sp.name}</span>`;
      btn.onclick = () => useItemOn(itemId, m);
      ui.bagTargets.appendChild(btn);
    });
  }

  function useItemOn(itemId, member) {
    if ((state.inventory[itemId] || 0) <= 0) return;
    const heal = itemId === "hi_potion" ? 55 : 28;
    const before = member.hp;
    member.hp = Math.min(member.maxHp, member.hp + heal);
    state.inventory[itemId] -= 1;
    setMsg(`${getCreatureById(member.id).name} recovered ${member.hp - before} HP.`);
    state.bagItem = null;
    ui.bagTarget.classList.add("hidden");
    renderBag();
    updateHud();
  }

  function closeMenuToPlay() {
    state.mode = "play";
    hideOverlays();
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
    if (state.wild) {
      drawCreature(battleCtx, state.wild.species, battleCanvas.width / 2 + shakeX, battleCanvas.height / 2 + 8, 1.05);
    }
    const ally = lead();
    if (ally) {
      drawCreature(allyCtx, getCreatureById(ally.id), allyCanvas.width / 2, allyCanvas.height / 2 + 6, 0.85);
    }
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
    const { dmg, mult } = damageAmount(
      memberAttack(ally),
      calcStat(state.wild.species.base.def, state.wild.level),
      move,
      move.type,
      state.wild.species.type
    );
    state.wild.hp = Math.max(0, state.wild.hp - dmg);
    let msg = `${sp.name} used ${move.name}! (${dmg})`;
    if (mult > 1) msg += " It's strong!";
    if (mult < 1) msg += " It's weak…";
    ui.battleLog.textContent = msg;
    updateBattleBars();
    drawBattleSprites();

    setTimeout(() => {
      if (state.wild.hp <= 0) {
        winBattle();
      } else {
        foeTurn();
      }
    }, 650);
  }

  function foeTurn() {
    const ally = lead();
    const foe = state.wild;
    const move = foe.species.moves[Math.floor(Math.random() * foe.species.moves.length)];
    const { dmg, mult } = damageAmount(
      calcStat(foe.species.base.atk, foe.level),
      memberDefense(ally),
      move,
      move.type,
      getCreatureById(ally.id).type
    );
    ally.hp = Math.max(0, ally.hp - dmg);
    let msg = `Wild ${foe.species.name} used ${move.name}! (${dmg})`;
    if (mult > 1) msg += " Ouch!";
    ui.battleLog.textContent = msg;
    updateBattleBars();
    drawBattleSprites();

    setTimeout(() => {
      if (ally.hp <= 0) {
        const next = state.party.find((m) => m.hp > 0);
        if (!next) {
          ui.battleLog.textContent = "Your party fainted… Returning to Petalvale.";
          setTimeout(() => {
            state.party.forEach((m) => (m.hp = Math.max(1, Math.floor(m.maxHp * 0.4))));
            endBattle(false);
            enterMap("town");
            setMsg("You stumbled back to Petalvale to recover.");
          }, 900);
          return;
        }
        // swap fainted lead
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
    const logs = gainXp(ally, xp);
    ui.battleLog.textContent = `Defeated ${foe.species.name}! +${xp} XP, +${money}❀`;
    if (logs[0]) ui.battleLog.textContent += " " + logs[0];
    updateHud();
    setTimeout(() => {
      endBattle(false);
      setMsg(`Won! ${foe.species.name} fled into petals.`);
    }, 900);
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

    const ratio = state.wild.hp / state.wild.maxHp;
    const chance = catchChance(state.wild.species, ratio);
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
          if (state.party.length < 3) {
            state.party.push(makePartyMember(sp.id, state.wild.level));
            ui.battleLog.textContent = `Gotcha! ${sp.name} joined your party!`;
          } else {
            // sent to dex storage flavor — still count, grant XP money
            ui.battleLog.textContent = `Gotcha! ${sp.name} was recorded in the Dex! (party full)`;
            state.money += 8;
          }
          updateHud();
          setTimeout(() => {
            endBattle(false);
            checkWin();
          }, 900);
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
    if (state.dex.size >= 10) {
      state.mode = "win";
      showScreen("win");
      setMsg("All ten creatures documented!");
    }
  }

  function renderDex() {
    ui.dexList.innerHTML = "";
    const list = CREATURES.filter((c) => state.dexFilter === "all" || c.area === state.dexFilter);
    list.forEach((creature) => {
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
      const info = document.createElement("div");
      info.innerHTML = `<h3>${owned ? creature.name : "???"}</h3><p>${
        owned ? creature.description : "Not yet discovered."
      }</p><p class="hint" style="margin:0.15rem 0 0">${creature.area === "grove" ? "Mist Grove" : "Blossom Route"}</p>`;
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

  // ---- Draw world ----
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

    // tall grass shimmer
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

    // NPC markers
    map.npcs.forEach((n) => drawNpcMarker(ctx, n.x, n.y, n.kind));

    // warp hints
    map.warps.forEach((w) => {
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.fillRect(w.x * TILE_SIZE + 6, w.y * TILE_SIZE + 6, 20, 20);
      ctx.strokeStyle = "rgba(196,95,132,0.7)";
      ctx.strokeRect(w.x * TILE_SIZE + 6, w.y * TILE_SIZE + 6, 20, 20);
    });

    // petals
    for (const p of state.petals) {
      ctx.globalAlpha = 0.65;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.s, p.s * 0.6, p.phase + state.animTime, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    const p = state.player;
    drawPlayer(ctx, p.px, p.py, p.facing, p.step);

    const g = ctx.createRadialGradient(320, 240, 150, 320, 240, 430);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(74, 42, 50, 0.18)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // ---- Input ----
  const keyMap = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
    w: "up",
    W: "up",
    s: "down",
    S: "down",
    a: "left",
    A: "left",
    d: "right",
    D: "right",
  };

  window.addEventListener("keydown", (e) => {
    if (e.key === " " || e.code === "Space") {
      e.preventDefault();
      if (state.mode === "dialogue") advanceDialogue();
      else interact();
      return;
    }
    if (e.key === "Escape") {
      if (["party", "bag", "dex", "shop"].includes(state.mode)) closeMenuToPlay();
      return;
    }
    if (e.key === "e" || e.key === "E") {
      if (state.mode === "dex") closeMenuToPlay();
      else openDex();
    }
    if (e.key === "p" || e.key === "P") {
      if (state.mode === "party") closeMenuToPlay();
      else openParty();
    }
    if (e.key === "b" || e.key === "B") {
      if (state.mode === "bag") closeMenuToPlay();
      else openBag();
    }
    const dir = keyMap[e.key];
    if (!dir) return;
    e.preventDefault();
    state.keys.add(dir);
  });

  window.addEventListener("keyup", (e) => {
    const dir = keyMap[e.key];
    if (dir) state.keys.delete(dir);
  });

  // starter select
  let selectedStarter = null;
  document.querySelectorAll(".starter-card").forEach((card) => {
    card.addEventListener("click", () => {
      document.querySelectorAll(".starter-card").forEach((c) => c.classList.remove("selected"));
      card.classList.add("selected");
      selectedStarter = card.dataset.starter;
      state.starter = selectedStarter;
      ui.btnStart.disabled = false;
      ui.btnStart.textContent = `Start with ${getCreatureById(selectedStarter).name}`;
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
  document.getElementById("btn-bag").addEventListener("click", () => (state.mode === "bag" ? closeMenuToPlay() : openBag()));
  document.getElementById("btn-bag-close").addEventListener("click", closeMenuToPlay);
  document.getElementById("btn-dex").addEventListener("click", () => (state.mode === "dex" ? closeMenuToPlay() : openDex()));
  document.getElementById("btn-dex-close").addEventListener("click", closeMenuToPlay);
  document.getElementById("btn-fight").addEventListener("click", () => {
    if (!state.battleBusy) showMoves();
  });
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
    ui.battleLog.textContent = `Used ${itemId === "hi_potion" ? "Bloom Balm" : "Petal Tonic"}! (+${ally.hp - before} HP)`;
    updateBattleBars();
    updateHud();
    setTimeout(() => foeTurn(), 600);
  });
  document.getElementById("btn-flee").addEventListener("click", () => {
    if (state.battleBusy) return;
    if (Math.random() < 0.7) {
      endBattle();
      setMsg("Got away safely.");
    } else {
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

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    state.animTime += dt;
    state.grassWave += dt * 3;

    for (const p of state.petals) {
      p.y += p.sp * dt;
      p.x += Math.sin(state.animTime * 1.4 + p.phase) * p.drift * dt;
      if (p.y > 490) {
        p.y = -6;
        p.x = Math.random() * 640;
      }
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
      setMsg("Failed to load art assets.");
    });

  requestAnimationFrame(frame);
})();
