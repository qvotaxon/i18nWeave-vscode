import * as assert from 'assert';
import FileWatcherCreator from '../../services/fileWatcherCreator';
import * as mock from 'mock-fs';
import JsonFileChangeHandler from '../../fileChangeHandlers/jsonFileChangeHandler';
import FileChangeHandlerFactory from '../../services/fileChangeHandlerFactory';

suite('FileWatcherCreator Tests', () => {
  let tracker: assert.CallTracker;

  setup(() => {
    tracker = new assert.CallTracker();
  });

  teardown(() => {
    mock.restore();
  });

  test('createFileWatchersForFilesMatchingGlobAsync should create file watchers for files matching the glob pattern', async () => {
    const pattern = '**/*.json';
    const disableFlags: (() => boolean)[] = [];

    const fileWatcherCreator = new FileWatcherCreator();

    const callsfunc = tracker.calls(
      FileChangeHandlerFactory.prototype.createFileChangeHandler
    );

    FileChangeHandlerFactory.prototype.createFileChangeHandler = callsfunc;
    tracker.reset(callsfunc);

    const fileWatchers =
      await fileWatcherCreator.createFileWatchersForFilesMatchingGlobAsync(
        pattern,
        ...disableFlags
      );

    assert.equal(tracker.getCalls(callsfunc).length, fileWatchers.length);
  });

  test('createFileWatchersForFilesMatchingGlobAsync should disable file watchers based on disable flags', async () => {
    const pattern = '**/*.json';
    const disableFlags: (() => boolean)[] = [() => true, () => false];

    const fileWatcherCreator = new FileWatcherCreator();

    const callsfunc = tracker.calls(
      JsonFileChangeHandler.prototype.handleFileChangeAsync
    );
    JsonFileChangeHandler.prototype.handleFileChangeAsync = callsfunc;

    tracker.reset(callsfunc);

    await fileWatcherCreator.createFileWatchersForFilesMatchingGlobAsync(
      pattern,
      ...disableFlags
    );

    assert.equal(tracker.getCalls(callsfunc).length, 0);
  });
});
