// Bumbu & Api — the kitchen's rules: orders, the plate, the chopping board, the stations
// and the till. Every action below is a plain function the mouse, the keyboard and the
// screenshot autopilot all call, so a staged screenshot plays the real game.

import {
  BEST_KEY, BURN_GRACE, CHOPS_PER_ITEM, COMBO_MAX, COMBO_STEP, INGREDIENT_BY_ID,
  MAX_ORDERS, ORDER_GAP, PATIENCE, RECIPES, RECIPE_BY_ID, SHIFT_SECONDS, STAR_LINES,
  WALKOUT_PENALTY,
} from './config.js';
import { makeRandom, pick, range } from './random.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'playing';
export const SCREEN_OVER = 'over';

export const MAX_PLATE_ITEMS = 3;

let orderId = 0;

/** A fresh kitchen: title screen, an empty plate and no orders yet. */
export function freshState(seed) {
  return {
    seed,
    random: makeRandom(seed),
    screen: SCREEN_TITLE,
    elapsed: 0,
    timeLeft: SHIFT_SECONDS,
    coins: 0,
    served: 0,
    walkouts: 0,
    combo: 0,
    bestCombo: 0,
    orders: [],
    orderTimer: 6,
    plate: [],
    board: { item: null, chopsLeft: 0 },
    cooking: null,
    ready: null,
    toast: '',
    toastUntil: 0,
    muted: false,
    paused: false,
    best: 0,
    events: [],
  };
}

export function loadBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY) || 0) || 0;
  } catch {
    return 0;
  }
}

export function saveBest(coins) {
  try {
    localStorage.setItem(BEST_KEY, String(coins));
  } catch {
    // A browser that refuses storage still plays the game.
  }
}

