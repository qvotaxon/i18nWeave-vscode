import * as assert from 'assert';
import * as vscode from 'vscode';
import ConfigurationStoreManager from '../../services/configurationStoreManager';
import TranslationModuleConfiguration from '../../entities/configuration/modules/translationModule/translationModuleConfiguration';

suite('configurationStoreManager Tests', () => {
  test('Initialize should update the options', async () => {
    let configurationStoreManager = new ConfigurationStoreManager();
    const configuration = vscode.workspace.getConfiguration('i18nWeave');

    const initialTranslationModuleEnabledValue = await configuration.get(
      'translationModule.enabled'
    );

    configurationStoreManager.Initialize();
    const optionsBefore = configurationStoreManager.GetConfigurationStore();

    await configuration.update(
      'translationModule.enabled',
      !initialTranslationModuleEnabledValue
    );
    const optionsAfter = configurationStoreManager.GetConfigurationStore();

    assert.notDeepStrictEqual(optionsBefore, optionsAfter);
  });

  test('Initialize should throw an error if configuration is not found', () => {
    let configurationStoreManager = new ConfigurationStoreManager();
    const originalGetExtension = vscode.extensions.getExtension;

    vscode.extensions.getExtension = () => undefined;

    assert.throws(
      () => {
        configurationStoreManager.Initialize();
      },
      Error,
      'Configuration not found.'
    );

    vscode.extensions.getExtension = originalGetExtension;
  });

  test('GetConfigurationStore should return the initialized ConfigurationStore if initialized', () => {
    let configurationStoreManager = new ConfigurationStoreManager();
    configurationStoreManager.Initialize();

    const configurationStore =
      configurationStoreManager.GetConfigurationStore();
    assert.ok(configurationStore);
  });

  test('GetConfigurationStore should throw an error if configuration store is not initialized', () => {
    let configurationStoreManager = new ConfigurationStoreManager();
    vscode.workspace
      .getConfiguration('i18nWeave')
      .update('translationModule.enabled', undefined);
    assert.throws(
      () => {
        configurationStoreManager.GetConfigurationStore();
      },
      Error,
      'Configuration Store not initialized.'
    );
  });

  test('Get should return the specified configuration', async () => {
    const configurationStoreManager = new ConfigurationStoreManager();
    configurationStoreManager.Initialize();

    const configurationKeys = [
      'translationModule.enabled',
      'translationModule.googleTranslate.enabled',
      'translationModule.deepL.enabled',
      'translationModule.deepL.apiKey',
      'translationModule.deepL.preserveFormatting',
      'translationModule.deepL.formality',
    ];

    const expectedConfiguration: { [key: string]: any } = {};

    for (const key of configurationKeys) {
      const value = await vscode.workspace
        .getConfiguration('i18nWeave')
        .get(key);
      expectedConfiguration[`i18nWeave.${key}`] = value;
    }

    const configurationKey = 'translationModule';
    const configuration =
      configurationStoreManager.Get<TranslationModuleConfiguration>(
        configurationKey
      );

    const expectedStore = {
      options: expectedConfiguration,
    };

    assert.ok(configuration);
    assert.deepEqual(configuration, expectedStore);
  });

  test('Get should throw an error if options are not initialized', () => {
    let configurationStoreManager = new ConfigurationStoreManager();
    assert.throws(
      () => {
        configurationStoreManager.Get<TranslationModuleConfiguration>(
          'translationModule'
        );
      },
      Error,
      'Configuration Store not initialized.'
    );
  });
});
