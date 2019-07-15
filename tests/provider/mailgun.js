'use strict';

const { expect } = require('chai');
const email = require('../../src/email');
const mailgun = require('../../src/provider/mailgun');

describe('Test mailgun service', () => {
    let apiKey;
    let httpClient;

    before(() => {
        apiKey = process.env.MAILGUN_API_KEY;
        process.env.MAILGUN_API_KEY = 'some-api-key';

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
        process.env.MAILGUN_API_KEY = apiKey;
    });

    it('throws error when create() without http client', () => {
        expect(() => mailgun.create()).to.throw('Invalid httpClient parameter');
    });

    it('throws error when given send() without email', () => {
        const mailgunProvider = mailgun.create(httpClient);

        expect(() => mailgunProvider.send({})).to.throw('Invalid email parameter');
    });

    it('returns valid request to MailGun', () => {
        const emailInfo = email.create({
            from: 'bob@example.com',
            to: 'sam@example.com, jane@example.com',
            cc: 'joe@example.com',
            bcc: 'smith@example.com',
            subject: 'Test email',
            body: 'Hi there guys!',
        });

        const expectedPayload =
            'from=bob%40example.com&to=sam%40example.com%2Cjane%40example.com&subject=Test%20email&text=Hi%20there%20guys!';

        const mailgunProvider = mailgun.create(httpClient);

        const req = mailgunProvider.send(emailInfo);
        expect(req.url).to.equal(process.env.MAILGUN_SEND_ENDPOINT);
        expect(req.payload).to.deep.equal(expectedPayload);
        expect(req.options).to.deep.equal({ auth: { username: 'api', password: 'some-api-key' } });
    });
});
