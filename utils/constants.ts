/**
 * Global constants used throughout the test suite
 */

export const TIMEOUTS = {
  SHORT: 3000,
  MEDIUM: 5000,
  LONG: 10000,
  NAVIGATION: 15000,
};

export const SELECTORS_COMMON = {
  body: "body",
  loading_spinner: '[class*="spinner"]',
  error_message: '[class*="error"]',
};

export const RETRY_ATTEMPTS = {
  DEFAULT: 3,
  API: 5,
};

export const TEST_ENV = {
  headless: process.env.HEADLESS !== "false",
  slowMo: parseInt(process.env.SLOW_MO || "0"),
  debug: process.env.DEBUG === "true",
};
