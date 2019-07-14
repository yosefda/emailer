'use strict';

const { expect } = require('chai');
const email = require('../../src/email');
const sendgrid = require('../../src/service/sendgrid');

describe('Test SendGrid service', () => {
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
            post: (url, payload) => {
                this.url = url;
                this.payload = payload;

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
    });
});
