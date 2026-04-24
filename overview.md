# Workout App Overview

This is a Vite + React single-page workout builder. The app is intentionally compact: almost all product logic, UI components, state, persistence, and styling live in `src/App.jsx`, with `src/main.jsx` only mounting the root React component.

Use this document as the first orientation point for future sessions. Keep it current when app structure, data flow, persisted data, or user-facing workflows change.

## Current Status

- The app builds as a static Vite frontend and is suitable for Vercel deployment.
- Runtime dependencies are React, ReactDOM, and `lucide-react`.
- There is no server, auth, database, routing library, Tailwind setup, TypeScript setup, or external storage service.
- Persistence is browser-native `localStorage`, wrapped by an async adapter so the rest of the app can call `storage.get(key, fallback)` and `storage.set(key, value)`.
- The visual system is inline-style driven inside React components, with global font/import/keyframe rules injected by `GlobalStyles`.
- The app background is currently fixed to solid `#0E0E0E`; palette selection still controls surface, foreground, accent, secondary accent, and warning colors. The document, body, root, and mobile browser theme color also use `#0E0E0E` so safe areas and overscroll regions blend with the app. Screen containers use dynamic viewport height (`100dvh`) so short pages fit the visible mobile viewport without unnecessary page scroll. Screen headers add `env(safe-area-inset-top)` to their normal top spacing so iPhone status areas do not overlap controls.
- The visible app version is controlled by `APP_VERSION` in `src/App.jsx`, and Settings exposes `APP_VERSION_HISTORY` so users can see released changes from version 2.1 onward.

## Project Structure

```text
.
├── index.html
├── package.json
├── package-lock.json
├── README.md
├── vite.config.js
└── src
    ├── App.jsx
    └── main.jsx
```

`src/main.jsx` imports `App.jsx` and renders it into `#root`.

`src/App.jsx` contains:

- Default exercise data and constants
- Storage adapter
- Workout setup flow state
- Screen rendering
- Home, history, favorites, color settings, exercise, mode, rest, active workout, and done screens
- Settings modal controls, including app version history
- Queue-generation logic
- Inline styling and global style injection

## Main User Flow

The app is screen-state driven. The top-level `WorkoutApp` component stores the current screen in `screen` and conditionally renders one view at a time.

Primary flow:

1. `home`
2. `categories`
3. `exercises`
4. `mode`
5. `rest`
6. `active`
7. `done`

Secondary screens:

- `history`
- `favorites`
- `colorSettings`

The home screen can start a new workout, rerun recent workouts, rerun favorites, open history, open favorites, and open settings/color controls.

The settings modal includes app preferences, color customization, and an app version history view. The home header displays only the current app version.

## Core State

Top-level state in `WorkoutApp` is the app's source of truth during a session:

- `library`: full exercise library, including default and custom exercises
- `selectedCategories`: chosen muscle groups
- `selectedModifiers`: enabled equipment modifiers
- `selectedExercises`: selected workout exercises
- `mode`: selected workout format
- `modeConfig`: per-mode config such as sets, superset size, reps, and manual queue
- `restConfig`: rest behavior and durations
- `queue`: generated active-workout queue
- `queueIdx`: current queue position
- `history`: completed workout sessions
- `favorites`: saved workout templates
- `settings`: app settings, currently `rememberSectionState`
- `activePaletteId` and `customPalettes`: palette selection and custom palette data

Most child components receive state and callbacks through props rather than owning shared app state themselves.

## Persistence

The `storage` object in `src/App.jsx` provides async methods:

- `storage.get(key, fallback)`
- `storage.set(key, value)`

It uses `window.localStorage` internally and safely falls back when storage is unavailable, empty, or contains corrupted JSON.

Persisted keys:

- `library`
- `history`
- `favorites`
- `restConfig`
- `settings`
- `homeCollapse`
- `activePaletteId`
- `customPalettes`

