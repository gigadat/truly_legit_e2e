/**
 * Canonical `pw-*` hooks the POC asserts against. Extend as the portal adds hooks.
 * @see truly_legit/docs/e2e-testids.md
 */

/** Always present on `/login` (forgot/get-started depend on `canResetPassword`). */
export const LOGIN_PW_TESTIDS_CORE = [
  'pw-login-form',
  'pw-login-email',
  'pw-login-password',
  'pw-login-submit',
] as const;

export const LOGIN_PW_TESTIDS_OPTIONAL = ['pw-login-forgot-password', 'pw-login-get-started'] as const;

/** Layout + dashboard shell (desktop; after authentication). */
export const DASHBOARD_PW_TESTIDS_LAYOUT = [
  'pw-app-main',
  'pw-dashboard-page',
  'pw-dashboard-business-panel',
  'pw-dashboard-site-usage-panel',
  'pw-dashboard-badges-panel',
  'pw-dashboard-badges-header',
  'pw-dashboard-badges-title',
  'pw-sidebar-logo',
  'pw-sidebar-logout',
  'pw-sidebar-nav-home',
  'pw-sidebar-nav-install-guides',
  'pw-sidebar-nav-analytics',
  'pw-sidebar-nav-support',
  'pw-sidebar-nav-account',
] as const;

/** Selected business + field cards. */
export const DASHBOARD_PW_TESTIDS_BUSINESS = [
  'pw-dashboard-selected-business',
  'pw-dashboard-selected-business-label',
  'pw-dashboard-business-name',
  'pw-dashboard-edit-business',
  'pw-dashboard-field-url',
  'pw-dashboard-field-url-label',
  'pw-dashboard-field-url-value',
  'pw-dashboard-copy-url',
  'pw-dashboard-field-site-id',
  'pw-dashboard-field-site-id-label',
  'pw-dashboard-field-site-id-value',
  'pw-dashboard-copy-site-id',
  'pw-dashboard-field-signing-officer',
  'pw-dashboard-field-signing-officer-label',
  'pw-dashboard-field-signing-officer-value',
  'pw-dashboard-field-address',
  'pw-dashboard-field-address-label',
  'pw-dashboard-field-address-value',
] as const;

/** Site usage column. */
export const DASHBOARD_PW_TESTIDS_SITE_USAGE = [
  'pw-dashboard-site-usage',
  'pw-dashboard-site-visits-header',
  'pw-dashboard-site-visits-title',
  'pw-dashboard-site-visits-count',
  'pw-dashboard-site-visits-track',
  'pw-dashboard-site-visits-progress',
  'pw-dashboard-subscription-card',
  'pw-dashboard-subscription-allowable-label',
  'pw-dashboard-subscription-status',
  'pw-dashboard-subscription-usage-copy',
] as const;

/** Sysadmin-only sidebar control (seeded admin user). */
export const DASHBOARD_PW_TESTIDS_SYSADMIN_NAV = ['pw-sidebar-nav-admin'] as const;
