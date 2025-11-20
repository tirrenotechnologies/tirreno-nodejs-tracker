/** @typedef {import("./builder.js").EventData} EventData */
/** @typedef {import('./helpers.js').LibModes} LibModes */

import TrackerEventBuilder from './builder.js';
import { mask, modes } from './helpers/utils.js';
import { ConfigError } from './helpers/errors.js';
import log from './helpers/logger.js';

export default class Tracker {
  /**
   * Full sensor URL with the correct protocol and path
   * (Automatically set via the `#url` setter)
   * @type {string}
   */
  #endpoint = null;
  /**
   * Private API key for request authorization
   * @type {string}
   */
  #key = null;
  /**
   * Current library operation mode
   * @type {string}
   */
  #mode = null;
  /**
   * Available library modes
   * @type {LibModes}
   * @readonly
   * @static
   */
  static modes = modes;
  /**
   * Creates a new Tracker instance for sending events.
   *
   * @param {string} url - Base API sensor URL (must use `https`)
   * @param {string} key - API key for authorization
   * @param {Object} [settings] - Additional configuration
   * @param {boolean} [settings.populated=true] - Whether to send pre-populated event data
   * @param {string[]} [settings.fields] - A list of fields to include in the request
   * @param {Function} [settings.mapper] - A function for mapping or transforming event data, usefull in the `middleware` mode
   * @param {string} [settings.mode] - Lib mode
   *
   * @throws {Error} If `url` or `key` are missing or invalid.
   */
  constructor(...args) {
    const [url, key, settings] = args;

    try {
      if (typeof url !== 'string' || typeof key !== 'string') {
        throw new ConfigError(`${mask('url', url)}, ${mask('key', key, true)}`);
      }

      this.#url = url;
      this.#key = key;
      this.#settings = settings;

      // NOTE: Passing event builder to the Tracker instance,
      // can be used as standalone event builder or in the middlewares
      this.createEvent = TrackerEventBuilder.create;
    } catch (cause) {
      if (cause instanceof ConfigError) throw cause;

      throw new ConfigError('Unexpected error', { cause });
    }
  }
  /**
   * Sets a valid sensor URL
   * If the provided URL does not include the `/sensor/` path,
   * it will automatically be added
   *
   * @param {string} value - Base sensor URL
   *
   * @throws {Error} If the URL protocol is not `https`
   */
  set #url(value) {
    const url = new URL(value);

    // FIXME: localhost and private network check must be used here
    // if (url.protocol !== 'https:')
    //   throw new ConfigError('URL missing https protocol');
    url.pathname = url.pathname.endsWith('/')
      ? url.pathname
      : `${url.pathname}/`;
    // NOTE: remove search and hash values
    url.searchParams.forEach((_, key) => url.searchParams.delete(key));
    url.hash = '';

    if (!url.pathname.endsWith('/sensor/')) {
      log.debug(
        'Due to the lack of a route path to the sensor, it was added to the end of the provided URL',
      );
      url.pathname += 'sensor/';
    }
    this.#endpoint = url;
  }
  /**
   * Applies the tracker configuration settings
   * Determines the library mode and sets request fields
   *
   * @param {Object} [value={}] - Tracker settings
   * @param {boolean} [value.populated=true] - Whether to send pre-populated event data
   * @param {string[]} [value.fields] - List of fields to include in requests
   * @param {Function} [value.mapper] - Data transformation function
   * @param {string} [value.mode] - Lib mode
   */
  set #settings(value = {}) {
    const { populated = true, fields, mapper } = value;
    this.#mode =
      value.mode === Tracker.modes.middleware
        ? Tracker.modes.middleware
        : Tracker.modes.populated;
    this.settings = { populated, fields, mapper, mode: this.#mode };
  }
  /**
   * Builds request options for the `fetch` API
   *
   * @param {object} [body={}] - Request payload
   * @returns {Request} Request options for `fetch`
   */
  #options(body = {}) {
    return {
      method: 'POST',
      body,
      headers: {
        'Api-Key': this.#key,
        'Content-Type': 'application/x-www-form-urlencoded',

        keepalive: true,
      },
    };
  }
  /**
   * Returns the current tracker configuration
   *
   * @returns {{
   *   url: string,
   *   key: string,
   *   mode: string,
   *   requestOptions: Request
   * }}
   */
  get configurations() {
    const key = mask(this.#key, true);
    const requestOptions = this.#options();
    // NOTE: hide api key
    requestOptions.headers.key = key;

    return { url: this.#endpoint, key, mode: this.#mode, requestOptions };
  }
  /**
   * Sends an event to the sensor
   *
   * @async
   * @param {EventData} data - Event payload to send
   * @returns {Promise<void>}
   *
   * @example
   * const tracker = new Tracker('https://api.example.com', 'API_KEY');
   * await tracker.sendEvent({
   *   ipAddress: '1.1.1.1',
   *   url: '/',
   *   userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
   *   browserLanguage: 'en-US;q=0.8,en;q=0.7',
   *   httpMethod: 'GET',
   * });
   */
  async sendEvent(data) {
    try {
      const builder = new TrackerEventBuilder(data, this.settings);

      if (builder.isValid) {
        const response = await fetch(
          this.#endpoint,
          this.#options(builder.body),
        );

        if (response.status !== 204) {
          log.info(`Sensor return wrong response ${response.status}`);
        }
        log.debug('[tracker.sendEvent]', response);
      }
    } catch (error) {
      log.error(error);
    }
  }
}
