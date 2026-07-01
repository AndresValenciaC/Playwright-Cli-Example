import { Page, expect } from "@playwright/test";

/**
 * Base Page Object Model class
 * Provides common functionality for all page objects
 */
export class BasePage {
  constructor(protected page: Page) {}

  /**
   * Navigate to a URL
   */
  async goto(url: string): Promise<void> {
    await this.page.goto(url);
  }

  /**
   * Wait for page to load
   */
  async waitForLoadState(
    state: "load" | "domcontentloaded" | "networkidle" = "networkidle",
  ): Promise<void> {
    await this.page.waitForLoadState(state);
  }

  /**
   * Wait for a selector to be visible
   */
  async waitForSelector(selector: string, timeout?: number): Promise<void> {
    await this.page.waitForSelector(selector, { timeout });
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return this.page.title();
  }

  /**
   * Get current URL
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Verify page heading
   */
  async verifyHeading(text: string): Promise<void> {
    await expect(this.page.locator("h1, h2")).toContainText(text);
  }

  /**
   * Take screenshot
   */
  async takeScreenshot(fileName: string): Promise<Buffer> {
    return this.page.screenshot({ path: `./test-results/${fileName}.png` });
  }
}
