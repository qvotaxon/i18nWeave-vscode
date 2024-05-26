import * as assert from 'assert';
import * as vscode from 'vscode';
import FileWatcherCreator from '../../services/fileWatcherCreator';
import * as mock from 'mock-fs';
import JsonFileChangeHandler from '../../fileChangeHandlers/jsonFileChangeHandler';
import { Uri } from 'vscode';

suite('FileWatcherCreator Tests', () => {
  let handleFileChangeAsyncCalled = false;

  setup(() => {
    mock.default({
      '/path/to/file1.json': '{ "key": "value" }',
      '/path/to/file2.json': '{ "key": "value" }',
      '/path/node_modules': {
        'file1.json': '{ "key": "value" }',
        'file2.json': '{ "key": "value" }',
      },
    });

    // Mock the behavior of vscode.workspace.findFiles
    vscode.workspace.findFiles = (
      include: vscode.GlobPattern,
      exclude?: vscode.GlobPattern | null | undefined,
      maxResults?: number
    ) => {
      const fileUris = [
        vscode.Uri.file('/path/to/file1.json'),
        vscode.Uri.file('/path/to/file2.json'),
      ];
      return Promise.resolve(fileUris);
    };

    const jsonFileChangeHandlerMock = new JsonFileChangeHandler();

    jsonFileChangeHandlerMock.handleFileChangeAsync = (
      changeFileLocation?: Uri | undefined
    ): Promise<void> => {
      handleFileChangeAsyncCalled = true;
      return Promise.resolve();
    };
  });

  teardown(() => {
    mock.restore();
  });

  test('createFileWatchersForFilesMatchingGlobAsync should create file watchers for files matching the glob pattern', async () => {
    const pattern = '**/*.json';
    const disableFlags: (() => boolean)[] = [];

    const expectedFileWatchers: vscode.FileSystemWatcher[] = [
      vscode.workspace.createFileSystemWatcher('/path/to/file1.json'),
      vscode.workspace.createFileSystemWatcher('/path/to/file2.json'),
    ];

    const fileWatcherCreator = new FileWatcherCreator();

    const fileWatchers =
      await fileWatcherCreator.createFileWatchersForFilesMatchingGlobAsync(
        pattern,
        ...disableFlags
      );

    assert.ok(fileWatchers.length > 0);
    assert.equal(fileWatchers.length, expectedFileWatchers.length);
  });

  test('createFileWatchersForFilesMatchingGlobAsync should disable file watchers based on disable flags', async () => {
    const pattern = '**/*.json';
    const disableFlags: (() => boolean)[] = [() => true, () => false];

    const expectedFileWatchers: vscode.FileSystemWatcher[] = [
      vscode.workspace.createFileSystemWatcher('/path/to/file1.json'),
      vscode.workspace.createFileSystemWatcher('/path/to/file2.json'),
    ];

    const fileWatcherCreator = new FileWatcherCreator();

    const fileWatchers =
      await fileWatcherCreator.createFileWatchersForFilesMatchingGlobAsync(
        pattern,
        ...disableFlags
      );

    assert.ok(fileWatchers.length > 0);
    assert.equal(fileWatchers.length, expectedFileWatchers.length);
    assert.equal(handleFileChangeAsyncCalled, false);
  });
});
