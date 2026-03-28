import React, { useEffect, useState, useCallback } from 'react';
import Onboarding from './components/Onboarding.jsx';
import TodayDashboard from './components/TodayDashboard.jsx';
import WeeklyInsights from './components/WeeklyInsights.jsx';
import StreakCalendar from './components/StreakCalendar.jsx';
import Settings from './components/Settings.jsx';
import {
  loadState,
  saveState,
  createInitialState,
  clearAllStorage,
  todayISODate,
} from './lib/storage.js';
import { mergeDemoIntoState } from './lib/demoData.js';
import { computeDayScore } from './lib/scoring.js';

const NAV = [
  { id: 'onboarding', label: 'Goals', icon: '🎯' },
  { id: 'today', label: 'Today', icon: '☀️' },
  { id: 'weekly', label: 'Weekly', icon: '📈' },
  { id: 'streak', label: 'Streak', icon: '🔥' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

export default function App() {
  const [state, setState] = useState(() => {
    const loaded = loadState();
    return loaded || createInitialState();
  });
  const [section, setSection] = useState(() => {
    const loaded = loadState();
    if (loaded?.settings?.onboarded) return 'today';
    return 'onboarding';
  });

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    document.documentElement.dataset.theme = state.settings.theme;
  }, [state.settings.theme]);

  const updateToday = useCallback((entry) => {
    const date = todayISODate();
    setState((s) => ({
      ...s,
      entries: { ...s.entries, [date]: entry },
    }));
  }, []);

  const completeOnboarding = useCallback((goals) => {
    setState((s) => ({
      ...s,
      goals: { ...s.goals, ...goals },
      settings: { ...s.settings, onboarded: true },
    }));
    setSection('today');
  }, []);

  const skipOnboarding = useCallback(() => {
    setState((s) => ({
      ...s,
      settings: { ...s.settings, onboarded: true },
    }));
    setSection('today');
  }, []);

  const saveGoals = useCallback((goals) => {
    setState((s) => {
      const next = { ...s, goals: { ...s.goals, ...goals } };
      const date = todayISODate();
      const e = next.entries[date];
      if (e) {
        const sc = computeDayScore(
          {
            water: e.water,
            sleep: e.sleep,
            activity: e.activity,
            meals: e.meals,
            screenBreak: e.screenBreak,
            stressRelief: e.stressRelief,
          },
          next.goals
        );
        next.entries = { ...next.entries, [date]: { ...e, score: sc.score } };
      }
      return next;
    });
  }, []);

  function onTheme(t) {
    setState((s) => ({ ...s, settings: { ...s.settings, theme: t } }));
  }

  function onReset() {
    if (!window.confirm('Erase all wellness data on this device?')) return;
    clearAllStorage();
    setState(createInitialState());
    setSection('onboarding');
  }

  function onLoadDemo() {
    setState((s) => mergeDemoIntoState(s));
    setSection('weekly');
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Wellness Rhythm</h1>
        <p>Personal habit tracker · Your data stays on this device</p>
      </header>

      <main>
        {section === 'onboarding' && (
          <>
            {state.settings.onboarded ? (
              <section className="card">
                <h2>You’re set up</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                  Adjust targets anytime under Settings. Small steps count.
                </p>
                <ul style={{ paddingLeft: '1.2rem', color: 'var(--text)' }}>
                  <li>Water: {state.goals.water} glasses</li>
                  <li>Sleep: {state.goals.sleep} h</li>
                  <li>Activity: {state.goals.activity} min</li>
                  <li>Meals: {state.goals.meals}</li>
                  <li>Screen breaks: {state.goals.screenBreak}</li>
                  <li>Stress relief: {state.goals.stressRelief >= 1 ? 'Daily' : 'Off'}</li>
                </ul>
                <button type="button" className="btn-primary" onClick={() => setSection('settings')}>
                  Edit goals in Settings
                </button>
              </section>
            ) : (
              <Onboarding
                goals={state.goals}
                onSave={completeOnboarding}
                onSkip={skipOnboarding}
              />
            )}
          </>
        )}

        {section === 'today' && (
          <TodayDashboard goals={state.goals} entries={state.entries} onUpdateToday={updateToday} />
        )}

        {section === 'weekly' && (
          <WeeklyInsights entries={state.entries} goals={state.goals} />
        )}

        {section === 'streak' && <StreakCalendar entries={state.entries} />}

        {section === 'settings' && (
          <Settings
            goals={state.goals}
            theme={state.settings.theme}
            onSaveGoals={saveGoals}
            onTheme={onTheme}
            onReset={onReset}
            onLoadDemo={onLoadDemo}
          />
        )}
      </main>

      <nav className="bottom-nav" aria-label="Main">
        {NAV.map((item) => (
          <button
            key={item.id}
            type="button"
            className="nav-btn"
            aria-current={section === item.id ? 'page' : undefined}
            onClick={() => setSection(item.id)}
          >
            <span className="nav-icon" aria-hidden>
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
