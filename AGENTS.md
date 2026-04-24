# Agent Instructions

These instructions apply to this repository.

## First Step

Read `overview.md` before making changes. Use it to understand how the app works, where state lives, how data flows, and which persisted storage keys must remain stable.

If the code and `overview.md` disagree, treat the code as the source of truth, then update `overview.md` as part of the same change when the difference is relevant to future work.

## Project Principles

- Keep the app a simple Vite + React frontend unless the user explicitly asks for a larger architecture change.
- Preserve the existing UI, styling, text, icons, spacing, and interaction flows unless the task specifically asks for a visual or product change.
- Avoid broad refactors. Most app behavior currently lives in `src/App.jsx`; make narrow edits that match the existing structure.
- Keep the browser-native async storage adapter intact unless the task explicitly requires storage work.
- Do not rename persisted localStorage keys without a deliberate migration plan.
- Do not add TypeScript, Tailwind, routing, server code, auth, databases, or extra tooling unless the user asks for it or it is strictly required.
- Keep `.gitignore` appropriate so `node_modules` and `dist` are not tracked.

## Important App Facts

- Entry point: `src/main.jsx`
- Main app: `src/App.jsx`
- App overview: `overview.md`
- Storage API: `storage.get(key, fallback)` and `storage.set(key, value)`
- Persisted keys: `library`, `history`, `favorites`, `restConfig`, `settings`, `homeCollapse`, `activePaletteId`, `customPalettes`
- App version source: `APP_VERSION` and `APP_VERSION_HISTORY` in `src/App.jsx`
- Standard build command: `npm run build`
- Vercel output directory: `dist`

## Version History Requirement

For every completed change, increment `APP_VERSION` in `src/App.jsx` and add a new first entry to `APP_VERSION_HISTORY`.

Each version history entry must include:

- the new version number
- the release date
- a short change type such as `Feature`, `Bug fix`, `UI`, `Maintenance`, or a brief combination
- concise descriptions of what changed

The home screen should show only the version number, not build-status text.

## Change Workflow

1. Inspect the current git status before editing.
2. Read the relevant code and `overview.md`.
3. Make the smallest change that satisfies the request.
4. Increment `APP_VERSION` and prepend an `APP_VERSION_HISTORY` entry for the completed change.
5. Update `overview.md` when app behavior, architecture, persistence, or data flow changes.
6. Run `npm run build` after code/config changes when dependencies are available.
7. Review `git diff` before committing.
8. Commit completed changes locally with a clear commit message and notes on what changed.

## Commit And Push Policy

After making requested changes, create a local commit.

After committing, ask the user whether they want to `push to origin`.

Only push if the user types exactly:

```text
push to origin
```

Do not push for any other wording. Do not add or change remotes unless the user explicitly asks.
