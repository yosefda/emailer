'use strict';

const axios = require('axios');

/**
 * Wrapper to create HTTP client.
 * @return {Object} HTTP client
 */
module.exports.create = () => {
    const client = axios.create();
    client.defaults.timeout = process.env.HTTP_CLIENT_DEFAULT_TIMEOUT;

    return client;
};
