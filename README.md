# QuizPulse API

Backend API for QuizPulse, built with AdonisJS and TypeScript.

## Web frontend

The official browser UI for this backend lives in **`quizpulse-web/`** (React, Vite, TypeScript). For install commands, environment variables, and how to run it against this API, see **[quizpulse-web/README.md](quizpulse-web/README.md)**.

## What this project includes

- JWT-based authentication (`register`, `login`, `refresh`)
- Guest access token flow for read-only gameplay access
- User profile endpoints
- Quiz listing and quiz detail endpoints
- Multiplayer quiz sessions (create, join, start, submit answers)
- Leaderboard endpoint
- E2E-style flow scripts for auth and error-path validation

## Tech stack

- AdonisJS 7
- TypeScript
- Lucid ORM
- **PostgreSQL** (configured connection: `pg` in `config/database.ts`)
- **Redis** (sessions, live scores, per-user answered questions, leaderboard cache)
- **WebSocket** (`ws`) on the **same port** as HTTP (default `3333`) for session rooms and live events

## Project structure

- `app/controllers` - HTTP controllers for auth, user, quiz, sessions, leaderboard
- `app/services` - business logic (token handling, session lifecycle, leaderboard)
- `app/models` - Lucid models
- `app/validators` - request validators
- `app/middleware` - auth/guest/session middleware
- `database` - migrations and seeders
- `scripts` - local flow test scripts
- `tests` - Japa test suites
- `quizpulse-web/` - React web app (see its README)
- `start/routes.ts` - API route definitions

## Prerequisites

- **Node.js 20+** (Node.js 22+ recommended)
- **Yarn** (package manager for this repo)
- **PostgreSQL** 14+ (running and reachable from your machine)
- **Redis** 6+ (running; the app uses it whenever sessions or live scoring are involved)

## System services (PostgreSQL + Redis)

Create a database (name should match `DB_DATABASE` / `PG_DB_NAME` in `.env`, default `quizpulse`):

```bash
createdb quizpulse
# or: psql -U postgres -c "CREATE DATABASE quizpulse;"
```

Start Redis (must accept connections on `REDIS_HOST` / `REDIS_PORT`, default `127.0.0.1:6379`):

```bash
# macOS (Homebrew)
brew services start redis

# Linux (example)
# sudo systemctl start redis-server
```

## Backend setup

From the **repository root** (`quizpulse-api/`):

1. **Install dependencies**

   ```bash
   yarn
   ```

2. **Environment file**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set at least:

   - **`APP_KEY`** — encryption/session signing. Generate with Adonis (Node 20+):

     ```bash
     node ace generate:key
     ```

     Or: `openssl rand -base64 32` and paste the result into `APP_KEY`.

   - **`JWT_SECRET`** — use a long random string in any environment that matters.
   - **`DB_*` and `PG_*`** — same PostgreSQL host, port, user, password, and database name (see `.env.example`).
   - **`REDIS_*`** — match your local Redis.
   - **`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`** — placeholders are fine for local API-only work; set real values for Google OAuth.

3. **Migrations**

   ```bash
   node ace migration:run
   ```

4. **Seed data** (sample quizzes/questions)

   ```bash
   node ace db:seed
   ```

5. **Run the API**

   ```bash
   yarn dev
   ```

**Default local URLs**

- HTTP API base: `http://localhost:3333/api/v1`
- WebSocket (same host/port as HTTP): `ws://localhost:3333` with query params `token` and `sessionId` (see `scripts/helpers.ts` and `start/ws.ts`)

## Available scripts

- `yarn dev` - Start development server with HMR
- `yarn start` - Start production server from built files
- `yarn build` - Build the app
- `yarn test` - Run test suite
- `yarn lint` - Run ESLint
- `yarn format` - Run Prettier
- `yarn typecheck` - TypeScript type check

## API overview

All routes are under `/api/v1`.

### Public routes

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/guest`
- `GET /auth/google`
- `GET /auth/google/callback`

### Guest-accessible routes (guest token or user token)

- `GET /quizzes`
- `GET /quizzes/:id`
- `GET /leaderboard`

### Authenticated user routes (full user JWT only)

- `GET /me`
- `PUT /me`
- `POST /sessions`
- `POST /sessions/join`
- `GET /sessions/:id`
- `POST /sessions/:id/start`
- `POST /sessions/:id/answers` (requires session participant middleware)

## Response shape

Most endpoints return the normalized structure:

- Success: `{ data: ..., error: null }`
- Error: handled by global exception handler with status code and error details

## Validation and error behavior

Common status codes used by the API:

- `200`/`201` - successful requests
- `400` - invalid flow or missing required context (for example, missing refresh token)
- `401` - unauthorized / invalid credentials / invalid JWT
- `403` - forbidden (for example, user not a session participant)
- `404` - missing resources
- `409` - conflict (for example, duplicate answer submission)
- `422` - validation errors

## Data seeding

Seeder files in `database/seeders` include starter quiz/question data.

Run:

- `node ace db:seed`

## Flow scripts (manual verification)

The `scripts` folder includes runnable flow checks:

- `scripts/auth_flow.ts` - happy path auth/profile/guest checks
- `scripts/error_flow.ts` - error-path checks (invalid JWT, validation, duplicate answer, etc.)

If your local setup supports it, run scripts with `tsx` or your preferred TypeScript runner configuration.

## Related documentation

- `docs/problems-and-solutions.md` - documented issues identified and implemented fixes
- `docs/web-ui-prompts.md` - step-by-step prompts to build and integrate a web UI with this backend

## Screen recording guidance

For submission requirements that include a product demo video, record:

1. Server startup and successful health/API response.
2. Register/login flow.
3. Quiz listing and detail retrieval.
4. Session create/join/start flow.
5. Answer submission and leaderboard view.
6. At least one negative/error scenario (e.g., unauthorized route access).

Recommended tools:

- macOS QuickTime screen recording
- Loom

## License

MIT (per `package.json`)
