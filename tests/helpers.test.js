import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  isPlainObject,
  timestamp,
  pickObjectValue,
  pathToArray,
} from '../lib/helpers/utils.js';

describe('helpers/utils', () => {
  describe('isPlainObject()', () => {
    it('should return `true` if value is object', () => {
      assert.ok(isPlainObject({}));
      assert.ok(isPlainObject(new Object()));

      assert.ok(!isPlainObject(null));
      assert.ok(!isPlainObject(undefined));
      assert.ok(!isPlainObject(true));

      assert.ok(!isPlainObject(0));
      assert.ok(!isPlainObject(''));
      assert.ok(!isPlainObject([]));
      assert.ok(!isPlainObject(new Set([])));
      assert.ok(!isPlainObject(new Map([])));
      assert.ok(!isPlainObject(Symbol()));
      assert.ok(!isPlainObject(BigInt('0x1fffffffffffff')));

      assert.ok(!isPlainObject(() => {}));
    });
  });
  describe('timestamp()', () => {
    it('should generates a formatted timestam<D-/>p string for a given date', () => {
      const date = new Date(Date.UTC(2000, 0, 1));

      assert.strict.equal(timestamp(date), '2000-01-01 00:00:00.000');

      // TODO: need to create date type validation for this function
    });
  });
  describe('pickObjectValue()', () => {
    it('', () => {
      const object = { a: { b: { c: { d: 'e' } } } };

      assert.deepEqual(pickObjectValue(object, ['a', 'b', 'c']), { d: 'e' });
      assert.equal(pickObjectValue(object, ['b']), undefined);
      assert.equal(pickObjectValue(object, ['b', 'c']), undefined);
    });
  });
  describe('pathToArray()', () => {
    it('should convert string to array by dot separate', () => {
      assert.deepEqual(pathToArray('a'), ['a']);
      assert.deepEqual(pathToArray('a.b.c'), ['a', 'b', 'c']);
    });
    it('should throws error if use wrong type', () => {
      assert.throws(() => pathToArray(null), TypeError);
      assert.throws(() => pathToArray(undefined), TypeError);

      assert.throws(() => pathToArray(true), TypeError);
      assert.throws(() => pathToArray(false), TypeError);
      assert.throws(() => pathToArray(0), TypeError);

      assert.throws(() => pathToArray({}), TypeError);
      assert.throws(() => pathToArray(new Object()), TypeError);
      assert.throws(() => pathToArray(new Map([])), TypeError);
      assert.throws(() => pathToArray(new Set([])), TypeError);

      assert.throws(() => pathToArray(Symbol()), TypeError);
      assert.throws(() => pathToArray(BigInt('0x1fffffffffffff')), TypeError);
      assert.throws(() => pathToArray(() => {}), TypeError);
      // assert.throws(() => pathToArray(null), TypeError);
      // assert.throws(() => pathToArray(null), TypeError);
      // assert.throws(() => pathToArray(null), TypeError);
    });
  });
});
