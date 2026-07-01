/**
 * Shopping Cart Page Locators
 */

export const CART_LOCATORS = {
  pageHeading: "h2:has-text('Your Shopping Cart')",
  cartItems: "div.cart-item",
  itemTotal: "text=Total:",
  checkoutButton: "button:has-text(/Proceed to Checkout/i)",
  continueShoppingButton: "button:has-text(/Continue Shopping/i)",
  removeItemButton: "button:has-text('Remove')",
  itemQuantity: "input[type='number']",
  emptyCartMessage: "text=Your cart is empty",
};
