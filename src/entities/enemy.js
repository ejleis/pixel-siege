import { W, H } from '../config.js';
import { drawSprite, drawShadow, getSprite } from '../gfx/sprites.js';

// Enemy types are pure data; add a new type here (plus a sprite in gfx/sprites.js)
// and reference it from levels.js.
//   range        — if set, the enemy keeps this distance and shoots instead of charging
//   kbResist     — 0..1, how much bullet knockback is ignored
export const ENEMY_TYPES = {
  grunt: { hp: 3, speed: 24, r: 5, score: 10, fps: 4, kbResist: 0, shake: 2, blood: ['#38b764', '#257179', '#a7f070'] },
  runner: { hp: 1, speed: 52, r: 4, score: 15, fps: 10, kbResist: 0, shake: 2, blood: ['#b13e53', '#5d275d'] },
  tank: { hp: 16, speed: 13, r: 7, score: 60, fps: 3, kbResist: 0.85, shake: 6, blood: ['#8b4fc0', '#4a2470', '#c08ae8'] },
  shooter: {
    hp: 4,
    speed: 22,
    r: 5,
    score: 30,
    fps: 5,
    kbResist: 0.2,
    shake: 3,
    blood: ['#ffcd75', '#ef7d57', '#333c57'],
    range: 75,
    fireInterval: 2.0,
    bulletSpeed: 75,
  },
};

const KNOCKBACK = 90;

export class Enemy {
  constructor(type, x, y) {
    this.type = type;
    this.def = ENEMY_TYPES[type];
    this.x = x;
    this.y = y;
    this.r = this.def.r;
    this.hp = this.def.hp;
    this.kbx = 0;
    this.kby = 0;
    this.flash = 0;
    this.t = Math.random() * 10; // desync animations
    this.strafeDir = Math.random() < 0.5 ? -1 : 1;
    this.fireTimer = (this.def.fireInterval || 0) * (0.5 + Math.random() * 0.5);
    this.dead = false;
  }

  update(dt, scene) {
    this.t += dt;
    this.flash -= dt;
    const p = scene.player;
    const dx = p.x - this.x;
    const dy = p.y - this.y;
    const dist = Math.hypot(dx, dy) || 1;
    let ax = dx / dist;
    let ay = dy / dist;

    if (this.def.range) {
      const onScreen = this.x > 4 && this.x < W - 4 && this.y > 4 && this.y < H - 4;
      if (onScreen) {
        if (dist < this.def.range - 12) {
          ax = -ax;
          ay = -ay;
        } else if (dist < this.def.range + 12) {
          [ax, ay] = [-ay * this.strafeDir, ax * this.strafeDir];
        }
        this.fireTimer -= dt;
        if (this.fireTimer <= 0 && scene.state === 'playing') {
          this.fireTimer = this.def.fireInterval * (0.8 + Math.random() * 0.4);
          scene.spawnEnemyBullet(this.x, this.y, Math.atan2(dy, dx), this.def.bulletSpeed);
        }
      }
    } else if (this.type === 'runner') {
      // zig-zag approach
      const wob = Math.sin(this.t * 7) * 0.6;
      const c = Math.cos(wob);
      const s = Math.sin(wob);
      [ax, ay] = [ax * c - ay * s, ax * s + ay * c];
    }

    this.x += (ax * this.def.speed + this.kbx) * dt;
    this.y += (ay * this.def.speed + this.kby) * dt;
    const decay = Math.exp(-8 * dt);
    this.kbx *= decay;
    this.kby *= decay;
  }

  // Returns true if this hit killed the enemy.
  hit(damage, angle) {
    this.hp -= damage;
    this.flash = 0.08;
    const k = KNOCKBACK * (1 - this.def.kbResist);
    this.kbx += Math.cos(angle) * k;
    this.kby += Math.sin(angle) * k;
    return this.hp <= 0;
  }

  draw(ctx) {
    const s = getSprite(this.type);
    drawShadow(ctx, this.x, this.y + s.h / 2, Math.floor(s.w / 2) - 1);
    drawSprite(ctx, this.type, Math.floor(this.t * this.def.fps), this.x, this.y, { flash: this.flash > 0 });
  }
}
