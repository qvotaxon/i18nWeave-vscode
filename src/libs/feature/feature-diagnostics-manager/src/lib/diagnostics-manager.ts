import vscode from 'vscode';

import { LogLevel, Logger } from '@i18n-weave/util/util-logger';

export class DiagnosticsManager {
  private static _instance: DiagnosticsManager;
  private readonly _logger: Logger;
  private readonly _diagnosticCollection: vscode.DiagnosticCollection;

  private constructor() {
    this._logger = Logger.getInstance();
    this._diagnosticCollection =
      vscode.languages.createDiagnosticCollection('missingValues');
  }

  public static getInstance(): DiagnosticsManager {
    if (!DiagnosticsManager._instance) {
      DiagnosticsManager._instance = new DiagnosticsManager();
    }
    return DiagnosticsManager._instance;
  }

  public async updateDiagnostics(
    document: vscode.TextDocument,
    documentSymbols: vscode.DocumentSymbol[] | null | undefined
  ) {
    this._logger.log(LogLevel.INFO, `Updating diagnostics for ${document.uri}`);

    if (documentSymbols) {
      // Create diagnostics for empty values
      const diagnostics: vscode.Diagnostic[] = documentSymbols.map(symbol => {
        const diagnostic = new vscode.Diagnostic(
          symbol.range,
          `Empty value for key "${symbol.name}"`,
          vscode.DiagnosticSeverity.Error
        );

        // Optional: Customize the squiggly line appearance
        diagnostic.source = 'i18nWeave';

        return diagnostic;
      });

      // Update the diagnostic collection for this document
      this._diagnosticCollection.set(document.uri, diagnostics);
    } else {
      // Clear diagnostics if no issues are found
      this._diagnosticCollection.delete(document.uri);
    }
  }
}
