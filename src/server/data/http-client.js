const http = require('http');
const https = require('https');
const url = require('url');

module.exports = {
  request,
};

/**
 * Makes an HTTP or HTTPS request depending on the URI.
 * Response will parsed to JSON if possible, otherwise will return a string.
 * Body and headers can be provided to customize POST/PUT requests.
 * Rejects on non 200 responses or request or response errors.
 * @param {string} param.uri full url that will be parsed and used for the request
 * @param {string} param.method HTTP method, default to GET
 * @param {string} param.body request body that will be written
 * @param {string} param.headers
 * @returns {string|object} parsed object if JSON parsabled, otherwise returns a string
 */
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
