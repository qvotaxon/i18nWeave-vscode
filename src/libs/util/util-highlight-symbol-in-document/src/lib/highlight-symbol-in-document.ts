import vscode from 'vscode';

export async function highlightSymbolInDocumentAsync(
  document: vscode.TextDocument,
  fullKeyPath: string
) {
  const uri = document.uri;

  // Split the fullKeyPath and remove the first segment (namespace)
  const pathSegments = fullKeyPath.split('.').slice(1); // Remove the namespace part

  const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
    'vscode.executeDocumentSymbolProvider',
    uri
  );

  if (symbols) {
    const symbol = findSymbolByFullPath(symbols, pathSegments);

    if (symbol) {
      const range = symbol.range;
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

/**
 * Recursively searches for a symbol matching the full key path, starting from the stripped path segments.
 */
function findSymbolByFullPath(
  symbols: vscode.DocumentSymbol[],
  pathSegments: string[]
): vscode.DocumentSymbol | undefined {
  if (pathSegments.length === 0) return undefined;

  const [currentSegment, ...remainingSegments] = pathSegments;
  const matchingSymbol = symbols.find(sym => sym.name === currentSegment);

  if (!matchingSymbol) return undefined;
  if (remainingSegments.length === 0) return matchingSymbol;

  return findSymbolByFullPath(matchingSymbol.children, remainingSegments);
}
