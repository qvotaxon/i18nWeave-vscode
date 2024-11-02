import vscode from 'vscode';

import { DiagnosticsManager } from '@i18n-weave/feature/feature-diagnostics-manager';
import { EmptyJsonValueSymbolProvider } from '@i18n-weave/feature/feature-empty-json-value-symbol-provider';

import { FileLocationStore } from '@i18n-weave/store/store-file-location-store';

import { highlightEmptyValues } from '@i18n-weave/util/util-highlight-missing-values';

export class TextDocumentChangedHandler {
  private readonly _provider: EmptyJsonValueSymbolProvider;
  private readonly _diagnosticsManager: DiagnosticsManager;

  constructor() {
    this._provider = new EmptyJsonValueSymbolProvider();
    this._diagnosticsManager = DiagnosticsManager.getInstance();
  }

  public readonly initialize = (): vscode.Disposable => {
    return vscode.workspace.onDidChangeTextDocument(async event => {
      if (
        event.document.uri.scheme === 'file' &&
        event.document.languageId === 'json' &&
        FileLocationStore.getInstance().hasFile(event.document.uri)
      ) {
        let documentSymbols = await this._provider.provideDocumentSymbols(
          event.document,
          new vscode.CancellationTokenSource().token
        );

        this._diagnosticsManager.updateDiagnostics(
          event.document,
          documentSymbols
        );

        if (documentSymbols) {
          highlightEmptyValues(event.document, documentSymbols);
        }
      }
    });
  };
}
