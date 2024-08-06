import * as Sentry from '@sentry/node';
import fs from 'fs';
import vscode from 'vscode';

import { IWebviewCreator } from '@i18n-weave/feature/feature-webview-creator';

import { WebviewStore } from '@i18n-weave/store/store-webview-store';

export class JsonWebviewCreator implements IWebviewCreator {
  private context: vscode.ExtensionContext;
  private panel: vscode.WebviewPanel | undefined;
  private webviewStore: WebviewStore;

  /**
   * Creates an instance of JsonWebviewCreator.
   * @param {vscode.ExtensionContext} context - The extension context.
   */
  public constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.webviewStore = WebviewStore.getInstance();
  }

  /**
   * Creates a webview panel for JSON file.
   * @param {vscode.Uri} uri - The URI of the JSON file.
   * @returns {vscode.WebviewPanel} - The created webview panel.
   */
  public createWebview(uri: vscode.Uri): vscode.WebviewPanel {
    this.panel = vscode.window.createWebviewPanel(
      'jsonWebview',
      `JSON: ${uri.fsPath}`,
      vscode.ViewColumn.One,
      {
        enableScripts: true,
      }
    );
    this.panel.webview.html = this.updateWebviewContent(uri);
    this.registerEventHandlers(this.panel, uri);
    return this.panel;
  }

  /**
   * Updates the webview content with JSON data.
   * @param {vscode.Uri} uri - The URI of the JSON file.
   * @returns {string} - The updated webview content.
   */
  private updateWebviewContent(uri: vscode.Uri): string {
    const data = fs.readFileSync(uri.fsPath, {
      encoding: 'utf8',
    });

    try {
      const jsonData = JSON.parse(data);
      return this.generateWebviewContent(jsonData);
    } catch (error) {
      vscode.window.showErrorMessage(
        `Error parsing JSON: ${(error as Error).message}`
      );

      Sentry.captureException(error);
      return '';
    }
  }

  /**
   * Generates the webview content with JSON data.
   * @param {any} jsonData - The JSON data.
   * @returns {string} - The generated webview content.
   */
  private generateWebviewContent(jsonData: any): string {
    const tableContent = this.generateTableContent(jsonData);
    const mediaPath = vscode.Uri.joinPath(
      this.context.extensionUri,
      'out',
      'media'
    );

    const htmlContent = fs
      .readFileSync(vscode.Uri.joinPath(mediaPath, 'index.html').fsPath, 'utf8')
      .replace('<!-- TABLE_CONTENT -->', tableContent)
      .replace(
        '<!-- STYLESHEET_PATH -->',
        this.panel!.webview.asWebviewUri(
          vscode.Uri.joinPath(mediaPath, 'styles.css')
        ).toString()
      )
      .replace(
        '<!-- SCRIPT_PATH -->',
        this.panel!.webview.asWebviewUri(
          vscode.Uri.joinPath(mediaPath, 'script.js')
        ).toString()
      );

    return htmlContent;
  }

  /**
   * Generates the table content for JSON data.
   * @param {any} jsonData - The JSON data.
   * @param {string} parentKey - The parent key for nested objects.
   * @returns {string} - The generated table content.
   */
  private generateTableContent(jsonData: any, parentKey = ''): string {
    let content = '';
    for (const key in jsonData) {
      if (typeof jsonData[key] === 'object') {
        content += this.generateTableContent(
          jsonData[key],
          `${parentKey}${key}.`
        );
      } else {
        content += `<tr>
                    <td>${parentKey}${key}</td>
                    <td contenteditable="true">${jsonData[key]}</td>
                </tr>`;
      }
    }
    return content;
  }

  /**
   * Saves the JSON file.
   * @param {vscode.Uri} uri - The URI of the JSON file.
   * @param {string} jsonData - The JSON data to save.
   */
  private saveJsonFile(uri: vscode.Uri, jsonData: string): void {
    try {
      fs.writeFileSync(uri.fsPath, jsonData, {
        encoding: 'utf8',
      });

      vscode.window.showInformationMessage('File saved successfully');
    } catch (err) {
      vscode.window.showErrorMessage(
        `Error saving file: ${(err as Error).message}`
      );
    }
  }

  /**
   * Registers event handlers for the webview panel.
   * @param {vscode.WebviewPanel} panel - The webview panel.
   * @param {vscode.Uri} uri - The URI of the JSON file.
   */
  public registerEventHandlers(
    panel: vscode.WebviewPanel,
    uri: vscode.Uri
  ): void {
    vscode.workspace.createFileSystemWatcher(uri.fsPath).onDidChange(() => {
      panel.webview.html = this.updateWebviewContent(uri);
    });

    panel.onDidChangeViewState(
      event => {
        if (event.webviewPanel.visible && event.webviewPanel.active) {
          panel.webview.html = this.updateWebviewContent(uri);
        } else if (!event.webviewPanel.active) {
          this.webviewStore.removeWebview(uri);
        }
      },
      null,
      this.context.subscriptions
    );

    panel.onDidDispose(() => {
      this.webviewStore.removeWebview(uri);
      this.panel = undefined;
    });

    panel.webview.onDidReceiveMessage(
      message => {
        if (message.command === 'save') {
          this.saveJsonFile(uri, message.jsonData);
        }
      },
      undefined,
      this.context.subscriptions
    );
  }
}
