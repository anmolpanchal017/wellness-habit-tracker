import React, { useState } from 'react';
import { getLastNDates } from '../lib/storage.js';
import { calendarColorForScore, computeStreak } from '../lib/scoring.js';

function formatShort(iso) {
  const [, m, d] = iso.split('-');
  return `${m}/${d}`;
}

export default function StreakCalendar({ entries, threshold = 60 }) {
  const dates = getLastNDates(7);
  const [selected, setSelected] = useState(null);
  const streak = computeStreak(entries, threshold);

  return (
    <section className="card" aria-labelledby="streak-title">
      <h2 id="streak-title">7-day streak</h2>
      <p style={{ margin: '0 0 0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        Current streak (score ≥ {threshold}): <strong style={{ color: 'var(--accent)' }}>{streak}</strong>{' '}
        {streak === 1 ? 'day' : 'days'} · Great job staying consistent.
      </p>
      <div className="streak-grid">
        {dates.map((iso) => {
          const e = entries[iso];
          const score = e?.score;
          const tier = calendarColorForScore(score);
          const label =
            tier === 'empty' ? 'No log' : tier === 'strong' ? 'Strong' : tier === 'partial' ? 'Partial' : 'Low';

          return (
            <button
              key={iso}
              type="button"
              className={`streak-cell ${tier}`}
              onClick={() => setSelected(iso)}
              aria-label={`${iso}, ${label}${score != null ? `, score ${score}` : ''}`}
            >
              <span>{formatShort(iso)}</span>
              <span style={{ fontSize: '0.55rem', opacity: 0.95, fontWeight: 600 }}>
                {score != null ? score : '—'}
              </span>
            </button>
          );
        })}
      </div>
      <div className="streak-legend">
        <span>
          <span className="dot" style={{ background: 'var(--cal-strong)' }} /> ≥80
        </span>
        <span>
          <span className="dot" style={{ background: 'var(--cal-partial)' }} /> 50–79
        </span>
        <span>
          <span className="dot" style={{ background: 'var(--cal-poor)' }} /> &lt;50
        </span>
        <span>
          <span className="dot" style={{ background: 'var(--cal-empty)' }} /> No entry
        </span>
      </div>
      {selected && (
        <div
          style={{
            marginTop: '1rem',
            padding: '0.85rem',
            background: 'var(--accent-soft)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.9rem',
          }}
        >
          <strong>{selected}</strong>
          {entries[selected] ? (
            <>
              {' · '}
              Score <strong>{entries[selected].score}</strong>
            </>
          ) : (
            <> — No entry for this day.</>
          )}
        </div>
      )}
    </section>
  );
}
