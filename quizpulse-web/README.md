# QuizPulse Web

Official **web frontend** for [QuizPulse](../README.md): a React + TypeScript app (Vite, React Router, Axios, Zustand) that talks to the QuizPulse API over HTTP and WebSocket.

## Prerequisites

- **Node.js 20+**
- **npm** (ships with Node; this package uses `npm` scripts)
- **QuizPulse API** running locally (see the [backend README](../README.md)) — default `http://localhost:3333/api/v1`

## Exact setup — start the frontend

Run these from your machine; paths assume the API repo is checked out as `quizpulse-api` with this app in `quizpulse-api/quizpulse-web`.

### 1. Start PostgreSQL and Redis

The API will not run without them. Follow [../README.md](../README.md) (system services + `.env` + migrations + seed).

### 2. Start the backend (separate terminal)

```bash
cd /path/to/quizpulse-api
yarn dev
```

Leave this running. Confirm the API is up (e.g. open `http://localhost:3333/api/v1/quizzes` or use your auth flow).

### 3. Install frontend dependencies

```bash
cd /path/to/quizpulse-api/quizpulse-web
npm install
```

### 4. Configure environment

```bash
cp .env.example .env
```

Ensure `.env` contains (matches local API):

```bash
VITE_API_BASE_URL=http://localhost:3333/api/v1
```

### 5. Start the Vite dev server

```bash
npm run dev
```

In the terminal, Vite prints the local URL — **by default** `http://localhost:5173`. If that port is busy, Vite uses the next free port (e.g. `5174`); always use the URL shown after `npm run dev`.

### 6. Open the app

Open the printed URL in your browser. The UI expects the backend from step 2 to be reachable at `VITE_API_BASE_URL`.

---

## Environment variables

- `VITE_API_BASE_URL` — preferred explicit API base (must match your running API, including `/api/v1`).
- `VITE_API_BASE_URL_DEV` — optional dev override
- `VITE_API_BASE_URL_STAGING` — optional staging override
- `VITE_API_BASE_URL_PROD` — optional production override

If `VITE_API_BASE_URL` is not set, the app uses mode-safe defaults (see `src/lib/config/env.ts`).

## Commands

- `npm run dev` - start development server
- `npm run build` - type-check and build
- `npm run preview` - preview production build
- `npm run lint` - run ESLint
- `npm run lint:fix` - auto-fix lint issues
- `npm run format` - format with Prettier
- `npm run format:check` - verify formatting
- `npm run check` - lint + format check + type-check

## Feature summary

- Auth flows: register, login, guest login, profile update, token refresh.
- Read-side discovery: quiz list/detail, leaderboard.
- Session lifecycle: host create, invite-code join, lobby, start controls.
- Active gameplay: live/polling question updates, answer submission, completion flow.
- Guardrails: role-based route behavior, global notifications, error boundary, accessible navigation.

## QA + demo docs

- QA checklist: `QA_CHECKLIST.md`
- Recording script: `DEMO_SCRIPT.md`
