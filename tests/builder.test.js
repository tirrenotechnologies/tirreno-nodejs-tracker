import assert from 'node:assert/strict';
import { describe, it, before, after } from 'node:test';

import TrackerEventBuilder from '../lib/builder.js';
import { timestamp } from '../lib/helpers/utils.js';

describe('main lib: TrackerEventBuilder', () => {
  it('draft', () => {
    const fields = {
      a: 'a.b.c',
    };
    const mapper = {
      from: 'session',
      fields,
    };
    const fn = TrackerEventBuilder.populateProvidedMappedFields(mapper);
    const value = fn({ session: { a: { b: { c: 'd' } } } });
  });
  describe('TrackerEventBuilder.create()', () => {
    it('should set builder event properties (only required)', () => {
      const builder = TrackerEventBuilder.create();
      const ts = timestamp();

      builder.userName = 'nickname';
      builder.ipAddress = '1.1.1.1';
      builder.url = 'https://example.io';
      builder.eventTime = ts;

      assert.deepEqual(builder.rawBody, {
        userName: 'nickname',
        ipAddress: '1.1.1.1',
        url: 'https://example.io',
        eventTime: ts,
      });
    });
    it('should auto fill userName event property if it nullish and ip was set', () => {
      const builder = TrackerEventBuilder.create();

      builder.ipAddress = '1.1.1.1';

      assert.deepEqual(builder.rawBody, {
        userName: '1.1.1.1',
        ipAddress: '1.1.1.1',
      });
      // check default value replacing of userName
      builder.userName = 'nickname';
      assert.deepEqual(builder.rawBody, {
        userName: 'nickname',
        ipAddress: '1.1.1.1',
      });

      // builder.userName = null;
      // assert.deepEqual(builder.rawBody, {
      //   userName: 'nickname',
      //   ipAddress: '1.1.1.1',
      // });
    });
    it('should use eventTypes for setting eventType property', () => {
      const builder = TrackerEventBuilder.create();
      builder.eventType = 'incorrect';

      assert.deepEqual(builder.rawBody, {});
      builder.eventType = 'account_edit';
      assert.deepEqual(builder.rawBody, { eventType: 'account_edit' });
    });
  });
});
