import { Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import { CART_LOCATORS } from "../locators/cart-locators";

/**
 * Shopping Cart Page Object
 */
export class CartPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Verify cart page is displayed
   */
  async verifyCartPageDisplayed(): Promise<void> {
    await expect(this.page.locator(CART_LOCATORS.pageHeading)).toContainText(
      "Your Shopping Cart",
    );
  }

  /**
   * Verify cart is empty
   */
  async verifyCartIsEmpty(): Promise<void> {
    await expect(
      this.page.locator(CART_LOCATORS.emptyCartMessage),
    ).toBeVisible();
  }

  /**
   * Verify cart total is displayed
   */
  async verifyCartTotalDisplayed(): Promise<void> {
    await expect(this.page.locator(CART_LOCATORS.itemTotal)).toBeVisible();
  }

  /**
   * Verify product is in cart
   */
  async verifyProductInCart(productName: string): Promise<void> {
    await expect(this.page.locator(`text=${productName}`)).toBeVisible();
  }

  /**
   * Verify product price in cart
   */
  async verifyProductPrice(price: string): Promise<void> {
    await expect(this.page.getByText(price, { exact: true })).toBeVisible();
  }

  /**
   * Get number of items in cart
   */
  async getCartItemCount(): Promise<number> {
    const items = this.page.locator(CART_LOCATORS.cartItems);
    return await items.count();
  }

  /**
   * Verify order summary is displayed
   */
  async verifyOrderSummaryDisplayed(): Promise<void> {
    await expect(this.page.locator(CART_LOCATORS.itemTotal)).toBeVisible();
  }

  /**
   * Click checkout button
   */
  async clickCheckoutButton(): Promise<void> {
    const checkoutButton = this.page.getByRole("button", {
      name: /Proceed to Checkout/i,
    });
    await expect(checkoutButton).toBeVisible();
    await checkoutButton.click();
  }

  /**
   * Click continue shopping button
   */
  async clickContinueShoppingButton(): Promise<void> {
    const continueButton = this.page.getByRole("button", {
      name: /Continue Shopping/i,
    });
    await continueButton.click();
  }

  /**
   * Remove item from cart
   */
  async removeItem(index: number): Promise<void> {
    const removeButtons = this.page.locator(CART_LOCATORS.removeItemButton);
    await removeButtons.nth(index).click();
  }
}
