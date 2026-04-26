# Workout App Overview

This is a Vite + React single-page workout builder. The app is intentionally compact: almost all product logic, UI components, state, persistence, and styling live in `src/App.jsx`, with `src/main.jsx` only mounting the root React component.

Use this document as the first orientation point for future sessions. Keep it current when app structure, data flow, persisted data, or user-facing workflows change.

## Current Status

- The app builds as a static Vite frontend and is suitable for Vercel deployment.
- Runtime dependencies are React, ReactDOM, and `lucide-react`.
- There is no server, auth, database, routing library, Tailwind setup, TypeScript setup, or external storage service.
- Persistence is browser-native `localStorage`, wrapped by an async adapter so the rest of the app can call `storage.get(key, fallback)` and `storage.set(key, value)`.
- The visual system is inline-style driven inside React components, with global font/import/keyframe rules injected by `GlobalStyles`.
- Palette selection controls the app background, surfaces, foreground, accent, secondary accent, warning color, and derived readable text/border colors. The selected background is also applied to the document, body, root, and mobile browser theme color so safe areas and overscroll regions blend with the app on mobile. Screen containers use dynamic viewport height (`100dvh`) so short pages fit the visible mobile viewport without unnecessary page scroll. Screen headers add `env(safe-area-inset-top)` to their normal top spacing so iPhone status areas do not overlap controls.
- The visible app version is controlled by `APP_VERSION` in `src/App.jsx`, and Settings exposes `APP_VERSION_HISTORY` so users can see released changes from version 2.1 onward.

## Project Structure

```text
.
├── index.html
├── package.json
├── package-lock.json
├── README.md
├── support files
│   ├── Images
│   │   └── ios_how_to_add_to_homescreen.gif
│   └── workout_exercise_library.csv
├── vite.config.js
└── src
    ├── App.jsx
    └── main.jsx
```

`src/main.jsx` imports `App.jsx` and renders it into `#root`.

`src/App.jsx` contains:

- CSV-backed default exercise parsing and constants
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

The home screen can start a new workout, rerun recent workouts, rerun favorites, open history, open favorites, and open settings/color controls. On first launch for iOS or ambiguous mobile devices, the home screen shows a one-time blurred welcome prompt that points users to Settings for Home Screen bookmark setup.

Rainbow Mode is activated by a hidden secret action on the home title. Each tap on that title gives the words a slight tactile shake. Activation fades in `Kikis, this is for you`, waits for that message to fade away, then shows an oversized `RAINBOW MODE ACTIVATED` message as the animated rainbow background starts; the same hidden secret action disables it and fades in `rainbow mode deactivated`. This mode is intentionally separate from palette selection and has no visible control.

The settings modal includes app preferences, color customization, an iOS Home Screen install guide, a feedback/issues email panel, and an app version history view. The feedback panel uses `FEEDBACK_EMAIL_ADDRESS` in `src/App.jsx` as its single email source, offers a `mailto:` action that opens the user's email app, and provides a copy-email button. It closes only from explicit in-modal controls so backdrop clicks or mobile viewport retargeting cannot accidentally dismiss it. The home header displays only the current app version.

The color customization screen shows preset and custom palette cards as full-card touch targets. Active palette cards use a separated static double-stroke highlight that is reserved inside each card slot so the active state does not overlap neighboring cards.

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
- `history`: completed workout sessions and resumable partial workout entries
- `favorites`: saved workout templates
- `settings`: app settings, currently `rememberSectionState` and `homeScreenPromptSeen`
- `activePaletteId` and `customPalettes`: palette selection and custom palette data
- `rainbowModeActive`: hidden animated rainbow background mode, toggled from the home title

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
- `rainbowModeActive`

Do not rename these keys without a deliberate migration plan. Existing user data depends on them.

Hydration happens once on app load. The default library is built from `support files/workout_exercise_library.csv`, then merged with the saved `library` value so new default exercises and metadata are added without removing custom exercises. Default rows removed from the CSV are not restored from saved non-custom library entries, so the CSV remains the source of truth for bundled exercises. Follow-up `useEffect` calls persist changes back to localStorage. Persisted write-back is guarded until initial reads complete so default in-memory state cannot overwrite saved library, history, favorites, rest settings, app settings, palette, rainbow mode, or home collapse data during startup.

## Workout Logic

Workout setup starts with categories and equipment modifiers. Categories choose upper, lower, and/or core groups. Modifiers unlock dumbbell and bar exercises in the exercise picker.

Exercises can be manually selected, randomly selected per category, or added as custom exercises. Custom exercises are stored in `library`, so they persist with the rest of the exercise library.

CSV exercise metadata includes body section, equipment type, exercise group, difficulty, direct source URL, and description. In the picker, exercise groups with multiple variants show only the primary exercise by default; its Alternatives/Hide control reveals or collapses the other variants in that group. Standalone exercises with advanced difficulty and no exercise group are hidden behind section-and-equipment Advanced/Hide controls, such as advanced upper body weight or advanced lower dumbbell. Each category random picker also has a Show All Alternatives/Hide All Alternatives control when grouped variants or advanced rows are available; it opens or closes every grouped alternative and standalone advanced bucket for that section. Revealed rows use a slightly lighter background so they remain visually associated with the dropdown that exposed them. Random category picks use the currently visible exercise pool, so hidden variants and advanced rows are only eligible after being expanded.

Default exercises with details show a small info icon in selection, setup details, workout info, and the active workout. Pressing it opens an in-app description window with Back and More Details actions; More Details opens the source URL in a new tab/window. Custom exercises do not show this icon unless they later gain source or description metadata.

