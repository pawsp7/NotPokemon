(() => {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const battleCanvas = document.getElementById("battle-sprite");
  const battleCtx = battleCanvas.getContext("2d");

  const screens = {
    title: document.getElementById("screen-title"),
    battle: document.getElementById("screen-battle"),
    dex: document.getElementById("screen-dex"),
    win: document.getElementById("screen-win"),
  };

  const ui = {
    orbCount: document.getElementById("orb-count"),
    caughtCount: document.getElementById("caught-count"),
    msg: document.getElementById("msg"),
    battleLog: document.getElementById("battle-log"),
    battleName: document.getElementById("battle-name"),
    battleType: document.getElementById("battle-type"),
    dexList: document.getElementById("dex-list"),
    btnThrow: document.getElementById("btn-throw"),
    btnFlee: document.getElementById("btn-flee"),
  };

  const state = {
    mode: "title",
    player: { x: 2, y: 2, facing: "down", moving: false, px: 0, py: 0, tx: 0, ty: 0, t: 0, step: 0 },
    keys: new Set(),
    orbs: 20,
    caught: new Set(),
    encounterCooldown: 0,
    wild: null,
    battleBusy: false,
    animTime: 0,
    grassWave: 0,
    ready: false,
    petals: [],
  };

  const MOVE_DURATION = 0.14;

  // floating petals over the painted route
  for (let i = 0; i < 28; i++) {
    state.petals.push({
      x: Math.random() * 640,
      y: Math.random() * 480,
      s: 2 + Math.random() * 3,
      sp: 12 + Math.random() * 28,
      drift: 8 + Math.random() * 16,
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

  function updateHud() {
    ui.orbCount.textContent = `Orbs: ${state.orbs}`;
    ui.caughtCount.textContent = `Caught: ${state.caught.size}/5`;
  }

  function resetGame() {
    if (!state.ready) return;
    state.mode = "play";
    state.player = {
      x: 2,
      y: 2,
      facing: "down",
      moving: false,
      px: 2 * TILE_SIZE,
      py: 2 * TILE_SIZE,
      tx: 2,
      ty: 2,
      t: 0,
      step: 0,
    };
    state.keys.clear();
    state.orbs = 20;
    state.caught = new Set();
    state.encounterCooldown = 0.5;
    state.wild = null;
    state.battleBusy = false;
    state.signLooted = false;
    updateHud();
    hideOverlays();
    setMsg("Wander the path. Blossom grass hides wild creatures.");
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

    if (isSolid(getTile(nx, ny))) {
      setMsg("Something blocks the way.");
      return;
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

    if (p.x === 3 && p.y === 2 && !state.signLooted && state.orbs < 8) {
      state.orbs += 5;
      state.signLooted = true;
      updateHud();
      setMsg("You found a stash of 5 Catch Orbs by the sign!");
      return;
    }

    if (state.encounterCooldown > 0) return;

    if (isTallGrass(p.x, p.y) && Math.random() < 0.24) {
      startBattle();
    } else if (isTallGrass(p.x, p.y)) {
      setMsg("Petals shiver in the grass…");
    }
  }

  function startBattle() {
    const uncaught = CREATURES.filter((c) => !state.caught.has(c.id)).map((c) => c.id);
    const preferUncaught = Math.random() < 0.7 && uncaught.length > 0;
    state.wild = preferUncaught
      ? rollWildEncounter([...state.caught])
      : rollWildEncounter();

    state.mode = "battle";
    state.battleBusy = false;
    state.encounterCooldown = 0.8;

    ui.battleName.textContent = state.wild.name;
    ui.battleType.textContent = state.wild.type;
    ui.battleType.className = `type-tag type-${state.wild.type.toLowerCase()}`;
    ui.battleLog.textContent = `A wild ${state.wild.name} appeared!`;
    ui.btnThrow.disabled = state.orbs <= 0;
    ui.btnFlee.disabled = false;

    drawBattleSprite();
    showScreen("battle");
    setMsg(`Encounter! ${state.wild.name}`);
  }

  function drawBattleSprite(shakeX = 0) {
    battleCtx.clearRect(0, 0, battleCanvas.width, battleCanvas.height);
    if (!state.wild) return;
    drawCreature(battleCtx, state.wild, battleCanvas.width / 2 + shakeX, battleCanvas.height / 2 + 6, 1.15);
  }

  function endBattle(fled = false) {
    state.wild = null;
    state.battleBusy = false;
    state.mode = "play";
    hideOverlays();
    state.encounterCooldown = 0.6;
    if (fled) setMsg("Got away safely.");
    checkWin();
  }

  function checkWin() {
    if (state.caught.size >= CREATURES.length) {
      state.mode = "win";
      showScreen("win");
      setMsg("Blossom Route is complete!");
    }
  }

  function throwOrb() {
    if (state.mode !== "battle" || state.battleBusy || !state.wild) return;
    if (state.orbs <= 0) {
      ui.battleLog.textContent = "No Catch Orbs left!";
      return;
    }

    state.battleBusy = true;
    state.orbs -= 1;
    updateHud();
    ui.btnThrow.disabled = true;
    ui.btnFlee.disabled = true;
    ui.battleLog.textContent = `You throw a Catch Orb at ${state.wild.name}…`;

    let shakes = 0;
    const maxShakes = 3;
    const alreadyOwned = state.caught.has(state.wild.id);
    let rate = state.wild.catchRate;
    if (state.orbs <= 3) rate += 0.08;
    const success = Math.random() < rate;

    const shakeInterval = setInterval(() => {
      shakes += 1;
      const shake = (shakes % 2 === 0 ? 1 : -1) * 8;
      drawBattleSprite(shake);
      ui.battleLog.textContent = `The Orb shakes… (${shakes}/${maxShakes})`;

      if (shakes >= maxShakes) {
        clearInterval(shakeInterval);
        if (success) {
          battleCtx.clearRect(0, 0, battleCanvas.width, battleCanvas.height);
          drawOrb(battleCtx, battleCanvas.width / 2, battleCanvas.height / 2);
          if (alreadyOwned) {
            ui.battleLog.textContent = `${state.wild.name} was caught again! (already in Dex)`;
          } else {
            state.caught.add(state.wild.id);
            updateHud();
            ui.battleLog.textContent = `Gotcha! ${state.wild.name} was caught!`;
            setMsg(`Caught ${state.wild.name}!`);
          }
          setTimeout(() => {
            endBattle(false);
            if (state.caught.size >= CREATURES.length) checkWin();
          }, 900);
        } else {
          drawBattleSprite();
          ui.battleLog.textContent = `Oh no! ${state.wild.name} broke free!`;
          state.battleBusy = false;
          ui.btnThrow.disabled = state.orbs <= 0;
          ui.btnFlee.disabled = false;
          if (state.orbs <= 0) {
            ui.battleLog.textContent += " You're out of Orbs — flee!";
          }
        }
      }
    }, 420);
  }

  function renderDex() {
    ui.dexList.innerHTML = "";
    CREATURES.forEach((creature) => {
      const owned = state.caught.has(creature.id);
      const li = document.createElement("li");
      li.className = `dex-item${owned ? "" : " locked"}`;

      const thumb = document.createElement("div");
      thumb.className = "dex-thumb";
      if (owned && IMAGES[creature.id]) {
        const img = document.createElement("img");
        img.src = ASSET_URLS[creature.id];
        img.alt = creature.name;
        thumb.appendChild(img);
      } else {
        thumb.textContent = "?";
      }

      const info = document.createElement("div");
      const h3 = document.createElement("h3");
      h3.textContent = owned ? creature.name : "???";
      const p = document.createElement("p");
      p.textContent = owned ? creature.description : "Not yet discovered.";
      info.append(h3, p);

      const tag = document.createElement("span");
      tag.className = `type-tag type-${creature.type.toLowerCase()}`;
      tag.textContent = owned ? creature.type : "—";

      li.append(thumb, info, tag);
      ui.dexList.appendChild(li);
    });
  }

  function openDex() {
    if (state.mode === "battle" || state.mode === "title") return;
    state._prevMode = state.mode;
    state.mode = "dex";
    renderDex();
    showScreen("dex");
  }

  function closeDex() {
    if (state.mode !== "dex") return;
    if (state._prevMode === "win") {
      state.mode = "win";
      showScreen("win");
    } else {
      state.mode = "play";
      hideOverlays();
    }
  }

  function drawTallGrassHint() {
    // soft shimmer over encounter tiles so players can still read the painted map
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        if (getTile(x, y) !== TILE.TALL) continue;
        const pulse = 0.08 + Math.sin(state.grassWave * 2 + x * 0.4 + y * 0.3) * 0.05;
        ctx.fillStyle = `rgba(255, 183, 200, ${pulse})`;
        ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }
  }

  function drawPetals(dt) {
    for (const p of state.petals) {
      p.y += p.sp * dt;
      p.x += Math.sin(state.animTime * 1.4 + p.phase) * p.drift * dt;
      if (p.y > 490) {
        p.y = -6;
        p.x = Math.random() * 640;
      }
      if (p.x < -10) p.x = 650;
      if (p.x > 650) p.x = -10;
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.s, p.s * 0.6, p.phase + state.animTime, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function drawWorld() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (IMAGES.route) {
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(IMAGES.route, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = "#e8b8c8";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    drawTallGrassHint();
    drawPetals(0); // positions already advanced in frame()

    const p = state.player;
    drawPlayer(ctx, p.px, p.py, p.facing, p.step);

    // soft vignette
    const g = ctx.createRadialGradient(320, 240, 150, 320, 240, 430);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(74, 42, 50, 0.2)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // --- Input ---
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
    if (e.key === "Escape" && state.mode === "dex") {
      closeDex();
      return;
    }
    if (e.key === "e" || e.key === "E") {
      if (state.mode === "play") openDex();
      else if (state.mode === "dex") closeDex();
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

  document.getElementById("btn-start").addEventListener("click", resetGame);
  document.getElementById("btn-replay").addEventListener("click", resetGame);
  document.getElementById("btn-dex").addEventListener("click", () => {
    if (state.mode === "dex") closeDex();
    else openDex();
  });
  document.getElementById("btn-dex-close").addEventListener("click", closeDex);
  ui.btnThrow.addEventListener("click", throwOrb);
  ui.btnFlee.addEventListener("click", () => {
    if (state.mode !== "battle" || state.battleBusy) return;
    endBattle(true);
  });

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    state.animTime += dt;
    state.grassWave += dt * 3;

    // advance petals
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

  // boot
  state.player.px = state.player.x * TILE_SIZE;
  state.player.py = state.player.y * TILE_SIZE;
  updateHud();
  showScreen("title");
  setMsg("Loading blossom sprites…");

  loadImages()
    .then(() => {
      state.ready = true;
      // apply battle background image to CSS element
      const sky = document.querySelector(".battle-sky");
      if (sky && IMAGES.battle) {
        sky.style.backgroundImage = `url(${ASSET_URLS.battle})`;
        sky.style.backgroundSize = "cover";
        sky.style.backgroundPosition = "center";
      }
      setMsg("Wander the path and step into the blossom grass.");
      drawWorld();
    })
    .catch((err) => {
      console.error(err);
      setMsg("Failed to load art assets.");
    });

  requestAnimationFrame(frame);
})();
