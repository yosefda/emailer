'use strict';

const _ = require('lodash');

const SEND_ENDPOINT =
    process.env.MAILGUN_SEND_ENDPOINT ||
    'https://api.mailgun.net/v3/sandbox967dadd36b2e45e2a119f086046556b3.mailgun.org/messages';
const API_USER = process.env.MAILGUN_API_USER || 'api';

module.exports = {
    /**
     * Create MailGun provider instance.
     * @param {Object} HTTP client used to send request
     * @return {Object}
     */
    create: httpClient => {
        if (_.isEmpty(httpClient)) {
            throw new Error('Missing httpClient');
        }

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

        const mailgun = {
            /**
             * Send request to MailGun.
             * @param {Object} email Email object
             * @return {Promise} Request to MailGun
             * @throws {Error}
             */
            send: email => {
                if (_.isEmpty(email)) {
                    throw new Error('Missing email');
                }

                const payload = createPayload(email);
                const options = {
                    auth: {
                        username: API_USER,
                        password: process.env.MAILGUN_API_KEY,
                    },
                };
                return httpClient.post(SEND_ENDPOINT, payload, options);
            },
        };

        return mailgun;
    },
};
