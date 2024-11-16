import * as assert from 'assert';
import * as mock from 'mock-fs';
import vscode from 'vscode';
import { Uri } from 'vscode';

import { FileReader } from '@i18n-weave/file-io/file-io-file-reader';

import { ReadJsonFileModule } from './read-json-file-module';
import { ReadJsonFileModuleContext } from './read-json-file-module-context';

suite('ReadJsonFileModule Tests', () => {
  let extensionContext: vscode.ExtensionContext;

  setup(() => {
    extensionContext = {} as vscode.ExtensionContext;

    mock.default({
      '/path/to/file.json': "{ name: 'John Doe', age: 30 }",
    });
  });

  teardown(() => {
    mock.restore();
  });

  test('doExecute should read the contents of a JSON file and assign it to the context', async () => {
    const inputPath = Uri.file('/path/to/file.json');
    const jsonContent = "{ name: 'John Doe', age: 30 }";

    const context: ReadJsonFileModuleContext = {
      locale: 'en',
      outputPath: Uri.file('/path/to/output.json'),
      inputPath,
      jsonContent: null,
    };

    const module = new ReadJsonFileModule(extensionContext);
    await module.executeAsync(context);

    assert.deepStrictEqual(context.jsonContent, jsonContent);
  });

  test('doExecute should not assign the context.jsonContent if the file is empty', async () => {
    const inputPath = Uri.file('/path/to/emptyFile.json');
    const readFileAsyncOriginal = FileReader.readWorkspaceFileAsync;

    FileReader.readWorkspaceFileAsync = async (filePath: Uri) => {
      assert.strictEqual(filePath.fsPath, inputPath.fsPath);
      return '';
    };

    const context: ReadJsonFileModuleContext = {
      locale: 'en',
      outputPath: Uri.file('/path/to/output.json'),
      inputPath,
      jsonContent: null,
    };

    const module = new ReadJsonFileModule(extensionContext);
    await module.executeAsync(context);

    assert.strictEqual(context.jsonContent, null);

    FileReader.readWorkspaceFileAsync = readFileAsyncOriginal;
  });

  test('doExecute should not assign the context.jsonContent if the file is not found', async () => {
    const inputPath = Uri.file('/path/to/nonexistentFile.json');
    const readFileAsyncOriginal = FileReader.readWorkspaceFileAsync;

    FileReader.readWorkspaceFileAsync = async (filePath: Uri) => {
      assert.strictEqual(filePath.fsPath, inputPath.fsPath);
      throw new Error('File not found');
    };

    const context: ReadJsonFileModuleContext = {
      locale: 'en',
      outputPath: Uri.file('/path/to/output.json'),
      inputPath,
      jsonContent: null,
    };

    const module = new ReadJsonFileModule(extensionContext);
    assert.rejects(module.executeAsync(context), Error, 'File not found');
    assert.strictEqual(context.jsonContent, null);

    FileReader.readWorkspaceFileAsync = readFileAsyncOriginal;
  });
});
