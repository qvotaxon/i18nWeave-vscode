import { I18nextScannerModuleConfiguration } from '@i18n-weave/util/util-configuration';
import * as promptUtilities from '@i18n-weave/util/util-prompt-utilities';

import assert from 'assert';
import sinon from 'sinon';
import vscode from 'vscode';

import * as configurationHandlers from './configuration-handlers';

suite('ConfigurationHandlers', () => {
  let sandbox: sinon.SinonSandbox;

  setup(() => {
    sandbox = sinon.createSandbox();
  });

  teardown(() => {
    sandbox.restore();
  });

  test('configureTranslationFilesLocationAsync should set translationFilesLocation', async () => {
    const config = new I18nextScannerModuleConfiguration();
    sandbox
      .stub(promptUtilities, 'promptForFolderAsync')
      .resolves('/path/to/translations');

    const result =
      await configurationHandlers.configureTranslationFilesLocationAsync(
        config
      );

    assert.strictEqual(result, true);
    assert.strictEqual(
      config.translationFilesLocation,
      '/path/to/translations'
    );
  });

  test('configureCodeFileLocationsAsync should set codeFileLocations', async () => {
    const config = new I18nextScannerModuleConfiguration();
    sandbox
      .stub(promptUtilities, 'promptForFoldersAsync')
      .resolves(['path/to/code']);

    const result =
      await configurationHandlers.configureCodeFileLocationsAsync(config);

    assert.strictEqual(result, true);
    assert.deepStrictEqual(config.codeFileLocations, ['path/to/code']);
  });

  test('configureCodeFileLocationsAsync should sanitizeLocations codeFileLocations', async () => {
    const config = new I18nextScannerModuleConfiguration();
    sandbox
      .stub(promptUtilities, 'promptForFoldersAsync')
      .resolves(['/path/to/code']);

    const result =
      await configurationHandlers.configureCodeFileLocationsAsync(config);

    assert.strictEqual(result, true);
    assert.deepStrictEqual(config.codeFileLocations, ['path/to/code']);
  });

  test('configureFileExtensionsAsync should set fileExtensions', async () => {
    const config = new I18nextScannerModuleConfiguration();
    sandbox.stub(vscode.window, 'showInputBox').resolves('ts, tsx, js, jsx');

    const result =
      await configurationHandlers.configureFileExtensionsAsync(config);

    assert.strictEqual(result, true);
    assert.deepStrictEqual(config.fileExtensions, ['ts', 'tsx', 'js', 'jsx']);
  });

  test('configureDefaultLanguageAsync should set defaultLanguage', async () => {
    const config = new I18nextScannerModuleConfiguration();
    sandbox.stub(vscode.window, 'showInputBox').resolves('en');

    const result =
      await configurationHandlers.configureDefaultLanguageAsync(config);

    assert.strictEqual(result, true);
    assert.strictEqual(config.defaultLanguage, 'en');
  });

  test('configureLanguagesAsync should set languages', async () => {
    const config = new I18nextScannerModuleConfiguration();
    sandbox.stub(vscode.window, 'showInputBox').resolves('en, fr, de');

    const result = await configurationHandlers.configureLanguagesAsync(config);

    assert.strictEqual(result, true);
    assert.deepStrictEqual(config.languages, ['en', 'fr', 'de']);
  });

  test('configureNamespacesAsync should set namespaces', async () => {
    const config = new I18nextScannerModuleConfiguration();
    sandbox.stub(vscode.window, 'showInputBox').resolves('common, auth');

    const result = await configurationHandlers.configureNamespacesAsync(config);

    assert.strictEqual(result, true);
    assert.deepStrictEqual(config.namespaces, ['common', 'auth']);
  });

  test('configureTranslationFunctionNamesAsync should set translationFunctionNames', async () => {
    const config = new I18nextScannerModuleConfiguration();
    sandbox.stub(vscode.window, 'showInputBox').resolves('t, i18next.t');

    const result =
      await configurationHandlers.configureTranslationFunctionNamesAsync(
        config
      );

    assert.strictEqual(result, true);
    assert.deepStrictEqual(config.translationFunctionNames, ['t', 'i18next.t']);
  });
});
