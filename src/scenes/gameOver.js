import { W, H } from '../config.js';
import { input } from '../input.js';
import { sfx } from '../audio.js';
import { recordScore } from '../storage.js';
import { drawText } from '../gfx/font.js';
import { drawCrosshair } from '../hud.js';
import { GameScene } from './game.js';
import { MenuScene } from './menu.js';

const INPUT_DELAY = 1;

export class GameOverScene {
  constructor(app, game) {
    this.app = app;
    this.game = game;
    this.t = 0;
    game.camera.amount = 0;
    const { high, isNew } = recordScore(game.run.score);
    this.high = high;
    this.isNewHigh = isNew;
  }

  update(dt) {
    this.t += dt;
    if (this.t < INPUT_DELAY) return;
    if (input.pressed('Escape')) {
      this.app.setScene(new MenuScene(this.app));
    } else if (input.mouse.pressed || input.pressed('Enter', 'Space')) {
      sfx.select();
      this.app.setScene(new GameScene(this.app));
    }
  }

  draw(ctx) {
    this.game.draw(ctx);
    ctx.fillStyle = 'rgba(26, 28, 44, 0.85)';
    ctx.fillRect(0, 0, W, H);

    drawText(ctx, 'GAME OVER', W / 2, 30, { scale: 4, align: 'center', color: '#b13e53' });
    drawText(ctx, `SCORE ${this.game.run.score}`, W / 2, 70, { scale: 2, align: 'center' });
    drawText(ctx, `REACHED LEVEL ${this.game.run.level}`, W / 2, 88, { align: 'center', color: '#94b0c2' });
    if (this.isNewHigh) {
      if (Math.floor(this.t * 4) % 2 === 0) {
        drawText(ctx, 'NEW HIGH SCORE!', W / 2, 102, { align: 'center', color: '#ffcd75' });
      }
    } else {
      drawText(ctx, `HIGH SCORE ${this.high}`, W / 2, 102, { align: 'center', color: '#94b0c2' });
    }

    if (this.t > INPUT_DELAY) {
      if (Math.floor(this.t * 2) % 2 === 0) {
        drawText(ctx, 'CLICK TO RETRY', W / 2, 128, { scale: 2, align: 'center', color: '#ffcd75' });
      }
      drawText(ctx, 'ESC - MENU', W / 2, 148, { align: 'center', color: '#566c86' });
    }

    drawCrosshair(ctx, input.mouse.x, input.mouse.y);
  }
}
