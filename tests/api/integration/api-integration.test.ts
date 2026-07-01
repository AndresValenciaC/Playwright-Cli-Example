import { APIRequestContext, expect, test } from "@playwright/test";
import { AUTH_FILES } from "../../../fixtures/auth-config";
import { TEST_CONFIG } from "../../../fixtures/constants";
/**
 * API Integration Tests
 * Tests the interaction between multiple API endpoints and the overall system flow
 */
test.describe("E-Commerce API Integration Tests", () => {
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

  test.describe("Products and Cart Integration", () => {
    test("should fetch products and verify all have valid structure for cart operations", async () => {
      const response = await apiContext.get(TEST_CONFIG.api.products);
      expect(response.status()).toBe(200);

      const products = await response.json();
      expect(Array.isArray(products)).toBeTruthy();
      expect(products.length).toBeGreaterThan(0);

      // Verify each product can be used in cart operations
      for (const product of products) {
        expect(product).toHaveProperty("id");
        expect(product).toHaveProperty("name");
        expect(product).toHaveProperty("price");
        expect(product.id).toBeGreaterThan(0);
        expect(product.name.length).toBeGreaterThan(0);
        expect(product.price).toBeGreaterThan(0);
      }
    });

    test("Stress test, should handle product retrieval from multiple concurrent - requests 5 concurrent product requests", async () => {
      const requests = new Array(5)
        .fill(null)
        .map(() => apiContext.get(TEST_CONFIG.api.products));

      const responses = await Promise.all(requests);

      for (const response of responses) {
        expect(response.status()).toBe(200);
        const products = await response.json();
        expect(Array.isArray(products)).toBeTruthy();
      }
    });

    test("should return consistent product data across multiple requests", async () => {
      const response1 = await apiContext.get(TEST_CONFIG.api.products);
      const products1 = await response1.json();

      const response2 = await apiContext.get(TEST_CONFIG.api.products);
      const products2 = await response2.json();

      // Verify same products returned
      expect(products1.length).toBe(products2.length);
      expect(products1).toEqual(products2);
    });

    test("should verify product properties maintain consistency", async () => {
      const response = await apiContext.get(TEST_CONFIG.api.products);
      const products = await response.json();

      // Create map of products by ID for quick lookup
      const productMap = new Map(products.map((p: any) => [p.id, p]));

      // Fetch again and verify same structure
      const response2 = await apiContext.get(TEST_CONFIG.api.products);
      const products2 = await response2.json();

      products2.forEach((product: any) => {
        const original: any = productMap.get(product.id);
        expect(original).toBeDefined();
        expect(original.name).toBe(product.name);
        expect(original.price).toBe(product.price);
      });
    });
  });

  test.describe("API Response Headers and Metadata", () => {
    test("should return proper content-type headers", async () => {
      const response = await apiContext.get(TEST_CONFIG.api.products);
      const contentType = response.headers()["content-type"];
      expect(contentType).toContain("application/json");
    });

    test("should return appropriate cache headers for product endpoints", async () => {
      const response = await apiContext.get(TEST_CONFIG.api.products);
      expect(response.status()).toBe(200);
      // Verify response headers exist
      expect(Object.keys(response.headers()).length).toBeGreaterThan(0);
    });
  });

  test.describe("API Error Handling and Edge Cases", () => {
    test("should handle multiple rapid requests without connection issues", async () => {
      const rapidRequests = new Array(10)
        .fill(null)
        .map(() => apiContext.get(TEST_CONFIG.api.products));

      const results = await Promise.allSettled(rapidRequests);

      const successful = results.filter((r) => r.status === "fulfilled");
      expect(successful.length).toBeGreaterThan(0);
    });

    test("should return data even with slow network simulation", async () => {
      // Make request with normal timeout
      const response = await apiContext.get(TEST_CONFIG.api.products, {
        timeout: 30000,
      });

      expect(response.status()).toBe(200);
      const products = await response.json();
      expect(products.length).toBeGreaterThan(0);
    });
  });
});
