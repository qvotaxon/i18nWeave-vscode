import * as fs from 'fs';
import * as vscode from 'vscode';

export default class WebViewService {
  private static _instance: WebViewService;

  private constructor() {}

  /**
   * Returns the singleton instance of WebViewService.
   */
  public static getInstance(): WebViewService {
    if (!WebViewService._instance) {
      WebViewService._instance = new WebViewService();
    }
    return WebViewService._instance;
  }

  /**
   * Opens a JSON file as a table in a webview.
   * 
   * @param uri The URI of the JSON file.
   * @param context The extension context.
   */
  public openJsonAsTable(uri: vscode.Uri, context: vscode.ExtensionContext) {
    const panel = vscode.window.createWebviewPanel(
      'jsonTableView',
      'JSON Table View',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
      }
    );

    const updateWebviewContent = () => {
      fs.readFile(uri.fsPath, 'utf8', (err, data) => {
        if (err) {
          vscode.window.showErrorMessage(`Error reading file: ${err.message}`);
          return;
        }

        try {
          const jsonData = JSON.parse(data);
          panel.webview.html = this.getWebviewContent(jsonData, context.extensionUri);

          panel.webview.onDidReceiveMessage(
            message => {
              if (message.command === 'save') {
                this.saveJsonFile(uri, message.jsonData);
              }
            },
            undefined,
            context.subscriptions
          );
        } catch (e) {
          vscode.window.showErrorMessage(`Error parsing JSON: ${(e as Error).message}`);
        }
      });
    };

    panel.onDidChangeViewState(
      event => {
        if (event.webviewPanel.visible) {
          updateWebviewContent();
        }
      },
      null,
      context.subscriptions
    );

    updateWebviewContent();
  }

  private getWebviewContent(jsonData: any, extensionUri: vscode.Uri): string {
    const tableContent = this.generateTableContent(jsonData);
    const htmlFilePath = vscode.Uri.joinPath(extensionUri, 'media', 'index.html');
    const cssFilePath = vscode.Uri.joinPath(extensionUri, 'media', 'styles.css');
    const jsFilePath = vscode.Uri.joinPath(extensionUri, 'media', 'script.js');

    const htmlContent = fs.readFileSync(htmlFilePath.fsPath, 'utf8')
      .replace('<!-- TABLE_CONTENT -->', tableContent)
      .replace('<!-- STYLESHEET_PATH -->', panel.webview.asWebviewUri(cssFilePath).toString())
      .replace('<!-- SCRIPT_PATH -->', panel.webview.asWebviewUri(jsFilePath).toString());

    return htmlContent;
  }

  private generateTableContent(jsonData: any, parentKey = ''): string {
    let content = '';
    for (const key in jsonData) {
      if (typeof jsonData[key] === 'object') {
        content += this.generateTableContent(jsonData[key], `${parentKey}${key}.`);
      } else {
        content += `<tr>
                <td>${parentKey}${key}</td>
                <td contenteditable="true">${jsonData[key]}</td>
            </tr>`;
      }
    }
    return content;
  }

  private saveJsonFile(uri: vscode.Uri, jsonData: string) {
    fs.writeFile(uri.fsPath, jsonData, 'utf8', err => {
      if (err) {
        vscode.window.showErrorMessage(`Error saving file: ${err.message}`);
      } else {
        vscode.window.showInformationMessage('File saved successfully');
      }
    });
  }
}