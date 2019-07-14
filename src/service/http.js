'use strict';

const axios = require('axios');

const DEFAULT_TIMEOUT = 3000;

/**
 * Wrapper to create HTTP client.
 * @return {Object} HTTP client
 */
module.exports.createClient = () => {
    const client = axios.create();
    client.defaults.timeout = DEFAULT_TIMEOUT;

    return client;
};
