const lnd = require('lnd-async');
const LND_HOST = process.env.LND_HOST;

module.exports = {
  connect,
};

async function connect() {
  return await lnd.connect({
    lndHost: LND_HOST,
    certPath: process.cwd() + '/tls.cert',
    macaroonPath: process.cwd() + '/invoice.macaroon',
  });
}
