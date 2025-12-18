import Tracker from '../Tracker.js';

/**
 * Express middleware for automatically sending tracking events
 * using the Tracker and Event classes.
 *
 * @param {{
 *   url: string,
 *   key: string,
 *   timeoutMs?: number
 * }} options
 *   url       - Base sensor API URL
 *   key       - API key for authentication
 *   timeoutMs - Optional timeout for HTTP request in milliseconds
 *
 * @returns {import('express').RequestHandler}
 */
export default function trackerMiddleware(options) {
    const { url, key, timeoutMs } = options ?? {};

    let tracker;

    try {
        tracker = new Tracker(url, key, timeoutMs);
    } catch (error) {
        // Invalid configuration: return noop middleware
        return function noopTrackerMiddleware(_req, _res, next) {
            next();
        };
    }

    return function trackerExpressMiddleware(req, res, next) {
        const event = tracker.createEvent();

        // Base fields populated from the request
        const ua  = req.headers['user-agent'] ?? '';
        const al  = req.headers['accept-language'] ?? '';
        const ref = req.headers['referrer'] ?? '';

        event
            .setIpAddress(req.ip)
            .setUserAgent(ua)
            .setUrl(req.path)
            .setBrowserLanguage(al)
            .setHttpMethod(req.method)
            .setHttpReferer(ref);

        // Expose Event instance for user code
        Object.defineProperty(req, 'tracker', {
            configurable: true,
            enumerable: true,
            value: event
        });

        // Send event after the response is finished
        res.on('finish', () => {
            // Do not block the response
            void tracker.track(event);
        });

        next();
    };
}
