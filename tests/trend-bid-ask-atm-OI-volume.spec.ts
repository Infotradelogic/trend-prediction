import { test, expect, chromium, Browser, Page } from '@playwright/test';
import { checkBids,getMaxpain } from '../pages/bids';
const fs = require('fs');
let browser:Browser;
let page:Page;

// Extend the test timeout to 10 minutes (600,000 ms)
test.setTimeout(6*10*600000);

test('nifty::predict trend as per ATM bid and ask prices,OI, OI Change and Volume for CE and PE', 
 { tag: '@atm,@both'},
  async () => {
  //Infinite loop to run every 15 seconds
  //Create a new page
  browser = await chromium.launch();
  page = await browser.newPage();      
  //Navigate to the Sensibull option chain URL for the specified expiry date
  await page.goto('https://web.sensibull.com/option-chain?tradingsymbol=NIFTY&expiry=2024-11-21');  
  //Wait for the page to fully load, ensuring network stability
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  // Verify that a key page element is visible before proceeding
  await expect(page.locator("#app > div > div.sc-fnlXYz.geLyUk.page-sidebar-is-open.sn-page--option-chain > div.sc-jcRDWI.cubncZ.sn-l__app-content > div.sc-fkubWd.gzihuL > div > footer > div.views > button:nth-child(3) > p")).toBeVisible();
  // Click on a button (identified by a specific selector) that loads the necessary data
  await page.locator("#app > div > div.sc-fnlXYz.geLyUk.page-sidebar-is-open.sn-page--option-chain > div.sc-jcRDWI.cubncZ.sn-l__app-content > div.sc-fkubWd.gzihuL > div > footer > div.views > button:nth-child(3) > p").click({ timeout: 60000 });
  console.log("outside while....")
  await checkBids(page)
});
test('nifty::check maxpain', 
 { tag: '@atm,@both'},
  async () => {
  //Infinite loop to run every 15 seconds
  //Create a new page
  browser = await chromium.launch();
  page = await browser.newPage();      
  //Navigate to the Sensibull option chain URL for the specified expiry date
  await page.goto('https://web.sensibull.com/live-options-charts');  
  //Wait for the page to fully load, ensuring network stability
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  // Verify that a key page element is visible before proceeding
  //await expect(page.locator("#app > div > div.sc-fnlXYz.geLyUk.page-sidebar-is-open.sn-page--option-chain > div.sc-jcRDWI.cubncZ.sn-l__app-content > div.sc-fkubWd.gzihuL > div > footer > div.views > button:nth-child(3) > p")).toBeVisible();
  // Click on a button (identified by a specific selector) that loads the necessary data
  //await page.locator("#app > div > div.sc-fnlXYz.geLyUk.page-sidebar-is-open.sn-page--option-chain > div.sc-jcRDWI.cubncZ.sn-l__app-content > div.sc-fkubWd.gzihuL > div > footer > div.views > button:nth-child(3) > p").click({ timeout: 60000 });
  //console.log("outside while....")
  await getMaxpain(page)
});


