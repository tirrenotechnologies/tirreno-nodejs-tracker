import { debuglog } from 'node:util';

class Logger {
  #level = null;

  #logger = null;

  #levels = ['error', 'warn', 'log', 'info', 'debug'];

  constructor(level = 'error', logger = null) {
    this.logger = logger;
    this.level = level;

    this.error = this.#logger.error;
    this.debug = debuglog('tracker', (fn) => {
      this.debug = fn;
    });

    if (debuglog('tracker').enabled) {
      ['warn', 'log', 'info'].forEach((value) => {
        this[value] = debuglog('tracker', (fn) => {
          this[value] = fn;
        });
      });
    } else if (logger) {
      this.#levels.forEach((value) => {
        this[value] = logger?.[value] ?? console[value];
      });
    }
  }

  set logger(value = null) {
    this.#logger = value ?? console;
  }

  set level(value) {
    if (this.#levels.includes(value)) {
      this.#level = value;
    }
  }
}

export default new Logger();
