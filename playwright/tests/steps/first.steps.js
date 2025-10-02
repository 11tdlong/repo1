const { Given, When, Then, After, Before } = require('@cucumber/cucumber');
const utils = require('../support/utils');
const adv = "//div[@id='dialogPortal']/following-sibling::button";
const fill = "//div[@data-value]//input";
const cell = "//div[@data-value]";
const suggestion = "//div[@tabindex='-1']//div[contains(text(),'HBC')]";

Before(async function () {
  const { browser, context, page } = await utils.launchBrowser(); // or 'chromium', 'webkit'
  this.browser = browser;
  this.context = context;
  this.page = page;
});

After(async function (scenario) {
  try {
	console.log(scenario.result?.status);
	console.log(this.page.isClosed());
    if (scenario.result?.status?.toUpperCase() === 'FAILED' && this.page && !this.page.isClosed()) {
      const timestamp = Date.now();
      const screenshotBuffer = await this.page.screenshot({ path: `screenshots/failure-${timestamp}.png`, fullPage: true });
      this.attach(screenshotBuffer, 'image/png'); // 👈 embeds screenshot in report
    }
  } catch (err) {
    console.error('❌ Screenshot failed:', err);
  }

  try {
    if (this.page && !this.page.isClosed()) await this.page.close();
  } catch (err) {
    console.error('❌ Page close failed:', err);
  }

  try {
    if (this.context) await this.context.close();
  } catch (err) {
    console.error('❌ Context close failed:', err);
  }

  try {
    if (this.browser) await this.browser.close();
  } catch (err) {
    console.error('❌ Browser close failed:', err);
  }

});


Given('I navigate to the front page', { timeout: 99000 }, async function () {
  await utils.navigateTo(this.page); // navigates to config.baseURL
  const isVisible = await utils.waitForInputVisible(this.page, adv, 28000);
  if (isVisible) {
	await utils.clickElement(this.page, adv);
  }
  //await utils.clickElement(this.page, adv);
  await utils.waitForInputVisible(this.page, fill);
});

When('I enter {string}', async function (keyword) {
  await utils.enterValue(this.page, fill, keyword); // adjust selector if needed
});

Then('I should see {string} is suggested', async function (code) {
  let retry = 3;
  let isVisible = false;
  while (retry > 0) {
    try {
      isVisible = await utils.waitForInputVisible(this.page, suggestion, 4000);
      if (isVisible) break;
    } catch (error) {
      console.warn(`Attempt failed: ${3 - retry + 1}`, error);
    }
    retry--;
  }
  if (isVisible) {
    await utils.clickElement(this.page, suggestion);
  } else {
    console.error('Element not visible after multiple attempts.');
  }
});

Then('I should see data', async function () {
  await this.page.waitForTimeout(2000); // Waits for 2
  await this.page.screenshot({ path: 'screenshot.png' }); // Takes screenshot and saves it
});

Given(/^I open google$/, async function () {
	await this.page.goto('https://google.vn');
	await utils.waitForInputVisible(this.page, '(//textarea)[1]');
});

When(/^I search (.*)$/, async function (code) {
	await utils.enterValue(this.page, '(//textarea)[1]', code);
});

Then(/^I click bad stuff to see failure$/, async function () {
	await utils.clickElement(this.page, '//xyz');
});
