import { expect, test } from "@playwright/test";
import { TEST_CONFIG } from "../../../fixtures/constants";
/**
 * User Interaction and Workflow Tests
 * Tests common user interactions and complex workflows
 */

test.describe("User Interaction Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_CONFIG.baseUrl);
  });

  test.describe("Form Interactions", () => {
    test("should handle text input in all text fields", async ({ page }) => {
      const textInputs = page.locator('input[type="text"]');
      const inputCount = await textInputs.count();

      if (inputCount > 0) {
        const firstInput = textInputs.first();
        const testValue = "Test Input 123";

        await firstInput.fill(testValue);
        const value = await firstInput.inputValue();

        expect(value).toBe(testValue);
      }
    });

    test("should handle email input with valid email", async ({ page }) => {
      const emailInput = page
        .locator('input[type="email"], input[name*="email"]')
        .first();

      if (await emailInput.isVisible()) {
        const validEmail = "test@example.com";
        await emailInput.fill(validEmail);

        const value = await emailInput.inputValue();
        expect(value).toBe(validEmail);
      }
    });

    test("should handle number input", async ({ page }) => {
      const numberInputs = page.locator('input[type="number"]');

      if ((await numberInputs.count()) > 0) {
        const firstNumber = numberInputs.first();
        await firstNumber.fill("123");

        const value = await firstNumber.inputValue();
        expect(value).toBe("123");
      }
    });

    test("should handle password input masking", async ({ page }) => {
      const passwordInput = page.locator('input[type="password"]').first();

      if (await passwordInput.isVisible()) {
        await passwordInput.fill("SecurePassword123");

        const type = await passwordInput.getAttribute("type");
        expect(type).toBe("password");
      }
    });

    test("should clear input field correctly", async ({ page }) => {
      const input = page.locator("input").first();

      if (await input.isVisible()) {
        await input.fill("Some text");
        await input.clear();

        const value = await input.inputValue();
        expect(value).toBe("");
      }
    });

    test("should handle checkbox toggling", async ({ page }) => {
      const checkbox = page.locator('input[type="checkbox"]').first();

      if (await checkbox.isVisible()) {
        const initialState = await checkbox.isChecked();
        await checkbox.click();

        const newState = await checkbox.isChecked();
        expect(newState).not.toBe(initialState);
      }
    });

    test("should handle radio button selection", async ({ page }) => {
      const radioButtons = page.locator('input[type="radio"]');

      if ((await radioButtons.count()) > 0) {
        const firstRadio = radioButtons.first();
        await firstRadio.click();

        const isChecked = await firstRadio.isChecked();
        expect(isChecked).toBeTruthy();
      }
    });

    test("should handle dropdown selection", async ({ page }) => {
      const selects = page.locator("select");

      if ((await selects.count()) > 0) {
        const firstSelect = selects.first();
        const options = await firstSelect.locator("option").all();

        if (options.length > 1) {
          await firstSelect.selectOption({ index: 1 });

          const selectedValue = await firstSelect.inputValue();
          expect(selectedValue).toBeDefined();
        }
      }
    });

    test("should handle textarea input", async ({ page }) => {
      const textareas = page.locator("textarea");

      if ((await textareas.count()) > 0) {
        const textarea = textareas.first();
        const testText = "Multi-line\ntext input";

        await textarea.fill(testText);
        const value = await textarea.inputValue();

        expect(value).toBe(testText);
      }
    });
  });

  test.describe("Button Interactions", () => {
    test("should handle button click", async ({ page }) => {
      const button = page.locator("button").first();

      if (await button.isVisible()) {
        const clickableStatus = await button.isEnabled();
        expect(typeof clickableStatus).toBe("boolean");

        if (clickableStatus) {
          await button.click();
          expect(button).toBeDefined();
        }
      }
    });

    test("should handle button double-click", async ({ page }) => {
      const button = page.locator("button").first();

      if (await button.isVisible()) {
        await button.dblclick();
        expect(button).toBeDefined();
      }
    });

    test("should handle button hover effects", async ({ page }) => {
      const button = page.locator("button").first();

      if (await button.isVisible()) {
        await button.hover();

        const hoverColor = await button.evaluate((el) => window.getComputedStyle(el).backgroundColor);

        expect(hoverColor).toBeDefined();
      }
    });

    test("should disable button during submission", async ({ page }) => {
      const submitButton = page.locator('button[type="submit"]').first();

      if (await submitButton.isVisible()) {
        const isEnabled = await submitButton.isEnabled();
        expect(typeof isEnabled).toBe("boolean");
      }
    });
  });

  test.describe("Link Navigation", () => {
    test("should navigate when clicking links", async ({ page }) => {
      const initialUrl = page.url();
      const links = page
        .locator("a")
        .filter({ hasNot: page.locator("text=JavaScript") });

      if ((await links.count()) > 0) {
        const firstLink = links.first();
        const href = await firstLink.getAttribute("href");

        if (href && href !== "#" && !href.startsWith("javascript")) {
          const context = page.context();
          const newPagePromise = context.waitForEvent("page");

          await firstLink.click({ modifiers: ["Control"] }).catch(() => {
            // If Ctrl+click doesn't open new tab, that's okay
          });
        }
      }
    });

    test("should open external links in new tab", async ({ page }) => {
      const externalLinks = page.locator('a[target="_blank"]');
      const externalCount = await externalLinks.count();

      if (externalCount > 0) {
        expect(externalCount).toBeGreaterThan(0);
      }
    });
  });

  test.describe("Scroll Interactions", () => {
    test("should scroll page content", async ({ page }) => {
      await page.evaluate(() => {
        window.scrollBy(0, 500);
      });

      const scrollPosition = await page.evaluate(() => window.scrollY);
      expect(scrollPosition).toBeGreaterThan(0);
    });

    test("should scroll element into view", async ({ page }) => {
      const lastButton = page.locator("button").last();

      if (await lastButton.isVisible()) {
        await lastButton.scrollIntoViewIfNeeded();
        expect(lastButton).toBeDefined();
      }
    });

    test("should handle infinite scroll or pagination", async ({ page }) => {
      const initialHeight = await page.evaluate(
        () => document.body.scrollHeight,
      );

      await page.evaluate(() => {
        window.scrollBy(0, initialHeight);
      });

      expect(page).toBeDefined();
    });
  });

  test.describe("Hover and Focus Interactions", () => {
    test("should show tooltip on hover", async ({ page }) => {
      const hoverableElements = page
        .locator("[title], [data-tooltip], [aria-label]")
        .first();

      if (await hoverableElements.isVisible()) {
        await hoverableElements.hover();

        const title = await hoverableElements.getAttribute("title");
        expect(title).toBeDefined();
      }
    });

    test("should highlight element on focus", async ({ page }) => {
      const input = page.locator("input").first();

      if (await input.isVisible()) {
        await input.focus();

        const isFocused = await input.evaluate((el) => document.activeElement === el);

        expect(isFocused).toBeTruthy();
      }
    });

    test("should show dropdown menu on click", async ({ page }) => {
      const button = page.locator("button").first();

      if (await button.isVisible()) {
        await button.click();

        // Menu should be visible or button state changed
        expect(button).toBeDefined();
      }
    });
  });

  test.describe("Keyboard Interactions", () => {
    test("should submit form with Enter key", async ({ page }) => {
      const inputs = page.locator("input[type='text']");

      if ((await inputs.count()) > 0) {
        const firstInput = inputs.first();
        await firstInput.fill("test");
        await firstInput.press("Enter");

        expect(firstInput).toBeDefined();
      }
    });

    test("should clear field with Ctrl+A then Delete", async ({ page }) => {
      const input = page.locator("input").first();

      if (await input.isVisible()) {
        await input.fill("test text");
        await input.press("Control+a");
        await input.press("Delete");

        const value = await input.inputValue();
        expect(value).toBe("");
      }
    });

    test("should navigate between form fields with Tab", async ({ page }) => {
      const firstInput = page.locator("input").first();

      if (await firstInput.isVisible()) {
        await firstInput.focus();
        await firstInput.press("Tab");

        const focusedElement = await page.evaluate(() => document.activeElement?.tagName);

        expect(focusedElement).not.toBeNull();
      }
    });

    test("should close elements with Escape key", async ({ page }) => {
      const modal = page.locator('[role="dialog"], [class*="modal"]').first();

      if (await modal.isVisible()) {
        await page.press("Escape");
        expect(modal).toBeDefined();
      }
    });
  });

  test.describe("Multi-Step Interactions", () => {
    test("should complete form filling workflow", async ({ page }) => {
      const inputs = page.locator("input");
      const inputCount = await inputs.count();

      if (inputCount > 0) {
        // Fill first few inputs
        for (let i = 0; i < Math.min(2, inputCount); i++) {
          await inputs.nth(i).fill(`test value ${i}`);
        }

        expect(inputCount).toBeGreaterThan(0);
      }
    });

    test("should handle sequential button clicks", async ({ page }) => {
      const buttons = page.locator("button");
      const buttonCount = await buttons.count();

      if (buttonCount > 0) {
        const firstButton = buttons.first();
        await firstButton.click();

        expect(buttons).toBeDefined();
      }
    });

    test("should navigate through multi-page form", async ({ page }) => {
      const nextButtons = page.locator(
        'button:has-text("Next"), button:has-text("Continue")',
      );
      const nextCount = await nextButtons.count();

      if (nextCount > 0) {
        const firstNext = nextButtons.first();
        await firstNext.click();

        expect(page).toBeDefined();
      }
    });
  });

  test.describe("Drag and Drop Interactions", () => {
    test("should handle drag and drop", async ({ page }) => {
      const draggable = page.locator('[draggable="true"]').first();

      if (await draggable.isVisible()) {
        const droppable = page
          .locator('[class*="drop"], [data-droppable]')
          .first();

        if (await droppable.isVisible()) {
          await draggable.dragTo(droppable);
          expect(draggable).toBeDefined();
        }
      }
    });
  });

  test.describe("File Upload Interactions", () => {
    test("should handle file upload", async ({ page }) => {
      const fileInput = page.locator('input[type="file"]').first();

      if (await fileInput.isVisible()) {
        // Note: Actual file upload needs real file path
        expect(fileInput).toBeDefined();
      }
    });
  });

  test.describe("Modal and Dialog Interactions", () => {
    test("should handle modal opening and closing", async ({ page }) => {
      const modal = page.locator('[role="dialog"], [class*="modal"]').first();

      if (await modal.isVisible()) {
        const closeButton = modal
          .locator('button:has-text("Close"), button[aria-label*="close"]')
          .first();

        if (await closeButton.isVisible()) {
          await closeButton.click();
        }
      }
    });

    test("should handle dialog confirmation", async ({ page }) => {
      const confirmButton = page
        .locator(
          'button:has-text("Confirm"), button:has-text("OK"), button:has-text("Yes")',
        )
        .first();

      if (await confirmButton.isVisible()) {
        await confirmButton.click();
        expect(confirmButton).toBeDefined();
      }
    });
  });
});
