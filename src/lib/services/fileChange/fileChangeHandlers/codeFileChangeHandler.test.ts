import assert from 'assert';
import fs from 'fs';
import sinon from 'sinon';
import vscode, { Uri } from 'vscode';

import { ChainType } from '../../../enums/chainType';
import ModuleContext from '../../../interfaces/moduleContext';
import CodeTranslationStore from '../../../stores/codeTranslation/codeTranslationStore';
import CodeFileChangeHandler from './codeFileChangeHandler';

suite('CodeFileChangeHandler', () => {
  let handler: CodeFileChangeHandler;

  setup(() => {
    handler = CodeFileChangeHandler.create();
  });

  teardown(() => {
    sinon.restore();
  });

  suite('create', () => {
    test('should create an instance of CodeFileChangeHandler', () => {
      const instance = CodeFileChangeHandler.create();
      assert(instance instanceof CodeFileChangeHandler);
    });
  });

  suite('handleFileChangeAsync', () => {
    test('should not execute chain if changeFileLocation is undefined', async () => {
      const executeChainAsyncStub =
        // @ts-ignore - stubbing a private method
        (CodeFileChangeHandler.moduleChainManager.executeChainAsync =
          sinon.stub());

      await handler.handleFileChangeAsync();

      sinon.assert.notCalled(executeChainAsyncStub);
    });

    test('should execute chain if changeFileLocation is provided', async () => {
      const executeChainAsyncStub =
        // @ts-ignore - stubbing a private method
        (CodeFileChangeHandler.moduleChainManager.executeChainAsync =
          sinon.stub());

      sinon.stub(fs, 'existsSync').returns(true);
      sinon
        .stub(
          CodeTranslationStore.getInstance(),
          'fileChangeContainsTranslationFunctionsAsync'
        )
        .returns(Promise.resolve(true));

      const uri = vscode.Uri.file('path/to/file.ts');

      await handler.handleFileChangeAsync(uri);

      const expectedContext: ModuleContext = {
        inputPath: uri,
        locale: '',
        outputPath: uri,
      };

      sinon.assert.calledOnceWithExactly(
        executeChainAsyncStub,
        ChainType.Code,
        expectedContext
      );
    });

    test('should not execute chain if event is not triggered by a file deletion change and changeFileLocation does not contain translation keys', async () => {
      const executeChainAsyncStub =
        // @ts-ignore - stubbing a private method
        (CodeFileChangeHandler.moduleChainManager.executeChainAsync =
          sinon.stub());

      sinon
        .stub(
          CodeTranslationStore.getInstance(),
          'fileChangeContainsTranslationFunctionsAsync'
        )
        .returns(Promise.resolve(false));

      const uri = vscode.Uri.file('path/to/file.ts');

      await handler.handleFileChangeAsync(uri);

      sinon.assert.notCalled(executeChainAsyncStub);
    });

    test('should execute chain if event is triggered by a file deletion change and changeFileLocation does not contain translation keys', async () => {
      const executeChainAsyncStub =
        // @ts-ignore - stubbing a private method
        (CodeFileChangeHandler.moduleChainManager.executeChainAsync =
          sinon.stub());

      sinon
        .stub(
          CodeTranslationStore.getInstance(),
          'fileChangeContainsTranslationFunctionsAsync'
        )
        .returns(Promise.resolve(false));

      const uri = vscode.Uri.file('path/to/file.ts');

      await handler.handleFileChangeAsync(uri, true);

      const expectedContext: ModuleContext = {
        inputPath: uri,
        locale: '',
        outputPath: uri,
      };

      sinon.assert.calledOnceWithExactly(
        executeChainAsyncStub,
        ChainType.Code,
        expectedContext
      );
    });

    test('should execute chain if event is not triggered by a file deletion change and changeFileLocation contains translation keys', async () => {
      const executeChainAsyncStub =
        // @ts-ignore - stubbing a private method
        (CodeFileChangeHandler.moduleChainManager.executeChainAsync =
          sinon.stub());

      sinon
        .stub(
          CodeTranslationStore.getInstance(),
          'fileChangeContainsTranslationFunctionsAsync'
        )
        .returns(Promise.resolve(true));

      const uri = vscode.Uri.file('path/to/file.ts');
      sinon.stub(fs, 'existsSync').returns(true);

      await handler.handleFileChangeAsync(uri);

      const expectedContext: ModuleContext = {
        inputPath: uri,
        locale: '',
        outputPath: uri,
      };

      sinon.assert.calledOnceWithExactly(
        executeChainAsyncStub,
        ChainType.Code,
        expectedContext
      );
    });

    test('should execute chain if event is triggered by a file deletion change and changeFileLocation contains translation keys', async () => {
      const executeChainAsyncStub =
        // @ts-ignore - stubbing a private method
        (CodeFileChangeHandler.moduleChainManager.executeChainAsync =
          sinon.stub());

      sinon
        .stub(
          CodeTranslationStore.getInstance(),
          'fileChangeContainsTranslationFunctionsAsync'
        )
        .returns(Promise.resolve(true));

      const uri = vscode.Uri.file('path/to/file.ts');

      await handler.handleFileChangeAsync(uri, true);

      const expectedContext: ModuleContext = {
        inputPath: uri,
        locale: '',
        outputPath: uri,
      };

      sinon.assert.calledOnceWithExactly(
        executeChainAsyncStub,
        ChainType.Code,
        expectedContext
      );
    });
  });

  suite('handleFileDeletionAsync', () => {
    test('should handle file deletion and update store record', async () => {
      const uri = Uri.file('path/to/file.ts');
      const handleFileChangeAsyncStub = sinon.stub(
        handler,
        'handleFileChangeAsync'
      );
      const deleteStoreRecordStub = sinon.stub(
        CodeTranslationStore.getInstance(),
        'deleteStoreRecord'
      );

      await handler.handleFileDeletionAsync(uri);

      sinon.assert.calledOnceWithExactly(handleFileChangeAsyncStub, uri, true);
      sinon.assert.calledOnceWithExactly(deleteStoreRecordStub, uri.fsPath);
    });

    test('should not handle file deletion if changeFileLocation is undefined', async () => {
      const handleFileChangeAsyncStub = sinon.stub(
        handler,
        'handleFileChangeAsync'
      );
      const deleteStoreRecordStub = sinon.stub(
        CodeTranslationStore.getInstance(),
        'deleteStoreRecord'
      );

      await handler.handleFileDeletionAsync();

      sinon.assert.notCalled(handleFileChangeAsyncStub);
      sinon.assert.notCalled(deleteStoreRecordStub);
    });
  });
});
