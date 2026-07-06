/**
 * Reads Playwright's JSON report (reports/results.json) and produces
 * reports/results.xlsx — one row per test, Pass/Fail color-coded,
 * with the Test-ID parsed out of the test title (e.g. "TC-REG-002: ...").
 *
 * Run automatically via: npm run test:ui:report / npm run test:all:report
 * Or manually:           npm run report
 */
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

const RESULTS_JSON = path.join(__dirname, '..', 'reports', 'results.json');

// Optional 3rd arg: custom output path (relative to QA/QA/), so per-module
// runs don't clobber each other, e.g.:
//   node scripts/generate-report.js reports/registration-results.xlsx
// Defaults to reports/results.xlsx when omitted (unchanged behavior).
const outArg = process.argv[2];
const OUTPUT_XLSX = outArg
  ? path.join(__dirname, '..', outArg)
  : path.join(__dirname, '..', 'reports', 'results.xlsx');

const TESTID_PATTERN = /^(TC-[A-Z0-9-]+):\s*(.*)$/;

function flattenSuites(suites, project, rows) {
  for (const suite of suites || []) {
    if (suite.suites) flattenSuites(suite.suites, project, rows);
    for (const spec of suite.specs || []) {
      for (const t of spec.tests || []) {
        const testProject = t.projectName || project;
        const lastResult = t.results?.[t.results.length - 1];
        const status = lastResult?.status || 'unknown';
        const durationMs = lastResult?.duration ?? 0;
        const error = lastResult?.error?.message || '';

        const match = spec.title.match(TESTID_PATTERN);
        const testId = match ? match[1] : '(no Test-ID)';
        const scenario = match ? match[2] : spec.title;

        rows.push({
          testId,
          scenario,
          project: testProject,
          file: spec.file,
          status,
          durationSec: (durationMs / 1000).toFixed(2),
          error: error.split('\n')[0].slice(0, 200),
        });
      }
    }
  }
}

function main() {
  if (!fs.existsSync(RESULTS_JSON)) {
    console.error(`No results.json found at ${RESULTS_JSON}. Run tests with the json reporter first.`);
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(RESULTS_JSON, 'utf-8'));
  const rows = [];
  flattenSuites(raw.suites, raw.config?.projects?.[0]?.name, rows);

  rows.sort((a, b) => a.testId.localeCompare(b.testId));

  const wb = new ExcelJS.Workbook();
  const sheet = wb.addWorksheet('Test Results');

  sheet.columns = [
    { header: 'Test-ID', key: 'testId', width: 16 },
    { header: 'Scenario', key: 'scenario', width: 55 },
    { header: 'Suite', key: 'project', width: 14 },
    { header: 'Spec File', key: 'file', width: 35 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Duration (s)', key: 'durationSec', width: 12 },
    { header: 'Error (first line)', key: 'error', width: 60 },
  ];
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };

  const passFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
  const failFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC7CE' } };
  const skipFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEB9C' } };

  for (const row of rows) {
    const r = sheet.addRow(row);
    const statusCell = r.getCell('status');
    if (row.status === 'passed') statusCell.fill = passFill;
    else if (row.status === 'failed' || row.status === 'timedOut') statusCell.fill = failFill;
    else statusCell.fill = skipFill;
  }

  const total = rows.length;
  const passed = rows.filter(r => r.status === 'passed').length;
  const failed = rows.filter(r => r.status === 'failed' || r.status === 'timedOut').length;
  const skipped = total - passed - failed;

  const summary = wb.addWorksheet('Summary');
  summary.columns = [{ key: 'label', width: 20 }, { key: 'value', width: 15 }];
  summary.addRows([
    { label: 'Total Tests', value: total },
    { label: 'Passed', value: passed },
    { label: 'Failed', value: failed },
    { label: 'Skipped', value: skipped },
    { label: 'Pass Rate', value: total ? `${((passed / total) * 100).toFixed(1)}%` : 'N/A' },
    { label: 'Generated At', value: new Date().toISOString() },
  ]);
  summary.getColumn('label').font = { bold: true };

  wb.xlsx.writeFile(OUTPUT_XLSX).then(() => {
    console.log(`Report written: ${OUTPUT_XLSX}`);
    console.log(`Total: ${total} | Passed: ${passed} | Failed: ${failed} | Skipped: ${skipped}`);
  });
}

main();
