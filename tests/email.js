'use strict';

const { expect } = require('chai');
const email = require('../src/email');

describe('Test email', () => {
    it('creates email', () => {
        const emailObj = email.createEmail({ to: 'u@u.com' });
    });
});
