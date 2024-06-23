import vscode from 'vscode';

import { FileType } from '../enums/fileType';

export interface IWebviewFactory {
  createWebview(
    fileType: FileType,
    uri: vscode.Uri
  ): vscode.WebviewPanel | undefined;
}
