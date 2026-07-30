/** Pixel-art style creature & player drawing helpers */

function drawPixelRect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawCreature(ctx, creature, cx, cy, scale = 4) {
  const c = creature.colors;
  const s = scale;
  ctx.save();
  ctx.translate(cx, cy);

  // soft glow
  ctx.beginPath();
  ctx.fillStyle = c.glow + "44";
  ctx.arc(0, 4 * s, 14 * s, 0, Math.PI * 2);
  ctx.fill();

  switch (creature.id) {
    case "pyrokit":
      drawPyrokit(ctx, c, s);
      break;
    case "aquibble":
      drawAquibble(ctx, c, s);
      break;
    case "verdwing":
      drawVerdwing(ctx, c, s);
      break;
    case "voltmite":
      drawVoltmite(ctx, c, s);
      break;
    case "gravpaw":
      drawGravpaw(ctx, c, s);
      break;
    default:
      drawPixelRect(ctx, -4 * s, -4 * s, 8 * s, 8 * s, c.body);
  }

  ctx.restore();
}

function drawPyrokit(ctx, c, s) {
  // body
  drawPixelRect(ctx, -5 * s, -2 * s, 10 * s, 8 * s, c.body);
  // head
  drawPixelRect(ctx, -4 * s, -7 * s, 8 * s, 6 * s, c.body);
  // ears
  drawPixelRect(ctx, -5 * s, -10 * s, 3 * s, 4 * s, c.body);
  drawPixelRect(ctx, 2 * s, -10 * s, 3 * s, 4 * s, c.body);
  drawPixelRect(ctx, -4 * s, -9 * s, 1 * s, 2 * s, c.accent);
  drawPixelRect(ctx, 3 * s, -9 * s, 1 * s, 2 * s, c.accent);
  // belly
  drawPixelRect(ctx, -3 * s, 0 * s, 6 * s, 5 * s, c.accent);
  // eyes
  drawPixelRect(ctx, -3 * s, -5 * s, 2 * s, 2 * s, "#fff");
  drawPixelRect(ctx, 1 * s, -5 * s, 2 * s, 2 * s, "#fff");
  drawPixelRect(ctx, -2 * s, -4 * s, 1 * s, 1 * s, c.eye);
  drawPixelRect(ctx, 2 * s, -4 * s, 1 * s, 1 * s, c.eye);
  // nose
  drawPixelRect(ctx, -1 * s, -3 * s, 2 * s, 1 * s, c.dark);
  // flaming tail
  drawPixelRect(ctx, 5 * s, 0 * s, 4 * s, 3 * s, c.body);
  drawPixelRect(ctx, 8 * s, -3 * s, 3 * s, 4 * s, c.glow);
  drawPixelRect(ctx, 9 * s, -5 * s, 2 * s, 3 * s, c.accent);
  // paws
  drawPixelRect(ctx, -4 * s, 5 * s, 3 * s, 2 * s, c.dark);
  drawPixelRect(ctx, 1 * s, 5 * s, 3 * s, 2 * s, c.dark);
}

function drawAquibble(ctx, c, s) {
  // round body
  drawPixelRect(ctx, -6 * s, -4 * s, 12 * s, 10 * s, c.body);
  drawPixelRect(ctx, -4 * s, -6 * s, 8 * s, 3 * s, c.body);
  // belly
  drawPixelRect(ctx, -4 * s, -1 * s, 8 * s, 6 * s, c.accent);
  // eyes
  drawPixelRect(ctx, -4 * s, -3 * s, 3 * s, 3 * s, "#fff");
  drawPixelRect(ctx, 1 * s, -3 * s, 3 * s, 3 * s, "#fff");
  drawPixelRect(ctx, -3 * s, -2 * s, 1 * s, 1 * s, c.eye);
  drawPixelRect(ctx, 2 * s, -2 * s, 1 * s, 1 * s, c.eye);
  // cheeks
  drawPixelRect(ctx, -6 * s, 0 * s, 2 * s, 2 * s, "#7ec8e8");
  drawPixelRect(ctx, 4 * s, 0 * s, 2 * s, 2 * s, "#7ec8e8");
  // smile
  drawPixelRect(ctx, -2 * s, 1 * s, 4 * s, 1 * s, c.dark);
  // tadpole tail
  drawPixelRect(ctx, 6 * s, 0 * s, 4 * s, 3 * s, c.body);
  drawPixelRect(ctx, 9 * s, -1 * s, 3 * s, 5 * s, c.dark);
  // bubbles
  drawPixelRect(ctx, -8 * s, -8 * s, 2 * s, 2 * s, c.accent);
  drawPixelRect(ctx, -5 * s, -10 * s, 1 * s, 1 * s, c.accent);
  // feet
  drawPixelRect(ctx, -4 * s, 5 * s, 3 * s, 2 * s, c.dark);
  drawPixelRect(ctx, 1 * s, 5 * s, 3 * s, 2 * s, c.dark);
}

