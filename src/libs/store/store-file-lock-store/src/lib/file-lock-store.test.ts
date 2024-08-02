import { FileLockStore } from '@i18n-weave/store/store-file-lock-store';
import * as assert from 'assert';
import { Uri } from 'vscode';

suite('FileLockStore', () => {
  let fileLockStore: FileLockStore;

  setup(() => {
    fileLockStore = FileLockStore.getInstance();
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
    fileLockStore.add(uri1); //NOSONAR
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
