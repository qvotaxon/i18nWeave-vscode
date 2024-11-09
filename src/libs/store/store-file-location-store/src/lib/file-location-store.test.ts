import assert from 'assert';
import sinon from 'sinon';
import vscode from 'vscode';

import { ConfigurationStoreManager } from '@i18n-weave/util/util-configuration';
import { FileSearchLocation } from '@i18n-weave/util/util-types';

import { FileLocationStore } from './file-location-store';

suite('FileLocationStore Tests', function () {
  let store: FileLocationStore;
  let sandbox: sinon.SinonSandbox;

  setup(function () {
    sandbox = sinon.createSandbox();
    store = FileLocationStore.getInstance();

    ConfigurationStoreManager.getInstance().initialize();
  });

  teardown(function () {
    sandbox.restore();
  });

  test('getInstance should return a singleton instance', function () {
    const instance1 = FileLocationStore.getInstance();
    const instance2 = FileLocationStore.getInstance();
    assert.strictEqual(instance1, instance2, 'Instances are not the same');
  });

  test('scanWorkspace should add files to the store', async function () {
    const mockFiles = [
      vscode.Uri.file('/path/to/file1.json'),
      vscode.Uri.file('/path/to/file2.ts'),
    ];
    sandbox.stub(vscode.workspace, 'findFiles').resolves(mockFiles);
    const addFileStub = sandbox.stub<any, any>(store, 'addFile');

    const fileSearchLocations = [
      {
        filePattern: '**/*.json',
        ignorePattern: '**/node_modules/**',
      } as FileSearchLocation,
      {
        filePattern: '**/*.ts',
        ignorePattern: '**/node_modules/**',
      } as FileSearchLocation,
    ];

    await store.scanWorkspaceAsync(fileSearchLocations);

    assert.strictEqual(
      addFileStub.callCount,
      mockFiles.length * 2, //TODO: find out why this needs a * 2
      'addFile was not called for each file'
    );
    mockFiles.forEach((file, index) => {
      assert.ok(
        addFileStub.calledWith(file),
        `addFile was not called with the correct file: ${file.fsPath}`
      );
    });
  });
});
