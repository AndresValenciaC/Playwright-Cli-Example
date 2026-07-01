/**
 * Centralized test data configuration
 * Single source of truth for all test data and URLs
 */

export const TEST_USERS = {
  standardUser: {
    username: "standard_user",
    password: process.env.TEST_PASSWORD || "my_secret_code",
    role: "standard",
  },
  problemUser: {
    username: "problem_user",
    password: process.env.TEST_PASSWORD || "my_secret_code",
    role: "problem",
  },
  lockedOutUser: {
    username: "locked_out_user",
    password: process.env.TEST_PASSWORD || "my_secret_code",
    role: "locked",
  },
} as const;

export const TEST_URLS = {
  base: process.env.BASE_URL || "https://codemify-demo-app.vercel.app/demo-app",
  login: "/",
  inventory: "/products",
  checkout: "/checkout",
} as const;

// User type keys for better typing
export type UserType = keyof typeof TEST_USERS;

// Helper to get user by type
export function getUserByType(userType: UserType) {
  return TEST_USERS[userType];
}