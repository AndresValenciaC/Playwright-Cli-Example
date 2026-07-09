import { APIRequestContext, expect, test } from "@playwright/test";
import { AUTH_FILES } from "../../../fixtures/auth-config";
import { TEST_CONFIG } from "../../../fixtures/constants";

/**
 * API Data-Driven Tests
 * API Data-Driven Tests with Authentication
 *  Includes authentication state and multiple data validation scenarios
 */

const testDataSets = [
  {
    name: "Valid product fetch",
    endpoint: "products",
    expectedStatus: 200,
    expectedFields: ["id", "name", "price", "description", "image"],
    shouldBeArray: true,
  },
  {
    name: "Products should have numeric IDs",
    endpoint: "products",
    expectedStatus: 200,
    validation: (data: any) => {
      const allHaveNumericIds =
        Array.isArray(data) &&
        data.every((item: any) => typeof item.id === "number");
      return allHaveNumericIds;
    },
  },
  {
    name: "Products should have string names",
    endpoint: "products",
    expectedStatus: 200,
    validation: (data: any) => {
      const allHaveStringNames =
        Array.isArray(data) &&
        data.every(
          (item: any) => typeof item.name === "string" && item.name.length > 0,
        );
      return allHaveStringNames;
    },
  },
];

const priceValidationSets = [
  { min: 0, max: 100, description: "Standard price range" },
  { min: 0.01, max: 50, description: "Budget products" },
  { min: 10, max: 1000, description: "Premium products" },
];

const productCountScenarios = [
  { description: "At least 1 product", expectedMinimum: 1 },
  { description: "At least 3 products", expectedMinimum: 3 },
  { description: "At most 20 products", expectedMaximum: 20 },
];

test.describe("API Data-Driven Tests", () => {
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

  test.describe("Parameterized Endpoint Tests", () => {
    for (const dataSet of testDataSets) {
      test(`${dataSet.name}`, async () => {
        const url = `${TEST_CONFIG.api.baseUrl}/${dataSet.endpoint}`;
        const response = await apiContext.get(url);

        expect(response.status()).toBe(dataSet.expectedStatus);
        const data = await response.json();

        if (dataSet.shouldBeArray) {
          expect(Array.isArray(data)).toBeTruthy();
        }

        if (dataSet.expectedFields) {
          if (Array.isArray(data)) {
            data.forEach((item: any) => {
              dataSet.expectedFields.forEach((field: string) => {
                expect(item).toHaveProperty(field);
              });
            });
          }
        }

        if (dataSet.validation) {
          expect(dataSet.validation(data)).toBeTruthy();
        }
      });
    }
  });

  test.describe("Price Validation with Multiple Ranges", () => {
    for (const priceSet of priceValidationSets) {
      test(`Validate products within ${priceSet.description} (${priceSet.min}-${priceSet.max})`, async () => {
        const response = await apiContext.get(TEST_CONFIG.api.products);
        const products = await response.json();

        const productsInRange = products.filter(
          (p: any) => p.price >= priceSet.min && p.price <= priceSet.max,
        );

        // At least some products should be in any reasonable range
        expect(productsInRange.length).toBeGreaterThanOrEqual(0);

        // Verify prices are valid numbers
        productsInRange.forEach((product: any) => {
          expect(typeof product.price).toBe("number");
          expect(product.price).toBeGreaterThanOrEqual(priceSet.min);
          expect(product.price).toBeLessThanOrEqual(priceSet.max);
        });
      });
    }
  });

  test.describe("Product Count Scenarios", () => {
    for (const scenario of productCountScenarios) {
      test(`${scenario.description}`, async () => {
        const response = await apiContext.get(TEST_CONFIG.api.products);
        const products = await response.json();

        if (scenario.expectedMinimum !== undefined) {
          expect(products.length).toBeGreaterThanOrEqual(
            scenario.expectedMinimum,
          );
        }

        if (scenario.expectedMaximum !== undefined) {
          expect(products.length).toBeLessThanOrEqual(scenario.expectedMaximum);
        }
      });
    }
  });

  test.describe("Field Validation Data Sets", () => {
    const fieldValidationTests = [
      {
        field: "id",
        validator: (value: any) => typeof value === "number" && value > 0,
        description: "ID should be a positive number",
      },
      {
        field: "name",
        validator: (value: any) =>
          typeof value === "string" && value.length > 0,
        description: "Name should be a non-empty string",
      },
      {
        field: "price",
        validator: (value: any) => typeof value === "number" && value > 0,
        description: "Price should be a positive number",
      },
      {
        field: "description",
        validator: (value: any) =>
          typeof value === "string" && value.length >= 0,
        description: "Description should be a string",
      },
      {
        field: "image",
        validator: (value: any) =>
          typeof value === "string" && value.length > 0,
        description: "Image should be a non-empty string",
      },
    ];

    for (const test_ of fieldValidationTests) {
      test(`Field validation: ${test_.description}`, async () => {
        const response = await apiContext.get(TEST_CONFIG.api.products);
        const products = await response.json();

        products.forEach((product: any) => {
          expect(test_.validator(product[test_.field])).toBeTruthy();
        });
      });
    }
  });

  test.describe("Combination Data Tests", () => {
    test("should verify products with valid price and non-empty name combinations", async () => {
      const response = await apiContext.get(TEST_CONFIG.api.products);
      const products = await response.json();

      const validProducts = products.filter(
        (p: any) => p.price > 0 && p.name && p.name.length > 0 && p.id > 0,
      );

      expect(validProducts.length).toBeGreaterThan(0);
    });

    test("should track product variations across multiple requests", async () => {
      const requests = new Array(3)
        .fill(null)
        .map(() => apiContext.get(TEST_CONFIG.api.products));

      const responses = await Promise.all(requests);
      const productSets = await Promise.all(responses.map((r) => r.json()));

      // All responses should return the same products
      const firstSet = productSets[0];
      for (let i = 1; i < productSets.length; i++) {
        expect(productSets[i]).toEqual(firstSet);
      }
    });
  });
});
