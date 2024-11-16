/* eslint-disable no-restricted-imports */
import assert from 'assert';
import { Uri } from 'vscode';

import {
  ActionModule,
  BaseModuleContext,
} from '@i18n-weave/module/module-base-action';

import { ChainType } from '@i18n-weave/util/util-enums';

import { ModuleChainManager } from './module-chain-manager';

suite('ModuleChainManager Tests', () => {
  let moduleChainManager: ModuleChainManager;

  setup(() => {
    moduleChainManager = new ModuleChainManager();
  });

  test('registerChain should register a module for a specific chain type', () => {
    const chainType = ChainType.Json;
    const actionModule: ActionModule = {
      executeAsync: async (_context: BaseModuleContext): Promise<void> => {},
      setNext: function (_module: ActionModule | null): void {
        throw new Error('Function not implemented.');
      },
    };

    moduleChainManager.registerChain(chainType, actionModule);

    const chain = moduleChainManager['chains'][chainType];
    assert.strictEqual(chain, actionModule);
  });

  test('executeChain should execute the module chain for a specific chain type', () => {
    const chainType = ChainType.Json;
    const baseModuleContext: BaseModuleContext = {
      inputPath: Uri.file(''),
      outputPath: Uri.file(''),
      locale: '',
    };
    let isExecuted = false;
    const actionModule: ActionModule = {
      executeAsync: async (context: BaseModuleContext): Promise<void> => {
        assert.strictEqual(context, baseModuleContext);
        isExecuted = true;
      },
      setNext: function (_module: ActionModule | null): void {
        throw new Error('Function not implemented.');
      },
    };
    moduleChainManager.registerChain(chainType, actionModule);

    moduleChainManager.executeChainAsync(chainType, baseModuleContext);

    assert.strictEqual(isExecuted, true);
  });

  test('executeChain should not execute the module chain if it is not registered', () => {
    const nonExistingChainType = 999 as ChainType;
    const baseModuleContext: BaseModuleContext = {
      inputPath: Uri.file(''),
      outputPath: Uri.file(''),
      locale: '',
    };
    let isExecuted = false;
    const actionModule: ActionModule = {
      executeAsync: async (_context: BaseModuleContext): Promise<void> => {
        isExecuted = true;
      },
      setNext: function (_module: ActionModule | null): void {
        throw new Error('Function not implemented.');
      },
    };
    moduleChainManager.registerChain(ChainType.Json, actionModule);

    moduleChainManager.executeChainAsync(
      nonExistingChainType,
      baseModuleContext
    );

    assert.strictEqual(isExecuted, false);
  });
});
