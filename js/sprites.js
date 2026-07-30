/** Soft pastel pixel sprites — sakura style with maroon outlines & large eyes */

function px(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
}

/** Single sakura blossom (5 soft petals + cream center) */
function blossom(ctx, x, y, s, c) {
  const p = Math.max(1, Math.round(s));
  px(ctx, x - 2 * p, y - p, 4 * p, 2 * p, c.flower);
  px(ctx, x - p, y - 2 * p, 2 * p, 4 * p, c.flower);
  px(ctx, x - 2 * p, y - 2 * p, p, p, c.flowerDeep);
  px(ctx, x + p, y - 2 * p, p, p, c.flowerDeep);
  px(ctx, x - 2 * p, y + p, p, p, c.flowerDeep);
  px(ctx, x + p, y + p, p, p, c.flowerDeep);
  px(ctx, x - p, y - p, 2 * p, 2 * p, c.light);
  px(ctx, x - Math.floor(p / 2), y - Math.floor(p / 2), Math.max(1, p), Math.max(1, p), "#fffaf8");
}

function eyes(ctx, lx, rx, y, s, c) {
  // big soft eyes like the reference
  px(ctx, lx, y, 4 * s, 4 * s, c.outline);
  px(ctx, rx, y, 4 * s, 4 * s, c.outline);
  px(ctx, lx + s, y + s, 3 * s, 3 * s, "#fffaf8");
  px(ctx, rx + s, y + s, 3 * s, 3 * s, "#fffaf8");
  px(ctx, lx + 1.5 * s, y + 1.5 * s, 2 * s, 2 * s, c.eye);
  px(ctx, rx + 1.5 * s, y + 1.5 * s, 2 * s, 2 * s, c.eye);
  px(ctx, lx + 1.5 * s, y + 1.5 * s, s, s, "#ffffff");
  px(ctx, rx + 1.5 * s, y + 1.5 * s, s, s, "#ffffff");
  // pink lower glimmer
  px(ctx, lx + s, y + 3 * s, s, s, c.flower);
  px(ctx, rx + s, y + 3 * s, s, s, c.flower);
}

function drawCreature(ctx, creature, cx, cy, scale = 4) {
  const c = creature.colors;
  const s = scale;
  ctx.save();
  ctx.translate(cx, cy);

  ctx.beginPath();
  ctx.fillStyle = c.glow + "66";
  ctx.arc(0, 3 * s, 15 * s, 0, Math.PI * 2);
  ctx.fill();

  switch (creature.id) {
    case "bloomvu":
      drawBloomvu(ctx, c, s);
      break;
    case "lilypurr":
      drawLilypurr(ctx, c, s);
      break;
    case "fernkit":
      drawFernkit(ctx, c, s);
      break;
    case "petalamp":
      drawPetalamp(ctx, c, s);
      break;
    case "roseroot":
      drawRoseroot(ctx, c, s);
      break;
    default:
      px(ctx, -4 * s, -4 * s, 8 * s, 8 * s, c.body);
  }

  ctx.restore();
}

/**
 * Bloomvu — cherry-blossom fox (closest to the reference art).
 * Pale pink body, flower crown, branch-blossom ears, bushy petal tail.
 */
