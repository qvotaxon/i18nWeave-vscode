import vscode from 'vscode';

import { FileType } from '../../enums/fileType';
import { IWebviewFactory } from '../../interfaces/webviewFactory';
import { IWebviewStore } from '../../interfaces/webviewStore';

/**
 * Service class for managing webviews.
 */
export default class WebviewService {
  private webviewStore: IWebviewStore;
  private webviewFactory: IWebviewFactory;

  /**
   * Creates an instance of WebviewService.
   * @param webviewStore The webview store.
   * @param webviewFactory The webview factory.
   */
  constructor(webviewStore: IWebviewStore, webviewFactory: IWebviewFactory) {
    this.webviewStore = webviewStore;
    this.webviewFactory = webviewFactory;
  }

  /**
   * Shows the webview for the specified file type and URI.
   * If the webview already exists, it will be revealed. Otherwise, a new webview will be created.
   * @param fileType The file type.
   * @param uri The URI of the file.
   */
  public showWebview(fileType: FileType, uri: vscode.Uri): void {
    let webviewPanel = this.webviewStore.getWebview(uri);

    if (webviewPanel) {
      webviewPanel.reveal(vscode.ViewColumn.One);
    } else {
      webviewPanel = this.webviewFactory.createWebview(fileType, uri);
      if (webviewPanel) {
        this.webviewStore.addWebview(uri, webviewPanel);
      }
    }
  }
}
