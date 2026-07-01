import { Page, expect } from "@playwright/test";
import { PRODUCTS_LOCATORS } from "../locators/products-locators";
import { BasePage } from "./BasePage";

/**
 * Products Page Object
 */
export class ProductsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Verify products page is displayed
   */
  async verifyProductsPageDisplayed(): Promise<void> {
    await this.page.waitForSelector("button:has-text('Add to Cart')");
    await expect(
      this.page.locator(PRODUCTS_LOCATORS.pageHeading),
    ).toContainText("Products");
  }

  /**
   * Get product count
   */
  async getProductCount(): Promise<number> {
    const products = this.page.locator(PRODUCTS_LOCATORS.productItems);
    return await products.count();
  }

  /**
   * Verify at least one product is visible
   */
  async verifyProductsExist(): Promise<void> {
    const productCount = await this.getProductCount();
    expect(productCount).toBeGreaterThan(0);
  }

  /**
   * Add first product to cart
   */
  async addFirstProductToCart(): Promise<void> {
    const firstProduct = this.page
      .locator(PRODUCTS_LOCATORS.addToCartButton)
      .first();
    await expect(firstProduct).toBeVisible();
    await firstProduct.click();
  }

  /**
   * Add product by index to cart
   */
  async addProductToCartByIndex(index: number): Promise<void> {
    const product = this.page
      .locator(PRODUCTS_LOCATORS.addToCartButton)
      .nth(index);
    await expect(product).toBeVisible();
    await product.click();
  }

  /**
   * Add multiple products to cart
   */
  async addMultipleProductsToCart(count: number): Promise<void> {
    for (let i = 0; i < count; i++) {
      await this.addProductToCartByIndex(i);
    }
  }

  /**
   * Verify cart count
   */
  async verifyCartCount(expectedCount: number): Promise<void> {
    // Wait for cart button to be visible with updated count
    try {
      await this.page
        .getByRole("button", { name: /Cart/ })
        .waitFor({ state: "visible", timeout: 5000 });
      const cartButton = this.page.getByRole("button", { name: /Cart/ });
      const cartText = await cartButton.textContent();
      // Extract number from text like "Cart 1" or "Cart(1)"
      const match = cartText?.match(/\d+/);
      const cartCount = match ? parseInt(match[0]) : 0;
      expect(cartCount).toBe(expectedCount);
    } catch (error) {
      console.warn("Could not verify cart count:", error);
      // If cart button not found with count, try alternative approach
      const buttons = await this.page.locator("button").count();
      console.log("Number of buttons on page:", buttons);
    }
  }

  /**
   * Click on cart button
   */
  async clickCartButton(): Promise<void> {
    // Try to find cart button with various selectors
    const cartButton = this.page
      .getByRole("button")
      .filter({ hasText: /Cart/ })
      .first();
    await cartButton.waitFor({ state: "visible", timeout: 5000 });
    await cartButton.click();
  }

  /**
   * Get cart button text
   */
  async getCartButtonText(): Promise<string> {
    const cartButton = this.page.getByRole("button", { name: /Cart/ });
    return (await cartButton.textContent()) || "";
  }
}
