import { defineConfig, devices } from '@playwright/test';

/**
 * BASE_URL switches the whole suite between environments with zero test changes.
 *
 *   Local frontend (today):      BASE_URL=http://localhost:3000
 *   Backend team's QA/UAT build: BASE_URL=https://hss-qa.example.com
 *
 * Set it in a .env file (not committed) or inline:
 *   BASE_URL=http://localhost:3000 npm run test:ui
 */
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
    // Visual comparison tolerance for UI/screenshot assertions
    toHaveScreenshot: { maxDiffPixelRatio: 0.02 },
  },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 4 : undefined,

  reporter: [
    ['list'],
    ['json', { outputFile: 'reports/results.json' }],
    ['html', { outputFolder: 'reports/html', open: 'never' }],
  ],

  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'ui',
      testDir: './tests/ui',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'functional',
      testDir: './tests/functional',
      use: { ...devices['Desktop Chrome'] },
      // Functional specs use test.skip() internally until the backend
      // QA/UAT URL exists — see tests/functional/README notes in each file.
    },
    {
      name: 'mobile-ui',
      testDir: './tests/ui',
      use: { ...devices['iPhone 13'] },
    },
  ],
});
