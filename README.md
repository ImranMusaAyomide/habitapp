# Habit Tracker PWA

A mobile-first Progressive Web App for tracking daily habits and building streaks. Built with Next.js (App Router), TypeScript, Tailwind CSS, and localStorage persistence.

---

## Project Overview

Habit Tracker lets you:
- Sign up and log in with email and password (local auth)
- Create, edit, and delete daily habits
- Mark habits complete for today (toggleable)
- View a live streak counter per habit
- Install as a PWA and load the app shell offline

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm 9+

### Install dependencies

```bash
npm install
```

### Install Playwright browsers (for E2E tests)

```bash
npx playwright install chromium
```

---

## Run Instructions

### Development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production build

```bash
npm run build
npm run start
```

---

## Test Instructions

### Unit tests (Vitest + coverage)

```bash
npm run test:unit
```

Runs all files in `tests/unit/`. Generates a coverage report for `src/lib/**`. Minimum threshold: 80% line coverage.

### Integration / component tests (Vitest + React Testing Library)

```bash
npm run test:integration
```

Runs all files in `tests/integration/`.

### End-to-end tests (Playwright)

```bash
npm run test:e2e
```

Requires a running production build (the Playwright config starts it automatically via `webServer`). Runs all files in `tests/e2e/`.

### All tests

```bash
npm run test
```

---

## Test File → Behavior Map

| Test file | Behavior verified |
|---|---|
| `tests/unit/slug.test.ts` | `getHabitSlug` — lowercase, hyphenation, trimming, special-char removal |
| `tests/unit/validators.test.ts` | `validateHabitName` — empty, too long, valid + trimmed |
| `tests/unit/streaks.test.ts` | `calculateCurrentStreak` — empty, not completed today, consecutive, duplicates, gaps |
| `tests/unit/habits.test.ts` | `toggleHabitCompletion` — add, remove, immutability, no duplicates |
| `tests/integration/auth-flow.test.tsx` | Signup creates session, duplicate email error, login stores session, invalid credentials error |
| `tests/integration/habit-form.test.tsx` | Empty-name validation, create habit, edit preserves immutable fields, delete needs confirmation, toggle updates streak |
| `tests/e2e/app.spec.ts` | Full user flows: splash, redirect, auth protection, sign up, login, create, complete, persist, logout, offline shell |

---

## Local Persistence Structure

All data is stored in `localStorage` under three keys:

### `habit-tracker-users`
JSON array of user objects:
```json
[{ "id": "...", "email": "...", "password": "...", "createdAt": "ISO string" }]
```

### `habit-tracker-session`
Either `null` or a session object:
```json
{ "userId": "...", "email": "..." }
```

### `habit-tracker-habits`
JSON array of habit objects:
```json
[{
  "id": "...",
  "userId": "...",
  "name": "Drink Water",
  "description": "Stay hydrated",
  "frequency": "daily",
  "createdAt": "ISO string",
  "completions": ["2024-06-14", "2024-06-15"]
}]
```

Completions are unique ISO calendar dates (YYYY-MM-DD). Habits are filtered by `userId` on load so each user sees only their own.

---

## PWA Support

### Service Worker (`public/sw.js`)
A hand-written service worker using a **Cache-First** strategy:
1. On **install**: pre-caches the app shell routes (`/`, `/login`, `/signup`, `/dashboard`, `/manifest.json`).
2. On **fetch**: serves from cache first; falls back to network and caches new responses; on network failure returns the cached shell.
3. Registered in `src/components/shared/ServiceWorkerRegistration.tsx` (client component included in the root layout).

### Manifest (`public/manifest.json`)
Declares the app name, icons (192×192 and 512×512), `start_url`, `display: standalone`, theme and background colours.

### Icons (`public/icons/`)
`icon-192.png` and `icon-512.png` — green-branded PNG icons.

---

## Trade-offs & Limitations

| Area | Decision | Limitation |
|---|---|---|
| **Auth** | localStorage, plaintext passwords | Not suitable for production — no hashing, no server |
| **Session** | JSON blob in localStorage | Cleared on `localStorage.clear()`; no expiry |
| **Offline** | Service-worker cache-first | Dynamic data (habits) is not synced — offline reads are from the last in-memory state, not a background sync |
| **Frequency** | Only `daily` implemented | Spec specifies weekly/custom as out of scope for Stage 3 |
| **Testing** | jsdom for unit/integration | Some browser APIs (SW, Push) require real browser — covered by Playwright E2E instead |
| **Icons** | Programmatically generated PNGs | No high-fidelity custom artwork |
