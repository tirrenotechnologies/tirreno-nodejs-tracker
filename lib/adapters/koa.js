import Tracker from '../tracker.js';
import TrackerEventBuilder from '../builder.js';

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
    });
    const getWithPopulatedFields = (request) => ({
      browserLanguage: request.headers['accept-language'],
      httpMethod: request.method,
      httpReferer: request.headers['referrer'] ?? '',
      ...getRequiredFields(request),
    });

    const mapper =
      (settings.populated ?? true) ? getWithPopulatedFields : getRequiredFields;

    return (ctx, next) => {
      (async () => {
        try {
          await tracker.sendEvent(mapper(ctx.request));
        } catch (_error) {
          // TODO: error info
        }
      })();

      next();
    };
  } catch (_error) {
    return async (ctx, next) => {
      next();
    };
  }
};
