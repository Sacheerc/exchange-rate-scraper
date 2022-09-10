const { db } = require('../firebase');
const fetch = require('node-fetch');

const express = require('express');
const router = express.Router();
const xRatesURL = 'https://www.x-rates.com/table/?from=LKR&amount=1';

/**
 * GET get exchange rates from db.
 *
 * @return exchange rate list | empty.
 */
router.get('/exchange-rates-firestore', async (req, res) => {
  try {
    const ratesRef = db.collection('exchange-rates');
    const docs = await ratesRef.get();
    let ratesList = [];

    docs.forEach((doc) => ratesList.push(doc.data()));

    res.json({
      status: 200,
      message: ratesList,
    });
  } catch (error) {
    return res.status(500).send('Server error');
  }
});

/**
 * GET save exchange rates.
 *
 * @return exchange rate list | empty.
 */
router.get('/store-rates', async (req, res) => {
  try {
    const rateList = await fetchData();

    if (rateList && rateList.length > 0) {
      const ratesRef = db.collection('exchange-rates');

      //Store fetched rates in fireStore
      await rateList.forEach((rate) => {
        ratesRef.doc(rate.currency).set(rate);
      });
    }
    res.json({ status: 200, message: rateList });
  } catch (error) {
    return res.status(500).send('Server error');
  }
});

/**
 * GET test fetch rates.
 *
 * @return exchange rate list | empty.
 */
router.get('/test-fetch-rates', async (req, res) => {
  try {
    const rateList = await fetchData();
    res.json({ status: 200, message: rateList });
  } catch (error) {
    return res.status(500).send('Server error');
  }
});

/**
 * Fetch exchange rates from XRates Site
 *
 * @returns exchangeRateList
 */
async function fetchData() {
  //Fetching exchangeRates from xRates site
  const response = await fetch(xRatesURL);
  const text = await response.text();

  let ratesList = [
    {
      currency: 'LKR',
      fromLkr: 1,
      toLkr: 1,
      lastUpdated: new Date().toISOString(),
    },
  ];

  //Reg-expresions for extracting rates from raw test
  let expUSD = /(from=LKR&amp;to=USD.*<\/a>|from=USD&amp;to=LKR.*<\/a>)/g;
  let expAUD = /(from=LKR&amp;to=AUD.*<\/a>|from=AUD&amp;to=LKR.*<\/a>)/g;
  let expEUR = /(from=LKR&amp;to=EUR.*<\/a>|from=EUR&amp;to=LKR.*<\/a>)/g;
  let expGBP = /(from=LKR&amp;to=GBP.*<\/a>|from=GBP&amp;to=LKR.*<\/a>)/g;

  //Extracting rates from scraped results
  let usdRates = extractCurrency('USD', expUSD, text);
  let audRates = extractCurrency('AUD', expAUD, text);
  let eurRates = extractCurrency('EUR', expEUR, text);
  let gbpRates = extractCurrency('GBP', expGBP, text);

  //Adding fetched rates to rates array
  ratesList.push(usdRates);
  ratesList.push(audRates);
  ratesList.push(eurRates);
  ratesList.push(gbpRates);

  return ratesList;
}

/**
 * Extract exchage rates from given raw text
 *
 * @param {*} currency - currency type
 * @param {*} currencyRegex - regex to extract given currency
 * @param {*} text - scraped raw text
 * @returns exchange rate object
 */
function extractCurrency(currency, currencyRegex, text) {
  let scraped = text.match(currencyRegex);
  let regexFloat = /[+-]?\d+(\.\d+)?/g;
  let obj = {
    currency: currency,
    fromLkr: parseFloat(scraped[0].match(regexFloat)[0]),
    toLkr: parseFloat(scraped[1].match(regexFloat)[0]),
    lastUpdated: new Date().toISOString(),
  };
  return obj;
}

module.exports = router;
