/** Image assets + drawing helpers */

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

function drawCreature(ctx, creature, cx, cy, scale = 1) {
  const img = IMAGES[creature.id];
  if (!img) return;
  const size = 140 * scale;
  ctx.save();
  const g = ctx.createRadialGradient(cx, cy + size * 0.1, size * 0.15, cx, cy, size * 0.55);
  g.addColorStop(0, (creature.colors?.glow || "#ffc4d4") + "88");
  g.addColorStop(1, "rgba(255,200,220,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy + 8, size * 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.drawImage(img, cx - size / 2, cy - size / 2, size, size);
  ctx.restore();
}

function playerImageKey(outfitId) {
  return `player_${outfitId || "cloak_pink"}`;
}

function drawPlayer(ctx, px, py, facing, step, outfitId, accessoryId, bobTime = 0) {
  const img = IMAGES[playerImageKey(outfitId)] || IMAGES.player || IMAGES.player_cloak_pink;
  const bob = step % 2 === 1 ? 1 : 0;
  const size = 42;
  ctx.save();
  ctx.fillStyle = "rgba(74, 42, 50, 0.28)";
  ctx.beginPath();
  ctx.ellipse(px + TILE_SIZE / 2, py + TILE_SIZE - 2 + bob, 11, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  const dx = px + (TILE_SIZE - size) / 2;
  const dy = py + TILE_SIZE - size - 2 + bob;
  if (img) {
    if (facing === "left") {
      ctx.translate(dx + size, dy);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0, size, size);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.translate(0, 0);
    } else {
      ctx.drawImage(img, dx, dy, size, size);
    }
  }

  // accessory overlay (small icon near head)
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

  // soft pad
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

  // distinctive overhead icon
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
  ctx.save();
  ctx.globalAlpha = 0.55 + Math.sin(animTime * 3 + warp.x) * 0.15;
  if (icon) {
    ctx.drawImage(icon, px + 2, py + 2, 28, 28);
  } else {
    ctx.strokeStyle = "#c45f84";
    ctx.lineWidth = 2;
    ctx.strokeRect(px + 6, py + 6, 20, 20);
  }
  ctx.restore();
}

function drawPenCreature(ctx, creatureId, slot, animTime) {
  const img = IMAGES[creatureId];
  if (!img) return;
  const bob = Math.sin(animTime * 2 + slot.x) * 2;
  const px = slot.x * TILE_SIZE + 16;
  const py = slot.y * TILE_SIZE + 16 + bob;
  ctx.drawImage(img, px - 20, py - 22, 40, 40);
}
