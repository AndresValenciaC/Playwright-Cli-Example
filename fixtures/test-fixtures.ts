import { test as base } from "@playwright/test";
import { CartPage } from "../pages/CartPage";
import { CheckoutPage } from "../pages/CheckoutPage";
import { LoginPage } from "../pages/LoginPage";
import { ProductsPage } from "../pages/ProductsPage";
import { TEST_CONFIG } from "./constants";

/**
 * Define custom fixtures for page objects
 */
type PageObjectFixtures = {
  loginPage: LoginPage;
  productsPage: ProductsPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
};

/**
 * Create extended test with page object fixtures
 */
export const test = base.extend<PageObjectFixtures>({
  /**
   * LoginPage fixture
   * Navigates to base URL and provides LoginPage instance
   * Use for authentication and login-related tests
   */
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await page.goto(TEST_CONFIG.baseUrl);
    await use(loginPage);
  },

  /**
   * ProductsPage fixture
   * Provides ProductsPage instance
   * Note: When used with authenticated context, user is already logged in
   */
  productsPage: async ({ page }, use) => {
    const productsPage = new ProductsPage(page);
    await use(productsPage);
  },

  /**
   * CartPage fixture
   * Provides CartPage instance
   * Requires authentication via auth.setup.ts
   */
  cartPage: async ({ page }, use) => {
    const cartPage = new CartPage(page);
    await use(cartPage);
  },

  /**
   * CheckoutPage fixture
   * Provides CheckoutPage instance
   * Requires authentication via auth.setup.ts
   */
  checkoutPage: async ({ page }, use) => {
    const checkoutPage = new CheckoutPage(page);
    await use(checkoutPage);
  },
});

export { expect } from "@playwright/test";
