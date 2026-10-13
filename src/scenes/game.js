import { W, H, ARENA } from '../config.js';
import { input } from '../input.js';
import { sfx } from '../audio.js';
import { circlesOverlap, separate } from '../collision.js';
import { getLevel } from '../levels.js';
import { recordScore } from '../storage.js';
import { drawHud, drawCrosshair } from '../hud.js';
import { Player } from '../entities/player.js';
import { Enemy } from '../entities/enemy.js';
import { Bullet } from '../entities/bullet.js';
import { Pickup } from '../entities/pickup.js';
import { Particles } from '../gfx/particles.js';
import { Camera } from '../gfx/camera.js';
import { createFloor, stampSplat } from '../gfx/floor.js';
import { drawText } from '../gfx/font.js';
import { LevelCompleteScene } from './levelComplete.js';
import { GameOverScene } from './gameOver.js';
import { MenuScene } from './menu.js';

const WAVE_GAP = 2; // extra seconds before each new wave
const START_DELAY = 2; // "get ready" time before the first spawn

// Flattens a level's waves into a spawn queue of { type, delay }.
function buildQueue(level) {
  const queue = [];
  level.waves.forEach((w, wi) => {
    for (let i = 0; i < w.count; i++) {
      queue.push({ type: w.type, delay: w.interval + (i === 0 && wi > 0 ? WAVE_GAP : 0) });
    }
  });
  return queue;
}

// One level of play. `run` carries state between levels: { level, score, hp }.
// state: 'playing' → 'cleared' (→ LevelCompleteScene) or 'dead' (→ GameOverScene)
export class GameScene {
  constructor(app, run = { level: 1, score: 0, hp: 5 }) {
    this.app = app;
    this.run = { ...run };
    this.level = getLevel(this.run.level);
    this.player = new Player(W / 2, H / 2 + 10, this.run.hp);
    this.enemies = [];
    this.bullets = [];
    this.enemyBullets = [];
    this.pickups = [];
    this.popups = [];
    this.particles = new Particles();
    this.camera = new Camera();
    this.floor = createFloor();

    this.queue = buildQueue(this.level);
    this.totalEnemies = this.queue.length;
    this.killed = 0;
    this.spawnTimer = START_DELAY;

    this.time = 0;
    this.shots = 0;
    this.hits = 0;
    this.damageTaken = 0;

    this.state = 'playing';
    this.stateTimer = 0;
    this.bannerTime = START_DELAY + 0.2;
    this.paused = false;
  }

  onBlur() {
    if (this.state === 'playing') this.paused = true;
  }

  update(dt) {
    if (this.state === 'playing' && input.pressed('Escape', 'KeyP')) this.paused = !this.paused;
    if (this.paused) {
      if (input.pressed('KeyQ')) {
        recordScore(this.run.score);
        this.app.setScene(new MenuScene(this.app));
      }
      return;
    }

    if (this.state === 'dead') {
      this.stateTimer -= dt;
      if (this.stateTimer <= 0) return this.app.setScene(new GameOverScene(this.app, this));
      dt *= 0.4; // slow-motion death
    } else if (this.state === 'cleared') {
      this.stateTimer -= dt;
      if (this.stateTimer <= 0) return this.app.setScene(new LevelCompleteScene(this.app, this));
    } else {
      this.time += dt;
    }
    this.bannerTime -= dt;

    if (this.state !== 'dead') this.player.update(dt, this);
    this.updateSpawning(dt);
    for (const e of this.enemies) e.update(dt, this);
    separate(this.enemies);
    for (const b of this.bullets) b.update(dt);
    for (const b of this.enemyBullets) b.update(dt);
    for (const k of this.pickups) k.update(dt);
    this.handleCollisions();
    this.particles.update(dt);
    this.camera.update(dt);
    for (const p of this.popups) {
      p.life -= dt;
      p.y -= 14 * dt;
    }

    this.enemies = this.enemies.filter((e) => !e.dead);
    this.bullets = this.bullets.filter((b) => !b.dead);
    this.enemyBullets = this.enemyBullets.filter((b) => !b.dead);
    this.pickups = this.pickups.filter((k) => !k.dead);
    this.popups = this.popups.filter((p) => p.life > 0);

    if (this.state === 'playing' && this.queue.length === 0 && this.enemies.length === 0) {
      this.state = 'cleared';
      this.stateTimer = 1.8;
      this.enemyBullets = [];
      sfx.levelClear();
    }
  }

