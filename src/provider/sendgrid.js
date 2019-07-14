'use strict';

const _ = require('lodash');

const SEND_ENDPOINT = process.env.SENDGRID_SEND_ENDPOINT || 'https://api.sendgrid.com/v3/mail/send';

/**
 * Create request to SendGrid.
 * @param {Object} email Email object
 * @param {Object} httpClient Any Http client that supports promise
 * @return {Promise} Request to SendGrid
 * @throws {Error}
 */
module.exports.createRequest = (email, httpClient) => {
    if (_.isEmpty(email)) {
        throw new Error('Invalid email parameter');
    }

    if (_.isEmpty(httpClient)) {
        throw new Error('Invalid httpClient parameter');
    }

    const payload = createPayload(email);
    const options = {
        headers: {
            Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        },
    };

    return httpClient.post(SEND_ENDPOINT, payload, options);
};

/**
 * Create payload.
 * @param {Object} Email object
 * @return {Object} Payload object
 * @todo Add CC and BCC
 */
const createPayload = email => {
    const payload = {};

    const to = _.map(email.getTo(), address => {
        return {
            email: address,
            name: address,
        };
    });

    payload.personalizations = [
        {
            to: to,
            subject: email.getSubject(),
        },
    ];

    payload.from = {
        email: email.getFrom(),
        name: email.getFrom(),
    };

    payload.reply_to = {
        email: email.getFrom(),
        name: email.getFrom(),
    };

    payload.content = [
        {
            type: 'text/plain',
            value: email.getBody(),
        },
    ];

    return payload;
};
