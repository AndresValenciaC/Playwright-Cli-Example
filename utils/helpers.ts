import { Page } from "@playwright/test";

/**
 * Utility helper functions for test automation
 */

/**
 * Wait for a specific number of milliseconds
 */
export async function waitForMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Extract text from multiple elements
 */
export async function getAllElementTexts(
  page: Page,
  selector: string,
): Promise<string[]> {
  return page.$$eval(selector, (elements) =>
    elements.map((el) => el.textContent?.trim() || ""),
  );
}

/**
 * Verify element is visible and enabled
 */
export async function isElementInteractable(
  page: Page,
  selector: string,
): Promise<boolean> {
  try {
    await page.waitForSelector(selector, { state: "visible", timeout: 1000 });
    const isDisabled = await page.isDisabled(selector);
    return !isDisabled;
  } catch {
    return false;
  }
}

/**
 * Generate random string for test data
 */
export function generateRandomString(length: number = 10): string {
  return Math.random()
    .toString(36)
    .substring(2, length + 2);
}
