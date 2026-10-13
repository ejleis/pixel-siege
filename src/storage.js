const KEY = 'pixelSiege.highScore';

export function loadHighScore() {
  try {
    return parseInt(localStorage.getItem(KEY), 10) || 0;
  } catch {
    return 0;
  }
}

// Saves the score if it beats the stored high score.
export function recordScore(score) {
  const high = loadHighScore();
  if (score <= high) return { high, isNew: false };
  try {
    localStorage.setItem(KEY, String(score));
  } catch {
    // storage unavailable (private mode etc.) — ignore
  }
  return { high: score, isNew: true };
}
