import * as assert from 'assert';
import * as vscode from 'vscode';
import sinon from 'sinon';
import ConfigurationStore from '../../services/configurationStore';
import ConfigurationStoreManager from '../../services/configurationStoreManager';
import ExtensionConfiguration from '../../entities/configuration/extensionConfiguration';
import TranslationModuleConfiguration from '../../entities/configuration/modules/translationModule/translationModuleConfiguration';

suite('ConfigurationStoreManager', () => {
  let configurationStoreManager: ConfigurationStoreManager;
  let getConfigurationStub: sinon.SinonStub;
  let getExtensionStub: sinon.SinonStub;
  let onDidChangeConfigurationStub: sinon.SinonStub;

  setup(() => {
    configurationStoreManager = new ConfigurationStoreManager();
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

  suite('Initialize', () => {
    test('should call syncConfigurationStore and subscribe to configuration changes', () => {
      const mockConfig = {
        id: 'translationModule',
        properties: {
          i18nWeave: {
            translationModule: {
              enabled: true,
            },
          },
        },
      };
      const mockContributes = {
        contributes: {
          configuration: [mockConfig],
        },
      };
      getExtensionStub.returns({ packageJSON: mockContributes });

      const getMockConfig = {
        get: sinon.stub().returns('configValue'),
      };
      getConfigurationStub.returns(getMockConfig);

      configurationStoreManager.Initialize();

      sinon.assert.calledOnce(onDidChangeConfigurationStub);
    });
  });

  suite('syncConfigurationStore', () => {
    setup(() => {
      const mockConfig = {
        id: 'translationModule',
        properties: {
          i18nWeave: {
            translationModule: {
              enabled: true,
            },
          },
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
        configurationStoreManager['syncConfigurationStore']();
      }, Error('Configuration not found.'));
    });

    test('should throw an error if configuration value is missing', () => {
      const getMockConfig = {
        get: sinon.stub().returns(undefined),
      };
      getConfigurationStub.returns(getMockConfig);

      assert.throws(() => {
        configurationStoreManager['syncConfigurationStore']();
      }, Error('Configuration value not found for key: i18nWeave'));
    });

    test('should correctly sync the configuration store', () => {
      const getMockConfig = {
        get: sinon.stub().returns('configValue'),
      };
      getConfigurationStub.returns(getMockConfig);

      configurationStoreManager['syncConfigurationStore']();

      const options = { translationModule: { i18nWeave: 'configValue' } };
      const expectedConfigStore = new ConfigurationStore(options as any);
      assert.deepEqual(
        configurationStoreManager.getConfigurationStore(),
        expectedConfigStore
      );
    });
  });

  suite('setNestedProperty', () => {
    test('should set a nested property value in an object', () => {
      const obj: any = {};
      const key = 'level1.level2.level3';
      const value = 'testValue';

      configurationStoreManager['setNestedProperty'](obj, key, value);

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
    test('should throw an error if configuration store is not initialized', () => {
      assert.throws(() => {
        configurationStoreManager.getConfigurationStore();
      }, Error('Configuration Store not initialized.'));
    });

    test('should return the configuration store if initialized', () => {
      const mockConfigStore = new ConfigurationStore({});
      configurationStoreManager['_configurationStore'] = mockConfigStore;

      assert.strictEqual(
        configurationStoreManager.getConfigurationStore(),
        mockConfigStore
      );
    });
  });

  suite('getConfig', () => {
    test('should throw an error if configuration for key is not found', () => {
      const mockConfigStore = new ConfigurationStore({});
      configurationStoreManager['_configurationStore'] = mockConfigStore;

      assert.throws(() => {
        configurationStoreManager.getConfig(
          'nonExistentKey' as keyof ExtensionConfiguration
        );
      }, Error('Configuration for key "nonExistentKey" not found.'));
    });

    test('should return the configuration for the specified key', () => {
      const translationModuleConfiguration =
        new TranslationModuleConfiguration();
      translationModuleConfiguration.enabled = true;

      const mockConfigStore = new ConfigurationStore({
        translationModule: translationModuleConfiguration,
      });
      configurationStoreManager['_configurationStore'] = mockConfigStore;

      const result =
        configurationStoreManager.getConfig<string>('translationModule');
      assert.strictEqual(result, translationModuleConfiguration);
    });
  });
});
