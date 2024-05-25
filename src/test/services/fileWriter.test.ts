import * as assert from 'assert';
import * as fs from 'fs';
import { Uri } from 'vscode';
import FileWriter from '../../services/fileWriter';
import * as mock from 'mock-fs';

suite('FileWriter Tests', () => {
  setup(() => {
    mock.default({
      '/path/to/file.txt': 'Hello, World!',
    });
  });

  teardown(() => {
    mock.restore();
  });

  test('writeToFileAsync should write data to a file', async () => {
    const filePath = Uri.file('/path/to/file.txt');
    const data = 'Hello, World!';

    await FileWriter.writeToFileAsync(filePath, data);

    const fileContent = fs.readFileSync(filePath.fsPath, 'utf8');
    assert.strictEqual(fileContent, data);
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
