import * as assert from 'assert';
import { Uri } from 'vscode';

import { ConfigurationStoreManager } from '@i18n-weave/util/util-configuration';

import { FileLockStore } from './file-lock-store';

const extensionName = 'qvotaxon.i18nWeave';

suite('FileLockStore', () => {
  let fileLockStore: FileLockStore;

  setup(() => {
    fileLockStore = FileLockStore.getInstance();
    ConfigurationStoreManager.getInstance().initialize(extensionName);
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

  // New test cases

  test('should add multiple locks', () => {
    const uris = [
      Uri.file('/path/to/file/6'),
      Uri.file('/path/to/file/7'),
      Uri.file('/path/to/file/8'),
    ];
    fileLockStore.addLocks(uris);

    uris.forEach(uri => {
      assert.ok(fileLockStore.hasFileLock(uri));
    });
  });

  test('should delete multiple locks', () => {
    const uris = [
      Uri.file('/path/to/file/9'),
      Uri.file('/path/to/file/10'),
      Uri.file('/path/to/file/11'),
    ];
    fileLockStore.addLocks(uris);
    fileLockStore.deleteLocks(uris);

    uris.forEach(uri => {
      assert.equal(fileLockStore.hasFileLock(uri), false);
    });
  });

  test('should purge lock for specific file', () => {
    const uri = Uri.file('/path/to/file/12');
    fileLockStore.addLock(uri);
    fileLockStore.addLock(uri); // Add multiple locks

    fileLockStore.purgeForFile(uri);
    assert.equal(fileLockStore.hasFileLock(uri), false);
  });

  test('should handle non-existent lock deletion', () => {
    const uri = Uri.file('/path/to/non/existent/file');
    fileLockStore.delete(uri); // Should not throw an error
    assert.equal(fileLockStore.hasFileLock(uri), false);
  });

  test('should return same instance for multiple getInstance calls', () => {
    const instance1 = FileLockStore.getInstance();
    const instance2 = FileLockStore.getInstance();
    assert.strictEqual(instance1, instance2);
  });

  test('should handle multiple lock additions and deletions', () => {
    const uri = Uri.file('/path/to/file/13');
    fileLockStore.addLock(uri);
    fileLockStore.addLock(uri);
    fileLockStore.addLock(uri);

    fileLockStore.delete(uri);
    assert.ok(fileLockStore.hasFileLock(uri));

    fileLockStore.delete(uri);
    assert.ok(fileLockStore.hasFileLock(uri));

    fileLockStore.delete(uri);
    assert.equal(fileLockStore.hasFileLock(uri), false);
  });
});
