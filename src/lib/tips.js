import { HABIT_KEYS, weeklyHabitAverages } from './scoring.js';

const TIPS = {
  sleep:
    'You slept below your target most days this week. Try setting a fixed bedtime 30 minutes earlier.',
  water:
    'Hydration was your lowest habit this week. Keep a water bottle nearby and aim for one glass after every meal.',
  screenBreak:
    'You took fewer screen breaks than planned. Try a timer every 60 minutes.',
  stressRelief:
    'Stress relief was missed often this week. Try 5 minutes of breathing or a short walk.',
  meals:
    'Meal consistency dropped this week. Plan meal times in advance to avoid skipping.',
  activity:
    'Activity fell short this week. Start with a 10-minute walk after class or work.',
};

const ALL_STRONG =
  'Great job staying consistent. You’re building a healthier rhythm — small steps count.';

/**
 * Deterministic weekly tip from lowest average habit completion (last 7 days).
 */
export function getWeeklyTip(entries, goals, dates) {
  const avgs = weeklyHabitAverages(entries, goals, dates);
  const keysWithData = dates.some((d) => entries[d]);
  if (!keysWithData) {
    return {
      habit: null,
      message: 'Log a few days this week to get a personalized tip. Small steps count.',
    };
  }

  let minKey = HABIT_KEYS[0];
  let minVal = avgs[minKey];
  for (const k of HABIT_KEYS) {
    if (avgs[k] < minVal) {
      minVal = avgs[k];
      minKey = k;
    }
  }

  const allStrong = HABIT_KEYS.every((k) => avgs[k] >= 0.85);
  if (allStrong) {
    return { habit: null, message: ALL_STRONG };
  }

  return { habit: minKey, message: TIPS[minKey] || ALL_STRONG };
}

export const TIP_LABELS = {
  sleep: 'Sleep',
  water: 'Hydration',
  screenBreak: 'Screen breaks',
  stressRelief: 'Stress relief',
  meals: 'Meals',
  activity: 'Physical activity',
};
