'use strict';

const { expect } = require('chai');
const email = require('../../src/email');
const sendgrid = require('../../src/provider/sendgrid');

describe('Test SendGrid service', () => {
    let apiKey;
    let httpClient;

    before(() => {
        apiKey = process.env.SENDGRID_API_KEY;
        process.env.SENDGRID_API_KEY = 'some-api-key';

        httpClient = {
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
    });

    after(() => {
        process.env.SENDGRID_API_KEY = apiKey;
    });

    it('throws error when create() without http client', () => {
        expect(() => sendgrid.create()).to.throw('Missing httpClient');
    });

    it('throws error when given send() without email', () => {
        const sendgridProvider = sendgrid.create(httpClient);

        expect(() => sendgridProvider.send({})).to.throw('Missing email');
    });

    it('return provider name', () => {
        const sendgridProvider = sendgrid.create(httpClient);
        expect(sendgridProvider.getName()).to.equal('SendGrid');
    });

    it('returns valid request to SendGrid', () => {
        const emailInfo = email.create({
            from: 'bob@example.com',
            to: 'sam@example.com, jane@example.com',
            cc: 'joe@example.com',
            bcc: 'smith@example.com',
            subject: 'Test email',
            body: 'Hi there guys!',
        });

        const httpClient = {
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

        const expectedPayload = {
            personalizations: [
                {
                    to: [
                        {
                            email: 'sam@example.com',
                            name: 'sam@example.com',
                        },
                        {
                            email: 'jane@example.com',
                            name: 'jane@example.com',
                        },
                    ],
                    subject: 'Test email',
                },
            ],
            from: {
                email: 'bob@example.com',
                name: 'bob@example.com',
            },
            reply_to: {
                email: 'bob@example.com',
                name: 'bob@example.com',
            },
            content: [
                {
                    type: 'text/plain',
                    value: 'Hi there guys!',
                },
            ],
        };

        const sendgridProvider = sendgrid.create(httpClient);
        const req = sendgridProvider.send(emailInfo);

        expect(req.url).to.equal(process.env.SENDGRID_SEND_ENDPOINT);
        expect(req.payload).to.deep.equal(expectedPayload);
        expect(req.options).to.deep.equal({ headers: { Authorization: 'Bearer some-api-key' } });
    });
});
