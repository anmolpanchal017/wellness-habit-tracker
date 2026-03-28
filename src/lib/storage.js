/** Default daily targets for first-time users */
export const DEFAULT_GOALS = {
  water: 8,
  sleep: 8,
  activity: 30,
  meals: 3,
  screenBreak: 5,
  stressRelief: 1,
};

const STORAGE_KEY = 'wellnessRhythm_v1';

/** @typedef {{ water: number, sleep: number, activity: number, meals: number, screenBreak: number, stressRelief: number }} Goals */
/** @typedef {{ water: number, sleep: number, activity: number, meals: number, screenBreak: number, stressRelief: number, score: number }} DayEntry */

/**
 * Full persisted shape:
 * { goals, entries: { "YYYY-MM-DD": DayEntry }, settings: { theme, onboarded } }
 */
export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return normalizeState(data);
  } catch {
    return null;
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeState(state)));
}

function normalizeState(data) {
  const goals = { ...DEFAULT_GOALS, ...(data.goals || {}) };
  const entries = typeof data.entries === 'object' && data.entries ? data.entries : {};
  const settings = {
    theme: data.settings?.theme === 'dark' ? 'dark' : 'light',
    onboarded: Boolean(data.settings?.onboarded),
  };
  return { goals, entries, settings };
}

export function createInitialState() {
  return {
    goals: { ...DEFAULT_GOALS },
    entries: {},
    settings: { theme: 'light', onboarded: false },
  };
}

export function clearAllStorage() {
  localStorage.removeItem(STORAGE_KEY);
}

export function todayISODate() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Last N calendar days ending today, oldest first */
export function getLastNDates(n, endDate = new Date()) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(endDate);
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    out.push(`${y}-${m}-${day}`);
  }
  return out;
}
