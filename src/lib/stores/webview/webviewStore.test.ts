import assert from 'assert';
import vscode from 'vscode';

import WebviewStore from './webviewStore';

suite('WebviewStore', () => {
  let webviewStore: WebviewStore;
  let uri: vscode.Uri;
  let panel: vscode.WebviewPanel;

  setup(() => {
    webviewStore = WebviewStore.getInstance();
    uri = vscode.Uri.file('/path/to/webview');
    panel = {} as vscode.WebviewPanel;
  });

  teardown(() => {
    webviewStore.clear();
  });

  test('should add a webview to the store', () => {
    webviewStore.addWebview(uri, panel);
    const storedPanel = webviewStore.getWebview(uri);
    assert.strictEqual(storedPanel, panel);
  });

  test('should retrieve a webview from the store', () => {
    webviewStore.addWebview(uri, panel);
    const storedPanel = webviewStore.getWebview(uri);
    assert.strictEqual(storedPanel, panel);
  });

  test('should return undefined for a non-existent webview', () => {
    const storedPanel = webviewStore.getWebview(uri);
    assert.strictEqual(storedPanel, undefined);
  });

  test('should remove a webview from the store', () => {
    webviewStore.addWebview(uri, panel);
    webviewStore.removeWebview(uri);
    const storedPanel = webviewStore.getWebview(uri);
    assert.strictEqual(storedPanel, undefined);
  });
});
