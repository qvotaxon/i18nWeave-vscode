import vscode from 'vscode';

/**
 * Represents a store for managing webviews in VS Code.
 */
export default class WebviewStore {
  private static _instance: WebviewStore;
  private static _webviews: Map<string, vscode.WebviewPanel> = new Map();

  private constructor() {}

  /**
   * Returns the singleton instance of WebviewStore.
   * @returns The singleton instance of WebviewStore.
   */
  public static getInstance(): WebviewStore {
    if (!WebviewStore._instance) {
      WebviewStore._instance = new WebviewStore();
    }
    return WebviewStore._instance;
  }

  /**
   * Adds a webview to the store.
   * @param uri - The URI of the webview.
   * @param panel - The webview panel to add.
   */
  public addWebview(uri: vscode.Uri, panel: vscode.WebviewPanel): void {
    const fsPath = uri.fsPath;
    WebviewStore._webviews.set(fsPath, panel);
  }

  /**
   * Retrieves a webview from the store.
   * @param uri - The URI of the webview.
   * @returns The webview panel if found, otherwise undefined.
   */
  public getWebview(uri: vscode.Uri): vscode.WebviewPanel | undefined {
    const fsPath = uri.fsPath;
    return WebviewStore._webviews.get(fsPath);
  }

  /**
   * Removes a webview from the store.
   * @param uri - The URI of the webview to remove.
   */
  public removeWebview(uri: vscode.Uri): void {
    const fsPath = uri.fsPath;
    WebviewStore._webviews.delete(fsPath);
  }

  /**
   * Clears the webviews stored in the WebviewStore.
   */
  public clear(): void {
    WebviewStore._webviews.clear();
  }
}
