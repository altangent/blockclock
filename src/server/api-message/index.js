const express = require('express');
const app = express();
const messageService = require('../domain/message-service');

app.get('/api/message', (req, res, next) => getLines(req, res).catch(next));

module.exports = app;

async function getLines(req, res) {
  let lines = await messageService.getLines();
  res.send({
    lines,
  });
}
