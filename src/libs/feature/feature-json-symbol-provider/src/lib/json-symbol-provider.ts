import vscode from 'vscode';

export class JsonSymbolProvider implements vscode.DocumentSymbolProvider {
  provideDocumentSymbols(
    document: vscode.TextDocument
  ): vscode.ProviderResult<vscode.SymbolInformation[]> {
    const text = document.getText();
    const jsonObject = JSON.parse(text);
    const symbols = this.parseJsonObject(jsonObject, '', document.uri, text);
    return symbols;
  }

  private parseJsonObject(
    obj: any,
    parentKey: string,
    uri: vscode.Uri,
    originalText: string
  ): vscode.SymbolInformation[] {
    const symbols: vscode.SymbolInformation[] = [];
    for (const key in obj) {
      const value = obj[key];
      const fullKey = parentKey ? `${parentKey}.${key}` : key;

      const startPos = this.findKeyPosition(originalText, fullKey);
      const location = new vscode.Location(uri, startPos);
      const kind =
        typeof value === 'object' && value !== null
          ? vscode.SymbolKind.Object
          : vscode.SymbolKind.Field;

      symbols.push(new vscode.SymbolInformation(key, kind, fullKey, location));
      if (typeof value === 'object' && value !== null) {
        symbols.push(
          ...this.parseJsonObject(value, fullKey, uri, originalText)
        );
      }
    }
    return symbols;
  }

  private findKeyPosition(text: string, fullKey: string): vscode.Position {
    const keyPath = fullKey.split('.');
    let currentPosition = 0;

    for (const key of keyPath) {
      const regex = new RegExp(`"(${key})"\\s*:`, 'g');
      regex.lastIndex = currentPosition;

      const match = regex.exec(text);
      if (!match) {
        return new vscode.Position(0, 0); // Fallback if not found
      }

      currentPosition = match.index + match[0].length;
    }

    return this.indexToPosition(
      currentPosition - keyPath[keyPath.length - 1].length,
      text
    );
  }

  private indexToPosition(index: number, text: string): vscode.Position {
    const lines = text.slice(0, index).split('\n');
    return new vscode.Position(
      lines.length - 1,
      lines[lines.length - 1].length
    );
  }
}

export default JsonSymbolProvider;
