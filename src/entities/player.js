import { ARENA } from '../config.js';
import { input } from '../input.js';
import { drawSprite, drawShadow, getSprite } from '../gfx/sprites.js';

const SPEED = 75;
const FIRE_COOLDOWN = 0.16;
const RAPID_COOLDOWN = 0.07;
const GUN_LENGTH = 8;

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export class Player {
  constructor(x, y, hp) {
    this.x = x;
    this.y = y;
    this.r = 4;
    this.maxHp = 5;
    this.hp = hp;
    this.aim = 0;
    this.facingLeft = false;
    this.moving = false;
    this.animTime = 0;
    this.cooldown = 0;
    this.invuln = 0; // seconds of invulnerability left after being hit
    this.rapid = 0; // seconds of rapid-fire powerup left
    this.recoil = 0;
    this.kbx = 0;
    this.kby = 0;
  }

  get hand() {
    return { x: this.x + (this.facingLeft ? -3 : 3), y: this.y + 1 };
  }

  get muzzle() {
    const h = this.hand;
    return { x: h.x + Math.cos(this.aim) * GUN_LENGTH, y: h.y + Math.sin(this.aim) * GUN_LENGTH };
  }

  update(dt, scene) {
    let mx = 0;
    let my = 0;
    if (input.down('KeyA') || input.down('ArrowLeft')) mx -= 1;
    if (input.down('KeyD') || input.down('ArrowRight')) mx += 1;
    if (input.down('KeyW') || input.down('ArrowUp')) my -= 1;
    if (input.down('KeyS') || input.down('ArrowDown')) my += 1;
    const len = Math.hypot(mx, my);
    if (len) {
      mx /= len;
      my /= len;
    }
    this.moving = len > 0;
    this.animTime = this.moving ? this.animTime + dt : 0;

    this.x = clamp(this.x + (mx * SPEED + this.kbx) * dt, ARENA.left, ARENA.right);
    this.y = clamp(this.y + (my * SPEED + this.kby) * dt, ARENA.top, ARENA.bottom);
    const decay = Math.exp(-10 * dt);
    this.kbx *= decay;
    this.kby *= decay;

    this.aim = Math.atan2(input.mouse.y - this.y, input.mouse.x - this.x);
    this.facingLeft = Math.cos(this.aim) < 0;

    this.cooldown -= dt;
    this.invuln = Math.max(0, this.invuln - dt);
    this.rapid = Math.max(0, this.rapid - dt);
    this.recoil = Math.max(0, this.recoil - 20 * dt);

    if (input.mouse.down && this.cooldown <= 0) {
      this.cooldown = this.rapid > 0 ? RAPID_COOLDOWN : FIRE_COOLDOWN;
      this.recoil = 2;
      const m = this.muzzle;
      scene.firePlayerBullet(m.x, m.y, this.aim);
    }
  }

  draw(ctx) {
    drawShadow(ctx, this.x, this.y + 6, 4);
    // blink while invulnerable
    if (this.invuln > 0 && Math.floor(this.invuln * 16) % 2 === 0) return;

    // gun goes behind the body when aiming upward
    const gunBehind = Math.sin(this.aim) < -0.2;
    if (gunBehind) this.drawGun(ctx);
    drawSprite(ctx, this.moving ? 'playerWalk' : 'playerIdle', Math.floor(this.animTime * 10), this.x, this.y, {
      flipX: this.facingLeft,
    });
    if (!gunBehind) this.drawGun(ctx);
  }

  drawGun(ctx) {
    const h = this.hand;
    ctx.save();
    ctx.translate(Math.round(h.x), Math.round(h.y));
    ctx.rotate(this.aim);
    if (this.facingLeft) ctx.scale(1, -1); // keep the grip pointing down
    ctx.drawImage(getSprite('gun').frames[0], -2 - Math.round(this.recoil), -2);
    ctx.restore();
  }
}
