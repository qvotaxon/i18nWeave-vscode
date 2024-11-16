import * as vscode from 'vscode';

import { LogLevel, Logger } from '@i18n-weave/util/util-logger';

export class EmptyJsonValueSymbolProvider
  implements vscode.DocumentSymbolProvider
{
  private readonly _logger: Logger;

  constructor() {
    this._logger = Logger.getInstance();
  }

  provideDocumentSymbols(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.DocumentSymbol[]> {
    const symbols: vscode.DocumentSymbol[] = [];

    try {
      // Parse the JSON document
      const jsonContent = JSON.parse(document.getText());

      // Recursively search for empty strings
      this.findEmptyStrings(jsonContent, symbols, document);
    } catch (error) {
      this._logger.log(
        LogLevel.VERBOSE,
        `Error parsing JSON: ${error}`,
        EmptyJsonValueSymbolProvider.name
      );
    }

    return symbols;
  }

  /**
   * Recursively finds empty string values in the JSON object and
   * collects their ranges as document symbols.
   */
  private findEmptyStrings(
    obj: any,
    symbols: vscode.DocumentSymbol[],
    document: vscode.TextDocument,
    parentKeyPath: string = ''
  ) {
    for (const key in obj) {
      const keyPath = parentKeyPath ? `${parentKeyPath}.${key}` : key;

      if (typeof obj[key] === 'object' && obj[key] !== null) {
        // Recursively search in nested objects
        this.findEmptyStrings(obj[key], symbols, document, keyPath);
      } else if (obj[key] === '') {
        // Find the range of the empty value in the document
        const keyPattern = new RegExp(`"${key}"\\s*:\\s*""`, 'g');
        const match = keyPattern.exec(document.getText());

        if (match) {
          const startPos = document.positionAt(match.index);
          const endPos = document.positionAt(match.index + match[0].length);
          const range = new vscode.Range(startPos, endPos);

          // Create a document symbol for the empty string
          const symbol = new vscode.DocumentSymbol(
            keyPath,
            'Empty value',
            vscode.SymbolKind.String,
            range,
            range
          );

          symbols.push(symbol);
        }
      }
    }
  }
}
