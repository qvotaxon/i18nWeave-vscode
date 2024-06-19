import * as assert from 'assert';
import sinon from 'sinon';
import * as vscode from 'vscode';

import ExtensionConfiguration from '../../lib/entities/configuration/extensionConfiguration';
import TranslationModuleConfiguration from '../../lib/entities/configuration/modules/translationModule/translationModuleConfiguration';
import ConfigurationStore from '../../lib/stores/configuration/configurationStore';
import ConfigurationStoreManager from '../../lib/stores/configuration/configurationStoreManager';

suite('ConfigurationStoreManager', () => {
  let getConfigurationStub: sinon.SinonStub;
  let getExtensionStub: sinon.SinonStub;
  let onDidChangeConfigurationStub: sinon.SinonStub;

  setup(() => {
    getConfigurationStub = sinon.stub(vscode.workspace, 'getConfiguration');
    getExtensionStub = sinon.stub(vscode.extensions, 'getExtension');
    onDidChangeConfigurationStub = sinon.stub(
      vscode.workspace,
      'onDidChangeConfiguration'
    );
  });

  teardown(() => {
    sinon.restore();
  });

  suite('initialize', () => {
    test('should call syncConfigurationStore and subscribe to configuration changes', () => {
      const syncConfigurationStoreStub = sinon.stub(
        ConfigurationStoreManager.getInstance(),
        'syncConfigurationStore'
      );

      ConfigurationStoreManager.getInstance().initialize();

      sinon.assert.calledOnce(syncConfigurationStoreStub);
      sinon.assert.calledOnce(onDidChangeConfigurationStub);
    });
  });

  suite('syncConfigurationStore', () => {
    setup(() => {
      const mockConfig = {
        id: 'translationModule',
        properties: {
          'i18nWeave.translationModule.enabled': { default: true },
        },
      };
      const mockContributes = {
        contributes: {
          configuration: [mockConfig],
        },
      };
      getExtensionStub.returns({ packageJSON: mockContributes });
    });

    test('should throw an error if configuration is not found', () => {
      getExtensionStub.returns(undefined);

      assert.throws(() => {
        ConfigurationStoreManager.getInstance()['syncConfigurationStore']();
      }, /Configuration not found./);
    });

    test('should throw an error if configuration value is missing', () => {
      const getMockConfig = { get: sinon.stub().returns(undefined) };
      getConfigurationStub.returns(getMockConfig);

      const mockConfig = {
        id: 'translationModule',
        properties: {
          'i18nWeave.translationModule.enabled': { default: undefined },
        },
      };
      const mockContributes = {
        contributes: {
          configuration: [mockConfig],
        },
      };
      getExtensionStub.returns({ packageJSON: mockContributes });

      assert.throws(() => {
        ConfigurationStoreManager.getInstance()['syncConfigurationStore']();
      }, /Configuration value not found for key: i18nWeave.translationModule.enabled/);
    });

    test('should correctly sync the configuration store', () => {
      const getMockConfig = { get: sinon.stub().returns('configValue') };
      getConfigurationStub.returns(getMockConfig);

      ConfigurationStoreManager.getInstance()['syncConfigurationStore']();

      const options = { translationModule: { enabled: 'configValue' } };
      const expectedConfigStore = new ConfigurationStore(options as any);
      assert.deepEqual(
        ConfigurationStoreManager.getInstance().getConfigurationStore(),
        expectedConfigStore
      );
    });
  });

  suite('setNestedProperty', () => {
    test('should set a nested property value in an object', () => {
      const obj: any = {};
      const key = 'level1.level2.level3';
      const value = 'testValue';

      ConfigurationStoreManager.getInstance()['setNestedProperty'](
        obj,
        key,
        value
      );

      assert.deepEqual(obj, {
        level1: {
          level2: {
            level3: 'testValue',
          },
        },
      });
    });
  });

  suite('getConfigurationStore', () => {
    let mockConfigStore: ConfigurationStore;

    setup(() => {
      mockConfigStore = new ConfigurationStore({});
      ConfigurationStoreManager.getInstance()['_configurationStore'] =
        mockConfigStore;
    });

    test('should throw an error if configuration store is not initialized', () => {
      ConfigurationStoreManager.getInstance()['_configurationStore'] =
        undefined;

      assert.throws(() => {
        ConfigurationStoreManager.getInstance().getConfigurationStore();
      }, /Configuration Store not initialized./);
    });

    test('should return the configuration store if initialized', () => {
      assert.strictEqual(
        ConfigurationStoreManager.getInstance().getConfigurationStore(),
        mockConfigStore
      );
    });
  });

  suite('getConfig', () => {
    test('should throw an error if configuration for key is not found', () => {
      const mockConfigStore = new ConfigurationStore({});
      ConfigurationStoreManager.getInstance()['_configurationStore'] =
        mockConfigStore;

      assert.throws(() => {
        ConfigurationStoreManager.getInstance().getConfig(
          'nonExistentKey' as keyof ExtensionConfiguration
        );
      }, /Configuration for key "nonExistentKey" not found./);
    });

    test('should return the configuration for the specified key', () => {
      const translationModuleConfiguration =
        new TranslationModuleConfiguration();
      translationModuleConfiguration.enabled = true;

      const mockConfigStore = new ConfigurationStore({
        translationModule: translationModuleConfiguration,
      });
      ConfigurationStoreManager.getInstance()['_configurationStore'] =
        mockConfigStore;

      const result =
        ConfigurationStoreManager.getInstance().getConfig<TranslationModuleConfiguration>(
          'translationModule'
        );
      assert.strictEqual(result, translationModuleConfiguration);
    });
  });
});
