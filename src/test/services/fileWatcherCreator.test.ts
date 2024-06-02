import * as assert from 'assert';
import FileWatcherCreator from '../../services/fileWatcherCreator';
import JsonFileChangeHandler from '../../fileChangeHandlers/jsonFileChangeHandler';

const EXPECTED_FILE_WATCHERS = 6;

suite('FileWatcherCreator Tests', () => {
  let tracker: assert.CallTracker;

  setup(() => {
    tracker = new assert.CallTracker();
  });

  test('createFileWatchersForFilesMatchingGlobAsync should create file watchers for files matching the glob pattern', async () => {
    const pattern = '**/*.json';
    const disableFlags: (() => boolean)[] = [];

    const fileWatcherCreator = new FileWatcherCreator();
    const fileWatchers =
      await fileWatcherCreator.createFileWatchersForFilesMatchingGlobAsync(
        pattern,
        ...disableFlags
      );

    assert.strictEqual(fileWatchers.length, EXPECTED_FILE_WATCHERS);
  });

  test('createFileWatchersForFilesMatchingGlobAsync should disable file watchers based on disable flags', async () => {
    const pattern = '**/*.json';
    const disableFlags: (() => boolean)[] = [() => true, () => false];

    const fileWatcherCreator = new FileWatcherCreator();

    const callsfunc = tracker.calls(
      JsonFileChangeHandler.prototype.handleFileChangeAsync
    );
    JsonFileChangeHandler.prototype.handleFileChangeAsync = callsfunc;

    const fileWatchers =
      await fileWatcherCreator.createFileWatchersForFilesMatchingGlobAsync(
        pattern,
        ...disableFlags
      );

    assert.strictEqual(tracker.getCalls(callsfunc).length, 0);
    assert.strictEqual(fileWatchers.length, EXPECTED_FILE_WATCHERS);
  });
});
