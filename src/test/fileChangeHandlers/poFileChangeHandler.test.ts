import * as assert from 'assert';
import sinon from 'sinon';
import { Uri } from 'vscode';

import { ChainType } from '../../enums/chainType';
import PoFileChangeHandler from '../../fileChangeHandlers/poFileChangeHandler';
import ModuleChainManager from '../../modules/moduleChainManager';
import ReadPoFileModule from '../../modules/readPoFile/readPoFileModule';
import FileLockStoreStore from '../../services/fileLockStore';
import FilePathProcessor from '../../services/filePathProcessor';
import FileWatcherCreator from '../../services/fileWatcherCreator';

suite('PoFileChangeHandler', () => {
  test('should initialize moduleChainManager and register chain', () => {
    const moduleChainManager = PoFileChangeHandler.moduleChainManager;
    const registerChainSpy = sinon.spy(moduleChainManager, 'registerChain');
    const poFileChangeHandler = PoFileChangeHandler.create();

    const expectedModuleChainManagerChains = {
      chains: {
        [ChainType.Po]: {
          nextModule: { nextModule: null },
        },
      },
    };

    assert.equal(
      JSON.stringify(PoFileChangeHandler.moduleChainManager),
      JSON.stringify(expectedModuleChainManagerChains)
    );
    assert.ok(registerChainSpy.calledOnce);
    assert.ok(
      registerChainSpy.calledWithExactly(
        ChainType.Po,
        poFileChangeHandler.createPoChain()
      )
    );
  });

  test('should set static module instances', () => {
    const poFileChangeHandler = PoFileChangeHandler.create();

    assert.ok(poFileChangeHandler);
  });

  test('should create a new instance of PoFileChangeHandler', () => {
    const readPoFileModuleSpy = sinon.spy(
      ReadPoFileModule.prototype,
      'setNext'
    );

    const poFileChangeHandler = PoFileChangeHandler.create();

    assert.ok(poFileChangeHandler instanceof PoFileChangeHandler);
    assert.ok(
      PoFileChangeHandler.moduleChainManager instanceof ModuleChainManager
    );
    assert.ok(readPoFileModuleSpy.calledOnce);
  });

  test('should handle file change asynchronously', async () => {
    const changeFileLocation = Uri.file('/path/to/changed/file.po');
    const extractedFileParts = {
      locale: 'en',
      outputPath: Uri.parse('/path/to/output'),
    };

    const processFilePathStub = sinon
      .stub(FilePathProcessor, 'processFilePath')
      .returns(extractedFileParts);

    const fileWatcherCreatorCreateFileWatcherForFileStub = sinon.stub(
      FileWatcherCreator.prototype,
      'createFileWatcherForFile'
    );

    const moduleChainManagerExecuteChainStub = sinon
      .stub(PoFileChangeHandler.moduleChainManager, 'executeChainAsync')
      .returns(Promise.resolve());

    const fileLockStoreAddStub = sinon.stub(
      FileLockStoreStore.getInstance(),
      'add'
    );

    await PoFileChangeHandler.create().handleFileChangeAsync(
      changeFileLocation
    );

    sinon.assert.calledOnceWithExactly(
      processFilePathStub,
      changeFileLocation.fsPath
    );

    sinon.assert.calledOnceWithExactly(
      moduleChainManagerExecuteChainStub,
      ChainType.Po,
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

    processFilePathStub.restore();
    moduleChainManagerExecuteChainStub.restore();
    fileLockStoreAddStub.restore();
    fileWatcherCreatorCreateFileWatcherForFileStub.restore();
  });
});
