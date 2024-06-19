import * as assert from 'assert';
import * as mock from 'mock-fs';
import { Uri } from 'vscode';

import FileReader from '../../lib/services/fileIo/fileReader';

suite('FileReader Tests', () => {
  setup(() => {
    mock.default({
      '/path/to/file.txt': 'Hello, World!',
    });
  });

  teardown(() => {
    mock.restore();
  });

  test('readFileAsync should read the contents of a file', async () => {
    const filePath = Uri.file('/path/to/file.txt');
    const expectedData = 'Hello, World!';

    const fileContent = await FileReader.readFileAsync(filePath.fsPath);

    assert.strictEqual(fileContent, expectedData);
  });

  test('readFileAsync should reject with an error if there is a problem', async () => {
    const filePath = Uri.file('/path/to/nonexistent/file.txt');

    try {
      await FileReader.readFileAsync(filePath.fsPath);
      assert.fail('Expected an error to be thrown');
    } catch (error) {
      assert.strictEqual(error instanceof Error, true);
    }
  });
});
