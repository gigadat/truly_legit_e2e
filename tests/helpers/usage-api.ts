import { request as pwRequest, type APIRequestContext } from '@playwright/test';
import { getResolvedEnvName } from '../../e2e-environments.js';

/**
 * Test-only usage API client.
 *
 * Drives `sites.current_billing_cycle_sessions` (the field
 * `Merchant::getBillingPeriodSiteSessions()` reads in `truly_legit`) so persona
 * cases (1.0 within new threshold / 2.0 over new threshold) can be exercised
 * without recording real traffic.
 *
 * The portal must expose a guarded endpoint, e.g.:
 *
 *   GET  {E2E_USAGE_API_URL}/merchants/{merchantId}/usage
 *   POST {E2E_USAGE_API_URL}/merchants/{merchantId}/usage  body: { totalSessions: number }
 *
 * with `Authorization: Bearer {E2E_USAGE_API_TOKEN}`. Endpoint MUST be locked
 * to non-production envs (e.g. `APP_ENV in [local, dev, qa]`) and a rotating
 * shared secret. Never enable on production.
 */

export type UsageApiConfig = {
  baseURL: string;
  token: string;
  /** Default merchant used when callers don't pass one (per-target). */
  defaultMerchantId?: number;
};

export type MerchantUsageSnapshot = {
  merchantId: number;
  totalSessions: number;
};

function nonempty(v: string | undefined): string | undefined {
  return v !== undefined && v !== '' ? v : undefined;
}

/**
 * Resolve usage-API config from env. Returns null when not configured so
 * callers can `test.skip(...)` rather than fail.
 */
export function getUsageApiConfig(): UsageApiConfig | null {
  const target = getResolvedEnvName().toUpperCase();
  const baseURL =
    nonempty(process.env[`E2E_${target}_USAGE_API_URL`]) ??
    nonempty(process.env.E2E_USAGE_API_URL);
  const token =
    nonempty(process.env[`E2E_${target}_USAGE_API_TOKEN`]) ??
    nonempty(process.env.E2E_USAGE_API_TOKEN);

  if (!baseURL || !token) return null;

  const merchantRaw =
    nonempty(process.env[`E2E_${target}_PERSONA_MERCHANT_ID`]) ??
    nonempty(process.env.E2E_PERSONA_MERCHANT_ID);
  const defaultMerchantId =
    merchantRaw !== undefined ? Number.parseInt(merchantRaw, 10) : undefined;

  return {
    baseURL: baseURL.replace(/\/$/, ''),
    token,
    defaultMerchantId: Number.isFinite(defaultMerchantId)
      ? (defaultMerchantId as number)
      : undefined,
  };
}

export class UsageApi {
  private constructor(
    private readonly request: APIRequestContext,
    private readonly config: UsageApiConfig,
    private readonly ownsRequest: boolean,
  ) {}

  static async create(
    config: UsageApiConfig,
    request?: APIRequestContext,
  ): Promise<UsageApi> {
    const ownsRequest = !request;
    const ctx =
      request ??
      (await pwRequest.newContext({
        baseURL: config.baseURL,
        extraHTTPHeaders: {
          Accept: 'application/json',
          Authorization: `Bearer ${config.token}`,
        },
      }));
    return new UsageApi(ctx, config, ownsRequest);
  }

  async dispose(): Promise<void> {
    if (this.ownsRequest) await this.request.dispose();
  }

  resolveMerchantId(merchantId?: number): number {
    const id = merchantId ?? this.config.defaultMerchantId;
    if (id === undefined) {
      throw new Error(
        'UsageApi: no merchantId provided and E2E_PERSONA_MERCHANT_ID is not set',
      );
    }
    return id;
  }

  async getSiteUsage(merchantId?: number): Promise<MerchantUsageSnapshot> {
    const id = this.resolveMerchantId(merchantId);
    const res = await this.request.get(this.url(id));
    if (!res.ok()) {
      throw new Error(
        `UsageApi.getSiteUsage(${id}) failed: ${res.status()} ${await res.text()}`,
      );
    }
    const body = (await res.json()) as MerchantUsageSnapshot;
    return body;
  }

  async setSiteUsage(
    totalSessions: number,
    merchantId?: number,
  ): Promise<MerchantUsageSnapshot> {
    if (!Number.isInteger(totalSessions) || totalSessions < 0) {
      throw new Error(
        `UsageApi.setSiteUsage: totalSessions must be a non-negative integer (got ${totalSessions})`,
      );
    }
    const id = this.resolveMerchantId(merchantId);
    const res = await this.request.post(this.url(id), {
      data: { totalSessions },
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok()) {
      throw new Error(
        `UsageApi.setSiteUsage(${id}, ${totalSessions}) failed: ${res.status()} ${await res.text()}`,
      );
    }
    return (await res.json()) as MerchantUsageSnapshot;
  }

  async resetSiteUsage(merchantId?: number): Promise<MerchantUsageSnapshot> {
    return this.setSiteUsage(0, merchantId);
  }

  private url(merchantId: number): string {
    const sep = this.config.baseURL.endsWith('/') ? '' : '/';
    return `${this.config.baseURL}${sep}merchants/${merchantId}/usage`;
  }
}
