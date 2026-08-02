/** Image assets + drawing helpers (walk cycles, creature idle, warps) */

const ASSET_URLS = {
  route: "assets/world/route.png",
  town: "assets/world/town.png",
  grove: "assets/world/grove.png",
  shore: "assets/world/shore.png",
  pen: "assets/world/pen.png",
  battle: "assets/world/battle.png",
  player: "assets/world/player.png",
  player_cloak_pink: "assets/world/player_cloak_pink.png",
  player_coat_mint: "assets/world/player_coat_mint.png",
  player_cape_lavender: "assets/world/player_cape_lavender.png",
  player_vest_coral: "assets/world/player_vest_coral.png",
  player_cloak_pink_walk: "assets/world/player_cloak_pink_walk.png",
  player_coat_mint_walk: "assets/world/player_coat_mint_walk.png",
  player_cape_lavender_walk: "assets/world/player_cape_lavender_walk.png",
  player_vest_coral_walk: "assets/world/player_vest_coral_walk.png",
  bloomvu: "assets/creatures/bloomvu.png",
  lilypurr: "assets/creatures/lilypurr.png",
  fernkit: "assets/creatures/fernkit.png",
  petalamp: "assets/creatures/petalamp.png",
  roseroot: "assets/creatures/roseroot.png",
  mistwing: "assets/creatures/mistwing.png",
  thornpaw: "assets/creatures/thornpaw.png",
  glacilia: "assets/creatures/glacilia.png",
  emberose: "assets/creatures/emberose.png",
  crystalyn: "assets/creatures/crystalyn.png",
  pearlotter: "assets/creatures/pearlotter.png",
  coralclaw: "assets/creatures/coralclaw.png",
  kelpsong: "assets/creatures/kelpsong.png",
  anemist: "assets/creatures/anemist.png",
  nightdrift: "assets/creatures/nightdrift.png",
  npc_nurse: "assets/npcs/nurse.png",
  npc_vendor: "assets/npcs/vendor.png",
  npc_elder: "assets/npcs/elder.png",
  npc_scout: "assets/npcs/scout.png",
  npc_mystic: "assets/npcs/mystic.png",
  icon_warp: "assets/ui/warp.png",
  icon_heal: "assets/ui/heal.png",
  icon_shop: "assets/ui/shop.png",
  icon_talk: "assets/ui/talk.png",
  icon_pen: "assets/ui/pen.png",
  icon_skill: "assets/ui/skill.png",
  icon_mirror: "assets/ui/mirror.png",
  cos_clip_sakura: "assets/cosmetics/clip_sakura.png",
  cos_hat_straw: "assets/cosmetics/hat_straw.png",
  cos_crown_flower: "assets/cosmetics/crown_flower.png",
  cos_earrings_pearl: "assets/cosmetics/earrings_pearl.png",
  cos_scarf_leaf: "assets/cosmetics/scarf_leaf.png",
  cos_pendant_crystal: "assets/cosmetics/pendant_crystal.png",
  cos_brooch_rose: "assets/cosmetics/brooch_rose.png",
  cos_boots_soft: "assets/cosmetics/boots_soft.png",
};

const IMAGES = {};

function loadImages() {
  return Promise.all(
    Object.entries(ASSET_URLS).map(
      ([key, url]) =>
        new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            IMAGES[key] = img;
            resolve();
          };
          img.onerror = () => reject(new Error("Failed to load " + url));
          img.src = url;
        })
    )
  );
}

