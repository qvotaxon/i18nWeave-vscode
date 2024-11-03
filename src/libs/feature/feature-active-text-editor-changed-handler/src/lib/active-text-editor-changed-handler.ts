import vscode from 'vscode';

import { DiagnosticsManager } from '@i18n-weave/feature/feature-diagnostics-manager';
import { EmptyJsonValueSymbolProvider } from '@i18n-weave/feature/feature-empty-json-value-symbol-provider';
import { WebviewFactory } from '@i18n-weave/feature/feature-webview-factory';
import { WebviewService } from '@i18n-weave/feature/feature-webview-service';

import { FileLocationStore } from '@i18n-weave/store/store-file-location-store';
import { WebviewStore } from '@i18n-weave/store/store-webview-store';

import {
  ConfigurationStoreManager,
  GeneralConfiguration,
} from '@i18n-weave/util/util-configuration';
import { FileType } from '@i18n-weave/util/util-enums';

/**
 * Handles the event when the active text editor changes in VS Code.
 *
 * This class listens for changes in the active text editor and performs
 * specific actions based on the type of file and its content. It highlights
 * empty JSON values and shows a webview for JSON files if certain conditions
 * are met.
 */
export class ActiveTextEditorChangedHandler {
  private readonly _diagnosticsManager: DiagnosticsManager;
  private readonly _provider: EmptyJsonValueSymbolProvider;
  private readonly _webviewService: WebviewService;

  constructor(context: vscode.ExtensionContext) {
    this._diagnosticsManager = DiagnosticsManager.getInstance();
    this._provider = new EmptyJsonValueSymbolProvider();
    this._webviewService = new WebviewService(
      WebviewStore.getInstance(),
      new WebviewFactory(context)
    );
  }

  /**
   * Initializes the active text editor change handler.
   *
   * @returns {vscode.Disposable} A disposable that unregisters the handler when disposed.
   *
   * This handler performs the following actions when the active text editor changes:
   * - If the new active editor's document is tracked by the `FileLocationStore`, it retrieves document symbols and highlights empty values.
   * - If the new active editor's document is a JSON file tracked by the `FileLocationStore` and the beta feature for JSON file webview is enabled, it shows a webview for the JSON file.
   */
  public readonly initialize = (): vscode.Disposable => {
    return vscode.window.onDidChangeActiveTextEditor(async editor => {
      if (
        editor &&
        editor.document.uri.scheme === 'file' &&
        editor.document.uri.path.endsWith('.json') &&
        FileLocationStore.getInstance().hasFile(editor.document.uri)
      ) {
        let documentSymbols = await this._provider.provideDocumentSymbols(
          editor.document,
          new vscode.CancellationTokenSource().token
        );

        this._diagnosticsManager.updateDiagnostics(
          editor.document,
          documentSymbols
        );
      }

      if (
        editor &&
        editor.document.uri.scheme === 'file' &&
        editor.document.uri.path.endsWith('.json') &&
        FileLocationStore.getInstance().hasFile(editor.document.uri) &&
        ConfigurationStoreManager.getInstance().getConfig<GeneralConfiguration>(
          'general'
        ).betaFeaturesConfiguration.enableJsonFileWebView
      ) {
        this._webviewService.showWebview(FileType.Json, editor.document.uri);
      }
    });
  };
}
