# emailer

API service to send emails.

### Setup and installation

1. Clone the repo `git clone git@github.com:yosefda/emailer.git`
2. Copy content `.env.example` into `.env`. Copy paste API keys into `MAILGUN_API_KEY=` and `SENDGRID_API_KEY=`
3. Run `docker-compose -f docker-compose-develop.yml up --build --force-recreate`.
4. The API should be accessible from `0.0.0.0:9999/v1/send`
5. Sample request

```
curl -X POST \
  http://0.0.0.0:9999/v1/send \
  -H 'Content-Type: application/json' \
  -H 'cache-control: no-cache' \
  -d '{
  "from": "bob@example.com",
  "to": "mac@gmail.com",
  "cc": "joe@example.com",
  "bcc": "smith@example.com",
  "subject": "Test email",
  "body": "Hi there guys!"
}'
```

### How it works

This API uses SendGrid - https://sendgrid.com and MailGun - https://www.mailgun.com, the email service providers to send the email.

It implements **_"simple failover"_** sending strategy to send out the email. How this strategy works:

-   There are 2 providers: **_primary (SendGrid)_** and **_backup (MailGun)_**
-   Send email with **primary provider**
    -   When primary provider returns success, then email is sent and return success to user
    -   When primary provider returns error that requires user to check ie. missing to field, etc, then return that error to the user
    -   When primary provider returns other error that doesn't require to check ie. failed connection, then failover to backup provider
-   Send email with **backup provider**
    -   When backup provider provider return success, then email is sent and return success to user
    -   When backup provider return error that requires user to check ie. missing to field, etc, then return that error to the user
    -   When backup provider return other error that doesn't require to check ie. failed connection, we also return that error to the user

### Benefits

-   More provider can be added - https://github.com/yosefda/emailer/tree/master/src/provider
-   Different strategy can be added - https://github.com/yosefda/emailer/tree/master/src/service/strategy
-   To implement different strategy - https://github.com/yosefda/emailer/blob/master/src/service/sender.js#L10,L8

### Limitations and further improvements

-   Only support plain-text email body
-   No support for sending attachment
-   Payload accepts `cc` and `bcc`, but not yet send to the provider. Need to dig more into documentations on how to send them in the request
-   MailGun free access can only send to a list of "authorised recipients" only. So will need to add email address to the list first
-   It is assume that the user of this API to manage the resending of failed emails. This version of API only acts as "proxy" to the email providers
