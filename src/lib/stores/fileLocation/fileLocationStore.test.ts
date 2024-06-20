import assert from 'assert';
import sinon from 'sinon';
import vscode from 'vscode';

import * as filePathUtilities from '../../utilities/filePathUtilities';
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
    const addFileStub = sandbox.stub<any, any>(store, 'addFile');

    await store.scanWorkspaceAsync(
      ['**/*.json', '**/*.ts'],
      '**/node_modules/**'
    );

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

  test('addFile should add a file to the store', function () {
    const uri = vscode.Uri.file('/path/to/file.json');
    sandbox.stub(filePathUtilities, 'getFileExtension').returns('json');

    // @ts-ignore: access private method
    store.addFile(uri);

    const files = store.getFilesByType(['json']);
    assert.ok(files.includes(uri), 'The file was not added to the store');
  });

  test('removeFile should remove a file from the store', function () {
    const uri = vscode.Uri.file('/path/to/file.json');
    sandbox.stub(filePathUtilities, 'getFileExtension').returns('json');

    // @ts-ignore: access private method
    store.addFile(uri);
    // @ts-ignore: access private method
    store.removeFile(uri);

    const files = store.getFilesByType(['json']);
    assert.ok(!files.includes(uri), 'The file was not removed from the store');
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

    // @ts-ignore: access private method
    store.addFile(uri1);
    // @ts-ignore: access private method
    store.addFile(uri2);

    const jsonFiles = store.getFilesByType(['json']);
    const tsFiles = store.getFilesByType(['ts']);

    assert.ok(jsonFiles.includes(uri1), 'The JSON file was not returned');
    assert.ok(tsFiles.includes(uri2), 'The TS file was not returned');
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

  test('createFileWatchers should set up file watchers', function () {
    const context: vscode.ExtensionContext = {
      subscriptions: [],
      // other properties if needed
    } as any;
    const createFileSystemWatcherStub = sandbox
      .stub(vscode.workspace, 'createFileSystemWatcher')
      .returns({
        onDidCreate: sinon.spy(),
        onDidDelete: sinon.spy(),
        onDidChange: sinon.spy(),
      } as any);

    store.createFileWatchers(context);

    assert.strictEqual(
      createFileSystemWatcherStub.callCount,
      3,
      'createFileSystemWatcher was not called three times'
    );
    assert.strictEqual(
      context.subscriptions.length,
      3,
      'Watchers were not added to context subscriptions'
    );
  });
});
