const { Given, When, Then, After } = require('@cucumber/cucumber');
const utils = require('../support/utils');
const adv = "//div[@id='dialogPortal']/following-sibling::button";
const fill = "//div[@data-value]//input";
const cell = "//div[@data-value]";
const suggestion = "//div[@tabindex='-1']//div[contains(text(),'HBC')]";

Given('I navigate to the front page', { timeout: 99000 }, async function () {
  const { browser, page } = await utils.launchBrowser(false, 500); // headed mode with slowMo
  this.browser = browser;
  this.page = page;
  await utils.navigateTo(this.page); // navigates to config.baseURL
  const isVisible = await utils.waitForInputVisible(this.page, adv, 28000);
  if (isVisible) {
	await utils.clickElement(this.page, adv);
  }
  //await utils.clickElement(this.page, adv);
  await utils.waitForInputVisible(this.page, fill);
});

When('I enter {string}', async function (keyword) {
  await utils.searchKeyword(this.page, fill, keyword); // adjust selector if needed
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
  await this.page.waitForTimeout(10000); // Waits for 10 seconds (10,000 ms)
  await this.page.screenshot({ path: 'screenshot.png' }); // Takes screenshot and saves it
});

After(async function () {
  if (this.browser) {
    await this.browser.close();
  }
});
