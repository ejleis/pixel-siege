import { drawSprite, drawShadow } from '../gfx/sprites.js';

const LIFETIME = 9;
const SPRITE = { heart: 'heart', rapid: 'bolt' };

// type: 'heart' (+1 HP) or 'rapid' (temporary faster fire rate)
export class Pickup {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.r = 5;
    this.life = LIFETIME;
    this.t = 0;
    this.dead = false;
  }

  update(dt) {
    this.t += dt;
    this.life -= dt;
    if (this.life <= 0) this.dead = true;
  }

  draw(ctx) {
    // blink when about to expire
    if (this.life < 2.5 && Math.floor(this.t * 8) % 2) return;
    const bob = Math.round(Math.sin(this.t * 4) * 1.5);
    drawShadow(ctx, this.x, this.y + 5, 3);
    drawSprite(ctx, SPRITE[this.type], 0, this.x, this.y - 1 + bob);
  }
}