Settings includes an iOS-only Add to Home Screen guide that imports `support files/Images/ios_how_to_add_to_homescreen.gif` as a Vite asset and shows it in a full-screen walkthrough. A one-time iOS/mobile welcome prompt points users to the Settings button and stores its dismissed state as `homeScreenPromptSeen` inside the persisted `settings` object. The guide also links to an optional iOS Shortcut for custom Home Screen bookmark images and explains the Safari share-sheet flow for running that shortcut before adding the bookmark. Android users are directed to their own browser/device install instructions.

The Format step includes a draggable exercise order list. While dragging, the current replacement target is shown with a full-row accent outline and glow rather than only a divider line.

The selected mode determines how `buildQueue(exercises, mode, cfg)` expands selected exercises into active workout items:

- `focus`: complete all sets of one exercise before moving to the next
- `circuit`: loop through all selected exercises for each round
- `superset`: group exercises by `supersetSize`, repeat each group for configured sets
- `addon`: round 1 includes exercise 1, round 2 includes exercises 1 and 2, and so on
- `manual`: use the user-edited `modeConfig.manualQueue`

Each queue item carries enough display data for the active workout: exercise id/name, reps or seconds, unit, equipment, source URL and description metadata, round/set metadata, total set count, and a `positionLabel` used to show the current set/round/group with totals.

The active workout preview derives an upcoming timeline from the queue at render time. The persisted queue remains exercise-only, but the preview inserts long-rest markers for interval workouts when the rest would occur after a future exercise. Short rests are intentionally omitted from this preview.

## Active Workout Behavior

`ActiveWorkout` owns the live workout phase:

- `phase`: `exercise` or `rest`
- `restRemaining`: countdown time during rest
- `elapsed`: total elapsed workout time
- `menuOpen`: active workout menu state

Completing a set either advances immediately, starts a rest timer, or finishes the workout depending on position and `restConfig`.

Editing a current workout opens the normal setup stages with the current selections intact. The app records the active queue position and elapsed time before leaving the active screen. At the rest-settings step, `Continue` rebuilds the queue and resumes at the saved position, clamped to the rebuilt queue length, while preserving elapsed time. `Start Over` rebuilds the edited workout from the beginning with a fresh timer.

Rest modes:

- `none`: skip rest entirely
- `fixed`: use the short rest duration
- `interval`: use short rest normally and long rest every `longEvery` sets

Quitting an active workout writes or updates a partial entry in `history` with the current queue index, phase, elapsed time, and any remaining rest time, then returns home. Partial entries use the same persisted `history` key, are marked as partial in History, and can be continued from the saved position or started over. The app deduplicates partial entries by workout structure so quitting the same workout repeatedly updates the latest partial instead of adding duplicates. Completing that workout later removes the matching partial entry and writes the normal completed entry.

Completing the final item writes a completed workout entry into `history` and moves to `done`.

Exercise, short-rest, and long-rest views all show the primary next exercise plus a smaller upcoming preview when space allows. The smaller rows are measured against the remaining active content area so they fill available space without making the screen scroll. Up-next rows use a compact grid with fixed tag and value columns so reps and rest times stay near the names and line up vertically on wide screens.

## Favorites And History

History stores completed and partial workouts, capped to the latest 100 entries. Home's recent-completed section filters out partial entries, so partial workouts appear only in History until they are completed.

Favorites are saved workout entries with a user-facing name and `favId`. New favorites are appended to the bottom of the saved list by default. The favorite naming modal closes only through its Save and Cancel controls so mobile keyboard or viewport shifts cannot accidentally dismiss an in-progress name. The Home favorites dropdown shows the top five favorites in persisted order and links to the full Favorites screen. The Favorites screen renders the full persisted order with drag handles, a full-row replacement target highlight while dragging, rename controls, and a two-step delete confirmation.

Favorite matching is based on a generated workout signature:

- mode
- ordered exercise IDs
- per-exercise rep configuration

That means favorites are treated as workout templates, not only as references to history items.

## Visual Design

The app uses a palette-driven workout aesthetic with inline styles and lucide icons. The active workout screen also defines desktop-only CSS variables in `GlobalStyles` to enlarge the exercise readout on wide screens without changing the primary action button or the up-next card sizing. Typography is loaded in `GlobalStyles` from Google Fonts:

- Archivo Black
- JetBrains Mono
- Bebas Neue

Palette selection controls app CSS variables for background, surface, text, accent, secondary accent, warning, derived muted text, borders, and readable text-on-accent colors. These variables are applied both on the app wrapper and `document.documentElement` so fixed overlays, mobile safe areas, and overscroll regions use the active palette. Rainbow Mode preserves the saved selected palette data, but temporarily replaces the active CSS variables with a dedicated vibrant readable UI palette, pulses the primary accent through bright party colors with dark text-on-accent for readability, keeps document/root backgrounds static, renders one fixed animated rainbow background layer behind the app, and renders a slow floating multicolor confetti layer behind the app content. The confetti listens for pointer and touch movement while Rainbow Mode is active so nearby pieces repel away from the cursor or a dragged finger. Turning Rainbow Mode off restores the selected palette variables and removes the background/confetti layers.

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
- Follow `AGENTS.md` for version history updates; local commits stay unreleased until an approved push rolls them into one version bump.
- Preserve the storage API and persisted keys unless a migration is part of the task.
- Keep the app usable as a static frontend.
- Run `npm run build` before committing code changes when dependencies are installed.
- Update this `overview.md` when data flow, workflows, persistence, or architecture changes.
