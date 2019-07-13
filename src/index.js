'use strict';

const express = require('express');
const api = express();
const bodyParser = require('body-parser');
const logger = require('./logger');

const listenPort = parseInt(process.env.LISTEN_PORT) || 9999;

// To parse POST payload.
api.use(bodyParser.json());

// This API only has 1 endpoint to send email.
api.post('/v1/send', (req, res) => {
    console.log('/v1/send');
    res.send();
});

// Starts API.
api.listen(listenPort, () => {
    logger.info('API running on port: ' + String(listenPort));
});
