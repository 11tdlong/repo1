const config = require('./tests/support/setup');

module.exports = {
  use: {
    headless: config.headless,
    browserName: 'chromium',
    viewport: config.viewport,
    baseURL: config.baseURL,
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  timeout: 59000,
  retries: 0,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report' }]
  ]
};
