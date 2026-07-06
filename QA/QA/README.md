# HSS QA Automation

Functional + UI test automation for the HSS Membership Management System.
Drop this whole `QA/` folder into the root of the HSS project (sibling to the
frontend repo, not inside it), so the backend team's build never inherits
this tooling.

## What's in here

```
QA/
  playwright.config.ts     ← env-based BASE_URL, 3 projects: ui / functional / mobile-ui
  pages/                   ← Page Object Model classes (one per screen)
  tests/ui/                ← client-side-only tests, run today against localhost
  tests/functional/        ← workflow/backend tests, test.skip() until QA/UAT URL exists
  test-cases/
    test-case-master.xlsx  ← the test case log — source of truth, one row per FRD criterion
  scripts/
    generate-report.js     ← turns Playwright's JSON report into a Pass/Fail results.xlsx
  reports/                 ← results.json, results.xlsx, html/ (generated, gitignored)
```

## One-time setup

```bash
cd QA
npm install
npx playwright install --with-deps
cp .env.example .env
```

## Day-to-day: writing test cases

1. Open `test-cases/test-case-master.xlsx`. Each row = one FRD acceptance
   criterion. Columns: Test-ID, FRD Section, Module, Screen, Scenario,
   Precondition, Steps, Expected Result, Type (UI/Functional), Priority,
   Automation Status, Spec File, Notes.
2. See the "Legend & Instructions" tab in that file for the Test-ID
   convention (0xx = UI, 1xx = Functional) and status meanings.
3. For each row, write (or ask the qa-agent to write) the matching Playwright
   spec in `tests/ui/` or `tests/functional/`. **The test title must start
   with the Test-ID** (e.g. `test('TC-REG-002: ...')`) — that's how results
   get matched back to this sheet automatically.

## Running tests today (local frontend)

```bash
npm run test:ui              # run + see pass/fail in terminal
npm run test:ui:report       # run + generate reports/results.xlsx
```

`tests/functional/*` specs are `test.skip()`'d — they won't run yet, by design.

## Running tests once the backend hands you a QA/UAT URL

```bash
# edit .env: BASE_URL=https://hss-qa.example.com
# open tests/functional/*.spec.ts and remove .skip, fill in TODOs
npm run test:all:report
```

No changes needed anywhere else — `playwright.config.ts` reads `BASE_URL`
from the environment, so the same specs that ran against localhost now run
against the real build.

## Getting Pass/Fail results

Every `*:report` script writes `reports/results.xlsx`:
- **Test Results** tab — one row per test, green = passed, red = failed,
  yellow = skipped, with duration and first line of the error if it failed
- **Summary** tab — total / passed / failed / skipped / pass rate

Open it in Excel, or upload it to Google Drive if you want to share it —
moving to a live Google Sheet (auto-synced via the Sheets API) is a later
upgrade, not needed to get started.

Also generated: `reports/html/index.html` — Playwright's own interactive
report with screenshots, videos, and traces for any failure (open with
`npx playwright show-report reports/html`).

## Visual/UI regression baselines

The first run of a `toHaveScreenshot()` test creates the baseline image
under `tests/ui/__snapshots__/`. Commit that baseline to git. Future runs
diff against it and fail if the layout changes beyond the tolerance set in
`playwright.config.ts` (`maxDiffPixelRatio`). To intentionally accept a new
layout: `npx playwright test --update-snapshots`.

## Prerequisite for stable tests: data-testid attributes

All Page Objects here select elements via `data-testid`. Ask whoever is
building the frontend (Claude Code) to add and keep these consistent —
it's what keeps tests from breaking on every unrelated CSS/markup change.

## CI (optional, once you're ready)

Add a workflow that runs `npm run test:ui:report` on every PR against the
local build preview, and a second job for `npm run test:all:report` against
the QA/UAT URL on a schedule or on-demand once functional tests are active.
Upload `reports/` as a build artifact so results.xlsx is downloadable from
each run.
