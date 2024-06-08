import * as assert from 'assert';
import { Uri } from 'vscode';
import FileLockStoreStore from '../../services/fileLockStore';

suite('FileLockStoreStore', () => {
  let fileLockStore: FileLockStoreStore;

  setup(() => {
    fileLockStore = FileLockStoreStore.getInstance();
  });

  test('should add file lock', () => {
    const uri = Uri.file('/path/to/file');
    fileLockStore.add(uri);
    assert.ok(fileLockStore.hasFileLock(uri));
  });

  test('should delete file lock', () => {
    const uri = Uri.file('/path/to/file');
    fileLockStore.add(uri);
    fileLockStore.delete(uri);
    assert.ok(!fileLockStore.hasFileLock(uri));
  });
});
