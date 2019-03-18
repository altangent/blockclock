const express = require('express');
const app = express();
const invoiceService = require('../domain/invoice-service');

app.post('/api/invoice', (req, res, next) => createInvoice(req, res, next).catch(next));

module.exports = app;

async function createInvoice(req, res) {
  let lines = req.body;

  if (lines.length > 4) return res.status(400).end();
  for (let line of lines) {
    if (line.length > 8) return res.status(400).end();
  }

  let result = await invoiceService.requestLines({ lines });
  res.send(result);
}
