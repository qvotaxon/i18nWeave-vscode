import * as assert from 'assert';
import * as mock from 'mock-fs';
import { Uri } from 'vscode';

import FileReader from '../../services/fileIo/fileReader';
import ReadPoFileModule from './readPoFileModule';
import { ReadPoFileModuleContext } from './readPoFileModuleContext';

suite('ReadPoFileModule Tests', () => {
  setup(() => {
    mock.default({
      '/path/to/file.po': `
msgid ""
msgstr ""
"Project-Id-Version: gettext-converter\n"
"MIME-Version: 1.0\n"
"Content-Type: text/plain; charset=utf-8\n"
"Content-Transfer-Encoding: 8bit\n"
"Plural-Forms: nplurals=2; plural=(n != 1)\n"
"POT-Creation-Date: 2024-06-07T12:34:16.846Z\n"
"PO-Revision-Date: 2024-06-07T12:34:16.846Z\n"
"Language: en-US\n"

msgid "key"
msgstr "value"`,
    });
  });

  teardown(() => {
    mock.restore();
  });

  test('doExecute should read the contents of a PO file and assign it to the context', async () => {
    const inputPath = Uri.file('/path/to/file.po');
    const poContent = `
msgid ""
msgstr ""
"Project-Id-Version: gettext-converter\n"
"MIME-Version: 1.0\n"
"Content-Type: text/plain; charset=utf-8\n"
"Content-Transfer-Encoding: 8bit\n"
"Plural-Forms: nplurals=2; plural=(n != 1)\n"
"POT-Creation-Date: 2024-06-07T12:34:16.846Z\n"
"PO-Revision-Date: 2024-06-07T12:34:16.846Z\n"
"Language: en-US\n"

msgid "key"
msgstr "value"`;

    const context: ReadPoFileModuleContext = {
      locale: 'en',
      outputPath: Uri.file('/path/to/output.po'),
      inputPath,
      poContent: null,
    };

    const module = new ReadPoFileModule();
    await module.executeAsync(context);

    assert.deepStrictEqual(context.poContent, poContent);
  });

  test('doExecute should not assign the context.poContent if the file is empty', async () => {
    const inputPath = Uri.file('/path/to/emptyFile.po');
    const readFileAsyncOriginal = FileReader.readFileAsync;

    FileReader.readFileAsync = async (filePath: string) => {
      assert.strictEqual(filePath, inputPath.fsPath);
      return '';
    };

    const context: ReadPoFileModuleContext = {
      locale: 'en',
      outputPath: Uri.file('/path/to/output.po'),
      inputPath,
      poContent: null,
    };

    const module = new ReadPoFileModule();
    await module.executeAsync(context);

    assert.strictEqual(context.poContent, null);

    FileReader.readFileAsync = readFileAsyncOriginal;
  });

  test('doExecute should not assign the context.poContent if the file is not found', async () => {
    const inputPath = Uri.file('/path/to/nonexistentFile.po');
    const readFileAsyncOriginal = FileReader.readFileAsync;

    FileReader.readFileAsync = async (filePath: string) => {
      assert.strictEqual(filePath, inputPath.fsPath);
      throw new Error('File not found');
    };

    const context: ReadPoFileModuleContext = {
      locale: 'en',
      outputPath: Uri.file('/path/to/output.po'),
      inputPath,
      poContent: null,
    };

    const module = new ReadPoFileModule();
    assert.rejects(module.executeAsync(context), Error, 'File not found');
    assert.strictEqual(context.poContent, null);

    FileReader.readFileAsync = readFileAsyncOriginal;
  });
});
