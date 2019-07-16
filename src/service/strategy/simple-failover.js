'use strict';

const _ = require('lodash');
const logger = require('../../logger');

/**
 * Simple failover strategy
 *
 * This is very simple failover strategy. It attempts to send email using primary provider,
 * if it fails (5XX) then switch to backup. If backup fails too (5XX or 4XX) then return error
 * to user.
 *
 * Notes: For this stragey, we treat 4XX as something wrong with the payload.
 * Even though some provider use this range to report rate limitation error.
 **/

module.exports = {
    /**
     * Creates `simple failover` strategy.
     * @param {Object} Primary email service provider
     * @param {Object} Backup email service provider
     * @return {Object} Strategy instancea
     * @throws {Error}
     */
    create: (primary, backup) => {
        if (_.isEmpty(primary) || _.isEmpty(backup)) {
            throw new Error('Missing primary and/or backup provider(s)');
        }

        /**
         * Returns response object to the user on success.
         *
         * @param {Object} resp Response from provider
         * @return {Object}
         */
        const handleSuccessResponse = resp => {
            // Generalise that 2XX always a success from provider.
            if (resp.status >= 200 && resp.status <= 299) {
                return {
                    status: resp.status,
                    message: 'Email sent sucessfully',
                    upstream_response: {
                        status: resp.status,
                        data: resp.data,
                    },
                };
            }

            return {};
        };

        /**
         * Check if there's error that requires user attention.
         *
         * @param {Object} resp
         * @return {Boolean}
         */
        const handleUserError = err => {
            // Other errors.
            if (_.isEmpty(err.response)) {
                return;
            }

            if (err.response.status >= 400 && err.response.status <= 499) {
                const error = new Error('Error in the payload. Please review response from provider');
                (error.status = err.response.status),
                    (error.upstream_response = {
                        status: err.response.status,
                        data: err.response.data,
                    });

                return error;
            }

            return;
        };

        const strategy = {
            /**
             * Sends the given email.
             * @param {Object} email
             * @throws {Error}
             */
            send: email => {
                if (_.isEmpty(email)) {
                    return Promise.reject(new Error('Missing email'));
                }

                logger.info('Send using primary provider ' + primary.getName());
                return primary
                    .send(email)
                    .then(resp => {
                        // Handle success for primary.
                        const successResp = handleSuccessResponse(resp);
                        if (!_.isEmpty(successResp)) {
                            logger.info('Email sent successfully');
                            return successResp;
                        }
                    })
                    .catch(err => {
                        // Handle require user attention error for primary.
                        const userError = handleUserError(err);
                        if (!_.isEmpty(userError)) {
                            logger.info(
                                'Provider returns ' +
                                    err.response.status +
                                    ', details: ' +
                                    JSON.stringify(err.response.data)
                            );

                            throw userError;
                        }

                        // For other errors we try backup provider.
                        logger.info('Failed to send using primary, reason: ' + err.message);
                        logger.info('Send using backup provider ' + backup.getName());
                        return backup
                            .send(email)
                            .then(resp => {
                                // Handle success for backup.
                                const successResp = handleSuccessResponse(resp);
                                if (!_.isEmpty(successResp)) {
                                    logger.info('Email sent successfully');
                                    return successResp;
                                }
                            })
                            .catch(err => {
                                // Handle require user attention error for backup.
                                const userError = handleUserError(err);
                                if (!_.isEmpty(userError)) {
                                    logger.info(
                                        'Provider returns ' +
                                            err.response.status +
                                            ', details: ' +
                                            JSON.stringify(err.response.data)
                                    );

                                    throw userError;
                                }

                                // For other error we simply stops and return the error to user
                                logger.info('Failed to send using backup, reason: ' + err.message);
                                const error = new Error('Failed to send email. Please review response from provider');

                                let status = 500;
                                if (!_.isEmpty(err.response) && err.response.status !== undefined) {
                                    status = err.response.status;
                                }

                                let upstreamData = err.message;
                                if (!_.isEmpty(err.response) && err.response.data !== undefined) {
                                    err.response.data;
                                }

                                (error.status = status),
                                    (error.upstream_response = {
                                        status: status,
                                        data: upstreamData,
                                    });

                                throw error;
                            });
                    });
            },
        };

        return strategy;
    },
};
