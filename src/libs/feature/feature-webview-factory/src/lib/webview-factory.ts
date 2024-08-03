import WebviewCreator from 'lib/interfaces/webviewCreator';
import JsonWebviewCreator from 'lib/services/webview/jsonWebviewCreator';
import vscode from 'vscode';

import { FileType } from '@i18n-weave/util/util-enums';

/**
 * Factory class for creating webviews.
 */
export class WebviewFactory {
  private creators: Map<FileType, WebviewCreator>;

  /**
   * Creates an instance of WebviewFactory.
   * @param context The extension context.
   */
  constructor(context: vscode.ExtensionContext) {
    this.creators = new Map();
    this.creators.set(FileType.Json, new JsonWebviewCreator(context));
  }

  /**
   * Creates a webview panel based on the file type.
   * @param fileType The file type.
   * @param uri The URI of the file.
   * @returns The created webview panel, or undefined if the creator is not found.
   */
  public createWebview(
    fileType: FileType,
    uri: vscode.Uri
  ): vscode.WebviewPanel | undefined {
    const creator = this.creators.get(fileType);
    return creator ? creator.createWebview(uri) : undefined;
  }
}
