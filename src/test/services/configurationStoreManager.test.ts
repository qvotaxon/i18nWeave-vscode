import * as assert from 'assert';
import * as vscode from 'vscode';
import ConfigurationStoreManager from '../../services/configurationStoreManager';
import ExtensionConfiguration from '../../entities/configuration/extensionConfiguration';
import ConfigurationStore from '../../services/configurationStore';

suite('ConfigurationStoreManager Tests', () => {
  let configurationStoreManager: ConfigurationStoreManager;

  setup(() => {
    configurationStoreManager = new ConfigurationStoreManager();
  });

  //deze onderstaande test is useless volgens mij.
  //   test('Initialize should subscribe to configuration changes', () => {
  //     let eventHandlerCalled = false;

  //     // Mock the workspace.onDidChangeConfiguration method
  //     vscode.workspace.onDidChangeConfiguration(() => {
  //       eventHandlerCalled = true;
  //     });

  //     configurationStoreManager.Initialize();

  //     vscode.workspace
  //       .getConfiguration('i18nWeave.translationModule')
  //       .update('enabled', true);

  //     assert.strictEqual(eventHandlerCalled, true);
  //   });

  test.skip('syncConfigurationStore should update the options based on the current workspace configuration', () => {
    //implement this test
  });

  test('getConfigurationStore should throw an error if the options are not initialized', () => {
    assert.throws(() => {
      configurationStoreManager.getConfigurationStore();
    }, Error);
  });

  test('getConfig should throw an error if the configuration for the key is not found', () => {
    // Mock the configuration store
    const configurationStore = new ConfigurationStore<ExtensionConfiguration>(
      {}
    );

    // Mock the getConfigurationStore method
    configurationStoreManager.getConfigurationStore = () => configurationStore;

    assert.throws(() => {
      configurationStoreManager.getConfig(
        'nonexistentConfig' as keyof ExtensionConfiguration
      );
    }, Error);
  });
});
