/** @module lib/event/builder */

/**
 * Tracker event data object
 * @typedef {object} EventData
 * @property {string} userName - A user identifier (required)
 * @property {string} ipAddress - An IP address associated with an event (required)
 * @property {string} url - A URL path of a resource requested (required)
 * @property {string} eventTime - A timestamp of an event (required)
 * @property {string} [emailAddress] - An email address associated with a user
 * @property {string} [userAgent] - A user agent string value
 * @property {string} [browserLanguage] - A detected language of the browser
 * @property {string} [httpMethod] - The type of HTTP request: GET, POST and etc.
 * @property {string} [httpReferer] - A value of the Referer HTTP header field
 * @property {string} [pageTitle] - A title of a visited resource
 * @property {string} [fullName] - A user’s whole name
 * @property {string} [firstName] - A user’s first name
 * @property {string} [lastName] - A user’s last name
 * @property {string} [phoneNumber] - A user’s phone number
 * @property {string} [eventType] - Event type {@link https://docs.tirreno.com/api-integration.html#event-type}
 * @property {string} [httpCode] - An HTTP response status code the request ended with
 * @property {array<object>} [payload] - An array of payloads
 *
 * {@link https://docs.tirreno.com/api-integration.html#parameters}
 */
import {
  isPlainObject,
  timestamp,
  pathToArray,
  pickObjectValue,
  eventTypes,
} from './helpers/utils.js';
import log from './helpers/logger.js';

