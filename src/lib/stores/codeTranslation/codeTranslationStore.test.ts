import assert from 'assert';
import fs from 'fs';
import sinon from 'sinon';
import { ExtensionContext, ProgressLocation, window } from 'vscode';

import FileReader from '../../services/fileIo/fileReader';
import { arraysEqual } from '../../utilities/arrayUtilities';
import ConfigurationStoreManager from '../configuration/configurationStoreManager';
import FileLocationStore from '../fileLocation/fileLocationStore';
import CodeTranslationStore from './codeTranslationStore';

suite('CodeTranslationStore', () => {
  let context: ExtensionContext;
  let codeTranslationStore: CodeTranslationStore;
  let readFileAsyncStub: sinon.SinonStub;
  let getConfigStub: sinon.SinonStub;
  let getFilesByTypeStub: sinon.SinonStub;
  let showErrorMessageStub: sinon.SinonStub;
  let updateStub: sinon.SinonStub;
  let globalStateUpdateStub: sinon.SinonStub;

  setup(() => {
    context = {
      globalState: { get: sinon.stub(), update: globalStateUpdateStub },
    } as any;
    codeTranslationStore = CodeTranslationStore.getInstance();
    readFileAsyncStub = sinon.stub(FileReader, 'readFileAsync');
    getConfigStub = sinon.stub(
      ConfigurationStoreManager.getInstance(),
      'getConfig'
    );
    getFilesByTypeStub = sinon.stub(
      FileLocationStore.getInstance(),
      'getFilesByType'
    );
    showErrorMessageStub = sinon.stub(window, 'showErrorMessage');
    updateStub = sinon.stub(codeTranslationStore, 'updateStoreRecordAsync');
  });

  teardown(() => {
    sinon.restore();
  });

  test.skip('should initialize code translations and update cache', async () => {
    const storedCache = new Map<string, any>();

    const fsPaths = ['path1', 'path2'];
    const stats = { mtime: new Date() };

    context.globalState.get('i18nWeave.translationFunctionCache');
    getFilesByTypeStub.returns(fsPaths);
    sinon.stub(fs, 'statSync').returns(stats as unknown as fs.Stats);
    readFileAsyncStub.resolves('fileContents');
    getConfigStub
      .withArgs('i18nextScannerModule')
      .returns({ fileExtensions: ['ts', 'tsx'] });

    await codeTranslationStore.initializeAsync(context);

    sinon.assert.calledOnce(getFilesByTypeStub);
    sinon.assert.calledWith(getFilesByTypeStub, ['ts', 'tsx']);
    sinon.assert.calledTwice(readFileAsyncStub);
    sinon.assert.calledWith(readFileAsyncStub.firstCall, 'path1');
    sinon.assert.calledWith(readFileAsyncStub.secondCall, 'path2');
    sinon.assert.calledTwice(updateStub);
    sinon.assert.calledWith(updateStub.firstCall, 'path1', stats.mtime);
    sinon.assert.calledWith(updateStub.secondCall, 'path2', stats.mtime);
    sinon.assert.calledOnce(globalStateUpdateStub);
    sinon.assert.calledWith(
      globalStateUpdateStub,
      'i18nWeave.translationFunctionCache',
      sinon.match.array
    );
  });

  test.skip('should handle error during initialization', async () => {
    const error = new Error('Initialization error');
    getFilesByTypeStub.throws(error);

    await codeTranslationStore.initializeAsync(context);

    sinon.assert.calledOnce(getFilesByTypeStub);
    sinon.assert.calledOnce(showErrorMessageStub);
    sinon.assert.calledWith(
      showErrorMessageStub,
      'Error initializing initial file contents'
    );
  });

  test.skip('should update store record and cache', async () => {
    const fsPath = 'path';
    const dateModified = new Date();
    const codeFileContents = 'fileContents';
    const translationFunctionNames = ['translate'];

    readFileAsyncStub.resolves(codeFileContents);
    sinon
      //@ts-ignore - stubbing private method
      .stub(codeTranslationStore, 'scanCodeFileForTranslationFunctionNames')
      //@ts-ignore - stubbing private method
      .returns(translationFunctionNames);

    await codeTranslationStore.updateStoreRecordAsync(fsPath, dateModified);

    sinon.assert.calledOnce(readFileAsyncStub);
    sinon.assert.calledWith(readFileAsyncStub, fsPath);
    sinon.assert.calledOnce(updateStub);
    sinon.assert.calledWith(updateStub, fsPath, dateModified);
    sinon.assert.calledOnce(globalStateUpdateStub);
    sinon.assert.calledWith(
      globalStateUpdateStub,
      'i18nWeave.translationFunctionCache',
      sinon.match.array
    );
  });

  test.skip('should check if file change contains translation functions', async () => {
    const fsPath = 'path';
    const codeFileContents = 'fileContents';
    const newTranslationFunctionNames = ['translate'];
    const currentTranslationFunctionNames = ['t'];

    readFileAsyncStub.resolves(codeFileContents);
    sinon
      //@ts-ignore - stubbing private method
      .stub(codeTranslationStore, 'scanCodeFileForTranslationFunctionNames')
      //@ts-ignore - stubbing private method
      .returns(newTranslationFunctionNames);

    const result =
      await codeTranslationStore.fileChangeContainsTranslationFunctionsAsync(
        fsPath
      );

    sinon.assert.calledOnce(readFileAsyncStub);
    sinon.assert.calledWith(readFileAsyncStub, fsPath);
    sinon.assert.calledOnce(
      //@ts-ignore - stubbing private method
      codeTranslationStore.scanCodeFileForTranslationFunctionNames
    );
    sinon.assert.calledWith(
      //@ts-ignore - stubbing private method
      codeTranslationStore.scanCodeFileForTranslationFunctionNames,
      codeFileContents
    );
    sinon.assert.notCalled(globalStateUpdateStub);
    assert.strictEqual(result, true);
  });

  test.skip('should return false if file change does not contain translation functions', async () => {
    const fsPath = 'path';
    const codeFileContents = 'fileContents';
    const newTranslationFunctionNames = ['translate'];
    const currentTranslationFunctionNames = ['translate'];
    // const globalStateUpdateStub = sinon.stub(context.globalState, 'update');

    readFileAsyncStub.resolves(codeFileContents);
    sinon
      //@ts-ignore - stubbing private method
      .stub(codeTranslationStore, 'scanCodeFileForTranslationFunctionNames')
      //@ts-ignore - stubbing private method
      .returns(newTranslationFunctionNames);
    sinon
      //@ts-ignore - stubbing private property
      .stub(codeTranslationStore._codeTranslations, 'get')
      //@ts-ignore - stubbing private property
      .returns({ translationFunctionNames: currentTranslationFunctionNames });

    const result =
      await codeTranslationStore.fileChangeContainsTranslationFunctionsAsync(
        fsPath
      );

    sinon.assert.calledOnce(readFileAsyncStub);
    sinon.assert.calledWith(readFileAsyncStub, fsPath);
    sinon.assert.calledOnce(
      //@ts-ignore - stubbing private method
      codeTranslationStore.scanCodeFileForTranslationFunctionNames
    );
    sinon.assert.calledWith(
      //@ts-ignore - stubbing private method
      codeTranslationStore.scanCodeFileForTranslationFunctionNames,
      codeFileContents
    );
    sinon.assert.notCalled(globalStateUpdateStub);
    assert.strictEqual(result, false);
  });
});
