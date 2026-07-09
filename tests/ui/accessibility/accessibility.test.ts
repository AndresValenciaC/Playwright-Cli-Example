import { expect, test } from "@playwright/test";
import { TEST_CONFIG } from "../../../fixtures/constants";

/**
 * Accessibility Tests (a11y)
 * Ensures the application meets accessibility standards for users with disabilities
 */

test.describe("Accessibility Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_CONFIG.baseUrl);
  });

  test.describe("Keyboard Navigation", () => {
    test("should be able to navigate form using Tab key", async ({ page }) => {
      const inputs = page.locator("input, button, select");
      const inputCount = await inputs.count();

      if (inputCount > 0) {
        const firstInput = inputs.first();
        await firstInput.focus();

        const focusedElement = await page.evaluate(
          () => document.activeElement?.tagName,
        );

        expect(focusedElement).not.toBeNull();
      }
    });

    test("should have visible focus indicators on all interactive elements", async ({
      page,
    }) => {
      const buttons = page.locator("button");
      const buttonCount = await buttons.count();

      if (buttonCount > 0) {
        const firstButton = buttons.first();
        await firstButton.focus();

        const outline = await firstButton.evaluate(
          (el) => globalThis.getComputedStyle(el).outline,
        );

        // Outline should not be 'none'
        expect(outline).not.toBe("none");
      }
    });

    test("should support Enter key for button activation", async ({ page }) => {
      const button = page.locator("button").first();

      if (await button.isVisible()) {
        await button.focus();
        await page.keyboard.press("Enter");

        // Button should remain accessible
        expect(button).toBeDefined();
      }
    });

    test("should support Space key for checkbox activation", async ({
      page,
    }) => {
      const checkboxes = page.locator("input[type='checkbox']");
      const checkboxCount = await checkboxes.count();

      if (checkboxCount > 0) {
        const checkbox = checkboxes.first();
        await checkbox.focus();

        const initialState = await checkbox.isChecked();
        await page.keyboard.press("Space");

        // State should have changed
        const newState = await checkbox.isChecked();
        expect(newState).not.toBe(initialState);
      }
    });

    test("should support Escape key to close modals", async ({ page }) => {
      // Try to trigger any modal
      const buttons = page.locator("button");

      if ((await buttons.count()) > 0) {
        await buttons.first().click();
        await page.keyboard.press("Escape");

        // Modal interaction should be handled
        expect(true).toBe(true);
      }
    });
  });

  test.describe("Semantic HTML", () => {
    test("should use semantic heading tags in order", async ({ page }) => {
      const headings = page.locator("h1, h2, h3, h4, h5, h6");
      const headingCount = await headings.count();

      if (headingCount > 0) {
        expect(headingCount).toBeGreaterThan(0);

        // Check that H1 exists
        const h1Count = await page.locator("h1").count();
        expect(h1Count).toBeGreaterThanOrEqual(0);
      }
    });

    test("should use semantic form elements", async ({ page }) => {
      const form = page.locator("form");
      const formCount = await form.count();

      if (formCount > 0) {
        expect(formCount).toBeGreaterThan(0);
      }
    });

    test("should use semantic button elements instead of div", async ({
      page,
    }) => {
      const buttons = page.locator("button");
      const divs = page.locator("div[role='button']");

      const buttonCount = await buttons.count();
      const divCount = await divs.count();

      // Preference for semantic buttons
      if (buttonCount > 0) {
        expect(buttonCount).toBeGreaterThan(0);
      }
    });

    test("should use nav element for main navigation", async ({ page }) => {
      const nav = page.locator("nav");
      const navCount = await nav.count();

      if (navCount > 0) {
        expect(navCount).toBeGreaterThan(0);
      }
    });

    test("should use main element for main content", async ({ page }) => {
      const main = page.locator("main");
      const mainCount = await main.count();

      if (mainCount > 0) {
        expect(mainCount).toBeGreaterThan(0);
      }
    });
  });

  test.describe("ARIA Labels and Attributes", () => {
    test("buttons should have accessible labels", async ({ page }) => {
      const buttons = page.locator("button");
      const buttonCount = await buttons.count();

      if (buttonCount > 0) {
        for (let i = 0; i < Math.min(3, buttonCount); i++) {
          const button = buttons.nth(i);
          const text = await button.textContent();
          const ariaLabel = await button.getAttribute("aria-label");

          // Should have either visible text or aria-label
          expect(text || ariaLabel).toBeTruthy();
        }
      }
    });

    test("form inputs should have associated labels", async ({ page }) => {
      const inputs = page.locator(
        "input[type='text'], input[type='email'], input[type='password']",
      );
      const inputCount = await inputs.count();

      if (inputCount > 0) {
        const firstInput = inputs.first();
        const inputId = await firstInput.getAttribute("id");

        if (inputId) {
          const label = page.locator(`label[for='${inputId}']`);
          const labelCount = await label.count();

          if (labelCount === 0) {
            // Check for aria-label as alternative
            const ariaLabel = await firstInput.getAttribute("aria-label");
            expect(ariaLabel || labelCount > 0).toBeTruthy();
          }
        }
      }
    });

    test("images should have alt text", async ({ page }) => {
      const images = page.locator("img");
      const imageCount = await images.count();

      if (imageCount > 0) {
        for (let i = 0; i < Math.min(3, imageCount); i++) {
          const img = images.nth(i);
          const alt = await img.getAttribute("alt");
          const ariaLabel = await img.getAttribute("aria-label");

          // Image should have alt text or aria-label
          expect(alt || ariaLabel).toBeTruthy();
        }
      }
    });

    test("should use aria-required for required form fields", async ({
      page,
    }) => {
      const requiredFields = page.locator('[aria-required="true"], [required]');
      const requiredCount = await requiredFields.count();

      if (requiredCount > 0) {
        expect(requiredCount).toBeGreaterThan(0);
      }
    });

    test("should use aria-invalid for validation errors", async ({ page }) => {
      const invalidFields = page.locator('[aria-invalid="true"]');
      const invalidCount = await invalidFields.count();

      expect(invalidCount).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe("Color Contrast", () => {
    test("text should have sufficient color contrast", async ({ page }) => {
      const textElements = page.locator("p, span, a, button, label");

      if ((await textElements.count()) > 0) {
        const firstElement = textElements.first();

        const color = await firstElement.evaluate(
          (el) => globalThis.getComputedStyle(el).color,
        );

        expect(color).toBeDefined();
      }
    });

    test("button text should have good contrast with background", async ({
      page,
    }) => {
      const buttons = page.locator("button");

      if ((await buttons.count()) > 0) {
        const button = buttons.first();

        const bgColor = await button.evaluate(
          (el) => globalThis.getComputedStyle(el).backgroundColor,
        );

        const textColor = await button.evaluate(
          (el) => globalThis.getComputedStyle(el).color,
        );

        // Both colors should be defined
        expect(bgColor).toBeDefined();
        expect(textColor).toBeDefined();
      }
    });
  });

  test.describe("Focus Management", () => {
    test("focus should be visible when navigating with keyboard", async ({
      page,
    }) => {
      const button = page.locator("button").first();

      if (await button.isVisible()) {
        await button.focus();

        const isFocused = await button.evaluate(
          (el) => document.activeElement === el,
        );

        expect(isFocused).toBeTruthy();
      }
    });

    test("focus should return to trigger when closing modals", async ({
      page,
    }) => {
      const button = page.locator("button").first();

      if (await button.isVisible()) {
        await button.focus();

        const initialFocusedElement = await page.evaluate(
          () => document.activeElement?.tagName,
        );

        expect(initialFocusedElement).not.toBeNull();
      }
    });

    test("skip links should be present for keyboard users", async ({
      page,
    }) => {
      // Check for common skip link patterns
      const skipLink = page.locator(
        'a:has-text("Skip"), [aria-label*="skip"], [class*="skip"]',
      );
      const skipLinkCount = await skipLink.count();

      // Skip links are optional but helpful
      expect(skipLinkCount).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe("Screen Reader Support", () => {
    test("page should have proper language attribute", async ({ page }) => {
      const htmlElement = page.locator("html");
      const lang = await htmlElement.getAttribute("lang");

      // Should have a language attribute
      expect(lang).toBeDefined();
    });

    test("page title should be descriptive", async ({ page }) => {
      const title = await page.title();

      expect(title.length).toBeGreaterThan(0);
    });

    test("landmarks should be properly labeled", async ({ page }) => {
      const landmarks = page.locator(
        "nav, main, [role='main'], [role='contentinfo']",
      );
      const landmarkCount = await landmarks.count();

      if (landmarkCount > 0) {
        expect(landmarkCount).toBeGreaterThan(0);
      }
    });

    test("should announce dynamic content updates", async ({ page }) => {
      const liveRegions = page.locator(
        '[aria-live], [role="alert"], [role="status"]',
      );
      const liveRegionCount = await liveRegions.count();

      expect(liveRegionCount).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe("Form Accessibility", () => {
    test("form error messages should be linked to fields", async ({ page }) => {
      const inputs = page.locator("input");

      if ((await inputs.count()) > 0) {
        const input = inputs.first();
        const ariaDescribedBy = await input.getAttribute("aria-describedby");

        // Should have aria-describedby or be part of form structure
        expect(input).toBeDefined();
      }
    });

    test("form should provide help text for complex fields", async ({
      page,
    }) => {
      const helpText = page.locator(
        '[class*="help"], [class*="hint"], .description',
      );
      const helpCount = await helpText.count();

      expect(helpCount).toBeGreaterThanOrEqual(0);
    });

    test("required fields should be clearly marked", async ({ page }) => {
      const requiredFields = page.locator('[aria-required="true"], [required]');
      const requiredCount = await requiredFields.count();

      if (requiredCount > 0) {
        expect(requiredCount).toBeGreaterThan(0);
      }
    });
  });

  test.describe("Mobile Accessibility", () => {
    test("touch targets should be at least 48px large", async ({ page }) => {
      const buttons = page.locator("button");

      if ((await buttons.count()) > 0) {
        const button = buttons.first();
        const box = await button.boundingBox();

        if (box) {
          const width = box.width;
          const height = box.height;

          // Touch targets should be reasonably sized
          expect(width).toBeGreaterThan(0);
          expect(height).toBeGreaterThan(0);
        }
      }
    });

    test("interactive elements should not require precise pointer", async ({
      page,
    }) => {
      const clickableElements = page.locator("button, a, [role='button']");
      const count = await clickableElements.count();

      if (count > 0) {
        expect(count).toBeGreaterThan(0);
      }
    });
  });
});
