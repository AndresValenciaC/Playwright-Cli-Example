import { APIRequestContext, expect, test } from "@playwright/test";
import { AUTH_FILES } from "../../../fixtures/auth-config";
import { TEST_CONFIG } from "../../../fixtures/constants";
/**
 * API Smoke Tests - Core functionality happy path
 * These tests verify the API is working correctly with valid requests
 */
test.describe("E-Commerce Demo App - API Smoke Tests", () => {
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

  test.describe("Products API - Smoke Tests", () => {
    test("GET /api/products - Should return all products with correct structure", async () => {
      const response = await apiContext.get(TEST_CONFIG.api.products);

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
      const response = await apiContext.get(TEST_CONFIG.api.products);
      const products = await response.json();

      // The app showed 6 products
      expect(products.length).toBe(6);
    });

    test("GET /api/products - Response headers validation", async () => {
      const response = await apiContext.get(TEST_CONFIG.api.products);

      // Log the headers for debugging
      console.log("📦 Response Headers:");
      console.log(JSON.stringify(response.headers(), null, 2));

      // Validate response headers
      expect(response.headers()["content-type"]).toContain("application/json");
      expect(response.status()).toBeLessThan(400);
    });

    test("GET /api/products - Response time should be acceptable", async () => {
      const startTime = Date.now();
      const response = await apiContext.get(TEST_CONFIG.api.products);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status()).toBe(200);
      expect(responseTime).toBeLessThan(5000); // 5 seconds
      console.log(`Response time: ${responseTime}ms`);
    });
  });
});
