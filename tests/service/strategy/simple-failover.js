'use strict';

const email = require('../../../src/email');
const chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const { expect } = require('chai');
const http = require('../../../src/service/http');
const mailgunProvider = require('../../../src/provider/mailgun');
const nock = require('nock');
const sendgridProvider = require('../../../src/provider/sendgrid');
const simpleFailover = require('../../../src/service/strategy/simple-failover');

describe('Test simple failover strategy', () => {
    let sendgridKey;
    let sendgridEndpoint;
    let mailgunKey;
    let mailgunEndpoint;

    const emailInfo = email.create({
        from: 'bob@example.com',
        to: 'sam@example.com, jane@example.com',
        cc: 'joe@example.com',
        bcc: 'smith@example.com',
        subject: 'Test email',
        body: 'Hi there guys!',
    });

    before(() => {
        sendgridKey = process.env.SENDGRID_API_KEY;
        process.env.SENDGRID_API_KEY = 'sendgrid-key';
        sendgridEndpoint = process.env.SENDGRID_SEND_ENDPOINT;
        process.env.SENDGRID_SEND_ENDPOINT = 'https://sendgrid/api';

        mailgunKey = process.env.MAILGUN_API_KEY;
        process.env.MAILGUN_API_KEY = 'mailgun-key';
        mailgunEndpoint = process.env.MAILGUN_SEND_ENDPOINT;
        process.env.MAILGUN_SEND_ENDPOINT = 'https://mailgun/api';
    });

    after(() => {
        process.env.SENDGRID_API_KEY = sendgridKey;
        process.env.SENDGRID_SEND_ENDPOINT = sendgridEndpoint;

        process.env.MAILGUN_API_KEY = mailgunKey;
        process.env.MAILGUN_SEND_ENDPOINT = mailgunEndpoint;
    });

    afterEach(() => {
        nock.cleanAll();
    });

    it('throws error when primary and/or secondary provider(s) not provided', () => {
        expect(() => simpleFailover.create()).to.throw('Missing primary and/or backup provider(s)');
    });

    it('throws error when send() missing email', () => {
        const sendgrid = sendgridProvider.create(http.create());
        const mailgun = mailgunProvider.create(http.create());

        const strategy = simpleFailover.create(sendgrid, mailgun);
        return expect(strategy.send()).to.be.rejectedWith('Missing email');
    });

    it('successfully send email using primary', () => {
        const sendgrid = sendgridProvider.create(http.create());
        const mailgun = mailgunProvider.create(http.create());

        const strategy = simpleFailover.create(sendgrid, mailgun);

        nock('https://sendgrid')
            .post('/api')
            .reply(200);

        return expect(strategy.send(emailInfo)).to.eventually.deep.equal({
            status: 200,
            message: 'Email sent sucessfully',
            upstream_response: {
                status: 200,
                data: '',
            },
        });
    });

    it('returns error requires user attention from primary', () => {
        const sendgrid = sendgridProvider.create(http.create());
        const mailgun = mailgunProvider.create(http.create());

        const strategy = simpleFailover.create(sendgrid, mailgun);

        nock('https://sendgrid')
            .post('/api')
            .reply(400, {
                errors: [
                    {
                        message: 'The to array...',
                        field: 'personalizations.0.to',
                        help: 'http://sendgrid.com...',
                    },
                ],
            });

        return expect(strategy.send(emailInfo)).to.be.rejectedWith(
            'Error in the payload. Please review response from provider'
        );
    });

    it('goes to backup when primary returns non 4XX response', () => {
        const sendgrid = sendgridProvider.create(http.create());
        const mailgun = mailgunProvider.create(http.create());

        const strategy = simpleFailover.create(sendgrid, mailgun);

        nock('https://sendgrid')
            .post('/api')
            .reply(500);

        nock('https://mailgun')
            .post('/api')
            .reply(200, {
                id: '<20190...',
                message: 'Queued...',
            });

        return expect(strategy.send(emailInfo)).to.eventually.deep.equal({
            status: 200,
            message: 'Email sent sucessfully',
            upstream_response: {
                status: 200,
                data: {
                    id: '<20190...',
                    message: 'Queued...',
                },
            },
        });
    });

    it('goes to backup when primary experiencing network error', () => {
        const sendgrid = sendgridProvider.create(http.create());
        const mailgun = mailgunProvider.create(http.create());

        const strategy = simpleFailover.create(sendgrid, mailgun);

        nock('https://sendgrid')
            .post('/api')
            .replyWithError('Network error');

        nock('https://mailgun')
            .post('/api')
            .reply(200, {
                id: '<20190...',
                message: 'Queued...',
            });

        return expect(strategy.send(emailInfo)).to.eventually.deep.equal({
            status: 200,
            message: 'Email sent sucessfully',
            upstream_response: {
                status: 200,
                data: {
                    id: '<20190...',
                    message: 'Queued...',
                },
            },
        });
    });

    it('goes to backup but it retuns require user attention error', () => {
        const sendgrid = sendgridProvider.create(http.create());
        const mailgun = mailgunProvider.create(http.create());

        const strategy = simpleFailover.create(sendgrid, mailgun);

        nock('https://sendgrid')
            .post('/api')
            .replyWithError('Network error');

        nock('https://mailgun')
            .post('/api')
            .reply(400, {
                message: "'to' parameter is missing",
            });

        return expect(strategy.send(emailInfo)).to.be.rejectedWith(
            'Error in the payload. Please review response from provider'
        );
    });

    it('goes to backup but it retuns non 4XX', () => {
        const sendgrid = sendgridProvider.create(http.create());
        const mailgun = mailgunProvider.create(http.create());

        const strategy = simpleFailover.create(sendgrid, mailgun);

        nock('https://sendgrid')
            .post('/api')
            .replyWithError('Network error');

        nock('https://mailgun')
            .post('/api')
            .reply(500);

        return expect(strategy.send(emailInfo)).to.be.rejectedWith(
            'Failed to send email. Please review response from provider'
        );
    });

    it('goes to backup but it is also expriencing network error', () => {
        const sendgrid = sendgridProvider.create(http.create());
        const mailgun = mailgunProvider.create(http.create());

        const strategy = simpleFailover.create(sendgrid, mailgun);

        nock('https://sendgrid')
            .post('/api')
            .replyWithError('Network error');

        nock('https://mailgun')
            .post('/api')
            .replyWithError('Network error');

        return expect(strategy.send(emailInfo)).to.be.rejectedWith(
            'Failed to send email. Please review response from provider'
        );
    });
});
