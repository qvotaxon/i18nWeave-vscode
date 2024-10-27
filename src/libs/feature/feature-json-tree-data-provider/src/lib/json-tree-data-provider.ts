import vscode from 'vscode';

import JsonTreeItem from './json-tree-item';

export class JsonTreeDataProvider
  implements vscode.TreeDataProvider<JsonTreeItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    JsonTreeItem | undefined | null | void
  > = new vscode.EventEmitter<JsonTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    JsonTreeItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  constructor(private jsonData: any) {}

  getTreeItem(element: JsonTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: JsonTreeItem): Thenable<JsonTreeItem[]> {
    if (!element) {
      // Handle root elements with each namespace as root key
      const rootItems = Object.keys(this.jsonData)
        .sort((a, b) => a.localeCompare(b))
        .map(rootKey =>
          this.createTreeItem(rootKey, this.jsonData[rootKey], rootKey, '')
        );

      // Check for data and add placeholder item if no root items found
      return Promise.resolve(
        rootItems.length > 0 ? rootItems : [this.createPlaceholderItem()]
      );
    }
    return Promise.resolve(element.children || []);
  }

  private createTreeItem(
    key: string,
    value: any,
    namespace: string,
    parentKey: string
  ): JsonTreeItem {
    const fullKey = parentKey ? `${parentKey}.${key}` : key;

    if (typeof value === 'object' && value !== null) {
      const children = Object.keys(value).map(childKey =>
        this.createTreeItem(childKey, value[childKey], namespace, fullKey)
      );
      return new JsonTreeItem(
        key,
        fullKey,
        namespace,
        children,
        vscode.TreeItemCollapsibleState.Collapsed
      );
    } else if (typeof value === 'string' && value.length > 0) {
      return new JsonTreeItem(
        key,
        fullKey,
        namespace,
        [],
        vscode.TreeItemCollapsibleState.None,
        value
      );
    } else {
      // Indicate empty string values
      return new JsonTreeItem(
        key + ' (empty)',
        fullKey,
        namespace,
        [],
        vscode.TreeItemCollapsibleState.None
      );
    }
  }

  private createPlaceholderItem(): JsonTreeItem {
    return new JsonTreeItem(
      'No items found',
      '',
      '',
      [],
      vscode.TreeItemCollapsibleState.None
    );
  }

  /**
   * Refreshes the tree data with new JSON data.
   * @param {any} jsonData - The new JSON data.
   */
  public refresh(jsonData: any): void {
    this.jsonData = jsonData;
    this._onDidChangeTreeData.fire();
  }
}

export default JsonTreeDataProvider;
