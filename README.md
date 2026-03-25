# Truly Legit — Playwright E2E

Black-box end-to-end tests for the **merchant portal** ([`truly_legit`](https://github.com/gigadat/truly_legit)). This repo contains **only** Playwright; the portal app runs separately.

## Prerequisites

- Node.js 20+
- A running portal instance for **local** runs, or network access to **dev/qa** URLs

## Setup

```bash
npm install
npx playwright install chromium
```

Copy `.env.example` to `.env` and set URLs or credentials for the environments you use.

## Environments

All URLs and test users come from **`.env`** (copy **`.env.example`**). Supported targets: **`local`**, **`dev`**, **`qa`** (`E2E_TARGET` or `npm run test:*`).

| Variable | Purpose |
| -------- | ------- |
| `E2E_TARGET` | `local` (default), `dev`, or `qa` when running `npm test` |
| `E2E_LOCAL_BASE_URL`, `E2E_DEV_BASE_URL`, `E2E_QA_BASE_URL` | Portal origin for that target |
| `BASE_URL` | If **`local`** and `E2E_LOCAL_BASE_URL` is empty, used as the local base URL |
| `E2E_<TARGET>_EMAIL` / `E2E_<TARGET>_PASSWORD` | Test user for that target |
| `E2E_USER_EMAIL` / `E2E_USER_PASSWORD` | Fallback credentials if per-target vars are unset |

### Commands

Runs are **headless** by default (no browser window). The only scripted alternative is **UI mode**; for a visible browser without the UI runner, add Playwright’s **`--headed`** flag yourself (e.g. `npx cross-env E2E_TARGET=local playwright test --headed`).

```bash
npm test                 # default target: local; URLs from .env (see .env.example)
npm run test:local
npm run test:dev
npm run test:qa
```

**UI mode** (Playwright UI / time travel):

```bash
npm run test:ui
npm run test:local:ui
npm run test:dev:ui
npm run test:qa:ui
```

Equivalent shell (Unix):

```bash
E2E_TARGET=qa npm test
```

## CI

GitHub Actions workflow [`.github/workflows/playwright.yml`](.github/workflows/playwright.yml) runs on **`workflow_dispatch`**.

| Secret | Purpose |
| ------ | ------- |
| `E2E_BASE_URL` | Maps to **`BASE_URL`** in CI for local-style runs when `E2E_TARGET` is unset |
| `E2E_TARGET` | Optional: `dev` or `qa` |
| `E2E_LOCAL_BASE_URL` / `E2E_DEV_BASE_URL` / `E2E_QA_BASE_URL` | Portal URLs (set the ones you use) |
| `E2E_USER_EMAIL` / `E2E_USER_PASSWORD` | Test account (or per-target `E2E_*_EMAIL` / `E2E_*_PASSWORD` secrets) |

To use **different users per environment** in Actions, extend the workflow `env` block with `E2E_DEV_EMAIL`, `E2E_QA_EMAIL`, etc. (empty secrets are ignored).

## Contract with the portal

Tests rely on **`data-testid`** hooks in **`truly_legit`** (Vue/Inertia); every id **must** start with **`pw-`**. Conventions: [`docs/e2e-testids.md`](../truly_legit/docs/e2e-testids.md) when both repositories are checked out side by side.

## Repository layout

- `e2e-environments.ts` — reads `E2E_*` / `BASE_URL` from `.env` into Playwright config
- `tests/smoke/` — minimal checks (e.g. health endpoint)
- `tests/auth/` — login and future session flows
