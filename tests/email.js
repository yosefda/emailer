'use strict';

const { expect } = require('chai');
const email = require('../src/email');

describe('Test create email object', () => {
    it('throws error when missing From', () => {
        expect(() => email.create({})).to.throw('Missing From');
        expect(() => email.create({ from: '' })).to.throw('Missing From');
    });

    it('throws error when missing To', () => {
        expect(() => email.create({ from: 'bob@example.com' })).to.throw('Missing To');
        expect(() => email.create({ from: 'bob@example.com', to: '' })).to.throw('Missing To');
    });

    it('throws error when From contains invalid email', () => {
        expect(() => email.create({ from: 'bob@example', to: 'sam@example.com' })).to.throw(
            'Invalid email bob@example'
        );
    });

    it('throws error when To contains invalid email', () => {
        expect(() => email.create({ from: 'bob@example.com', to: 'sam@example.com, jane@example' })).to.throw(
            'Invalid email jane@example'
        );
        expect(() => email.create({ from: 'bob@example.com', to: 'sam@example.com, jane@example, ' })).to.throw(
            'Invalid email '
        );
    });

    it('throws error when CC contains invalid email', () => {
        expect(() =>
            email.create({
                from: 'bob@example.com',
                to: 'sam@example.com, jane@example.com',
                cc: 'joe@example',
            })
        ).to.throw('Invalid email joe@example');
    });

    it('throws error when BCC contains invalid email', () => {
        expect(() =>
            email.create({
                from: 'bob@example.com',
                to: 'sam@example.com, jane@example.com',
                cc: 'joe@example.com',
                bcc: 'smith@example',
            })
        ).to.throw('Invalid email smith@example');
    });

    it('throws error when Subject is not string type', () => {
        expect(() =>
            email.create({
                from: 'bob@example.com',
                to: 'sam@example.com, jane@example.com',
                cc: 'joe@example.com',
                bcc: 'smith@example.com',
                subject: {},
            })
        ).to.throw('Email Subject must be a string');
    });

    it('throws error when Body is not string type', () => {
        expect(() =>
            email.create({
                from: 'bob@example.com',
                to: 'sam@example.com, jane@example.com',
                cc: 'joe@example.com',
                bcc: 'smith@example.com',
                subject: 'Test email',
                body: [],
            })
        ).to.throw('Email Body must be a string');
    });

    it('returns email', () => {
        const emailInfo = email.create({
            from: 'bob@example.com',
            to: 'sam@example.com, jane@example.com',
            cc: 'joe@example.com',
            bcc: 'smith@example.com',
            subject: 'Test email',
            body: 'Hi there guys!',
        });

        expect(emailInfo.getFrom()).to.equal('bob@example.com');
        expect(emailInfo.getTo()).to.deep.equal(['sam@example.com', 'jane@example.com']);
        expect(emailInfo.getCc()).to.deep.equal(['joe@example.com']);
        expect(emailInfo.getBcc()).to.deep.equal(['smith@example.com']);
        expect(emailInfo.getSubject()).to.equal('Test email');
        expect(emailInfo.getBody()).to.equal('Hi there guys!');
    });

    it('returns email', () => {
        const emailInfo = email.create({
            from: 'bob@example.com',
            to: 'sam@example.com, jane@example.com',
            cc: 'joe@example.com',
            bcc: 'smith@example.com',
        });

        expect(emailInfo.getFrom()).to.equal('bob@example.com');
        expect(emailInfo.getTo()).to.deep.equal(['sam@example.com', 'jane@example.com']);
        expect(emailInfo.getCc()).to.deep.equal(['joe@example.com']);
        expect(emailInfo.getBcc()).to.deep.equal(['smith@example.com']);
        expect(emailInfo.getSubject()).to.equal('');
        expect(emailInfo.getBody()).to.equal('');
    });
});
