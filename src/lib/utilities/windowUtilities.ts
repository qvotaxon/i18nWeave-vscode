import vscode from 'vscode';

/**
 * Prompts the user to select a folder.
 * @param placeHolder - The placeholder text for the open dialog.
 * @returns A promise that resolves to the selected folder path or undefined if cancelled.
 */
export async function promptForFolder(
  placeHolder: string
): Promise<string | undefined> {
  return (await showOpenDialog(placeHolder)) as string;
}

export async function promptForFolders(
  placeHolder: string
): Promise<string[] | undefined> {
  return (await showOpenDialog(placeHolder, true)) as string[];
}

async function showOpenDialog(
  placeHolder: string,
  canSelectMany = false
): Promise<string | string[] | undefined> {
  const folderUri = await vscode.window.showOpenDialog({
    canSelectFolders: true,
    canSelectMany: canSelectMany,
    openLabel: 'Select Folder',
    title: placeHolder,
  });

  if (folderUri === undefined) {
    return undefined;
  }

  if (folderUri.length > 0) {
    return folderUri.map(folderUri => folderUri.fsPath);
  }

  return folderUri[0].fsPath;
}
