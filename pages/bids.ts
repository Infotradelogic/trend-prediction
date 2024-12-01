import { test, expect, chromium, Browser, Page } from '@playwright/test';
import { log } from 'console';
const fs = require('fs');
let browser:Browser;
let page:Page;


export async function checkBids(page:Page) {
    while (true) {  
      try {
        // Launch the browser in non-headless mode
        //const browser = await chromium.launch();
        //browser = await chromium.launch();
  
        let difference_of_ce_pe_bid = 0;
        let difference_of_ce_pe_offer = 0;
        const POSITIVE_TOLERANCE_THRESHOLD = 10; 
        const NEGATIVE_TOLERANCE_THRESHOLD = -10; 
        
        //CE
        // Extract bid and offer prices for the At-the-Money (ATM) Call and Put options
        const call_ce_bid = parseFloat(await page.locator("//*[@id='oc_atm_row']//td[11]").textContent() ?? "0") || null;
        console.log("call OI Details...........................");
        console.log("call_ce_bid:::", call_ce_bid);
        //
        const call_ce_offer = parseFloat(await page.locator("//*[@id='oc_atm_row']//td[12]").textContent() ?? "0") || null;
        console.log("call_ce_offer:::", call_ce_offer);
        const callVolume = parseFloat(await page.locator("//*[@id='oc_atm_row']//td[7]").textContent() ?? "0") || null;
        console.log("call Volume:::", callVolume);
        const callOIChange = parseFloat(await page.locator("//*[@id='oc_atm_row']//td[8]").textContent() ?? "0") || null;
        console.log("callOIChange:::", callOIChange);
        const callOIChangePercentage = parseFloat(await page.locator("//*[@id='oc_atm_row']//td[9]").textContent() ?? "0") || null;
        console.log("callOIChangePercentage:::", callOIChangePercentage);
        const callOILakh = parseFloat(await page.locator("//*[@id='oc_atm_row']//td[10]").textContent() ?? "0") || null;
        console.log("callOILakh:::", callOILakh);
        
        //PE
        //
        console.log("\nPUT OI Details...........................");
        const put_pe_bid = parseFloat(await page.locator("//*[@id='oc_atm_row']//td[28]").textContent() ?? "0") || null;
        console.log("final_put_pe_bid:::", put_pe_bid);
        //
        const put_pe_offer = parseFloat(await page.locator("//*[@id='oc_atm_row']//td[27]").textContent() ?? "0") || null;
        console.log("put_pe_offer:::", put_pe_offer);
        const putVolume = parseFloat(await page.locator("//*[@id='oc_atm_row']//td[32]").textContent() ?? "0") || null;
        console.log("put Volume:::", putVolume);
        const putOIChange = parseFloat(await page.locator("//*[@id='oc_atm_row']//td[31]").textContent() ?? "0") || null;
        console.log("putOIChange:::", putOIChange);
        const putOIChangePercentage = parseFloat(await page.locator("//*[@id='oc_atm_row']//td[30]").textContent() ?? "0") || null;
        console.log("putOIChangePercentage:::", putOIChangePercentage);
        const putOILakh = parseFloat(await page.locator("//*[@id='oc_atm_row']//td[29]").textContent() ?? "0") || null;
        console.log("putOILakh:::", putOILakh);
        
        //ATM
        const ATM_strike = parseFloat(await page.locator("//*[@id='oc_atm_row']//td[19]").textContent() ?? "0") || null;
        console.log("\nATM_strike:::", ATM_strike);
        //ATM IV
        const LOW_IV_THRESHOLD = 15; // Define the low IV threshold (e.g., below 15)
        const HIGH_IV_THRESHOLD = 21; // Define the high IV threshold (e.g., above 25)
        const ATM_IV_strike = parseFloat(await page.locator("//*[@id='oc_atm_row']//td[20]").textContent() ?? "0") || null;
        console.log(`ATM_IV_strike::: ${ATM_IV_strike} (${
        ATM_IV_strike ?? 0 < LOW_IV_THRESHOLD
            ? "Low IV: Option Buying is preferable (expecting volatility to rise)."
            : ATM_IV_strike ?? 0 > HIGH_IV_THRESHOLD
            ? "High IV: Option Selling is preferable (expecting volatility to remain stable or decrease)."
            : "Moderate IV: Either strategy might work, assess other factors."
        })`);

        //
        console.log("\nCall and PUT Total OI, OI Change, Volume Differences.......................");
        //
        const THRESHOLD_volume = 5;
        const THRESHOLD_OIChange = 5;
        const THRESHOLD_Total_OI = 5;
        //
        let Volume_CE_PE_Diff =parseFloat(((callVolume ?? 0) - (putVolume ?? 0)).toFixed(2));
        //console.log(`Volume_CE_PE_Diff:: ${Volume_CE_PE_Diff} (${Volume_CE_PE_Diff > 0 ? "CE side volume is higher : may be bullish move" : "PE side volume is higher:: may be bearish move"})`);
        console.log(`Volume_CE_PE_Diff::${Volume_CE_PE_Diff} (${
        Math.abs(Volume_CE_PE_Diff) < THRESHOLD_volume
          ? "Difference within threshold: sideways"
          : Volume_CE_PE_Diff > 0
          ? "CE side volume is higher: may be bullish move"
          : "PE side volume is higher: may be bearish move"
      })`);
        //
        let OIChange_CE_PE_Diff =parseFloat(((callOIChange ?? 0) - (putOIChange ?? 0)).toFixed(2));
        //console.log(`OIChange_CE_PE_Diff:: ${OIChange_CE_PE_Diff} (${OIChange_CE_PE_Diff > 0 ? "CE side OI Change is higher : may be bearish move" : "PE side OI change is higher: may be bullish move"})`);
        console.log(`OIChange_CE_PE_Diff:: ${OIChange_CE_PE_Diff} (${
        Math.abs(OIChange_CE_PE_Diff) < THRESHOLD_OIChange
          ? "Difference within threshold: sideways"
          : OIChange_CE_PE_Diff > 0
          ? "CE side OI Change is higher: may be bearish move"
          : "PE side OI change is higher: may be bullish move"
      })`);
        //
        let OI_CE_PE_Diff =parseFloat(((callOILakh ?? 0) - (putOILakh ?? 0)).toFixed(2));
        //console.log(`OI_CE_PE_Diff:: ${OI_CE_PE_Diff} (${OI_CE_PE_Diff > 0 ? "CE side total OI is higher : may be bearish move" : "PE side total OI is higher: may be bullish move"})`);
        console.log(`OI_CE_PE_Diff:: ${OI_CE_PE_Diff} (${
        Math.abs(OI_CE_PE_Diff) < THRESHOLD_Total_OI
          ? "Difference within threshold: sideways"
          : OI_CE_PE_Diff > 0
          ? "CE side total OI is higher: may be bearish move"
          : "PE side total OI is higher: may be bullish move"
      })`);

        
        // Calculate the differences and round to 2 decimal places
        difference_of_ce_pe_bid = parseFloat(((call_ce_bid ?? 0) - (put_pe_bid ?? 0)).toFixed(2));
        console.log('\nThe difference of ce pe bid is', difference_of_ce_pe_bid);
        //
        difference_of_ce_pe_offer = parseFloat(((call_ce_offer ?? 0) - (put_pe_offer ?? 0)).toFixed(2));
        console.log('The difference of ce pe offer is', difference_of_ce_pe_offer);
        // Determine today's trend using the extracted bid and offer prices
        const todaysTrend = getTrend(call_ce_bid ?? 0, put_pe_bid ?? 0, call_ce_offer ?? 0, put_pe_offer ?? 0);
        // Define options for IST timestamp formatting
        const options = { timeZone: 'Asia/Kolkata', hour12: false };
        const istTimestamp = new Date().toLocaleString('en-IN', options);
  
        // Format the log data with timestamp and trend information
        // const logData = `\n[${istTimestamp}] TODAYS TREND::ATM Strike::${ATM_strike}::ce-pe bid diff::${difference_of_ce_pe_bid}::difference_of_ce_pe_offer::${difference_of_ce_pe_offer} :::${todaysTrend}\n`;

        // Prepare the log data
        const logData = `\n[${istTimestamp}] TODAYS TREND::ATM Strike::${ATM_strike}::ce-pe bid diff::${difference_of_ce_pe_bid}::difference_of_ce_pe_offer::${difference_of_ce_pe_offer} :::${todaysTrend}\n
        Volume_CE_PE_Diff:: ${Volume_CE_PE_Diff} (${
          Math.abs(Volume_CE_PE_Diff) < THRESHOLD_volume
            ? "Difference within threshold: sideways"
            : Volume_CE_PE_Diff > 0
            ? "CE side volume is higher: may be bullish move"
            : "PE side volume is higher: may be bearish move"
        })
        OIChange_CE_PE_Diff:: ${OIChange_CE_PE_Diff} (${
                Math.abs(OIChange_CE_PE_Diff) < THRESHOLD_OIChange
                  ? "Difference within threshold: sideways"
                  : OIChange_CE_PE_Diff > 0
                  ? "CE side OI Change is higher: may be bearish move"
                  : "PE side OI change is higher: may be bullish move"
              })
        OI_CE_PE_Diff:: ${OI_CE_PE_Diff} (${
        Math.abs(OI_CE_PE_Diff) < THRESHOLD_Total_OI
          ? "Difference within threshold: sideways"
          : OI_CE_PE_Diff > 0
          ? "CE side total OI is higher: may be bearish move"
          : "PE side total OI is higher: may be bullish move"
        })
        ATM_IV_strike::: ${ATM_IV_strike} (${
        ATM_IV_strike ?? 0 < LOW_IV_THRESHOLD
            ? "Low IV: Option Buying is preferable (expecting volatility to rise)."
            : ATM_IV_strike ?? 0 > HIGH_IV_THRESHOLD
            ? "High IV: Option Selling is preferable (expecting volatility to remain stable or decrease)."
            : "Moderate IV: Either strategy might work, assess other factors."
        })
       \n`;

      
        // Append the log data to a log file (log_atm.txt) in the project directory
        fs.appendFileSync('log_atm.txt', logData);
  
        // Also log the trend information to the console
        console.log(logData);
  
        // Function to determine trend based on bid and offer prices for CE and PE
        function getTrend(call_ce_bid:any, put_pe_bid:any, call_ce_offer:any, put_pe_offer:any) {
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
        await new Promise(resolve => setTimeout(resolve, 60 * 1000));
  
      } catch (error) {
        console.error("An error occurred:", error);
  
        // If an error occurs, wait a bit longer before retrying
        console.log("Waiting for 30 seconds before the next retry...");
        await new Promise(resolve => setTimeout(resolve, 30 * 1000));
      }
    }
  }

export async function getMaxpain(page:Page) {
    while (true) {  
      try {
   
    
        const atmStrike = parseFloat(await page.locator("#intraday-chart-rolling_atm_straddle > div.sc-jwbTYE.iWceAG > div.sc-jhlpgp.dwJIde > div.sc-bxISGZ.dbDVOs > div:nth-child(4) > div.sc-gNobms.lkaJva > div").textContent() ?? "0") || null;
        const maxpain = parseFloat(await page.locator("#intraday-chart-max_pain > div.sc-jwbTYE.iWceAG > div.sc-jhlpgp.dwJIde > div.sc-bMzxzo.bGEbvA > span:nth-child(2)").textContent() ?? "0") || null;

        // Determine today's trend using the extracted bid and offer prices
        // Define options for IST timestamp formatting
        const options = { timeZone: 'Asia/Kolkata', hour12: false };
        const istTimestamp = new Date().toLocaleString('en-IN', options);
  
        // Format the log data with timestamp and trend information
        const logData = `[${istTimestamp}] maxpain:: ${maxpain} atmStrike::${atmStrike}\n`;


      
        // Append the log data to a log file (log_atm.txt) in the project directory
        fs.appendFileSync('log_atm_maxpain.txt', logData);
  
        // Also log the trend information to the console
        console.log(logData);
  

  
        // Close the browser after the current run
        //await browser.close();
  
        // Wait for 15 seconds before the next run of the loop
        console.log("Waiting for 5 seconds before the next run...");
        await new Promise(resolve => setTimeout(resolve, 15 * 60 * 1000));
  
      } catch (error) {
        console.error("An error occurred:", error);
  
        // If an error occurs, wait a bit longer before retrying
        console.log("Waiting for 30 seconds before the next retry...");
        await new Promise(resolve => setTimeout(resolve, 30 * 1000));
      }
    }
  }