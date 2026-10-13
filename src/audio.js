// Tiny WebAudio synth — every sound is generated, no audio files.
// The AudioContext can only start after a user gesture, so main.js calls unlockAudio() on input.

const MUTE_KEY = 'pixelSiege.muted';
const VOLUME = 0.5;

let ac = null;
let master = null;
let noiseBuffer = null;
let muted = false;
try {
  muted = localStorage.getItem(MUTE_KEY) === '1';
} catch {
  // ignore
}

export function unlockAudio() {
  if (!ac) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ac = new AC();
    master = ac.createGain();
    master.gain.value = muted ? 0 : VOLUME;
    master.connect(ac.destination);
    noiseBuffer = ac.createBuffer(1, ac.sampleRate * 0.5, ac.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  if (ac.state === 'suspended') ac.resume();
}

export const isMuted = () => muted;

export function toggleMute() {
  muted = !muted;
  if (master) master.gain.value = muted ? 0 : VOLUME;
  try {
    localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
  } catch {
    // ignore
  }
}

function tone(freq, freqEnd, dur, { type = 'square', vol = 0.1, delay = 0 } = {}) {
  if (!ac || muted) return;
  const t = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), t + dur);
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(master);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

function noise(dur, { vol = 0.2, freq = 2000, type = 'lowpass', delay = 0 } = {}) {
  if (!ac || muted) return;
  const t = ac.currentTime + delay;
  const src = ac.createBufferSource();
  src.buffer = noiseBuffer;
  const filter = ac.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = freq;
  const gain = ac.createGain();
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filter).connect(gain).connect(master);
  src.start(t);
  src.stop(t + dur);
}

export const sfx = {
  shoot() {
    tone(900, 250, 0.07, { vol: 0.035 });
    noise(0.04, { vol: 0.05, freq: 4000, type: 'highpass' });
  },
  hit: () => noise(0.05, { vol: 0.1, freq: 3000 }),
  enemyDie() {
    noise(0.2, { vol: 0.22, freq: 1200 });
    tone(220, 50, 0.18, { vol: 0.05 });
  },
  enemyShoot: () => tone(500, 200, 0.12, { type: 'triangle', vol: 0.08 }),
  hurt() {
    tone(300, 60, 0.3, { type: 'sawtooth', vol: 0.12 });
    noise(0.15, { vol: 0.15, freq: 800 });
  },
  pickup() {
    tone(660, 660, 0.08, { vol: 0.07 });
    tone(990, 990, 0.1, { vol: 0.07, delay: 0.08 });
  },
  levelClear: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, f, 0.14, { vol: 0.07, delay: i * 0.1 })),
  gameOver: () =>
    [392, 330, 262, 196].forEach((f, i) => tone(f, f * 0.97, 0.25, { type: 'triangle', vol: 0.14, delay: i * 0.2 })),
  select: () => tone(440, 880, 0.08, { vol: 0.06 }),
};
