//firsttest.js
import {inspect} from "util";
// ✅ Place this at the top of your spec file
function visitWithRetry(url, retries = 3, delay = 2000) {
  cy.log(`Attempting to visit: ${url} (Retries left: ${retries})`);

  cy.request({
    url,
    failOnStatusCode: false
  }).then((response) => {
    if (response.status === 200) {
      cy.visit(url);
    } else if (retries > 0) {
      cy.wait(delay);
      visitWithRetry(url, retries - 1, delay);
    } else {
      throw new Error(`Failed to load ${url} after multiple attempts. Status: ${response.status}`);
    }
  });
}

describe('Quick and Simple Test', () => {

    const menu = "//div[contains(@class,'header-hambuger')]"
	const item = "//a[contains(text(),'Quan h')]"
	const page = "//h1[contains(@class,'title-42px')]"
	const closeAd = '//*[@title="Close"]'
	const closeAd2 = 'button[title="Close"]'
    it('ijc', () => {
        cy.once('uncaught:exception', () => false);
        cy.visit('https://becamexijc.com/');
        cy.title().should('include', 'Becamex IJC')
		cy.get('body').then((body) => {
			cy.wait(10000).then(() => {
				if (body.find(closeAd2).length > 0) {
					cy.log('Ad found, close Ad')
					cy.get(closeAd2).click();
				} else {
					cy.log('No ad, nice')
				}
			})
		})
		cy.xpath('//div[contains(@class,"header-hambuger")]', { timeout: 10000 }).should('be.visible'); //cy.get(selector).should('be.visible');
		cy.xpath(menu).click()
		
		cy.xpath(item, { timeout: 10000 }).should('be.visible');
		cy.xpath(item).click()
		
		cy.xpath(page, { timeout: 10000 }).should('be.visible');
		cy.xpath(page).eq(0).should('contain', 'Tin cổ đông')
		
		cy.xpath('(//time)[1]').then(($text) => {
			let storedValue = $text.text().trim()
			//expect(txt).to.eq('SomeText')
			cy.wrap(storedValue).as('storedValue')
		})
		cy.get('@storedValue').then((storedValue) => {
			cy.task('log', {message: '--------------------', color: 'blue'})
			if(storedValue == "28 tháng 10, 2025") {
				cy.task('log', {message: storedValue})
				cy.task('log', {message: 'OLD News', color: 'yellow'})
			} else {
				cy.task('log', {message: storedValue})
				cy.task('log', {message: 'NEW News', color: 'red'})
			}
		})
    })

    it('hbc', () => {
		let report = '//*[@class="txt7" and contains(text(),"2025")]';
		cy.viewport(1600, 1200)
        cy.visit('https://hbcg.vn/');
        cy.title().should('include', 'HOA BINH')
		cy.xpath("//a[@data-toggle='dropdown' and contains(text(),'đông')]").click()
		cy.xpath("//a[contains(@href,'financial')]", { timeout: 10000 }).should('be.visible');
		cy.xpath("//a[contains(@href,'financial')]").click();
		//cy.xpath("//span[@id='text_name']").click();
		//cy.xpath("//a[contains(text(),'Báo cáo 2024')]").click();
		cy.xpath('(//p[contains(@class,"date-info")])[1]').then(($text) => {
			let storedValue = $text.text().trim()
			//expect(txt).to.eq('SomeText')
			cy.wrap(storedValue).as('storedValue')
		})
		cy.get('@storedValue').then((storedValue) => {
			cy.task('log', {message: '--------------------', color: 'blue'})
			cy.log("x" + storedValue + "x") //prints value
			if(storedValue.includes("29/08/2025")) {
				cy.task('log', {message: storedValue})
				cy.task('log', {message: 'OLD Report', color: 'yellow'})
			} else {
				cy.task('log', storedValue)
				cy.task('log', {message: 'NEW Report', color: 'red'})
			}
		})
		
		cy.xpath("//a[@data-toggle='dropdown' and contains(text(),'đông')]").click()
		cy.xpath("(//li/a[contains(@href,'news')][contains(text(),'ng tin')])[1]", { timeout: 10000 }).should('be.visible');
		cy.xpath("(//li/a[contains(@href,'news')][contains(text(),'ng tin')])[1]").click();
		cy.xpath('(//p[contains(@class,"date-info")])[1]').then(($text) => {
			let storedValue = $text.text().trim()
			//expect(txt).to.eq('SomeText')
			cy.wrap(storedValue).as('storedValue')
		})
		cy.get('@storedValue').then((storedValue) => {
			cy.log("x" + storedValue + "x") //prints value
			if(storedValue.includes("22/10/2025")) {
				cy.task('log', {message: storedValue})
				cy.task('log', {message: 'OLD News', color: 'yellow'})
			} else {
				cy.task('log', {message: storedValue})
				cy.task('log', {message: 'NEW News', color: 'red'})
			}
		})
    })
    
	it('vip', () => {
		cy.once('uncaught:exception', () => false);
		let report = '//*[@class="txt7" and contains(text(),"2025")]';
		let firstCombo = "(//span/span[@role='textbox'])[1]";
		let all = "//li[normalize-space()='Tất cả']";
		let tt = "//h3/following-sibling::div/a[contains(@href,'tt-codong.html') and @class='btn-link']";
		let ttData = "(//h3)[1]/following-sibling::div";
		cy.viewport(1600, 1200)
        //cy.visit('https://vipco.petrolimex.com.vn/ndt.html');
		visitWithRetry('https://vipco.petrolimex.com.vn/ndt.html');
        cy.title().should('include', 'VIPCO')
		cy.wait(1000);
		cy.xpath(firstCombo, { timeout: 10000 }).should('be.visible');
		cy.wait(1000);
		cy.xpath(firstCombo).click()
		cy.xpath(all, { timeout: 10000 }).should('be.visible');
		cy.xpath(all).click();
		cy.xpath('(//ul/li//div[@class="title-normal"]/following-sibling::span)[1]').then(($text) => {
			let storedValue = $text.text().trim()
			cy.wrap(storedValue).as('storedValue')
		})
		//red, green, yellow, blue, magenta, cyan, white, gray
		cy.get('@storedValue').then((storedValue) => {
			cy.log("x" + storedValue + "x") //prints value
			if(storedValue.includes("29/10/2025")) {
				cy.task('log', {message: storedValue})
				cy.task('log', {message: 'OLD Report', color: 'yellow'})
			} else {
				cy.task('log', {message: storedValue})
				cy.task('log', {message: 'NEW Report', color: 'red'})
			}
		})
		cy.xpath(tt).click();
		cy.xpath(ttData).then(($text) => {
			let storedValue = $text.text().trim()
			cy.wrap(storedValue).as('storedValue')
		})
		//red, green, yellow, blue, magenta, cyan, white, gray
		cy.get('@storedValue').then((storedValue) => {
			cy.task('log', {message: '--------------------', color: 'blue'})
			if(storedValue.includes("17/10/2025")) {
				cy.task('log', {message: storedValue})
				cy.task('log', {message: 'OLD News', color: 'yellow'})
			} else {
				cy.task('log', {message: storedValue})
				cy.task('log', {message: 'NEW News', color: 'red'})
			}
		})
    })
})