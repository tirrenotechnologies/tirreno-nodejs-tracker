import Tracker from '../tracker.js';
import TrackerEventBuilder from '../builder.js';

/**
 * Express middleware for automatically sending tracking events
 * using the {@link Tracker} class.
 *
 * @param {{
 *   url: string,
 *   key: string,
 *   settings?: {
 *     populated?: boolean,
 *     fields?: string[],
 *     mapper?: Function,
 *   }
 * }} options - Middleware configuration options.
 *
 * @param {string} options.url - Base sensor API URL (must use `https`)
 * @param {string} options.key - API key for authentication
 * @param {object} [options.settings] - Additional tracker settings
 * @param {boolean} [options.settings.populated=true] - Whether to send extended request info
 * @param {string[]} [options.settings.fields] - List of fields to include in tracking data
 * @param {Function} [options.settings.mapper] - Custom mapping function
 *
 * @returns {import('express').RequestHandler} Express middleware function
 *
 * @example
 * import express from 'express';
 * import trackerMiddleware from 'tirreno-tracker';
 *
 * const app = express();
 *
 * const tirrenoUrl = "https://example.tld";
 * const trackingId = "XXX";
 *
 * app.use(trackerMiddleware({
 *   url: tirrenoUrl,
 *   key: trackingId,
 *   settings: { populated: false }
 * }));
 *
 * app.get('/', (req, res) => res.send('Hello World!'));
 *
 * app.listen(3000);
 */
export default (options) => {
  const { url, key, settings = {} } = options;

  try {
    const tracker = new Tracker(url, key, {
      ...settings,
      mode: Tracker.modes.middleware,
    });
    const customPopulatedFields =
      TrackerEventBuilder.populateProvidedMappedFields(settings.mapper) ?? {};

    const getRequiredFields = (request) => ({
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
      url: request.path,
      ...customPopulatedFields(request),
      ...(request.tracker.rawBody ?? {}),
    });
    const getWithPopulatedFields = (request) => ({
      browserLanguage: request.headers['accept-language'],
      httpMethod: request.method,
      httpReferer: request.headers['referrer'] ?? '',
      ...getRequiredFields(request),
    });

    const mapper =
      (settings.populated ?? true) ? getWithPopulatedFields : getRequiredFields;

    return (req, res, next) => {
      const event = TrackerEventBuilder.create();
      Object.defineProperty(req, 'tracker', {
        configurable: true,
        enumerable: true,
        value: event,
      });
      res.on('finish', async () => {
        try {
          await tracker.sendEvent(mapper(req));
        } catch (_error) {
          // TODO: error info
        }
      });

      next();
    };
  } catch (_error) {
    return async (req, res, next) => {
      next();
    };
  }
};
