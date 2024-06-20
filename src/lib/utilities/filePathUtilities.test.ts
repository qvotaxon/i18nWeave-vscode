import assert from 'assert';
import vscode from 'vscode';

import {
  determineOutputPath,
  extractFilePathParts,
  extractLocale,
  getFileExtension,
} from './filePathUtilities';

suite('filePathUtilities', () => {
  suite('extractLocale', () => {
    test('should extract the locale from the file path', () => {
      const filePath = 'C:\\locales\\en\\file.po';
      const locale = extractLocale(filePath);
      assert.equal(locale, 'en');
    });

    test('should throw an error for invalid file path format', () => {
      const filePath = 'C:\\invalid\\file.path';
      assert.throws(() => extractLocale(filePath), {
        message: 'Invalid file path format',
      });
    });
  });

  suite('determineOutputPath', () => {
    test('should determine the output path for .po file', () => {
      const filePath = 'C:\\locales\\en\\file.po';
      const outputPath = determineOutputPath(filePath);
      assert.deepStrictEqual(
        outputPath,
        vscode.Uri.file('C:\\locales\\en\\file.json')
      );
    });

    test('should determine the output path for .json file', () => {
      const filePath = 'C:\\locales\\en\\file.json';
      const outputPath = determineOutputPath(filePath);

      assert.deepStrictEqual(
        outputPath,
        vscode.Uri.file('C:\\locales\\en\\file.po')
      );
    });

    test('should throw an error for invalid file extension', () => {
      const filePath = 'C:\\locales\\en\\file.txt';

      assert.throws(() => determineOutputPath(filePath), {
        message:
          'Invalid file extension. Only .po and .json files are supported.',
      });
    });
  });

  suite('extractFilePathParts', () => {
    test('should extract the locale and output path from the file path', () => {
      const filePath = 'C:\\locales\\en\\file.po';
      const filePathParts = extractFilePathParts(filePath);

      assert.deepStrictEqual(filePathParts, {
        locale: 'en',
        outputPath: vscode.Uri.file('C:\\locales\\en\\file.json'),
      });
    });
  });

  suite('getFileExtension', () => {
    test('should get the file extension from the URI', () => {
      const uri = vscode.Uri.file('C:\\locales\\en\\file.po');
      const fileExtension = getFileExtension(uri);

      assert.strictEqual(fileExtension, 'po');
    });
  });
});