function drawVerdwing(ctx, c, s) {
  // wings
  drawPixelRect(ctx, -11 * s, -4 * s, 6 * s, 8 * s, c.accent);
  drawPixelRect(ctx, 5 * s, -4 * s, 6 * s, 8 * s, c.accent);
  drawPixelRect(ctx, -10 * s, -2 * s, 4 * s, 4 * s, c.body);
  drawPixelRect(ctx, 6 * s, -2 * s, 4 * s, 4 * s, c.body);
  // body
  drawPixelRect(ctx, -3 * s, -5 * s, 6 * s, 10 * s, c.body);
  drawPixelRect(ctx, -2 * s, -6 * s, 4 * s, 2 * s, c.dark);
  // leaf pattern
  drawPixelRect(ctx, -1 * s, -3 * s, 2 * s, 6 * s, c.accent);
  // eyes
  drawPixelRect(ctx, -2 * s, -4 * s, 1 * s, 1 * s, c.eye);
  drawPixelRect(ctx, 1 * s, -4 * s, 1 * s, 1 * s, c.eye);
  // antennae
  drawPixelRect(ctx, -3 * s, -8 * s, 1 * s, 3 * s, c.dark);
  drawPixelRect(ctx, 2 * s, -8 * s, 1 * s, 3 * s, c.dark);
  drawPixelRect(ctx, -4 * s, -9 * s, 2 * s, 1 * s, c.glow);
  drawPixelRect(ctx, 2 * s, -9 * s, 2 * s, 1 * s, c.glow);
  // feet
  drawPixelRect(ctx, -2 * s, 5 * s, 1 * s, 2 * s, c.dark);
  drawPixelRect(ctx, 1 * s, 5 * s, 1 * s, 2 * s, c.dark);
}

function drawVoltmite(ctx, c, s) {
  // shell
  drawPixelRect(ctx, -6 * s, -4 * s, 12 * s, 8 * s, c.body);
  drawPixelRect(ctx, -5 * s, -6 * s, 10 * s, 3 * s, c.accent);
  // shell ridge
  drawPixelRect(ctx, -1 * s, -6 * s, 2 * s, 8 * s, c.dark);
  drawPixelRect(ctx, -5 * s, -1 * s, 10 * s, 1 * s, c.dark);
  // head
  drawPixelRect(ctx, -3 * s, 2 * s, 6 * s, 4 * s, c.accent);
  // eyes
  drawPixelRect(ctx, -2 * s, 3 * s, 1 * s, 1 * s, c.eye);
  drawPixelRect(ctx, 1 * s, 3 * s, 1 * s, 1 * s, c.eye);
  // legs
  drawPixelRect(ctx, -7 * s, 0 * s, 2 * s, 1 * s, c.dark);
  drawPixelRect(ctx, -7 * s, 2 * s, 2 * s, 1 * s, c.dark);
  drawPixelRect(ctx, 5 * s, 0 * s, 2 * s, 1 * s, c.dark);
  drawPixelRect(ctx, 5 * s, 2 * s, 2 * s, 1 * s, c.dark);
  // sparks
  drawPixelRect(ctx, -9 * s, -5 * s, 1 * s, 3 * s, c.glow);
  drawPixelRect(ctx, -10 * s, -4 * s, 3 * s, 1 * s, c.glow);
  drawPixelRect(ctx, 8 * s, -3 * s, 1 * s, 3 * s, c.glow);
  drawPixelRect(ctx, 7 * s, -2 * s, 3 * s, 1 * s, c.glow);
}

