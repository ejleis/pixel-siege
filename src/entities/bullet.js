import { W, H } from '../config.js';

export class Bullet {
  constructor(x, y, angle, speed, fromEnemy = false) {
    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.fromEnemy = fromEnemy;
    this.r = fromEnemy ? 2 : 1.5;
    this.life = fromEnemy ? 4 : 1.2;
    this.t = 0;
    this.dead = false;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.t += dt;
    this.life -= dt;
    if (this.life <= 0 || this.x < -10 || this.x > W + 10 || this.y < -10 || this.y > H + 10) this.dead = true;
  }

  draw(ctx) {
    const x = Math.round(this.x);
    const y = Math.round(this.y);
    if (this.fromEnemy) {
      ctx.fillStyle = Math.floor(this.t * 10) % 2 ? '#ef7d57' : '#ffcd75';
      ctx.fillRect(x - 2, y - 2, 4, 4);
      ctx.fillStyle = '#f4f4f4';
      ctx.fillRect(x - 1, y - 1, 2, 2);
      return;
    }
    // short tracer trail behind the bullet
    const len = Math.hypot(this.vx, this.vy);
    const nx = this.vx / len;
    const ny = this.vy / len;
    ctx.fillStyle = '#ef7d57';
    for (let i = 1; i <= 3; i++) ctx.fillRect(Math.round(this.x - nx * i * 2), Math.round(this.y - ny * i * 2), 1, 1);
    ctx.fillStyle = '#fff6b0';
    ctx.fillRect(x - 1, y - 1, 2, 2);
  }
}
