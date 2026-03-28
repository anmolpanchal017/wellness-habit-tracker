# Wellness Rhythm — Personal Health Habit Tracker

A **mobile-first**, **offline-friendly** (static) web app for students and young adults to track six daily wellness habits, see a **0–100 Wellness Score**, a **7-day streak calendar**, **weekly charts**, and a **rule-based encouragement tip**. No login, no backend, no wearables — data lives in **browser `localStorage` only**.

---

## Problem statement (summary)

Young people need a **low-friction**, **non-clinical** way to build consistent health habits. This MVP focuses on **encouragement and clarity**: one-tap check-ins, instant scoring, and gentle copy (“Small steps count.”) instead of medical dashboards.

---

## Features

| Area | What you get |
|------|----------------|
| **Goal setup** | Editable daily targets for water, sleep, activity, meals, screen breaks, stress relief; sensible defaults. |
| **Today** | Quick steppers, slider (sleep), meal chips, stress toggle; progress bars, %, and points per habit. |
| **Wellness score** | Weighted 0–100 score with label (Needs attention → Excellent) and per-habit point contribution. |
| **7-day streak grid** | Color by score (green / amber / red / gray); tap a day for detail; **streak** = consecutive days with score **≥ 60**. |
| **Weekly insights** | Chart.js line chart: wellness trend + selectable habit completion % (0–100). |
| **Weekly tip** | **Deterministic** message based on the **lowest average habit** over the last 7 days. |
| **Settings** | Edit goals, dark mode, **Load demo data** (16 days), **Reset all data**. |
| **Persistence** | All state in `localStorage` under key `wellnessRhythm_v1`. |

---

## Scoring logic

Weights (sum **100**):

| Habit | Weight |
|-------|--------|
| Hydration (water) | 20 |
| Sleep | 20 |
| Physical activity | 20 |
| Meals | 15 |
| Screen breaks | 15 |
| Stress relief | 10 |

For each **numeric** habit:

\[
\text{habit\_points} = \min(\text{actual} / \text{target}, 1) \times \text{weight}
\]

**Stress relief** is treated as **binary**: full **10** points if `actual ≥ 1`, else **0**.

**Daily Wellness Score** = round(sum of habit points), clamped to **0–100**.

**Labels:**

- **0–39** — Needs attention  
- **40–59** — Fair  
- **60–79** — Good  
- **80–100** — Excellent  

Implementation: `src/lib/scoring.js`.

---

## How weekly tips are generated

Tips are **not AI-generated**. Steps:

1. For each of the **last 7 calendar days**, compute each habit’s **completion ratio** (same rules as scoring: proportional to target, stress binary).
2. Average each habit’s ratio over those **7** days (days with **no entry** contribute **0** for that habit’s sum, then divide by 7).
3. Pick the habit with the **lowest** average. Map it to a **fixed string** from `src/lib/tips.js` (e.g. weak hydration → water bottle / meal pairing advice).
4. If **every** habit’s average is **≥ 0.85**, show a single **“all strong”** encouragement message instead.

Changing which habit is weakest changes the tip — fully reproducible for judges.

---

## `localStorage` schema

Key: **`wellnessRhythm_v1`**

```json
{
  "goals": {
    "water": 8,
    "sleep": 8,
    "activity": 30,
    "meals": 3,
    "screenBreak": 5,
    "stressRelief": 1
  },
  "entries": {
    "2026-03-28": {
      "water": 6,
      "sleep": 7,
      "activity": 20,
      "meals": 3,
      "screenBreak": 4,
      "stressRelief": 1,
      "score": 72
    }
  },
  "settings": {
    "theme": "light",
    "onboarded": true
  }
}
```

- **`entries`** keys are ISO dates `YYYY-MM-DD` in the **user’s local timezone** (via `todayISODate()` in `src/lib/storage.js`).
- Each entry stores raw habit values plus cached **`score`** (recomputed when goals or values change).

---

## Project structure

```
health/
├── index.html
├── package.json
├── vite.config.js
├── README.md
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── index.css
│   ├── components/
│   │   ├── Onboarding.jsx
│   │   ├── TodayDashboard.jsx
│   │   ├── WeeklyInsights.jsx
│   │   ├── StreakCalendar.jsx
│   │   └── Settings.jsx
│   └── lib/
│       ├── storage.js      # load/save, defaults, date helpers
│       ├── scoring.js      # weights, daily score, streak, weekly averages
│       ├── tips.js         # rule-based weekly tip copy
│       └── demoData.js     # seeded 16-day demo history
└── dist/                   # after `npm run build`
```

---

## Setup

**Requirements:** Node.js 18+ recommended.

```bash
cd health
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

**Production build:**

```bash
npm run build
npm run preview
```

Output is in **`dist/`** — static files only.

---

## Deployment

Deploy **`dist/`** to any static host:

- [Vercel](https://vercel.com): import repo, framework “Vite”, build `npm run build`, output `dist`.
- [Netlify](https://www.netlify.com): build command `npm run build`, publish directory `dist`.
- [GitHub Pages](https://pages.github.com): use `base: './'` in `vite.config.js` (already set) and upload `dist` contents.

**Live demo (placeholder):**  
`https://YOUR_USERNAME.github.io/wellness-rhythm/` — replace after you deploy.

The app has **no backend**; hosting is just static files. After the first successful load, the browser may cache assets; **habit data** is always in **`localStorage`** on that origin.

---

## Screenshots

_Add 2–3 mobile screenshots here after deployment (Today score, 7-day streak, Weekly chart + tip)._

---

## Demo data

**Settings → Load demo data** merges **16 days** of realistic entries (including **today**) using a small deterministic PRNG in `src/lib/demoData.js`. Existing **user entries override** demo for the same date so a real **today** check-in is preserved.

---

## Tech stack

- **React 18** + **Vite 6**
- **Chart.js** + **react-chartjs-2**
- **Plain CSS** (mobile-first, CSS variables, light/dark)

---

## License

Hackathon / educational use — adjust as needed for your submission.
