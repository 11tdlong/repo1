const { chromium } = require('playwright');
const config = require('../support/setup'); // adjust path if needed

async function launchBrowser() {
  const browser = await chromium.launch({ headless: config.headless });
  const context = await browser.newContext({ viewport: config.viewport });
  const page = await context.newPage();
  return { browser, context, page };
}

async function navigateTo(page, path = '/') {
  const url = path.startsWith('http') ? path : `${config.baseURL}${path}`;
  await page.goto(url, { timeout: 49000 });
}

async function searchKeyword(page, selector, keyword) {
  await page.waitForSelector(selector);
  await page.fill(selector, keyword);
  await page.press(selector, 'Enter');
}

async function waitForInputVisible(page, xpathSelector, timeout = 12000) {
  const inputLocator = page.locator(xpathSelector);
  try {
    await inputLocator.waitFor({ state: 'visible', timeout });
    console.log(`✅ Input field visible: ${xpathSelector}`);
    return true;
  } catch (err) {
    console.warn(`⏱️ Timeout: Input field not visible within ${timeout}ms`);
    return false;
  }
}

async function clickElement(page, selector) {
  try {
    const element = page.locator(selector);
    await element.click();
    console.log(`✅ Clicked element: ${selector}`);
  } catch (error) {
    console.error(`❌ Failed to click element: ${selector}`, error);
  }
}

module.exports = {
  launchBrowser,
  navigateTo,
  searchKeyword,
  waitForInputVisible,
  clickElement
};
