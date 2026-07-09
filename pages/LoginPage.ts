/**
 * Login Page Object Model
 * Handles all login page interactions and validations
 */

import { Page, expect } from "@playwright/test";
import { LoginPageLocators } from "../locators/login-locators";
import { UserType, getUserByType } from "../test-data/test-data-users";
import { BasePage } from "./BasePage";

export class LoginPage extends BasePage {
  readonly locators: LoginPageLocators;

  constructor(page: Page) {
    super(page);
    this.locators = new LoginPageLocators(page);
  }

  /**
   * Verify login page is displayed
   * Checks for all critical elements
   */
  async verifyLoginPageDisplayed(): Promise<void> {
    try {
      const isDisplayed = await this.locators.isLoginPageDisplayed();

      if (!isDisplayed) {
        const pageTitle = await this.page.title();
        const pageUrl = this.page.url();

        throw new Error(
          `Login page not displayed. Title: ${pageTitle}, URL: ${pageUrl}`,
        );
      }

      console.log("✓ Login page verified");
    } catch (error) {
      throw new Error(
        `Failed to verify login page: ${
          error instanceof Error ? error.message : String(error)
        }`,
        { cause: error },
      );
    }
  }

  /**
   * Fill username field
   */
  async fillUsername(username: string): Promise<void> {
    try {
      await this.locators.usernameInput.fill(username);
      console.log("✓ Username filled");
    } catch (error) {
      throw new Error(
        `Failed to fill username: ${
          error instanceof Error ? error.message : String(error)
        }`,
        { cause: error },
      );
    }
  }

  /**
   * Fill password field
   */
  async fillPassword(password: string): Promise<void> {
    try {
      await this.locators.passwordInput.fill(password);
      console.log("✓ Password filled");
    } catch (error) {
      throw new Error(
        `Failed to fill password: ${
          error instanceof Error ? error.message : String(error)
        }`,
        { cause: error },
      );
    }
  }

  /**
   * Click login button
   */
  async clickLoginButton(): Promise<void> {
    try {
      await this.locators.loginButton.click();
      console.log("✓ Login button clicked");
    } catch (error) {
      throw new Error(
        `Failed to click login button: ${
          error instanceof Error ? error.message : String(error)
        }`,
        { cause: error },
      );
    }
  }

  /**
   * Perform complete login with credentials
   */
  async login(username: string, password: string): Promise<void> {
    try {
      await this.fillUsername(username);
      await this.fillPassword(password);
      await this.clickLoginButton();

      // Wait for navigation to complete
      await this.page.waitForLoadState("networkidle");
      console.log(`✓ Login successful for user: ${username}`);
    } catch (error) {
      throw new Error(
        `Login failed: ${error instanceof Error ? error.message : String(error)}`,
        { cause: error },
      );
    }
  }

  /**
   * Login with specific user type
   */
  async loginWithUserType(userType: UserType): Promise<void> {
    const user = getUserByType(userType);
    await this.login(user.username, user.password);
  }

  /**
   * Verify invalid credentials error
   */
  async verifyInvalidCredentialsError(): Promise<void> {
    try {
      await expect(this.locators.invalidCredentialsError).toBeVisible({
        timeout: 5000,
      });
      console.log("✓ Invalid credentials error verified");
    } catch (error) {
      throw new Error("Invalid credentials error not displayed", {
        cause: error,
      });
    }
  }

  /**
   * Verify user locked error
   */
  async verifyUserLockedError(): Promise<void> {
    try {
      await expect(this.locators.userLockedError).toBeVisible({
        timeout: 5000,
      });
      console.log("✓ User locked error verified");
    } catch (error) {
      throw new Error("User locked error not displayed", {
        cause: error,
      });
    }
  }

  /**
   * Check if error message is visible
   */
  async isErrorDisplayed(): Promise<boolean> {
    return this.locators.invalidCredentialsError.isVisible().catch(() => false);
  }
}
