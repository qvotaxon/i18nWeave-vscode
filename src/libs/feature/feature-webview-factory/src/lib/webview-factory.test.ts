import assert from 'assert';
import sinon from 'sinon';
import vscode from 'vscode';

import { IWebviewCreator } from '@i18n-weave/feature/feature-webview-creator';

import { FileType } from '@i18n-weave/util/util-enums';

import { WebviewFactory } from './webview-factory';

suite('WebviewFactory', () => {
  let webviewFactory: WebviewFactory;
  let context: vscode.ExtensionContext;
  let jsonWebviewCreator: IWebviewCreator;

  setup(() => {
    context = {} as vscode.ExtensionContext;
    jsonWebviewCreator = {
      createWebview: sinon.stub().returns({} as vscode.WebviewPanel),
    };
    webviewFactory = new WebviewFactory(context);
    webviewFactory['creators'].set(FileType.Translation, jsonWebviewCreator);
  });

  test('should create a webview panel for JSON file type', () => {
    const uri = vscode.Uri.file('/path/to/file.json');
    const webviewPanel = webviewFactory.createWebview(
      FileType.Translation,
      uri
    );
    assert.ok(webviewPanel);
    //@ts-ignore
    sinon.assert.calledOnce(jsonWebviewCreator.createWebview);
    //@ts-ignore
    sinon.assert.calledWithExactly(jsonWebviewCreator.createWebview, uri);
  });

  test('should return undefined for unknown file type', () => {
    const uri = vscode.Uri.file('/path/to/file.txt');
    //@ts-ignore
    const webviewPanel = webviewFactory.createWebview(FileType.TEXT, uri);
    assert.strictEqual(webviewPanel, undefined);
  });
});
