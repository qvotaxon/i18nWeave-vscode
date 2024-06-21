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
          panel.webview.html = this.getWebviewContent(
            panel,
            jsonData,
            context.extensionUri
          );

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
          vscode.window.showErrorMessage(
            `Error parsing JSON: ${(e as Error).message}`
          );
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

  public getWebviewContent(
    panel: vscode.WebviewPanel,
    jsonData: any,
    extensionUri: vscode.Uri
  ): string {
    const tableContent = this.generateTableContent(jsonData);
    const htmlFilePath = vscode.Uri.joinPath(
      extensionUri,
      'out',
      'media',
      'index.html'
    );
    const cssFilePath = vscode.Uri.joinPath(
      extensionUri,
      'out',
      'media',
      'styles.css'
    );
    const jsFilePath = vscode.Uri.joinPath(
      extensionUri,
      'out',
      'media',
      'script.js'
    );

    const htmlContent = fs
      .readFileSync(htmlFilePath.fsPath, 'utf8')
      .replace('<!-- TABLE_CONTENT -->', tableContent)
      .replace(
        '<!-- STYLESHEET_PATH -->',
        panel.webview.asWebviewUri(cssFilePath).toString()
      )
      .replace(
        '<!-- SCRIPT_PATH -->',
        panel.webview.asWebviewUri(jsFilePath).toString()
      );

    return htmlContent;
  }

  public generateTableContent(jsonData: any, parentKey = ''): string {
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

  public saveJsonFile(uri: vscode.Uri, jsonData: string) {
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
}
