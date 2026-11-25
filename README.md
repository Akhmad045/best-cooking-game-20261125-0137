[![Bumbu & Api — make.fun bounty](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![Rank](https://make.fun/badge/best-cooking-game-20261125-0137/Akhmad045/best-cooking-game-20261125-0137/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![Reward](https://make.fun/badge/best-cooking-game-20261125-0137/Akhmad045/best-cooking-game-20261125-0137/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)

# Bumbu & Api — Spice Route Kitchen

A complete, original timed cooking game for the [make.fun "Make the best cooking game" bounty](https://make.fun/bounty/best-cooking-game-20261125-0137) ($250 pot, top 10 paid).

Run the busiest little kitchen on the spice route: build each order on your plate, chop what needs chopping, cook it on the right station — wok, grill or pot — and serve it before the customer walks out. One 150-second shift, five Indonesian recipes (Nasi Goreng, Mie Goreng, Sate Ayam, Soto Ayam, Gado-Gado), nine ingredients, combos, burn warnings, and a three-star shift summary.

## Play

Open `game/index.html` in a desktop browser (or `node serve.ts` and visit http://localhost:8080). No network requests, no build step — the game is plain static files. Mouse and keyboard: keys 1–9 pick ingredients, C chops, W / G / O cook on the wok / grill / pot, S serves, T bins, P pauses, M mutes. All sounds are synthesized with WebAudio; all art is drawn on canvas.

## Layout

- `main.ts` — the entrypoint: copies `game/` and `screenshots/` to `/output` and writes `dossier.json`.
- `game/` — the playable game: `index.html` plus `src/` modules, one job each (`config`, `state`, `render`, `input`, `audio`, `layout`, `random`, `shots`, `main`).
- `screenshots/` — four real renders of the game's own code: title, mid-shift, rush hour, shift summary.
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged.
- `serve.ts` — a tiny static server for local play-testing.

## Screenshots

The cover and the other three shots are real captures taken with Playwright's bundled Chromium from the game's own `?shot=` scenes, which play the real rules forward with an autopilot — see `game/src/shots.js`.

---

Built for the make.fun bounty with referral code `4g7knchf`. MIT licensed — see [LICENSE](LICENSE).
