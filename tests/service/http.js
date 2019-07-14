'use strict';

const axios = require('axios');
const axiosMockAdapter = require('axios-mock-adapter');
const mockAxios = new axiosMockAdapter(axios).axiosInstance;

const { expect } = require('chai');
const rewire = require('rewire');

describe('Test mailgun service', () => {
    let http;

    beforeEach(() => {
        http = rewire('../../src/service/http');
        http.__set__('axios', mockAxios);
    });

    it('creates HTTP client', () => {
        http.__set__('DEFAULT_TIMEOUT', 12345);
        const client = http.createClient();
        expect(client.defaults.timeout).to.equal(12345);
    });
});
