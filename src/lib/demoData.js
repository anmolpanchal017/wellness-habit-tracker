import { computeDayScore } from './scoring.js';
import { DEFAULT_GOALS } from './storage.js';

/** Seeded pseudo-random for reproducible demo */
function seededNoise(seed, i) {
  const x = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Builds 14+ days of entries ending today for demo charts, streaks, and tips.
 */
export function generateDemoEntries(goals, daysBack = 15) {
  const end = new Date();
  const entries = {};
  const seed = 42;

  // Include today (i = 0) so streaks and the 7-day grid feel complete for demos.
  for (let i = daysBack; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const key = `${y}-${m}-${day}`;

    const n = seededNoise(seed, i);
    const wave = Math.sin(i / 2.5) * 0.15;

    const water = Math.round(
      Math.min(goals.water, Math.max(0, goals.water * (0.55 + n * 0.5 + wave)))
    );
    const sleepRaw = Math.min(
      goals.sleep,
      Math.max(0, goals.sleep * (0.65 + seededNoise(seed, i + 10) * 0.45 + wave))
    );
    const sleep = Math.round(sleepRaw * 10) / 10;
    const activity = Math.round(
      Math.min(goals.activity, Math.max(0, goals.activity * (0.4 + seededNoise(seed, i + 20) * 0.65)))
    );
    const meals = Math.min(
      goals.meals,
      Math.max(0, Math.round(goals.meals * (0.5 + seededNoise(seed, i + 30) * 0.55)))
    );
    const screenBreak = Math.round(
      Math.min(goals.screenBreak, Math.max(0, goals.screenBreak * (0.35 + seededNoise(seed, i + 40) * 0.7)))
    );
    const stressRelief = seededNoise(seed, i + 50) > 0.35 ? 1 : 0;

    const raw = { water, sleep, activity, meals, screenBreak, stressRelief };
    const { score } = computeDayScore(raw, goals);
    entries[key] = { ...raw, score };
  }

  return entries;
}

export function mergeDemoIntoState(state) {
  const goals = { ...DEFAULT_GOALS, ...state.goals };
  const demo = generateDemoEntries(goals);
  return {
    ...state,
    goals,
    // User entries override demo for the same date (keeps today’s real check-in if any).
    entries: { ...demo, ...state.entries },
    settings: { ...state.settings, onboarded: true },
  };
}
