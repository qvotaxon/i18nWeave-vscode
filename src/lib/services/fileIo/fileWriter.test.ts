import * as assert from 'assert';
import * as fs from 'fs';
import * as mock from 'mock-fs';
import path from 'path';
import { Uri } from 'vscode';

import FileWriter from './fileWriter';

suite('FileWriter Tests', () => {
  teardown(() => {
    mock.restore();
  });

  test('writeToFileAsync should write data to a file', async () => {
    const relativePath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'test',
      'test.json'
    );
    const filePath = Uri.file(relativePath);
    const data = { test: 'test' };

    await FileWriter.writeToFileAsync(filePath, JSON.stringify(data));

    const fileContent = fs.readFileSync(filePath.fsPath, 'utf8');
    assert.strictEqual(fileContent, JSON.stringify(data));
  });

  test('writeToFileAsync should reject with an error if there is a problem', async () => {
    const filePath = Uri.file('/path/to/nonexistent/file.txt');
    const data = 'Hello, World!';

    try {
      await FileWriter.writeToFileAsync(filePath, data);
      assert.fail('Expected an error to be thrown');
    } catch (error) {
      assert.strictEqual(error instanceof Error, true);
    }
  });
});
