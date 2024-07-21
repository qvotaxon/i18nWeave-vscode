import assert from 'assert';
import sinon from 'sinon';
import vscode from 'vscode';

import * as windowUtilities from './windowUtilities';

suite('WindowUtilities', () => {
  let sandbox: sinon.SinonSandbox;

  setup(() => {
    sandbox = sinon.createSandbox();
  });

  teardown(() => {
    sandbox.restore();
  });

  test('showOpenDialog should return undefined if folderSelectionPrompt is falsy', async () => {
    sandbox.stub(vscode.window, 'showQuickPick').resolves(undefined);

    const result = await windowUtilities.showOpenDialog('Select Folder');

    assert.strictEqual(result, undefined);
  });

  test('showOpenDialog should return undefined if folderUri is undefined', async () => {
    sandbox.stub(vscode.window, 'showQuickPick').resolves({} as any);
    sandbox.stub(vscode.window, 'showOpenDialog').resolves(undefined);

    const result = await windowUtilities.showOpenDialog('Select Folder');

    assert.strictEqual(result, undefined);
  });

  test('showOpenDialog should return and array with length one if only a single folder was picked', async () => {
    const folderUri = [vscode.Uri.file('/path/to/folder')];
    sandbox.stub(vscode.window, 'showQuickPick').resolves({} as any);
    sandbox.stub(vscode.window, 'showOpenDialog').resolves(folderUri);

    const result = await windowUtilities.showOpenDialog('Select Folder');

    assert.deepEqual(result, ['/path/to/folder']);
  });

  test('showOpenDialog should return an array of folderUri.fsPath if folderUri has length greater than 1', async () => {
    const folderUri = [
      vscode.Uri.file('/path/to/folder1'),
      vscode.Uri.file('/path/to/folder2'),
    ];
    sandbox.stub(vscode.window, 'showQuickPick').resolves({} as any);
    sandbox.stub(vscode.window, 'showOpenDialog').resolves(folderUri);

    const result = await windowUtilities.showOpenDialog('Select Folder', true);

    assert.deepStrictEqual(result, ['/path/to/folder1', '/path/to/folder2']);
  });
});
