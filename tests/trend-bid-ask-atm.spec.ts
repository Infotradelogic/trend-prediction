import { test, expect, chromium, Browser, Page } from '@playwright/test';
import { log } from 'console';
const fs = require('fs');
let browser:Browser;
let page:Page;

// Extend the test timeout to 10 minutes (600,000 ms)
test.setTimeout(2*10*600000);

test('nifty::predict trend as per ATM bid and ask prices for CE and PE', 
 { tag: '@atm'},
  async () => {
  //Infinite loop to run every 15 seconds
  //Create a new page
  browser = await chromium.launch();
  page = await browser.newPage();      
  //Navigate to the Sensibull option chain URL for the specified expiry date
  await page.goto('https://web.sensibull.com/option-chain?tradingsymbol=NIFTY&expiry=2024-11-14');  
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


async function checkBids(page:Page) {
  while (true) {  
    try {
      // Launch the browser in non-headless mode
      //const browser = await chromium.launch();
      //browser = await chromium.launch();

      let difference_of_ce_pe_bid = 0;
      let difference_of_ce_pe_offer = 0;
      const POSITIVE_TOLERANCE_THRESHOLD = 10; 
      const NEGATIVE_TOLERANCE_THRESHOLD = -10; 
      

      // Extract bid and offer prices for the At-the-Money (ATM) Call and Put options
      const call_ce_bid = parseFloat(await page.locator("//*[@id='oc_atm_row']//td[11]").textContent() ?? "0") || null;
      console.log("final_call_ce_bid:::", call_ce_bid);

      const call_ce_offer = parseFloat(await page.locator("//*[@id='oc_atm_row']//td[12]").textContent() ?? "0") || null;
      console.log("final_call_ce_offer:::", call_ce_offer);

      const put_pe_bid = parseFloat(await page.locator("//*[@id='oc_atm_row']//td[28]").textContent() ?? "0") || null;
      console.log("final_put_pe_bid:::", put_pe_bid);

      const put_pe_offer = parseFloat(await page.locator("//*[@id='oc_atm_row']//td[27]").textContent() ?? "0") || null;
      console.log("final_put_pe_offer:::", put_pe_offer);

      // Calculate the differences and round to 2 decimal places
      difference_of_ce_pe_bid = parseFloat(((call_ce_bid ?? 0) - (put_pe_bid ?? 0)).toFixed(2));
      console.log('The difference of ce pe bid is', difference_of_ce_pe_bid);

      difference_of_ce_pe_offer = parseFloat(((call_ce_offer ?? 0) - (put_pe_offer ?? 0)).toFixed(2));
      console.log('The difference of ce pe offer is', difference_of_ce_pe_offer);

      // Determine today's trend using the extracted bid and offer prices
      const todaysTrend = getTrend(call_ce_bid ?? 0, put_pe_bid ?? 0, call_ce_offer ?? 0, put_pe_offer ?? 0);

      // Define options for IST timestamp formatting
      const options = { timeZone: 'Asia/Kolkata', hour12: false };
      const istTimestamp = new Date().toLocaleString('en-IN', options);

      // Format the log data with timestamp and trend information
      const logData = `[${istTimestamp}] TODAYS TREND::ATM only::ce-pe bid diff::${difference_of_ce_pe_bid}::difference_of_ce_pe_offer::${difference_of_ce_pe_offer} :::${todaysTrend}\n`;
    
      // Append the log data to a log file (log_atm.txt) in the project directory
      fs.appendFileSync('log_atm.txt', logData);

      // Also log the trend information to the console
      console.log(logData);

      // Function to determine trend based on bid and offer prices for CE and PE
      function getTrend(call_ce_bid, put_pe_bid, call_ce_offer, put_pe_offer) {
        if (difference_of_ce_pe_bid <= POSITIVE_TOLERANCE_THRESHOLD && difference_of_ce_pe_bid >= NEGATIVE_TOLERANCE_THRESHOLD && difference_of_ce_pe_offer <= POSITIVE_TOLERANCE_THRESHOLD && difference_of_ce_pe_offer >= NEGATIVE_TOLERANCE_THRESHOLD) {
          return "Sideways based upon bid spread tolerance";
        } else if (call_ce_bid > put_pe_bid && call_ce_offer > put_pe_offer) {
          return "Up";
        } else if (call_ce_bid < put_pe_bid && call_ce_offer < put_pe_offer) {
          return "Down";
        } else {
          return "Sideways based upon bid and offer prices gaps";
        }
      }

      // Close the browser after the current run
      //await browser.close();

      // Wait for 15 seconds before the next run of the loop
      console.log("Waiting for 15 seconds before the next run...");
      await new Promise(resolve => setTimeout(resolve, 15 * 1000));

    } catch (error) {
      console.error("An error occurred:", error);

      // If an error occurs, wait a bit longer before retrying
      console.log("Waiting for 30 seconds before the next retry...");
      await new Promise(resolve => setTimeout(resolve, 30 * 1000));
    }
  }
}