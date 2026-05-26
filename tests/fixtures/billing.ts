import { test as base } from '@playwright/test';
import {
  getUsageApiConfig,
  UsageApi,
  type MerchantUsageSnapshot,
} from '../helpers/usage-api.js';

export type BillingFixtures = {
  /**
   * Test-only usage API client for setting `current_billing_cycle_sessions`
   * before persona-sensitive flows. `null` when env vars are missing — call
   * sites should `test.skip(!usageApi, '...')` to bail cleanly.
   *
   * Captures a baseline on first read/write per test and restores it in
   * teardown so other specs are not affected by persona setup.
   */
  usageApi: UsageApi | null;
};

export const test = base.extend<BillingFixtures>({
  usageApi: async ({}, use) => {
    const config = getUsageApiConfig();
    if (!config) {
      await use(null);
      return;
    }

    const api = await UsageApi.create(config);
    const baselines = new Map<number, MerchantUsageSnapshot>();

    const tracked = new Proxy(api, {
      get(target, prop, receiver) {
        const orig = Reflect.get(target, prop, receiver);
        if (typeof orig !== 'function') return orig;
        if (prop === 'setSiteUsage' || prop === 'resetSiteUsage') {
          return async (...args: unknown[]) => {
            const merchantId =
              prop === 'setSiteUsage'
                ? (args[1] as number | undefined)
                : (args[0] as number | undefined);
            const id = target.resolveMerchantId(merchantId);
            if (!baselines.has(id)) {
              baselines.set(id, await target.getSiteUsage(id));
            }
            return (orig as (...a: unknown[]) => unknown).apply(target, args);
          };
        }
        return (orig as (...a: unknown[]) => unknown).bind(target);
      },
    }) as UsageApi;

    try {
      await use(tracked);
    } finally {
      for (const snap of baselines.values()) {
        try {
          await api.setSiteUsage(snap.totalSessions, snap.merchantId);
        } catch (err) {
          console.warn(
            `[usageApi] failed to restore merchant ${snap.merchantId}: ${(err as Error).message}`,
          );
        }
      }
      await api.dispose();
    }
  },
});

export { expect } from '@playwright/test';
