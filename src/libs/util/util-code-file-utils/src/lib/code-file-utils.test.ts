/* eslint-disable no-restricted-imports */
import * as assert from 'assert';
import * as sinon from 'sinon';

import {
  ConfigurationStoreManager,
  I18nextScannerModuleConfiguration,
} from '@i18n-weave/util/util-configuration';
import { LogLevel, Logger } from '@i18n-weave/util/util-logger';

import { extractTranslationKeys } from './code-file-utils';

suite('I18nextAst', () => {
  const extensionName = 'qvotaxon.i18nWeave';
  let config: I18nextScannerModuleConfiguration;

  ConfigurationStoreManager.getInstance().initialize(extensionName);

  setup(() => {
    config = {
      enabled: true,
      translationFilesLocation: 'src/i18n',
      codeFileLocations: ['src'],
      defaultNamespace: 'common',
      namespaces: ['common'],
      languages: ['en'],
      defaultLanguage: 'en',
      nsSeparator: ':',
      keySeparator: '.',
      pluralSeparator: '_',
      contextSeparator: '_',
      translationFunctionNames: ['t', 'i18next.t'],
      translationComponentTranslationKey: 'i18nKey',
      translationComponentName: 'Trans',
      fileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    } satisfies I18nextScannerModuleConfiguration;
  });

  teardown(() => {
    sinon.restore();
  });

  test('should extract translation keys from function calls', () => {
    const code = `
            const key1 = t('key1');
            const key2 = i18next.t('key2');
        `;
    const keys = extractTranslationKeys(code, config);
    assert.deepStrictEqual(keys, ['key1', 'key2']);
  });

  test('should extract translation keys from member expression calls', () => {
    const code = `
            const key1 = t('key1');
            const key2 = i18next.t('key2');
        `;
    const keys = extractTranslationKeys(code, config);
    assert.deepStrictEqual(keys, ['key1', 'key2']);
  });

  test('should extract translation keys from JSX components', () => {
    const code = `
            <Trans i18nKey="key1" />;
            <Trans i18nKey="key2" />;
        `;
    const keys = extractTranslationKeys(code, config);
    assert.deepStrictEqual(keys, ['key1', 'key2']);
  });

  test('should not extract keys from unrelated function calls', () => {
    const code = `
            const key1 = otherFunction('key1');
        `;
    const keys = extractTranslationKeys(code, config);
    assert.deepStrictEqual(keys, []);
  });

  test('should not extract keys from unrelated JSX components', () => {
    const code = `
            <OtherComponent i18nKey="key1" />;
        `;
    const keys = extractTranslationKeys(code, config);
    assert.deepStrictEqual(keys, []);
  });

  test('should return null for code with syntax errors', () => {
    const code = `
          const key1 = t('key1';
      `;
    const keys = extractTranslationKeys(code, config);
    assert.strictEqual(keys, null);
  });

  test('should log an error message for code with syntax errors', () => {
    const code = `
          const key1 = t('key1';
      `;
    const logSpy = sinon.spy(Logger.getInstance(), 'log');
    extractTranslationKeys(code, config);
    assert.ok(logSpy.calledOnce);
    assert.ok(
      logSpy.calledWith(LogLevel.VERBOSE, sinon.match.string, 'AST Parser')
    );
    logSpy.restore();
  });
});

