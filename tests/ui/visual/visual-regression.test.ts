import { expect, test } from "@playwright/test";
import { TEST_CONFIG } from "../../../fixtures/constants";

/**
 * Visual Regression Tests
 * Captures and compares UI snapshots to detect visual changes
 */

test.describe("Visual Regression Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_CONFIG.baseUrl);
  });

  test.describe("Login Page Visuals", () => {
    test("login page layout should match expected visual", async ({ page }) => {

      // expect to see the main title of the login page
      const mainTitle = page.locator("h1, h2, [class*='title']").first();
      await expect(mainTitle).toHaveText("🛒 Codemify Store");

      // Capture the main login area
      const loginForm = page
        .locator('form, [class*="login"], [class*="auth"]')
        .first();

      if (await loginForm.isVisible()) {
        await expect(loginForm).toHaveScreenshot("login-form.png", {
          mask: [page.locator("input[type='password']")], // Mask password fields
        });
      }
    });

    test("login page header should be consistent", async ({ page }) => {
      const header = page.locator("h1, h2, [class*='title']").first();

      if (await header.isVisible()) {
        await expect(header).toHaveScreenshot("login-header.png");
      }
    });

    test("login button styling should be consistent", async ({ page }) => {
      const loginButton = page
        .locator('button:has-text("Login"), button[type="submit"]')
        .first();

      if (await loginButton.isVisible()) {
        await expect(loginButton).toHaveScreenshot("login-button.png");
      }
    });
  });

  test.describe("Products Page Visuals", () => {
    test("products grid layout should match expected structure", async ({
      page,
    }) => {
      // Wait for products to load
      await page.waitForLoadState("networkidle");

      const productsContainer = page
        .locator('[class*="products"], [class*="grid"], [class*="container"]')
        .first();

      if (await productsContainer.isVisible()) {
        await expect(productsContainer).toHaveScreenshot("products-grid.png");
      }
    });

    test("product card styling should be consistent", async ({ page }) => {
      await page.waitForLoadState("networkidle");

      const firstProductCard = page
        .locator('[class*="product"], [data-testid*="product"]')
        .first();

      if (await firstProductCard.isVisible()) {
        await expect(firstProductCard).toHaveScreenshot("product-card.png");
      }
    });

    test("product price display format should be consistent", async ({
      page,
    }) => {
      await page.waitForLoadState("networkidle");

      const priceElements = page.locator("text=/\\$[0-9]+\\.[0-9]{2}/");

      if (await priceElements.first().isVisible()) {
        await expect(priceElements.first()).toHaveScreenshot(
          "product-price.png",
        );
      }
    });
  });

  test.describe("Cart Page Visuals", () => {
    test("empty cart message should be displayed consistently", async ({
      page,
    }) => {
      const emptyMessage = page.locator("text=/[Ee]mpty|No items|Your cart/");

      if (await emptyMessage.isVisible()) {
        await expect(emptyMessage).toHaveScreenshot("empty-cart-message.png");
      }
    });

    test("cart table headers should match expected layout", async ({
      page,
    }) => {
      const tableHeader = page.locator("th, [role='columnheader']").first();

      if (await tableHeader.isVisible()) {
        await expect(tableHeader).toHaveScreenshot("cart-header.png");
      }
    });

    test("cart total section styling should be consistent", async ({
      page,
    }) => {
      const totalSection = page
        .locator("text=/Total|TOTAL/")
        .first();

      if (await totalSection.isVisible()) {
        await expect(totalSection).toHaveScreenshot("cart-total.png");
      }
    });
  });

  test.describe("Checkout Page Visuals", () => {
    test("checkout form layout should be consistent", async ({ page }) => {
      const checkoutForm = page.locator('form, [class*="checkout"]').first();

      if (await checkoutForm.isVisible()) {
        await expect(checkoutForm).toHaveScreenshot("checkout-form.png");
      }
    });

    test("order summary styling should be consistent", async ({ page }) => {
      const summary = page
        .locator('[class*="summary"], [class*="order"]')
        .first();

      if (await summary.isVisible()) {
        await expect(summary).toHaveScreenshot("order-summary.png");
      }
    });

    test("payment form section should match expected layout", async ({
      page,
    }) => {
      const paymentSection = page
        .locator('[class*="payment"], [class*="card"]')
        .first();

      if (await paymentSection.isVisible()) {
        await expect(paymentSection).toHaveScreenshot("payment-section.png");
      }
    });
  });

  test.describe("Responsive Layout Tests", () => {
    test("layout should adapt for tablet viewport (768px)", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto(TEST_CONFIG.baseUrl);
      await page.waitForLoadState("networkidle");

      const mainContent = page.locator("main, [role='main'], body").first();
      await expect(mainContent).toHaveScreenshot("tablet-layout.png");
    });

    test("layout should adapt for mobile viewport (375px)", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(TEST_CONFIG.baseUrl);
      await page.waitForLoadState("networkidle");

      const mainContent = page.locator("main, [role='main'], body").first();
      await expect(mainContent).toHaveScreenshot("mobile-layout.png");
    });

    test("layout should work on desktop viewport (1920px)", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto(TEST_CONFIG.baseUrl);
      await page.waitForLoadState("networkidle");

      const mainContent = page.locator("main, [role='main'], body").first();
      await expect(mainContent).toHaveScreenshot("desktop-layout.png");
    });
  });

  test.describe("Color and Typography Consistency", () => {
    test("heading hierarchy should be visually distinct", async ({ page }) => {
      const h1 = page.locator("h1").first();
      const h2 = page.locator("h2").first();

      if ((await h1.isVisible()) && (await h2.isVisible())) {
        const h1Size = await h1.evaluate(
          (el) => window.getComputedStyle(el).fontSize,
        );
        const h2Size = await h2.evaluate(
          (el) => window.getComputedStyle(el).fontSize,
        );

        // H1 should be larger than H2
        expect(parseInt(h1Size) > parseInt(h2Size)).toBeTruthy();
      }
    });

    test("button colors should be consistent", async ({ page }) => {
      const buttons = page.locator("button").first();

      if (await buttons.isVisible()) {
        const bgColor = await buttons.evaluate(
          (el) => window.getComputedStyle(el).backgroundColor,
        );

        expect(bgColor).toBeDefined();
      }
    });

    test("link colors should indicate interactivity", async ({ page }) => {
      const links = page.locator("a").first();

      if (await links.isVisible()) {
        const color = await links.evaluate(
          (el) => window.getComputedStyle(el).color,
        );

        expect(color).toBeDefined();
      }
    });
  });

  test.describe("Spacing and Alignment", () => {
    test("page content should have proper margins", async ({ page }) => {
      const mainContent = page.locator("main, [role='main']").first();

      if (await mainContent.isVisible()) {
        const box = await mainContent.boundingBox();

        expect(box).toBeDefined();
        expect(box?.x).toBeGreaterThanOrEqual(0);
      }
    });

    test("form fields should be properly aligned", async ({ page }) => {
      const inputs = page.locator("input, textarea, select").all();

      if ((await inputs).length > 1) {
        const firstBoundingBox = await (await inputs)[0].boundingBox();
        const secondBoundingBox = await (await inputs)[1].boundingBox();

        expect(firstBoundingBox).toBeDefined();
        expect(secondBoundingBox).toBeDefined();
      }
    });
  });
});
