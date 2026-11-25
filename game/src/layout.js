// Bumbu & Api — where everything sits in the 1280x720 kitchen. One module owns every
// rectangle, so the renderer and the mouse handler can never disagree about a button.

export const LAYOUT = {
  topBar: { x: 0, y: 0, w: 1280, h: 60 },
  title: { x: 24, y: 8, w: 320, h: 44 },
  timer: { x: 540, y: 6, w: 200, h: 48 },
  coins: { x: 950, y: 10, w: 190, h: 40 },
  muteButton: { x: 1152, y: 10, w: 44, h: 40 },
  pauseButton: { x: 1204, y: 10, w: 52, h: 40 },

  railLabel: { x: 24, y: 66, w: 300, h: 18 },
  ticket: (index) => ({ x: 24 + index * 252, y: 86, w: 240, h: 92 }),

  counterLabel: { x: 24, y: 188, w: 280, h: 18 },
  /** Ingredient bowls: 3 columns x 3 rows starting at (24, 210). */
  bowl: (index) => {
    const col = index % 3;
    const row = Math.floor(index / 3);
    return { x: 24 + col * 96, y: 210 + row * 96, w: 88, h: 88 };
  },

  stationsLabel: { x: 336, y: 188, w: 400, h: 18 },
  board: { x: 336, y: 210, w: 150, h: 170 },
  wok: { x: 498, y: 210, w: 150, h: 170 },
  grill: { x: 660, y: 210, w: 150, h: 170 },
  pot: { x: 822, y: 210, w: 150, h: 170 },

  serveLabel: { x: 1000, y: 188, w: 256, h: 18 },
  serveWindow: { x: 1000, y: 210, w: 256, h: 170 },
  trash: { x: 1000, y: 396, w: 120, h: 84 },
  clearButton: { x: 1136, y: 396, w: 120, h: 84 },

  plateArea: { x: 336, y: 396, w: 636, h: 150 },
  plateCircle: { x: 380, y: 412, w: 118, h: 118 },

  recipesLabel: { x: 24, y: 562, w: 300, h: 18 },
  recipeCard: (index) => ({ x: 24 + index * 250, y: 584, w: 238, h: 66 }),

  hints: { x: 24, y: 668, w: 1232, h: 36 },
  toast: { x: 340, y: 664, w: 600, h: 30 },

  startButton: { x: 490, y: 440, w: 300, h: 64 },
  againButton: { x: 490, y: 540, w: 300, h: 64 },
  titlePanel: { x: 290, y: 140, w: 700, h: 420 },
  overPanel: { x: 290, y: 130, w: 700, h: 500 },
};

export function inside(rect, x, y) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}
