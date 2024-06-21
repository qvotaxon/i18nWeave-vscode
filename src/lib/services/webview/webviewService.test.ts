import assert from 'assert';
import fs from 'fs';
import sinon from 'sinon';
import vscode from 'vscode';

import WebViewService from './webviewService';

suite('WebViewService', () => {
  let sandbox: sinon.SinonSandbox;

  setup(() => {
    sandbox = sinon.createSandbox();
  });

  teardown(() => {
    sandbox.restore();
  });

  test('should return a singleton instance', () => {
    const instance1 = WebViewService.getInstance();
    const instance2 = WebViewService.getInstance();
    assert.equal(instance1, instance2);
  });

  suite('openJsonAsTable', () => {
    let readFileStub: sinon.SinonStub;
    let readFileSyncStub: sinon.SinonStub;
    let showErrorMessageStub: sinon.SinonStub;
    let createWebviewPanelStub: sinon.SinonStub;

    setup(() => {
      readFileStub = sandbox.stub(fs, 'readFile');
      readFileSyncStub = sandbox.stub(fs, 'readFileSync');
      showErrorMessageStub = sandbox.stub(vscode.window, 'showErrorMessage');
      createWebviewPanelStub = sandbox
        .stub(vscode.window, 'createWebviewPanel')
        .returns({
          webview: {
            html: '',
            onDidReceiveMessage: sandbox.stub(),
            asWebviewUri: sandbox.stub().returns('webviewUri'),
          },
          onDidChangeViewState: sandbox.stub(),
        } as unknown as vscode.WebviewPanel);
    });

    test('should handle file reading errors', async () => {
      readFileStub.yields(new Error('File not found'));

      const uri = vscode.Uri.file('path/to/file.json');
      const context = {
        subscriptions: [],
      } as unknown as vscode.ExtensionContext;

      WebViewService.getInstance().openJsonAsTable(uri, context);

      assert.ok(
        showErrorMessageStub.calledWith('Error reading file: File not found')
      );
    });

    test('should handle JSON parsing errors', async () => {
      readFileStub.yields(null, 'invalid json');

      const uri = vscode.Uri.file('path/to/file.json');
      const context = {
        subscriptions: [],
      } as unknown as vscode.ExtensionContext;

      WebViewService.getInstance().openJsonAsTable(uri, context);

      assert.ok(
        showErrorMessageStub.calledWith(
          `Error parsing JSON: Unexpected token 'i', "invalid json" is not valid JSON`
        )
      );
    });

    test('should update webview content on panel visibility change', async () => {
      readFileStub.yields(null, '{"key": "value"}');
      readFileSyncStub.returns(
        '<html><!-- TABLE_CONTENT --><!-- STYLESHEET_PATH --><!-- SCRIPT_PATH --></html>'
      );
      const panel = createWebviewPanelStub();
      const onDidChangeViewStateStub =
        panel.onDidChangeViewState as sinon.SinonStub;

      const uri = vscode.Uri.file('path/to/file.json');
      const context = {
        subscriptions: [],
        extensionUri: vscode.Uri.file('path/to/extension'),
      } as unknown as vscode.ExtensionContext;

      WebViewService.getInstance().openJsonAsTable(uri, context);

      const event = { webviewPanel: { visible: true } };
      onDidChangeViewStateStub.callArgWith(0, event);

      assert.ok(panel.webview.html.includes('<td>key</td>'));
      assert.ok(
        panel.webview.html.includes('<td contenteditable="true">value</td>')
      );
    });
  });

  suite('getWebviewContent', () => {
    let readFileSyncStub: sinon.SinonStub;
    let asWebviewUriStub: sinon.SinonStub;

    setup(() => {
      readFileSyncStub = sandbox
        .stub(fs, 'readFileSync')
        .returns(
          '<html><!-- TABLE_CONTENT --><!-- STYLESHEET_PATH --><!-- SCRIPT_PATH --></html>'
        );
      asWebviewUriStub = sandbox.stub().returns('webviewUri');
    });

    teardown(() => {
      sandbox.restore();
    });

    test('should generate correct webview content', () => {
      const panel = {
        webview: { asWebviewUri: asWebviewUriStub },
      } as unknown as vscode.WebviewPanel;
      const jsonData = { key: 'value' };
      const extensionUri = vscode.Uri.file('path/to/extension');

      const content = WebViewService.getInstance().getWebviewContent(
        panel,
        jsonData,
        extensionUri
      );

      assert.ok(content.includes('<td>key</td>'));
      assert.ok(content.includes('<td contenteditable="true">value</td>'));
      assert.ok(content.includes('webviewUri'));
    });
  });

  suite('generateTableContent', () => {
    test('should generate table content for simple JSON', () => {
      const jsonData = { key: 'value' };
      const content =
        WebViewService.getInstance().generateTableContent(jsonData);

      assert.ok(content.includes('<td>key</td>'));
      assert.ok(content.includes('<td contenteditable="true">value</td>'));
    });

    test('should generate table content for nested JSON', () => {
      const jsonData = { parent: { child: 'value' } };
      const content =
        WebViewService.getInstance().generateTableContent(jsonData);

      assert.ok(content.includes('<td>parent.child</td>'));
      assert.ok(content.includes('<td contenteditable="true">value</td>'));
    });
  });

  suite('saveJsonFile', () => {
    let writeFileSyncStub: sinon.SinonStub;
    let showInformationMessageStub: sinon.SinonStub;
    let showErrorMessageStub: sinon.SinonStub;

    setup(() => {
      showInformationMessageStub = sandbox.stub(
        vscode.window,
        'showInformationMessage'
      );
      showErrorMessageStub = sandbox.stub(vscode.window, 'showErrorMessage');
    });

    test('should save JSON file and show success message', () => {
      writeFileSyncStub = sinon.stub(fs, 'writeFileSync');
      const uri = vscode.Uri.file('path/to/file.json');
      const jsonData = '{"key": "value"}';

      WebViewService.getInstance().saveJsonFile(uri, jsonData);

      assert.ok(
        writeFileSyncStub.calledOnceWith(uri.fsPath, jsonData, {
          encoding: 'utf8',
        })
      );
      assert.ok(
        showInformationMessageStub.calledOnceWith('File saved successfully')
      );
    });

    test('should handle file saving errors', () => {
      writeFileSyncStub.throws(new Error('Permission denied'));

      const uri = vscode.Uri.file('path/to/file.json');
      const jsonData = '{"key": "value"}';

      WebViewService.getInstance().saveJsonFile(uri, jsonData);

      assert.ok(
        showErrorMessageStub.calledOnceWith(
          'Error saving file: Permission denied'
        )
      );
    });
  });
});