function say(state, text) {
  state.toast = text;
  state.toastUntil = state.elapsed + 2.2;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

/** How far into the shift we are, 0 at the first order and 1 at closing time. */
export function shiftProgress(state) {
  return Math.min(1, Math.max(0, state.elapsed / SHIFT_SECONDS));
}

function spawnOrder(state) {
  const progress = shiftProgress(state);
  const patience = lerp(PATIENCE.start, PATIENCE.end, progress);
  const recipe = pick(state.random, RECIPES);
  state.orders.push({
    id: orderId += 1,
    recipeId: recipe.id,
    patience,
    maxPatience: patience,
    born: state.elapsed,
  });
  state.events.push('order');
}

export function startShift(state) {
  state.screen = SCREEN_PLAY;
  state.elapsed = 0;
  state.timeLeft = SHIFT_SECONDS;
  state.coins = 0;
  state.served = 0;
  state.walkouts = 0;
  state.combo = 0;
  state.bestCombo = 0;
  state.orders = [];
  state.orderTimer = 6;
  state.plate = [];
  state.board = { item: null, chopsLeft: 0 };
  state.cooking = null;
  state.ready = null;
  state.best = loadBest();
  spawnOrder(state);
  spawnOrder(state);
  state.events.push('start');
}

/** The recipe the plate's ingredients make, or null when they make nothing yet. */
export function recipeForPlate(items) {
  if (items.length === 0) return null;
  const sorted = [...items].sort().join('|');
  return RECIPES.find((recipe) => [...recipe.needs].sort().join('|') === sorted) || null;
}

/** The first waiting order that wants this dish, or null. */
export function orderForRecipe(state, recipeId) {
  return state.orders.find((order) => order.recipeId === recipeId) || null;
}

/** Click (or press 1-9) on an ingredient bowl: chop it first, or add it to the plate. */
export function addIngredient(state, ingredientId) {
  const ingredient = INGREDIENT_BY_ID[ingredientId];
  if (!ingredient || state.screen !== SCREEN_PLAY || state.paused) return false;
  if (state.cooking) {
    say(state, 'The stove is busy — collect the dish first');
    return false;
  }
  if (state.plate.includes(ingredientId)) {
    say(state, `${ingredient.name} is already on the plate`);
    return false;
  }
  if (state.plate.length >= MAX_PLATE_ITEMS) {
    say(state, 'The plate is full — cook it or clear it');
    return false;
  }
  if (ingredient.chop) {
    if (state.board.item) {
      say(state, 'Finish chopping first');
      return false;
    }
    state.board = { item: ingredientId, chopsLeft: CHOPS_PER_ITEM };
    state.events.push('board');
    return true;
  }
  state.plate.push(ingredientId);
  state.events.push('add');
  return true;
}

/** Click the chopping board: one chop. A finished item hops onto the plate. */
export function chopBoard(state) {
  if (state.screen !== SCREEN_PLAY || state.paused || !state.board.item) return false;
  state.board.chopsLeft -= 1;
  state.events.push('chop');
  if (state.board.chopsLeft <= 0) {
    state.plate.push(state.board.item);
    state.board = { item: null, chopsLeft: 0 };
    state.events.push('add');
  }
  return true;
}

/** Click a station to cook the plate's recipe on it. */
export function startCooking(state, stationId) {
  if (state.screen !== SCREEN_PLAY || state.paused) return false;
  if (state.cooking) {
    say(state, 'A dish is already cooking');
    return false;
  }
  const recipe = recipeForPlate(state.plate);
  if (!recipe) {
    say(state, 'Add ingredients until the plate matches a recipe');
    return false;
  }
  if (recipe.station !== stationId) {
    const wanted = recipe.station === 'wok' ? 'the wok' : recipe.station === 'grill' ? 'the grill' : 'the pot';
    say(state, `${recipe.name} cooks on ${wanted}`);
    return false;
  }
  state.cooking = { stationId, recipeId: recipe.id, progress: 0, done: false, burnLeft: BURN_GRACE };
  state.plate = [];
  state.events.push('cook');
  return true;
}

/** Click a finished dish on its station: plate it on the serve counter, ready to serve. */
export function collectCooked(state) {
  if (state.screen !== SCREEN_PLAY || state.paused || !state.cooking || !state.cooking.done || state.cooking.burnt) return false;
  if (state.ready) {
    say(state, 'Serve the plated dish first');
    return false;
  }
  state.ready = { recipeId: state.cooking.recipeId, since: state.elapsed };
  state.cooking = null;
  state.events.push('plate');
  return true;
}

/** Click a ticket (or the serve window) to hand over the plated dish. */
export function serveOrder(state, orderIdWanted) {
  if (state.screen !== SCREEN_PLAY || state.paused || !state.ready) return false;
  const order = state.orders.find((item) => item.id === orderIdWanted);
  if (!order) return false;
  if (order.recipeId !== state.ready.recipeId) {
    say(state, `That customer ordered ${RECIPE_BY_ID[order.recipeId].name}`);
    state.events.push('wrong');
    return false;
  }
  const recipe = RECIPE_BY_ID[order.recipeId];
  const patienceLeft = Math.max(0, order.patience / order.maxPatience);
  const tip = 0.5 + 0.5 * patienceLeft;
  const comboBonus = 1 + Math.min(COMBO_MAX, state.combo * COMBO_STEP);
  const earned = Math.max(5, Math.round(recipe.price * tip * comboBonus));
  state.coins += earned;
  state.served += 1;
  state.combo += 1;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  state.orders = state.orders.filter((item) => item.id !== order.id);
  state.ready = null;
  state.events.push('serve');
  return true;
}

/** Serve the plated dish to the first waiting order that wants it. */
export function serveAny(state) {
  if (!state.ready) return false;
  const order = orderForRecipe(state, state.ready.recipeId);
  if (!order) {
    say(state, 'No waiting order wants that dish yet');
    return false;
  }
  return serveOrder(state, order.id);
}

/** Tip the plate, the board and the stove into the bin. Burnt food goes the same way. */
export function clearAll(state) {
  if (state.screen !== SCREEN_PLAY || state.paused) return false;
  if (state.plate.length === 0 && !state.board.item && !state.cooking && !state.ready) return false;
  state.plate = [];
  state.board = { item: null, chopsLeft: 0 };
  state.cooking = null;
  state.ready = null;
  state.events.push('trash');
  return true;
}

/** Stars for a finished shift, by coins earned. */
export function starsFor(coins) {
  let stars = 0;
  for (const line of STAR_LINES) if (coins >= line) stars += 1;
  return stars;
}

function endShift(state) {
  state.screen = SCREEN_OVER;
  if (state.coins > state.best) {
    state.best = state.coins;
    saveBest(state.coins);
    state.events.push('best');
  }
  state.events.push('over');
}

/** Advance the shift by `dt` seconds: timers, orders, cooking and walkouts. */
export function step(state, dt) {
  if (state.screen !== SCREEN_PLAY || state.paused) return;
  state.elapsed += dt;
  state.timeLeft = Math.max(0, SHIFT_SECONDS - state.elapsed);
  if (state.timeLeft <= 0) {
    endShift(state);
    return;
  }

  state.orderTimer -= dt;
  if (state.orderTimer <= 0 && state.orders.length < MAX_ORDERS) {
    spawnOrder(state);
    const progress = shiftProgress(state);
    state.orderTimer = range(state.random, ORDER_GAP.start, ORDER_GAP.end)
      * lerp(1, ORDER_GAP.end / ORDER_GAP.start, progress);
  }

  for (const order of state.orders) order.patience -= dt;
  const walked = state.orders.filter((order) => order.patience <= 0);
  if (walked.length > 0) {
    state.orders = state.orders.filter((order) => order.patience > 0);
    state.walkouts += walked.length;
    state.combo = 0;
    state.coins = Math.max(0, state.coins - WALKOUT_PENALTY * walked.length);
    state.events.push('walkout');
    say(state, walked.length > 1 ? 'Customers walked out!' : 'A customer walked out!');
  }

  if (state.cooking) {
    const recipe = RECIPE_BY_ID[state.cooking.recipeId];
    if (!state.cooking.done) {
      state.cooking.progress += dt / recipe.cook;
      if (state.cooking.progress >= 1) {
        state.cooking.progress = 1;
        state.cooking.done = true;
        state.events.push('done');
      }
    } else {
      state.cooking.burnLeft -= dt;
      if (state.cooking.burnLeft <= 0 && !state.cooking.burnt) {
        state.cooking.burnt = true;
        state.combo = 0;
        state.events.push('burnt');
        say(state, 'It burnt! Tip it in the bin and start again');
      }
    }
  }
}
