import * as assert from 'assert';
import fs from 'fs';
import sinon from 'sinon';
import vscode from 'vscode';
import { window, workspace } from 'vscode';

import FileLocationStore from '../fileLocation/fileLocationStore';
import FileContentStore from './fileContentStore';

suite('FileContentStore', () => {
  let fileContentStore: FileContentStore;
  let findFilesStub: sinon.SinonStub;
  let readFileSyncStub: sinon.SinonStub;
  let showErrorMessageStub: sinon.SinonStub;

  setup(() => {
    fileContentStore = FileContentStore.getInstance();
    findFilesStub = sinon.stub(workspace, 'findFiles');
    readFileSyncStub = sinon.stub(fs, 'readFileSync');
    showErrorMessageStub = sinon.stub(window, 'showErrorMessage');
  });

  teardown(() => {
    sinon.restore();
  });

  suite('getInstance', () => {
    test('should return the singleton instance', () => {
      const instance1 = FileContentStore.getInstance();
      const instance2 = FileContentStore.getInstance();
      assert.strictEqual(instance1, instance2);
    });
  });

  suite('initializeInitialFileContentsAsync', () => {
    test('should initialize file caches', async () => {
      const expectedFirstPath = vscode.Uri.parse('file:///path/to/file1.ts');
      const expectedSecondPath = vscode.Uri.parse('file:///path/to/file2.ts');

      const fileLocationStoreStub = sinon
        .stub(FileLocationStore.getInstance(), 'getFilesByType')
        .returns([expectedFirstPath.fsPath, expectedSecondPath.fsPath]);

      fileContentStore.initializeInitialFileContents();

      sinon.assert.calledTwice(readFileSyncStub);
      sinon.assert.calledWithExactly(
        readFileSyncStub.getCall(0),
        expectedFirstPath.fsPath,
        { encoding: 'utf8' }
      );
      sinon.assert.calledWithExactly(
        readFileSyncStub.getCall(1),
        expectedSecondPath.fsPath,
        { encoding: 'utf8' }
      );

      fileLocationStoreStub.restore();
    });

    test('should handle errors and show error message', async () => {
      const errorMessage = 'Error initializing initial file contents';

      const fileLocationStoreStub = sinon
        .stub(FileLocationStore.getInstance(), 'getFilesByType')
        .throws(new Error(errorMessage));

      fileContentStore.initializeInitialFileContents();

      sinon.assert.notCalled(readFileSyncStub);
      sinon.assert.calledOnce(showErrorMessageStub);
      sinon.assert.calledWithExactly(showErrorMessageStub, errorMessage);

      fileLocationStoreStub.restore();
    });
  });

  suite('fileChangeContainsTranslationKeys', () => {
    test('should return true if file change contains translation keys', () => {
      const fsPath = '/path/to/file.json';
      const currentFileContents = 'I18nKey("key1")\nI18nKey("key2")\n';
      const previousFileContents = 'I18nKey("key1")\n';
      FileContentStore.currentFileContents[fsPath as keyof object] =
        currentFileContents;
      FileContentStore.previousFileContents[fsPath as keyof object] =
        previousFileContents;

      const result = FileContentStore.fileChangeContainsTranslationKeys(fsPath);

      assert.strictEqual(result, true);
    });

    test('should return false if file change does not contain translation keys', () => {
      const fsPath = '/path/to/file.json';
      const currentFileContents = 'console.log("Hello, world!");\n';
      const previousFileContents = 'console.log("Hello, world!");\n';
      FileContentStore.currentFileContents[fsPath as keyof object] =
        currentFileContents;
      FileContentStore.previousFileContents[fsPath as keyof object] =
        previousFileContents;

      const result = FileContentStore.fileChangeContainsTranslationKeys(fsPath);

      assert.strictEqual(result, false);
    });
  });

  suite('updatePreviousFileContents', () => {
    test('should update previous file contents', () => {
      const fsPath = '/path/to/file.json';
      const fileContent = 'I18nKey("key1")\nI18nKey("key2")\n';
      readFileSyncStub.returns(fileContent);

      FileContentStore.updatePreviousFileContents(fsPath);

      assert.strictEqual(
        FileContentStore.previousFileContents[fsPath as keyof object],
        fileContent
      );
      sinon.assert.calledOnceWithExactly(readFileSyncStub, fsPath, {
        encoding: 'utf8',
      });
    });
  });

  suite('updateCurrentFileContents', () => {
    test('should update current file contents', () => {
      const fsPath = '/path/to/file.json';
      const fileContent = 'I18nKey("key1")\nI18nKey("key2")\n';
      readFileSyncStub.returns(fileContent);

      FileContentStore.updateCurrentFileContents(fsPath);

      assert.strictEqual(
        FileContentStore.currentFileContents[fsPath as keyof object],
        fileContent
      );
      sinon.assert.calledOnceWithExactly(readFileSyncStub, fsPath, {
        encoding: 'utf8',
      });
    });
  });

  suite('storeFileState', () => {
    test('should store file state if it has changed', () => {
      const fsPath = '/path/to/file.txt';
      const previousFileContents = 'I18nKey("key1")\n';
      const currentFileContents = 'I18nKey("key1")\nI18nKey("key2")\n';
      FileContentStore.previousFileContents[fsPath as keyof object] =
        previousFileContents;
      FileContentStore.currentFileContents[fsPath as keyof object] =
        currentFileContents;

      FileContentStore.storeFileState(fsPath);

      assert.strictEqual(
        FileContentStore.previousFileContents[fsPath as keyof object],
        currentFileContents
      );
    });

    test('should not store file state if it has not changed', () => {
      const fsPath = '/path/to/file.txt';
      const previousFileContents = 'I18nKey("key1")\n';
      const currentFileContents = 'I18nKey("key1")\n';
      FileContentStore.previousFileContents[fsPath as keyof object] =
        previousFileContents;
      FileContentStore.currentFileContents[fsPath as keyof object] =
        currentFileContents;

      FileContentStore.storeFileState(fsPath);

      assert.strictEqual(
        FileContentStore.previousFileContents[fsPath as keyof object],
        previousFileContents
      );
    });
  });
});
