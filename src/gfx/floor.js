import { W, H } from '../config.js';

const TILE = 16;

// Pre-renders the tiled arena floor. Each level gets a fresh one, so blood splats
// stamped onto it persist for the level.
export function createFloor() {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d');

  g.fillStyle = '#262b40';
  g.fillRect(0, 0, W, H);
  for (let ty = 0; ty < H / TILE; ty++) {
    for (let tx = 0; tx < W / TILE; tx++) {
      if ((tx + ty) % 2) {
        g.fillStyle = '#2a2f47';
        g.fillRect(tx * TILE, ty * TILE, TILE, TILE);
      }
      g.fillStyle = '#1f2335';
      g.fillRect(tx * TILE, ty * TILE, TILE, 1);
      g.fillRect(tx * TILE, ty * TILE, 1, TILE);
    }
  }

  // specks
  for (let i = 0; i < 260; i++) {
    g.fillStyle = Math.random() < 0.5 ? '#30364f' : '#22263a';
    g.fillRect(Math.floor(Math.random() * W), Math.floor(Math.random() * H), 1, 1);
  }

  // cracks: short random walks
  g.fillStyle = '#1c1f30';
  for (let i = 0; i < 7; i++) {
    let x = Math.floor(Math.random() * W);
    let y = Math.floor(Math.random() * H);
    for (let j = 0; j < 10; j++) {
      g.fillRect(x, y, 1, 1);
      x += Math.random() < 0.5 ? 1 : -1;
      y += Math.floor(Math.random() * 3) - 1;
    }
  }

  // vignette
  const grad = g.createRadialGradient(W / 2, H / 2, 70, W / 2, H / 2, 200);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
  g.fillStyle = grad;
  g.fillRect(0, 0, W, H);

  return c;
}

export function stampSplat(floor, x, y, colors, radius) {
  const g = floor.getContext('2d');
  g.globalAlpha = 0.6;
  for (let i = 0; i < radius * 4; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.random() * Math.random() * radius;
    g.fillStyle = colors[Math.floor(Math.random() * colors.length)];
    const s = Math.random() < 0.3 ? 2 : 1;
    g.fillRect(Math.round(x + Math.cos(a) * r), Math.round(y + Math.sin(a) * r), s, s);
  }
  g.globalAlpha = 1;
}
