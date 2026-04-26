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

Do not increment `APP_VERSION` or add `APP_VERSION_HISTORY` entries for each local commit.

Treat local commits as unreleased work until the user explicitly approves a push by typing exactly `push to origin`. When preparing that approved push, increment `APP_VERSION` once and prepend one new first entry to `APP_VERSION_HISTORY` that summarizes all local commits that will be pushed to origin.

If there are multiple local commits waiting to be pushed, they must be combined into a single version-history entry for that push. For example, ten local commits before one approved push should produce one app version bump and one summarized update-history entry, not ten version bumps.

If there are no local commits to push, do not increment the app version.

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
4. Update `overview.md` when app behavior, architecture, persistence, or data flow changes.
5. Run `npm run build` after code/config changes when dependencies are available.
6. Review `git diff` before committing.
7. Commit completed changes locally with a clear commit message and notes on what changed.

## Commit And Push Policy

After making requested changes, create a local commit.

After committing, ask the user whether they want to `push to origin`.

Only push if the user types exactly:

```text
push to origin
```

Do not push for any other wording. Do not add or change remotes unless the user explicitly asks.

When the user types exactly `push to origin`, prepare the release version bump before pushing:

1. Inspect the commits that are local and not yet on origin for the current branch.
2. Increment `APP_VERSION` in `src/App.jsx` by one version number.
3. Add one new first entry to `APP_VERSION_HISTORY` summarizing the local commits included in the push.
4. Run `npm run build` after code/config changes when dependencies are available.
5. Review `git diff`.
6. Commit the version/history update locally.
7. Push the branch to origin.