Do not rename these keys without a deliberate migration plan. Existing user data depends on them.

Hydration happens once on app load. Follow-up `useEffect` calls persist changes back to localStorage. Persisted write-back is guarded until initial reads complete so default in-memory state cannot overwrite saved library, history, favorites, rest settings, app settings, palette, or home collapse data during startup.

## Workout Logic

Workout setup starts with categories and equipment modifiers. Categories choose upper, lower, and/or core groups. Modifiers unlock weighted and pull-up-bar exercises in the exercise picker.

Exercises can be manually selected, randomly selected per category, or added as custom exercises. Custom exercises are stored in `library`, so they persist with the rest of the exercise library.

The selected mode determines how `buildQueue(exercises, mode, cfg)` expands selected exercises into active workout items:

- `focus`: complete all sets of one exercise before moving to the next
- `circuit`: loop through all selected exercises for each round
- `superset`: group exercises by `supersetSize`, repeat each group for configured sets
- `addon`: round 1 includes exercise 1, round 2 includes exercises 1 and 2, and so on
- `manual`: use the user-edited `modeConfig.manualQueue`

Each queue item carries enough display data for the active workout: exercise id/name, reps or seconds, unit, equipment, round/set metadata, total set count, and a `positionLabel` used to show the current set/round/group with totals.

The active workout preview derives an upcoming timeline from the queue at render time. The persisted queue remains exercise-only, but the preview inserts long-rest markers for interval workouts when the rest would occur after a future exercise. Short rests are intentionally omitted from this preview.

## Active Workout Behavior

`ActiveWorkout` owns the live workout phase:

- `phase`: `exercise` or `rest`
- `restRemaining`: countdown time during rest
- `elapsed`: total elapsed workout time
- `menuOpen`: active workout menu state

Completing a set either advances immediately, starts a rest timer, or finishes the workout depending on position and `restConfig`.

Rest modes:

- `none`: skip rest entirely
- `fixed`: use the short rest duration
- `interval`: use short rest normally and long rest every `longEvery` sets

Completing the final item writes a workout entry into `history` and moves to `done`.

Exercise, short-rest, and long-rest views all show the primary next exercise plus a smaller upcoming preview when space allows. The smaller rows are measured against the remaining active content area so they fill available space without making the screen scroll.

## Favorites And History

History stores completed workouts, capped to the latest 100 entries.

Favorites are saved workout entries with a user-facing name and `favId`. Matching is based on a generated workout signature:

- mode
- ordered exercise IDs
- per-exercise rep configuration

That means favorites are treated as workout templates, not only as references to history items.

## Visual Design

The app uses a dark, high-contrast workout aesthetic with inline styles and lucide icons. The active workout screen also defines desktop-only CSS variables in `GlobalStyles` to enlarge the exercise readout on wide screens without changing the primary action button or the up-next card sizing. Typography is loaded in `GlobalStyles` from Google Fonts:

- Archivo Black
- JetBrains Mono
- Bebas Neue

Palette selection controls app CSS variables, but the app background is intentionally fixed to `#0E0E0E`.

Avoid visual redesigns unless explicitly requested. Preserve copy, spacing, colors, icons, and interaction flows for behavior-focused changes.

## Build And Deployment

Common commands:

```bash
npm install
npm run dev
npm run build
npm run preview
```

Vercel should use:

- Build command: `npm run build`
- Output directory: `dist`

`node_modules` and `dist` should remain untracked.

## Future Change Guidance

When adding or changing behavior:

- Prefer focused edits in `src/App.jsx` unless the project is intentionally being split into modules.
- Increment `APP_VERSION` and prepend an `APP_VERSION_HISTORY` entry for every completed change.
- Preserve the storage API and persisted keys unless a migration is part of the task.
- Keep the app usable as a static frontend.
- Run `npm run build` before committing code changes when dependencies are installed.
- Update this `overview.md` when data flow, workflows, persistence, or architecture changes.
