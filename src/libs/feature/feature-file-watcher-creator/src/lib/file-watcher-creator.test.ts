import { FileWatcherCreator } from '@i18n-weave/feature/feature-file-watcher-creator';
import { FileLockStore } from '@i18n-weave/store/store-file-lock-store';
import { FileType } from '@i18n-weave/util/util-enums';
import * as assert from 'assert';
import FileChangeHandlerFactory from 'lib/services/fileChange/fileChangeHandlerFactory';
import { FileSearchLocation } from 'lib/types/fileSearchLocation';
import sinon from 'sinon';
import * as vscode from 'vscode';

suite('FileWatcherCreator', () => {
  let extensionContext: vscode.ExtensionContext;
  let fileWatcherCreator: FileWatcherCreator;
  let findFilesStub: sinon.SinonStub;
  let createFileSystemWatcherStub: sinon.SinonStub;
  let hasFileLockStub: sinon.SinonStub;
  let handleFileChangeAsyncStub: sinon.SinonStub;

  setup(() => {
    extensionContext = {} as vscode.ExtensionContext;
    fileWatcherCreator = new FileWatcherCreator();
    findFilesStub = sinon.stub(vscode.workspace, 'findFiles');
    createFileSystemWatcherStub = sinon.stub(
      vscode.workspace,
      'createFileSystemWatcher'
    );
    hasFileLockStub = sinon.stub(FileLockStore.getInstance(), 'hasFileLock');
    handleFileChangeAsyncStub = sinon.stub().resolves();
    sinon
      .stub(FileChangeHandlerFactory.prototype, 'createFileChangeHandler')
      .returns({
        handleFileChangeAsync: handleFileChangeAsyncStub,
        handleFileDeletionAsync: sinon.stub().resolves(),
        handleFileCreationAsync: function (
          changeFileLocation: vscode.Uri
        ): Promise<void> {
          throw new Error('Function not implemented.');
        },
      });
  });

  teardown(() => {
    sinon.restore();
  });

  suite('createFileWatchersForFilesMatchingGlobAsync', () => {
    test('should create file watchers for files matching the specified glob pattern', async () => {
      const mockUri = vscode.Uri.parse('file:///path/to/file.ts');

      const mockFileWatcher = {
        onDidCreate: (callback: (uri: vscode.Uri) => Promise<void>) => {
          callback(mockUri);
        },
        onDidDelete: (callback: (uri: vscode.Uri) => Promise<void>) => {
          callback(mockUri);
        },
        onDidChange: sinon.stub(),
      } as any;
      createFileSystemWatcherStub.returns(mockFileWatcher);
      hasFileLockStub.returns(false);

      const fileWatchers =
        await fileWatcherCreator.createFileWatchersForFileTypeAsync(
          FileType.Code,
          { filePattern: mockUri.fsPath } as FileSearchLocation,
          extensionContext
        );

      assert.strictEqual(fileWatchers.length, 1);
      assert.strictEqual(fileWatchers[0], mockFileWatcher);
      sinon.assert.calledOnce(createFileSystemWatcherStub);
      sinon.assert.calledOnce(mockFileWatcher.onDidChange);
    });

    test('should handle file change when not disabled and file lock does not exist', async () => {
      const mockUri = vscode.Uri.parse('file:///path/to/file.ts');
      const mockFileWatcher = {
        onDidCreate: (callback: (uri: vscode.Uri) => Promise<void>) => {
          callback(mockUri);
        },
        onDidDelete: (callback: (uri: vscode.Uri) => Promise<void>) => {
          callback(mockUri);
        },
        onDidChange: (callback: (uri: vscode.Uri) => Promise<void>) => {
          callback(mockUri);
        },
      } as unknown as vscode.FileSystemWatcher;
      createFileSystemWatcherStub.returns(mockFileWatcher);
      hasFileLockStub.returns(false);

      await fileWatcherCreator.createFileWatchersForFileTypeAsync(
        FileType.Code,
        { filePattern: mockUri.fsPath } as FileSearchLocation,
        extensionContext
      );

      sinon.assert.calledOnce(handleFileChangeAsyncStub);
    });

    test('should not handle file change when disabled', async () => {
      const mockUri = { fsPath: 'path/to/file' } as vscode.Uri;
      findFilesStub.resolves([mockUri]);
      const mockFileWatcher = {
        onDidCreate: (callback: (uri: vscode.Uri) => Promise<void>) => {
          callback(mockUri);
        },
        onDidDelete: (callback: (uri: vscode.Uri) => Promise<void>) => {
          callback(mockUri);
        },
        onDidChange: (callback: (uri: vscode.Uri) => Promise<void>) => {
          callback(mockUri);
        },
      } as unknown as vscode.FileSystemWatcher;
      createFileSystemWatcherStub.returns(mockFileWatcher);
      hasFileLockStub.returns(false);

      await fileWatcherCreator.createFileWatchersForFileTypeAsync(
        FileType.Code,
        { filePattern: mockUri.fsPath } as FileSearchLocation,
        extensionContext,
        () => true
      );

      sinon.assert.notCalled(handleFileChangeAsyncStub);
    });
  });

  suite('createFileWatcherForFile', () => {
    test('should create a file watcher for the specified pattern', () => {
      const mockUri = { fsPath: 'path/to/file' } as vscode.Uri;
      const mockFileWatcher = {
        onDidChange: (callback: (uri: vscode.Uri) => Promise<void>) => {
          callback(mockUri);
        },
      } as unknown as vscode.FileSystemWatcher;
      createFileSystemWatcherStub.returns(mockFileWatcher);

      const pattern = '**/*.ts';
      const onDidChange = sinon.stub();
      const fileWatcher = fileWatcherCreator.createFileWatcherForFile(
        pattern,
        onDidChange
      );

      assert.ok(fileWatcher);
      assert.ok(createFileSystemWatcherStub.calledOnceWith(pattern));
    });
  });
});
