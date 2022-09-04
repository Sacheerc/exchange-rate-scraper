const { db } = require('../firebase');
const fetch = require('node-fetch');

const express = require('express');
const router = express.Router();

/**
 * GET save exchange rates.
 *
 * @return exchange rate list | empty.
 */
router.get('/exchange-rates', async (req, res) => {
  try {
    await fetchData();
    const cityRef = db.collection('exchange-rates').doc('qiGMwNJ65pqtxqzCbI6w');
    const doc = await cityRef.get();

    if (!doc.exists) {
      console.log('No such document!');
    } else {
      console.log('Document data:', doc.data());
    }

    res.json({
      status: 200,
      message: doc.data(),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Server error');
  }
});

async function fetchData() {
  const response = await fetch(
    'https://www.x-rates.com/table/?from=LKR&amount=1'
  );
  const text = await response.text();
  let currency = [{ currency: 'LKR', fromLkr: 1, toLkr: 1 }];
  let expUSD = /(from=LKR&amp;to=USD.*<\/a>|from=USD&amp;to=LKR.*<\/a>)/g;
  let expAUD = /(from=LKR&amp;to=AUD.*<\/a>|from=AUD&amp;to=LKR.*<\/a>)/g;
  let expEUR = /(from=LKR&amp;to=EUR.*<\/a>|from=EUR&amp;to=LKR.*<\/a>)/g;
  let expGBP = /(from=LKR&amp;to=GBP.*<\/a>|from=GBP&amp;to=LKR.*<\/a>)/g;

  extractCurrency('USD', expUSD, text);
}

function extractCurrency(currency, currencyRegex, text) {
  let scraped = text.match(currencyRegex);
  let regexFloat = /[+-]?\d+(\.\d+)?/g;
  let obj = {
    currency: currency,
    fromLkr: parseFloat(scraped[0].match(regexFloat)[0]),
    toLkr: parseFloat(scraped[1].match(regexFloat)[0]),
  };
  console.log(obj);
  return obj;
}

module.exports = router;