export default class TrackerEventBuilder {
  static populateProvidedMappedFields = (mapperSettings) => {
    try {
      const fromPath = pathToArray(mapperSettings.from);
      const store = new Map();
      for (const [key, value] of Object.entries(mapperSettings.fields)) {
        store.set(key, pathToArray(value));
      }

      return (context) => {
        const data = pickObjectValue(context, fromPath);
        if (isPlainObject(data)) {
          const result = {};
          for (const [key, value] of store) {
            result[key] = pickObjectValue(data, value);
          }
          return result;
        }
        return {};
      };
    } catch (error) {
      log.debug("[builder] can't populate mapping fields:");
      log.debug(error);

      return () => ({});
    }
  };
  /**
   * @returns {TrackerEventBuilder & EventData}
   */
  static create() {
    const mixin = {
      get(target, prop) {
        if (target.allFields.has(prop)) {
          return target.#event[prop] ?? null;
        }
        return target[prop];
      },
      /**
       * @param {TrackerEventBuilder} target - The target {@link TrackerEventBuilder}
       * @param {string} property - Representing {@link EventData} property
       * @param {string} value - The new value of the property to set
       * @returns {boolean} `true` if the assignment succeeded, otherwise `false`
       */
      set(target, property, value) {
        if (target.allFields.has(property)) {
          target;
          switch (property) {
            case 'ipAddress': {
              if (target.#event.userName == null) {
                target.#event = {
                  ...target.#event,
                  userName: value,
                  [property]: value,
                };
                break;
              }
              target.#event = { ...target.#event, [property]: value };
              break;
            }
            case 'payload': {
              const list = Array.isArray(target.#event?.payload)
                ? target.#event.payload.push(value)
                : [value];
              target.#event = { ...target.#event, [property]: list };
              break;
            }
            case 'eventType':
              if (!target.#eventTypes.has(value)) break;
            // NOTE: break is omitted intentionally
            default:
              target.#event = { ...target.#event, [property]: value };
              break;
          }
          return true;
        }
        return false;
      },
    };

    return new Proxy(new TrackerEventBuilder(), mixin);
  }
  /**
   * Tracker event data object, used for inner preparaed manipulation
   * @type {EventData}
   */
  #event = {};
  /**
   * A set of required `EventData` fields
   * @type {Set<string>}
   */
  #requiredFields = new Set(['userName', 'ipAddress', 'url', 'eventTime']);
  /**
   * A set of populated `EventData` fields (includes required + additional)
   * @type {Set<string>}
   */
  #populatedFields = new Set([
    ...this.#requiredFields,
    // NOTE: additional fields
    'userAgent',
    'browserLanguage',
    'httpMethod',
    'httpReferer',
  ]);
  /**
   * A set of mapped `EventData` fields which can't be automatically populated
   * @type {Set<string>}
   */
  #mappedFields = new Set([
    'pageTitle',
    'fullName',
    'firstName',
    'lastName',
    'emailAddress',
    'phoneNumber',
    'eventType',
    'httpCode',
    'payload',
  ]);
  /**
   * @type {Set<string>}
   */
  #eventTypes = new Set(Object.values(eventTypes));
  /**
   * Default settings object
   * @type {object}
   */
  #defaultSettings = {
    fields: this.#requiredFields,
  };
  /**
   * Checks if a field is mapped and requires a custom mapper configuration
   * @param {string} value - The field name to check
   * @param {object} [mapper] - Mapper configuration object
   * @returns {boolean} `true` if the field is mapped but not defined in the mapper, otherwise `false`
   */
  #isUnmapped = (value, mapper) =>
    this.#mappedFields.has(value) && !mapper?.fields[value];
  /**
   * Creates a new TrackerEventBuilder instance
   * @param {EventData|object} [data] - Initial tracker event data
   * @param {object} [settings] - Validator configuration
   * @param {Set<string>|string[]} [settings.fields] - Custom fields to include in payload
   * @param {string} settings.mode - Builder mode
   * @param {boolean} [settings.populated=true] - Whether to include additional populated fields
   * @param {object} [settings.mapper] - Optional mapper configuration for mapped fields
   */
  constructor(data = null, settings = null) {
    let prepareSetting = this.#defaultSettings;

    if (isPlainObject(settings)) {
      const { fields, populated = true } = settings;

      if (populated) {
        prepareSetting.fields = this.#populatedFields;
      }

      if (Array.isArray(fields) || fields instanceof Set) {
        const { mapper = {}, mode = '' } = settings;
        fields.forEach((value) => {
          if (typeof value === 'string' && this.allFields.has(value)) {
            log.debug(
              'check',
              this.#isUnmapped(value, mapper),
              mode !== 'middleware',
            );
            if (this.#isUnmapped(value, mapper) && mode !== 'middleware')
              // FIXME: rewrite log message
              throw new Error('[R] You provide fields for mapper');

            prepareSetting.fields.add(value);
          }
        });
      }
    }

    this.settings = prepareSetting;
    if (isPlainObject(data)) {
      this.body = data;
    }
  }
  /**
   * @param {EventData|object} data
   */
  set body(data) {
    this.#event = {};
    this.settings.fields.forEach((value) => {
      if (value in data) {
        this.#event[value] = data[value];
      }
    });

    // data.userName isn't present in the payload, use ip address from request
    this.#event.userName = data?.userName ?? data?.ipAddress;
    this.#event.eventTime = data?.eventTime ?? timestamp();
  }
  /**
   * @returns {EventData} Return raw tracker event data object
   */
  get rawBody() {
    return this.#event;
  }
  /**
   * @returns {string} Return tracker event data in the url search type
   */
  get body() {
    return new URLSearchParams(this.#event).toString();
  }
  /**
   * @returns {boolean} `true` if the payload object is fully valid and can be used for requests, otherwise `false`
   */
  get isValid() {
    const keys = Object.keys(this.#event);
    const { fields } = this.settings;

    log.debug('[builder.isValid] setting keys', keys);
    log.debug('[builder.isValid] current fields', fields);
    log.debug(
      '[builder.isValid] short validation of payload',
      keys.length === fields.size,
    );
    if (keys.length !== fields.size) return false;

    log.debug(
      '[builder.isValid] full validation of payload',
      new Set(keys.concat([...fields])).size === keys.length,
    );
    return new Set(keys.concat([...fields])).size === keys.length;
  }
  /**
   * @returns {Set<string>} List of all available `EventData` parameters
   * {@link EventData}
   */
  get allFields() {
    // in the new Node.js versions will be added this new union() method for it
    return new Set([...this.#populatedFields, ...this.#mappedFields]);
  }
}
