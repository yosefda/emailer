'use strict';

const _ = require('lodash');

const http = require('../service/http');
const sendgrid = require('../provider/sendgrid');
const mailgun = require('../provider/mailgun');
const simpleFailoverStrategy = require('../service/strategy/simple-failover');

const strategy = simpleFailoverStrategy.create(sendgrid.create(http.create()), mailgun.create(http.create()));

/**
 * Send email using the specified strategy.
 * @param {Object} email
 * @return {Promise}
 * @throws {Error}
 */
module.exports.send = email => {
    return strategy.send(email);
};
