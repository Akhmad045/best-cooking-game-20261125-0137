// A tiny seeded random generator (mulberry32) so a screenshot seed always stages the same
// kitchen, and so the game can be driven deterministically by its own autopilot.

export function makeRandom(seed) {
  let state = seed >>> 0;
  if (state === 0) state = 0x9e3779b9;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/** Pick one entry of `list` with the seeded generator. */
export function pick(random, list) {
  return list[Math.floor(random() * list.length)];
}

/** A number in [min, max) from the seeded generator. */
export function range(random, min, max) {
  return min + random() * (max - min);
}
