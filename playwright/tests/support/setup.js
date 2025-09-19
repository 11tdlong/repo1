const { setDefaultTimeout } = require('@cucumber/cucumber');

// Global step timeout
setDefaultTimeout(14000);

// Shared config variables
const config = {
  headless: false,
  baseURL: 'https://fireant.vn',
  viewport: { width: 1860, height: 900 }
};

module.exports = config;