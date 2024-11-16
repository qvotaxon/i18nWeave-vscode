import * as assert from 'assert';
import { Uri } from 'vscode';

import { ConfigurationStoreManager } from '@i18n-weave/util/util-configuration';

import { FileLockStore } from './file-lock-store';

suite('FileLockStore', () => {
  let fileLockStore: FileLockStore;

  setup(() => {
    fileLockStore = FileLockStore.getInstance();

    ConfigurationStoreManager.getInstance().initialize();
  });

  test('should add file lock', () => {
    const uri = Uri.file('/path/to/file/1');
    fileLockStore.addLock(uri);

    assert.ok(fileLockStore.hasFileLock(uri));
  });

  test('should add multiple file locks for same file', () => {
    const uri1 = Uri.file('/path/to/file/2');
    const uri2 = Uri.file('/path/to/file/3');
    fileLockStore.addLock(uri1);
    fileLockStore.addLock(uri1); //NOSONAR
    fileLockStore.addLock(uri2);

    fileLockStore.delete(uri1);
    fileLockStore.delete(uri2);

    assert.ok(fileLockStore.hasFileLock(uri1));
    assert.equal(fileLockStore.hasFileLock(uri2), false);
  });

  test('should delete file lock', () => {
    const uri = Uri.file('/path/to/file/4');
    fileLockStore.addLock(uri);

    assert.ok(fileLockStore.hasFileLock(uri));

    fileLockStore.delete(uri);
    assert.equal(fileLockStore.hasFileLock(uri), false);
  });

  test('should delete file locks', () => {
    const uri = Uri.file('/path/to/file/4');
    const uri2 = Uri.file('/path/to/file/5');
    fileLockStore.addLocks([uri, uri2]);

    assert.ok(fileLockStore.hasFileLock(uri));
    assert.ok(fileLockStore.hasFileLock(uri2));

    fileLockStore.delete(uri);
    fileLockStore.delete(uri2);
    assert.equal(fileLockStore.hasFileLock(uri), false);
    assert.equal(fileLockStore.hasFileLock(uri2), false);
  });
});
