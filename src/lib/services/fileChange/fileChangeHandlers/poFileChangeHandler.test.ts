import * as assert from 'assert';
import sinon from 'sinon';
import vscode from 'vscode';
import { Uri } from 'vscode';

import * as filePathUtilities from '../../../../libs/util/util-file-path-utilities/src/lib/file-path-utilities';
import { ChainType } from '../../../enums/chainType';
import ModuleChainManager from '../../../modules/moduleChainManager';
import ReadPoFileModule from '../../../modules/readPoFile/readPoFileModule';
import FileLockStoreStore from '../../../stores/fileLock/fileLockStore';
import FileWatcherCreator from '../fileWatcherCreator';
import PoFileChangeHandler from './poFileChangeHandler';

suite('PoFileChangeHandler', () => {
  let extensionContext: vscode.ExtensionContext;

  setup(() => {
    extensionContext = {} as vscode.ExtensionContext;
  });

  test('should initialize moduleChainManager and register chain', () => {
    const moduleChainManager = PoFileChangeHandler.moduleChainManager;
    const registerChainSpy = sinon.spy(moduleChainManager, 'registerChain');
    const poFileChangeHandler = PoFileChangeHandler.create(extensionContext);

    const expectedModuleChainManagerChains = {
      chains: {
        [ChainType.Po]: {
          extensionContext: {},
          nextModule: {
            extensionContext: {},
            nextModule: null,
            temporarilyDisabled: true,
          },
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
    const poFileChangeHandler = PoFileChangeHandler.create(extensionContext);

    assert.ok(poFileChangeHandler);
  });

  test('should create a new instance of PoFileChangeHandler', () => {
    const readPoFileModuleSpy = sinon.spy(
      ReadPoFileModule.prototype,
      'setNext'
    );

    const poFileChangeHandler = PoFileChangeHandler.create(extensionContext);

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
      .stub(PoFileChangeHandler.moduleChainManager, 'executeChainAsync')
      .returns(Promise.resolve());

    const fileLockStoreAddStub = sinon.stub(
      FileLockStoreStore.getInstance(),
      'add'
    );

    await PoFileChangeHandler.create(extensionContext).handleFileChangeAsync(
      changeFileLocation
    );

    sinon.assert.calledOnceWithExactly(
      extractFilePathPartsStub,
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

    extractFilePathPartsStub.restore();
    moduleChainManagerExecuteChainStub.restore();
    fileLockStoreAddStub.restore();
    fileWatcherCreatorCreateFileWatcherForFileStub.restore();
  });
});
