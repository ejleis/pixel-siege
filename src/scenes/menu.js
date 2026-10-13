import { W, H } from '../config.js';
import { input } from '../input.js';
import { sfx } from '../audio.js';
import { loadHighScore } from '../storage.js';
import { createFloor } from '../gfx/floor.js';
import { drawText } from '../gfx/font.js';
import { drawSprite } from '../gfx/sprites.js';
import { drawCrosshair } from '../hud.js';
import { GameScene } from './game.js';

const PARADE_Y = 158;
// enemies chasing the player across the bottom of the screen: [sprite, x offset, fps]
const CHASERS = [
  ['runner', -34, 10],
  ['grunt', -56, 4],
  ['shooter', -78, 5],
  ['tank', -106, 3],
];

export class MenuScene {
  constructor(app) {
    this.app = app;
    this.t = 0;
    this.floor = createFloor();
    this.high = loadHighScore();
    this.paradeX = -20;
  }

  update(dt) {
    this.t += dt;
    this.paradeX += 40 * dt;
    if (this.paradeX > W + 140) this.paradeX = -20;
    if (input.mouse.pressed || input.pressed('Enter', 'Space')) {
      sfx.select();
      this.app.setScene(new GameScene(this.app));
    }
  }

  draw(ctx) {
    ctx.drawImage(this.floor, 0, 0);
    ctx.fillStyle = 'rgba(26, 28, 44, 0.55)';
    ctx.fillRect(0, 0, W, H);

    const bob = Math.round(Math.sin(this.t * 3) * 2);
    drawText(ctx, 'PIXEL SIEGE', W / 2, 16 + bob, { scale: 4, align: 'center', color: '#ffcd75' });
    drawText(ctx, 'A RETRO TOP-DOWN SHOOTER', W / 2, 42, { align: 'center', color: '#94b0c2' });

    const controls = ['WASD / ARROWS - MOVE', 'MOUSE - AIM', 'CLICK - SHOOT', 'ESC - PAUSE   M - MUTE'];
    controls.forEach((line, i) => drawText(ctx, line, W / 2, 60 + i * 9, { align: 'center' }));

    drawText(ctx, `HIGH SCORE ${String(this.high).padStart(6, '0')}`, W / 2, 102, {
      align: 'center',
      color: '#73eff7',
    });
    if (Math.floor(this.t * 2) % 2 === 0) {
      drawText(ctx, 'CLICK TO START', W / 2, 118, { scale: 2, align: 'center', color: '#a7f070' });
    }

    drawSprite(ctx, 'playerWalk', Math.floor(this.t * 10), this.paradeX, PARADE_Y, { scale: 2 });
    for (const [name, offset, fps] of CHASERS) {
      drawSprite(ctx, name, Math.floor(this.t * fps), this.paradeX + offset, PARADE_Y, { scale: 2 });
    }

    drawCrosshair(ctx, input.mouse.x, input.mouse.y);
  }
}
