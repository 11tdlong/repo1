const reporter = require('cucumber-html-reporter');
console.log('✅ HTML report generated: search_report.html');

reporter.generate({
  theme: 'bootstrap',
  jsonFile: './cucumber_report.json',
  output: 'search_report.html',
  reportSuiteAsScenarios: true,
  launchReport: true,
  metadata: {
    "Browser": "Chromium",
    "Platform": process.platform,
    "Executed": "Local"
  }
});
