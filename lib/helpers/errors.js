class TrackerError extends Error {
  name = 'TrackerError';
  constructor(message, { cause, stack = true, ...options } = {}) {
    super(message, cause ? { cause } : {});

    if (options.code) this.code = options.code;
    if (!stack) delete this.stack;
  }
}

export class ConfigError extends TrackerError {
  constructor(info = '', options = {}) {
    const message =
      'Required fields of the class constructor are specified incorrectly or are missing altogether!';

    super(message, {
      cause: new TrackerError(info, { stack: false }),
      code: 'ERR_CONFIG',
      ...options,
    });
  }
}
