import * as assert from 'assert';
import { Uri } from 'vscode';

import FilePathProcessor from '../../services/filePathProcessor';
import { ExtractedFileParts } from '../../types/extractedFileParts';

suite('FilePathProcessor', () => {
  suite('extractLocale', () => {
    test('should extract locale from valid file path', () => {
      const filePath = '\\path\\to\\locales\\en\\file.json';
      const locale = FilePathProcessor['extractLocale'](filePath);
      assert.strictEqual(locale, 'en');
    });

    test('should throw an error for invalid file path format', () => {
      const filePath = '\\path\\to\\file.json';
      assert.throws(() => {
        FilePathProcessor['extractLocale'](filePath);
      }, Error('Invalid file path format'));
    });
  });

  suite('determineOutputPath', () => {
    test('should determine output path for .po file', () => {
      const filePath = '\\path\\to\\file.po';
      const outputPath = FilePathProcessor['determineOutputPath'](filePath);
      assert.strictEqual(
        outputPath.fsPath,
        Uri.file('\\path\\to\\file.json').fsPath
      );
    });

    test('should determine output path for .json file', () => {
      const filePath = '\\path\\to\\file.json';
      const outputPath = FilePathProcessor['determineOutputPath'](filePath);
      assert.strictEqual(
        outputPath.fsPath,
        Uri.file('\\path\\to\\file.po').fsPath
      );
    });

    test('should throw an error for unsupported file extension', () => {
      const filePath = '\\path\\to\\file.txt';
      assert.throws(() => {
        FilePathProcessor['determineOutputPath'](filePath);
      }, Error('Invalid file extension. Only .po and .json files are supported.'));
    });
  });

  suite('processFilePath', () => {
    test('should process file path and extract locale and output path', () => {
      const filePath = '\\path\\to\\locales\\en\\file.po';
      const result: ExtractedFileParts =
        FilePathProcessor.processFilePath(filePath);
      assert.deepStrictEqual(result, {
        locale: 'en',
        outputPath: Uri.file('\\path\\to\\locales\\en\\file.json'),
      });
    });
  });
});
