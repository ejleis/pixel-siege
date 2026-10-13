# Pixel Siege

A retro 2D top-down shooter that runs in the browser. Vanilla JavaScript + Canvas, no dependencies, no build step.

## Play

The game uses ES modules, so it must be served over HTTP (opening `index.html` directly won't work):

```
python -m http.server 8000
```

Then open http://localhost:8000.

## Controls

| Action | Input |
|---|---|
| Move | WASD / Arrow keys |
| Aim | Mouse |
| Shoot | Click (hold for auto-fire) |
| Pause | Esc |
| Mute | M |

Survive each level's waves of enemies to advance. After level 6 the game continues in endless mode.
