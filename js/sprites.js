/** Image assets for multi-screen Routewild */

const ASSET_URLS = {
  route: "assets/world/route.png",
  town: "assets/world/town.png",
  grove: "assets/world/grove.png",
  battle: "assets/world/battle.png",
  player: "assets/world/player.png",
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

function drawPlayer(ctx, px, py, facing, step) {
  const img = IMAGES.player;
  const bob = step % 2 === 1 ? 1 : 0;
  const size = 40;
  ctx.save();
  ctx.fillStyle = "rgba(74, 42, 50, 0.28)";
  ctx.beginPath();
  ctx.ellipse(px + TILE_SIZE / 2, py + TILE_SIZE - 2 + bob, 11, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  if (img) {
    const dx = px + (TILE_SIZE - size) / 2;
    const dy = py + TILE_SIZE - size - 2 + bob;
    if (facing === "left") {
      ctx.translate(dx + size, dy);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0, size, size);
    } else {
      ctx.drawImage(img, dx, dy, size, size);
    }
  } else {
    ctx.fillStyle = "#e891b0";
    ctx.fillRect(px + 10, py + 8, 12, 16);
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
  ctx.strokeStyle = "#5c3040";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

function drawNpcMarker(ctx, x, y, kind) {
  const px = x * TILE_SIZE + 8;
  const py = y * TILE_SIZE + 4;
  ctx.save();
  ctx.fillStyle = kind === "heal" ? "#f2a0c0" : kind === "shop" ? "#f0c878" : "#c8b0e0";
  ctx.fillRect(px + 4, py + 2, 8, 10);
  ctx.fillStyle = "#fff8fb";
  ctx.fillRect(px + 6, py, 4, 4);
  // bobbing tip
  ctx.fillStyle = "#5c3040";
  ctx.font = "bold 10px Quicksand, sans-serif";
  ctx.fillText("!", px + 6, py - 1);
  ctx.restore();
}