function drawBloomvu(ctx, c, s) {
  // --- Tail (bushy blossom branch) ---
  px(ctx, 3 * s, -2 * s, 10 * s, 9 * s, c.outline);
  px(ctx, 4 * s, -1 * s, 8 * s, 7 * s, c.dark);
  px(ctx, 5 * s, -1 * s, 7 * s, 5 * s, c.flowerDeep);
  px(ctx, 6 * s, 0, 5 * s, 4 * s, c.flower);
  px(ctx, 7 * s, 1 * s, 3 * s, 2 * s, c.light);
  blossom(ctx, 8 * s, -2 * s, s, c);
  blossom(ctx, 12 * s, 0, s, c);
  blossom(ctx, 10 * s, 4 * s, s, c);
  blossom(ctx, 6 * s, 3 * s, Math.max(1, s * 0.75), c);

  // --- Body ---
  px(ctx, -6 * s, -1 * s, 11 * s, 9 * s, c.outline);
  px(ctx, -5 * s, 0, 9 * s, 7 * s, c.body);
  px(ctx, -4 * s, 1 * s, 7 * s, 4 * s, c.light);
  // chest flowers
  blossom(ctx, -2 * s, 2 * s, Math.max(1, s * 0.7), c);
  blossom(ctx, 1 * s, 3 * s, Math.max(1, s * 0.55), c);

  // --- Head ---
  px(ctx, -5.5 * s, -8 * s, 11 * s, 8 * s, c.outline);
  px(ctx, -4.5 * s, -7 * s, 9 * s, 6 * s, c.body);
  px(ctx, -3.5 * s, -6 * s, 7 * s, 4 * s, c.light);

  // Ears (tall triangles via stepped rects) + branch blossoms
  px(ctx, -6 * s, -14 * s, 4 * s, 7 * s, c.outline);
  px(ctx, -5 * s, -13 * s, 2.5 * s, 6 * s, c.body);
  px(ctx, -5 * s, -12 * s, 1.2 * s, 4 * s, c.mid);
  px(ctx, 2 * s, -14 * s, 4 * s, 7 * s, c.outline);
  px(ctx, 2.5 * s, -13 * s, 2.5 * s, 6 * s, c.body);
  px(ctx, 3.5 * s, -12 * s, 1.2 * s, 4 * s, c.mid);
  // dark branch tips
  px(ctx, -7 * s, -14 * s, 1.5 * s, 3 * s, c.dark);
  px(ctx, 5.5 * s, -14 * s, 1.5 * s, 3 * s, c.dark);
  blossom(ctx, -6.5 * s, -14.5 * s, Math.max(1, s * 0.7), c);
  blossom(ctx, 6 * s, -14.5 * s, Math.max(1, s * 0.7), c);
  blossom(ctx, -7 * s, -11 * s, Math.max(1, s * 0.55), c);
  blossom(ctx, 6.5 * s, -11 * s, Math.max(1, s * 0.55), c);

  // Forehead flower crown (large layered blossom)
  blossom(ctx, 0, -9.5 * s, s * 1.1, c);
  blossom(ctx, -2.5 * s, -8.5 * s, Math.max(1, s * 0.7), c);
  blossom(ctx, 2.5 * s, -8.5 * s, Math.max(1, s * 0.7), c);

  eyes(ctx, -4.5 * s, 0.5 * s, -5.5 * s, s, c);

  // Snout
  px(ctx, -2 * s, -1.5 * s, 4 * s, 2.2 * s, c.light);
  px(ctx, -1 * s, -1.5 * s, 2 * s, 1 * s, c.outline);
  // soft smile / blush
  px(ctx, -4 * s, -1 * s, 1 * s, 1 * s, c.flower);
  px(ctx, 3 * s, -1 * s, 1 * s, 1 * s, c.flower);

  // Paws
  px(ctx, -5.5 * s, 6 * s, 4 * s, 3 * s, c.outline);
  px(ctx, 0.5 * s, 6 * s, 4 * s, 3 * s, c.outline);
  px(ctx, -4.5 * s, 6.5 * s, 2.5 * s, 1.5 * s, c.mid);
  px(ctx, 1.5 * s, 6.5 * s, 2.5 * s, 1.5 * s, c.mid);
  blossom(ctx, -3.5 * s, 5 * s, Math.max(1, s * 0.55), c);
}

