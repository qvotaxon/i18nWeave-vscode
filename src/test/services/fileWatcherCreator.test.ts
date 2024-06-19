import * as assert from 'assert';
import sinon from 'sinon';
import * as vscode from 'vscode';

import FileChangeHandlerFactory from '../../lib/services/fileChange/fileChangeHandlerFactory';
import FileWatcherCreator from '../../lib/services/fileChange/fileWatcherCreator';
import FileLockStoreStore from '../../lib/stores/fileLock/fileLockStore';

suite('FileWatcherCreator', () => {
  let fileWatcherCreator: FileWatcherCreator;
  let findFilesStub: sinon.SinonStub;
  let createFileSystemWatcherStub: sinon.SinonStub;
  let hasFileLockStub: sinon.SinonStub;
  let handleFileChangeAsyncStub: sinon.SinonStub;

  setup(() => {
    fileWatcherCreator = new FileWatcherCreator();
    findFilesStub = sinon.stub(vscode.workspace, 'findFiles');
    createFileSystemWatcherStub = sinon.stub(
      vscode.workspace,
      'createFileSystemWatcher'
    );
    hasFileLockStub = sinon.stub(
      FileLockStoreStore.getInstance(),
      'hasFileLock'
    );
    handleFileChangeAsyncStub = sinon.stub().resolves();
    sinon
      .stub(FileChangeHandlerFactory.prototype, 'createFileChangeHandler')
      .returns({
        handleFileChangeAsync: handleFileChangeAsyncStub,
      });
  });

  teardown(() => {
    sinon.restore();
  });

  suite('createFileWatchersForFilesMatchingGlobAsync', () => {
    test('should create file watchers for files matching the specified glob pattern', async () => {
      const mockUri = { fsPath: 'path/to/file' } as vscode.Uri;
      findFilesStub.resolves([mockUri]);
      const mockFileWatcher = {
        onDidChange: sinon.stub(),
      } as any;
      createFileSystemWatcherStub.returns(mockFileWatcher);
      hasFileLockStub.returns(false);

      const fileWatchers =
        await fileWatcherCreator.createFileWatchersForFilesMatchingGlobAsync(
          '**/*.ts'
        );

      assert.strictEqual(fileWatchers.length, 1);
      assert.strictEqual(fileWatchers[0], mockFileWatcher);
      sinon.assert.calledOnce(createFileSystemWatcherStub);
      sinon.assert.calledOnce(findFilesStub);
      sinon.assert.calledOnce(mockFileWatcher.onDidChange);
    });

    test('should handle file change when not disabled and file lock does not exist', async () => {
      const mockUri = { fsPath: 'path/to/file' } as vscode.Uri;
      findFilesStub.resolves([mockUri]);
      const mockFileWatcher = {
        onDidChange: (callback: (uri: vscode.Uri) => Promise<void>) => {
          callback(mockUri);
        },
      } as unknown as vscode.FileSystemWatcher;
      createFileSystemWatcherStub.returns(mockFileWatcher);
      hasFileLockStub.returns(false);

      await fileWatcherCreator.createFileWatchersForFilesMatchingGlobAsync(
        '**/*.ts'
      );

      sinon.assert.calledOnce(handleFileChangeAsyncStub);
    });

    test('should not handle file change when disabled', async () => {
      const mockUri = { fsPath: 'path/to/file' } as vscode.Uri;
      findFilesStub.resolves([mockUri]);
      const mockFileWatcher = {
        onDidChange: (callback: (uri: vscode.Uri) => Promise<void>) => {
          callback(mockUri);
        },
      } as unknown as vscode.FileSystemWatcher;
      createFileSystemWatcherStub.returns(mockFileWatcher);
      hasFileLockStub.returns(false);

      await fileWatcherCreator.createFileWatchersForFilesMatchingGlobAsync(
        '**/*.ts',
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
