# Delcom Blog — Frontend

React 18 + Vite SPA for public readers, authors, and administrators. Includes Toast UI Markdown editor/viewer, article CRUD, publication workflow, AI article generator with Search Engine context, and responsive light/dark UI.

## Requirements
Node.js 20+ and npm. Backend must be running at `http://localhost:8081`.

## Run
1. `npm install`
2. Copy `.env.example` to `.env` (default proxy is `/api`).
3. `npm run dev`
4. Open `http://localhost:5174`.

## Tests
`npm test` runs the Vitest suite.

## Build
`npm run build` creates the static SPA in `dist/`. Configure the static host fallback to `index.html` for client-side routes. Set `VITE_API_BASE_URL` to the deployed backend API origin plus `/api` when deploying separately.

## Routes
`/`, `/public`, `/posts/:slug`, `/login`, `/register`, `/author`, `/admin`.
