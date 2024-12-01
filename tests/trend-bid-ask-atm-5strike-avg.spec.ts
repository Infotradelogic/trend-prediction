import { test, expect, chromium } from '@playwright/test';
const fs = require('fs');

// Extend the test timeout to 10 minutes (600,000 ms)
test.setTimeout(2*10*600000);

test.skip('nifty::predict trend as per ATM bid and ask prices for CE and PE -5 strikes avg',
  {tag: '@avgatm'},async () => {
  while (true) {  // Infinite loop to run every 10 seconds

    // Launch the browser with headless set to false
    //const browser = await chromium.launch({ headless: false });
    const browser = await chromium.launch();
    
    // Create a new page
    const page = await browser.newPage();
    let expiry = "2024-11-14";
    // Navigate to the given URL
    //await page.goto('https://web.sensibull.com/option-chain?tradingsymbol=NIFTY&expiry=2024-11-07');
    await page.goto('https://web.sensibull.com/option-chain?tradingsymbol=NIFTY&expiry='+expiry);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Optional: Verify that the page loaded correctly
    //await expect(page).toHaveURL('https://web.sensibull.com/option-chain?tradingsymbol=NIFTY&expiry=2024-11-07');
    //await expect(page).toHaveURL('https://web.sensibull.com/option-chain?tradingsymbol=NIFTY&expiry=2024-11-14');
    await expect(page.locator("#app > div > div.sc-fnlXYz.geLyUk.page-sidebar-is-open.sn-page--option-chain > div.sc-jcRDWI.cubncZ.sn-l__app-content > div.sc-fkubWd.gzihuL > div > footer > div.views > button:nth-child(3) > p")).toBeVisible();
    await page.locator("#app > div > div.sc-fnlXYz.geLyUk.page-sidebar-is-open.sn-page--option-chain > div.sc-jcRDWI.cubncZ.sn-l__app-content > div.sc-fkubWd.gzihuL > div > footer > div.views > button:nth-child(3) > p").click({timeout:60000})

    // Get ATM CE bid price
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(6000)

    //ce ITM
            let totalBid = 0;
            let totalOffer = 0;
            let count = 0;
            let averageBidPrice_CE=0;
            let averageOfferPrice_CE=0;
            let checkForStrikes =5;
            //const TOLERANCE_THRESHOLD = 5; 
            const POSITIVE_TOLERANCE_THRESHOLD = 5; 
            const NEGATIVE_TOLERANCE_THRESHOLD = -5; 
            let difference_of_ce_pe_bid = 0;
            let difference_of_ce_pe_offer = 0;

            //atm rows
            // Call and put prices
            const call_ce_bid_atm = parseFloat(await page.locator("//*[@id='oc_atm_row']//td[11]").textContent() ?? "0") || null;
            console.log("final_call_ce_bid_atm:::", call_ce_bid_atm);

            const call_ce_offer_atm = parseFloat(await page.locator("//*[@id='oc_atm_row']//td[12]").textContent() ?? "0") || null;
            console.log("final_call_ce_offer_atm:::", call_ce_offer_atm);
            
            for (let i = 1; i <= checkForStrikes; i++) {
                // Get the call_ce_bid from the previous row
                const call_ce_bid = parseFloat(await page.locator(`(//*[@id='oc_atm_row']//td[11])/preceding::tr[${i}]//td[11]`).textContent() ?? "0") || null;
                //console.log("final_call_ce_bid of previous row::" + i, call_ce_bid);     
                
                //otm rows
                const call_ce_bid1 = parseFloat(await page.locator(`(//*[@id='oc_atm_row']//td[11])/following::tr[${i}]//td[11]`).textContent() ?? "0") || null;
                //console.log("final_call_ce_bid1 of previous row::" + i, call_ce_bid1);  

                // Get the call_ce_offer from the previous row
                const call_ce_offer = parseFloat(await page.locator(`(//*[@id='oc_atm_row']//td[11])/preceding::tr[${i}]//td[12]`).textContent() ?? "0") || null;
                //console.log("call_ce_offer of previous row::" + i, call_ce_offer);

                //otm rows
                const call_ce_offer1 = parseFloat(await page.locator(`(//*[@id='oc_atm_row']//td[11])/following::tr[${i}]//td[12]`).textContent() ?? "0") || null;
                //console.log("call_ce_offer1 of previous row::" + i, call_ce_offer1);
            
               // Only consider valid values for average calculation (both bid and offer must be non-null)
                if (call_ce_bid !== null && call_ce_offer !== null && call_ce_bid1 !== null && call_ce_offer1 !== null) {
                    totalBid += call_ce_bid + call_ce_bid1 ;
                    totalOffer += call_ce_offer + call_ce_offer1 ;
                    count++;
                }
            
                //console.log(`\n`);  // Just for better readability
            }
            console.log('totalBid without atm::'+totalBid);
            console.log('totalOffer without atm::'+totalOffer);

            totalBid = totalBid + (call_ce_bid_atm ?? 0);
            console.log('totalBid with atm::'+totalBid);

            totalOffer = totalOffer + (call_ce_offer_atm ?? 0);
            console.log('totalOffer with atm::'+totalOffer);
            // Calculate and log the average price of the bid and offer over the 5 rows
            if (count > 0) {
                
                averageBidPrice_CE = (totalBid )/ ((count*2)+1);
                averageOfferPrice_CE = totalOffer / ((count*2)+1);
            
                console.log(`Average Call CE Bid Price: ${averageBidPrice_CE}`);
                console.log(`Average Call CE Offer Price: ${averageOfferPrice_CE}`);
            } else {
                console.log('Unable to calculate averages due to invalid data.');
            }
//pe prices
        let totalBid_PE = 0;
        let totalOffer_PE = 0;
        let count_PE = 0;
        let averageBidPrice_PE=0;
        let averageOfferPrice_PE=0
        //atm rows
        // Call and put prices
        const put_pe_bid_atm = parseFloat(await page.locator("//*[@id='oc_atm_row']//td[28]").textContent() ?? "0") || null;
        console.log("final_put_pe_bid_atm:::", put_pe_bid_atm);
    
        const put_pe_offer_atm = parseFloat(await page.locator("//*[@id='oc_atm_row']//td[27]").textContent() ?? "0") || null;
        console.log("final_put_pe_offer_atm:::", put_pe_offer_atm);

        for (let i = 1; i <= checkForStrikes; i++) {
          // Get the put_pe_bid from the previous row
          const put_pe_bid = parseFloat(await page.locator(`(//*[@id='oc_atm_row']//td[11])/preceding::tr[${i}]//td[28]`).textContent() ?? "0") || null;
          //console.log("final_put_pe_bid of OTM row::" + i, put_pe_bid);     
          
          //otm rows
          const put_pe_bid1 = parseFloat(await page.locator(`(//*[@id='oc_atm_row']//td[11])/following::tr[${i}]//td[28]`).textContent() ?? "0") || null;
          //console.log("final_put_pe_bid1 of ITM row::" + i, put_pe_bid1);  

          // Get the put_pe_offer from the previous row
          const put_pe_offer = parseFloat(await page.locator(`(//*[@id='oc_atm_row']//td[11])/preceding::tr[${i}]//td[27]`).textContent() ?? "0") || null;
          //console.log("put_pe_offer of OTM row::" + i, put_pe_offer);

          //otm rows
          const put_pe_offer1 = parseFloat(await page.locator(`(//*[@id='oc_atm_row']//td[11])/following::tr[${i}]//td[27]`).textContent() ?? "0") || null;
          //console.log("put_pe_offer1 of ITM row::" + i, put_pe_offer1);             

          // Only consider valid values for average calculation (both bid and offer must be non-null)
          if (put_pe_bid !== null && put_pe_offer !== null && put_pe_bid1 !== null && put_pe_offer1 !== null) {
              totalBid_PE += put_pe_bid + put_pe_bid1 ;
              totalOffer_PE += put_pe_offer + put_pe_offer1 ;
              count_PE++;
          }

          //console.log(`\n`);  // Just for better readability
      }
      console.log('totalBid_PE without atm::'+totalBid_PE);
      console.log('totalOffer_PE without atm::'+totalOffer_PE);

      totalBid_PE = totalBid_PE + (put_pe_bid_atm ?? 0);
      console.log('totalBid_PE with atm::'+totalBid_PE);

      totalOffer_PE = totalOffer_PE + (put_pe_offer_atm ?? 0);
      console.log('totalOffer_PE with atm::'+totalOffer_PE);
      // Calculate and log the average price of the bid and offer over the 5 rows
      if (count > 0) {
          
          // const averageBidPrice_PE = (totalBid_PE )/ ((count*2)+1);
          // const averageOfferPrice_PE = totalOffer_PE / ((count*2)+1);
          averageBidPrice_PE = (totalBid_PE )/ ((count*2)+1);
          averageOfferPrice_PE = totalOffer_PE / ((count*2)+1);

          console.log(`\nAverage Call CE Bid Price: ${averageBidPrice_CE}`);
          console.log(`Average Call CE Offer Price: ${averageOfferPrice_CE}`);


          console.log(`Average PUT PE Bid Price: ${averageBidPrice_PE}`);
          console.log(`Average PUT PE Offer Price: ${averageOfferPrice_PE}\n`);

                    // Calculate the differences and round to 2 decimal places
        difference_of_ce_pe_bid = parseFloat(((averageBidPrice_CE ?? 0) - (averageBidPrice_PE ?? 0)).toFixed(2));
        difference_of_ce_pe_offer = parseFloat(((averageOfferPrice_CE ?? 0) - (averageOfferPrice_PE ?? 0)).toFixed(2));
        //console.log('The difference of ce pe bid is', difference_of_ce_pe_bid);
        //console.log('The difference of ce pe bid is', difference_of_ce_pe_offer);


      } else {
          console.log('Unable to calculate averages due to invalid data.');
      }

    const todaysTrend = getTrend(averageBidPrice_CE ?? 0, averageBidPrice_PE ?? 0, averageOfferPrice_CE ?? 0, averageOfferPrice_PE ?? 0);  

    // Get the current timestamp in IST
const options = { timeZone: 'Asia/Kolkata', hour12: false };
const istTimestamp = new Date().toLocaleString('en-IN', options);

// Create the log data
const logData = `[${istTimestamp}] TODAYS TREND multiple strikes::${checkForStrikes}::For Expiry -${expiry}::diff avg ce pe bid is::${difference_of_ce_pe_bid}::diff of avg offer price is::${difference_of_ce_pe_offer}:: ${todaysTrend}\n`;

// Write to a log file (log.txt) in the project directory
fs.appendFileSync('log_5strikes.txt', logData);

console.log(logData); // Also log it to the console



    function getTrend(averageBidPrice_CE, averageBidPrice_PE, averageOfferPrice_CE, averageOfferPrice_PE) {
      if((averageBidPrice_CE - averageBidPrice_PE) <= POSITIVE_TOLERANCE_THRESHOLD && (averageBidPrice_CE-averageBidPrice_PE) >= NEGATIVE_TOLERANCE_THRESHOLD && (averageOfferPrice_CE - averageOfferPrice_PE) <= POSITIVE_TOLERANCE_THRESHOLD && (averageOfferPrice_CE - averageOfferPrice_PE) >= NEGATIVE_TOLERANCE_THRESHOLD){
        return "Sideways based upon bid spread tolerance"
      } else if (averageBidPrice_CE > averageBidPrice_PE && averageOfferPrice_CE > averageOfferPrice_PE) {
        return "Up";
      } else if (averageBidPrice_CE < averageBidPrice_PE && averageOfferPrice_CE < averageOfferPrice_PE) {
        return "Down";
      } else {
        return "Sideways based upon bid and offer prices gaps";
      }
    }
    // function getTrend(averageBidPrice_CE, averageBidPrice_PE, averageOfferPrice_CE, averageOfferPrice_PE) {
    //   if (averageBidPrice_CE > averageBidPrice_PE && averageOfferPrice_CE > averageOfferPrice_PE) {
    //     return "Up";
    //   } else if (averageBidPrice_CE < averageBidPrice_PE && averageOfferPrice_CE < averageOfferPrice_PE) {
    //     return "Down";
    //   } else {
    //     return "Sideways";
    //   }
    // }
     

    // Close the browser after the test
    await browser.close();

    // Wait for 15 seconds before the next run
    console.log("Waiting for 15 second  before the next run..."); 
    await new Promise(resolve => setTimeout(resolve, 15 * 1000));
  }
});
