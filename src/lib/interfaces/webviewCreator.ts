import vscode from 'vscode';

export default interface WebviewCreator {
  createWebview(uri: vscode.Uri): vscode.WebviewPanel;
}
