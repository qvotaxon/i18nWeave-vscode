import vscode from 'vscode';

import { FileType } from '../enums/fileType';
import WebviewCreator from '../interfaces/webviewCreator';
import JsonWebviewCreator from '../services/webview/jsonWebviewCreator';

/**
 * Factory class for creating webviews.
 */
export default class WebviewFactory {
  private creators: Map<FileType, WebviewCreator>;

  /**
   * Creates an instance of WebviewFactory.
   * @param context The extension context.
   */
  constructor(context: vscode.ExtensionContext) {
    this.creators = new Map();
    this.creators.set(FileType.JSON, new JsonWebviewCreator(context));
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
