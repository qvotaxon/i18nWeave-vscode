import * as assert from 'assert';
import { Uri } from 'vscode';
import TypeScriptFileChangeHandler from '../../fileChangeHandlers/typeScriptFileChangeHandler';

suite('TypeScriptFileChangeHandler Tests', () => {
  test('handleFileChangeAsync should throw an error', async () => {
    const handler = new TypeScriptFileChangeHandler();
    const changeFileLocation = {} as Uri;

    try {
      await handler.handleFileChangeAsync(changeFileLocation);
      assert.fail('Expected an error to be thrown');
    } catch (error) {
      assert.strictEqual(error instanceof Error, true);
      assert.strictEqual((error as Error).message, 'Method not implemented.');
    }
  });
});
