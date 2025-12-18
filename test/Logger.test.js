import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import defaultLogger, { Logger } from '../lib/helpers/Logger.js';

const spy = () => {
    const fn = (...args) => fn.calls.push(args);
    fn.calls = [];
    return fn;
};

const fakeLogger = () => ({
    error: spy(),
    warn: spy(),
    log: spy(),
    info: spy(),
    debug: spy(),
});

describe('helpers/logger', () => {
    describe('default instance', () => {
        it('uses console when no custom logger is passed (fresh instance)', () => {
            const originals = {
                error: console.error,
                warn: console.warn,
                log: console.log,
                info: console.info,
            };

            const s = {
                error: spy(),
                warn: spy(),
                log: spy(),
                info: spy(),
            };

            console.error = s.error;
            console.warn = s.warn;
            console.log = s.log;
            console.info = s.info;

            try {
                const logger = new Logger();

                logger.error('e1');
                logger.warn('w1');
                logger.log('l1');
                logger.info('i1');

                assert.equal(s.error.calls.length, 1);
                assert.equal(s.warn.calls.length, 1);
                assert.equal(s.log.calls.length, 1);
                assert.equal(s.info.calls.length, 1);

                assert.deepEqual(s.error.calls[0], ['e1']);
                assert.deepEqual(s.warn.calls[0], ['w1']);
                assert.deepEqual(s.log.calls[0], ['l1']);
                assert.deepEqual(s.info.calls[0], ['i1']);
            } finally {
                console.error = originals.error;
                console.warn = originals.warn;
                console.log = originals.log;
                console.info = originals.info;
            }
        });

        it('default export is a Logger instance', () => {
            assert.ok(defaultLogger instanceof Logger);
        });
    });

    describe('custom logger', () => {
        it('delegates to custom logger when all methods are present', () => {
            const fake = fakeLogger();
            const logger = new Logger(fake);

            logger.error('e1');
            logger.warn('w1');
            logger.log('l1');
            logger.info('i1');

            assert.equal(fake.error.calls.length, 1);
            assert.equal(fake.warn.calls.length, 1);
            assert.equal(fake.log.calls.length, 1);
            assert.equal(fake.info.calls.length, 1);

            assert.deepEqual(fake.error.calls[0], ['e1']);
            assert.deepEqual(fake.warn.calls[0], ['w1']);
            assert.deepEqual(fake.log.calls[0], ['l1']);
            assert.deepEqual(fake.info.calls[0], ['i1']);
        });

        it('falls back to console when a method is missing on custom logger', () => {
            const originals = {
                log: console.log,
                warn: console.warn,
                info: console.info,
            };

            const s = {
                log: spy(),
                warn: spy(),
                info: spy(),
            };

            console.log = s.log;
            console.warn = s.warn;
            console.info = s.info;

            try {
                const partial = {
                    error: () => {},
                };

                const logger = new Logger(partial);

                logger.warn('w1');
                logger.log('l1');
                logger.info('i1');

                assert.equal(s.warn.calls.length, 1);
                assert.equal(s.log.calls.length, 1);
                assert.equal(s.info.calls.length, 1);

                assert.deepEqual(s.warn.calls[0], ['w1']);
                assert.deepEqual(s.log.calls[0], ['l1']);
                assert.deepEqual(s.info.calls[0], ['i1']);
            } finally {
                console.log = originals.log;
                console.warn = originals.warn;
                console.info = originals.info;
            }
        });
    });

    describe('debug', () => {
        it('exposes debug as a callable function from util.debuglog', () => {
            const logger = new Logger();

            assert.equal(typeof logger.debug, 'function');

            assert.doesNotThrow(() => {
                logger.debug('d1', { a: 1 });
            });
        });

        it('debug does not delegate to custom logger.debug', () => {
            const fake = fakeLogger();
            const logger = new Logger(fake);

            logger.debug('d2');

            assert.equal(fake.debug.calls.length, 0);
        });
    });
});
