# tirreno NodeJS tracker library

A lightweight JavaScript library for sending tracking events to a sensor API.

Supports:
- standalone usage via `Tracker`
- automatic request tracking via **Express** and **Koa** middleware

The library uses an explicit event builder and sends events via `tracker.track(event)`.

---

## Installation

```bash
npm install @tirreno/tirreno-tracker
```

---

## Usage

## 1. Standalone usage (without middleware)

Use this mode when you want to manually control when and how events are sent.

```js
import Tracker from '@tirreno/tirreno-tracker';

const tirrenoUrl = 'https://example.tld';
const trackingId = 'XXX';

const tracker = new Tracker(
    tirrenoUrl,
    trackingId,
);

// somewhere in your request / service handler
const event = tracker.createEvent();

event
    .setUserName('johndoe42')
    .setIpAddress('1.1.1.1')
    .setUrl('/login')
    .setUserAgent('Mozilla/5.0 (X11; Linux x86_64)')
    .setBrowserLanguage('fr-FR,fr;q=0.9')
    .setHttpMethod('POST')
    .setEventTypeAccountLogin();

await tracker.track(event);
```

This is the **base API** used internally by all middleware.

---

## 2. Express middleware

The Express middleware:

- creates an `Event` for every request
- attaches it to `req.tracker`
- **automatically sends the event after the response is finished**
- lets you modify event fields inside route handlers

Don't call `tracker.track()` manually when using middleware.

```js
import express from 'express';
import trackerMiddleware from '@tirreno/tirreno-tracker/express';

const app = express();

const tirrenoUrl = 'https://example.tld';
const trackingId = 'XXX';

app.use(
    trackerMiddleware({
        url: tirrenoUrl,
        key: trackingId,
    }),
);

app.get('/', (req, res) => {
    req.tracker
        .setUrl('/new_url')
        .setUserName('John');

    res.send('Hello World!');
});

// Event will be sent automatically when response finish
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
```

---

## 3. Koa middleware

The Koa middleware behaves exactly like the Express one:

- creates an `Event` for every request
- attaches it to `ctx.state.tracker`
- **automatically sends the event after the response is finished**
- lets you modify event fields inside handlers

Don't call `tracker.track()` manually.

```js
import Koa from 'koa';
import trackerMiddleware from '@tirreno/tirreno-tracker/koa';

const app = new Koa();

const tirrenoUrl = 'https://example.tld';
const trackingId = 'XXX';

app.use(
    trackerMiddleware({
        url: tirrenoUrl,
        key: trackingId,
    }),
);

app.use(async (ctx) => {
    ctx.state.tracker
        .setUrl('/new_url')
        .setUserName('John');

    ctx.body = 'Hello Koa!';
});

// Event will be sent automatically when response finish
app.listen(3001, () => {
    console.log('Server running on http://localhost:3001');
});
```

---

## Debug logging

Tracker supports optional debug logging via Node.js `NODE_DEBUG`.

To enable debug output to the console, run your application with:

```bash
NODE_DEBUG=tracker node app.js
```

This is useful for local development and troubleshooting.

---

## Configuration

### Tracker options

| Option      | Type     | Required | Description                         |
|-------------|----------|----------|-------------------------------------|
| `url`       | `string` | yes      | Base API URL                        |
| `key`       | `string` | yes      | API key for authorization           |
| `timeoutMs` | `number` | no       | Event timeout in milliseconds       |

---

## API Reference

### `new Tracker(url, key)`

Creates a new tracker instance.

#### Parameters

- `url` (`string`) — API endpoint URL
- `key` (`string`) — API key

---

### `tracker.createEvent()`

Creates a new event builder instance.

Returns: `Event`

---

### `tracker.track(event)`

Sends the event to the sensor API.

Returns: `Promise<void>`

---

## Event fields

Event fields are set via explicit setters:

```js
event
    .setUserName('johndoe42')
    .setIpAddress('1.1.1.1')
    .setUrl('/login')
    .setUserAgent('Mozilla/5.0 (X11; Linux x86_64)')
    .setBrowserLanguage('fr-FR,fr;q=0.9')
    .setHttpMethod('POST')
    .setEventTypeAccountLogin();
    .setHttpReferer('https://example.com');
```

### Supported fields

See also: [API Parameters](https://docs.tirreno.com/api-integration.html#parameters)


| Field             | Required | Description |
|------------------|----------|-------------|
| `userName`        | yes      | User identifier |
| `ipAddress`       | yes      | IP address |
| `url`             | yes      | Requested URL |
| `eventTime`       | yes      | UTC event timestamp (set automatically) |
| `emailAddress`    | no       | User email |
| `userAgent`       | no       | User-Agent string |
| `browserLanguage` | no       | Browser language |
| `httpMethod`      | no       | HTTP method |
| `httpReferer`     | no       | Referer header |
| `pageTitle`       | no       | Page title |
| `fullName`        | no       | Full name |
| `firstName`       | no       | First name |
| `lastName`        | no       | Last name |
| `phoneNumber`     | no       | Phone number |
| `eventType`       | no       | Event type |
| `httpCode`        | no       | Response HTTP code |
| `payload`         | no       | Custom payload object for `page_search` or `account_email_change` event types |
| `fieldHistory`    | no       | Field history array for `field_edit` event type |

---

## License

Released under the [BSD License](https://opensource.org/license/bsd-3-clause). tirreno is a
registered trademark of tirreno technologies sàrl, Switzerland.
