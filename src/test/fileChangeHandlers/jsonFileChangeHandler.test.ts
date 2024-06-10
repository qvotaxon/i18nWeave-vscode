import * as assert from 'assert';
import sinon from 'sinon';
import { Uri } from 'vscode';

import { ChainType } from '../../enums/chainType';
import JsonFileChangeHandler from '../../fileChangeHandlers/jsonFileChangeHandler';
import ModuleChainManager from '../../modules/moduleChainManager';
import ReadJsonFileModule from '../../modules/readJsonFile/readJsonFileModule';
import TranslationModule from '../../modules/translation/translationModule';
import FileLockStoreStore from '../../services/fileLockStore';
import FilePathProcessor from '../../services/filePathProcessor';

suite('JsonFileChangeHandler', () => {
  let clock: sinon.SinonFakeTimers;

  setup(() => {
    clock = sinon.useFakeTimers();
  });

  teardown(() => {
    clock.restore();
  });

  test('should initialize moduleChainManager and register chain', () => {
    const moduleChainManager = JsonFileChangeHandler.moduleChainManager;
    const registerChainSpy = sinon.spy(moduleChainManager, 'registerChain');
    const jsonFileChangeHandler = JsonFileChangeHandler.create();

    const expectedModuleChainManagerChains = {
      chains: {
        [ChainType.Json]: {
          nextModule: {
            nextModule: { nextModule: null },
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
    const jsonFileChangeHandler = JsonFileChangeHandler.create();

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

    const jsonFileChangeHandler = JsonFileChangeHandler.create();

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

    const processFilePathStub = sinon
      .stub(FilePathProcessor, 'processFilePath')
      .returns(extractedFileParts);

    const moduleChainManagerExecuteChainStub = sinon
      .stub(JsonFileChangeHandler.moduleChainManager, 'executeChainAsync')
      .returns(Promise.resolve());

    const fileLockStoreAddStub = sinon.stub(
      FileLockStoreStore.getInstance(),
      'add'
    );

    const fileLockStoreDeleteStub = sinon.stub(
      FileLockStoreStore.getInstance(),
      'delete'
    );

    await JsonFileChangeHandler.create().handleFileChangeAsync(
      changeFileLocation
    );

    sinon.assert.calledOnceWithExactly(
      processFilePathStub,
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

    clock.tick(250);

    sinon.assert.calledOnceWithExactly(
      fileLockStoreDeleteStub,
      extractedFileParts.outputPath
    );

    processFilePathStub.restore();
    moduleChainManagerExecuteChainStub.restore();
    fileLockStoreAddStub.restore();
    fileLockStoreDeleteStub.restore();
  });
});
