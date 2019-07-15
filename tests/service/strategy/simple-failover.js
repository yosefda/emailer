'use strict';

const { expect } = require('chai');
const simpleFailover = require('../../../src/service/strategy/simple-failover');
const sendgrid = require('../../../src/provider/sendgrid');
const mailgun = require('../../../src/provider/mailgun');

describe('Test simple failover strategy', () => {
    let primary;
    let backup;
    let sendgridApiKey;
    let mailgunApiKey;

    const getHttpClient = {
        url: '',
        payload: '',
        options: {},
        post: (url, payload, options) => {
            this.url = url;
            this.payload = payload;
            this.options = options;

            return this;
        },
    };

    before(() => {
        sendgridApiKey = process.env.SENDGRID_API_KEY;
        mailgunApiKey = process.env.MAILGUN_API_KEY;
        process.env.SENDGRID_API_KEY = 'some-api-key';
        process.env.MAILGUN_API_KEY = 'some-api-key';

        primary = sendgrid.create(getHttpClient);
        backup = mailgun.create(getHttpClient);
    });

    after(() => {
        process.env.SENDGRID_API_KEY = sendgridApiKey;
        process.env.MAILGUN_API_KEY = mailgunApiKey;
    });

    it('throws error when primary and/or secondary provider(s) not provided', () => {
        expect(() => simpleFailover.create()).to.throw('Missing primary and/or backup provider(s)');
    });

    it('throws error when send() missing email', () => {
        const strategy = simpleFailover.create(primary, backup);
        expect(() => strategy.send()).to.throw('Missing email');
    });
});
