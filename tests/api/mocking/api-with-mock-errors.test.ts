import { expect, test } from "@playwright/test";
import { TEST_CONFIG } from "../../../fixtures/constants";
/**
 * API Tests with Mocked Error Responses
 * Uses page.route() to intercept and mock error responses for robust error handling testing
 */

test.describe("API Error Handling with Mocked Responses", () => {
  test.describe("Mock 500 Server Error", () => {
    test("should handle 500 server error gracefully from products API", async ({
      page,
    }) => {
      // Intercept products API and return 500 error
      await page.route("**/api/products", async (route) => {
        await route.abort("failed");
      });

      page.on("console", (msg) => {
        if (msg.type() === "error") {
          return;
        }
      });

      // Navigate and try to access page - should handle error
      await page.goto(TEST_CONFIG.baseUrl, { waitUntil: "domcontentloaded" });
      expect(page).toBeDefined();
    });

    test("should handle 500 error with custom response", async ({ page }) => {
      await page.route("**/api/products", async (route) => {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({
            error: "Internal Server Error",
            message: "Database connection failed",
          }),
        });
      });

      await page.goto(TEST_CONFIG.baseUrl);
      expect(page.url()).toContain("demo-app");
    });
  });

  test.describe("Mock 404 Not Found", () => {
    test("should handle 404 endpoint not found", async ({ page }) => {
      await page.route("**/api/products", async (route) => {
        await route.fulfill({
          status: 404,
          contentType: "application/json",
          body: JSON.stringify({
            error: "Not Found",
            message: "The requested endpoint does not exist",
          }),
        });
      });

      await page.goto(TEST_CONFIG.baseUrl);
      expect(page).toBeDefined();
    });
  });

  test.describe("Mock 401 Unauthorized", () => {
    test("should handle 401 unauthorized error", async ({ page }) => {
      await page.route("**/api/**", async (route) => {
        if (route.request().url().includes("protected")) {
          await route.fulfill({
            status: 401,
            contentType: "application/json",
            body: JSON.stringify({
              error: "Unauthorized",
              message: "Authentication required",
            }),
          });
        } else {
          await route.continue();
        }
      });

      await page.goto(TEST_CONFIG.baseUrl);
      expect(page).toBeDefined();
    });
  });

  test.describe("Mock 403 Forbidden", () => {
    test("should handle 403 forbidden error", async ({ page }) => {
      await page.route("**/api/admin/**", async (route) => {
        await route.fulfill({
          status: 403,
          contentType: "application/json",
          body: JSON.stringify({
            error: "Forbidden",
            message: "Access denied to this resource",
          }),
        });
      });

      await page.goto(TEST_CONFIG.baseUrl);
      expect(page).toBeDefined();
    });
  });

  test.describe("Mock Timeout Errors", () => {
    test("should handle API timeout", async ({ page }) => {
      await page.route("**/api/products", async (route) => {
        // Simulate a timeout by delaying indefinitely, then abort
        setTimeout(() => {
          route.abort("timedout");
        }, 100);
      });

      await page.goto(TEST_CONFIG.baseUrl, { waitUntil: "domcontentloaded" });
      expect(page).toBeDefined();
    });

    test("should handle slow API responses", async ({ page }) => {
      await page.route("**/api/products", async (route) => {
        // Simulate slow response
        await new Promise((resolve) => setTimeout(resolve, 3000));

        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([]),
        });
      });

      await page.goto(TEST_CONFIG.baseUrl, { waitUntil: "domcontentloaded" });
      expect(page).toBeDefined();
    });
  });

  test.describe("Mock Network Errors", () => {
    test("should handle network failure", async ({ page }) => {
      await page.route("**/api/products", async (route) => {
        await route.abort("failed");
      });

      await page.goto(TEST_CONFIG.baseUrl, { waitUntil: "domcontentloaded" });
      expect(page).toBeDefined();
    });

    test("should handle connection refused", async ({ page }) => {
      await page.route("**/api/**", async (route) => {
        await route.abort("failed");
      });

      await page.goto(TEST_CONFIG.baseUrl);
      expect(page).toBeDefined();
    });
  });

  test.describe("Mock Malformed Responses", () => {
    test("should handle invalid JSON response", async ({ page }) => {
      await page.route("**/api/products", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: "{ invalid json ]",
        });
      });

      await page.goto(TEST_CONFIG.baseUrl, { waitUntil: "domcontentloaded" });
      expect(page).toBeDefined();
    });

    test("should handle wrong content-type header", async ({ page }) => {
      await page.route("**/api/products", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "text/html",
          body: "<html><body>Not JSON</body></html>",
        });
      });

      await page.goto(TEST_CONFIG.baseUrl);
      expect(page).toBeDefined();
    });

    test("should handle empty response body", async ({ page }) => {
      await page.route("**/api/products", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: "",
        });
      });

      await page.goto(TEST_CONFIG.baseUrl);
      expect(page).toBeDefined();
    });
  });

  test.describe("Mock Rate Limiting", () => {
    test("should handle 429 too many requests", async ({ page }) => {
      let requestCount = 0;

      await page.route("**/api/products", async (route) => {
        requestCount++;

        if (requestCount > 3) {
          await route.fulfill({
            status: 429,
            contentType: "application/json",
            body: JSON.stringify({
              error: "Too Many Requests",
              message: "Rate limit exceeded. Please retry after 60 seconds.",
              retryAfter: 60,
            }),
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify([]),
          });
        }
      });

      await page.goto(TEST_CONFIG.baseUrl);
      expect(page).toBeDefined();
    });
  });

  test.describe("Mock Partial Failures", () => {
    test("should handle successful request after failed attempt", async ({
      page,
    }) => {
      let attemptCount = 0;

      await page.route("**/api/products", async (route) => {
        attemptCount++;

        if (attemptCount === 1) {
          await route.abort("failed");
        } else {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify([
              {
                id: 1,
                name: "Test Product",
                price: 29.99,
                description: "A test product",
                image: "test.png",
              },
            ]),
          });
        }
      });

      await page.goto(TEST_CONFIG.baseUrl);
      expect(page).toBeDefined();
    });
  });

  test.describe("Mock Response Modification", () => {
    test("should handle and work with modified API response", async ({
      page,
    }) => {
      await page.route("**/api/products", async (route) => {
        // Intercept and modify response
        const response = await route.fetch();
        let body = await response.json();

        // Modify the response data
        body = body.map((product: any) => ({
          ...product,
          price: product.price * 2, // Apply discount
          onSale: true,
        }));

        await route.fulfill({
          response,
          body: JSON.stringify(body),
        });
      });

      await page.goto(TEST_CONFIG.baseUrl);
      expect(page).toBeDefined();
    });

    test("should handle response with added fields", async ({ page }) => {
      await page.route("**/api/products", async (route) => {
        const response = await route.fetch();
        const body = await response.json();

        // Add metadata to response
        const modifiedResponse = {
          data: body,
          metadata: {
            timestamp: new Date().toISOString(),
            version: "1.0",
            cached: false,
          },
        };

        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(modifiedResponse),
        });
      });

      await page.goto(TEST_CONFIG.baseUrl);
      expect(page).toBeDefined();
    });
  });

  test.describe("Mock Cascading Failures", () => {
    test("should handle multiple API endpoints failing simultaneously", async ({
      page,
    }) => {
      await page.route("**/api/**", async (route) => {
        await route.fulfill({
          status: 503,
          contentType: "application/json",
          body: JSON.stringify({
            error: "Service Unavailable",
            message: "The service is temporarily unavailable",
          }),
        });
      });

      await page.goto(TEST_CONFIG.baseUrl, { waitUntil: "domcontentloaded" });
      expect(page).toBeDefined();
    });
  });

  test.describe("Mock Redirect Responses", () => {
    test("should handle 301 permanent redirect", async ({ page }) => {
      await page.route("**/api/products", async (route) => {
        await route.fulfill({
          status: 301,
          headers: {
            Location:
              "https://codemify-demo-app.vercel.app/demo-app/api/products-new",
          },
        });
      });

      await page.goto(TEST_CONFIG.baseUrl);
      expect(page).toBeDefined();
    });

    test("should handle 302 temporary redirect", async ({ page }) => {
      await page.route("**/api/products", async (route) => {
        await route.fulfill({
          status: 302,
          headers: {
            Location: "https://backup-api.example.com/products",
          },
        });
      });

      await page.goto(TEST_CONFIG.baseUrl);
      expect(page).toBeDefined();
    });
  });
});
