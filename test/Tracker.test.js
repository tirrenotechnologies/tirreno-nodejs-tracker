// test/Tracker.test.js

import assert from 'node:assert/strict';
import { describe, it, beforeEach, afterEach } from 'node:test';

import Tracker from '../lib/Tracker.js';

const spy = () => {
    const fn = (...args) => {
        fn.calls.push(args);
    };
    fn.calls = [];
    return fn;
};

describe('Tracker', () => {
    let originalFetch;
    let fetchSpy;

    beforeEach(() => {
        originalFetch = global.fetch;
        fetchSpy = spy();

        // Simple fake fetch
        global.fetch = async (...args) => {
            fetchSpy(...args);
            return {
                ok: true,
                status: 204
            };
        };
    });

    afterEach(() => {
        global.fetch = originalFetch;
    });

    it('createEvent() should return Event instance with uuid', () => {
        const tracker = new Tracker('https://example.test/sensor', 'api-key');

        const event = tracker.createEvent();

        assert.ok(event);
        assert.equal(typeof event.getUuid(), 'string');
        assert.ok(event.getUuid().length > 0);
    });

    it('track() should send event once and remove it from storage', async () => {
        const tracker = new Tracker('https://example.test/sensor', 'api-key');

        const event = tracker.createEvent();

        event
            .setUserName('alice')
            .setIpAddress('1.1.1.1')
            .setUrl('/login')
            .setUserAgent('TestAgent/1.0')
            .setBrowserLanguage('en')
            .setHttpMethod('GET')
            .setHttpReferer('https://referrer.test')
            .setEventTypeAccountLogin();

        // First call: event should be sent
        await tracker.track(event);

        assert.equal(fetchSpy.calls.length, 1);

        const [url, options] = fetchSpy.calls[0];

        // URL is normalized and ends with trailng slash
        assert.equal(url, 'https://example.test/sensor/');

        assert.equal(options.method, 'POST');
        assert.equal(options.headers['Api-Key'], 'api-key');
        assert.equal(
            options.headers['Content-Type'],
            'application/x-www-form-urlencoded'
        );

        const body = options.body;
        assert.equal(typeof body, 'string');
        assert.ok(body.includes('userName=alice'));
        assert.ok(body.includes('ipAddress=1.1.1.1'));
        assert.ok(body.includes('url=%2Flogin'));

        // Second call: event was removed from storage, nothing should be sent
        fetchSpy.calls = [];

        await tracker.track(event);

        assert.equal(fetchSpy.calls.length, 0);
    });
});
