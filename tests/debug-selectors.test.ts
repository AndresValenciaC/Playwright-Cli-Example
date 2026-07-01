/**
 * Debug test to inspect page selectors and structure
 * Run this to understand the page structure for authentication
 */

import { test } from "@playwright/test";
import { TEST_URLS } from "../test-data/test-data-users";

test.describe("Debug Page Selectors", () => {
    test("inspect login page structure", async ({ page }) => {
        console.log("\n\n=== DEBUGGING LOGIN PAGE ===");
        console.log(`Navigating to: ${TEST_URLS.base}`);

        await page.goto(TEST_URLS.base);

        // Wait a bit for page to fully load
        await page.waitForLoadState("networkidle");

        // Log page title and URL
        console.log(`Page Title: ${await page.title()}`);
        console.log(`Page URL: ${page.url()}`);

        // Try to find all input fields
        const inputs = await page.locator("input").count();
        console.log(`\nFound ${inputs} input fields`);

        for (let i = 0; i < inputs; i++) {
            const input = page.locator("input").nth(i);
            const type = await input.getAttribute("type");
            const name = await input.getAttribute("name");
            const id = await input.getAttribute("id");
            const placeholder = await input.getAttribute("placeholder");
            console.log(`  Input ${i}: type=${type}, name=${name}, id=${id}, placeholder=${placeholder}`);
        }
    });
})