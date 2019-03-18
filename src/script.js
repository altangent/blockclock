const http = require('http');
const https = require('https');
const qs = require('querystring');
const url = require('url');

const [SERVER_URL, BLOCKCLOCK_URL] = process.argv.slice(2);

if (!SERVER_URL || !BLOCKCLOCK_URL) {
  console.log('Usage: node daemon.js <server_url> <blockclock_url>');
  process.exit(1);
}

// fire off the run loop
run().catch(console.error);

/**
 * Run in a perpetual loop with a wait timeout
 * instead of using cascading calls to setTimeout
 * which will result in an ever growing call stack
 * that will eventually crash.
 *
 * We also don't use setInterval since we cannot
 * reliably determine how long the requests may
 * take and do not want to stack up requests.
 */
async function run() {
  let lastMsg = '';
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      let messages = await getMessages();
      let newMsg = messages.lines.join(',');
      if (lastMsg !== newMsg) {
        console.log(`${new Date().toISOString()}: new message ${newMsg}`);
        await pushMessage(messages);
        lastMsg = newMsg;
      }
    } catch (ex) {
      console.error(ex);
    } finally {
      await wait(5000);
    }
  }
}

/**
 * Gets the latest message from blockclock.live
 */
async function getMessages() {
  return await request({ uri: SERVER_URL, method: 'GET' });
}

/**
 * Pushes message to the blockclock
 */
async function pushMessage(message) {
  let body = qs.stringify({
    a: message.lines[0],
    b: message.lines[1],
    c: message.lines[2],
  });
  let headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(body),
  };
  return await request({ uri: BLOCKCLOCK_URL, method: 'POST', body, headers });
}

///////////////////////////////////////

function wait(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

async function request({ uri, method = 'GET', body, headers, timeout = 5000 }) {
  return new Promise((resolve, reject) => {
    let { protocol, hostname, path, port, auth } = url.parse(uri);
    let client = protocol === 'https:' ? https : http;
    let req = client.request({ hostname, port, path, method, auth, headers, timeout }, res => {
      let buffers = [];
      res.on('data', d => buffers.push(d));
      res.on('error', reject);
      res.on('end', () => {
        let strResult = Buffer.concat(buffers);
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(strResult.toString()));
          } catch (ex) {
            resolve(strResult.toString());
          }
        } else {
          reject(strResult.toString());
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => {
      console.warn('request timed out');
      req.abort();
    });
    if (body) req.write(body);
    req.end();
  });
}
