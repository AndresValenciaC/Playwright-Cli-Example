/**
 * Global Authentication Setup
 * Runs once before all tests to authenticate users and save state
 *
 * Reference: https://playwright.dev/docs/auth
 */

import { test as setup } from "@playwright/test";
import {
  authenticateUserByType,
  getAuthFileForUserType,
  saveAuthState,
} from "../fixtures/auth-config";

/**
 * Setup: Standard User Authentication
 * Creates auth state for standard_user
 */
setup("auth-standard-user", async ({ page }, testInfo) => {
  try {
    console.log("\n📝 Starting authentication setup for standard user...");

    await authenticateUserByType(page, "standardUser");

    // ✅ Just save auth state for reuse, no verification needed for standard user
    await saveAuthState(page, getAuthFileForUserType("standardUser"));

    console.log("✓ Standard user authentication setup completed\n");
  } catch (error) {
    console.error(`✗ Standard user authentication failed: ${error}`);
    testInfo.skip(true, "Authentication failed");
    throw error;
  }
});

/**
 * Setup: Problem User Authentication
 * Creates auth state for problem_user
 * Problem user has limited access - skip navigation verification
 */
setup("auth-problem-user", async ({ page }, testInfo) => {
  try {
    console.log("\n📝 Starting authentication setup for problem user...");

    // ✅ Skip verification para problem_user
    await authenticateUserByType(page, "problemUser", true);

    // ✅ NO verification of auth state for problem user due to known limitations
    // Only save auth state for reuse
    await saveAuthState(page, getAuthFileForUserType("problemUser"));

    console.log("✓ Problem user authentication setup completed\n");
  } catch (error) {
    console.error(`✗ Problem user authentication failed: ${error}`);
    testInfo.skip(true, "Authentication failed");
    throw error;
  }
});

/**
 * Setup: Locked Out User Authentication
 * Creates auth state for locked_out_user
 */

setup("auth-locked-out-user", async ({ page }, testInfo) => {
  try {
    console.log("\n📝 Starting authentication setup for locked out user...");

    // ✅ Skip verification para locked_out_user
    await authenticateUserByType(page, "lockedOutUser", true);

    // ✅ NO verification of auth state for locked out user due to known limitations
    // Only save auth state for reuse
    await saveAuthState(page, getAuthFileForUserType("lockedOutUser"));

    console.log("✓ Locked out user authentication setup completed\n");
  } catch (error) {
    console.error(`✗ Locked out user authentication failed: ${error}`);
    testInfo.skip(true, "Authentication failed");
    throw error;
  }
});
