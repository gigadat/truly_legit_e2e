import { config as loadDotenv } from 'dotenv';

loadDotenv({ path: '.env', quiet: true });

export type E2eEnvName = 'local' | 'dev' | 'qa';

export type E2eEnvironmentProfile = {
  /** Portal origin, no trailing slash */
  baseURL: string;
  testUser: {
    email: string;
    password: string;
  };
};

/** Treat empty string like unset (e.g. GitHub Actions missing secrets). */
function nonempty(v: string | undefined): string | undefined {
  return v !== undefined && v !== '' ? v : undefined;
}

function normalizeTarget(raw: string | undefined): E2eEnvName {
  const key = (nonempty(raw) ?? 'local').toLowerCase();
  if (key === 'local' || key === 'dev' || key === 'qa') return key;
  console.warn(`[e2e] Unknown E2E_TARGET="${raw}", using "local"`);
  return 'local';
}

/** Active target (from E2E_TARGET or default local). */
export function getResolvedEnvName(): E2eEnvName {
  return normalizeTarget(process.env.E2E_TARGET);
}

/**
 * Resolved config from `.env` / process env only (see `.env.example`).
 *
 * Base URL: `E2E_<TARGET>_BASE_URL`; for `local` only, `BASE_URL` is used if `E2E_LOCAL_BASE_URL` is unset.
 * Creds: `E2E_<TARGET>_EMAIL` / `_PASSWORD`, then `E2E_USER_EMAIL` / `E2E_USER_PASSWORD`.
 */
export function getE2eConfig(): E2eEnvironmentProfile & { name: E2eEnvName } {
  const name = getResolvedEnvName();
  const u = name.toUpperCase();
  const prefix = `E2E_${u}_`;

  const perTargetBase = nonempty(process.env[`${prefix}BASE_URL`]);
  const baseURL =
    perTargetBase ??
    (name === 'local' ? nonempty(process.env.BASE_URL) : undefined) ??
    '';

  const email =
    nonempty(process.env[`${prefix}EMAIL`]) ?? nonempty(process.env.E2E_USER_EMAIL) ?? '';

  const password =
    nonempty(process.env[`${prefix}PASSWORD`]) ?? nonempty(process.env.E2E_USER_PASSWORD) ?? '';

  return {
    name,
    baseURL: baseURL.replace(/\/$/, ''),
    testUser: { email, password },
  };
}