function drawLilypurr(ctx, c, s) {
  // side lily pads
  px(ctx, -9 * s, 0, 6 * s, 5 * s, c.outline);
  px(ctx, 3 * s, 0, 6 * s, 5 * s, c.outline);
  px(ctx, -8 * s, 1 * s, 4 * s, 3 * s, "#9ecc90");
  px(ctx, 4 * s, 1 * s, 4 * s, 3 * s, "#9ecc90");
  px(ctx, -7 * s, 1.5 * s, 2 * s, 1.5 * s, "#b8e0a0");
  px(ctx, 5 * s, 1.5 * s, 2 * s, 1.5 * s, "#b8e0a0");

  // body
  px(ctx, -5 * s, -2 * s, 10 * s, 9 * s, c.outline);
  px(ctx, -4 * s, -1 * s, 8 * s, 7 * s, c.body);
  px(ctx, -3 * s, 0, 6 * s, 5 * s, c.light);

  // head
  px(ctx, -5 * s, -9 * s, 10 * s, 8 * s, c.outline);
  px(ctx, -4 * s, -8 * s, 8 * s, 6 * s, c.body);
  px(ctx, -3 * s, -7 * s, 6 * s, 4 * s, c.light);

  // cat ears
  px(ctx, -5 * s, -13 * s, 3.5 * s, 5 * s, c.outline);
  px(ctx, 1.5 * s, -13 * s, 3.5 * s, 5 * s, c.outline);
  px(ctx, -4 * s, -12 * s, 2 * s, 4 * s, c.body);
  px(ctx, 2.5 * s, -12 * s, 2 * s, 4 * s, c.body);
  px(ctx, -4 * s, -11 * s, 1 * s, 2.5 * s, c.flower);

  // water lily on head
  px(ctx, -2.5 * s, -11 * s, 5 * s, 2 * s, "#8eb878");
  blossom(ctx, 0, -12 * s, s, c);

  eyes(ctx, -4 * s, 0.5 * s, -6 * s, s * 0.9, c);

  // whiskers + nose
  px(ctx, -7 * s, -3 * s, 3 * s, 1 * s, c.dark);
  px(ctx, 4 * s, -3 * s, 3 * s, 1 * s, c.dark);
  px(ctx, -1 * s, -2.5 * s, 2 * s, 1 * s, c.outline);
  // dew
  px(ctx, -8 * s, -5 * s, 1.2 * s, 1.2 * s, c.light);
  px(ctx, 7 * s, -4 * s, 1.2 * s, 1.2 * s, c.light);

  px(ctx, -4 * s, 6 * s, 3 * s, 2 * s, c.outline);
  px(ctx, 1 * s, 6 * s, 3 * s, 2 * s, c.outline);
}

function drawFernkit(ctx, c, s) {
  // puff tail
  px(ctx, 4 * s, -1 * s, 5 * s, 6 * s, c.outline);
  px(ctx, 5 * s, 0, 3 * s, 4 * s, c.body);
  px(ctx, 5.5 * s, 0.5 * s, 2 * s, 2 * s, c.mid);

  // body
  px(ctx, -6 * s, -1 * s, 11 * s, 8 * s, c.outline);
  px(ctx, -5 * s, 0, 9 * s, 6 * s, c.body);
  px(ctx, -4 * s, 1 * s, 7 * s, 4 * s, c.light);

  // round head
  px(ctx, -5 * s, -8 * s, 10 * s, 8 * s, c.outline);
  px(ctx, -4 * s, -7 * s, 8 * s, 6 * s, c.body);
  px(ctx, -3 * s, -6 * s, 6 * s, 4 * s, c.light);

  // long rabbit ears
  px(ctx, -5 * s, -16 * s, 3.2 * s, 9 * s, c.outline);
  px(ctx, 1.8 * s, -16 * s, 3.2 * s, 9 * s, c.outline);
  px(ctx, -4 * s, -15 * s, 2 * s, 8 * s, c.body);
  px(ctx, 2.5 * s, -15 * s, 2 * s, 8 * s, c.body);
  px(ctx, -4 * s, -14 * s, 1 * s, 6 * s, c.flower);
  px(ctx, 2.5 * s, -14 * s, 1 * s, 6 * s, c.flower);

  // fern curls
  px(ctx, -1 * s, -10 * s, 1 * s, 3 * s, c.dark);
  px(ctx, 0, -11 * s, 2.5 * s, 1 * s, c.mid);
  px(ctx, 1.5 * s, -10 * s, 1 * s, 2 * s, c.mid);
  blossom(ctx, -2.5 * s, -9 * s, Math.max(1, s * 0.7), c);

  eyes(ctx, -4 * s, 0.5 * s, -5 * s, s * 0.9, c);
  px(ctx, -1 * s, -1.5 * s, 2 * s, 1 * s, c.outline);
  px(ctx, -4 * s, -1.5 * s, 1 * s, 1 * s, c.flower);
  px(ctx, 3 * s, -1.5 * s, 1 * s, 1 * s, c.flower);

  px(ctx, -5 * s, 5 * s, 4 * s, 3 * s, c.outline);
  px(ctx, 1 * s, 5 * s, 4 * s, 3 * s, c.outline);
  px(ctx, -4 * s, 6 * s, 2 * s, 1 * s, c.light);
  px(ctx, 2 * s, 6 * s, 2 * s, 1 * s, c.light);
}

