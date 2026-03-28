import React, { useState } from 'react';
import { DEFAULT_GOALS } from '../lib/storage.js';

const LABELS = {
  water: 'Water (glasses)',
  sleep: 'Sleep (hours)',
  activity: 'Activity (minutes)',
  meals: 'Meals per day',
  screenBreak: 'Screen breaks',
  stressRelief: 'Stress relief target (1)',
};

export default function Settings({
  goals,
  theme,
  onSaveGoals,
  onTheme,
  onReset,
  onLoadDemo,
}) {
  const [local, setLocal] = useState({ ...DEFAULT_GOALS, ...goals });

  function setField(key, value) {
    const n = Number(value);
    if (Number.isNaN(n) || n < 0) return;
    const max = key === 'sleep' ? 14 : key === 'meals' ? 6 : 999;
    setLocal((g) => ({ ...g, [key]: Math.min(max, Math.max(0, n)) }));
  }

  return (
    <section className="card" aria-labelledby="settings-title">
      <h2 id="settings-title">Settings</h2>
      <p style={{ marginTop: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        Edit goals, theme, or reset local data. Everything stays on this device.
      </p>

      <h3 style={{ fontSize: '0.95rem', margin: '1rem 0 0.5rem' }}>Goals</h3>
      {Object.keys(DEFAULT_GOALS).map((key) => (
        <div className="field" key={key}>
          <label htmlFor={`set-${key}`}>{LABELS[key]}</label>
          <input
            id={`set-${key}`}
            type="number"
            min={0}
            step={key === 'sleep' ? 0.5 : 1}
            value={local[key]}
            onChange={(e) => setField(key, e.target.value)}
          />
        </div>
      ))}
      <button type="button" className="btn-primary" onClick={() => onSaveGoals(local)}>
        Save goals
      </button>

      <h3 style={{ fontSize: '0.95rem', margin: '1.25rem 0 0.5rem' }}>Appearance</h3>
      <div className="toggle-row" style={{ marginBottom: '1rem' }}>
        <span style={{ fontWeight: 600 }}>Dark mode</span>
        <button
          type="button"
          className={`toggle ${theme === 'dark' ? 'on' : ''}`}
          aria-pressed={theme === 'dark'}
          onClick={() => onTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle dark mode"
        />
      </div>

      <button type="button" className="btn-secondary" onClick={onLoadDemo}>
        Load demo data (14+ days)
      </button>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.35rem 0 1rem' }}>
        Adds sample history so charts, streaks, and tips are visible for judges.
      </p>

      <button type="button" className="btn-secondary btn-danger" onClick={onReset}>
        Reset all data
      </button>
    </section>
  );
}
