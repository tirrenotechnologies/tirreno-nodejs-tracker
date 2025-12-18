import assert from 'node:assert/strict';
import { describe, it, beforeEach, afterEach } from 'node:test';

import trackerMiddleware from '../lib/adapters/Express.js';

const spy = () => {
    const fn = (...args) => {
        fn.calls.push(args);
    };
    fn.calls = [];
    return fn;
};

describe('Express tracker middleware', () => {
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

    const createReqRes = () => {
        const finishListeners = [];

        const req = {
            ip: '1.1.1.1',
            method: 'GET',
            path: '/login',
            headers: {
                'user-agent': 'TestAgent/1.0',
                'accept-language': 'en-US',
                referrer: 'https://referrer.test'
            }
        };

        const res = {
            on(event, handler) {
                if (event === 'finish') {
                    finishListeners.push(handler);
                }
            },
            async emitFinish() {
                for (const handler of finishListeners) {
                    handler();
                }

                await new Promise((resolve) => setImmediate(resolve));
            }
        };

        return { req, res, finishListeners };
    };

    it('should attach Event instance to req.tracker and call next()', () => {
        const middleware = trackerMiddleware({
            url: 'https://example.test',
            key: 'api-key'
        });

        const { req, res } = createReqRes();
        const nextSpy = spy();

        middleware(req, res, nextSpy);

        assert.equal(nextSpy.calls.length, 1);
        assert.ok(req.tracker);
        assert.equal(typeof req.tracker.getUuid, 'function');
    });

    it('should send event on response finish with base request data', async () => {
        const middleware = trackerMiddleware({
            url: 'https://example.test',
            key: 'api-key'
        });

        const { req, res } = createReqRes();
        const nextSpy = spy();

        middleware(req, res, nextSpy);

        assert.equal(nextSpy.calls.length, 1);

        await res.emitFinish();

        assert.equal(fetchSpy.calls.length, 1);

        const [url, options] = fetchSpy.calls[0];

        assert.equal(String(url), 'https://example.test/sensor/');
        assert.equal(options.method, 'POST');
        assert.equal(options.headers['Api-Key'], 'api-key');
        assert.equal(
            options.headers['Content-Type'],
            'application/x-www-form-urlencoded'
        );

        const body = options.body;
        assert.equal(typeof body, 'string');

        assert.ok(body.includes('ipAddress=1.1.1.1'));
        assert.ok(body.includes('url=%2Flogin'));
        assert.ok(body.includes('userAgent=TestAgent%2F1.0'));
        assert.ok(body.includes('browserLanguage=en-US'));
        assert.ok(body.includes('httpMethod=GET'));
        assert.ok(body.includes('httpReferer=https%3A%2F%2Freferrer.test'));
    });
});
