import Event from './Event.js';
import log from './helpers/Logger.js';
import qs from 'qs';

// Internal helper for UUID v4-like generation
function generateUuid() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

export default class Tracker {
    #url;
    #headers;
    #eventTimeoutSec;
    #events;

    /**
     * @param {string} apiUrl
     * @param {string} apiKey
     * @param {number} eventTimeout seconds
     */
    constructor(apiUrl, apiKey, eventTimeout = 30) {
        this.#url = this.#normalizeUrl(apiUrl);
        this.#eventTimeoutSec = eventTimeout;
        this.#events = new Map();

        this.#headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Api-Key': apiKey
        };
    }

    /**
     * Normalize API URL with path to sensor
     * 
     * @param {String} value 
     * @returns 
     */
    #normalizeUrl(value) {
        const url = new URL(value);

        url.pathname = url.pathname.endsWith('/')
            ? url.pathname
            : `${url.pathname}/`;

        url.search = '';
        url.hash = '';

        if (!url.pathname.endsWith('/sensor/')) {
            url.pathname += 'sensor/';
        }

        return url.toString();
    }    

    /**
     * Static method used for testing and internal usage.
     */
    static generateUuid() {
        return generateUuid();
    }

    /**
     * Create a new Event instance with a generated UUID
     * and store it in the internal map with a timestamp.
     */
    createEvent() {
        const now = Math.floor(Date.now() / 1000);
        const threshold = now - this.#eventTimeoutSec;

        for (const [uuid, stored] of this.#events.entries()) {
            if (!stored || typeof stored.ts !== 'number') {
                continue;
            }

            if (stored.ts < threshold) {
                const outdated = this.#events.get(uuid);

                this.#events.delete(uuid);

                if (outdated && outdated.event) {
                    const content = outdated.event.dump();
                    
                    const message = (
                        `Event ${uuid} was outdated, dropping event with content 
                        ${JSON.stringify(content)}`                        
                    );

                    log.debug(message);
                }
            }
        }

        const uuid = Tracker.generateUuid();
        const event = new Event(uuid);

        this.#events.set(uuid, {
            event,
            ts: now
        });

        return event;
    }

    /**
     * Return stored event instance by UUID or null if not found.
     */
    getEvent(uuid) {
        const stored = this.#events.get(uuid);

        if (!stored) {
            return null;
        }

        return stored.event || null;
    }

    /**
     * Send stored event by instance.
     * On success the event is removed from the internal storage.
     *
     * @param {Event} event
     * @returns {Promise<Tracker>}
     */
    async track(event) {
        const uuid = event.getUuid();

        const stored = this.#events.get(uuid);
        const message = (
            `Tracker misses Event object with uuid ${uuid}, 
            create Event objects via Tracker.createEvent() method 
            and do not reuse them.`
        );

        if (!stored) {
            log.debug(message);
            return this;
        }

        const data = stored.event
            ? stored.event.dump()
            : null;

        if (!data) {
            log.debug(message);
            this.#events.delete(uuid);
            return this;
        }

        const ok = await this.#send(data);

        if (ok) {
            this.#events.delete(uuid);
        }

        return this;
    }

    async #send(data) {
        try {
            if (typeof fetch !== 'function') {
                log.debug('Tracker: fetch is not available in this environment');
                return false;
            }

            const payload = {};

            for (const [key, value] of Object.entries(data)) {
                if (value === null || value === undefined) {
                    continue;
                }

                payload[key] = value;
            }

            const url = this.#url;
            const body = qs.stringify(payload);

            const options = {
                method: 'POST',
                headers: this.#headers,
                body
            };

            const response = await fetch(url, options);

            if (!response.ok) {
                const message = `Tracker request failed. Status ${response.status}`;
                log.debug(message);
                return false;
            }

            const message = `Tracker request sent. Response status is ${response.status}`;
            log.debug(message);

            return true;

        } catch (error) {
            const cause = error && error.cause ? error.cause : null;

            const code = cause && cause.code
                ? cause.code
                : null;

            const message = code
                ? `Tracker send failed with code ${code}`
                : 'Tracker send failed';

            log.debug(message);
            log.debug(error);

            return false;
        }
    }
}
