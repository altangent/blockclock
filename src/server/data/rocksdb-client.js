const winston = require('winston');
const path = require('path');
const levelup = require('levelup');
const rocksdb = require('rocksdb');

let dbPath = path.join(process.cwd(), '.db');
winston.info('db ' + dbPath);

const db = levelup(rocksdb(dbPath));

module.exports = db;
