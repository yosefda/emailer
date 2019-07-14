'use strict';

const { expect } = require('chai');
const email = require('../../src/email');
const sendgrid = require('../../src/service/sendgrid');

describe('Test SendGrid service', () => {
    let apiKey;

    before(() => {
        apiKey = process.env.SENDGRID_API_KEY;
        process.env.SENDGRID_API_KEY = 'some-api-key';
    });

    after(() => {
        process.env.SENDGRID_API_KEY = apiKey;
    });

    it('throws error when given invalid email param', () => {
        const client = {
            post: () => {},
        };
        expect(() => sendgrid.createRequest({}, client)).to.throw('Invalid email parameter');
    });

    it('throws error when given invalid httpClient param', () => {
        const email = {
            getFrom: () => {},
        };
        expect(() => sendgrid.createRequest(email, {})).to.throw('Invalid httpClient parameter');
    });

    it('returns valid request to SendGrid', () => {
        const emailInfo = email.createEmail({
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

        const req = sendgrid.createRequest(emailInfo, httpClient);

        expect(req.url).to.equal(process.env.SENDGRID_SEND_ENDPOINT);
        expect(req.payload).to.deep.equal(expectedPayload);
        expect(req.options).to.deep.equal({ headers: { Authorization: 'Bearer some-api-key' } });
    });
});
