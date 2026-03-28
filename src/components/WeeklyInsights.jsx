import React, { useMemo, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { getLastNDates } from '../lib/storage.js';
import { habitRatio, HABIT_KEYS, effectiveTarget } from '../lib/scoring.js';
import { getWeeklyTip, TIP_LABELS } from '../lib/tips.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const HABIT_CHART_LABELS = {
  water: 'Hydration %',
  sleep: 'Sleep %',
  activity: 'Activity %',
  meals: 'Meals %',
  screenBreak: 'Screen breaks %',
  stressRelief: 'Stress relief %',
};

export default function WeeklyInsights({ entries, goals }) {
  const dates = useMemo(() => getLastNDates(7), []);
  const [habitKey, setHabitKey] = useState('water');

  const labels = useMemo(() => dates.map((d) => d.slice(5).replace('-', '/')), [dates]);

  const wellnessSeries = dates.map((d) => {
    const e = entries[d];
    return e?.score ?? null;
  });

  const habitSeries = dates.map((d) => {
    const e = entries[d];
    if (!e) return null;
    const t = effectiveTarget(goals, habitKey);
    const r = habitRatio(e[habitKey], t, habitKey);
    return Math.round(r * 100);
  });

  const tip = useMemo(() => getWeeklyTip(entries, goals, dates), [entries, goals, dates]);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Wellness score',
        data: wellnessSeries,
        borderColor: 'rgb(45, 138, 110)',
        backgroundColor: 'rgba(45, 138, 110, 0.12)',
        fill: true,
        tension: 0.35,
        spanGaps: false,
        yAxisID: 'y',
      },
      {
        label: HABIT_CHART_LABELS[habitKey],
        data: habitSeries,
        borderColor: 'rgb(232, 168, 124)',
        backgroundColor: 'rgba(232, 168, 124, 0.08)',
        fill: true,
        tension: 0.35,
        spanGaps: false,
        yAxisID: 'y1',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } },
    },
    scales: {
      y: {
        type: 'linear',
        position: 'left',
        min: 0,
        max: 100,
        title: { display: true, text: 'Score' },
        grid: { color: 'rgba(0,0,0,0.06)' },
      },
      y1: {
        type: 'linear',
        position: 'right',
        min: 0,
        max: 100,
        grid: { drawOnChartArea: false },
        title: { display: true, text: 'Habit %' },
      },
      x: {
        grid: { display: false },
        ticks: { maxRotation: 0, font: { size: 10 } },
      },
    },
  };

  const hasAny = dates.some((d) => entries[d]);

  return (
    <section aria-labelledby="weekly-title">
      <div className="card">
        <h2 id="weekly-title">Weekly insights</h2>
        <p style={{ marginTop: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Last 7 days: wellness score and one habit trend. Let’s improve one habit this week.
        </p>
        {!hasAny ? (
          <p className="empty-hint">Log today or load demo data to see your chart.</p>
        ) : (
          <>
            <label htmlFor="habit-chart-select" className="field" style={{ marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Compare habit
              </span>
              <select
                id="habit-chart-select"
                value={habitKey}
                onChange={(e) => setHabitKey(e.target.value)}
                style={{
                  width: '100%',
                  marginTop: '0.35rem',
                  padding: '0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  fontSize: '1rem',
                }}
              >
                {HABIT_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {TIP_LABELS[k] || k}
                  </option>
                ))}
              </select>
            </label>
            <div className="chart-wrap">
              <Line data={chartData} options={options} />
            </div>
          </>
        )}
      </div>

      <div className="card" style={{ marginTop: '1rem' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>This week’s tip</h2>
        <div className="tip-box" role="status">
          {tip.habit && (
            <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Focus area: <strong>{TIP_LABELS[tip.habit]}</strong>
            </p>
          )}
          <p style={{ margin: 0 }}>{tip.message}</p>
        </div>
      </div>
    </section>
  );
}
