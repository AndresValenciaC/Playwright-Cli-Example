import { APIRequestContext, expect, test } from "@playwright/test";
import { AUTH_FILES } from "../../../fixtures/auth-config";
import { TEST_CONFIG } from "../../../fixtures/constants";

/**
 * API Edge Case Tests - Boundary conditions and edge scenarios
 * These tests verify the API handles edge cases correctly
 */
test.describe("E-Commerce Demo App - API Edge Tests", () => {
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

  test.describe("Products API - Edge Case Tests", () => {
    test("GET /api/products - Product prices are positive numbers", async () => {
      const response = await apiContext.get(TEST_CONFIG.api.products);
      const products = await response.json();

      products.forEach((product: any) => {
        expect(product.price).toBeGreaterThan(0);
        expect(product.price).toBeLessThan(10000); // Reasonable max price
        expect(typeof product.price).toBe("number");
      });
    });

    test("GET /api/products - Product IDs are unique", async () => {
      const response = await apiContext.get(TEST_CONFIG.api.products);
      const products = await response.json();

      console.log("📦 Complete Response Debug:");
      console.log({
        status: response.status(),
        statusText: response.statusText(),
        headers: response.headers(),
        body: products,
      });

      const ids = products.map((p: any) => p.id);
      console.log("Product IDs:", ids);

      // Verify all IDs are unique
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);

      // Verify all IDs are positive numbers
      ids.forEach((id: any) => {
        expect(typeof id).toBe("number");
        expect(id).toBeGreaterThan(0);
      });
    });

    test("GET /api/products - Product names are not empty", async () => {
      const response = await apiContext.get(TEST_CONFIG.api.products);
      const products = await response.json();

      products.forEach((product: any) => {
        expect(product.name).toBeTruthy();
        expect(product.name.length).toBeGreaterThan(0);
        expect(typeof product.name).toBe("string");
      });
    });

    test("GET /api/products - Product descriptions are present", async () => {
      const response = await apiContext.get(TEST_CONFIG.api.products);
      const products = await response.json();

      products.forEach((product: any) => {
        expect(product.description).toBeTruthy();
        expect(product.description.length).toBeGreaterThan(0);
      });
    });

    test("GET /api/products - Product images exist", async () => {
      const response = await apiContext.get(TEST_CONFIG.api.products);
      const products = await response.json();

      products.forEach((product: any) => {
        expect(product.image).toBeTruthy();
        expect(typeof product.image).toBe("string");
      });
    });

    test("GET /api/products - Verify no null or undefined values in products", async () => {
      const response = await apiContext.get(TEST_CONFIG.api.products);
      const products = await response.json();

      products.forEach((product: any) => {
        Object.values(product).forEach((value: any) => {
          expect(value).not.toBeNull();
          expect(value).not.toBeUndefined();
        });
      });
    });
  });
});
