import vscode from 'vscode';

let decorationType: vscode.TextEditorDecorationType | undefined;

export function highlightEmptyValues(
  document: vscode.TextDocument,
  symbols: vscode.DocumentSymbol[]
) {
  const editor =
    vscode.window.activeTextEditor || vscode.window.visibleTextEditors[0];

  if (editor && editor.document === document) {
    // Dispose of the previous decoration if it exists
    if (decorationType) {
      decorationType.dispose();
    }

    // Define the new decoration style
    decorationType = vscode.window.createTextEditorDecorationType({
      borderColor: 'rgba(255, 0, 0, 0.8)',
      borderStyle: 'solid',
      borderWidth: '1px',
      backgroundColor: 'rgba(255, 0, 0, 0.2)',
    });

    // Convert DocumentSymbols to DecorationOptions
    const decorationsArray: vscode.DecorationOptions[] = symbols.map(
      symbol => ({
        range: symbol.range,
        hoverMessage: `Empty value for key "${symbol.name}"`,
      })
    );

    // Apply the decorations to highlight empty values
    editor.setDecorations(decorationType, decorationsArray);
  }
}
