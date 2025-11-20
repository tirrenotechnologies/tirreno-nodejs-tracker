# tirreno NodeJS tracker library

A lightweight JavaScript library for sending tracking events to tirreno console API.  
Supports multiple operation modes and includes an **Express middleware** for seamless server integration.

---

## Installation

```bash
npm install tirreno-tracker
```

---

## Usage

### 1. Basic Example

```js
import Tracker from 'tirreno-tracker';

const options = {
  populated: false, // Include only required fields
};

const tirrenoUrl = "https://example.tld";
const trackingId = "XXX";

const tracker = new Tracker(
  tirrenoUrl,
  trackingId,
  options,
);

// somewhere in your request handler
await tracker.sendEvent({
  ipAddress: '1.1.1.1',
  url: '/',
  userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
  browserLanguage: 'en-US;q=0.8,en;q=0.7',
  httpMethod: 'GET',
});
```

---

### 2. Express Middleware

Middleware tracks all requests and automatically collects all possible data and
provides interface for changing event payload fields, using provided `tracker`
interface in the `req` object

```js
import express from 'express';
import trackerMiddleware from 'tirreno-tracker/express';

const app = express();

const tirrenoUrl = "https://example.tld";
const trackingId = "XXX";

app.use(
  trackerMiddleware({
    tirrenoUrl,
    trackingId,
  }),
);

app.get('/', (req, res) => {
  // if you want to change field value, for example the URL
  req.tracker.url = '/new_url';
  res.send('Hello World!');
});
```

---

## Configuration

| Option               | Type       | Default      | Description                                    |
| -------------------- | ---------- | ------------ | ---------------------------------------------- |
| `url`                | `string`   | **required** | Base API URL                                   |
| `key`                | `string`   | **required** | API key for authorization                      |
| `settings.populated` | `boolean`  | `true`       | Whether to include additional request metadata |
| `settings.fields`    | `string[]` | `[]`         | Custom fields to send                          |
| `settings.mapper`    | `object`   | `auto`       | Custom mapping configuration                   |

---

Mapping settings structure:

```js
const settings = {
  mapper: {
    from: 'session.user', // Path to get data from `req.session.user` object of 'express-session' package
    fields: {
      userName: 'username', // The key 'userName' using in the request body and get value from 'req.session.user.username'
      emailAddress: 'info.email', // 'req.session.user.info.email'
    },
  },
};
```

### EventData

Tracker event data object

Type: `object`  
See also: [API Parameters](https://docs.tirreno.com/api-integration.html#parameters)

| Property          | Type            | Required | Description                                                                        |
| ----------------- | --------------- | -------- | ---------------------------------------------------------------------------------- |
| `userName`        | `string`        | yes      | A user identifier                                                                  |
| `ipAddress`       | `string`        | yes      | An IP address associated with an event                                             |
| `url`             | `string`        | yes      | A URL path of a resource requested                                                 |
| `eventTime`       | `string`        | yes      | A timestamp of an event                                                            |
| `emailAddress`    | `string`        | no       | An email address associated with a user                                            |
| `userAgent`       | `string`        | no       | A user agent string value                                                          |
| `browserLanguage` | `string`        | no       | A detected language of the browser                                                 |
| `httpMethod`      | `string`        | no       | The type of HTTP request: GET, POST, etc.                                          |
| `httpReferer`     | `string`        | no       | A value of the Referer HTTP header field                                           |
| `pageTitle`       | `string`        | no       | A title of a visited resource                                                      |
| `fullName`        | `string`        | no       | A user’s whole name                                                                |
| `firstName`       | `string`        | no       | A user’s first name                                                                |
| `lastName`        | `string`        | no       | A user’s last name                                                                 |
| `phoneNumber`     | `string`        | no       | A user’s phone number                                                              |
| `eventType`       | `string`        | no       | Event type ([reference](https://docs.tirreno.com/api-integration.html#event-type)) |
| `httpCode`        | `string`        | no       | An HTTP response status code the request ended with                                |
| `payload`         | `array<object>` | no       | An array of payloads                                                               |

## License

Released under the [BSD License](https://opensource.org/license/bsd-3-clause). tirreno is a
registered trademark of tirreno technologies sàrl, Switzerland.
