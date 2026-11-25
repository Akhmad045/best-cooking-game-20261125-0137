// Bumbu & Api — Spice Route Kitchen: every tuning number, recipe and colour in one place.
// The kitchen is a fixed 1280x720 logical area; the renderer scales it to the window, so no
// rule below depends on the screen size.

export const FIELD = { width: 1280, height: 720 };

/** The simulation's fixed step, in seconds: 60 updates a second whatever the display rate. */
export const STEP = 1 / 60;

/** One full shift, in seconds. */
export const SHIFT_SECONDS = 150;

/** How many order tickets can wait on the rail at once. */
export const MAX_ORDERS = 4;

/** Seconds an order waits before its customer walks out. */
export const PATIENCE = { start: 55, end: 34 };

/** Seconds between new orders arriving; the gap shrinks as the shift goes on. */
export const ORDER_GAP = { start: 15, end: 8.5 };

/** Chops needed to prepare one choppable ingredient. */
export const CHOPS_PER_ITEM = 3;

/** Seconds of grace after a dish finishes cooking before it burns. */
export const BURN_GRACE = 6;

/** Coins lost when a wrong dish is served or an order walks out. */
export const WALKOUT_PENALTY = 10;

/** Combo bonus: each served dish in a row adds 10% to the next dish's coins, up to +100%. */
export const COMBO_STEP = 0.1;
export const COMBO_MAX = 1.0;

/** Where the best shift score is kept between visits (this browser only). */
export const BEST_KEY = 'bumbu-dan-api.best';

/**
 * Ingredients on the counter. `chop` means the ingredient must go to the chopping board
 * before it can join the plate. `key` is the keyboard shortcut (1-9).
 */
export const INGREDIENTS = [
  { id: 'rice',    name: 'Rice',       key: '1', chop: false, color: '#f5efe0', accent: '#d9c9a3' },
  { id: 'noodle',  name: 'Noodle',     key: '2', chop: false, color: '#f7d774', accent: '#d9a441' },
  { id: 'egg',     name: 'Egg',        key: '3', chop: false, color: '#fff3c4', accent: '#e8a13a' },
  { id: 'chicken', name: 'Chicken',    key: '4', chop: true,  color: '#f2b8a0', accent: '#c96a4a' },
  { id: 'veg',     name: 'Veg',        key: '5', chop: true,  color: '#7ec850', accent: '#4a8f2e' },
  { id: 'tofu',    name: 'Tofu',       key: '6', chop: true,  color: '#fdf6e3', accent: '#cbb98a' },
  { id: 'kecap',   name: 'Kecap',      key: '7', chop: false, color: '#4a2c1a', accent: '#2c180c' },
  { id: 'peanut',  name: 'Peanut sauce', key: '8', chop: false, color: '#c98a4b', accent: '#8a5a28' },
  { id: 'broth',   name: 'Broth',      key: '9', chop: false, color: '#e8b64c', accent: '#b57f1f' },
];

export const INGREDIENT_BY_ID = Object.fromEntries(INGREDIENTS.map((ing) => [ing.id, ing]));

/** Cooking stations. `recipe.station` names the station that cooks the dish. */
export const STATIONS = {
  wok:   { id: 'wok',   name: 'Wok',    verb: 'Fry',  color: '#e2703a' },
  grill: { id: 'grill', name: 'Grill',  verb: 'Grill', color: '#c94f43' },
  pot:   { id: 'pot',   name: 'Pot',    verb: 'Simmer', color: '#4a7fb5' },
};

/**
 * The menu. Each dish is a set of ingredients plus the station that cooks it; the plate
 * matches a recipe when it holds exactly that set. `cook` is the seconds on the station.
 */
export const RECIPES = [
  { id: 'nasi-goreng', name: 'Nasi Goreng', needs: ['rice', 'egg', 'kecap'], station: 'wok',   cook: 6, price: 28 },
  { id: 'mie-goreng',  name: 'Mie Goreng',  needs: ['noodle', 'veg', 'egg'], station: 'wok',   cook: 6, price: 26 },
  { id: 'sate-ayam',   name: 'Sate Ayam',   needs: ['chicken', 'peanut'],    station: 'grill', cook: 8, price: 32 },
  { id: 'soto-ayam',   name: 'Soto Ayam',   needs: ['chicken', 'broth', 'noodle'], station: 'pot', cook: 9, price: 34 },
  { id: 'gado-gado',   name: 'Gado-Gado',   needs: ['veg', 'tofu', 'peanut'], station: 'pot',   cook: 5, price: 24 },
];

export const RECIPE_BY_ID = Object.fromEntries(RECIPES.map((recipe) => [recipe.id, recipe]));

/** Stars earned at the end of a shift, by coins. */
export const STAR_LINES = [120, 220, 340];

export const PALETTE = {
  wall: '#7a4a2b',
  wallTop: '#8f5a35',
  floor: '#5d3a22',
  counter: '#a9713f',
  counterTop: '#c98f56',
  board: '#e8d5ae',
  boardEdge: '#b89b62',
  steel: '#c8ccd2',
  steelDark: '#9aa0a8',
  plate: '#f7f3e8',
  plateEdge: '#cfc4a8',
  rail: '#3a2a1e',
  ticket: '#fff8e6',
  ticketEdge: '#d9c9a3',
  text: '#fff6e5',
  dark: '#2c1c10',
  muted: '#cbb59a',
  gold: '#f2c94c',
  green: '#7ec850',
  red: '#e5534b',
  orange: '#e2703a',
  blue: '#6fb3e0',
  serve: '#3fae6a',
  shadow: 'rgba(0,0,0,0.35)',
};

export const FONT = '"Trebuchet MS", "Segoe UI", system-ui, sans-serif';
