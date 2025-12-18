import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import Event from '../lib/Event.js';

describe('Event', () => {

    it('dump() should include required fields always; missing ones must be empty strings', () => {
        const uuid = 'test-uuid-1';
        const event = new Event(uuid);

        event
            .setUserName('alice')
            .setIpAddress('1.1.1.1')
            .setUrl('/login');

        const dumped = event.dump();

        // Defaults
        assert.equal(typeof dumped.eventTime, 'string');
        assert.equal(dumped.eventType, 'page_view');

        // Exclude defaults before comparing
        const { eventTime, eventType, ...rest } = dumped;

        assert.deepStrictEqual(rest, {
            userName: 'alice',
            ipAddress: '1.1.1.1',
            url: '/login',

            // REQUIRED fields that were NOT set by user will be filled as empty strings
            userAgent: '',
            browserLanguage: '',
            httpMethod: '',
            httpReferer: '',
            fieldHistory: []
        });
    });


    it('dump() should include payload items', () => {
        const uuid = 'test-uuid-2';
        const event = new Event(uuid);

        const p1 = {
            field_id: 'email',
            old_value: 'old@example.com',
            new_value: 'new@example.com'
        };

        const p2 = {
            field_id: 'name',
            new_value: 'Alice'
        };

        event
            .setUserName('alice')
            .setPayload([p1, p2]);

        const dumped = event.dump();

        assert.equal(dumped.userName, 'alice');
        assert.ok(Array.isArray(dumped.payload));
        assert.equal(dumped.payload.length, 2);

        assert.deepStrictEqual(dumped.payload[0], {
            field_id: 'email',
            old_value: 'old@example.com',
            new_value: 'new@example.com'
        });

        assert.deepStrictEqual(dumped.payload[1], {
            field_id: 'name',
            new_value: 'Alice'
        });
    });
});
