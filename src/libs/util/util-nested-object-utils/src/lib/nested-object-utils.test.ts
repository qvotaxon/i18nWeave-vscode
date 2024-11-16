/* eslint-disable no-restricted-imports */
import * as assert from 'assert';

import {
  collectLeafValues,
  reconstructObjectWithUpdatedValues,
} from './nested-object-utils';

suite('NestedObjectUtils', () => {
  suite('collectLeafValues', () => {
    test('should collect all leaf values from a nested object', () => {
      const obj = {
        a: {
          b: {
            c: 1,
            d: 2,
          },
          e: 3,
        },
        f: 4,
      };

      const expected = [
        { path: ['a', 'b', 'c'], value: 1 },
        { path: ['a', 'b', 'd'], value: 2 },
        { path: ['a', 'e'], value: 3 },
        { path: ['f'], value: 4 },
      ];

      const result = collectLeafValues(obj);
      assert.deepStrictEqual(result, expected);
    });

    test('should return an empty array for an empty object', () => {
      const obj = {};
      const expected: { path: string[]; value: any }[] = [];
      const result = collectLeafValues(obj);
      assert.deepStrictEqual(result, expected);
    });

    test('should handle nested objects with null values', () => {
      const obj = {
        a: {
          b: null,
        },
      };

      const expected = [{ path: ['a', 'b'], value: null }];

      const result = collectLeafValues(obj);
      assert.deepStrictEqual(result, expected);
    });
  });

  suite('reconstructObjectWithUpdatedValues', () => {
    test('should reconstruct an object with updated values at specified paths', () => {
      const obj = {
        a: {
          b: {
            c: 1,
          },
        },
      };

      const updatedLeaves = [{ path: ['a', 'b', 'c'], value: 2 }];

      const expected = {
        a: {
          b: {
            c: 2,
          },
        },
      };

      const result = reconstructObjectWithUpdatedValues(obj, updatedLeaves);
      assert.deepStrictEqual(result, expected);
    });

    test('should handle multiple updates', () => {
      const obj = {
        a: {
          b: {
            c: 1,
            d: 2,
          },
        },
      };

      const updatedLeaves = [
        { path: ['a', 'b', 'c'], value: 3 },
        { path: ['a', 'b', 'd'], value: 4 },
      ];

      const expected = {
        a: {
          b: {
            c: 3,
            d: 4,
          },
        },
      };

      const result = reconstructObjectWithUpdatedValues(obj, updatedLeaves);
      assert.deepStrictEqual(result, expected);
    });

    test('should handle updates on different levels', () => {
      const obj = {
        a: {
          b: {
            c: 1,
          },
          d: 2,
        },
      };

      const updatedLeaves = [
        { path: ['a', 'b', 'c'], value: 3 },
        { path: ['a', 'd'], value: 4 },
      ];

      const expected = {
        a: {
          b: {
            c: 3,
          },
          d: 4,
        },
      };

      const result = reconstructObjectWithUpdatedValues(obj, updatedLeaves);
      assert.deepStrictEqual(result, expected);
    });
  });
});

