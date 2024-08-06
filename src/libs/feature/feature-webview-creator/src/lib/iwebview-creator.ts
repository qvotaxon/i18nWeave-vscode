import vscode from 'vscode';

export interface IWebviewCreator {
  createWebview(uri: vscode.Uri): vscode.WebviewPanel;
}
