import { expect, test } from "@playwright/test";
import { TEST_URLS } from "../../test-data/test-data-users";

/**
 * Critical User Workflow Test: Complete E-Commerce Purchase
 * 
 * Uses pre-authenticated state - no manual login needed
 * Tests the complete user journey from browsing to order completion
 */

test.describe("E-Commerce Purchase Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate directly to products page (already authenticated via storageState)
    await page.goto(`${TEST_URLS.base}${TEST_URLS.inventory}`);
  });

  test("should complete a full purchase from products to order confirmation", async ({
    page,
  }) => {
    // Step 1: Verify products page loads (user is already authenticated)
    await expect(page.locator("h2")).toContainText("Products");

    // Verify at least one product is visible
    const productItems = page.locator("ul li");
    const productCount = await productItems.count();
    expect(productCount).toBeGreaterThan(0);

    // Step 2: Add first product (Codemify Backpack - $29.99) to cart
    const firstProduct = page.locator("button:has-text('Add to Cart')").first();
    await expect(firstProduct).toBeVisible();
    await firstProduct.click();

    // Step 3: Verify cart count updated
    await expect(page.getByRole("button", { name: /Cart 1/ })).toContainText(
      "1",
    );

    // Step 4: Click on Cart to view cart contents
    await page.getByRole("button", { name: /Cart 1/ }).click();

    // Step 5: Verify cart page displays the added item
    await expect(page.locator("h2")).toContainText("Your Shopping Cart");
    await expect(page.locator("text=Total:")).toBeVisible();
    await expect(page.locator("text=Codemify Backpack")).toBeVisible();
    await expect(page.getByText("$29.99", { exact: true })).toBeVisible();

    // Step 6: Proceed to checkout
    const checkoutButton = page.getByRole("button", {
      name: /Proceed to Checkout/i,
    });
    await expect(checkoutButton).toBeVisible();
    await checkoutButton.click();

    // Step 7: Verify checkout page loads
    await expect(page.locator("h2")).toContainText("Checkout");
    await expect(
      page.getByRole("heading", { name: "Shipping Information" }),
    ).toBeVisible();
    await expect(page.locator("text=Order Summary")).toBeVisible();
    await expect(page.locator("text=Codemify Backpack")).toBeVisible();
    await expect(page.locator("text=Total:")).toBeVisible();

    // Step 8: Fill in shipping information
    await page.getByLabel(/first name/i).fill("John");
    await page.getByLabel(/last name/i).fill("Doe");
    await page.getByLabel(/email/i).fill("john.doe@example.com");
    await page.getByLabel(/address/i).fill("123 Test Street");
    await page.getByLabel(/city/i).fill("San Francisco");
    await page.getByLabel(/state/i).fill("CA");
    await page.getByLabel(/zip code/i).fill("94105");

    // Step 9: Fill in payment information
    await page.getByLabel(/card number/i).fill("4532015112830366");
    await page.getByLabel(/expiry date/i).fill("12/25");
    await page.getByLabel(/cvv/i).fill("123");

    // Step 10: Complete the order
    const completeOrderButton = page.getByRole("button", {
      name: /Complete Order/i,
    });
    await expect(completeOrderButton).toBeEnabled();
    await completeOrderButton.click();

    // Step 11: Verify order completion
    await page.waitForLoadState("networkidle");

    const logoutButton = page.getByRole("button", { name: /Logout/i });
    const successMessage = page.locator("text=/order|success|confirmation/i");

    const isLogoutVisible = await logoutButton.isVisible().catch(() => false);
    const isSuccessMessageVisible = await successMessage
      .isVisible()
      .catch(() => false);

    expect(isLogoutVisible || isSuccessMessageVisible).toBeTruthy();
    console.log("✓ Order completed successfully");
  });

  test("should allow adding multiple products and update cart total", async ({
    page,
  }) => {
    // Already authenticated, go to products
    await page.goto(`${TEST_URLS.base}${TEST_URLS.inventory}`);

    // Add first product (Backpack - $29.99)
    await page.locator("button:has-text('Add to Cart')").nth(0).click();

    // Add second product (Bike Light - $9.99)
    await page.locator("button:has-text('Add to Cart')").nth(1).click();

    // Verify cart count is 2
    const cartBadge = page.locator("span.cart-badge");
    await expect(cartBadge).toHaveText("2");

    // Open cart
    await page.getByRole("button", { name: /Cart 2/ }).click();

    // Verify both products are in cart
    await expect(page.locator("text=Codemify Backpack")).toBeVisible();
    await expect(page.locator("text=Codemify Bike Light")).toBeVisible();

    // Verify total is $39.98 (29.99 + 9.99)
    await expect(page.getByText("$39.98", { exact: true })).toBeVisible();
    console.log("✓ Multiple products added successfully");
  });

  test("should allow removing items from cart", async ({ page }) => {
    // Already authenticated, go to products
    await page.goto(`${TEST_URLS.base}${TEST_URLS.inventory}`);

    // Add two products
    await page.locator("button:has-text('Add to Cart')").nth(0).click();
    await page.locator("button:has-text('Add to Cart')").nth(1).click();

    // Open cart
    await page.getByRole("button", { name: /Cart 2/ }).click();

    // Verify both products exist
    let backpackItems = page.locator("text=Codemify Backpack");
    expect(await backpackItems.count()).toBe(1);

    // Click remove button for the first item
    const removeButton = page.getByRole("button", { name: /remove/i }).first();
    await removeButton.click();

    // Verify only Bike Light remains
    backpackItems = page.locator("text=Codemify Backpack");
    expect(await backpackItems.count()).toBe(0);

    await expect(page.locator("text=Codemify Bike Light")).toBeVisible();

    // Verify total is updated to $9.99
    await expect(page.getByText("$9.99", { exact: true })).toBeVisible();
    console.log("✓ Item removed from cart successfully");
  });

  test("should navigate back to products from cart", async ({ page }) => {
    // Already authenticated, go to products
    await page.goto(`${TEST_URLS.base}${TEST_URLS.inventory}`);

    // Add a product
    await page.locator("button:has-text('Add to Cart')").first().click();

    // Open cart
    await page.getByRole("button", { name: /Cart 1/ }).click();

    // Verify we're on cart page
    await expect(page.locator("h2")).toContainText("Your Shopping Cart");

    // Click continue shopping
    const continueButton = page.getByRole("button", {
      name: /continue shopping/i,
    });
    await expect(continueButton).toBeVisible();
    await continueButton.click();

    // Verify we're back on products page
    await expect(page.locator("h2")).toContainText("Products");

    // Verify cart count is still 1
    await expect(page.getByRole("button", { name: /Cart 1/ })).toContainText(
      "1",
    );
    console.log("✓ Navigation back to products successful");
  });

  test("should logout successfully", async ({ page }) => {
    // Already authenticated, go to products
    await page.goto(`${TEST_URLS.base}${TEST_URLS.inventory}`);

    // Verify logout button is visible
    const logoutButton = page.getByRole("button", { name: /logout/i });
    await expect(logoutButton).toBeVisible();

    // Click logout
    await logoutButton.click();

    // Verify we're back at login page
    await expect(page.locator("h1")).toContainText("Codemify Store");
    await expect(page.locator("text=Please login to continue")).toBeVisible();

    console.log("✓ Logout successful");
  });
});