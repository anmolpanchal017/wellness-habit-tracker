/**
 * Weighted wellness model (sums to 100).
 * Each habit: min(actual/target, 1) * weight (stress: full weight if met).
 */
export const HABIT_WEIGHTS = {
  water: 20,
  sleep: 20,
  activity: 20,
  meals: 15,
  screenBreak: 15,
  stressRelief: 10,
};

const HABIT_KEYS = ['water', 'sleep', 'activity', 'meals', 'screenBreak', 'stressRelief'];

export function effectiveTarget(goals, key) {
  let t = goals[key] ?? 1;
  if (key === 'sleep') return Math.max(0.5, t);
  if (key === 'stressRelief') return t;
  return Math.max(1, t);
}

export function habitRatio(actual, target, key) {
  const t = Math.max(target || 1, 0.0001);
  const a = Math.max(0, actual ?? 0);
  if (key === 'stressRelief') {
    const goalMet = a >= 1;
    return goalMet ? 1 : 0;
  }
  return Math.min(a / t, 1);
}

/**
 * @param {import('./storage.js').DayEntry} entry — may omit score (recomputed)
 * @param {import('./storage.js').Goals} goals
 */
export function computeDayScore(entry, goals) {
  const breakdown = {};
  let total = 0;

  for (const key of HABIT_KEYS) {
    const weight = HABIT_WEIGHTS[key];
    const target = effectiveTarget(goals, key);
    const actual = entry[key] ?? 0;
    const ratio = habitRatio(actual, target, key);
    const points = ratio * weight;
    breakdown[key] = {
      actual,
      target,
      ratio,
      points: Math.round(points * 100) / 100,
      maxPoints: weight,
    };
    total += points;
  }

  const score = Math.round(Math.min(100, Math.max(0, total)));
  return { score, breakdown };
}

export function scoreLabel(score) {
  if (score <= 39) return 'Needs attention';
  if (score <= 59) return 'Fair';
  if (score <= 79) return 'Good';
  return 'Excellent';
}

export function calendarColorForScore(score) {
  if (score == null || Number.isNaN(score)) return 'empty';
  if (score >= 80) return 'strong';
  if (score >= 50) return 'partial';
  return 'poor';
}

/** Consecutive days ending today where score >= threshold */
export function computeStreak(entries, threshold = 60, endDate = new Date()) {
  let streak = 0;
  const d = new Date(endDate);
  for (;;) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const key = `${y}-${m}-${day}`;
    const entry = entries[key];
    if (!entry || typeof entry.score !== 'number' || entry.score < threshold) break;
    streak += 1;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

/** Average completion ratio per habit over last 7 days (missing days = 0). */
export function weeklyHabitAverages(entries, goals, dates) {
  const avgs = {};
  for (const key of HABIT_KEYS) {
    let sum = 0;
    for (const date of dates) {
      const e = entries[date];
      if (!e) continue;
      const target = effectiveTarget(goals, key);
      sum += habitRatio(e[key], target, key);
    }
    avgs[key] = sum / dates.length;
  }
  return avgs;
}

export { HABIT_KEYS };
