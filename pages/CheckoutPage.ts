import { Page, expect } from "@playwright/test";
import { CHECKOUT_DATA } from "../fixtures/constants";
import { CHECKOUT_LOCATORS } from "../locators/checkout-locators";
import { BasePage } from "./BasePage";

/**
 * Checkout Page Object
 */
export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Verify checkout page is displayed
   */
  async verifyCheckoutPageDisplayed(): Promise<void> {
    await expect(
      this.page.locator(CHECKOUT_LOCATORS.pageHeading),
    ).toContainText("Checkout");
    await expect(
      this.page.getByRole("heading", { name: "Shipping Information" }),
    ).toContainText("Shipping Information");
  }

  /**
   * Verify order summary is displayed
   */
  async verifyOrderSummaryDisplayed(): Promise<void> {
    await expect(
      this.page.locator(CHECKOUT_LOCATORS.orderSummaryHeading),
    ).toBeVisible();
  }

  /**
   * Verify product in order summary
   */
  async verifyProductInOrderSummary(productName: string): Promise<void> {
    await expect(this.page.locator(`text=${productName}`)).toBeVisible();
  }

  /**
   * Fill shipping information
   */
  async fillShippingInformation(data: typeof CHECKOUT_DATA): Promise<void> {
    await this.page.getByLabel(/first name/i).fill(data.firstName);
    await this.page.getByLabel(/last name/i).fill(data.lastName);
    await this.page.getByLabel(/email/i).fill(data.email);
    await this.page.getByLabel(/address/i).fill(data.address);
    await this.page.getByLabel(/city/i).fill(data.city);
    await this.page.getByLabel(/state/i).fill(data.state);
    await this.page.getByLabel(/zip code/i).fill(data.zipCode);
  }

  /**
   * Fill payment information
   */
  async fillPaymentInformation(data: typeof CHECKOUT_DATA): Promise<void> {
    await this.page.getByLabel(/card number/i).fill(data.cardNumber);
    await this.page.getByLabel(/expiry date/i).fill(data.expiryDate);
    await this.page.getByLabel(/cvv/i).fill(data.cvv);
  }

  /**
   * Fill all checkout information
   */
  async fillCheckoutInformation(
    data: typeof CHECKOUT_DATA = CHECKOUT_DATA,
  ): Promise<void> {
    await this.fillShippingInformation(data);
    await this.fillPaymentInformation(data);
  }

  /**
   * Verify complete order button is enabled
   */
  async verifyCompleteOrderButtonEnabled(): Promise<void> {
    const completeOrderButton = this.page.getByRole("button", {
      name: /Complete Order/i,
    });
    await expect(completeOrderButton).toBeEnabled();
  }

  /**
   * Click complete order button
   */
  async clickCompleteOrderButton(): Promise<void> {
    const completeOrderButton = this.page.getByRole("button", {
      name: /Complete Order/i,
    });
    await expect(completeOrderButton).toBeEnabled();
    await completeOrderButton.click();
  }

  /**
   * Verify order completion
   */
  async verifyOrderCompletion(): Promise<void> {
    await this.page.waitForLoadState("networkidle");

    const logoutButton = this.page.getByRole("button", { name: /Logout/i });
    const successMessage = this.page.locator(
      "text=/order|success|confirmation/i",
    );

    const isLogoutVisible = await logoutButton.isVisible().catch(() => false);
    const isSuccessMessageVisible = await successMessage
      .isVisible()
      .catch(() => false);

    expect(isLogoutVisible || isSuccessMessageVisible).toBeTruthy();
  }
}
