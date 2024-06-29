import assert from 'assert';
import sinon from 'sinon';

import * as nextI18nextConfigHandlers from './nextI18nextConfigHandlers';

suite('NextI18nextConfigHandlers', () => {
  let sandbox: sinon.SinonSandbox;

  setup(() => {
    sandbox = sinon.createSandbox();
  });

  teardown(() => {
    sandbox.restore();
  });

  test('scanNextI18nextConfigFileAsync should return config file path', async () => {
    const result =
      await nextI18nextConfigHandlers.scanNextI18nextConfigFileAsync();

    assert.strictEqual(result, '/path/to/next-i18next.config.js');
  });

  test('readNextI18nextConfigFileAsync should return parsed config', async () => {
    const configFilePath = '/path/to/next-i18next.config.js';

    const result =
      await nextI18nextConfigHandlers.readNextI18nextConfigFileAsync(
        configFilePath
      );

    assert.deepStrictEqual(result, {
      defaultLanguage: 'en',
      languages: ['en', 'fr'],
      namespaces: ['common'],
      fileExtensions: ['ts', 'tsx', 'js', 'jsx'],
      translationFunctionNames: ['t', 'i18next.t'],
    });
  });
});
