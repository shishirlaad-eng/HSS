import { test, expect } from '@playwright/test';
import { RegistrationPage } from '../../pages/RegistrationPage';

/**
 * UI-only tests: client-side behavior, no real backend needed.
 * Runs today against the local frontend (BASE_URL=http://localhost:3000).
 * Test-ID naming (TC-xxx) maps 1:1 to rows in test-cases/test-case-master.xlsx
 * so results can be reconciled back to the FRD acceptance criteria.
 */

test.describe('Adult Registration — UI', () => {
  test('TC-REG-001: Registration form renders all required fields', async ({ page }) => {
    const reg = new RegistrationPage(page);
    await reg.goto();

    await expect(reg.nameInput).toBeVisible();
    await expect(reg.emailInput).toBeVisible();
    await expect(reg.ageInput).toBeVisible();
    await expect(reg.submitButton).toBeVisible();
  });

  test('TC-REG-002: Invalid email shows client-side validation error', async ({ page }) => {
    const reg = new RegistrationPage(page);
    await reg.goto();

    await reg.fillForm('Jane Doe', 'not-an-email', '25');
    await reg.submit();

    await expect(reg.emailError).toBeVisible();
    await expect(reg.emailError).toContainText('valid email');
  });

  test('TC-REG-003: Registration screen matches approved layout (visual)', async ({ page }) => {
    const reg = new RegistrationPage(page);
    await reg.goto();

    // First run creates the baseline screenshot; future runs diff against it.
    await expect(page).toHaveScreenshot('registration-screen.png');
  });

  test('TC-REG-004: Registration form is usable on mobile viewport', async ({ page }) => {
    const reg = new RegistrationPage(page);
    await reg.goto();

    await expect(reg.submitButton).toBeInViewport();
  });
});
