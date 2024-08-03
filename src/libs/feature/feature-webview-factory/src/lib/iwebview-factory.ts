import vscode from 'vscode';

import { FileType } from '@i18n-weave/util/util-enums';

export interface IWebviewFactory {
  createWebview(
    fileType: FileType,
    uri: vscode.Uri
  ): vscode.WebviewPanel | undefined;
}
