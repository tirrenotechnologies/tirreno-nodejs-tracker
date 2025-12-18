import Tracker from '../Tracker.js';

/**
 * Koa middleware for sending tracking events.
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
 * @returns {(ctx: any, next: Function) => Promise<void>}
 */
export default function trackerMiddleware(options) {
    const { url, key, timeoutMs } = options ?? {};

    let tracker;

    try {
        tracker = new Tracker(url, key, timeoutMs);
    } catch (_error) {
        // Invalid configuration: return noop middleware
        return async function noopTrackerMiddleware(_ctx, next) {
            await next();
        };
    }

    return async function trackerKoaMiddleware(ctx, next) {
        const event = tracker.createEvent();

        // Base fields populated from the request
        const req = ctx.request;

        const ua = req.headers['user-agent'] ?? '';
        const al = req.headers['accept-language'] ?? '';
        const ref = req.headers['referrer'] ?? req.headers['referer'] ?? '';

        const ipAddress = req.ip ?? ctx.ip ?? '';

        event
            .setIpAddress(ipAddress)
            .setUserAgent(ua)
            .setUrl(req.path)
            .setBrowserLanguage(al)
            .setHttpMethod(req.method)
            .setHttpReferer(ref);

        // Expose Event instance for user code (Koa-style)
        if (!ctx.state) {
            ctx.state = {};
        }

        Object.defineProperty(ctx.state, 'tracker', {
            configurable: true,
            enumerable: true,
            value: event
        });

        // Send event after the response is finished (Express finish analogue)
        ctx.res.on('finish', () => {
            // Do not block the response
            void tracker.track(event);
        });

        await next();
    };
}
