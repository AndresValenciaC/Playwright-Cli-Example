/**
 * Example tests using the improved authentication system
 * Tests run with pre-authenticated storage state
 */

import { expect, test } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { TEST_URLS } from "../test-data/test-data-users";

test.describe("Dashboard - With Pre-Authenticated User", () => {
    test("should display inventory page after login", async ({ page }) => {
        // Navigate directly - auth state is already loaded
        await page.goto(TEST_URLS.inventory);

        // User should be on inventory page
        expect(page.url()).toContain(TEST_URLS.inventory);
        console.log("✓ User authenticated and on inventory page");
    });

    test("should have user session data", async ({ page }) => {
        await page.goto(TEST_URLS.inventory);

        // Check for authenticated elements
        const heading = page.getByRole("heading", { name: /Products/i });
        await expect(heading).toBeVisible();

        console.log("✓ Authenticated session verified");
    });
});

test.describe("Login Page - Invalid Credentials", () => {
    test.use({ storageState: undefined }); // Skip auth state for this test

    test("should show error with invalid credentials", async ({ page }) => {
        await page.goto(TEST_URLS.base);

        const loginPage = new LoginPage(page);
        await loginPage.verifyLoginPageDisplayed();

        // Try login with wrong password
        await loginPage.login("standard_user", "wrong_password");

        // Verify error message
        await loginPage.verifyInvalidCredentialsError();
        console.log("✓ Invalid credentials error displayed");
    });

    test("should show error for locked out user", async ({ page }) => {
        await page.goto(TEST_URLS.base);

        const loginPage = new LoginPage(page);
        await loginPage.loginWithUserType("lockedOutUser");

        // Verify locked out error
        await loginPage.verifyUserLockedError();
        console.log("✓ Locked out user error displayed");
    });
});

test.describe("Logout - Session Management", () => {
    test("should redirect to login after logout", async ({ page }) => {
        // Start authenticated
        await page.goto(TEST_URLS.inventory);
        expect(page.url()).toContain(TEST_URLS.inventory);

        // Find and click logout button (adjust selector as needed)
        const logoutButton = page.getByRole("button", { name: /Logout/i });
        if (await logoutButton.isVisible()) {
            await logoutButton.click();
        }

        // Should redirect to login page
        await page.waitForURL((url) => url.toString().includes(TEST_URLS.login));
        console.log("✓ Successfully logged out");
    });
});