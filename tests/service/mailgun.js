'use strict';

const { expect } = require('chai');
const email = require('../../src/email');
const mailgun = require('../../src/service/mailgun');

describe('Test mailgun service', () => {
    it('throws error when given invalid email param', () => {
        const client = {
            post: () => {},
        };

        expect(() => mailgun.createRequest({}, client)).to.throw('Invalid email parameter');
    });

    it('throws error when given invalid httpClient param', () => {
        const email = {
            getFrom: () => {},
        };
        expect(() => mailgun.createRequest(email, {})).to.throw('Invalid httpClient parameter');
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

        const expectedPayload =
            'from=bob%40example.com&to=sam%40example.com%2Cjane%40example.com&subject=Test%20email&text=Hi%20there%20guys!';

        const req = mailgun.createRequest(emailInfo, httpClient);
        expect(req.url).to.equal(process.env.MAILGUN_SEND_ENDPOINT);
        expect(req.payload).to.deep.equal(expectedPayload);
    });
});
