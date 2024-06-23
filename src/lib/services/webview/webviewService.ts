import vscode from 'vscode';

import { FileType } from '../../enums/fileType';
import WebviewFactory from '../../factories/webviewFactory';
import WebviewStore from '../../stores/webview/webviewStore';

/**
 * Service class for managing webviews.
 */
export default class WebviewService {
  private webviewStore: WebviewStore;
  private webviewFactory: WebviewFactory;

  /**
   * Creates an instance of WebviewService.
   * @param context The extension context.
   */
  constructor(context: vscode.ExtensionContext) {
    this.webviewStore = WebviewStore.getInstance();
    this.webviewFactory = new WebviewFactory(context);
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
