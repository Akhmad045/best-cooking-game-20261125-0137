// Bumbu & Api — the screenshot scenes behind ?shot=start|play|rush|end. Each one plays the
// real rules forward from a fresh kitchen for a fixed number of steps, steered by a simple
// autopilot (chop what is on the board, collect a finished dish, serve a plated one, cook a
// complete plate, otherwise add the next ingredient the most impatient order needs), so the
// frame is what a short game really looks like and the same seed always gives the same frame.

import { STEP } from './config.js';
import {
  SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE, addIngredient, chopBoard, clearAll, collectCooked,
  freshState, orderForRecipe, recipeForPlate, serveAny, startCooking, startShift, step,
} from './state.js';
import { RECIPE_BY_ID } from './config.js';

const SAMPLE = 1 / 30;
const START_SECONDS = 5;
const PLAY_SECONDS = 30;
const RUSH_SECONDS = 105;
const END_LIMIT_SECONDS = 200;

/** The order the autopilot serves first: the one with the least patience left. */
function mostImpatientOrder(state) {
  let best = null;
  for (const order of state.orders) {
    if (!best || order.patience < best.patience) best = order;
  }
  return best;
}

/** One autopilot decision per tick. Returns nothing; it acts through the real rules. */
function autopilot(state) {
  if (state.board.item) {
    chopBoard(state);
    return;
  }
  if (state.cooking && state.cooking.done) {
    collectCooked(state);
    return;
  }
  if (state.ready) {
    if (orderForRecipe(state, state.ready.recipeId)) {
      serveAny(state);
    } else if (state.elapsed - state.ready.since > 6) {
      clearAll(state);
    }
    return;
  }
  if (state.cooking) return;
  const recipe = recipeForPlate(state.plate);
  if (recipe) {
    startCooking(state, recipe.station);
    return;
  }
  const order = mostImpatientOrder(state);
  if (!order) return;
  const wanted = RECIPE_BY_ID[order.recipeId];
  const plateFits = state.plate.every((item) => wanted.needs.includes(item));
  if (!plateFits) {
    clearAll(state);
    return;
  }
  const next = wanted.needs.find((item) => !state.plate.includes(item));
  if (next) addIngredient(state, next);
}

function runFor(state, seconds, pilot) {
  for (let t = 0; t < seconds; t += SAMPLE) {
    step(state, SAMPLE);
    if (state.screen !== SCREEN_PLAY) break;
    if (pilot) pilot(state);
  }
}

/** Fast-forward until nothing is cooking, then collect the finished dish. */
function settleCooking(state) {
  let guard = 0;
  while (state.cooking && guard < 600) {
    step(state, SAMPLE);
    guard += 1;
    if (state.cooking && state.cooking.done) collectCooked(state);
  }
}

/**
 * Cook exactly one dish and leave it plated on the serve counter — never serving it —
 * so the frame shows a plate ready to serve.
 */
function cookOneDish(state) {
  let guard = 0;
  while (!state.ready && guard < 1200) {
    guard += 1;
    if (state.board.item) {
      chopBoard(state);
    } else if (state.cooking && state.cooking.done) {
      collectCooked(state);
    } else if (state.cooking) {
      // Wait for the station.
    } else if (recipeForPlate(state.plate)) {
      startCooking(state, recipeForPlate(state.plate).station);
    } else {
      const order = mostImpatientOrder(state);
      if (order) {
        const wanted = RECIPE_BY_ID[order.recipeId];
        if (!state.plate.every((item) => wanted.needs.includes(item))) {
          clearAll(state);
        } else {
          const next = wanted.needs.find((item) => !state.plate.includes(item));
          if (!next) clearAll(state);
          else addIngredient(state, next);
        }
      }
      // With no order waiting, time simply passes until one arrives.
    }
    step(state, SAMPLE);
    if (state.screen !== SCREEN_PLAY) return;
  }
}

/** A plated dish on the serve counter and two ingredients of the next dish on the plate. */
function poseMidAssembly(state) {
  settleCooking(state);
  if (!state.ready) cookOneDish(state);
  settleCooking(state);
  const order = mostImpatientOrder(state);
  if (!order || state.plate.length > 0) return;
  const wanted = RECIPE_BY_ID[order.recipeId];
  let guard = 0;
  while (state.plate.length < 2 && guard < 90) {
    guard += 1;
    const next = wanted.needs.find((item) => !state.plate.includes(item));
    if (!next) break;
    addIngredient(state, next);
    while (state.board.item) chopBoard(state);
  }
}

/**
 * Set the kitchen to the named scene (start, play, rush or end; any other name is start)
 * and return the screen to draw over it.
 */
export function stageShot(name, seed) {
  const state = freshState(seed);
  state.best = 0;
  if (name !== 'play' && name !== 'rush' && name !== 'end') {
    for (let i = 0; i < START_SECONDS / STEP; i += 1) step(state, STEP);
    return { state, screen: SCREEN_TITLE };
  }
  startShift(state);
  if (name === 'play') {
    runFor(state, PLAY_SECONDS, autopilot);
    poseMidAssembly(state);
    return { state, screen: SCREEN_PLAY };
  }
  if (name === 'rush') {
    // A much lazier pilot than the play scene's — one action every second of game
    // time — so orders pile up on the rail while the shift runs down.
    let tick = 0;
    runFor(state, RUSH_SECONDS, (pilotState) => {
      tick += 1;
      if (tick % 30 === 0) autopilot(pilotState);
    });
    poseMidAssembly(state);
    return { state, screen: SCREEN_PLAY };
  }
  // The end scene plays with a careless pilot, so the shift ends with a modest score.
  let guard = 0;
  while (state.screen === SCREEN_PLAY && guard < END_LIMIT_SECONDS / SAMPLE) {
    step(state, SAMPLE);
    if (guard % 4 === 0) autopilot(state);
    guard += 1;
  }
  return { state, screen: state.screen === SCREEN_OVER ? SCREEN_OVER : SCREEN_PLAY };
}
