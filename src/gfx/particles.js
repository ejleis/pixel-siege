// Simple square particles: sparks, blood, muzzle flashes, shell casings.
export class Particles {
  constructor() {
    this.list = [];
  }

  add(p) {
    this.list.push({ vx: 0, vy: 0, drag: 0, gravity: 0, size: 1, ...p });
  }

  // Spray `count` particles from (x, y). With `angle`, they spray in a cone of width `spread`.
  burst(x, y, { count = 10, colors, speed = 60, life = 0.5, size = 1, drag = 4, angle = null, spread = Math.PI * 2 }) {
    for (let i = 0; i < count; i++) {
      const a = angle === null ? Math.random() * Math.PI * 2 : angle + (Math.random() - 0.5) * spread;
      const s = speed * (0.3 + Math.random() * 0.7);
      this.add({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: life * (0.5 + Math.random() * 0.5),
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() < 0.3 ? size + 1 : size,
        drag,
      });
    }
  }

  update(dt) {
    for (const p of this.list) {
      const d = Math.exp(-p.drag * dt);
      p.vx *= d;
      p.vy = p.vy * d + p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
    }
    this.list = this.list.filter((p) => p.life > 0);
  }

  draw(ctx) {
    for (const p of this.list) {
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x - p.size / 2), Math.round(p.y - p.size / 2), p.size, p.size);
    }
  }
}
