import React, { useState } from 'react';
import { DEFAULT_GOALS } from '../lib/storage.js';

const LABELS = {
  water: 'Glasses of water / day',
  sleep: 'Hours of sleep / night',
  activity: 'Active minutes / day',
  meals: 'Meals / day',
  screenBreak: 'Screen breaks / day',
  stressRelief: 'Stress relief (1 = track daily practice)',
};

export default function Onboarding({ goals, onSave, onSkip }) {
  const [local, setLocal] = useState({ ...DEFAULT_GOALS, ...goals });

  function setField(key, value) {
    const n = Number(value);
    if (Number.isNaN(n) || n < 0) return;
    const max = key === 'sleep' ? 14 : key === 'meals' ? 6 : 999;
    setLocal((g) => ({ ...g, [key]: Math.min(max, Math.max(0, n)) }));
  }

  return (
    <section className="card" aria-labelledby="onboard-title">
      <h2 id="onboard-title">Your daily rhythm</h2>
      <p style={{ marginTop: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        Set targets that feel realistic. You can change these anytime. Small steps count.
      </p>
      {Object.keys(DEFAULT_GOALS).map((key) => (
        <div className="field" key={key}>
          <label htmlFor={`goal-${key}`}>{LABELS[key]}</label>
          <input
            id={`goal-${key}`}
            type="number"
            min={0}
            max={key === 'sleep' ? 14 : key === 'meals' ? 6 : 99}
            step={key === 'sleep' ? 0.5 : 1}
            value={local[key]}
            onChange={(e) => setField(key, e.target.value)}
          />
        </div>
      ))}
      <button type="button" className="btn-primary" onClick={() => onSave(local)}>
        Save goals & start
      </button>
      <button
        type="button"
        className="btn-secondary"
        style={{ marginTop: '0.75rem' }}
        onClick={onSkip}
      >
        Use defaults only
      </button>
    </section>
  );
}