function drawPetalamp(ctx, c, s) {
  // wisteria wings
  px(ctx, -13 * s, -6 * s, 9 * s, 11 * s, c.outline);
  px(ctx, 4 * s, -6 * s, 9 * s, 11 * s, c.outline);
  px(ctx, -12 * s, -5 * s, 7 * s, 9 * s, c.flower);
  px(ctx, 5 * s, -5 * s, 7 * s, 9 * s, c.flower);
  px(ctx, -11 * s, -4 * s, 5 * s, 6 * s, c.flowerDeep);
  px(ctx, 6 * s, -4 * s, 5 * s, 6 * s, c.flowerDeep);
  px(ctx, -10 * s, -3 * s, 3 * s, 3 * s, c.light);
  px(ctx, 7 * s, -3 * s, 3 * s, 3 * s, c.light);
  // spark pollen
  px(ctx, -14 * s, -7 * s, 1.2 * s, 1.2 * s, c.glow);
  px(ctx, 13 * s, -2 * s, 1.2 * s, 1.2 * s, c.glow);
  px(ctx, -9 * s, 5 * s, 1 * s, 1 * s, c.light);
  px(ctx, 10 * s, 4 * s, 1 * s, 1 * s, "#fff8e4");

  // body
  px(ctx, -3.5 * s, -6 * s, 7 * s, 11 * s, c.outline);
  px(ctx, -2.5 * s, -5 * s, 5 * s, 9 * s, c.body);
  px(ctx, -1.5 * s, -4 * s, 3 * s, 6 * s, c.light);

  // head
  px(ctx, -4.5 * s, -11 * s, 9 * s, 6 * s, c.outline);
  px(ctx, -3.5 * s, -10 * s, 7 * s, 4 * s, c.body);
  px(ctx, -2.5 * s, -9 * s, 5 * s, 2.5 * s, c.light);

  eyes(ctx, -3.5 * s, 0.5 * s, -9 * s, s * 0.75, c);

  // antennae
  px(ctx, -3 * s, -14 * s, 1 * s, 4 * s, c.dark);
  px(ctx, 2 * s, -14 * s, 1 * s, 4 * s, c.dark);
  blossom(ctx, -3 * s, -15 * s, Math.max(1, s * 0.7), c);
  blossom(ctx, 3 * s, -15 * s, Math.max(1, s * 0.7), c);

  px(ctx, -2 * s, 4 * s, 1.2 * s, 2 * s, c.outline);
  px(ctx, 1 * s, 4 * s, 1.2 * s, 2 * s, c.outline);
}

