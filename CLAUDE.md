# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Pixel Siege** is a retro, top-down 2D shooter for the browser.
- It's written in vanilla JS with ES modules and draws to a `<canvas>`.
- There are no dependencies, no build step and no test framework.

## Running

Browsers block ES modules on `file://`, so the folder has to be served over HTTP:

```
python -m http.server 8000      # then open http://localhost:8000
```

There is no lint or test tooling. To check syntax, run `node --check <file>`.

## Architecture

- **Resolution**: the canvas is always 320×180 (`W`, `H` in `src/config.js`). CSS scales it up by an integer factor with `image-rendering: pixelated`. Draw at integer coordinates (`Math.round`) to keep pixels crisp.
- **Game loop** (`src/main.js`): runs a fixed 60 Hz timestep inside `requestAnimationFrame`.
  - The current scene's `update(STEP)` runs once per step, followed by `input.endStep()`. `draw(ctx)` runs once per frame.
  - `app.setScene(scene)` swaps scenes.
  - Scenes take `app` in their constructor instead of importing `main.js`, which keeps circular scene imports (menu ↔ game ↔ levelComplete/gameOver) safe.
- **Input** (`src/input.js`):
  - `input.down(code)` reports held keys.
  - `input.pressed(...codes)` and `input.mouse.pressed` are edge-triggered and cleared after each step.
  - Keys use `KeyboardEvent.code` values (`'KeyW'`, `'ArrowUp'`).
  - Mouse coordinates are already converted to game space.
- **Scene flow**: `MenuScene` → `GameScene`. From `GameScene`, clearing the level goes to `LevelCompleteScene` (then the next `GameScene`) and dying goes to `GameOverScene`.
  - `GameScene` holds one level. Its `run` object (`{ level, score, hp }`) is carried into the next level.
  - The level-complete and game-over scenes draw the frozen `GameScene` underneath themselves.
  - Each scene has an input delay so a held fire button doesn't skip the screen.
- **GameScene** (`src/scenes/game.js`) owns every entity array and resolves all collisions.
  - Entities don't touch each other directly. They call back into the scene: `firePlayerBullet`, `spawnEnemyBullet`, `damagePlayer`, `killEnemy`.
  - `state` is `'playing'`, `'cleared'` or `'dead'`. Death plays in slow motion before switching scenes.
  - Every collidable object has `{x, y, r}` for `circlesOverlap`.
- **Levels** (`src/levels.js`): each level is a list of waves, flattened into a spawn queue that respects `maxAlive`. `getLevel(n)` creates the endless levels after the handcrafted ones.
- **Enemies** (`src/entities/enemy.js`): behavior comes from data in `ENEMY_TYPES`.
  - A `range` value makes an enemy a ranged kiter.
  - The type name must match a sprite name.
  - To add an enemy: add an entry to `ENEMY_TYPES`, add a sprite to `DEFS` in `gfx/sprites.js`, then use the type in `levels.js`.
- **Sprites** (`src/gfx/sprites.js`):
  - Pixel art is written as string grids, with a per-sprite palette and `.` for transparent pixels.
  - `initSprites()` bakes each frame, plus a white hit-flash copy, into offscreen canvases.
  - Every frame of a sprite must have the same dimensions. Sprites face right; use `flipX` to face left.
  - `drawSprite` draws centered on (x, y).
- **Text** (`src/gfx/font.js`): a custom 5px bitmap font. Glyphs can have variable widths. Unknown characters render as spaces, so add a glyph before using a new character.
- **Audio** (`src/audio.js`): every sound is synthesized with WebAudio, so there are no audio files. The context is unlocked on the first pointer or key event. M toggles mute.
- **Persistence**: `localStorage` stores the high score (`pixelSiege.highScore`) and the mute setting (`pixelSiege.muted`).

## Git workflow

The project is versioned with Git and pushed to GitHub (`origin`, branch `main`). After each meaningful change, make a focused commit with a clean, imperative-mood message, then `git push`. Keep commits small enough to revert individually.
