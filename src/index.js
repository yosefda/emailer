'use strict';

const express = require('express');
const api = express();
const bodyParser = require('body-parser');
const logger = require('./logger');
const sender = require('./service/sender');
const email = require('./email');

const listenPort = parseInt(process.env.LISTEN_PORT) || 9999;

// To parse POST payload.
api.use(bodyParser.json());

// This API only has 1 endpoint to send email.
api.post('/v1/send', (req, res) => {
    let payload;
    let respBody;

    // Parse payload error.
    try {
        payload = email.create(req.body);
    } catch (err) {
        respBody = {
            error: {
                message: 'Failed to parse email payload',
                details: {
                    reason: err.message,
                },
            },
        };

        res.status(400);
        res.json(respBody);
        return;
    }

    sender
        .send(payload)
        .then(resp => {
            // Success sending to provider.
            respBody = {
                success: {
                    message: resp.message,
                    details: resp.upstream_response,
                },
            };
            res.status(resp.status);
            res.json(respBody);
            return;
        })
        .catch(err => {
            // Failed sending to provider.
            respBody = {
                error: {
                    message: err.message,
                    details: err.upstream_response,
                },
            };

            res.status(err.status);
            res.json(respBody);
            return;
        });
});

// Starts API.
api.listen(listenPort, () => {
    logger.info('API running on port: ' + String(listenPort));
});
