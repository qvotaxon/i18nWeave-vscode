import { Framework, ProjectType } from '@i18n-weave/util/util-enums';
import { getRelativePath } from '@i18n-weave/util/util-file-path-utilities';
import { getLocalizedTexts } from 'libs/util/util-localization-utilities/src/lib/localization-utilities';
import vscode, { MessageItem } from 'vscode';

export async function selectProjectTypeAsync(): Promise<string | undefined> {
  return await vscode.window.showQuickPick(Object.values(ProjectType), {
    placeHolder: 'Will you be working on a single project or a mono-repo?',
    title: 'Project Type Selection',
  });
}

export async function selectFrameworkAsync(): Promise<string | undefined> {
  return await vscode.window.showQuickPick(Object.values(Framework), {
    placeHolder: 'Do you use any of the following frameworks?',
    title: 'Framework Selection',
  });
}

export async function showConfigurationToUserAsync(
  configFilePath: string,
  defaultLanguage: string
): Promise<MessageItem | undefined> {
  const localizedTexts = getLocalizedTexts(defaultLanguage);
  const configText = `${localizedTexts.greeting}! We've detected a configuration file at: "${configFilePath}". Shall we proceed with this file?`;

  // Convert your string options to MessageItem objects
  const confirmativeOption: vscode.MessageItem = {
    title: `${localizedTexts.confirmativeText}, lead the way!`,
  };
  const dismissiveOption: vscode.MessageItem = {
    title: `${localizedTexts.dismissiveText}, I'll configure it myself.`,
  };

  return await vscode.window.showInformationMessage(
    `${configText}`,
    confirmativeOption,
    dismissiveOption
  );
}

/**
 * Prompts the user to select a folder.
 * @param placeHolder - The placeholder text for the open dialog.
 * @returns A promise that resolves to the selected folder path or undefined if cancelled.
 */
export async function promptForFolderAsync(
  placeHolder: string
): Promise<string | undefined> {
  const selectedFolder = await showOpenDialog(placeHolder);

  if (!selectedFolder) {
    return undefined;
  }

  return selectedFolder[0];
}

/**
 * Prompts the user to select one or more folders.
 *
 * @param placeHolder - The placeholder text to display in the folder selection dialog.
 * @returns A promise that resolves to an array of selected folder paths, or undefined if the user cancels the selection.
 */
export async function promptForFoldersAsync(
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
export async function showOpenDialog(
  placeHolder: string,
  canSelectMany = false
): Promise<string[] | undefined> {
  const folderSelectionPrompt = await vscode.window.showQuickPick(
    [placeHolder],
    {
      title: canSelectMany ? 'Select One or More Folders' : 'Select Folder',
      placeHolder: placeHolder,
    }
  );

  if (!folderSelectionPrompt) {
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
    return folderUri.map(folderUri => getRelativePath(folderUri.fsPath));
  }

  return [getRelativePath(folderUri[0].fsPath)];
}