function drawRoseroot(ctx, c, s) {
  // rocky body
  px(ctx, -7 * s, -2 * s, 14 * s, 10 * s, c.outline);
  px(ctx, -6 * s, -1 * s, 12 * s, 8 * s, c.body);
  px(ctx, -5 * s, 0, 10 * s, 5 * s, c.light);
  px(ctx, -4 * s, 2 * s, 3 * s, 1 * s, c.dark);
  px(ctx, 1 * s, 3 * s, 4 * s, 1 * s, c.dark);
  px(ctx, -2 * s, 1 * s, 2.5 * s, 2 * s, "#8aaa70");

  // head
  px(ctx, -6 * s, -8 * s, 12 * s, 8 * s, c.outline);
  px(ctx, -5 * s, -7 * s, 10 * s, 6 * s, c.body);
  px(ctx, -4 * s, -6 * s, 8 * s, 4 * s, c.light);

  // stone ear bumps
  px(ctx, -6 * s, -10 * s, 4 * s, 3 * s, c.outline);
  px(ctx, 2 * s, -10 * s, 4 * s, 3 * s, c.outline);
  px(ctx, -5 * s, -9 * s, 2.5 * s, 2 * s, c.mid);
  px(ctx, 3 * s, -9 * s, 2.5 * s, 2 * s, c.mid);

  // rose vine crown
  px(ctx, -3.5 * s, -11 * s, 7 * s, 2 * s, "#5a8048");
  blossom(ctx, -1 * s, -12.5 * s, s, c);
  blossom(ctx, 2.5 * s, -11.5 * s, Math.max(1, s * 0.75), c);
  px(ctx, 4.5 * s, -4 * s, 1 * s, 4 * s, "#5a8048");
  blossom(ctx, 5.5 * s, -2 * s, Math.max(1, s * 0.65), c);

  eyes(ctx, -4.5 * s, 0.5 * s, -5.5 * s, s * 0.9, c);
  px(ctx, -1 * s, -2 * s, 2 * s, 1 * s, c.outline);

  // paws
  px(ctx, -7 * s, 6 * s, 5 * s, 3.5 * s, c.outline);
  px(ctx, 2 * s, 6 * s, 5 * s, 3.5 * s, c.outline);
  px(ctx, -6 * s, 7 * s, 3 * s, 1.5 * s, c.mid);
  px(ctx, 3 * s, 7 * s, 3 * s, 1.5 * s, c.mid);
  px(ctx, -5 * s, 8.5 * s, 1 * s, 1 * s, c.dark);
  px(ctx, -3 * s, 8.5 * s, 1 * s, 1 * s, c.dark);
  px(ctx, 4 * s, 8.5 * s, 1 * s, 1 * s, c.dark);
  px(ctx, 6 * s, 8.5 * s, 1 * s, 1 * s, c.dark);
}

function drawPlayer(ctx, px0, py0, facing, step) {
  const bob = step % 2 === 1 ? 1 : 0;
  ctx.save();
  ctx.translate(px0, py0 + bob);

  ctx.fillStyle = "rgba(90, 48, 64, 0.22)";
  ctx.beginPath();
  ctx.ellipse(TILE_SIZE / 2, TILE_SIZE - 3, 9, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  px(ctx, 8, 22, 6, 4, "#6b3f48");
  px(ctx, 18, 22, 6, 4, "#6b3f48");
  px(ctx, 10, 16, 5, 7, "#7a90b8");
  px(ctx, 17, 16, 5, 7, "#7a90b8");
  px(ctx, 9, 8, 14, 10, "#e891b0");
  px(ctx, 12, 10, 8, 6, "#fff0f5");
  px(ctx, 10, 2, 12, 8, "#f0c8b0");
  px(ctx, 10, 1, 12, 3, "#5c3040");
  px(ctx, 20, 0, 3, 3, "#f2a0b8");
  px(ctx, 21, 1, 1, 1, "#fff8fb");

  if (facing === "up") {
    px(ctx, 10, 1, 12, 7, "#5c3040");
  } else {
    px(ctx, 12, 5, 2, 2, "#3a1824");
    px(ctx, 18, 5, 2, 2, "#3a1824");
    px(ctx, 12, 5, 1, 1, "#fff");
    px(ctx, 18, 5, 1, 1, "#fff");
  }

  px(ctx, 22, 8, 4, 9, "#8b4a5c");
  px(ctx, 23, 10, 2, 2, "#f2a0b8");

  ctx.restore();
}

function drawOrb(ctx, x, y, shake = 0) {
  ctx.save();
  ctx.translate(x + shake, y);
  ctx.fillStyle = "#fff8fb";
  ctx.beginPath();
  ctx.arc(0, 0, 11, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = "#e891b0";
  ctx.beginPath();
  ctx.arc(0, 0, 11, 0, Math.PI);
  ctx.fill();
  ctx.strokeStyle = "#5c3040";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-11, 0);
  ctx.lineTo(11, 0);
  ctx.stroke();
  ctx.fillStyle = "#fff0f5";
  ctx.beginPath();
  ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#5c3040";
  ctx.stroke();
  ctx.fillStyle = "#f2a0b8";
  ctx.fillRect(-1, -7, 2, 2);
  ctx.restore();
}
