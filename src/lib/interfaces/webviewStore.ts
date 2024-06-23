import vscode from 'vscode';

export interface IWebviewStore {
  getWebview(uri: vscode.Uri): vscode.WebviewPanel | undefined;
  addWebview(uri: vscode.Uri, webviewPanel: vscode.WebviewPanel): void;
}