function drawCreature(ctx, creature, cx, cy, scale = 1, animTime = 0, opts = {}) {
  const img = IMAGES[creature.id];
  if (!img) return;
  const size = 140 * scale;
  const bob = Math.sin(animTime * 3 + (opts.phase || 0)) * (opts.bob ?? 4);
  const squash = 1 + Math.sin(animTime * 3 + 1) * 0.03;
  const lunge = opts.lunge || 0;
  ctx.save();
  const g = ctx.createRadialGradient(cx + lunge, cy + size * 0.1 + bob, size * 0.15, cx + lunge, cy + bob, size * 0.55);
  g.addColorStop(0, (creature.colors?.glow || "#ffc4d4") + "88");
  g.addColorStop(1, "rgba(255,200,220,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx + lunge, cy + 8 + bob, size * 0.5, 0, Math.PI * 2);
  ctx.fill();

  const w = size * (opts.mirror ? -1 : 1);
  const h = size * squash;
  ctx.translate(cx + lunge, cy + bob);
  if (opts.mirror) ctx.scale(-1, 1);
  ctx.drawImage(img, -Math.abs(w) / 2, -h / 2, Math.abs(w), h);

  // soft sparkle
  ctx.globalAlpha = 0.35 + Math.sin(animTime * 5) * 0.15;
  ctx.fillStyle = creature.colors?.glow || "#ffc4d4";
  ctx.beginPath();
  ctx.arc(size * 0.28, -size * 0.2, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function playerImageKey(outfitId) {
  return `player_${outfitId || "cloak_pink"}`;
}

function playerWalkKey(outfitId) {
  return `player_${outfitId || "cloak_pink"}_walk`;
}

function drawPlayer(ctx, px, py, facing, step, outfitId, accessoryId, bobTime = 0, moving = false) {
  const walk = IMAGES[playerWalkKey(outfitId)];
  const img = IMAGES[playerImageKey(outfitId)] || IMAGES.player || IMAGES.player_cloak_pink;
  const frame = moving ? (Math.floor(bobTime * 10) % 4) : (step % 2);
  const bob = moving ? Math.sin(bobTime * 14) * 2 : (step % 2 === 1 ? 1 : 0);
  const size = 42;
  ctx.save();
  ctx.fillStyle = "rgba(74, 42, 50, 0.28)";
  ctx.beginPath();
  ctx.ellipse(px + TILE_SIZE / 2, py + TILE_SIZE - 2 + Math.abs(bob) * 0.3, 11 + (moving ? 1 : 0), 4, 0, 0, Math.PI * 2);
  ctx.fill();

  const dx = px + (TILE_SIZE - size) / 2;
  const dy = py + TILE_SIZE - size - 2 + bob;

  const drawFacing = (drawFn) => {
    if (facing === "left") {
      ctx.save();
      ctx.translate(dx + size, dy);
      ctx.scale(-1, 1);
      drawFn(0, 0);
      ctx.restore();
    } else {
      drawFn(dx, dy);
    }
  };

  if (walk && moving) {
    drawFacing((x, y) => {
      ctx.drawImage(walk, frame * 128, 0, 128, 128, x, y, size, size);
    });
  } else if (img) {
    drawFacing((x, y) => {
      // idle breathing
      const breath = 1 + Math.sin(bobTime * 2.2) * 0.02;
      const ih = size * breath;
      ctx.drawImage(img, x, y + (size - ih), size, ih);
    });
  }

  const acc = IMAGES[`cos_${accessoryId}`];
  if (acc) {
    const ax = facing === "left" ? dx + 4 : dx + size - 18;
    const ay = dy + 2 + Math.sin(bobTime * 3) * 1;
    ctx.drawImage(acc, ax, ay, 16, 16);
  }
  ctx.restore();
}

function drawOrb(ctx, x, y, shake = 0) {
  ctx.save();
  ctx.translate(x + shake, y);
  ctx.fillStyle = "#fff8fb";
  ctx.beginPath();
  ctx.arc(0, 0, 14, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = "#e891b0";
  ctx.beginPath();
  ctx.arc(0, 0, 14, 0, Math.PI);
  ctx.fill();
  ctx.strokeStyle = "#5c3040";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-14, 0);
  ctx.lineTo(14, 0);
  ctx.stroke();
  ctx.fillStyle = "#fff0f5";
  ctx.beginPath();
  ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawNpc(ctx, npc, animTime) {
  const bob = Math.sin(animTime * 3 + npc.x) * 2;
  const px = npc.x * TILE_SIZE;
  const py = npc.y * TILE_SIZE + bob;
  const sprite = IMAGES[`npc_${npc.sprite}`];
  const icon = IMAGES[`icon_${npc.icon || npc.kind}`];

  ctx.fillStyle = "rgba(255,248,251,0.45)";
  ctx.beginPath();
  ctx.ellipse(px + 16, py + 28, 12, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  if (sprite) {
    ctx.drawImage(sprite, px - 4, py - 10, 40, 40);
  } else {
    ctx.fillStyle = "#e891b0";
    ctx.fillRect(px + 8, py + 4, 16, 22);
  }

  if (icon) {
    ctx.drawImage(icon, px + 20, py - 18 + Math.sin(animTime * 4) * 2, 18, 18);
  } else {
    ctx.fillStyle = "#5c3040";
    ctx.font = "bold 12px Quicksand, sans-serif";
    ctx.fillText("!", px + 22, py - 4);
  }
}

function drawWarp(ctx, warp, animTime) {
  const px = warp.x * TILE_SIZE;
  const py = warp.y * TILE_SIZE;
  const icon = IMAGES[`icon_${warp.icon || "warp"}`];
  const pulse = 0.45 + Math.sin(animTime * 4 + warp.x) * 0.2;

  ctx.save();
  // glowing path pad
  ctx.fillStyle = `rgba(232, 145, 176, ${0.25 + pulse * 0.25})`;
  ctx.beginPath();
  ctx.arc(px + 16, py + 16, 13, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = `rgba(196, 95, 132, ${0.55 + pulse * 0.35})`;
  ctx.lineWidth = 2;
  ctx.strokeRect(px + 4, py + 4, 24, 24);

  ctx.globalAlpha = 0.75 + pulse * 0.2;
  if (icon) {
    ctx.drawImage(icon, px + 2, py - 2 + Math.sin(animTime * 3) * 2, 28, 28);
  }

  // direction chevron
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = "#fff8fb";
  ctx.font = "bold 12px Quicksand, sans-serif";
  ctx.textAlign = "center";
  const chev = warp.dir === "up" ? "▲" : warp.dir === "down" ? "▼" : warp.dir === "left" ? "◀" : warp.dir === "right" ? "▶" : "✦";
  ctx.fillText(chev, px + 16, py + 28);
  ctx.restore();
}

function drawPenCreature(ctx, creatureId, slot, animTime) {
  const img = IMAGES[creatureId];
  if (!img) return;
  const bob = Math.sin(animTime * 2.5 + slot.x) * 3;
  const squash = 1 + Math.sin(animTime * 2.5 + slot.x) * 0.04;
  const px = slot.x * TILE_SIZE + 16;
  const py = slot.y * TILE_SIZE + 16 + bob;
  const h = 40 * squash;
  ctx.drawImage(img, px - 20, py - h / 2 - 2, 40, h);
}

function drawSolidHints(ctx, mapId, animTime) {
  // subtle outline on buildings/fences near player is optional; keep light tint for fence/building
  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      const t = getTileOn(mapId, x, y);
      if (t === TILE.FENCE) {
        ctx.fillStyle = "rgba(140, 100, 70, 0.16)";
        ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      } else if (t === TILE.BUILDING) {
        ctx.fillStyle = "rgba(90, 50, 70, 0.08)";
        ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      } else if (t === TILE.LEDGE) {
        ctx.fillStyle = "rgba(90, 60, 50, 0.12)";
        ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }
  }
}
