import fs from 'fs';
import vscode from 'vscode';

export default class WebViewService {
  private static _instance: WebViewService;

  private constructor() {
    // Private constructor to prevent instantiation
  }

  /**
   * Returns the singleton instance of WebViewService.
   */
  public static getInstance(): WebViewService {
    if (!WebViewService._instance) {
      WebViewService._instance = new WebViewService();
    }
    return WebViewService._instance;
  }

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
          panel.webview.html = WebViewService.getWebviewContent(
            jsonData,
            context.extensionUri
          );

          panel.webview.onDidReceiveMessage(
            message => {
              switch (message.command) {
                case 'save':
                  WebViewService.saveJsonFile(uri, message.jsonData);
                  return;
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

  private static getWebviewContent(
    jsonData: any,
    extensionUri: vscode.Uri
  ): string {
    const tableContent = WebViewService.generateTableContent(jsonData);
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JSON Table View</title>
    <style>
        body {
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            font-family: var(--vscode-editor-font-family);
            font-size: var(--vscode-editor-font-size);
        }

        table {
            width: 100%;
            border-collapse: collapse;
            color: var(--vscode-editor-foreground);
        }

        th, td {
            border: 1px solid var(--vscode-editor-foreground);
            padding: 8px;
            text-align: left;
        }

        th {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
        }

        td[contenteditable="true"] {
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
        }

        .fab {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 15px 20px;
            cursor: pointer;
            font-size: var(--vscode-editor-font-size);
            border-radius: 50%;
            box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 100;
        }

        .fab:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
    </style>
</head>
<body>
    <table id="jsonTable">
        <thead>
            <tr>
                <th>Key</th>
                <th>Value</th>
            </tr>
        </thead>
        <tbody>
            ${tableContent}
        </tbody>
    </table>
    <button class="fab" id="saveButton">💾</button>
    <script>
        const vscode = acquireVsCodeApi();

        document.getElementById('saveButton').addEventListener('click', () => {
            const table = document.getElementById('jsonTable');
            const jsonData = {};
            for (let i = 1, row; row = table.rows[i]; i++) {
                const key = row.cells[0].innerText;
                const value = row.cells[1].innerText;
                setNestedValue(jsonData, key.split('.'), value);
            }
            vscode.postMessage({ command: 'save', jsonData: JSON.stringify(jsonData, null, 2) });
        });

        /**
         * Sets a nested value in an object based on the provided path.
         * 
         * @param {Object} obj - The object to set the value in.
         * @param {Array} path - An array of keys representing the path.
         * @param {string} value - The value to set.
         */
        function setNestedValue(obj, path, value) {
            const lastKey = path.pop();
            const lastObj = path.reduce((obj, key) => obj[key] = obj[key] || {}, obj);
            lastObj[lastKey] = value;
        }
    </script>
</body>
</html>
`;
  }

  private static generateTableContent(jsonData: any, parentKey = ''): string {
    let content = '';
    for (const key in jsonData) {
      if (typeof jsonData[key] === 'object') {
        content += WebViewService.generateTableContent(
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

  private static saveJsonFile(uri: vscode.Uri, jsonData: string) {
    fs.writeFile(uri.fsPath, jsonData, 'utf8', err => {
      if (err) {
        vscode.window.showErrorMessage(`Error saving file: ${err.message}`);
      } else {
        vscode.window.showInformationMessage('File saved successfully');
      }
    });
  }
}
