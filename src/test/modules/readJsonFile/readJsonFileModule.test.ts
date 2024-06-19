import * as assert from 'assert';
import * as mock from 'mock-fs';
import { Uri } from 'vscode';

import ReadJsonFileModule from '../../../lib/modules/readJsonFile/readJsonFileModule';
import { ReadJsonFileModuleContext } from '../../../lib/modules/readJsonFile/readJsonFileModuleContext';
import FileReader from '../../../lib/services/fileIo/fileReader';

suite('ReadJsonFileModule Tests', () => {
  setup(() => {
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

    const module = new ReadJsonFileModule();
    await module.executeAsync(context);

    assert.deepStrictEqual(context.jsonContent, jsonContent);
  });

  test('doExecute should not assign the context.jsonContent if the file is empty', async () => {
    const inputPath = Uri.file('/path/to/emptyFile.json');
    const readFileAsyncOriginal = FileReader.readFileAsync;

    FileReader.readFileAsync = async (filePath: string) => {
      assert.strictEqual(filePath, inputPath.fsPath);
      return '';
    };

    const context: ReadJsonFileModuleContext = {
      locale: 'en',
      outputPath: Uri.file('/path/to/output.json'),
      inputPath,
      jsonContent: null,
    };

    const module = new ReadJsonFileModule();
    await module.executeAsync(context);

    assert.strictEqual(context.jsonContent, null);

    FileReader.readFileAsync = readFileAsyncOriginal;
  });

  test('doExecute should not assign the context.jsonContent if the file is not found', async () => {
    const inputPath = Uri.file('/path/to/nonexistentFile.json');
    const readFileAsyncOriginal = FileReader.readFileAsync;

    FileReader.readFileAsync = async (filePath: string) => {
      assert.strictEqual(filePath, inputPath.fsPath);
      throw new Error('File not found');
    };

    const context: ReadJsonFileModuleContext = {
      locale: 'en',
      outputPath: Uri.file('/path/to/output.json'),
      inputPath,
      jsonContent: null,
    };

    const module = new ReadJsonFileModule();
    assert.rejects(module.executeAsync(context), Error, 'File not found');
    assert.strictEqual(context.jsonContent, null);

    FileReader.readFileAsync = readFileAsyncOriginal;
  });
});
