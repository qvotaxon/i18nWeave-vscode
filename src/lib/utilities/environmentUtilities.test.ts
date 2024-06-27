import * as assert from 'assert';

import {
  getEnvironment,
  isDevelopment,
  isProduction,
} from './environmentUtilities';

suite('Environment Utilities', () => {
  suite('getEnvironment', () => {
    test('should return the current environment', () => {
      const environment = getEnvironment();
      assert.ok(environment);
      assert.equal(typeof environment, 'string');
    });
  });

  suite('isDevelopment', () => {
    test('should return true if the current environment is development', () => {
      const isDev = isDevelopment();
      assert.ok(isDev);
      assert.equal(typeof isDev, 'boolean');
    });
  });

  suite('isProduction', () => {
    test('should return true if the current environment is production', () => {
      const currentNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const isProd = isProduction();
      assert.ok(isProd);
      assert.equal(typeof isProd, 'boolean');

      process.env.NODE_ENV = currentNodeEnv;
    });
  });
});
