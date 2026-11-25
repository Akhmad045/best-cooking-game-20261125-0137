// Bumbu & Api — everything the player sees, drawn on one canvas: the warm kitchen, the
// order rail, the ingredient counter, the stations, the assembly plate and the serve window.
// No images, no fonts from the network: every dish is drawn from shapes, every label is
// canvas text in a system font.

import {
  FIELD, FONT, INGREDIENTS, INGREDIENT_BY_ID, PALETTE, RECIPES, RECIPE_BY_ID, STAR_LINES,
} from './config.js';
import { LAYOUT } from './layout.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE, recipeForPlate, starsFor } from './state.js';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, value, x, y, size, color, weight = '700', align = 'left') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(value, x, y);
}

function shadowed(ctx, draw) {
  ctx.save();
  ctx.shadowColor = PALETTE.shadow;
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  draw();
  ctx.restore();
}

/** One ingredient, drawn as a little vector picture, centred at (x, y) with radius r. */
export function drawIngredient(ctx, id, x, y, r) {
  ctx.save();
  ctx.translate(x, y);
  if (id === 'rice') {
    ctx.fillStyle = '#f5efe0';
    ctx.beginPath();
    ctx.arc(0, r * 0.15, r * 0.85, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#d9c9a3';
    for (const [dx, dy] of [[-0.4, -0.3], [0, -0.5], [0.4, -0.25], [-0.15, -0.1], [0.25, -0.05]]) {
      ctx.beginPath();
      ctx.ellipse(dx * r, dy * r, r * 0.16, r * 0.09, 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'noodle') {
    ctx.strokeStyle = '#f7d774';
    ctx.lineWidth = r * 0.28;
    ctx.lineCap = 'round';
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.moveTo(-r * 0.7, i * r * 0.35);
      ctx.bezierCurveTo(-r * 0.3, i * r * 0.35 - r * 0.3, r * 0.3, i * r * 0.35 + r * 0.3, r * 0.7, i * r * 0.35);
      ctx.stroke();
    }
    ctx.strokeStyle = '#d9a441';
    ctx.lineWidth = r * 0.08;
    ctx.beginPath();
    ctx.moveTo(-r * 0.7, -r * 0.35);
    ctx.bezierCurveTo(-r * 0.3, -r * 0.65, r * 0.3, -r * 0.05, r * 0.7, -r * 0.35);
    ctx.stroke();
  } else if (id === 'egg') {
    ctx.fillStyle = '#fff8ea';
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.95, r * 0.7, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f2a93b';
    ctx.beginPath();
    ctx.arc(r * 0.1, -r * 0.05, r * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd97a';
    ctx.beginPath();
    ctx.arc(r * 0.02, -r * 0.12, r * 0.16, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'chicken') {
    ctx.fillStyle = '#f2b8a0';
    ctx.beginPath();
    ctx.arc(-r * 0.15, -r * 0.1, r * 0.62, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e08a68';
    ctx.beginPath();
    ctx.arc(-r * 0.35, -r * 0.3, r * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fdf6e3';
    ctx.lineWidth = r * 0.22;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(r * 0.35, r * 0.35);
    ctx.lineTo(r * 0.75, r * 0.75);
    ctx.stroke();
    ctx.fillStyle = '#fdf6e3';
    ctx.beginPath();
    ctx.arc(r * 0.82, r * 0.82, r * 0.2, 0, Math.PI * 2);
    ctx.arc(r * 0.62, r * 0.92, r * 0.16, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'veg') {
    ctx.fillStyle = '#4a8f2e';
    for (const [dx, dy, rr] of [[-0.35, 0.1, 0.42], [0.3, 0.05, 0.45], [0, -0.4, 0.42], [0.05, 0.35, 0.35]]) {
      ctx.beginPath();
      ctx.arc(dx * r, dy * r, rr * r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#7ec850';
    for (const [dx, dy] of [[-0.35, 0], [0.3, -0.05], [0, -0.45]]) {
      ctx.beginPath();
      ctx.arc(dx * r, dy * r, r * 0.16, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#8a6a3b';
    ctx.fillRect(-r * 0.08, r * 0.45, r * 0.16, r * 0.45);
  } else if (id === 'tofu') {
    ctx.fillStyle = '#fdf6e3';
    ctx.strokeStyle = '#cbb98a';
    ctx.lineWidth = r * 0.08;
    for (const [dx, dy, s] of [[-0.3, -0.25, 0.5], [0.35, -0.2, 0.42], [-0.05, 0.35, 0.46]]) {
      ctx.beginPath();
      ctx.rect((dx - s / 2) * r, (dy - s / 2) * r, s * r, s * r);
      ctx.fill();
      ctx.stroke();
    }
  } else if (id === 'kecap') {
    ctx.fillStyle = '#4a2c1a';
    ctx.beginPath();
    ctx.moveTo(-r * 0.35, -r * 0.2);
    ctx.quadraticCurveTo(-r * 0.45, r * 0.7, 0, r * 0.75);
    ctx.quadraticCurveTo(r * 0.45, r * 0.7, r * 0.35, -r * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#2c180c';
    ctx.fillRect(-r * 0.18, -r * 0.8, r * 0.36, r * 0.6);
    ctx.fillStyle = '#e8b64c';
    ctx.fillRect(-r * 0.35, r * 0.05, r * 0.7, r * 0.3);
  } else if (id === 'peanut') {
    ctx.fillStyle = '#c98a4b';
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.9, r * 0.6, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#a86a32';
    ctx.beginPath();
    ctx.ellipse(-r * 0.25, -r * 0.1, r * 0.2, r * 0.12, 0.4, 0, Math.PI * 2);
    ctx.ellipse(r * 0.3, r * 0.12, r * 0.18, r * 0.1, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e8c491';
    ctx.beginPath();
    ctx.arc(-r * 0.45, -r * 0.35, r * 0.14, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'broth') {
    ctx.fillStyle = '#e8b64c';
    ctx.beginPath();
    ctx.arc(0, r * 0.1, r * 0.8, 0, Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#fff3c4';
    ctx.lineWidth = r * 0.12;
    ctx.lineCap = 'round';
    for (const dx of [-0.35, 0, 0.35]) {
      ctx.beginPath();
      ctx.moveTo(dx * r, -r * 0.15);
      ctx.quadraticCurveTo((dx + 0.15) * r, -r * 0.55, dx * r, -r * 0.85);
      ctx.stroke();
    }
    ctx.fillStyle = '#7ec850';
    ctx.beginPath();
    ctx.arc(-r * 0.3, -r * 0.05, r * 0.14, 0, Math.PI * 2);
    ctx.arc(r * 0.3, 0, r * 0.14, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawPlate(ctx, x, y, r) {
  ctx.fillStyle = PALETTE.plate;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PALETTE.plateEdge;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.strokeStyle = '#e3d9bd';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, r * 0.72, 0, Math.PI * 2);
  ctx.stroke();
}

function drawDishOnPlate(ctx, recipeId, x, y, r) {
  const recipe = RECIPE_BY_ID[recipeId];
  if (!recipe) return;
  const spots = [[-0.3, -0.15], [0.3, -0.2], [0, 0.3]];
  recipe.needs.forEach((ingredientId, i) => {
    const spot = spots[i % spots.length];
    drawIngredient(ctx, ingredientId, x + spot[0] * r, y + spot[1] * r, r * 0.42);
  });
}

function patienceColor(fraction) {
  if (fraction > 0.5) return PALETTE.green;
  if (fraction > 0.25) return PALETTE.orange;
  return PALETTE.red;
}

function formatTime(seconds) {
  const total = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

function drawTopBar(ctx, state) {
  ctx.fillStyle = PALETTE.rail;
  ctx.fillRect(0, 0, FIELD.width, LAYOUT.topBar.h);
  text(ctx, 'BUMBU & API', LAYOUT.title.x, 38, 26, PALETTE.gold, '800');
  text(ctx, 'Spice Route Kitchen', LAYOUT.title.x + 218, 36, 14, PALETTE.muted, '600');

  const timer = LAYOUT.timer;
  const urgent = state.screen === SCREEN_PLAY && state.timeLeft <= 30;
  ctx.fillStyle = urgent && Math.floor(state.elapsed * 2) % 2 === 0 ? '#5a2320' : '#241a12';
  roundRect(ctx, timer.x, timer.y, timer.w, timer.h, 10);
  ctx.fill();
  text(ctx, '⏱', timer.x + 16, 38, 22, PALETTE.text, '700');
  text(ctx, formatTime(state.timeLeft), timer.x + 48, 40, 30, urgent ? '#ff8a7a' : PALETTE.text, '800');
  text(ctx, 'SHIFT', timer.x + 138, 38, 13, PALETTE.muted, '700');

  const coins = LAYOUT.coins;
  ctx.fillStyle = '#241a12';
  roundRect(ctx, coins.x, coins.y, coins.w, coins.h, 10);
  ctx.fill();
  text(ctx, '🪙', coins.x + 12, 38, 20, PALETTE.gold, '700');
  text(ctx, `${state.coins}`, coins.x + 42, 38, 24, PALETTE.gold, '800');
  if (state.combo >= 2) {
    text(ctx, `x${state.combo} COMBO`, coins.x + 108, 37, 15, PALETTE.orange, '800');
  }

  for (const [rect, label] of [[LAYOUT.muteButton, state.muted ? '🔇' : '🔊'], [LAYOUT.pauseButton, state.paused ? '▶' : '⏸']]) {
    ctx.fillStyle = '#241a12';
    roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 8);
    ctx.fill();
    text(ctx, label, rect.x + rect.w / 2, rect.y + 27, 18, PALETTE.text, '700', 'center');
  }
}

function drawOrderRail(ctx, state) {
  text(ctx, 'ORDER BOARD', LAYOUT.railLabel.x, LAYOUT.railLabel.y + 13, 14, PALETTE.muted, '800');
  text(ctx, `${state.served} served  •  ${state.walkouts} walked out`, 1050, LAYOUT.railLabel.y + 13, 14, PALETTE.muted, '600', 'right');
  for (let i = 0; i < state.orders.length; i += 1) {
    const order = state.orders[i];
    const recipe = RECIPE_BY_ID[order.recipeId];
    const rect = LAYOUT.ticket(i);
    const fraction = Math.max(0, order.patience / order.maxPatience);
    const match = state.ready && state.ready.recipeId === order.recipeId;
    shadowed(ctx, () => {
      ctx.fillStyle = match ? '#e8f7d8' : PALETTE.ticket;
      roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 12);
      ctx.fill();
    });
    if (match) {
      ctx.strokeStyle = PALETTE.serve;
      ctx.lineWidth = 3;
      roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 12);
      ctx.stroke();
    }
    text(ctx, `#${order.id}`, rect.x + 12, rect.y + 20, 12, '#8a7a5c', '700');
    text(ctx, recipe.name, rect.x + 12, rect.y + 44, 19, PALETTE.dark, '800');
    recipe.needs.forEach((ingredientId, j) => {
      drawIngredient(ctx, ingredientId, rect.x + 26 + j * 34, rect.y + 66, 13);
    });
    text(ctx, `${recipe.price}c`, rect.x + rect.w - 14, rect.y + 44, 15, '#8a6a3b', '800', 'right');
    ctx.fillStyle = '#e8dcc0';
    roundRect(ctx, rect.x + 12, rect.y + rect.h - 14, rect.w - 24, 7, 3);
    ctx.fill();
    ctx.fillStyle = patienceColor(fraction);
    roundRect(ctx, rect.x + 12, rect.y + rect.h - 14, (rect.w - 24) * fraction, 7, 3);
    ctx.fill();
  }
  if (state.orders.length === 0) {
    text(ctx, 'No orders yet — the first customers are on their way…', 24, 140, 16, PALETTE.muted, '600');
  }
}

function drawIngredients(ctx, state, hover) {
  text(ctx, 'INGREDIENTS — click or press 1–9', LAYOUT.counterLabel.x, LAYOUT.counterLabel.y + 13, 14, PALETTE.muted, '800');
  INGREDIENTS.forEach((ingredient, i) => {
    const rect = LAYOUT.bowl(i);
    const onPlate = state.plate.includes(ingredient.id);
    const onBoard = state.board.item === ingredient.id;
    shadowed(ctx, () => {
      ctx.fillStyle = onPlate || onBoard ? '#ffe9b0' : PALETTE.counterTop;
      roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 14);
      ctx.fill();
    });
    if (hover === `ingredient:${ingredient.id}`) {
      ctx.strokeStyle = PALETTE.gold;
      ctx.lineWidth = 3;
      roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 14);
      ctx.stroke();
    }
    drawIngredient(ctx, ingredient.id, rect.x + rect.w / 2, rect.y + 34, 24);
    text(ctx, ingredient.name, rect.x + rect.w / 2, rect.y + 66, 13, PALETTE.dark, '700', 'center');
    text(ctx, ingredient.key, rect.x + 8, rect.y + 16, 11, '#8a6a3b', '800');
    if (ingredient.chop) text(ctx, '✂ chop', rect.x + rect.w - 8, rect.y + 16, 10, '#8a6a3b', '700', 'right');
    if (onPlate) text(ctx, '✓ on plate', rect.x + rect.w / 2, rect.y + 82, 11, PALETTE.serve, '800', 'center');
  });
}

function drawStation(ctx, state, hover, rect, stationId, label, verb) {
  const cooking = state.cooking && state.cooking.stationId === stationId ? state.cooking : null;
  shadowed(ctx, () => {
    ctx.fillStyle = PALETTE.steel;
    roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 14);
    ctx.fill();
  });
  ctx.fillStyle = PALETTE.steelDark;
  roundRect(ctx, rect.x + 10, rect.y + 10, rect.w - 20, 74, 10);
  ctx.fill();
  if (stationId === 'wok') {
    ctx.fillStyle = '#3a3a3a';
    ctx.beginPath();
    ctx.arc(rect.x + rect.w / 2, rect.y + 52, 42, 0, Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#e2703a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(rect.x + rect.w / 2, rect.y + 52, 34, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  } else if (stationId === 'grill') {
    ctx.strokeStyle = '#5a5a5a';
    ctx.lineWidth = 4;
    for (let i = 0; i < 5; i += 1) {
      ctx.beginPath();
      ctx.moveTo(rect.x + 22, rect.y + 26 + i * 11);
      ctx.lineTo(rect.x + rect.w - 22, rect.y + 26 + i * 11);
      ctx.stroke();
    }
    ctx.fillStyle = '#e2703a';
    ctx.beginPath();
    ctx.arc(rect.x + rect.w / 2 - 14, rect.y + 46, 5, 0, Math.PI * 2);
    ctx.arc(rect.x + rect.w / 2 + 14, rect.y + 46, 5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = '#4a7fb5';
    ctx.beginPath();
    ctx.arc(rect.x + rect.w / 2, rect.y + 52, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e8b64c';
    ctx.beginPath();
    ctx.arc(rect.x + rect.w / 2, rect.y + 52, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff3c4';
    ctx.lineWidth = 3;
    for (const dx of [-14, 0, 14]) {
      ctx.beginPath();
      ctx.moveTo(rect.x + rect.w / 2 + dx, rect.y + 30);
      ctx.quadraticCurveTo(rect.x + rect.w / 2 + dx + 6, rect.y + 16, rect.x + rect.w / 2 + dx, rect.y + 6);
      ctx.stroke();
    }
  }
  if (cooking) {
    const recipe = RECIPE_BY_ID[cooking.recipeId];
    if (cooking.burnt) {
      ctx.fillStyle = 'rgba(20,10,5,0.75)';
      roundRect(ctx, rect.x + 10, rect.y + 10, rect.w - 20, 74, 10);
      ctx.fill();
      text(ctx, 'BURNT!', rect.x + rect.w / 2, rect.y + 46, 20, '#ff8a7a', '800', 'center');
      text(ctx, 'tip it in the bin', rect.x + rect.w / 2, rect.y + 68, 11, '#ffd0c8', '700', 'center');
    } else {
      drawDishOnPlate(ctx, cooking.recipeId, rect.x + rect.w / 2, rect.y + 48, 30);
      const barY = rect.y + 96;
      ctx.fillStyle = '#2c1c10';
      roundRect(ctx, rect.x + 14, barY, rect.w - 28, 12, 6);
      ctx.fill();
      ctx.fillStyle = cooking.done ? PALETTE.serve : '#e2703a';
      roundRect(ctx, rect.x + 14, barY, (rect.w - 28) * Math.min(1, cooking.progress), 12, 6);
      ctx.fill();
      text(ctx, cooking.done ? 'READY — click to plate!' : `${verb}… ${Math.ceil((1 - cooking.progress) * recipe.cook)}s`, rect.x + rect.w / 2, barY + 30, 13, cooking.done ? PALETTE.serve : PALETTE.dark, '800', 'center');
      if (cooking.done) {
        text(ctx, `burns in ${Math.ceil(cooking.burnLeft)}s`, rect.x + rect.w / 2, barY + 48, 11, PALETTE.red, '800', 'center');
      }
    }
  } else {
    text(ctx, label, rect.x + rect.w / 2, rect.y + 116, 17, PALETTE.dark, '800', 'center');
    text(ctx, 'click to cook the plate', rect.x + rect.w / 2, rect.y + 138, 11, '#6a6a6a', '600', 'center');
    text(ctx, `(${verb} — ${label === 'Wok' ? 'W' : label === 'Grill' ? 'G' : 'O'})`, rect.x + rect.w / 2, rect.y + 156, 11, '#8a8a8a', '600', 'center');
  }
  if (hover === `station:${stationId}`) {
    ctx.strokeStyle = PALETTE.gold;
    ctx.lineWidth = 3;
    roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 14);
    ctx.stroke();
  }
}

function drawBoard(ctx, state, hover) {
  const rect = LAYOUT.board;
  shadowed(ctx, () => {
    ctx.fillStyle = PALETTE.board;
    roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 14);
    ctx.fill();
  });
  ctx.strokeStyle = PALETTE.boardEdge;
  ctx.lineWidth = 2;
  roundRect(ctx, rect.x + 8, rect.y + 8, rect.w - 16, rect.h - 16, 10);
  ctx.stroke();
  if (state.board.item) {
    drawIngredient(ctx, state.board.item, rect.x + rect.w / 2, rect.y + 52, 30);
    for (let i = 0; i < state.board.chopsLeft; i += 1) {
      ctx.fillStyle = '#e2703a';
      ctx.beginPath();
      ctx.arc(rect.x + 52 + i * 24, rect.y + 100, 7, 0, Math.PI * 2);
      ctx.fill();
    }
    text(ctx, `click ${state.board.chopsLeft} more chop${state.board.chopsLeft === 1 ? '' : 's'}`, rect.x + rect.w / 2, rect.y + 126, 13, PALETTE.dark, '800', 'center');
  } else {
    text(ctx, '🔪', rect.x + rect.w / 2, rect.y + 56, 30, PALETTE.dark, '700', 'center');
    text(ctx, 'Chopping board', rect.x + rect.w / 2, rect.y + 116, 17, PALETTE.dark, '800', 'center');
    text(ctx, 'click to chop (C)', rect.x + rect.w / 2, rect.y + 138, 11, '#8a6a3b', '600', 'center');
  }
  if (hover === 'board') {
    ctx.strokeStyle = PALETTE.gold;
    ctx.lineWidth = 3;
    roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 14);
    ctx.stroke();
  }
}

function drawServeWindow(ctx, state, hover) {
  const rect = LAYOUT.serveWindow;
  shadowed(ctx, () => {
    ctx.fillStyle = state.ready ? '#dff3d8' : '#f3e6c8';
    roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 14);
    ctx.fill();
  });
  if (state.ready) {
    ctx.save();
    ctx.shadowColor = PALETTE.serve;
    ctx.shadowBlur = 18;
    ctx.strokeStyle = PALETTE.serve;
    ctx.lineWidth = 4;
    roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 14);
    ctx.stroke();
    ctx.restore();
    drawPlate(ctx, rect.x + rect.w / 2, rect.y + 78, 52);
    drawDishOnPlate(ctx, state.ready.recipeId, rect.x + rect.w / 2, rect.y + 78, 52);
    text(ctx, RECIPE_BY_ID[state.ready.recipeId].name, rect.x + rect.w / 2, rect.y + 148, 16, PALETTE.dark, '800', 'center');
    text(ctx, 'READY TO SERVE — click a ticket!', rect.x + rect.w / 2, rect.y + 166, 12, PALETTE.serve, '800', 'center');
  } else {
    text(ctx, '🍽️', rect.x + rect.w / 2, rect.y + 76, 34, '#8a6a3b', '700', 'center');
    text(ctx, 'Serve window', rect.x + rect.w / 2, rect.y + 118, 17, PALETTE.dark, '800', 'center');
    text(ctx, 'plated dishes wait here', rect.x + rect.w / 2, rect.y + 140, 12, '#8a6a3b', '600', 'center');
    text(ctx, 'click it, or press S, to serve', rect.x + rect.w / 2, rect.y + 158, 12, '#8a6a3b', '600', 'center');
  }
  if (hover === 'serve') {
    ctx.strokeStyle = PALETTE.gold;
    ctx.lineWidth = 3;
    roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 14);
    ctx.stroke();
  }
}

function drawPlateArea(ctx, state, hover) {
  const area = LAYOUT.plateArea;
  shadowed(ctx, () => {
    ctx.fillStyle = PALETTE.counter;
    roundRect(ctx, area.x, area.y, area.w, area.h, 14);
    ctx.fill();
  });
  const circle = LAYOUT.plateCircle;
  drawPlate(ctx, circle.x + circle.w / 2, circle.y + circle.h / 2, 54);
  const recipe = recipeForPlate(state.plate);
  state.plate.forEach((ingredientId, i) => {
    const spots = [[-22, -12], [22, -16], [0, 22]];
    const spot = spots[i % spots.length];
    drawIngredient(ctx, ingredientId, circle.x + circle.w / 2 + spot[0], circle.y + circle.h / 2 + spot[1], 20);
  });
  const hintX = circle.x + circle.w + 24;
  text(ctx, 'YOUR PLATE', hintX, area.y + 30, 14, '#ffe9b0', '800');
  if (state.plate.length === 0) {
    text(ctx, 'Click ingredients to build a dish.', hintX, area.y + 58, 16, PALETTE.text, '600');
    text(ctx, 'Choppables go to the board first — click it 3 times.', hintX, area.y + 82, 14, PALETTE.muted, '600');
  } else if (recipe) {
    text(ctx, `${recipe.name} — ready for the ${recipe.station}!`, hintX, area.y + 58, 17, PALETTE.gold, '800');
    text(ctx, `Cook ${recipe.cook}s on the ${recipe.station}  •  worth ${recipe.price} coins`, hintX, area.y + 84, 14, PALETTE.text, '600');
  } else {
    text(ctx, 'Mid-assembly… keep adding ingredients.', hintX, area.y + 58, 16, PALETTE.text, '700');
    const missing = RECIPES.filter((r) => r.needs.length > state.plate.length
      && state.plate.every((item) => r.needs.includes(item)));
    if (missing.length > 0) {
      text(ctx, `Could become: ${missing.map((r) => r.name).join(' or ')}`, hintX, area.y + 84, 14, PALETTE.muted, '600');
    }
  }
  text(ctx, 'click the matching station to cook', hintX, area.y + 112, 13, PALETTE.muted, '600');
  if (hover === 'plate') {
    ctx.strokeStyle = PALETTE.gold;
    ctx.lineWidth = 3;
    roundRect(ctx, area.x, area.y, area.w, area.h, 14);
    ctx.stroke();
  }
}

function drawTrashAndClear(ctx, state, hover) {
  for (const [rect, label, sub, hit] of [
    [LAYOUT.trash, '🗑️ Bin', 'tip it away (T)', 'trash'],
    [LAYOUT.clearButton, '✖ Clear', 'empty the plate', 'clear'],
  ]) {
    ctx.fillStyle = '#6a4a32';
    roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 12);
    ctx.fill();
    text(ctx, label, rect.x + rect.w / 2, rect.y + 36, 16, PALETTE.text, '800', 'center');
    text(ctx, sub, rect.x + rect.w / 2, rect.y + 60, 11, PALETTE.muted, '600', 'center');
    if (hover === hit) {
      ctx.strokeStyle = PALETTE.gold;
      ctx.lineWidth = 3;
      roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 12);
      ctx.stroke();
    }
  }
}

function drawRecipeCards(ctx, state) {
  text(ctx, 'MENU — five recipes from the spice route', LAYOUT.recipesLabel.x, LAYOUT.recipesLabel.y + 13, 14, PALETTE.muted, '800');
  RECIPES.forEach((recipe, i) => {
    const rect = LAYOUT.recipeCard(i);
    const matched = recipeForPlate(state.plate) === recipe;
    ctx.fillStyle = matched ? '#ffe9b0' : '#3a2a1e';
    roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 10);
    ctx.fill();
    if (matched) {
      ctx.strokeStyle = PALETTE.gold;
      ctx.lineWidth = 2;
      roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 10);
      ctx.stroke();
    }
    drawDishOnPlate(ctx, recipe.id, rect.x + 34, rect.y + 33, 26);
    text(ctx, recipe.name, rect.x + 66, rect.y + 24, 15, matched ? PALETTE.dark : PALETTE.text, '800');
    text(ctx, `${recipe.needs.map((id) => INGREDIENT_BY_ID[id].name).join(' + ')}`, rect.x + 66, rect.y + 44, 11, matched ? '#6a5a3b' : PALETTE.muted, '600');
    text(ctx, `${recipe.station} ${recipe.cook}s • ${recipe.price}c`, rect.x + 66, rect.y + 60, 11, matched ? '#8a6a3b' : PALETTE.muted, '700');
  });
}

function drawHints(ctx, state) {
  text(ctx, '1–9 ingredients   •   C chop   •   W / G / O cook   •   S serve   •   T bin   •   P pause   •   M sound', LAYOUT.hints.x, LAYOUT.hints.y + 16, 14, PALETTE.muted, '600');
  if (state.toast && state.elapsed < state.toastUntil) {
    const toast = LAYOUT.toast;
    ctx.fillStyle = 'rgba(20,12,6,0.85)';
    roundRect(ctx, toast.x, toast.y, toast.w, toast.h, 8);
    ctx.fill();
    text(ctx, state.toast, toast.x + toast.w / 2, toast.y + 20, 14, PALETTE.gold, '700', 'center');
  }
}

function drawKitchenBackdrop(ctx) {
  ctx.fillStyle = PALETTE.wallTop;
  ctx.fillRect(0, 60, FIELD.width, 120);
  ctx.fillStyle = PALETTE.wall;
  ctx.fillRect(0, 60, FIELD.width, 8);
  ctx.fillStyle = '#6a3f24';
  for (let x = 40; x < FIELD.width; x += 120) {
    ctx.fillRect(x, 74, 56, 40);
    ctx.fillStyle = '#7a4a2b';
    ctx.fillRect(x + 4, 78, 48, 32);
    ctx.fillStyle = '#6a3f24';
  }
  ctx.fillStyle = PALETTE.floor;
  ctx.fillRect(0, 180, FIELD.width, FIELD.height - 180);
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  for (let x = 0; x < FIELD.width; x += 96) {
    ctx.fillRect(x, 180, 48, FIELD.height - 180);
  }
  ctx.fillStyle = PALETTE.counter;
  ctx.fillRect(0, 176, FIELD.width, 10);
  ctx.fillStyle = PALETTE.counterTop;
  ctx.fillRect(0, 176, FIELD.width, 4);
}

function drawTitle(ctx, state) {
  drawKitchenBackdrop(ctx);
  drawTopBar(ctx, state);
  ctx.fillStyle = 'rgba(20,10,5,0.55)';
  ctx.fillRect(0, 60, FIELD.width, FIELD.height - 60);
  const panel = LAYOUT.titlePanel;
  shadowed(ctx, () => {
    ctx.fillStyle = '#fff8e6';
    roundRect(ctx, panel.x, panel.y, panel.w, panel.h, 18);
    ctx.fill();
  });
  text(ctx, '🍳', panel.x + panel.w / 2, panel.y + 62, 44, PALETTE.dark, '700', 'center');
  text(ctx, 'BUMBU & API', panel.x + panel.w / 2, panel.y + 112, 44, PALETTE.dark, '800', 'center');
  text(ctx, 'Spice Route Kitchen', panel.x + panel.w / 2, panel.y + 142, 20, '#8a6a3b', '700', 'center');
  text(ctx, 'Run the busiest little kitchen on the spice route.', panel.x + panel.w / 2, panel.y + 182, 16, PALETTE.dark, '600', 'center');
  text(ctx, 'Build each order on your plate, chop what needs chopping,', panel.x + panel.w / 2, panel.y + 208, 15, '#5a4a35', '600', 'center');
  text(ctx, 'cook it on the right station and serve it before the', panel.x + panel.w / 2, panel.y + 230, 15, '#5a4a35', '600', 'center');
  text(ctx, 'customer walks out. A 150-second shift — how rich can you get?', panel.x + panel.w / 2, panel.y + 252, 15, '#5a4a35', '600', 'center');
  if (state.best > 0) text(ctx, `Best shift so far: ${state.best} coins`, panel.x + panel.w / 2, panel.y + 282, 15, '#8a6a3b', '800', 'center');
  const button = LAYOUT.startButton;
  shadowed(ctx, () => {
    ctx.fillStyle = PALETTE.serve;
    roundRect(ctx, button.x, button.y, button.w, button.h, 14);
    ctx.fill();
  });
  text(ctx, '▶  START SHIFT', button.x + button.w / 2, button.y + 42, 26, '#ffffff', '800', 'center');
  text(ctx, 'or press Enter  •  mouse + keyboard  •  sound on 🔊', panel.x + panel.w / 2, panel.y + 392, 13, '#8a7a5c', '600', 'center');
}

function drawOver(ctx, state) {
  drawKitchenBackdrop(ctx);
  drawTopBar(ctx, state);
  ctx.fillStyle = 'rgba(20,10,5,0.55)';
  ctx.fillRect(0, 60, FIELD.width, FIELD.height - 60);
  const panel = LAYOUT.overPanel;
  shadowed(ctx, () => {
    ctx.fillStyle = '#fff8e6';
    roundRect(ctx, panel.x, panel.y, panel.w, panel.h, 18);
    ctx.fill();
  });
  text(ctx, 'SHIFT OVER!', panel.x + panel.w / 2, panel.y + 64, 40, PALETTE.dark, '800', 'center');
  const stars = starsFor(state.coins);
  for (let i = 0; i < 3; i += 1) {
    text(ctx, i < stars ? '★' : '☆', panel.x + panel.w / 2 - 60 + i * 60, panel.y + 118, 44, i < stars ? PALETTE.gold : '#cbbfa0', '700', 'center');
  }
  text(ctx, `You earned ${state.coins} coins`, panel.x + panel.w / 2, panel.y + 168, 24, PALETTE.dark, '800', 'center');
  const rows = [
    [`Dishes served`, `${state.served}`],
    [`Customers walked out`, `${state.walkouts}`],
    [`Best combo`, `x${state.bestCombo}`],
    [`Best shift`, `${Math.max(state.best, state.coins)} coins`],
  ];
  rows.forEach(([label, value], i) => {
    text(ctx, label, panel.x + 90, panel.y + 212 + i * 32, 16, '#5a4a35', '600');
    text(ctx, value, panel.x + panel.w - 90, panel.y + 212 + i * 32, 16, PALETTE.dark, '800', 'right');
  });
  text(ctx, stars >= 3 ? 'Stars: 3 of 3 — top marks, chef!' : `Stars: ${stars} of 3  •  next star at ${STAR_LINES[stars]} coins`, panel.x + panel.w / 2, panel.y + 356, 14, '#8a6a3b', '700', 'center');
  const button = LAYOUT.againButton;
  shadowed(ctx, () => {
    ctx.fillStyle = PALETTE.serve;
    roundRect(ctx, button.x, button.y, button.w, button.h, 14);
    ctx.fill();
  });
  text(ctx, '↻  PLAY AGAIN', button.x + button.w / 2, button.y + 42, 26, '#ffffff', '800', 'center');
}

/** Draw the whole game for the current state. `hover` is the control under the mouse, if any. */
export function render(ctx, state, hover) {
  ctx.clearRect(0, 0, FIELD.width, FIELD.height);
  if (state.screen === SCREEN_TITLE) {
    drawTitle(ctx, state);
    return;
  }
  if (state.screen === SCREEN_OVER) {
    drawOver(ctx, state);
    return;
  }
  drawKitchenBackdrop(ctx);
  drawTopBar(ctx, state);
  drawOrderRail(ctx, state);
  drawIngredients(ctx, state, hover);
  text(ctx, 'STATIONS', LAYOUT.stationsLabel.x, LAYOUT.stationsLabel.y + 13, 14, PALETTE.muted, '800');
  drawBoard(ctx, state, hover);
  drawStation(ctx, state, hover, LAYOUT.wok, 'wok', 'Wok', 'Fry');
  drawStation(ctx, state, hover, LAYOUT.grill, 'grill', 'Grill', 'Grill');
  drawStation(ctx, state, hover, LAYOUT.pot, 'pot', 'Pot', 'Simmer');
  text(ctx, 'SERVE', LAYOUT.serveLabel.x, LAYOUT.serveLabel.y + 13, 14, PALETTE.muted, '800');
  drawServeWindow(ctx, state, hover);
  drawTrashAndClear(ctx, state, hover);
  drawPlateArea(ctx, state, hover);
  drawRecipeCards(ctx, state);
  drawHints(ctx, state);
  if (state.paused) {
    ctx.fillStyle = 'rgba(20,10,5,0.6)';
    ctx.fillRect(0, 60, FIELD.width, FIELD.height - 60);
    text(ctx, 'PAUSED', FIELD.width / 2, 360, 54, PALETTE.text, '800', 'center');
    text(ctx, 'press P or click ⏸ to keep cooking', FIELD.width / 2, 400, 18, PALETTE.muted, '600', 'center');
  }
}
