import { FileType } from '@i18n-weave/util/util-enums';

import vscode from 'vscode';

export interface IWebviewFactory {
  createWebview(
    fileType: FileType,
    uri: vscode.Uri
  ): vscode.WebviewPanel | undefined;
}