  updateSpawning(dt) {
    if (this.state !== 'playing' || this.queue.length === 0) return;
    this.spawnTimer -= dt;
    if (this.spawnTimer > 0 || this.enemies.length >= this.level.maxAlive) return;
    const { type } = this.queue.shift();
    const pos = this.spawnPoint();
    this.enemies.push(new Enemy(type, pos.x, pos.y));
    this.spawnTimer = this.queue.length ? this.queue[0].delay : 0;
  }

  // Random point just off a random screen edge, not too close to the player.
  spawnPoint() {
    const m = 12;
    let pos;
    for (let tries = 0; tries < 6; tries++) {
      const side = Math.floor(Math.random() * 4);
      const rx = Math.random() * W;
      const ry = ARENA.top + Math.random() * (H - ARENA.top);
      pos = [
        { x: rx, y: -m },
        { x: W + m, y: ry },
        { x: rx, y: H + m },
        { x: -m, y: ry },
      ][side];
      if (Math.hypot(pos.x - this.player.x, pos.y - this.player.y) > 70) break;
    }
    return pos;
  }

  handleCollisions() {
    for (const b of this.bullets) {
      if (b.dead) continue;
      for (const e of this.enemies) {
        if (e.dead || !circlesOverlap(b, e)) continue;
        b.dead = true;
        this.hits++;
        const angle = Math.atan2(b.vy, b.vx);
        this.particles.burst(b.x, b.y, { count: 4, colors: e.def.blood, speed: 50, life: 0.25, angle, spread: 1.2 });
        if (e.hit(1, angle)) this.killEnemy(e);
        else sfx.hit();
        break;
      }
    }

    if (this.state === 'dead') return;
    const p = this.player;
    for (const b of this.enemyBullets) {
      if (!b.dead && circlesOverlap(b, p)) {
        b.dead = true;
        this.damagePlayer(b.x, b.y);
      }
    }
    for (const e of this.enemies) {
      if (e.dead || !circlesOverlap(e, p)) continue;
      this.damagePlayer(e.x, e.y);
      const a = Math.atan2(e.y - p.y, e.x - p.x);
      e.kbx += Math.cos(a) * 80;
      e.kby += Math.sin(a) * 80;
    }
    for (const k of this.pickups) {
      if (!k.dead && circlesOverlap(k, p)) this.collect(k);
    }
  }

  firePlayerBullet(x, y, angle) {
    this.bullets.push(new Bullet(x, y, angle + (Math.random() - 0.5) * 0.08, 280));
    this.shots++;
    sfx.shoot();
    this.camera.shake(0.8);
    // muzzle flash + sparks
    this.particles.add({ x, y, life: 0.05, color: '#fff6b0', size: 3 });
    this.particles.burst(x, y, { count: 3, colors: ['#ffcd75', '#ef7d57'], speed: 70, life: 0.12, angle, spread: 0.6 });
    // ejected shell casing
    const h = this.player.hand;
    this.particles.add({
      x: h.x,
      y: h.y,
      vx: -Math.cos(angle) * 20 + (Math.random() - 0.5) * 20,
      vy: -40 - Math.random() * 20,
      gravity: 160,
      drag: 2,
      life: 0.35,
      color: '#ffcd75',
    });
  }

  spawnEnemyBullet(x, y, angle, speed) {
    this.enemyBullets.push(new Bullet(x, y, angle, speed, true));
    this.particles.burst(x, y, { count: 3, colors: ['#ffcd75', '#f4f4f4'], speed: 40, life: 0.15, angle, spread: 0.8 });
    sfx.enemyShoot();
  }

  killEnemy(e) {
    e.dead = true;
    this.killed++;
    this.run.score += e.def.score;
    this.particles.burst(e.x, e.y, { count: e.r * 3, colors: e.def.blood, speed: 80, life: 0.5 });
    stampSplat(this.floor, e.x, e.y, e.def.blood, e.r + 3);
    this.popups.push({ x: e.x, y: e.y - 10, text: `+${e.def.score}`, color: '#ffcd75', life: 0.7 });
    this.camera.shake(e.def.shake);
    sfx.enemyDie();

    // loot: tanks always drop something, others occasionally
    const p = this.player;
    const roll = Math.random();
    if (e.type === 'tank' || roll < 0.07) {
      this.pickups.push(new Pickup(e.x, e.y, p.hp < p.maxHp ? 'heart' : 'rapid'));
    } else if (roll < 0.12) {
      this.pickups.push(new Pickup(e.x, e.y, 'rapid'));
    }
  }

