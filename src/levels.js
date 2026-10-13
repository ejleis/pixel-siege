// Each level is a list of waves played in order. A wave spawns `count` enemies of `type`,
// one every `interval` seconds, never exceeding `maxAlive` enemies on screen at once.
// The level is cleared when every enemy has spawned and died.
export const LEVELS = [
  {
    name: 'FIRST CONTACT',
    maxAlive: 5,
    waves: [{ type: 'grunt', count: 8, interval: 1.3 }],
  },
  {
    name: 'FAST MOVERS',
    maxAlive: 7,
    waves: [
      { type: 'grunt', count: 6, interval: 1.0 },
      { type: 'runner', count: 8, interval: 0.7 },
    ],
  },
  {
    name: 'HEAVY METAL',
    maxAlive: 8,
    waves: [
      { type: 'grunt', count: 8, interval: 0.8 },
      { type: 'tank', count: 2, interval: 2.5 },
      { type: 'runner', count: 8, interval: 0.5 },
    ],
  },
  {
    name: 'RETURN FIRE',
    maxAlive: 9,
    waves: [
      { type: 'grunt', count: 6, interval: 0.8 },
      { type: 'shooter', count: 4, interval: 1.5 },
      { type: 'runner', count: 8, interval: 0.5 },
    ],
  },
  {
    name: 'SWARM',
    maxAlive: 14,
    waves: [
      { type: 'runner', count: 16, interval: 0.3 },
      { type: 'grunt', count: 10, interval: 0.5 },
      { type: 'shooter', count: 4, interval: 1.2 },
      { type: 'tank', count: 2, interval: 2.0 },
    ],
  },
  {
    name: 'THE HORDE',
    maxAlive: 16,
    waves: [
      { type: 'grunt', count: 12, interval: 0.4 },
      { type: 'tank', count: 3, interval: 1.5 },
      { type: 'runner', count: 14, interval: 0.3 },
      { type: 'shooter', count: 6, interval: 0.8 },
    ],
  },
];

// 1-based. Past the handcrafted levels, the last level repeats with more and faster enemies.
export function getLevel(n) {
  if (n <= LEVELS.length) return LEVELS[n - 1];
  const extra = n - LEVELS.length;
  const base = LEVELS[LEVELS.length - 1];
  return {
    name: `ENDLESS ${extra}`,
    maxAlive: Math.min(24, base.maxAlive + extra * 2),
    waves: base.waves.map((w) => ({
      ...w,
      count: Math.round(w.count * (1 + 0.25 * extra)),
      interval: Math.max(0.15, w.interval * Math.pow(0.92, extra)),
    })),
  };
}
