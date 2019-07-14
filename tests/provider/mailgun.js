'use strict';

const { expect } = require('chai');
const email = require('../../src/email');
const mailgun = require('../../src/provider/mailgun');

describe('Test mailgun service', () => {
    let apiKey;

    before(() => {
        apiKey = process.env.MAILGUN_API_KEY;
        process.env.MAILGUN_API_KEY = 'some-api-key';
    });

    after(() => {
        process.env.MAILGUN_API_KEY = apiKey;
    });

    it('throws error when given invalid email param', () => {
        const client = {
            post: () => {},
        };

        const mailgunProvider = mailgun.create();

        expect(() => mailgunProvider.createRequest({}, client)).to.throw('Invalid email parameter');
    });

    it('throws error when given invalid httpClient param', () => {
        const email = {
            getFrom: () => {},
        };

        const mailgunProvider = mailgun.create();

        expect(() => mailgunProvider.createRequest(email, {})).to.throw('Invalid httpClient parameter');
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

        const expectedPayload =
            'from=bob%40example.com&to=sam%40example.com%2Cjane%40example.com&subject=Test%20email&text=Hi%20there%20guys!';

        const mailgunProvider = mailgun.create();

        const req = mailgunProvider.createRequest(emailInfo, httpClient);
        expect(req.url).to.equal(process.env.MAILGUN_SEND_ENDPOINT);
        expect(req.payload).to.deep.equal(expectedPayload);
        expect(req.options).to.deep.equal({ auth: { username: 'api', password: 'some-api-key' } });
    });
});
