import { test, expect } from '@playwright/test';
import { RegistrationPage } from '../../pages/RegistrationPage';

/**
 * FUNCTIONAL tests: need the real backend (persistence, approval workflow,
 * status transitions). Written now from the frozen FRD acceptance criteria
 * so nothing is forgotten — activated by removing test.skip() once the
 * backend team hands over the QA/UAT build URL.
 *
 * To activate:
 *   1. Remove `.skip` below
 *   2. Set BASE_URL to the QA/UAT URL
 *   3. Fill in real seeded test data / auth where marked TODO
 */

test.describe('Adult Registration — Functional (pending backend)', () => {
  test.skip('TC-REG-101: Adult registration moves to Pending Approval after submit', async ({ page }) => {
    const reg = new RegistrationPage(page);
    await reg.goto();

    // TODO: use seeded test data once backend QA URL is live
    await reg.fillForm('Test Adult', 'test.adult@example.com', '30');
    await reg.submit();

    await expect(reg.successBanner).toBeVisible();
    // TODO: assert status via admin dashboard or API once available
    // await expect(page.getByTestId('reg-status')).toHaveText('Pending Approval');
  });

  test.skip('TC-REG-102: Activity Centre Admin can approve a pending registration', async ({ page }) => {
    // TODO: log in as Activity Centre Admin (seeded account)
    // TODO: navigate to pending approvals queue
    // TODO: approve TC-REG-101's registration and assert status = Active
  });

  test.skip('TC-REG-103: Approval hierarchy is enforced (Ops User cannot approve)', async ({ page }) => {
    // TODO: log in as Ops User (seeded account)
    // TODO: assert approve action is not available / returns 403
  });
});
