import assert from 'assert';
import fs from 'fs';
import WebviewStore from 'lib/stores/webview/webviewStore';
import sinon from 'sinon';
import vscode from 'vscode';

import { JsonWebviewCreator } from './json-webview-creator';

suite('JsonWebviewCreator Tests', () => {
  let context: vscode.ExtensionContext;
  let webviewCreator: JsonWebviewCreator;
  let webviewStoreStub: sinon.SinonStubbedInstance<WebviewStore>;
  let uri: vscode.Uri;

  setup(() => {
    context = <vscode.ExtensionContext>{};
    webviewStoreStub = sinon.stub(WebviewStore.getInstance());
    sinon.stub(WebviewStore, 'getInstance').returns(webviewStoreStub);

    webviewCreator = new JsonWebviewCreator(context);
    uri = vscode.Uri.parse('file://fake/path');
  });

  teardown(() => {
    sinon.restore();
  });

  test('should generate table content for JSON data', () => {
    const jsonData = { key: 'value', nested: { nestedKey: 'nestedValue' } };
    //@ts-ignore
    const tableContent = webviewCreator.generateTableContent(jsonData);

    assert.strictEqual(tableContent.includes('<td>key</td>'), true);
    assert.strictEqual(
      tableContent.includes('<td>nested.nestedKey</td>'),
      true
    );
  });

  test('should save JSON file', () => {
    const jsonData = JSON.stringify({ key: 'value' });
    const writeFileSyncStub = sinon.stub(fs, 'writeFileSync');
    const showInformationMessageStub = sinon.stub(
      vscode.window,
      'showInformationMessage'
    );

    webviewCreator['saveJsonFile'](uri, jsonData);

    assert.strictEqual(
      writeFileSyncStub.calledOnceWith(uri.fsPath, jsonData, {
        encoding: 'utf8',
      }),
      true
    );
    assert.strictEqual(
      showInformationMessageStub.calledOnceWith('File saved successfully'),
      true
    );
  });

  test('should handle error while saving JSON file', () => {
    const jsonData = JSON.stringify({ key: 'value' });
    const errorMessage = 'Error saving file';
    sinon.stub(fs, 'writeFileSync').throws(new Error(errorMessage));
    const showErrorMessageStub = sinon.stub(vscode.window, 'showErrorMessage');

    webviewCreator['saveJsonFile'](uri, jsonData);

    assert.strictEqual(
      showErrorMessageStub.calledOnceWith(`Error saving file: ${errorMessage}`),
      true
    );
  });
});
