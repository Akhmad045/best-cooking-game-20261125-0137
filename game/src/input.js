// Bumbu & Api — mouse and keyboard: every click and keypress becomes one call into the
// kitchen's rules (state.js). Nothing here draws; nothing here keeps game state.

import { INGREDIENTS, STATIONS } from './config.js';
import { LAYOUT, inside } from './layout.js';
import {
  SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE, addIngredient, chopBoard, clearAll,
  collectCooked, serveAny, serveOrder, startCooking, startShift,
} from './state.js';

/** Which named control, if any, sits under the logical point (x, y). */
export function hitAt(state, x, y) {
  if (inside(LAYOUT.muteButton, x, y)) return 'mute';
  if (inside(LAYOUT.pauseButton, x, y)) return 'pause';
  if (state.screen === SCREEN_TITLE && inside(LAYOUT.startButton, x, y)) return 'start';
  if (state.screen === SCREEN_OVER && inside(LAYOUT.againButton, x, y)) return 'again';
  if (state.screen !== SCREEN_PLAY) return null;
  for (let i = 0; i < INGREDIENTS.length; i += 1) {
    if (inside(LAYOUT.bowl(i), x, y)) return `ingredient:${INGREDIENTS[i].id}`;
  }
  if (inside(LAYOUT.board, x, y)) return 'board';
  if (inside(LAYOUT.wok, x, y)) return 'station:wok';
  if (inside(LAYOUT.grill, x, y)) return 'station:grill';
  if (inside(LAYOUT.pot, x, y)) return 'station:pot';
  if (inside(LAYOUT.serveWindow, x, y)) return 'serve';
  if (inside(LAYOUT.trash, x, y)) return 'trash';
  if (inside(LAYOUT.clearButton, x, y)) return 'clear';
  if (inside(LAYOUT.plateArea, x, y)) return 'plate';
  for (let i = 0; i < state.orders.length; i += 1) {
    if (inside(LAYOUT.ticket(i), x, y)) return `ticket:${state.orders[i].id}`;
  }
  return null;
}

/**
 * Do what a click on `hit` means. Returns true when the click did something in the game.
 * `ui` carries the two callbacks the game shell owns: toggling sound and pausing.
 */
export function clickHit(state, hit, ui) {
  if (hit === null) return false;
  if (hit === 'mute') {
    ui.toggleMute();
    return true;
  }
  if (hit === 'pause') {
    ui.togglePause();
    return true;
  }
  if (hit === 'start') {
    startShift(state);
    return true;
  }
  if (hit === 'again') {
    startShift(state);
    return true;
  }
  if (hit.startsWith('ingredient:')) return addIngredient(state, hit.slice('ingredient:'.length));
  if (hit === 'board') return chopBoard(state);
  if (hit.startsWith('station:')) {
    const stationId = hit.slice('station:'.length);
    // A finished dish on its station is collected with the same click that would cook.
    if (state.cooking && state.cooking.done && state.cooking.stationId === stationId) {
      return collectCooked(state);
    }
    return startCooking(state, stationId);
  }
  if (hit === 'serve') return serveAny(state);
  if (hit === 'trash' || hit === 'clear') return clearAll(state);
  if (hit === 'plate') {
    // Tapping the assembly plate when a dish is cooking does nothing; it is a display.
    return false;
  }
  if (hit.startsWith('ticket:')) return serveOrder(state, Number(hit.slice('ticket:'.length)));
  return false;
}

/** A keypress. Returns true when the key did something in the game. */
export function pressKey(state, key, ui) {
  const lower = key.toLowerCase();
  if (lower === 'm') {
    ui.toggleMute();
    return true;
  }
  if (lower === 'p' || key === 'Escape') {
    ui.togglePause();
    return true;
  }
  if (key === 'Enter') {
    if (state.screen === SCREEN_TITLE || state.screen === SCREEN_OVER) {
      startShift(state);
      return true;
    }
    return false;
  }
  if (state.screen !== SCREEN_PLAY || state.paused) return false;
  const ingredient = INGREDIENTS.find((item) => item.key === key);
  if (ingredient) return addIngredient(state, ingredient.id);
  if (lower === 'c' || key === ' ') {
    if (state.board.item) return chopBoard(state);
    if (key === ' ') return serveAny(state);
    return false;
  }
  if (lower === 't') return clearAll(state);
  if (lower === 's') return serveAny(state);
  if (lower === 'w') return startCooking(state, STATIONS.wok.id);
  if (lower === 'g') return startCooking(state, STATIONS.grill.id);
  if (lower === 'o') return startCooking(state, STATIONS.pot.id);
  return false;
}
