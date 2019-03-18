const httpClient = require('../data/http-client');
const memoize = require('mem');

const BLOCKTAP_URI = process.env.BLOCKTAP_URI || 'https://api.blocktap.io/graphql';

module.exports = {
  getPrices: memoize(getPrices, { maxAge: 1000 }), // only load pricing every 1 second
};

/**
 * Gets pricing data from Blocktap. This is
 * used to convert the invoice into USD.
 */
async function getPrices() {
  let query = `
    query price {
      BtcUsd:markets(marketSymbol:"*:BTC/USD" aggregation:VWA) {
        ...market
      }
      LtcUsd:markets(marketSymbol:"*:LTC/USD" aggregation:VWA){
        ...market
      }
    }

    fragment market on Market {
      ticker{
        lastPrice
      }
    }`;
  let body = JSON.stringify({ query });
  let result = await httpClient.request({
    uri: BLOCKTAP_URI,
    method: 'POST',
    body,
    headers: {
      'content-type': 'application/json',
      'content-length': Buffer.byteLength(body),
    },
  });
  return {
    BtcUsd: result.data.BtcUsd[0].ticker.lastPrice,
    LtcUsd: result.data.LtcUsd[0].ticker.lastPrice,
  };
}
