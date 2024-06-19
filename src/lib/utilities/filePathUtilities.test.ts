import * as assert from 'assert';
import { Uri } from 'vscode';

import { ExtractedFileParts } from '../types/extractedFileParts';
import FilePathUtilities from './filePathUtilities';

suite('FilePathUtilities', () => {
  suite('extractLocale', () => {
    test('should extract locale from valid file path', () => {
      const filePath = '\\path\\to\\locales\\en\\file.json';
      const locale = FilePathUtilities['extractLocale'](filePath);
      assert.strictEqual(locale, 'en');
    });

    test('should throw an error for invalid file path format', () => {
      const filePath = '\\path\\to\\file.json';
      assert.throws(() => {
        FilePathUtilities['extractLocale'](filePath);
      }, Error('Invalid file path format'));
    });
  });

  suite('determineOutputPath', () => {
    test('should determine output path for .po file', () => {
      const filePath = '\\path\\to\\file.po';
      const outputPath = FilePathUtilities['determineOutputPath'](filePath);
      assert.strictEqual(
        outputPath.fsPath,
        Uri.file('\\path\\to\\file.json').fsPath
      );
    });

    test('should determine output path for .json file', () => {
      const filePath = '\\path\\to\\file.json';
      const outputPath = FilePathUtilities['determineOutputPath'](filePath);
      assert.strictEqual(
        outputPath.fsPath,
        Uri.file('\\path\\to\\file.po').fsPath
      );
    });

    test('should throw an error for unsupported file extension', () => {
      const filePath = '\\path\\to\\file.txt';
      assert.throws(() => {
        FilePathUtilities['determineOutputPath'](filePath);
      }, Error('Invalid file extension. Only .po and .json files are supported.'));
    });
  });

  suite('processFilePath', () => {
    test('should process file path and extract locale and output path', () => {
      const filePath = '\\path\\to\\locales\\en\\file.po';
      const result: ExtractedFileParts =
        FilePathUtilities.processFilePath(filePath);
      assert.deepStrictEqual(result, {
        locale: 'en',
        outputPath: Uri.file('\\path\\to\\locales\\en\\file.json'),
      });
    });
  });
});
