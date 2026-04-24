# Workout App

Minimal Vite + React setup for the existing workout app, ready for GitHub and Vercel deployment.

## Install

```bash
npm install
```

## Run locally

```bash
npm run dev
```

Vite will print a local URL, typically `http://localhost:5173`.

## Build

```bash
npm run build
```

The production build output is written to `dist/`.

## Push to GitHub

```bash
git init
git add .
git commit -m "Initial Vite app"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

If the repository already exists, skip the commands you do not need and push your current branch.

## Deploy to Vercel

1. Push the project to GitHub.
2. In Vercel, create a new project and import the GitHub repository.
3. Keep the default Vite settings:
   Build command: `npm run build`
   Output directory: `dist`
4. Deploy.

No server configuration is required because this is a standard static Vite frontend.
