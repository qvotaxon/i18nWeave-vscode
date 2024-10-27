import vscode from 'vscode';

import JsonTreeItem from './json-tree-item';

export class JsonTreeDataProvider
  implements vscode.TreeDataProvider<JsonTreeItem>
{
  constructor(private jsonData: any) {}

  getTreeItem(element: JsonTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: JsonTreeItem): Thenable<JsonTreeItem[]> {
    if (!element) {
      // For root elements, each will have its own namespace (root key)
      return Promise.resolve(
        Object.keys(this.jsonData).map(rootKey =>
          this.createTreeItem(rootKey, this.jsonData[rootKey], rootKey, '')
        )
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
      return new JsonTreeItem(
        key + ' (empty)',
        fullKey,
        namespace,
        [],
        vscode.TreeItemCollapsibleState.None
      );
    }
  }
}

export default JsonTreeDataProvider;
