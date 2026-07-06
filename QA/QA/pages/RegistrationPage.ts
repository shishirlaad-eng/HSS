import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model — one class per screen.
 * If a UI tweak changes a selector, you fix it here once,
 * instead of in every test that touches this screen.
 *
 * Relies on data-testid attributes. Ask the frontend build (Claude Code)
 * to keep these stable and consistent as the UI evolves.
 */
export class RegistrationPage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly ageInput: Locator;
  readonly submitButton: Locator;
  readonly emailError: Locator;
  readonly successBanner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.getByTestId('reg-name-input');
    this.emailInput = page.getByTestId('reg-email-input');
    this.ageInput = page.getByTestId('reg-age-input');
    this.submitButton = page.getByTestId('reg-submit-btn');
    this.emailError = page.getByTestId('reg-email-error');
    this.successBanner = page.getByTestId('reg-success-banner');
  }

  async goto() {
    await this.page.goto('/registration');
  }

  async fillForm(name: string, email: string, age: string) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.ageInput.fill(age);
  }

  async submit() {
    await this.submitButton.click();
  }
}
