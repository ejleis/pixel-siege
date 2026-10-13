import { W, H } from '../config.js';
import { input } from '../input.js';
import { sfx } from '../audio.js';
import { getLevel } from '../levels.js';
import { drawText } from '../gfx/font.js';
import { drawCrosshair } from '../hud.js';
import { GameScene } from './game.js';

const INPUT_DELAY = 0.8; // ignore clicks briefly so held fire doesn't skip this screen

// Shown over the frozen level. Awards bonuses and carries the run into the next level.
export class LevelCompleteScene {
  constructor(app, game) {
    this.app = app;
    this.game = game;
    this.t = 0;
    game.camera.amount = 0;

    const run = game.run;
    const p = game.player;
    this.levelBonus = run.level * 100;
    this.noDamageBonus = game.damageTaken === 0 ? 250 : 0;
    run.score += this.levelBonus + this.noDamageBonus;
    this.accuracy = game.shots ? Math.round((game.hits / game.shots) * 100) : 0;
    this.healed = p.hp < p.maxHp;
    this.next = { level: run.level + 1, score: run.score, hp: Math.min(p.maxHp, p.hp + 1) };
    this.nextName = getLevel(this.next.level).name;
  }

  update(dt) {
    this.t += dt;
    if (this.t > INPUT_DELAY && (input.mouse.pressed || input.pressed('Enter', 'Space'))) {
      sfx.select();
      this.app.setScene(new GameScene(this.app, this.next));
    }
  }

  draw(ctx) {
    this.game.draw(ctx);
    ctx.fillStyle = 'rgba(26, 28, 44, 0.85)';
    ctx.fillRect(0, 0, W, H);

    const g = this.game;
    drawText(ctx, `LEVEL ${g.run.level} CLEAR!`, W / 2, 20, { scale: 3, align: 'center', color: '#a7f070' });

    const secs = Math.floor(g.time);
    const rows = [
      ['KILLS', g.killed],
      ['ACCURACY', `${this.accuracy}%`],
      ['TIME', `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`],
      ['LEVEL BONUS', `+${this.levelBonus}`],
    ];
    if (this.noDamageBonus) rows.push(['NO DAMAGE BONUS', `+${this.noDamageBonus}`]);
    rows.push(['SCORE', g.run.score]);
    rows.forEach(([label, value], i) => {
      const y = 52 + i * 10;
      drawText(ctx, label, 100, y, { color: '#94b0c2' });
      drawText(ctx, value, 220, y, { align: 'right' });
    });

    if (this.healed) drawText(ctx, '+1 HP RESTORED', W / 2, 120, { align: 'center', color: '#e43b44' });
    drawText(ctx, `NEXT: ${this.nextName}`, W / 2, 132, { align: 'center', color: '#73eff7' });
    if (this.t > INPUT_DELAY && Math.floor(this.t * 2) % 2 === 0) {
      drawText(ctx, 'CLICK TO CONTINUE', W / 2, 152, { scale: 2, align: 'center', color: '#ffcd75' });
    }

    drawCrosshair(ctx, input.mouse.x, input.mouse.y);
  }
}
