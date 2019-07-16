'use strict';

const _ = require('lodash');

const NAME = 'MailGun';

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
                    baseURL: process.env.MAILGUN_BASEURL,
                    auth: {
                        username: process.env.MAILGUN_API_USER,
                        password: process.env.MAILGUN_API_KEY,
                    },
                };
                return httpClient.post(process.env.MAILGUN_SEND_ENDPOINT, payload, options);
            },

            /**
             * Get provider name.
             * @return {String}
             */
            getName: () => {
                return NAME;
            },
        };

        return mailgun;
    },
};
