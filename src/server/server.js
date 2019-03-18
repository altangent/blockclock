const path = require('path');
const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const serveStatic = require('serve-static');
const winston = require('winston');

// configure winston before we load anything that can use it!
winston.configure({
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.splat(),
    winston.format.colorize(),
    winston.format.simple()
  ),
});

const invoiceWatcher = require('./domain/invoice-watcher');
const app = express();
const PORT = process.env.SERVICE_PORT || 8000;

// apply compression, static files, and add json post body parsing
app.use(compression());
app.use('/public', serveStatic(path.join(__dirname, '../../public')));
app.use('/public/app', serveStatic(path.join(__dirname, '../../dist/app')));
app.use('/public/css', serveStatic(path.join(__dirname, '../../dist/css')));
app.use(bodyParser.json());

// attach our api sub-apps here.
// we put individual apis into sub-apps so that we can
// separate code for each into their own module
app.use(require('./api-invoice'));
app.use(require('./api-message'));

// all other routes will return the home page
// this is a quick way to ensure react-router can do its thing
// without requiring us to put in each and every path.
// downside is we lose 404 messages for pages that aren't found
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../../public/index.html')));

// attach an error handler
// eslint-disable-next-line
app.use((err, req, res, next) => {
  winston.error(err);
  res.status(500).json(err);
});

app.listen(PORT, () => winston.info(`express listening on ${PORT}`));

// start the invoice watching process
// and kill our site if the invoice watcher goes down
// we assume that any reconnection logic necessary to maintain
// watching status should exist in invoiceWatcher
invoiceWatcher.start().catch(ex => {
  winston.error(ex.stack);
  process.exit(1);
});
