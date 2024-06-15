import * as assert from 'assert';
import { file } from 'mock-fs/lib/filesystem';
import { Uri } from 'vscode';

import FileLockStoreStore from '../../services/fileLockStore';

suite('FileLockStoreStore', () => {
  let fileLockStore: FileLockStoreStore;

  setup(() => {
    fileLockStore = FileLockStoreStore.getInstance();
  });

  test('should add file lock', () => {
    const uri = Uri.file('/path/to/file/1');
    fileLockStore.add(uri);

    assert.ok(fileLockStore.hasFileLock(uri));
  });

  test('should add multiple file locks for same file', () => {
    const uri1 = Uri.file('/path/to/file/2');
    const uri2 = Uri.file('/path/to/file/3');
    fileLockStore.add(uri1);
    fileLockStore.add(uri1);
    fileLockStore.add(uri2);

    fileLockStore.delete(uri1);
    fileLockStore.delete(uri2);

    assert.ok(fileLockStore.hasFileLock(uri1));
    assert.equal(fileLockStore.hasFileLock(uri2), false);
  });

  test('should delete file lock', () => {
    const uri = Uri.file('/path/to/file/4');
    fileLockStore.add(uri);

    assert.ok(fileLockStore.hasFileLock(uri));

    fileLockStore.delete(uri);
    assert.equal(fileLockStore.hasFileLock(uri), false);
  });
});
