import vscode, { MessageItem } from 'vscode';

import { Framework } from '../enums/framework';
import { ProjectType } from '../enums/projectType';
import { getLocalizedTexts } from './localizationUtilities';

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
