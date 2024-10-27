import vscode from 'vscode';

export class JsonTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly fullKey: string,
    public readonly namespace: string,
    public readonly children: JsonTreeItem[] = [],
    collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly value?: string
  ) {
    super(label, collapsibleState);
  }
}

export default JsonTreeItem;
