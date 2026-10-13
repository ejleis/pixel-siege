import { W, H, STEP } from './config.js';
import { input } from './input.js';
import { unlockAudio, toggleMute, isMuted } from './audio.js';
import { initSprites } from './gfx/sprites.js';
import { drawText } from './gfx/font.js';
import { MenuScene } from './scenes/menu.js';

const canvas = document.getElementById('game');
canvas.width = W;
canvas.height = H;
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

// Scale the canvas up by the largest integer factor that fits the window (CSS keeps it pixelated).
function resize() {
  const scale = Math.max(1, Math.floor(Math.min(innerWidth / W, innerHeight / H)));
  canvas.style.width = `${W * scale}px`;
  canvas.style.height = `${H * scale}px`;
}
addEventListener('resize', resize);
resize();

input.attach(canvas);
addEventListener('pointerdown', unlockAudio);
addEventListener('keydown', unlockAudio);

initSprites();

// Scenes implement update(dt), draw(ctx) and optionally onBlur(). They receive `app`
// so they can switch scenes without importing this module.
const app = {
  scene: null,
  setScene(scene) {
    this.scene = scene;
  },
};
app.setScene(new MenuScene(app));
addEventListener('blur', () => app.scene.onBlur?.());

let last = performance.now();
let acc = 0;
function frame(now) {
  acc += Math.min(0.25, (now - last) / 1000);
  last = now;
  while (acc >= STEP) {
    if (input.pressed('KeyM')) toggleMute();
    app.scene.update(STEP);
    input.endStep();
    acc -= STEP;
  }
  app.scene.draw(ctx);
  if (isMuted()) drawText(ctx, 'MUTED', W - 3, H - 8, { align: 'right', color: '#566c86' });
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
