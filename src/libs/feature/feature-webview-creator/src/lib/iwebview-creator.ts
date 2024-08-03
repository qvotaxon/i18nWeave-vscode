import vscode from 'vscode';

export default interface IWebviewCreator {
  createWebview(uri: vscode.Uri): vscode.WebviewPanel;
}
