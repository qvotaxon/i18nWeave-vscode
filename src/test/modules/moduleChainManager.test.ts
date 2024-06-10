import assert from 'assert';
import { ChainType } from '../../enums/chainType';
import ActionModule from '../../interfaces/actionModule';
import ModuleContext from '../../interfaces/moduleContext';
import ModuleChainManager from '../../modules/moduleChainManager';
import { Uri } from 'vscode';

suite('ModuleChainManager Tests', () => {
  let moduleChainManager: ModuleChainManager;

  setup(() => {
    moduleChainManager = new ModuleChainManager();
  });

  test('registerChain should register a module for a specific chain type', () => {
    const chainType = ChainType.Json;
    const actionModule: ActionModule = {
      executeAsync: async (context: ModuleContext): Promise<void> => {},
      setNext: function (module: ActionModule | null): void {
        throw new Error('Function not implemented.');
      },
    };

    moduleChainManager.registerChain(chainType, actionModule);

    const chain = moduleChainManager['chains'][chainType];
    assert.strictEqual(chain, actionModule);
  });

  test('executeChain should execute the module chain for a specific chain type', () => {
    const chainType = ChainType.Json;
    const moduleContext: ModuleContext = {
      inputPath: Uri.file(''),
      outputPath: Uri.file(''),
      locale: '',
    };
    let isExecuted = false;
    const actionModule: ActionModule = {
      executeAsync: async (context: ModuleContext): Promise<void> => {
        assert.strictEqual(context, moduleContext);
        isExecuted = true;
      },
      setNext: function (module: ActionModule | null): void {
        throw new Error('Function not implemented.');
      },
    };
    moduleChainManager.registerChain(chainType, actionModule);

    moduleChainManager.executeChainAsync(chainType, moduleContext);

    assert.strictEqual(isExecuted, true);
  });

  test('executeChain should not execute the module chain if it is not registered', () => {
    const nonExistingChainType = 999 as ChainType;
    const moduleContext: ModuleContext = {
      inputPath: Uri.file(''),
      outputPath: Uri.file(''),
      locale: '',
    };
    let isExecuted = false;
    const actionModule: ActionModule = {
      executeAsync: async (context: ModuleContext): Promise<void> => {
        isExecuted = true;
      },
      setNext: function (module: ActionModule | null): void {
        throw new Error('Function not implemented.');
      },
    };
    moduleChainManager.registerChain(ChainType.Json, actionModule);

    moduleChainManager.executeChainAsync(nonExistingChainType, moduleContext);

    assert.strictEqual(isExecuted, false);
  });
});
