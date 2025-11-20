import assert from 'node:assert/strict';
import { describe, it, before, after } from 'node:test';

import Tracker from '../lib/tracker.js';

describe('main lib: new Tracker()', () => {
  const mock = console.debug;
  const logs = [];
  before(() => {
    console.debug = (...args) => logs.push(args.join(' '));
  });
  after(() => {
    console.debug = mock;
  });

  const wrap = (regexp) => {
    return ({ cause }) => {
      return regexp.test(cause);
    };
  };

  describe('constructor', () => {
    it('should throws error if missing required configs/args for new Trakcer()', async () => {
      assert.throws(
        () => new Tracker(),
        wrap(/"url" value is undefined, "key" value is undefined/),
      );
      assert.throws(
        () => new Tracker('localhost:3000'),
        wrap(/"key" value is undefined/),
      );
      assert.throws(
        () => new Tracker(undefined, 'api_key'),
        wrap(/"url" value is undefined, key\[string\] \*\*\*\*\*\*/),
      );
    });
    it('should throws error if url invalid', () => {
      assert.throws(
        () => new Tracker('localhost', 'api_key'),
        wrap(/TypeError: Invalid URL/),
      );
    });
    it('should use sensor path if it missing in the settings', () => {
      const baseUrl = 'https://www.example.com';
      const compareV1 = 'https://www.example.com/sensor/';
      const compareV2 = 'https://www.example.com/api/sensor/';

      const url = ([start, end], value) =>
        new Tracker(`${start}${value}${end}`, 'api_key').configurations.url
          .href;

      assert.strictEqual(url`${baseUrl}`, compareV1);
      assert.strictEqual(url`${baseUrl}/`, compareV1);
      assert.strictEqual(url`${baseUrl}/sensor`, compareV1);
      assert.strictEqual(url`${baseUrl}/sensor/`, compareV1);
      assert.strictEqual(url`${baseUrl}/api`, compareV2);
      assert.strictEqual(url`${baseUrl}/api/`, compareV2);
      assert.strictEqual(url`${baseUrl}/api/sensor`, compareV2);
      assert.strictEqual(url`${baseUrl}/api/sensor/`, compareV2);

      assert.strictEqual(url`${baseUrl}?q=1`, compareV1);
      assert.strictEqual(url`${baseUrl}#tag`, compareV1);
      assert.strictEqual(url`${baseUrl}?q=1#tag`, compareV1);

      assert.throws(
        () =>
          new Tracker('http://www.example.com/sensor/', 'api_key')
            .configurations.url.href,
        wrap(/URL missing https protocol/),
      );
    });
  });
});
