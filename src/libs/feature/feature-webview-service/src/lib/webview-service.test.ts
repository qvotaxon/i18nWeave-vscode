import sinon from 'sinon';
import vscode from 'vscode';

import { IWebviewFactory } from '@i18n-weave/feature/feature-webview-factory';

import { IWebviewStore } from '@i18n-weave/store/store-webview-store';

import { FileType } from '@i18n-weave/util/util-enums';

import { WebviewService } from './webview-service';

suite('WebviewService', () => {
  let webviewService: WebviewService;
  let mockWebviewFactory: sinon.SinonStubbedInstance<IWebviewFactory>;
  let mockWebviewStore: sinon.SinonStubbedInstance<IWebviewStore>;

  setup(() => {
    mockWebviewFactory = sinon.createStubInstance<IWebviewFactory>(
      class implements IWebviewFactory {
        createWebview(
          _fileType: FileType,
          _uri: vscode.Uri
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
        addWebview() {
          /* Test has no requirement for the method 'addWebview' */
        }
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

    webviewService.showWebview(FileType.Json, uri);

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

    webviewService.showWebview(FileType.Json, uri);

    sinon.assert.calledWith(mockWebviewStore.addWebview, uri, newWebviewPanel);
    sinon.assert.notCalled(existingWebviewPanelSpy);
  });
});
