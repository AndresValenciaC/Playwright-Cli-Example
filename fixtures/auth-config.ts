/**
 * Authentication Configuration and Helpers
 * Following Playwright best practices for authentication
 * Reference: https://playwright.dev/docs/auth
 */

import { BrowserContext, Page } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";
import { LoginPage } from "../pages/LoginPage";
import {
  TEST_URLS,
  UserType,
  getUserByType,
} from "../test-data/test-data-users";

/**
 * Auth Configuration Interface
 */
export interface AuthConfig {
  authDir: string;
  timeout: number;
  retries: number;
}

/**
 * Default auth configuration
 */
export const DEFAULT_AUTH_CONFIG: AuthConfig = {
  authDir: ".auth",
  timeout: 30000,
  retries: 3,
};

/**
 * Auth file paths for different user types
 */
export const AUTH_FILES = {
  standardUser: ".auth/standard-user.json",
  problemUser: ".auth/problem-user.json",
  lockedOutUser: ".auth/locked-out-user.json",
} as const;

/**
 * Get auth file path for user type
 */
export function getAuthFileForUserType(userType: UserType): string {
  const fileMap: Record<UserType, string> = {
    standardUser: AUTH_FILES.standardUser,
    problemUser: AUTH_FILES.problemUser,
    lockedOutUser: AUTH_FILES.lockedOutUser,
  };
  return fileMap[userType];
}

/**
 * Authenticate user by performing login flow
 * Handles complete login process and state persistence
 *
 * @param page - Playwright Page object
 * @param username - User's username
 * @param password - User's password
 * @param baseUrl - Application base URL
 */
export async function authenticateUser(
  page: Page,
  username: string,
  password: string,
  baseUrl: string = TEST_URLS.base,
): Promise<void> {
  try {
    await page.goto(`${baseUrl}${TEST_URLS.login}`);
    console.log("✓ Navigated to login page");

    const loginPage = new LoginPage(page);
    await loginPage.verifyLoginPageDisplayed();

    await loginPage.login(username, password);

    // ✅ Only wait for network, it works for all user types, including locked out and problem users
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    console.log(`✓ Successfully authenticated user: ${username}`);
  } catch (error) {
    throw new Error(`Authentication failed for user ${username}`, {
      cause: error,
    });
  }
}

/**
 * Authenticate by user type (uses credentials from TEST_USERS)
 */
export async function authenticateUserByType(
  page: Page,
  userType: UserType,
  skipVerification: boolean = true, // Default to true for problem and locked out users
): Promise<void> {
  const user = getUserByType(userType);
  await authenticateUser(page, user.username, user.password);

  // Only verify auth state for users that are not locked out or problem users
  if (!skipVerification) {
    const isAuth = await verifyAuthState(page);
    if (!isAuth) {
      throw new Error("Authentication verification failed");
    }
  }
}

/**
 * Save authentication state to file
 * Persists cookies, local storage, session storage, and indexedDB
 *
 * @param page - Playwright Page object
 * @param authFile - Path to save auth state
 */
export async function saveAuthState(
  page: Page,
  authFile: string = AUTH_FILES.standardUser,
): Promise<void> {
  try {
    // Ensure auth directory exists
    const dir = path.dirname(authFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✓ Created auth directory: ${dir}`);
    }

    // Save storage state
    await page.context().storageState({ path: authFile });
    console.log(`✓ Auth state saved to: ${authFile}`);
  } catch (error) {
    throw new Error(
      `Failed to save auth state: ${error instanceof Error ? error.message : String(error)}`,
      {
        cause: error,
      },
    );
  }
}

/**
 * Verify authentication state is valid
 * Checks if user is still authenticated by navigating to protected page
 *
 * @param page - Playwright Page object
 * @param protectedUrl - URL of protected page to verify access
 */
export async function verifyAuthState(
  page: Page,
  protectedUrl: string = TEST_URLS.inventory,
): Promise<boolean> {
  try {
    const fullUrl = `${TEST_URLS.base}${protectedUrl}`;
    await page.goto(fullUrl, { waitUntil: "networkidle" });

    // If we successfully navigated to protected page without redirect to login, auth is valid
    const currentUrl = page.url();
    const isAuthenticated = !currentUrl.includes(TEST_URLS.login);

    if (isAuthenticated) {
      console.log("✓ Authentication state verified");
    } else {
      console.log("✗ Authentication state invalid - redirected to login");
    }

    return isAuthenticated;
  } catch (error) {
    throw new Error(
      `Failed to verify auth state: ${error instanceof Error ? error.message : String(error)}`,
      {
        cause: error,
      },
    );
  }
}

/**
 * Clear authentication state
 * Clears cookies and storage - useful for logout testing
 *
 * @param context - Playwright BrowserContext object
 */
export async function clearAuthState(context: BrowserContext): Promise<void> {
  try {
    await context.clearCookies();
    await context.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    console.log("✓ Authentication state cleared");
  } catch (error) {
    throw new Error(
      `Failed to clear auth state: ${error instanceof Error ? error.message : String(error)}`,
      {
        cause: error,
      },
    );
  }
}

/**
 * Delete auth state file
 */
export function deleteAuthFile(authFile: string): void {
  try {
    if (fs.existsSync(authFile)) {
      fs.unlinkSync(authFile);
      console.log(`✓ Deleted auth file: ${authFile}`);
    }
  } catch (error) {
    throw new Error(
      `Failed to delete auth file: ${error instanceof Error ? error.message : String(error)}`,
      {
        cause: error,
      },
    );
  }
}
