import vscode from 'vscode';

export async function highlightSymbolInDocumentAsync(
  document: vscode.TextDocument,
  fullKeyPath: string
) {
  const uri = document.uri;
  const symbols = await vscode.commands.executeCommand<
    vscode.SymbolInformation[]
  >('vscode.executeDocumentSymbolProvider', uri);
  if (symbols) {
    const symbol = symbols.find(
      sym => sym.name === fullKeyPath.split('.').pop()
    );
    if (symbol) {
      const range = symbol.location.range;
      const editor = vscode.window.activeTextEditor;

      if (editor) {
        editor.revealRange(range);
        editor.selection = new vscode.Selection(range.start, range.end);
      }
    } else {
      vscode.window.showErrorMessage(
        `Key "${fullKeyPath}" not found in the JSON file ${uri.fsPath}.`
      );
    }
  }
}