  damagePlayer(fromX, fromY) {
    const p = this.player;
    if (p.invuln > 0 || this.state !== 'playing') return;
    p.hp--;
    this.damageTaken++;
    p.invuln = 1.2;
    const a = Math.atan2(p.y - fromY, p.x - fromX);
    p.kbx = Math.cos(a) * 140;
    p.kby = Math.sin(a) * 140;
    this.camera.shake(5);
    sfx.hurt();
    this.particles.burst(p.x, p.y, { count: 10, colors: ['#b13e53', '#e43b44'], speed: 70, life: 0.4 });

    if (p.hp <= 0) {
      this.state = 'dead';
      this.stateTimer = 2;
      this.camera.shake(8);
      sfx.gameOver();
      this.particles.burst(p.x, p.y, {
        count: 40,
        colors: ['#b13e53', '#e43b44', '#3b5dc9', '#f4c49c'],
        speed: 110,
        life: 0.9,
      });
      stampSplat(this.floor, p.x, p.y, ['#b13e53', '#5d275d'], 9);
    }
  }

  collect(k) {
    const p = this.player;
    k.dead = true;
    sfx.pickup();
    if (k.type === 'heart') {
      p.hp = Math.min(p.maxHp, p.hp + 1);
      this.popups.push({ x: k.x, y: k.y - 8, text: '+1 HP', color: '#e43b44', life: 0.9 });
    } else {
      p.rapid = 6;
      this.popups.push({ x: k.x, y: k.y - 8, text: 'RAPID FIRE!', color: '#ffcd75', life: 0.9 });
    }
  }

  draw(ctx) {
    ctx.fillStyle = '#1a1c2c';
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    this.camera.apply(ctx);
    ctx.drawImage(this.floor, 0, 0);
    for (const k of this.pickups) k.draw(ctx);
    // draw actors back-to-front so lower ones overlap higher ones
    const actors = this.state === 'dead' ? [...this.enemies] : [this.player, ...this.enemies];
    actors.sort((a, b) => a.y - b.y);
    for (const a of actors) a.draw(ctx);
    for (const b of this.bullets) b.draw(ctx);
    for (const b of this.enemyBullets) b.draw(ctx);
    this.particles.draw(ctx);
    for (const p of this.popups) drawText(ctx, p.text, p.x, p.y, { align: 'center', color: p.color });
    ctx.restore();

    // red flash right after taking damage
    if (this.state === 'playing' && this.player.invuln > 0.9) {
      ctx.fillStyle = 'rgba(177, 62, 83, 0.3)';
      ctx.fillRect(0, 0, W, H);
    }

    drawHud(ctx, this);

    if (this.bannerTime > 0 && this.state === 'playing') {
      drawText(ctx, `LEVEL ${this.run.level}`, W / 2, 58, { scale: 3, align: 'center', color: '#ffcd75' });
      drawText(ctx, this.level.name, W / 2, 80, { scale: 2, align: 'center', color: '#94b0c2' });
    }
    if (this.state === 'cleared' && this.stateTimer > 0) {
      drawText(ctx, 'LEVEL CLEAR!', W / 2, 70, { scale: 3, align: 'center', color: '#a7f070' });
    }

    if (this.paused) {
      ctx.fillStyle = 'rgba(26, 28, 44, 0.75)';
      ctx.fillRect(0, 0, W, H);
      drawText(ctx, 'PAUSED', W / 2, 60, { scale: 3, align: 'center' });
      drawText(ctx, 'ESC - RESUME', W / 2, 90, { align: 'center', color: '#94b0c2' });
      drawText(ctx, 'Q - QUIT TO MENU', W / 2, 100, { align: 'center', color: '#94b0c2' });
    }

    drawCrosshair(ctx, input.mouse.x, input.mouse.y);
  }
}
