import { W, H } from './config.js';

const held = new Set();
const pressed = new Set();
const NO_SCROLL = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space']);

// Keyboard uses KeyboardEvent.code values ('KeyW', 'ArrowUp', ...).
// `pressed` flags are edge-triggered and cleared after each simulation step.
export const input = {
  mouse: { x: W / 2, y: H / 2, down: false, pressed: false },

  down: (code) => held.has(code),
  pressed: (...codes) => codes.some((c) => pressed.has(c)),

  endStep() {
    pressed.clear();
    this.mouse.pressed = false;
  },

  attach(canvas) {
    addEventListener('keydown', (e) => {
      if (NO_SCROLL.has(e.code)) e.preventDefault();
      if (!e.repeat) pressed.add(e.code);
      held.add(e.code);
    });
    addEventListener('keyup', (e) => held.delete(e.code));

    // Convert window coordinates to game coordinates.
    addEventListener('mousemove', (e) => {
      const r = canvas.getBoundingClientRect();
      this.mouse.x = Math.max(0, Math.min(W, ((e.clientX - r.left) / r.width) * W));
      this.mouse.y = Math.max(0, Math.min(H, ((e.clientY - r.top) / r.height) * H));
    });
    addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      this.mouse.down = true;
      this.mouse.pressed = true;
    });
    addEventListener('mouseup', (e) => {
      if (e.button === 0) this.mouse.down = false;
    });
    addEventListener('contextmenu', (e) => e.preventDefault());
    addEventListener('blur', () => {
      held.clear();
      this.mouse.down = false;
    });
  },
};
