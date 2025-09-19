const { Given, When, Then, After } = require('@cucumber/cucumber');
const utils = require('../support/utils');
const adv = "//div[@id='dialogPortal']/following-sibling::button";
const fill = "//div[@data-value]//input";
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

Then('I should see {string} is suggested', async function (keyword) {
  await this.page.waitForSelector(`text=${keyword}`);
});

After(async function () {
  if (this.browser) {
    await this.browser.close();
  }
});
