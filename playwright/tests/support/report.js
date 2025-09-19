const report = require('multiple-cucumber-html-reporter');
const fs = require("fs");

function generateHtmlReport() {
  const jsonPath = 'cucumber_report.json';

  if (!fs.existsSync(jsonPath)) {
    console.warn(`Report file not found at ${jsonPath}`);
    return;
  }

  report.generate({
    pageTitle: "Automation Report",
    reportName: "Playwright + Cucumber Report",
    jsonDir: 'reports/json',
    reportPath: 'playwright-reports',
    displayDuration: true,
    displayReportTime: true,
    metadata: {
      browser: {
        name: 'chromium',
        version: 'latest',
      },
      device: 'Desktop',
      platform: {
        name: process.platform,
        version: process.version,
      },
    },
    customData: {
      title: 'Run Info',
      data: [
        { label: 'Project', value: 'Playwright E2E' },
        { label: 'Generated', value: new Date().toLocaleString() },
      ],
    },
  });
}

generateHtmlReport();
