import * as filePathUtilities from '@i18n-weave/util/util-file-path-utilities';
import assert from 'assert';
import sinon from 'sinon';
import vscode from 'vscode';

import { FileSearchLocation } from 'lib/types/fileSearchLocation';
import FileLocationStore from './fileLocationStore';

suite('FileLocationStore Tests', function () {
  let store: FileLocationStore;
  let sandbox: sinon.SinonSandbox;

  setup(function () {
    sandbox = sinon.createSandbox();
    store = FileLocationStore.getInstance();
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
    const addOrUpdateFileStub = sandbox.stub<any, any>(
      store,
      'addOrUpdateFile'
    );

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
      addOrUpdateFileStub.callCount,
      mockFiles.length * 2, //TODO: find out why this needs a * 2
      'addOrUpdateFile was not called for each file'
    );
    mockFiles.forEach((file, index) => {
      assert.ok(
        addOrUpdateFileStub.calledWith(file),
        `addOrUpdateFile was not called with the correct file: ${file.fsPath}`
      );
    });
  });

  test('addOrUpdateFile should add a file to the store', function () {
    const uri = vscode.Uri.file('/path/to/file.json');
    sandbox.stub(filePathUtilities, 'getFileExtension').returns('json');
    store.addOrUpdateFile(uri);

    const files = store.getFilesByType(['json']);
    assert.ok(
      files.includes(uri.fsPath),
      'The file was not added to the store'
    );
  });

  test('removeFile should remove a file from the store', function () {
    const uri = vscode.Uri.file('/path/to/file.json');
    sandbox.stub(filePathUtilities, 'getFileExtension').returns('json');
    store.addOrUpdateFile(uri);
    store.deleteFile(uri);

    const files = store.getFilesByType(['json']);
    assert.ok(
      !files.includes(uri.fsPath),
      'The file was not removed from the store'
    );
  });

  test('getFilesByType should return all files of specific types', function () {
    const uri1 = vscode.Uri.file('/path/to/file1.json');
    const uri2 = vscode.Uri.file('/path/to/file2.ts');
    sandbox
      .stub(filePathUtilities, 'getFileExtension')
      .onFirstCall()
      .returns('json')
      .onSecondCall()
      .returns('ts');

    store.addOrUpdateFile(uri1);
    store.addOrUpdateFile(uri2);

    const jsonFiles = store.getFilesByType(['json']);
    const tsFiles = store.getFilesByType(['ts']);

    assert.ok(
      jsonFiles.includes(uri1.fsPath),
      'The JSON file was not returned'
    );
    assert.ok(tsFiles.includes(uri2.fsPath), 'The TS file was not returned');
  });

  //   test('getRelatedFiles should return related files by replacing the extension', function () {
  //     // const uri = vscode.Uri.file('/path/to/file.json');
  //     // const relatedUri = vscode.Uri.file('/path/to/file.ts');

  //     const uri = vscode.Uri.parse('file:///path/to/file.json');
  //     const relatedUri = vscode.Uri.parse('file:///path/to/file.ts');

  //     // sandbox
  //     //   .stub(filePathUtilities, 'getFileExtension')
  //     //   .onFirstCall()
  //     //   .returns('json')
  //     //   .onSecondCall()
  //     //   .returns('ts');
  //     // @ts-ignore: access private method
  //     store.addFile(uri);
  //     // @ts-ignore: access private method
  //     store.addFile(relatedUri);

  //     const relatedFiles = store.getRelatedFiles(uri, 'ts');
  //     assert.ok(
  //       relatedFiles.includes(relatedUri),
  //       'The related file was not returned'
  //     );
  //   });
});
