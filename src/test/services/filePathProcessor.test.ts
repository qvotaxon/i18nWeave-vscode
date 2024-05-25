import * as assert from 'assert';
import { Uri } from 'vscode';
import FilePathProcessor from '../../services/filePathProcessor';

suite('FilePathProcessor Tests', () => {
  test('processFilePath should extract locale and output path for .po file', () => {
    const filePath = 'C:\\path\\to\\locales\\en\\file.po';
    const expectedLocale = 'en';
    const expectedOutputPath = Uri.file('C:\\path\\to\\locales\\en\\file.json');

    const result = FilePathProcessor.processFilePath(filePath);

    assert.strictEqual(result.locale, expectedLocale);
    assert.deepStrictEqual(result.outputPath, expectedOutputPath);
  });

  test('processFilePath should extract locale and output path for .json file', () => {
    const filePath = 'C:\\path\\to\\locales\\fr\\file.json';
    const expectedLocale = 'fr';
    const expectedOutputPath = Uri.file('C:\\path\\to\\locales\\fr\\file.po');

    const result = FilePathProcessor.processFilePath(filePath);

    assert.strictEqual(result.locale, expectedLocale);
    assert.deepStrictEqual(result.outputPath, expectedOutputPath);
  });

  test('processFilePath should throw an error for invalid file path format', () => {
    const filePath = 'C:\\path\\to\\invalid\\file.txt';

    assert.throws(() => {
      FilePathProcessor.processFilePath(filePath);
    }, Error);
  });

  test('processFilePath should throw an error for unsupported file extension', () => {
    const filePath = 'C:\\path\\to\\locales\\es\\file.txt';

    assert.throws(() => {
      FilePathProcessor.processFilePath(filePath);
    }, Error);
  });
});
