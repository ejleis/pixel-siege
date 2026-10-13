// Internal (pre-scaling) resolution. Everything in the game uses these units.
export const W = 320;
export const H = 180;

// Fixed simulation timestep.
export const STEP = 1 / 60;

// Area the player is clamped to (top margin leaves room for the HUD).
export const ARENA = { left: 6, top: 18, right: W - 6, bottom: H - 8 };
