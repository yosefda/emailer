'use strict';

const email = require('../../src/email');
const chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const { expect } = require('chai');
const nock = require('nock');

const sender = require('../../src/service/sender');

describe('Test sender', () => {
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

    it('returns error on invalid email', () => {
        return expect(sender.send()).to.eventually.rejectedWith('Missing email');
    });

    it('it sends using primary provider and success', () => {
        nock('https://sendgrid')
            .post('/api')
            .reply(200);

        return expect(sender.send(emailInfo)).to.be.fulfilled;
    });

    it('it sends using primary and receieve require user attention error', () => {
        nock('https://sendgrid')
            .post('/api')
            .reply(400);

        return expect(sender.send(emailInfo)).to.be.rejected;
    });

    it('it sends using secondary and success', () => {
        nock('https://sendgrid')
            .post('/api')
            .reply(500);

        nock('https://mailgun')
            .post('/api')
            .reply(200);

        return expect(sender.send(emailInfo)).to.be.fulfilled;
    });

    it('it sends using secondary and receieve require user attention error', () => {
        nock('https://sendgrid')
            .post('/api')
            .reply(500);

        nock('https://mailgun')
            .post('/api')
            .reply(400);

        return expect(sender.send(emailInfo)).to.be.rejected;
    });
});
