const db = require('../data/rocksdb-client');

module.exports = {
  getLines,
  setLines,
};

/**
 * Gets the current state from the database
 */
async function getLines() {
  try {
    let value = await db.get('lines');
    return JSON.parse(value);
  } catch (ex) {
    if (ex.notFound) return ['', '', ''];
    else throw ex;
  }
}

/**
 * Sets the lines in the database
 * @param {[string]} lines
 */
async function setLines(lines) {
  await db.put('lines', JSON.stringify(lines));
}
