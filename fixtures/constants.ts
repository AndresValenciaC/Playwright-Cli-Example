/**
 * Centralized test data and configuration constants
 */

export const TEST_CONFIG = {
  baseUrl: "https://codemify-demo-app.vercel.app/demo-app",
  api: {
    baseUrl: "https://codemify-demo-app.vercel.app/demo-app/api",
    products: "https://codemify-demo-app.vercel.app/demo-app/api/products",
  },
  timeout: {
    short: 5000,
    medium: 10000,
    long: 30000,
  },
};

export const TEST_USERS = {
  valid: {
    username: "standard_user",
    password: process.env.TEST_PASSWORD || "my_secret_code",
  },
  invalid: {
    username: "locked_out_user",
    password: process.env.TEST_PASSWORD || "my_secret_code",
  },
};

export const PRODUCTS = {
  backpack: {
    name: "Codemify Backpack",
    price: "$29.99",
    priceNumeric: 29.99,
  },
  bikeLight: {
    name: "Codemify Bike Light",
    price: "$9.99",
    priceNumeric: 9.99,
  },
};

export const CHECKOUT_DATA = {
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  address: "123 Test Street",
  city: "San Francisco",
  state: "CA",
  zipCode: "94105",
  cardNumber: "4532015112830366",
  expiryDate: "12/25",
  cvv: "123",
};
