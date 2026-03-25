# Truly Legit — Playwright E2E

Black-box end-to-end tests for the **merchant portal** ([`truly_legit`](https://github.com/gigadat/truly_legit)). This repo contains **only** Playwright; the portal app runs separately.

## Prerequisites

- Node.js 20+
- A running portal instance (local or deployed), e.g. `php artisan serve` → `http://localhost:8000`

## Setup

```bash
npm install
npx playwright install chromium
```

Copy `.env.example` to `.env` or export variables in your shell:

```bash
export BASE_URL=http://localhost:8000
```

## Run tests

```bash
npm test
npm run test:headed
npm run test:ui
```

## CI

GitHub Actions workflow [`.github/workflows/playwright.yml`](.github/workflows/playwright.yml) runs on **`workflow_dispatch`** (manual run) so it only executes when you intend to hit a deployed portal with secrets configured.

Configure repository **Secrets** (Settings → Secrets and variables → Actions):

| Secret            | Purpose                                      |
| ----------------- | -------------------------------------------- |
| `E2E_BASE_URL`    | Portal URL (e.g. `https://dev.trulylegit.com`) |

Optional (for future authenticated tests): `E2E_USER_EMAIL`, `E2E_USER_PASSWORD`.

## Contract with the portal

Tests rely on **`data-testid`** hooks added in **`truly_legit`** (Vue/Inertia). Naming conventions and PR expectations are documented in the portal repo: [`docs/e2e-testids.md`](../truly_legit/docs/e2e-testids.md) when both repositories are checked out side by side under the same parent folder.

## Repository layout

- `tests/smoke/` — minimal checks (e.g. health endpoint)
- `tests/auth/` — login and future session flows