function drawGravpaw(ctx, c, s) {
  // body
  drawPixelRect(ctx, -6 * s, -2 * s, 12 * s, 8 * s, c.body);
  // head
  drawPixelRect(ctx, -5 * s, -7 * s, 10 * s, 7 * s, c.body);
  // ears / stone bumps
  drawPixelRect(ctx, -6 * s, -9 * s, 3 * s, 3 * s, c.dark);
  drawPixelRect(ctx, 3 * s, -9 * s, 3 * s, 3 * s, c.dark);
  // snout
  drawPixelRect(ctx, -3 * s, -3 * s, 6 * s, 3 * s, c.accent);
  drawPixelRect(ctx, -1 * s, -2 * s, 2 * s, 1 * s, c.dark);
  // eyes
  drawPixelRect(ctx, -4 * s, -5 * s, 2 * s, 2 * s, "#fff");
  drawPixelRect(ctx, 2 * s, -5 * s, 2 * s, 2 * s, "#fff");
  drawPixelRect(ctx, -3 * s, -4 * s, 1 * s, 1 * s, c.eye);
  drawPixelRect(ctx, 3 * s, -4 * s, 1 * s, 1 * s, c.eye);
  // rock patches
  drawPixelRect(ctx, -5 * s, 1 * s, 3 * s, 2 * s, c.dark);
  drawPixelRect(ctx, 2 * s, 2 * s, 3 * s, 2 * s, c.dark);
  // paws
  drawPixelRect(ctx, -6 * s, 5 * s, 4 * s, 3 * s, c.accent);
  drawPixelRect(ctx, 2 * s, 5 * s, 4 * s, 3 * s, c.accent);
  drawPixelRect(ctx, -5 * s, 7 * s, 1 * s, 1 * s, c.dark);
  drawPixelRect(ctx, -3 * s, 7 * s, 1 * s, 1 * s, c.dark);
  drawPixelRect(ctx, 3 * s, 7 * s, 1 * s, 1 * s, c.dark);
  drawPixelRect(ctx, 5 * s, 7 * s, 1 * s, 1 * s, c.dark);
}

function drawPlayer(ctx, px, py, facing, step) {
  const s = 2;
  const bob = step % 2 === 1 ? 1 : 0;
  ctx.save();
  ctx.translate(px, py + bob);

  // shadow
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(TILE_SIZE / 2, TILE_SIZE - 4, 8, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // boots
  drawPixelRect(ctx, 8, 22, 6, 4, "#4a3420");
  drawPixelRect(ctx, 18, 22, 6, 4, "#4a3420");
  // legs
  drawPixelRect(ctx, 10, 16, 5, 7, "#3a5c8a");
  drawPixelRect(ctx, 17, 16, 5, 7, "#3a5c8a");
  // torso
  drawPixelRect(ctx, 9, 8, 14, 10, "#d94f3d");
  drawPixelRect(ctx, 12, 10, 8, 6, "#f0d78c");
  // head
  drawPixelRect(ctx, 10, 2, 12, 8, "#f0c8a0");
  // hair
  drawPixelRect(ctx, 10, 1, 12, 3, "#3a2818");
  if (facing === "down" || facing === "left" || facing === "right") {
    drawPixelRect(ctx, 12, 5, 2, 2, "#1c1810");
    drawPixelRect(ctx, 18, 5, 2, 2, "#1c1810");
  } else {
    drawPixelRect(ctx, 10, 1, 12, 6, "#3a2818");
  }
  // bag strap
  drawPixelRect(ctx, 22, 8, 3, 10, "#6b4a2e");

  ctx.restore();
}

function drawOrb(ctx, x, y, shake = 0) {
  ctx.save();
  ctx.translate(x + shake, y);
  // shell
  ctx.fillStyle = "#e8e8e8";
  ctx.beginPath();
  ctx.arc(0, 0, 10, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = "#d94f3d";
  ctx.beginPath();
  ctx.arc(0, 0, 10, 0, Math.PI);
  ctx.fill();
  ctx.strokeStyle = "#2a2a2a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-10, 0);
  ctx.lineTo(10, 0);
  ctx.stroke();
  ctx.fillStyle = "#f7f0d8";
  ctx.beginPath();
  ctx.arc(0, 0, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#2a2a2a";
  ctx.stroke();
  ctx.restore();
}
