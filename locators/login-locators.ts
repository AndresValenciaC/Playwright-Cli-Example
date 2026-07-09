/**
 * Login Page Locators
 * Using Playwright's getByRole for semantic and resilient selectors
 */

import { Locator, Page } from "@playwright/test";

export class LoginPageLocators {
  constructor(readonly page: Page) {}

  // Page elements
  get pageHeading1(): Locator {
    return this.page.getByRole("heading", { name: "🛒 Codemify Store" });
  }

  get pageHeading2(): Locator {
    return this.page.getByText("Please login to continue");
  }

  // Form inputs
  get usernameInput(): Locator {
    return this.page.getByRole("textbox", { name: "Username" });
  }

  get passwordInput(): Locator {
    return this.page.getByRole("textbox", { name: "Password" });
  }

  // Buttons
  get loginButton(): Locator {
    return this.page.getByRole("button", { name: "Login" });
  }

  // Error messages
  get invalidCredentialsError(): Locator {
    return this.page.getByRole("alert").filter({
      hasText: "Username and password do not match any user in this service",
    });
  }

  get usernameRequiredError(): Locator {
    return this.page.getByRole("alert").filter({
      hasText: "Username is required",
    });
  }

  get passwordRequiredError(): Locator {
    return this.page.getByRole("alert").filter({
      hasText: "Password is required",
    });
  }

  get userLockedError(): Locator {
    return this.page.getByRole("alert").filter({
      hasText: "Sorry, this user has been locked out",
    });
  }

  // Helper to check if login page is loaded
  async isLoginPageDisplayed(): Promise<boolean> {
    return (
      (await this.pageHeading1
        .isVisible({ timeout: 5000 })
        .catch(() => false)) &&
      (await this.pageHeading2.isVisible({ timeout: 5000 }).catch(() => false))
    );
  }
}

// Legacy export for backward compatibility
export const LOGIN_LOCATORS = {
  pageHeading1: (page: Page) =>
    page.getByRole("heading", { name: "Codemify Store" }),
  pageHeading2: (page: Page) =>
    page.getByRole("heading", { name: "Please login to continue" }),
  usernameInput: (page: Page) =>
    page.getByRole("textbox", { name: "Username" }),
  passwordInput: (page: Page) =>
    page.getByRole("textbox", { name: "Password" }),
  loginButton: (page: Page) => page.getByRole("button", { name: "Login" }),

  errorInvalidCredentials: (page: Page) =>
    page.getByRole("alert").filter({
      hasText: "Username and password do not match any user in this service",
    }),

  errorMessageUserLocked: (page: Page) =>
    page.getByRole("alert").filter({
      hasText: "Sorry, this user has been locked out",
    }),
};
