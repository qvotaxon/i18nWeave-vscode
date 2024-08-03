import * as assert from 'assert';
import ReadJsonFileModule from 'lib/modules/readJsonFile/read-json-file-module';
import TranslationModule from 'lib/modules/translation/translation-module';
import sinon from 'sinon';
import vscode from 'vscode';
import { Uri } from 'vscode';

import { FileWatcherCreator } from '@i18n-weave/feature/feature-file-watcher-creator';
import { ModuleChainManager } from '@i18n-weave/feature/feature-module-chain-manager';

import { FileLockStore } from '@i18n-weave/store/store-file-lock-store';

import * as filePathUtilities from '@i18n-weave/util/util-file-path-utilities';
import { ChainType } from '@i18n-weave/util/util-enums';

import JsonFileChangeHandler from '../../../json-file-change-handler';

suite('JsonFileChangeHandler', () => {
  let extensionContext: vscode.ExtensionContext;

  setup(() => {
    extensionContext = {} as vscode.ExtensionContext;
  });

  test('should initialize moduleChainManager and register chain', () => {
    const moduleChainManager = JsonFileChangeHandler.moduleChainManager;
    const registerChainSpy = sinon.spy(moduleChainManager, 'registerChain');
    const jsonFileChangeHandler =
      JsonFileChangeHandler.create(extensionContext);

    const expectedModuleChainManagerChains = {
      chains: {
        [ChainType.Json]: {
          extensionContext: {},
          nextModule: {
            extensionContext: {},
            nextModule: {
              extensionContext: {},
              nextModule: null,
              temporarilyDisabled: true,
            },
          },
        },
      },
    };

    assert.equal(
      JSON.stringify(JsonFileChangeHandler.moduleChainManager),
      JSON.stringify(expectedModuleChainManagerChains)
    );
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
    const translationModuleSpy = sinon.spy(
      TranslationModule.prototype,
      'setNext'
    );

    const jsonFileChangeHandler =
      JsonFileChangeHandler.create(extensionContext);

    assert.ok(jsonFileChangeHandler instanceof JsonFileChangeHandler);
    assert.ok(
      JsonFileChangeHandler.moduleChainManager instanceof ModuleChainManager
    );
    assert.ok(readJsonFileModuleSpy.calledOnce);
    assert.ok(translationModuleSpy.calledOnce);
  });

  test('should handle file change asynchronously', async () => {
    const changeFileLocation = Uri.file('/path/to/changed/file.json');
    const extractedFileParts = {
      locale: 'en',
      outputPath: Uri.parse('/path/to/output'),
    };

    const extractFilePathPartsStub = sinon.stub(
      filePathUtilities,
      'extractFilePathParts'
    );
    extractFilePathPartsStub.returns(extractedFileParts);

    const fileWatcherCreatorCreateFileWatcherForFileStub = sinon.stub(
      FileWatcherCreator.prototype,
      'createFileWatcherForFile'
    );

    const moduleChainManagerExecuteChainStub = sinon
      .stub(JsonFileChangeHandler.moduleChainManager, 'executeChainAsync')
      .returns(Promise.resolve());

    const fileLockStoreAddStub = sinon.stub(FileLockStore.getInstance(), 'add');

    await JsonFileChangeHandler.create(extensionContext).handleFileChangeAsync(
      changeFileLocation
    );

    sinon.assert.calledOnceWithExactly(
      extractFilePathPartsStub,
      changeFileLocation.fsPath
    );

    sinon.assert.calledOnceWithExactly(
      moduleChainManagerExecuteChainStub,
      ChainType.Json,
      {
        inputPath: changeFileLocation,
        locale: extractedFileParts.locale,
        outputPath: extractedFileParts.outputPath,
      }
    );

    sinon.assert.calledOnceWithExactly(
      fileLockStoreAddStub,
      extractedFileParts.outputPath
    );

    sinon.assert.calledOnce(fileWatcherCreatorCreateFileWatcherForFileStub);

    extractFilePathPartsStub.restore();
    moduleChainManagerExecuteChainStub.restore();
    fileLockStoreAddStub.restore();
    fileWatcherCreatorCreateFileWatcherForFileStub.restore();
  });
});
