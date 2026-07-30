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
    mode: "title", // title | play | battle | dex | win
    player: { x: 2, y: 2, facing: "down", moving: false, px: 0, py: 0, tx: 0, ty: 0, t: 0, step: 0 },
    keys: new Set(),
    orbs: 12,
    caught: new Set(),
    encounterCooldown: 0,
    wild: null,
    battleBusy: false,
    animTime: 0,
    grassWave: 0,
  };

  const MOVE_SPEED = 6; // tiles per second feel via tween duration
  const MOVE_DURATION = 0.14;

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
    state.mode = "play";
    state.player = { x: 2, y: 2, facing: "down", moving: false, px: 2 * TILE_SIZE, py: 2 * TILE_SIZE, tx: 2, ty: 2, t: 0, step: 0 };
    state.keys.clear();
    state.orbs = 12;
    state.caught = new Set();
    state.encounterCooldown = 0.5;
    state.wild = null;
    state.battleBusy = false;
    updateHud();
    hideOverlays();
    setMsg("Wander the path. Tall grass hides wild creatures.");
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

    if (state.encounterCooldown > 0) return;

    if (isTallGrass(p.x, p.y) && Math.random() < 0.22) {
      startBattle();
    } else if (isTallGrass(p.x, p.y)) {
      setMsg("The grass rustles…");
    }
  }

  function startBattle() {
    // Prefer uncaught creatures so the player can complete the dex
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
    drawCreature(battleCtx, state.wild, 80 + shakeX, 90, 5);
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
      setMsg("Meadow Route is complete!");
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

    // Soft bonus if player already has it — still can "catch" for flavor but won't double-count
    let rate = state.wild.catchRate;
    if (state.orbs <= 3) rate += 0.08; // clutch bonus

    const success = Math.random() < rate;

    const shakeInterval = setInterval(() => {
      shakes += 1;
      const shake = (shakes % 2 === 0 ? 1 : -1) * 6;
      drawBattleSprite(shake);
      ui.battleLog.textContent = `The Orb shakes… (${shakes}/${maxShakes})`;

      if (shakes >= maxShakes) {
        clearInterval(shakeInterval);
        if (success) {
          battleCtx.clearRect(0, 0, battleCanvas.width, battleCanvas.height);
          drawOrb(battleCtx, 80, 90);
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

      const thumb = document.createElement("canvas");
      thumb.width = 48;
      thumb.height = 48;
      const tctx = thumb.getContext("2d");
      if (owned) {
        drawCreature(tctx, creature, 24, 28, 1.6);
      } else {
        tctx.fillStyle = "#3a4a3a";
        tctx.font = "20px sans-serif";
        tctx.textAlign = "center";
        tctx.fillText("?", 24, 32);
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
    const prev = state.mode;
    state._prevMode = prev;
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

  // --- Drawing the overworld ---
  function drawTile(tx, ty, tile) {
    const x = tx * TILE_SIZE;
    const y = ty * TILE_SIZE;
    const checker = (tx + ty) % 2 === 0;

    switch (tile) {
      case TILE.GRASS:
        ctx.fillStyle = checker ? "#4f8f45" : "#45853c";
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = "#6db36a";
        ctx.fillRect(x + 6, y + 8, 3, 3);
        ctx.fillRect(x + 18, y + 18, 3, 3);
        break;
      case TILE.FLOWER:
        ctx.fillStyle = checker ? "#4f8f45" : "#45853c";
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = "#f0d78c";
        ctx.fillRect(x + 10, y + 10, 4, 4);
        ctx.fillStyle = "#e07a3a";
        ctx.fillRect(x + 20, y + 16, 4, 4);
        ctx.fillStyle = "#c86ec8";
        ctx.fillRect(x + 8, y + 20, 3, 3);
        break;
      case TILE.PATH:
        ctx.fillStyle = checker ? "#c9a66b" : "#b8925a";
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = "#a67c48";
        ctx.fillRect(x + 4, y + 12, 2, 2);
        ctx.fillRect(x + 20, y + 6, 2, 2);
        break;
      case TILE.TALL: {
        ctx.fillStyle = checker ? "#3f7a38" : "#376f31";
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        const wave = Math.sin(state.grassWave + tx * 0.7 + ty * 0.5) * 2;
        ctx.fillStyle = "#2d5f28";
        for (let i = 0; i < 4; i++) {
          const gx = x + 4 + i * 7 + wave;
          ctx.fillRect(gx, y + 8, 3, 20);
          ctx.fillStyle = "#5aa34f";
          ctx.fillRect(gx, y + 6, 3, 6);
          ctx.fillStyle = "#2d5f28";
        }
        break;
      }
      case TILE.TREE:
        ctx.fillStyle = "#2a5a32";
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = "#5a3a1e";
        ctx.fillRect(x + 12, y + 18, 8, 12);
        ctx.fillStyle = "#2f6b38";
        ctx.fillRect(x + 4, y + 4, 24, 18);
        ctx.fillStyle = "#3f8a48";
        ctx.fillRect(x + 8, y + 2, 16, 10);
        break;
      case TILE.WATER: {
        ctx.fillStyle = "#3a7aa0";
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        const w = Math.sin(state.grassWave * 1.5 + tx + ty) * 2;
        ctx.fillStyle = "#5aa0c8";
        ctx.fillRect(x + 4, y + 10 + w, 10, 3);
        ctx.fillRect(x + 16, y + 18 - w, 10, 3);
        break;
      }
      case TILE.ROCK:
        ctx.fillStyle = checker ? "#4f8f45" : "#45853c";
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = "#7a6a58";
        ctx.fillRect(x + 6, y + 10, 20, 14);
        ctx.fillStyle = "#9a8a78";
        ctx.fillRect(x + 8, y + 8, 16, 8);
        ctx.fillStyle = "#5a4a3a";
        ctx.fillRect(x + 10, y + 18, 4, 3);
        break;
      default:
        ctx.fillStyle = "#000";
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    }
  }

  function drawWorld() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // sky-ish top vignette feel via darker border trees already in map
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        drawTile(x, y, getTile(x, y));
      }
    }

    // route sign near start
    ctx.fillStyle = "#6b4a2e";
    ctx.fillRect(3 * TILE_SIZE + 10, 1 * TILE_SIZE + 8, 4, 18);
    ctx.fillStyle = "#f0d78c";
    ctx.fillRect(3 * TILE_SIZE + 2, 1 * TILE_SIZE + 4, 20, 12);
    ctx.fillStyle = "#1c2419";
    ctx.font = "bold 7px Nunito, sans-serif";
    ctx.fillText("R1", 3 * TILE_SIZE + 7, 1 * TILE_SIZE + 13);

    const p = state.player;
    drawPlayer(ctx, p.px, p.py, p.facing, p.step);

    // soft vignette
    const g = ctx.createRadialGradient(320, 240, 120, 320, 240, 420);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(10,20,12,0.35)");
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

  // Touch / on-screen friendly: click canvas edges? skip for simplicity

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    state.animTime += dt;
    state.grassWave += dt * 3;

    if (state.encounterCooldown > 0) {
      state.encounterCooldown -= dt;
    }

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

    if (state.mode === "play" || state.mode === "dex" || state.mode === "title" || state.mode === "win") {
      // keep world visible under overlays
      if (state.mode !== "title" || true) drawWorld();
    } else if (state.mode === "battle") {
      drawWorld();
    }

    requestAnimationFrame(frame);
  }

  // Init player pixel pos
  state.player.px = state.player.x * TILE_SIZE;
  state.player.py = state.player.y * TILE_SIZE;
  updateHud();
  showScreen("title");
  drawWorld();
  requestAnimationFrame(frame);
})();
