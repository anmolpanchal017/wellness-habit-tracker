import React from 'react';
import { computeDayScore, scoreLabel } from '../lib/scoring.js';
import { todayISODate } from '../lib/storage.js';

const HABIT_COPY = {
  water: { title: 'Hydration', unit: 'glasses' },
  sleep: { title: 'Sleep', unit: 'hrs' },
  activity: { title: 'Physical activity', unit: 'min' },
  meals: { title: 'Meals', unit: 'meals' },
  screenBreak: { title: 'Screen breaks', unit: 'breaks' },
  stressRelief: { title: 'Stress relief', unit: '' },
};

function emptyEntry() {
  return {
    water: 0,
    sleep: 0,
    activity: 0,
    meals: 0,
    screenBreak: 0,
    stressRelief: 0,
  };
}

/** Derive breakfast/lunch/dinner from meal count vs goal (best-effort for display). */
function mealFlagsFromCount(count, goal) {
  const g = Math.min(3, Math.max(1, goal));
  const c = Math.min(g, Math.max(0, count));
  const order = ['breakfast', 'lunch', 'dinner'];
  const flags = { breakfast: false, lunch: false, dinner: false };
  for (let i = 0; i < g; i++) {
    flags[order[i]] = i < c;
  }
  return flags;
}

function countFromFlags(flags, goal) {
  const order = ['breakfast', 'lunch', 'dinner'].slice(0, Math.min(3, Math.max(1, goal)));
  return order.filter((k) => flags[k]).length;
}

export default function TodayDashboard({ goals, entries, onUpdateToday }) {
  const date = todayISODate();
  const base = entries[date] ? { ...emptyEntry(), ...entries[date] } : emptyEntry();
  const { score, breakdown } = computeDayScore(base, goals);
  const label = scoreLabel(score);

  const mealGoal = Math.min(3, Math.max(1, goals.meals || 3));
  const mealFlags = mealFlagsFromCount(base.meals, mealGoal);

  function patch(partial) {
    const next = { ...base, ...partial };
    const sc = computeDayScore(next, goals);
    onUpdateToday({ ...next, score: sc.score });
  }

  function setMealFlag(key, on) {
    const nextFlags = { ...mealFlags, [key]: on };
    const count = countFromFlags(nextFlags, mealGoal);
    patch({ meals: count });
  }

  function stepper(key, step = 1, maxOverride) {
    const max = maxOverride ?? goals[key] * 2 + 20;
    const val = base[key] ?? 0;
    return (
      <div className="stepper">
        <button
          type="button"
          aria-label={`Decrease ${HABIT_COPY[key].title}`}
          onClick={() => patch({ [key]: Math.max(0, val - step) })}
        >
          −
        </button>
        <span className="val" aria-live="polite">
          {key === 'sleep' ? val.toFixed(1) : val}
        </span>
        <button
          type="button"
          aria-label={`Increase ${HABIT_COPY[key].title}`}
          onClick={() => patch({ [key]: Math.min(max, val + step) })}
        >
          +
        </button>
      </div>
    );
  }

  function pctClass(ratio) {
    if (ratio >= 1) return 'done';
    if (ratio >= 0.5) return 'warn';
    return 'bad';
  }

  return (
    <>
      <div className="hero-score" role="status" aria-live="polite">
        <div className="score-num">{score}</div>
        <div className="score-label">Today’s wellness score</div>
        <div className="score-hint">{label} · You’re building a healthier rhythm.</div>
      </div>

      <section className="card" aria-labelledby="today-habits">
        <h2 id="today-habits">Today’s check-in</h2>
        <p style={{ marginTop: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          {date} · Tap to log — saves instantly.
        </p>

        {(['water', 'sleep', 'activity', 'meals', 'screenBreak', 'stressRelief']).map((key) => {
          const b = breakdown[key];
          const ratio = b.ratio;
          const pct = Math.round(ratio * 100);
          const copy = HABIT_COPY[key];

          return (
            <div className="habit-card" key={key}>
              <div className="habit-head">
                <span className="habit-name">{copy.title}</span>
                <span className="habit-meta">
                  {key === 'stressRelief' ? (
                    base.stressRelief >= 1 ? 'Done' : 'Not yet'
                  ) : (
                    <>
                      {key === 'sleep'
                        ? Number(base.sleep).toFixed(1)
                        : base[key]}{' '}
                      / {goals[key]} {copy.unit}
                    </>
                  )}
                  {' · '}
                  {pct}%
                </span>
              </div>
              <div
                className="progress-track"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={pct}
              >
                <div
                  className={`progress-fill ${pctClass(ratio)}`}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
              {key === 'water' && stepper('water', 1, 30)}
              {key === 'sleep' && (
                <div className="field" style={{ marginBottom: 0 }}>
                  <label htmlFor="sleep-range" className="sr-only">
                    Hours slept
                  </label>
                  <input
                    id="sleep-range"
                    type="range"
                    min={0}
                    max={12}
                    step={0.5}
                    value={Math.min(12, base.sleep)}
                    onChange={(e) => patch({ sleep: Number(e.target.value) })}
                  />
                  {stepper('sleep', 0.5, 12)}
                </div>
              )}
              {key === 'activity' && stepper('activity', 5, 300)}
              {key === 'meals' && (
                <div className="chips" role="group" aria-label="Meals eaten">
                  {['breakfast', 'lunch', 'dinner'].slice(0, mealGoal).map((m) => (
                    <button
                      key={m}
                      type="button"
                      className={`chip ${mealFlags[m] ? 'on' : ''}`}
                      onClick={() => setMealFlag(m, !mealFlags[m])}
                    >
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </button>
                  ))}
                </div>
              )}
              {key === 'screenBreak' && stepper('screenBreak', 1, 30)}
              {key === 'stressRelief' && (
                <div className="toggle-row">
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Practiced today?</span>
                  <button
                    type="button"
                    className={`toggle ${base.stressRelief >= 1 ? 'on' : ''}`}
                    aria-pressed={base.stressRelief >= 1}
                    onClick={() => patch({ stressRelief: base.stressRelief >= 1 ? 0 : 1 })}
                    aria-label="Toggle stress relief done"
                  />
                </div>
              )}
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Points: {b.points.toFixed(1)} / {b.maxPoints}
              </div>
            </div>
          );
        })}
      </section>
    </>
  );
}
