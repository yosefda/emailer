'use strict';

const _ = require('lodash');

/**
 * Simple failover strategy
 *
 * This sending strategy requires 2 providers: primary and backup.
 * How it works:
 * - send via primary provider
 * - switch to backup when primary is broken
 * - keep using backup for a while ???
 * - then try switch back to primary ???
 *      - if primary is back then switch to primary
 *      - if still broken then keep using backup, add failure count
 * - if backup down:
 *      - try primary, if still broken then mark both all down, notify sysadmin
 *
 */

module.exports = {
    /**
     * Creates `simple failover` strategy.
     * @param {Object} Primary email service provider
     * @param {Object} Backup email service provider
     * @return {Object} Strategy instance
     * @throws {Error}
     */
    create: (primary, backup) => {
        if (_.isEmpty(primary) || _.isEmpty(backup)) {
            throw new Error('Missing primary and/or backup provider(s)');
        }

        const strategy = {
            /**
             * Sends the given email.
             * @param {Object} email
             * @throws {Error}
             */
            send: email => {
                if (_.isEmpty(email)) {
                    throw new Error('Missing email');
                }
            },
        };

        return strategy;
    },
};
