import assert from 'assert';
import fs from 'fs';
import CodeTranslationStore from 'lib/stores/codeTranslation/codeTranslationStore';
import sinon from 'sinon';
import vscode, { Uri } from 'vscode';

import { BaseModuleContext } from '@i18n-weave/module/module-base-action';

import { ChainType } from '@i18n-weave/util/util-enums';

import CodeFileChangeHandler from 'libs/feature/code-file-change-handler';

suite('CodeFileChangeHandler', () => {
  let extensionContext: vscode.ExtensionContext;
  let handler: CodeFileChangeHandler;

  setup(() => {
    extensionContext = {} as vscode.ExtensionContext;
    handler = CodeFileChangeHandler.create(extensionContext);
  });

  teardown(() => {
    sinon.restore();
  });

  suite('create', () => {
    test('should create an instance of CodeFileChangeHandler', () => {
      const instance = CodeFileChangeHandler.create(extensionContext);
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

      const expectedContext: BaseModuleContext = {
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

      const expectedContext: BaseModuleContext = {
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

      const expectedContext: BaseModuleContext = {
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

      const expectedContext: BaseModuleContext = {
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
