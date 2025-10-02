const config = require('../support/setup'); // adjust path if needed
const { chromium, firefox, webkit } = require('playwright');

async function launchBrowser(browserType = 'firefox') {
  const browserLauncher = { chromium, firefox, webkit };
  const launcher = browserLauncher[browserType];
  if (!launcher) {
    throw new Error(`Unsupported browser type: ${browserType}`);
  }

  const browser = await launcher.launch({ headless: config.headless });
  const context = await browser.newContext({ viewport: config.viewport });
  const page = await context.newPage();
  return { browser, context, page };
}

async function navigateTo(page, path = '/') {
  const url = path.startsWith('http') ? path : `${config.baseURL}${path}`;
  await page.goto(url, { timeout: 49000 });
}

async function enterValue(page, selector, keyword) {
  await page.waitForSelector(selector);
  await page.fill(selector, keyword);
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

async function clickElement(page, selector, options = {}) {
  try {
    const element = page.locator(selector);

    // Wait for element to be visible and enabled
    await element.waitFor({ state: 'visible', timeout: 10000 });

    // Optional: scroll into view if needed
    await element.scrollIntoViewIfNeeded();

    // Click with optional options (e.g., force, delay)
    await element.click(options);

    console.log(`✅ Clicked element: ${selector}`);
  } catch (error) {
    console.error(`❌ Failed to click element: ${selector}`);
    console.error(`Reason: ${error.message}`);

    // Optional: take screenshot on failure
    if (page) {
      const timestamp = Date.now();
      await page.screenshot({ path: `screenshots/click-failure-${timestamp}.png`, fullPage: true });
      console.log(`📸 Screenshot saved: screenshots/click-failure-${timestamp}.png`);
    }

    throw error; // Rethrow to fail the step and trigger teardown
  }
}


module.exports = {
  launchBrowser,
  navigateTo,
  enterValue,
  waitForInputVisible,
  clickElement
};
