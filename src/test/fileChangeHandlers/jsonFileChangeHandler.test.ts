import * as assert from 'assert';
import sinon from 'sinon';
import { ChainType } from '../../enums/chainType';
import JsonFileChangeHandler from '../../fileChangeHandlers/jsonFileChangeHandler';
import ModuleChainManager from '../../modules/moduleChainManager';
import ReadJsonFileModule from '../../modules/readJsonFile/readJsonFileModule';
import TranslationModule from '../../modules/translation/translationModule';
import { Uri } from 'vscode';
import FilePathProcessor from '../../services/filePathProcessor';

suite('JsonFileChangeHandler', () => {
  test('should initialize moduleChainManager and register chain', () => {
    const moduleChainManager = JsonFileChangeHandler.moduleChainManager;
    const registerChainSpy = sinon.spy(moduleChainManager, 'registerChain');
    const jsonFileChangeHandler = JsonFileChangeHandler.create();

    const expectedModuleChainManagerChains = {
      chains: {
        '0': {
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
      .stub(JsonFileChangeHandler.moduleChainManager, 'executeChain')
      .returns(Promise.resolve());

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

    processFilePathStub.restore();
    moduleChainManagerExecuteChainStub.restore();
  });
});
