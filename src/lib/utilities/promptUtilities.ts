import vscode from 'vscode';

import { Framework } from '../enums/framework';
import { ProjectType } from '../enums/projectType';
import { getLocalizedTexts } from './localizationUtilities';

export async function selectProjectTypeAsync(): Promise<string | undefined> {
  return await vscode.window.showQuickPick(Object.values(ProjectType), {
    placeHolder: 'Select the project type',
  });
}

export async function selectFrameworkAsync(): Promise<string | undefined> {
  return await vscode.window.showQuickPick(Object.values(Framework), {
    placeHolder: 'Select a framework',
  });
}

export async function showConfigurationToUserAsync(
  configFilePath: string,
  defaultLanguage: string
): Promise<string | undefined> {
  const localizedTexts = getLocalizedTexts(defaultLanguage);
  const configText = `${localizedTexts.greeting}! We've detected a configuration file at: "${configFilePath}". Shall we proceed with this file?`;
  return await vscode.window.showInformationMessage(
    `${configText}`,
    `${localizedTexts.confirmativeText}, lead the way!`,
    `${localizedTexts.dismissiveText}, I'll configure it myself.`
  );
}
