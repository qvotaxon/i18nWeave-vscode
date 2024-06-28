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

/**
 * Prompts the user to select one or more folders.
 *
 * @param placeHolder - The placeholder text to display in the folder selection dialog.
 * @returns A promise that resolves to an array of selected folder paths, or undefined if the user cancels the selection.
 */
export async function promptForFolders(
  placeHolder: string
): Promise<string[] | undefined> {
  return (await showOpenDialog(placeHolder, true)) as string[];
}

/**
 * Displays an open dialog to select a folder.
 * @param placeHolder - The placeholder text to display in the dialog.
 * @param canSelectMany - Optional. Specifies whether multiple folders can be selected. Default is false.
 * @returns A promise that resolves to the selected folder path(s) or undefined if no folder is selected.
 */
async function showOpenDialog(
  placeHolder: string,
  canSelectMany = false
): Promise<string | string[] | undefined> {
  const translationFilesFolderSelectionPrompt =
    await vscode.window.showQuickPick([placeHolder], {
      placeHolder: placeHolder,
    });

  if (!translationFilesFolderSelectionPrompt) {
    return undefined;
  }

  const folderUri = await vscode.window.showOpenDialog({
    canSelectFolders: true,
    canSelectMany: canSelectMany,
    openLabel: 'Select Folder',
    title: placeHolder,
  });

  if (folderUri === undefined) {
    return undefined;
  }

  if (folderUri.length > 1) {
    return folderUri.map(folderUri => folderUri.fsPath);
  }

  return folderUri[0].fsPath;
}
