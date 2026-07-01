import { defineConfig, devices } from "@playwright/test";
import { AUTH_FILES } from "./fixtures/auth-config";

/**
 * Playwright Configuration with Authentication Setup
 * Following best practices: https://playwright.dev/docs/auth
 */
export default defineConfig({
  testDir: "./tests",

  fullyParallel: false,

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 0,

  workers: process.env.CI ? 1 : undefined,



  /* Reports */
  reporter: [
    ["list"],
    ["html"],
    ["json", { outputFile: "./test-results/test-results.json" }],
  ],

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "off",
    actionTimeout: 10000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "setup",
      testMatch: "**/setup.ts",
    },
    {
      name: "standard-user-tests",
      use: {
        ...devices["chromium"],
        // Use storage state saved by setup project
        storageState: AUTH_FILES.standardUser,
      },
      dependencies: ["setup"],
    },
    {
      name: "problem-user-tests",
      use: {
        ...devices["chromium"],
        storageState: AUTH_FILES.problemUser,
      },
      dependencies: ["setup"],
    },
    {
      name: "locked-out-user-tests",
      use: {
        ...devices["chromium"],
        storageState: AUTH_FILES.lockedOutUser,
      },
      dependencies: ["setup"],
    },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start', npm run dev
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  //  timeout: 120000,
  // },
});
