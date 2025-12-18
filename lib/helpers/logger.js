import { debuglog } from 'node:util';

const LEVELS = ['error', 'warn', 'log', 'info'];

export class Logger {
    constructor(logger = null) {
        const base = logger ?? console;

        LEVELS.forEach((level) => {
            if (typeof base[level] === 'function') {
                this[level] = base[level].bind(base);
            } else if (typeof console[level] === 'function') {
                this[level] = console[level].bind(console);
            } else {
                this[level] = () => {};
            }
        });

        this.debug = debuglog('tracker');
    }
}

export default new Logger();
