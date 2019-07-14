'use strict';

const _ = require('lodash');
const validator = require('email-validator');

module.exports = {
    /**
     * Create email object from the given JSON payload/data.
     * @param {Object} payload JSON string contains email
     * @return {Object} Email object
     */
    createEmail: payload => {
        const properties = {
            from: '',
            to: [],
            cc: [],
            bcc: [],
            subject: '',
            body: '',
        };

        /**
         * Parse email address.
         * @param {String} Email address
         * @return {String} Valid email address
         * @throws {Error} On invalid email address
         */
        const parseEmailAddress = address => {
            address = address.trim();
            if (!validator.validate(address)) {
                throw new Error(`Invalid email ${address}`);
            }

            return address;
        };

        /**
         * Parse email addresses.
         * @param {String} addresses String contains an email address
         *  e.g. `user@domain.com`,  or a list of email addresses
         *  e.g. `user@domain.com, user@example.com`
         * @throws {Error} On any invalid email address
         */
        const parseEmailAddresses = addresses => {
            const addressList = addresses.split(',');

            return _.map(addressList, address => parseEmailAddress(address));
        };

        /**
         * Parse payload/data of the email to send.
         * @param {Object} payload Payload of email to send
         * @throws {Error}
         */
        const parsePayload = payload => {
            // Email must have from.
            if (payload.from === undefined || payload.from === '') {
                throw new Error('Missing From');
            }

            // Email must have to.
            if (payload.to === undefined || payload.to === '') {
                throw new Error('Missing To');
            }

            properties.from = parseEmailAddress(payload.from);
            properties.to = parseEmailAddresses(payload.to);

            if (payload.cc !== undefined && payload.cc !== '') {
                properties.cc = parseEmailAddresses(payload.cc);
            }

            if (payload.bcc !== undefined && payload.bcc !== '') {
                properties.bcc = parseEmailAddresses(payload.bcc);
            }

            if (payload.subject !== undefined && typeof payload.subject !== 'string') {
                throw Error('Email Subject must be a string');
            }
            properties.subject = payload.subject || '';

            if (payload.body !== undefined && typeof payload.body !== 'string') {
                throw Error('Email Body must be a string');
            }
            properties.body = payload.body || '';
        };

        parsePayload(payload);

        const email = {
            /**
             * Return email address for From.
             * @return {String}
             * @throws {Error} On invalid email
             */
            getFrom: () => properties.from,

            /**
             * Return email addresses for To.
             * @return {Array}
             * @throws {Error} On any invalid email
             */
            getTo: () => properties.to,

            /**
             * Return email addresses for CC.
             * @return {Array}
             * @throws {Error} On any invalid email
             */
            getCc: () => properties.cc,

            /**
             * Return email addresses for BCC.
             * @return {Array}
             * @throws {Error} On any invalid email
             */
            getBcc: () => properties.bcc,

            /**
             * Return Subject.
             * @return {String}
             * @throws {Error} On invalid subject
             */
            getSubject: () => properties.subject,

            /**
             * Return Body.
             * @return {String}
             * @throws {Error} On invalid body
             */
            getBody: () => properties.body,
        };

        return email;
    },
};
