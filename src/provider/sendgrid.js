'use strict';

const _ = require('lodash');
const axios = require('axios');

const NAME = 'SendGrid';

module.exports = {
    /**
     * Create SendGrid provider instance.
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

        const sendgrid = {
            /**
             * Create request to SendGrid.
             * @param {Object} email Email object
             * @return {Promise} Request to SendGrid
             * @throws {Error}
             */
            send: email => {
                if (_.isEmpty(email)) {
                    throw new Error('Missing email');
                }

                const payload = createPayload(email);
                const options = {
                    baseURL: process.env.SENDGRID_BASEURL,
                    headers: {
                        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
                    },
                };

                return httpClient.post(process.env.SENDGRID_SEND_ENDPOINT, payload, options);
            },

            /**
             * Get provider name.
             * @return {String}
             */
            getName: () => {
                return NAME;
            },
        };

        return sendgrid;
    },
};
