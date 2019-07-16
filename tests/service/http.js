'use strict';

const http = require('../../src/service/http');
const { expect } = require('chai');

describe('Test mailgun service', () => {
    it('creates HTTP client', () => {
        const client = http.create();
        expect(client.defaults.timeout).to.equal(process.env.HTTP_CLIENT_DEFAULT_TIMEOUT);
    });
});
