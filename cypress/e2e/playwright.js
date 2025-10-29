const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('https://iboard.ssi.com.vn/', { waitUntil: 'networkidle' });

  const response = await fetch('https://iboard-query.ssi.com.vn/stock/HBC?boardId=MAIN');
  const result = await response.json();
  const stock = result.data;

  for (let i = 1; i <= 10; i++) {
    const bid = stock[`best${i}Bid`] ?? '—';
    const bidVol = stock[`best${i}BidVol`] ?? '—';
    const offer = stock[`best${i}Offer`] ?? '—';
    const offerVol = stock[`best${i}OfferVol`] ?? '—';

    console.log(`${bid.toString().padEnd(10)}${bidVol.toString().padEnd(10)}${offer.toString().padEnd(10)}${offerVol}`);
  }

  await browser.close();
})();
