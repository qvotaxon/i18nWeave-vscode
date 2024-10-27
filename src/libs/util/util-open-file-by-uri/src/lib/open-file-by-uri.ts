import vscode from 'vscode';

export async function openFileByUriAsync(
  uri: vscode.Uri
): Promise<vscode.TextDocument> {
  const document = await vscode.workspace.openTextDocument(uri);
  await vscode.window.showTextDocument(document);
  return document;
}
