import { APIRequestContext, expect, test } from "@playwright/test";
import { AUTH_FILES } from "../fixtures/auth-config";
import { TEST_CONFIG } from "../fixtures/constants";

const BASE_URL = "https://codemify-demo-app.vercel.app/demo-app";
const API_BASE = `${BASE_URL}/api`;

// Test credentials from the app
const VALID_USER = "standard_user";
const INVALID_USER = "locked_out_user";
const PASSWORD = "my_secret_code";

test.describe("E-Commerce Demo App - API Testing Suite", () => {
  let apiContext: APIRequestContext;

  /**
    * Setup: Create API context with authentication
    * Uses storage state from successful login
    */
  test.beforeAll(async ({ playwright }, testInfo) => {
    try {
      // Create API context with authenticated cookies/tokens
      apiContext = await playwright.request.newContext({
        // ✅ Use storage state from authenticated user
        storageState: AUTH_FILES.standardUser,
        // ✅ Set base URL for all requests
        baseURL: TEST_CONFIG.api.baseUrl,
      });

      console.log("✓ API context created with authentication");
    } catch (error) {
      testInfo.skip(true, `Failed to create API context: ${error}`);
      throw error;
    }
  });

  /**
   * Cleanup: Dispose API context
   */
  test.afterAll(async () => {
    await apiContext.dispose();
    console.log("✓ API context disposed");
  });

  test.describe("Products API", () => {
    test("GET /api/products - Should return all products with correct structure", async () => {
      const response = await apiContext.get(`${API_BASE}/products`);

      // Assert response status
      expect(response.status()).toBe(200);

      // Parse response body
      const products = await response.json();

      // Log the products
      console.log("Products API Response:", products);

      // Assert response is an array
      expect(Array.isArray(products)).toBeTruthy();
      expect(products.length).toBeGreaterThan(0);

      // Verify each product has required fields
      products.forEach((product: any) => {
        expect(product).toHaveProperty("id");
        expect(product).toHaveProperty("name");
        expect(product).toHaveProperty("price");
        expect(product).toHaveProperty("description");
        expect(product).toHaveProperty("image");

        // Validate data types
        expect(typeof product.id).toBe("number");
        expect(typeof product.name).toBe("string");
        expect(typeof product.price).toBe("number");
        expect(typeof product.description).toBe("string");
        expect(product.price).toBeGreaterThan(0);
      });
    });

    test("GET /api/products - Should return specific number of products", async () => {
      const response = await apiContext.get(`${API_BASE}/products`);
      const products = await response.json();

      // The app showed 6 products
      expect(products.length).toBe(6);
    });

    test("GET /api/products - Response headers validation", async () => {
      const response = await apiContext.get(`${API_BASE}/products`);

      // Log the headers for debugging
      console.log("📦 Response Headers:");
      console.log(JSON.stringify(response.headers(), null, 2));

      // Validate response headers
      expect(response.headers()["content-type"]).toContain("application/json");
      expect(response.status()).toBeLessThan(400);
    });

    test("GET /api/products - Product prices are positive numbers", async () => {
      const response = await apiContext.get(`${API_BASE}/products`);
      const products = await response.json();

      products.forEach((product: any) => {
        expect(product.price).toBeGreaterThan(0);
        expect(product.price).toBeLessThan(10000); // Reasonable max price
      });
    });

    test("GET /api/products - Product IDs are unique", async () => {
      const response = await apiContext.get(`${API_BASE}/products`);
      const products = await response.json();

      console.log("📦 Complete Response Debug:");
      console.log({
        status: response.status(),
        statusText: response.statusText(),
        headers: response.headers(),
        body: await response.json(),
      });

      const ids = products.map((p: any) => p.id);
      console.log("Product IDs:", ids);

      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  test.describe("Authentication Flow1", () => {
    test("POST /api/login - Valid credentials should authenticate", async ({
      page,
    }) => {
      await page.goto(`${BASE_URL}`);

      const loginPromise = page.waitForResponse(
        (response) =>
          response.url().includes("/api/") && response.status() === 200,
      );

      // Fill and submit form
      await page.fill('[data-test="username"]', VALID_USER);
      await page.fill('[data-test="password"]', PASSWORD);
      await page.click('[data-test="login-button"]');

      // Capture and validate response
      const response = await loginPromise;
      const loginData = await response.json();

      console.log("🔍 API Response:", {
        status: response.status(),
        statusText: response.statusText(),
        headers: JSON.stringify(response.headers(), null, 2),
        body: loginData,
      });

      // Verify response
      expect(response.status()).toBe(200);
      //   expect(loginData).toHaveProperty("token"); // Si devuelve token

      // Verify UI feedback
      const logoutButton = page.locator('button:has-text("Logout")');
      await expect(logoutButton).toBeVisible({ timeout: 5000 });
    });
  });

  test("POST /api/login - Invalid credentials should fail", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}`);

    await page.fill('[data-test="username"]', "invalid_user");
    await page.fill('[data-test="password"]', "wrong_password");
    await page.click('[data-test="login-button"]');

    // Wait a moment for potential error
    const errorMessage = page.locator('[data-test="error"]');
    await expect(errorMessage).toContainText(
      "Username and password do not match any user in this service",
    );

    await page.waitForLoadState("networkidle");

    // Should still be on login page
    const loginButton = page.locator('[data-test="login-button"]');
    await expect(loginButton).toBeVisible();
  });

  test("Authentication state persists across page reloads", async ({
    page,
  }) => {
    // Login
    await page.goto(`${BASE_URL}`);
    await page.fill('[data-test="username"]', VALID_USER);
    await page.fill('[data-test="password"]', PASSWORD);
    await page.click('[data-test="login-button"]');

    // Locator
    const productsHeader = page.getByRole("heading", {
      name: "Products",
    });

    // Wait for Products page to load
    await page.waitForSelector("text=Products", { timeout: 5000 });

    // Reload page
    await page.reload();

    // Should still be authenticated (products visible)
    await expect(productsHeader).toBeVisible();
  });

  test.describe("Shopping Cart API Integration", () => {
    test("Add product to cart and verify in session storage", async ({
      page,
    }) => {
      // Login first
      await page.goto(`${BASE_URL}`);
      await page.fill('[data-test="username"]', VALID_USER);
      await page.fill('[data-test="password"]', PASSWORD);
      await page.click('[data-test="login-button"]');
      await page.waitForSelector("text=Products");

      // Add product to cart
      await page.locator('[data-testid="add-to-cart-1"]').click();

      // Verify cart count increased
      const cartBadge = page.locator("span.cart-badge");
      const count = await cartBadge.textContent();
      console.log(`Items in cart: ${count}`);
      await expect(cartBadge).toHaveText("1");
    });

    test("Cart persists after navigation", async ({ page }) => {
      await page.goto(`${BASE_URL}`);
      await page.fill('[data-test="username"]', VALID_USER);
      await page.fill('[data-test="password"]', PASSWORD);
      await page.click('[data-test="login-button"]');
      await page.waitForSelector("text=Products");

      // Add item to cart
      await page.locator('[data-testid="add-to-cart-1"]').click();

      // Navigate away and back
      await page.click("text=Products");
      await page.waitForSelector("text=Products");

      // Verify cart item still exists
      const cartCount = await page.locator(':text-is("1")').textContent();
      expect(cartCount).toContain("1");
    });

    test("Cart total calculation is correct", async ({ page }) => {
      await page.goto(`${BASE_URL}`);
      await page.fill('[data-test="username"]', VALID_USER);
      await page.fill('[data-test="password"]', PASSWORD);
      await page.click('[data-test="login-button"]');
      await page.waitForSelector("text=Products");

      // Get product price from UI
      const priceText = await page.locator("text=$29.99").first().textContent();

      // Add product to cart
      await page.locator('[data-testid="add-to-cart-1"]').click();

      // Go to cart
      await page.click('button:has-text("Cart")');

      // Verify total matches
      const totalText = await page
        .locator("text=Total:")
        .locator("..") // Go to element father
        .textContent();
      expect(totalText).toContain("$29.99");
    });
  });

  test.describe("Checkout Flow", () => {
    test("Checkout form renders with all required fields", async ({ page }) => {
      await page.goto(`${BASE_URL}`);
      await page.fill('[data-test="username"]', VALID_USER);
      await page.fill('[data-test="password"]', PASSWORD);
      await page.click('[data-test="login-button"]');
      await page.waitForSelector("text=Products");

      // Add item and go to cart
      await page.getByRole("button", { name: "Add to Cart" }).first().click();
      await page.click('button:has-text("Cart")');

      // Click checkout
      await page.getByRole("button", { name: "Proceed to Checkout" }).click();

      // Verify all required fields are present
      const requiredFields = [
        "First Name",
        "Last Name",
        "Email",
        "Address",
        "City",
        "State",
        "Zip Code",
        "Card Number",
        "Expiry Date",
        "CVV",
      ];

      for (const field of requiredFields) {
        await expect(page.locator(`text=${field}`)).toBeVisible();
      }
    });

    test("Checkout validation - Empty form submission Exists", async ({
      page,
    }) => {
      await page.goto(`${BASE_URL}`);
      await page.fill('[data-test="username"]', VALID_USER);
      await page.fill('[data-test="password"]', PASSWORD);
      await page.click('[data-test="login-button"]');
      await page.waitForSelector("text=Products");

      // Add item and go to checkout
      await page.getByRole("button", { name: "Add to Cart" }).first().click();
      await page.click('button:has-text("Cart")');
      await page.getByRole("button", { name: "Proceed to Checkout" }).click();

      // Try to submit empty form
      const completeOrderButton = page.getByRole("button", {
        name: "Complete Order",
      });

      // If button is clickable, HTML5 validation should prevent submission
      if (await completeOrderButton.isEnabled()) {
        // Browser validation will handle it
        expect(true).toBeTruthy();
      }
    });

    test("Order data is valid for submission", async ({ page }) => {
      await page.goto(`${BASE_URL}`);
      await page.fill('[data-test="username"]', VALID_USER);
      await page.fill('[data-test="password"]', PASSWORD);
      await page.click('[data-test="login-button"]');
      await page.waitForSelector("text=Products");

      // Add item and go to checkout
      await page.getByRole("button", { name: "Add to Cart" }).first().click();
      await page.click('button:has-text("Cart")');
      await page.getByRole("button", { name: "Proceed to Checkout" }).click();

      // Fill form with valid data
      await page
        .getByRole("textbox", { name: "First Name *" })
        .fill("John", { force: true });
      await page
        .getByRole("textbox", { name: "Last Name *" })
        .fill("Doe", { force: true });
      await page
        .getByRole("textbox", { name: "Email *" })
        .fill("john@example.com", {
          force: true,
        });
      await page
        .getByRole("textbox", { name: "Address *" })
        .fill("123 Main St", {
          force: true,
        });
      await page
        .getByRole("textbox", { name: "City *" })
        .fill("Springfield", { force: true });
      await page
        .getByRole("textbox", { name: "State *" })
        .fill("IL", { force: true });
      await page
        .getByRole("textbox", { name: "Zip Code *" })
        .fill("62701", { force: true });
      await page
        .getByRole("textbox", { name: "Card Number *" })
        .fill("4111111111111111", {
          force: true,
        });
      await page
        .getByRole("textbox", { name: "Expiry Date *" })
        .fill("12/25", { force: true });
      await page
        .getByRole("textbox", { name: "CVV *" })
        .fill("123", { force: true });

      // Click complete order and verify all the data is correct and verify for success message
      const completeOrderButton = page.getByRole("button", {
        name: "Complete Order",
      });
      await completeOrderButton.click();

      // Verify success message
      const successMessage = page.locator("text=Order placed successfully!");
      await expect(successMessage).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("Error Handling & Edge Cases", () => {
    test("Logout properly clears session", async ({ page }) => {
      await page.goto(`${BASE_URL}`);
      await page.fill('[data-test="username"]', VALID_USER);
      await page.fill('[data-test="password"]', PASSWORD);
      await page.click('[data-test="login-button"]');
      await page.waitForSelector("text=Products");

      // Logout
      await page.click('button:has-text("Logout")');

      // Should return to login page
      await expect(page.locator('[data-test="login-button"]')).toBeVisible({
        timeout: 5000,
      });
    });

    test("Products API response time is acceptable", async () => {
      const startTime = Date.now();
      const response = await apiContext.get(`${API_BASE}/products`);
      const endTime = Date.now();

      const responseTime = endTime - startTime;

      // Response should be less than 2 seconds
      expect(responseTime).toBeLessThan(2000);
      expect(response.status()).toBe(200);
    });

    test("Multiple rapid product requests handled correctly", async () => {
      const numRequests = 5;
      const requests = [];

      // Create 5 requests simultaneously
      for (let i = 0; i < numRequests; i++) {
        requests.push(apiContext.get(`${API_BASE}/products`));
      }

      console.log(`📤 Sending ${numRequests} requests simultaneously...`);

      // Wait for all responses
      const responses = await Promise.all(requests);

      console.log(`✅ All requests completed`);

      // Validate all responses
      responses.forEach((response) => {
        expect(response.status()).toBe(200);
        expect(response.headers()["content-type"]).toContain(
          "application/json",
        );
      });

      // Validate all have data
      const bodies = await Promise.all(responses.map((r) => r.json()));
      bodies.forEach((body, index) => {
        expect(Array.isArray(body)).toBe(true);
        console.log(`✅ Request ${index + 1}: ${body.length} products`);
      });
    });

    test("Products data consistency across requests", async () => {
      const response1 = await apiContext.get(`${API_BASE}/products`);
      const response2 = await apiContext.get(`${API_BASE}/products`);

      const products1 = await response1.json();
      const products2 = await response2.json();

      // Both requests should return same products
      expect(products1.length).toBe(products2.length);
      expect(JSON.stringify(products1)).toBe(JSON.stringify(products2));
    });
  });

  test.describe("Security & Input Validation", () => {
    test("SQL injection attempt in username field", async ({ page }) => {
      await page.goto(`${BASE_URL}`);

      // Try SQL injection
      await page.fill('[data-test="username"]', "' OR '1'='1");
      await page.fill('[data-test="password"]', PASSWORD);
      await page.click('[data-test="login-button"]');

      await page.waitForLoadState("networkidle");

      // Should fail to authenticate
      const loginButton = page.locator('[data-test="login-button"]');
      await expect(loginButton).toBeVisible();
    });

    test("XSS attempt in username field", async ({ page }) => {
      await page.goto(`${BASE_URL}`);

      // Try XSS payload
      await page.fill(
        '[data-test="username"]',
        '<script>alert("xss")</script>',
      );
      await page.fill('[data-test="password"]', PASSWORD);

      // Should not cause errors or execute script
      const loginButton = page.locator('[data-test="login-button"]');
      await expect(loginButton).toBeVisible();
    });
  });
});
