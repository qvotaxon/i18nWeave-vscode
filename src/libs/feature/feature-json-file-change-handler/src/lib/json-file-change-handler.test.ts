import * as assert from 'assert';
import sinon from 'sinon';
import vscode from 'vscode';

import { ReadJsonFileModule } from '@i18n-weave/module/module-read-json-file';

import { JsonFileChangeHandler } from '@i18n-weave/feature/feature-json-file-change-handler';
import { ModuleChainManager } from '@i18n-weave/feature/feature-module-chain-manager';

import { ChainType } from '@i18n-weave/util/util-enums';

suite('JsonFileChangeHandler', () => {
  let extensionContext: vscode.ExtensionContext;

  setup(() => {
    extensionContext = {} as vscode.ExtensionContext;
  });

  test('should initialize moduleChainManager and register chain', () => {
    // @ts-ignore - private property
    const moduleChainManager = JsonFileChangeHandler.moduleChainManager;
    const registerChainSpy = sinon.spy(moduleChainManager, 'registerChain');
    const jsonFileChangeHandler =
      JsonFileChangeHandler.create(extensionContext);

    // const expectedModuleChainManagerChains = {
    //   chains: {
    //     [ChainType.Json]: {
    //       extensionContext: {},
    //       nextModule: {
    //         extensionContext: {},
    //         nextModule: null,
    //       },
    //     },
    //   },
    // };

    // assert.equal(
    //   JSON.stringify(JsonFileChangeHandler.moduleChainManager),
    //   JSON.stringify(expectedModuleChainManagerChains)
    // );
    assert.ok(registerChainSpy.calledOnce);
    assert.ok(
      registerChainSpy.calledWithExactly(
        ChainType.Json,
        jsonFileChangeHandler.createJsonChain()
      )
    );
  });

  test('should set static module instances', () => {
    const jsonFileChangeHandler =
      JsonFileChangeHandler.create(extensionContext);

    assert.ok(jsonFileChangeHandler);
  });

  test('should create a new instance of JsonFileChangeHandler', () => {
    const readJsonFileModuleSpy = sinon.spy(
      ReadJsonFileModule.prototype,
      'setNext'
    );

    const jsonFileChangeHandler =
      JsonFileChangeHandler.create(extensionContext);

    assert.ok(jsonFileChangeHandler instanceof JsonFileChangeHandler);
    assert.ok(
      // @ts-ignore - private property
      JsonFileChangeHandler.moduleChainManager instanceof ModuleChainManager
    );
    assert.ok(readJsonFileModuleSpy.calledOnce);
  });
});
