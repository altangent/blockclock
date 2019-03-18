const winston = require('winston');
const lnd = require('../data/lnd-client');
const rocksdb = require('../data/rocksdb-client');
const messageService = require('./message-service');
const blocktapService = require('./blocktap-service');

module.exports = {
  requestLines,
  processSettledInvoice,
};

/**
 * Creates an invoice via LND and stores
 * the request in the database for later use
 * @param {[string]} param.lines
 */
async function requestLines({ lines }) {
  // connect to lnd
  let client = await lnd.connect();

  // create an invoice where we set the memo
  // to the requested lines of text
  let value = 1000;
  let { payment_request, r_hash } = await client.addInvoice({
    memo: 'blockclock: ' + lines.join(','),
    value,
  });

  // get price data for bitcoin and conver the
  // sats to USD
  let { BtcUsd } = await blocktapService.getPrices();
  let usdValue = parseFloat(((value / 10 ** 8) * BtcUsd).toFixed(8));

  // attach the message request to the rocksdb.
  // we could let LND keep this information as invoices
  // but we'll use this to manage state transition from request > complete
  // once an invoice has been settled
  let request = { date: Date.now(), payment_request, r_hash, lines, value, usdValue };
  await rocksdb.put(`request:${r_hash.toString('hex')}`, JSON.stringify(request));

  return { payment_request, value, usdValue };
}

/**
 * Processes a settled invoice by converting its state from request > complete.
 * @param {Buffer} r_hash
 */
async function processSettledInvoice(r_hash) {
  // make sure r_hash is a string
  if (Buffer.isBuffer(r_hash)) r_hash = r_hash.toString('hex');

  // Get the pending invoice and if it doesn't exist it's a noop.
  // this can can happen when another invoice on the LND node
  // is settled but was not related to blockclock.
  let value = await getPendingInvoice(r_hash);
  if (value) {
    // parse and update some stats on the request
    let data = JSON.parse(value);
    data.displayedOn = Date.now();
    data.settled = true;

    // update the service state to reflect the new message!
    await messageService.setLines(data.lines);
    winston.info('message now', data.lines);

    // first insert the request as a completed request
    await rocksdb.put(`complete:${r_hash}`, value);

    // then delete the original request key
    await rocksdb.del(`request:${r_hash}`);
  }
}

///////////////////////////////////////

/**
 * Safely attempts to get the requested key from the db
 * @param {string} r_hash
 */
async function getPendingInvoice(r_hash) {
  try {
    return await rocksdb.get(`request:${r_hash}`);
  } catch (ex) {
    if (ex.notFound) return;
    else throw ex;
  }
}
