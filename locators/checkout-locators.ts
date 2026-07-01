/**
 * Checkout Page Locators
 */

export const CHECKOUT_LOCATORS = {
  pageHeading: "h2:has-text('Checkout')",
  shippingHeading: "text=Shipping Information",
  orderSummaryHeading: "text=Order Summary",
  firstNameInput: "label:has-text(/first name/i) ~ input",
  lastNameInput: "label:has-text(/last name/i) ~ input",
  emailInput: "label:has-text(/email/i) ~ input",
  addressInput: "label:has-text(/address/i) ~ input",
  cityInput: "label:has-text(/city/i) ~ input",
  stateInput: "label:has-text(/state/i) ~ input",
  zipCodeInput: "label:has-text(/zip code/i) ~ input",
  cardNumberInput: "label:has-text(/card number/i) ~ input",
  expiryDateInput: "label:has-text(/expiry date/i) ~ input",
  cvvInput: "label:has-text(/cvv/i) ~ input",
  completeOrderButton: "button:has-text(/Complete Order/i)",
  orderConfirmation: "text=/order|success|confirmation/i",
};
