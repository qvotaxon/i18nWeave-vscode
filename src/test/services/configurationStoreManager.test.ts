import * as assert from 'assert';
import * as vscode from 'vscode';
import sinon from 'sinon';
import ConfigurationStore from '../../services/configurationStore';
import ConfigurationStoreManager from '../../services/configurationStoreManager';

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

  suite('syncConfigurationStore', () => {
    test('should throw an error if configuration is not found', () => {
      getExtensionStub.returns(undefined);

      assert.throws(() => {
        configurationStoreManager['syncConfigurationStore']();
      }, Error('Configuration not found.'));
    });

    test('should correctly sync the configuration store', () => {
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
    // it('should throw an error if the specific configuration is not found', () => {
    //   const mockConfigStore = new ConfigurationStore(
    //     {}
    //   );
    //   configurationStoreManager['_configurationStore'] = mockConfigStore;
    //   assert.throws(() => {
    //     configurationStoreManager.getConfig('mockKey');
    //   }, 'Configuration for key "mockKey" not found.');
    // });
    // it('should return the specific configuration if found', () => {
    //   const mockConfigStore = new ConfigurationStore({
    //     mockKey: 'mockValue' as any,
    //   });
    //   configurationStoreManager['_configurationStore'] = mockConfigStore;
    //   assert.strictEqual(
    //     configurationStoreManager.getConfig('mockKey'),
    //     'mockValue'
    //   );
    // });
  });
});
