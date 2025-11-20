/** @module lib/helpers/utils */

/**
 * @typedef {object} LibModes
 * @property {'populated'} populated - Populated mode
 * @property {'middleware'} middleware - Middleware mode
 */

/**
 * @typedef {object} EventTypesCodes
 * @property {'account_edit'} ACCOUNT_EDIT - User profile edit event
 * @property {'account_email_change'} ACCOUNT_EMAIL_CHANGE - User email change event
 * @property {'account_login'} ACCOUNT_LOGIN - Successful user login event
 * @property {'account_login_fail'} ACCOUNT_LOGIN_FAIL - Failed user login attempt event
 * @property {'account_logout'} ACCOUNT_LOGOUT - User logout event
 * @property {'account_password_change'} ACCOUNT_PASSWORD_CHANGE - Password change event
 * @property {'account_registration'} ACCOUNT_REGISTRATION - New user registration event
 * @property {'page_delete'} PAGE_DELETE - Page deletion event
 * @property {'page_edit'} PAGE_EDIT - Page edit event
 * @property {'page_error'} PAGE_ERROR - Page error event
 * @property {'page_search'} PAGE_SEARCH - Page search event
 * @property {'page_view'} PAGE_VIEW - Page view event
 */

/**
 * Checks if the given value is a plain object.
 * Works reliably in Node.js (if an an object created by the Object constructor or using `{}`)
 *
 * @param {*} value - The value to check
 * @returns {boolean} `true` if the value is a plain object, otherwise `false`
 */
export const isPlainObject = (value) => {
  return Object.prototype.toString.call(value) === '[object Object]';
};

/**
 * Formats a `value` for safe logging by showing its type
 * and optionally masking its actual content if it's sensitive
 *
 * @param {string} name - The name of value
 * @param {*} value - The value to format
 * @param {boolean} [sensitive=false] - If `true`, the actual value will be masked
 * @returns {string} A formatted string suitable for logging
 *
 * @example
 * mask("password", true); // "[string] ******"
 * mask(12345, false);     // "[number] 12345"
 */
export const mask = (name, value, sensitive = false) => {
  if (value == null) {
    return `"${name}" value is ${value === null ? 'null ' : typeof value}`;
  }
  return `${name}[${typeof value}] ${sensitive ? '******' : value}`;
};

/**
 * Creates a promise that resolves after a specified delay.
 * (Backport for the old Node.js versions without timers promises api)
 *
 * @param {number} ms - The number of milliseconds to wait
 * @returns {Promise<void>} A promise that resolves after the specified delay
 *
 * @example
 * await sleep(1000); // Waits for 1 second
 */
export const sleep = async (ms) =>
  await new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Converts `string` to a property path array
 *
 * @param {string} value - The string path for converting
 * @returns {array} The property path array
 */
export const pathToArray = (value) => {
  if (typeof value !== 'string') throw new TypeError('path must be a string');

  if (!value.includes('.')) return [value];

  return value.split('.');
};

/**
 * Pick value from object by property path array
 * @param {object} object - Object to query value from
 * @param {array} keys - The property path array
 * @returns {*} The resolved value
 */
export const pickObjectValue = (object, keys) => {
  return keys.reduce((result, value) => {
    return result?.[value];
  }, object);
};

/**
 * Generates a formatted timestamp string for a given date
 *
 * @param {Date} [date=new Date()] - The JavaScript Date object to format
 * @returns {string} A date string in the `YYYY-MM-DD HH:mm:ss.SSS` format (ISO 8601)
 *
 * @example
 * timestamp(); // "2000-01-01 10:30:45.123"
 */
export const timestamp = (date = new Date()) => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  });

  const parts = formatter.formatToParts(date);
  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));

  const ms = String(date.getMilliseconds()).padStart(3, '0');

  return `${map.year}-${map.month}-${map.day} ${map.hour}:${map.minute}:${map.second}.${ms}`;
};

/**
 * List of available modes
 * @type {LibModes}
 * @constant
 * @readonly
 */
export const modes = Object.freeze({
  populated: 'populated',
  middleware: 'middleware',
});

/**
 * List of available event types
 * @type {EventTypesCodes}
 * @constant
 * @readonly
 */
export const eventTypes = Object.freeze({
  ACCOUNT_EDIT: 'account_edit',
  ACCOUNT_EMAIL_CHANGE: 'account_email_change',
  ACCOUNT_LOGIN: 'account_login',
  ACCOUNT_LOGIN_FAIL: 'account_login_fail',
  ACCOUNT_LOGOUT: 'account_logout',
  ACCOUNT_PASSWORD_CHANGE: 'account_password_change',
  ACCOUNT_REGISTRATION: 'account_registration',
  PAGE_DELETE: 'page_delete',
  PAGE_EDIT: 'page_edit',
  PAGE_ERROR: 'page_error',
  PAGE_SEARCH: 'page_search',
  PAGE_VIEW: 'page_view',
});

export const eventPayload = new Set([
  'new_value',
  'old_value',
  'field_id',
  'field_name',
]);
