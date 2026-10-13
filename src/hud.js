import { W } from './config.js';
import { drawText } from './gfx/font.js';
import { drawSprite } from './gfx/sprites.js';

export function drawHud(ctx, game) {
  const p = game.player;

  // hearts
  for (let i = 0; i < p.maxHp; i++) {
    drawSprite(ctx, i < Math.max(0, p.hp) ? 'heart' : 'heartEmpty', 0, 8 + i * 9, 7);
  }

  // rapid-fire timer
  if (p.rapid > 0) {
    const x = 8 + p.maxHp * 9 + 4;
    drawSprite(ctx, 'bolt', 0, x, 7);
    ctx.fillStyle = '#ffcd75';
    ctx.fillRect(x + 4, 6, Math.ceil(p.rapid * 3), 2);
  }

  // level + progress bar
  drawText(ctx, `LEVEL ${game.run.level}`, W / 2, 2, { align: 'center', color: '#ffcd75' });
  const bw = 60;
  const bx = Math.round(W / 2 - bw / 2);
  const by = 9;
  ctx.fillStyle = '#1a1c2c';
  ctx.fillRect(bx - 1, by - 1, bw + 2, 4);
  ctx.fillStyle = '#333c57';
  ctx.fillRect(bx, by, bw, 2);
  ctx.fillStyle = '#a7f070';
  ctx.fillRect(bx, by, Math.round((bw * game.killed) / game.totalEnemies), 2);

  drawText(ctx, `SCORE ${String(game.run.score).padStart(6, '0')}`, W - 4, 3, { align: 'right' });
}

export function drawCrosshair(ctx, x, y) {
  x = Math.round(x);
  y = Math.round(y);
  ctx.fillStyle = '#1a1c2c';
  ctx.fillRect(x - 5, y - 1, 4, 3);
  ctx.fillRect(x + 2, y - 1, 4, 3);
  ctx.fillRect(x - 1, y - 5, 3, 4);
  ctx.fillRect(x - 1, y + 2, 3, 4);
  ctx.fillStyle = '#f4f4f4';
  ctx.fillRect(x - 4, y, 3, 1);
  ctx.fillRect(x + 2, y, 3, 1);
  ctx.fillRect(x, y - 4, 1, 3);
  ctx.fillRect(x, y + 2, 1, 3);
  ctx.fillStyle = '#ff004d';
  ctx.fillRect(x, y, 1, 1);
}
