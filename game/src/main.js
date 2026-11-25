// Bumbu & Api — the shell: canvas setup, the fixed-step loop, the mouse and keyboard, and
// the ?shot= scenes. The game itself lives in state.js; this file only runs it.

import { FIELD, STEP } from './config.js';
import { clickHit, hitAt, pressKey } from './input.js';
import { render } from './render.js';
import { ensureAudio, playSound, setMuted } from './audio.js';
import { freshState, loadBest, step } from './state.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
const seed = Number(params.get('seed') || 1) || 1;

let state;
if (shotName) {
  state = stageShot(shotName, seed).state;
} else {
  state = freshState(seed);
  state.best = loadBest();
}

let hover = null;
let lastTime = performance.now();
let accumulator = 0;

function resize() {
  const scale = Math.min(window.innerWidth / FIELD.width, window.innerHeight / FIELD.height);
  canvas.style.width = `${Math.floor(FIELD.width * scale)}px`;
  canvas.style.height = `${Math.floor(FIELD.height * scale)}px`;
}

function toLogical(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * FIELD.width,
    y: ((event.clientY - rect.top) / rect.height) * FIELD.height,
  };
}

const ui = {
  toggleMute() {
    state.muted = !state.muted;
    setMuted(state.muted);
    if (!state.muted) ensureAudio();
  },
  togglePause() {
    if (state.screen === 'playing') state.paused = !state.paused;
  },
};

canvas.addEventListener('mousemove', (event) => {
  const point = toLogical(event);
  hover = hitAt(state, point.x, point.y);
});

canvas.addEventListener('click', (event) => {
  ensureAudio();
  const point = toLogical(event);
  const hit = hitAt(state, point.x, point.y);
  clickHit(state, hit, ui);
});

window.addEventListener('keydown', (event) => {
  if ([' ', 'ArrowUp', 'ArrowDown'].includes(event.key)) event.preventDefault();
  ensureAudio();
  pressKey(state, event.key, ui);
});

window.addEventListener('resize', resize);
resize();

function drainEvents() {
  for (const event of state.events) playSound(event);
  state.events.length = 0;
}

function frame(now) {
  const dt = Math.min(0.1, (now - lastTime) / 1000);
  lastTime = now;
  if (!shotName) {
    accumulator += dt;
    while (accumulator >= STEP) {
      step(state, STEP);
      accumulator -= STEP;
    }
    drainEvents();
  }
  render(ctx, state, hover);
  requestAnimationFrame(frame);
}

// In a screenshot scene the kitchen is already staged; draw it once and keep it still.
if (shotName) {
  render(ctx, state, hover);
  document.title = `Bumbu & Api — shot ${shotName}`;
} else {
  requestAnimationFrame(frame);
}

// A hook for automated play-tests: the page's state, so a test can drive it and read it back.
window.__bumbu = { state, step, freshState };
