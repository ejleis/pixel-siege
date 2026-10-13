// Screen shake. shake(n) sets the shake to at least n pixels; it decays quickly.
export class Camera {
  constructor() {
    this.amount = 0;
  }

  shake(amount) {
    this.amount = Math.min(8, Math.max(this.amount, amount));
  }

  update(dt) {
    this.amount = Math.max(0, this.amount - 30 * dt);
  }

  apply(ctx) {
    if (this.amount < 0.5) return;
    ctx.translate(
      Math.round((Math.random() * 2 - 1) * this.amount),
      Math.round((Math.random() * 2 - 1) * this.amount),
    );
  }
}
