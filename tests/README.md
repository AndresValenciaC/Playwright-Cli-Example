# Playwright Page Object Model (POM) Guide

## Overview

This project uses the **Page Object Model** pattern for test automation with Playwright. This guide explains the structure, how to add new pages, and how to run tests.

## Directory Structure

```
tests/
├── pages/                  # Page Object Classes
│   ├── BasePage.ts        # Base class for all pages
│   ├── LoginPage.ts
│   ├── ProductsPage.ts
│   ├── CartPage.ts
│   ├── CheckoutPage.ts
│   └── locators/          # Centralized locators (selectors)
│       ├── login-locators.ts
│       ├── products-locators.ts
│       ├── cart-locators.ts
│       └── checkout-locators.ts
├── fixtures/              # Test fixtures and configuration
│   ├── constants.ts       # Test data, URLs, credentials
│   └── test-fixtures.ts   # Extended test with page object injection
├── ui/                    # UI/E2E tests
│   ├── ecommerce-purchase.test.ts
│
└── api/                   # API tests
    ├── smoke/             # Happy path tests
    │   └── products-smoke.test.ts
    └── edge/              # Edge case and boundary tests
        └── products-edge.test.ts
```

## Key Concepts

### 1. **BasePage Class**

- All page objects inherit from `BasePage`
- Provides common functionality: navigation, waits, screenshots
- Located in: `tests/pages/BasePage.ts`

### 2. **Page Objects**

- Encapsulate page-specific interactions and locators
- Use methods for user actions (login, addToCart, etc.)
- Example: `LoginPage`, `ProductsPage`, `CartPage`, `CheckoutPage`

### 3. **Locators**

- All selectors are stored in separate locator files
- One locator file per page (e.g., `login-locators.ts`)
- Exported as constants for easy maintenance
- Located in: `tests/pages/locators/`

### 4. **Test Fixtures**

- Extends Playwright `test` with page object fixtures
- Injects page objects into tests automatically
- Located in: `tests/fixtures/test-fixtures.ts`
- Example usage in tests: `async ({ loginPage, cartPage }) => { ... }`

### 5. **Constants & Test Data**

- Centralized configuration in `tests/fixtures/constants.ts`
- Includes: URLs, credentials, product data, checkout info
- Single source of truth for all test data

## How to Add a New Page Object

### Step 1: Create Locators File

Create `tests/pages/locators/my-page-locators.ts`:

```typescript
export const MY_PAGE_LOCATORS = {
  pageHeading: "h1:has-text('My Page')",
  submitButton: "button[type='submit']",
  inputField: "input[id='my-input']",
  errorMessage: ".error-message",
};
```

### Step 2: Create Page Class

Create `tests/pages/MyPage.ts`:

```typescript
import { Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import { MY_PAGE_LOCATORS } from "./locators/my-page-locators";

export class MyPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async verifyPageDisplayed(): Promise<void> {
    await expect(this.page.locator(MY_PAGE_LOCATORS.pageHeading)).toBeVisible();
  }

  async fillInput(text: string): Promise<void> {
    await this.page.locator(MY_PAGE_LOCATORS.inputField).fill(text);
  }

  async clickSubmit(): Promise<void> {
    await this.page.locator(MY_PAGE_LOCATORS.submitButton).click();
  }
}
```

### Step 3: Register Fixture

Update `tests/fixtures/test-fixtures.ts`:

```typescript
type PageObjectFixtures = {
  // ... existing pages
  myPage: MyPage;
};

export const test = base.extend<PageObjectFixtures>({
  // ... existing fixtures
  myPage: async ({ page }, use) => {
    const myPage = new MyPage(page);
    await use(myPage);
  },
});
```

### Step 4: Use in Tests

Create test file in `tests/ui/my-feature.test.ts`:

```typescript
import { test, expect } from "../fixtures/test-fixtures";

test.describe("My Feature", () => {
  test("should fill form and submit", async ({ myPage }) => {
    await myPage.verifyPageDisplayed();
    await myPage.fillInput("test data");
    await myPage.clickSubmit();
  });
});
```

## Running Tests

### Run All Tests

```bash
npm test
```

### Run UI Tests Only

```bash
npm run test:ui
```

### Run API Tests Only

```bash
npm run test:api
```

### Run Smoke Tests (Happy Path)

```bash
npm run test:smoke
```

### Run Edge Tests (Boundary Cases)

```bash
npm run test:edge
```

### Run Tests in Debug Mode

```bash
npm run test:debug
```

### Run Tests in Headed Mode (Browser Visible)

```bash
npm run test:headed
```

### View Test Report

```bash
npm run test:report
```

## Best Practices

### 1. **Use Locators Consistently**

- Always define locators in locator files
- Export them as constants
- Use descriptive names for locators

### 2. **Group Related Actions in Page Objects**

- Each page object should represent a single page/screen
- Group related functionality together
- Keep methods focused and single-purpose

### 3. **Use Page Object Methods in Tests**

- Tests should call page object methods, not interact with the page directly
- This keeps tests clean and readable

### 4. **Add Meaningful Assertions**

- Use `expect()` in page objects for verification
- Keep test code focused on business logic

### 5. **Separate Test Data**

- Use `constants.ts` for all test data
- Never hardcode values in tests
- Make it easy to update test data globally

### 6. **Categorize API Tests**

- **Smoke Tests**: Happy path, basic functionality
- **Edge Tests**: Boundary conditions, negative cases, validation

## Example Test Structure

```typescript
import { test, expect } from "../fixtures/test-fixtures";
import { CHECKOUT_DATA } from "../fixtures/constants";

test.describe("Feature Name", () => {
  test("should complete action from A to B", async ({
    loginPage,
    productsPage,
    cartPage,
  }) => {
    // Arrange - Verify initial state
    await loginPage.verifyLoginPageDisplayed();

    // Act - Perform actions
    await loginPage.loginWithValidCredentials();
    await productsPage.verifyProductsPageDisplayed();
    await productsPage.addFirstProductToCart();

    // Assert - Verify final state
    await cartPage.verifyProductInCart("Product Name");
  });
});
```

## Troubleshooting

### Tests Are Not Finding Page Objects

- Ensure fixtures are imported from `../fixtures/test-fixtures`
- Verify page object is registered in `test.extend()`

### Locators Are Not Working

- Check the selector syntax in locator files
- Use Playwright Inspector: `npx playwright test --debug`
- Verify the element exists on the page

### Tests Are Timing Out

- Increase timeout in `playwright.config.ts`
- Add explicit waits in page objects if needed
- Check for network delays

## Contributing

When adding new tests:

1. Create page objects for new pages
2. Extract locators into dedicated files
3. Use constants for all test data
4. Follow the POM pattern
5. Add meaningful test descriptions
6. Keep tests independent and idempotent

## References

- [Playwright Documentation](https://playwright.dev)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)
- [Best Practices](https://playwright.dev/docs/best-practices)
