import sinon from 'sinon';
import vscode from 'vscode';

import { FileType } from '../../enums/fileType';
import { IWebviewFactory } from '../../interfaces/webviewFactory';
import { IWebviewStore } from '../../interfaces/webviewStore';
import WebviewService from './webviewService';

suite('WebviewService', () => {
  let webviewService: WebviewService;
  let mockWebviewFactory: sinon.SinonStubbedInstance<IWebviewFactory>;
  let mockWebviewStore: sinon.SinonStubbedInstance<IWebviewStore>;

  setup(() => {
    mockWebviewFactory = sinon.createStubInstance<IWebviewFactory>(
      class implements IWebviewFactory {
        createWebview(
          fileType: FileType,
          uri: vscode.Uri
        ): vscode.WebviewPanel | undefined {
          return undefined;
        }
      }
    );
    mockWebviewStore = sinon.createStubInstance<IWebviewStore>(
      class implements IWebviewStore {
        getWebview(): vscode.WebviewPanel | undefined {
          return undefined;
        }
        addWebview() {}
      }
    );
    webviewService = new WebviewService(mockWebviewStore, mockWebviewFactory);
  });

  test('should reveal existing webview if it exists', () => {
    const uri = vscode.Uri.parse('file://test');
    const existingWebviewPanel = {
      reveal: () => {},
    } as unknown as vscode.WebviewPanel;

    mockWebviewStore.getWebview.returns(existingWebviewPanel);
    const existingWebviewPanelSpy = sinon.spy(existingWebviewPanel, 'reveal');

    webviewService.showWebview(FileType.JSON, uri);

    sinon.assert.calledWith(existingWebviewPanelSpy, vscode.ViewColumn.One);
  });

  test('should create and add a new webview if it does not exist', () => {
    const uri = vscode.Uri.parse('file://test');
    const newWebviewPanel = {
      reveal: () => {},
    } as unknown as vscode.WebviewPanel;

    mockWebviewStore.getWebview.returns(undefined);
    const existingWebviewPanelSpy = sinon.spy(newWebviewPanel, 'reveal');
    mockWebviewFactory.createWebview.returns(newWebviewPanel);

    webviewService.showWebview(FileType.JSON, uri);

    sinon.assert.calledWith(mockWebviewStore.addWebview, uri, newWebviewPanel);
    sinon.assert.notCalled(existingWebviewPanelSpy);
  });
});
