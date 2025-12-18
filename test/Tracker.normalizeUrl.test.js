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

describe('Tracker URL normalization', () => {
    let originalFetch;
    let fetchSpy;

    beforeEach(() => {
        originalFetch = global.fetch;
        fetchSpy = spy();

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

    const sendOnceAndGetUrl = async (inputUrl) => {
        const startCalls = fetchSpy.calls.length;

        const tracker = new Tracker(inputUrl, 'api-key');
        const event = tracker.createEvent();

        event
            .setUserName('alice')
            .setIpAddress('1.1.1.1')
            .setUrl('/login');

        await tracker.track(event);

        // Ensure only one call was made
        assert.equal(fetchSpy.calls.length, startCalls + 1);

        const [url] = fetchSpy.calls[fetchSpy.calls.length - 1];

        return String(url);
    };

    it('should append /sensor/ when no path is provided', async () => {
        const baseUrl = 'https://www.example.com';

        const url1 = await sendOnceAndGetUrl(baseUrl);
        const url2 = await sendOnceAndGetUrl(`${baseUrl}/`);

        assert.equal(url1, 'https://www.example.com/sensor/');
        assert.equal(url2, 'https://www.example.com/sensor/');
    });

    it('should normalize existing sensor path to end with trailing slash', async () => {
        const baseUrl = 'https://www.example.com';

        const url1 = await sendOnceAndGetUrl(`${baseUrl}/sensor`);
        const url2 = await sendOnceAndGetUrl(`${baseUrl}/sensor/`);

        assert.equal(url1, 'https://www.example.com/sensor/');
        assert.equal(url2, 'https://www.example.com/sensor/');
    });

    it('should append /sensor/ to non-root paths', async () => {
        const baseUrl = 'https://www.example.com';

        const url1 = await sendOnceAndGetUrl(`${baseUrl}/api`);
        const url2 = await sendOnceAndGetUrl(`${baseUrl}/api/`);
        const url3 = await sendOnceAndGetUrl(`${baseUrl}/api/sensor`);
        const url4 = await sendOnceAndGetUrl(`${baseUrl}/api/sensor/`);

        assert.equal(url1, 'https://www.example.com/api/sensor/');
        assert.equal(url2, 'https://www.example.com/api/sensor/');
        assert.equal(url3, 'https://www.example.com/api/sensor/');
        assert.equal(url4, 'https://www.example.com/api/sensor/');
    });

    it('should strip query string and hash before adding /sensor/', async () => {
        const baseUrl = 'https://www.example.com';

        const url1 = await sendOnceAndGetUrl(`${baseUrl}?q=1`);
        const url2 = await sendOnceAndGetUrl(`${baseUrl}#tag`);
        const url3 = await sendOnceAndGetUrl(`${baseUrl}?q=1#tag`);

        assert.equal(url1, 'https://www.example.com/sensor/');
        assert.equal(url2, 'https://www.example.com/sensor/');
        assert.equal(url3, 'https://www.example.com/sensor/');
    });
});
