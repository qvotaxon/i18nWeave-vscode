import * as assert from 'assert';

import { ConfigurationStore } from './configuration-store';

suite('ConfigurationStore Tests', () => {
  test('get should return the value associated with the given key', () => {
    const store = new ConfigurationStore({
      debugging: {
        logging: {
          enableVerboseLogging: true,
        },
      },
    });

    const result = store.get('debugging')?.logging.enableVerboseLogging;

    assert.ok(result);
  });

  test('get should return undefined if the key does not exist', () => {
    const store = new ConfigurationStore({
      debugging: {
        logging: {
          enableVerboseLogging: false,
        },
      },
    });

    const result = store.get('baz' as any);

    assert.strictEqual(result, undefined);
  });

  test('set should update the value associated with the given key', async () => {
    const store = new ConfigurationStore({
      debugging: {
        logging: {
          enableVerboseLogging: false,
        },
      },
    });

    await store.setAsync('debugging', {
      logging: {
        enableVerboseLogging: true,
      },
    });

    const result = store.get('debugging')?.logging.enableVerboseLogging;
    assert.strictEqual(result, true);
  });

  test('update should merge the given options with the existing options', () => {
    const store = new ConfigurationStore({
      debugging: {
        logging: {
          enableVerboseLogging: false,
        },
      },
      translationModule: {
        deepL: {
          apiKey: 'apiKey',
          enabled: true,
          formality: 'default',
          preserveFormatting: false,
        },
        googleTranslate: {
          enabled: false,
        },
      },
    });

    store.update({
      debugging: {
        logging: {
          enableVerboseLogging: true,
        },
      },
    });

    const result1 = store.get('debugging')?.logging.enableVerboseLogging;
    const result2 = store.get('translationModule')?.deepL.apiKey;
    assert.ok(result1);
    assert.strictEqual(result2, 'apiKey');
  });
});
