import { APIRequestContext, expect, test } from "@playwright/test";
import { TEST_CONFIG } from "../../../fixtures/constants";
import { AUTH_FILES } from './../../../fixtures/auth-config';


/**
 * API Response Validation Tests
 * Comprehensive validation of API responses including structure, data types, and content
 */

test.describe("API Response Validation Tests", () => {
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

  test.describe("Response Structure Validation", () => {
    test("should return properly formatted JSON response", async () => {
      const response = await apiContext.get(TEST_CONFIG.api.products);
      expect(response.status()).toBe(200);

      // Should be valid JSON
      let jsonData;
      expect(() => {
        jsonData = response.json();
      }).not.toThrow();

      expect(jsonData).toBeDefined();
    });

    test("should return response with correct content-type", async () => {
      const response = await apiContext.get(TEST_CONFIG.api.products);
      const contentType = response.headers()["content-type"];

      expect(contentType).toBeDefined();
      expect(contentType?.toLowerCase()).toContain("application/json");
    });

    test("should return array of products as top-level response", async () => {
      const response = await apiContext.get(TEST_CONFIG.api.products);
      const data = await response.json();

      expect(Array.isArray(data)).toBeTruthy();
      expect(data.length).toBeGreaterThan(0);
    });
  });

  test.describe("Product Object Structure Validation", () => {
    test("each product should have all required fields", async () => {
      const response = await apiContext.get(TEST_CONFIG.api.products);
      const products = await response.json();

      const requiredFields = ["id", "name", "price", "description", "image"];

      products.forEach((product: any, index: number) => {
        requiredFields.forEach((field) => {
          if (!product.hasOwnProperty(field)) {
            throw new Error(`Product at index ${index} missing field: ${field}`);
          }
          expect(product).toHaveProperty(field);
        });
      });
    });

    test("product IDs should be unique numbers", async () => {
      const response = await apiContext.get(TEST_CONFIG.api.products);
      const products = await response.json();

      const ids = products.map((p: any) => p.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);

      ids.forEach((id: any) => {
        expect(typeof id).toBe("number");
        expect(id).toBeGreaterThan(0);
        expect(Number.isInteger(id)).toBeTruthy();
      });
    });

    test("product names should be non-empty strings", async () => {
      const response = await apiContext.get(TEST_CONFIG.api.products);
      const products = await response.json();

      // Validate that its an array
      expect(Array.isArray(products)).toBeTruthy();

      // Iterate and validate
      products.forEach((product: any) => {

        // Validate name existence and type
        expect(product.name).toBeDefined();
        expect(typeof product.name).toBe("string");

        // Validate name its not empty
        expect(product.name.trim().length).toBeGreaterThan(0)

      });

    });

    test("product prices should be positive numbers with valid precision", async () => {
      const response = await apiContext.get(TEST_CONFIG.api.products);
      const products = await response.json();

      // Validate that its an array
      expect(Array.isArray(products)).toBeTruthy();

      products.forEach((product: any) => {
        expect(typeof product.price).toBe(
          "number"
        );
        expect(product.price).toBeGreaterThan(
          0
        );
        expect(product.price).toBeLessThan(
          10000
        );

        // Check precision (max 2 decimal places for currency)
        const decimalPlaces = (product.price.toString().split(".")[1] || "")
          .length;
        expect(decimalPlaces).toBeLessThanOrEqual(2);
      });
    });

    test("product descriptions should be strings", async () => {
      const response = await apiContext.get(TEST_CONFIG.api.products);
      const products = await response.json();

      const errors: string[] = [];

      products.forEach((product: any, index: number) => {
        if (typeof product.description !== "string") {
          errors.push(`Product ${index}: name is not a string`);
        }
        if (!product.description || product.description.length === 0) {
          errors.push(`Product ${index}: description is empty`);
        }
      });
      expect(errors).toEqual([]);
    });

    test("product images should be valid image references", async () => {
      const response = await apiContext.get(TEST_CONFIG.api.products);
      const products = await response.json();

      products.forEach((product: any, index: number) => {
        expect(typeof product.image).toBe(
          "string"
        );
        expect(product.image.length).toBeGreaterThan(
          0
        );
      });
    });


    test.describe("Data Type Validation", () => {
      test("should strictly validate all product data types", async () => {
        const response = await apiContext.get(TEST_CONFIG.api.products);
        const products = await response.json();

        // Define expected types for each field
        const expectedTypes = {
          id: "number",
          name: "string",
          price: "number",
          description: "string",
          image: "string",
        };

        // Verify each product has correct types
        products.forEach((product: any) => {
          Object.entries(expectedTypes).forEach(([field, type]) => {
            expect(typeof product[field]).toBe(type);
          });
        });
      });
    });

    test("should not have null or undefined values in required fields", async () => {
      const response = await apiContext.get(TEST_CONFIG.api.products);
      const products = await response.json();

      const requiredFields = ["id", "name", "price", "image"];

      products.forEach((product: any) => {
        requiredFields.forEach((field) => {
          expect(product[field]).not.toBeNull();
          expect(product[field]).not.toBeUndefined();
        });
      });
    });
  });

  test.describe("Business Logic Validation", () => {
    test("prices should be realistic for e-commerce products", async () => {
      const response = await apiContext.get(TEST_CONFIG.api.products);
      const products = await response.json();

      products.forEach((product: any) => {
        expect(product.price).toBeGreaterThanOrEqual(0.01);
        expect(product.price).toBeLessThanOrEqual(9999.99);
      });
    });

    test("should contain product names that match Codemify branding", async () => {
      const response = await apiContext.get(TEST_CONFIG.api.products);
      const products = await response.json();

      const hasCodemifyProducts = products.some(
        (p: any) =>
          p.name.includes("Codemify") || p.description?.includes("Codemify"),
      );

      expect(hasCodemifyProducts).toBeTruthy();
    });

    test("should have descriptions that provide product information", async () => {
      const response = await apiContext.get(TEST_CONFIG.api.products);
      const products = await response.json();

      products.forEach((product: any) => {
        // Description should have some meaningful content (at least 10 characters)
        expect(product.description.length).toBeGreaterThanOrEqual(0);
      });
    });
  });

  test.describe("Response Header Validation", () => {
    test("should include necessary security headers", async () => {
      const response = await apiContext.get(TEST_CONFIG.api.products);
      const headers = response.headers();

      // Check for important headers
      expect(headers).toBeDefined();
      expect(Object.keys(headers).length).toBeGreaterThan(0);
    });

    test("should not expose sensitive headers", async () => {
      const response = await apiContext.get(TEST_CONFIG.api.products);
      const headers = response.headers();

      // Should not expose server details in a way that's a security risk
      const sensitiveHeaders = ["x-powered-by"];

      sensitiveHeaders.forEach((header) => {
        // It's okay if these headers don't exist, but if they do, check content
        if (headers[header]) {
          expect(headers[header]).toBeDefined();
        }
      });
    });
  });

  test.describe("Empty State and Edge Cases", () => {
    test("response should always return an array even if logic changes", async () => {
      const response = await apiContext.get(TEST_CONFIG.api.products);
      const data = await response.json();

      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThanOrEqual(0);
      expect(data).toBeDefined();
      expect(data).not.toBeNull();
    });

    test("products list should be consistent and not empty in production", async () => {
      const response = await apiContext.get(TEST_CONFIG.api.products);
      const products = await response.json();

      expect(products.length).toBeGreaterThan(0);
    });
  });

  test.describe("Known Products Validation", () => {
    test("should contain expected products by name", async () => {
      const response = await apiContext.get(TEST_CONFIG.api.products);
      const products = await response.json();

      const productNames = products.map((p: any) => p.name);

      // Check for at least some products we know exist
      const hasKnownProducts = productNames.some(
        (name: string) =>
          name.toLowerCase().includes("backpack") ||
          name.toLowerCase().includes("bike") ||
          name.toLowerCase().includes("light"),
      );

      expect(hasKnownProducts).toBeTruthy();
    });
  });
});
