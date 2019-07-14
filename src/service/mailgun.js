'use strict';

const _ = require('lodash');

const SEND_ENDPOINT =
    process.env.MAILGUN_SEND_ENDPOINT ||
    'https://api.mailgun.net/v3/sandbox967dadd36b2e45e2a119f086046556b3.mailgun.org/messages';

/**
 * Create request to MailGun.
 * @param {Object} email Email object
 * @param {Object} httpClient Any Http client that supports promise
 * @return {Promise} Request to MailGun
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

    return httpClient.post(SEND_ENDPOINT, payload);
};

/**
 * Create payload.
 * @param {Object} Email object
 * @return {String} Payload string
 * @todo Add CC and BCC
 */
const createPayload = email => {
    const payload = [];

    payload.push('from=' + encodeURIComponent(email.getFrom()));
    payload.push('to=' + encodeURIComponent(email.getTo()));
    payload.push('subject=' + encodeURIComponent(email.getSubject()));
    payload.push('text=' + encodeURIComponent(email.getBody()));

    return _.join(payload, '&');
};
