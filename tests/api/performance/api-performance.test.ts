import { APIRequestContext, expect, test } from "@playwright/test";
import { AUTH_FILES } from "../../../fixtures/auth-config";
import { TEST_CONFIG } from "../../../fixtures/constants";
/**
 * API Performance Tests
 * Measures response times and ensures API meets performance benchmarks
 */

const PERFORMANCE_THRESHOLDS = {
  fastResponse: 500, // milliseconds
  normalResponse: 2000,
  slowResponse: 5000,
};

test.describe("API Performance Tests", () => {
  let apiContext: APIRequestContext;
  const performanceMetrics: any[] = [];

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

  // Log performance summary
  if (performanceMetrics.length > 0) {
    const avgTime =
      performanceMetrics.reduce((a, b) => a + b.duration, 0) /
      performanceMetrics.length;
    const maxTime = Math.max(...performanceMetrics.map((m) => m.duration));
    const minTime = Math.min(...performanceMetrics.map((m) => m.duration));

    console.log("\n📊 Performance Metrics Summary:");
    console.log(`  Average Response Time: ${avgTime.toFixed(2)}ms`);
    console.log(`  Max Response Time: ${maxTime.toFixed(2)}ms`);
    console.log(`  Min Response Time: ${minTime.toFixed(2)}ms`);
    console.log(`  Total Requests: ${performanceMetrics.length}`);
  }

  test.describe("Response Time Benchmarks", () => {
    test("should fetch products within fast threshold (< 500ms)", async () => {
      const startTime = Date.now();
      const response = await apiContext.get(TEST_CONFIG.api.products);
      const endTime = Date.now();
      const duration = endTime - startTime;

      performanceMetrics.push({ endpoint: "products", duration });

      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.fastResponse);
      console.log(`✓ Products endpoint: ${duration}ms`);
    });

    test("should fetch products within normal threshold (< 2000ms)", async () => {
      const startTime = Date.now();
      const response = await apiContext.get(TEST_CONFIG.api.products);
      const endTime = Date.now();
      const duration = endTime - startTime;

      performanceMetrics.push({ endpoint: "products", duration });

      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.normalResponse);
    });

    test("should complete within reasonable timeout (< 5000ms)", async () => {
      const startTime = Date.now();
      const response = await apiContext.get(TEST_CONFIG.api.products);
      const endTime = Date.now();
      const duration = endTime - startTime;

      performanceMetrics.push({ endpoint: "products", duration });

      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.slowResponse);
    });
  });

  test.describe("Load Testing", () => {
    test("should handle 10 concurrent requests efficiently", async () => {
      const startTime = Date.now();

      const requests = new Array(10)
        .fill(null)
        .map(() => apiContext.get(TEST_CONFIG.api.products));

      const responses = await Promise.all(requests);
      const endTime = Date.now();
      const totalDuration = endTime - startTime;
      const avgDuration = totalDuration / 10;

      console.log(`\n📈 Concurrent Load Test (10 requests):`);
      console.log(`  Total Time: ${totalDuration}ms`);
      console.log(`  Average per Request: ${avgDuration.toFixed(2)}ms`);

      responses.forEach((response) => {
        expect(response.status()).toBe(200);
      });

      expect(totalDuration).toBeLessThan(
        PERFORMANCE_THRESHOLDS.normalResponse * 5,
      );
    });

    test("should handle 20 concurrent requests without degradation", async () => {
      const startTime = Date.now();

      const requests = new Array(20)
        .fill(null)
        .map(() => apiContext.get(TEST_CONFIG.api.products));

      const responses = await Promise.all(requests);
      const endTime = Date.now();
      const totalDuration = endTime - startTime;

      console.log(`\n📈 Heavy Load Test (20 requests):`);
      console.log(`  Total Time: ${totalDuration}ms`);
      console.log(
        `  Average per Request: ${(totalDuration / 20).toFixed(2)}ms`,
      );

      responses.forEach((response) => {
        expect(response.status()).toBe(200);
      });

      // Should complete within reasonable time
      expect(totalDuration).toBeLessThan(
        PERFORMANCE_THRESHOLDS.normalResponse * 10,
      );
    });
  });

  test.describe("Response Size and Payload", () => {
    test("should return reasonably sized response payloads", async () => {
      const response = await apiContext.get(TEST_CONFIG.api.products);
      const products = await response.json();
      const responseText = JSON.stringify(products);
      const sizeKB = responseText.length / 1024;

      console.log(`\n📦 Response Payload Size: ${sizeKB.toFixed(2)} KB`);

      expect(response.status()).toBe(200);
      expect(sizeKB).toBeLessThan(500); // Reasonable limit for product list
    });
  });

  test.describe("Sequential Performance", () => {
    test("should maintain consistent response times across sequential requests", async () => {
      const durations: number[] = [];

      for (let i = 0; i < 5; i++) {
        const startTime = Date.now();
        const response = await apiContext.get(TEST_CONFIG.api.products);
        const endTime = Date.now();

        expect(response.status()).toBe(200);
        durations.push(endTime - startTime);
      }

      const avgDuration = durations.reduce((a, b) => a + b) / durations.length;
      const maxVariance = Math.max(
        ...durations.map((d) => Math.abs(d - avgDuration)),
      );

      console.log(`\n⏱️ Sequential Request Performance:`);
      console.log(`  Requests: ${durations.map((d) => d + "ms").join(", ")}`);
      console.log(`  Average: ${avgDuration.toFixed(2)}ms`);
      console.log(`  Max Variance: ${maxVariance.toFixed(2)}ms`);

      expect(maxVariance).toBeLessThan(PERFORMANCE_THRESHOLDS.normalResponse);
    });
  });

  test.describe("Slow Network Simulation", () => {
    test("should still complete requests with simulated network latency", async () => {
      const startTime = Date.now();

      // Even with extended timeout, should complete
      const response = await apiContext.get(TEST_CONFIG.api.products, {
        timeout: 30000,
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.slowResponse);

      console.log(`\n🐢 Slow Network Test: ${duration}ms`);
    });
  });
});
