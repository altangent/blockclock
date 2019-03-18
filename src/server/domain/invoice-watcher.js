const winston = require('winston');
const lnd = require('../data/lnd-client');
const invoiceService = require('./invoice-service');

const LND_HOST = process.env.LND_HOST;

module.exports = {
  start,
};

/**
 * Connect to LND and start listening for invoice settlements.
 *
 * This assumes that gRPC is smart enough to reconnect in the event of LND
 * network disconnects. This is probably not a safe assumption.
 *
 * A hard failure during start will prevent this from occuring and the
 * current workaround is to restart the service.
 */
async function start() {
  winston.info('listening to invoices on ' + LND_HOST);
  let client = await lnd.connect();
  let res = client.subscribeInvoices({});
  res.on('data', invoice => invoiceUpdate(invoice));
  res.on('error', winston.error);
}

///////////////////////////////////////

async function invoiceUpdate(invoice) {
  if (invoice.settled) {
    let { r_hash } = invoice;
    await invoiceService.processSettledInvoice(r_hash);
  }
}
