import vscode from 'vscode';

import I18nextScannerModuleConfiguration from '../../entities/configuration/modules/i18nextScanner/i18nextScannerModuleConfiguration';
import ConfigurationStoreManager from '../../stores/configuration/configurationStoreManager';
import {
  promptForFolderAsync,
  promptForFoldersAsync,
} from '../../utilities/windowUtilities';

export async function configureCustomProjectAsync(
  config: I18nextScannerModuleConfiguration
): Promise<boolean> {
  return (
    (await configureTranslationFilesLocationAsync(config)) &&
    (await configureCodeFileLocationsAsync(config)) &&
    (await configureFileExtensionsAsync(config))
  );
}

export async function configureGeneralSettingsAsync(
  config: I18nextScannerModuleConfiguration
): Promise<boolean> {
  return (
    (await configureDefaultLanguageAsync(config)) &&
    (await configureLanguagesAsync(config)) &&
    (await configureNamespacesAsync(config)) &&
    (await configureTranslationFunctionNamesAsync(config))
  );
}

// TODO: Below methods are only exported for testing purposes. Find a better way to test them.
export async function configureTranslationFilesLocationAsync(
  config: Partial<I18nextScannerModuleConfiguration>
): Promise<boolean> {
  const location = await promptForFolderAsync(
    'Select the translation files location folder'
  );
  if (!location) {
    return false;
  }
  config.translationFilesLocation = location;
  return true;
}

export async function configureCodeFileLocationsAsync(
  config: Partial<I18nextScannerModuleConfiguration>
): Promise<boolean> {
  const locations = await promptForFoldersAsync(
    'Select the code file locations folders'
  );
  if (!locations) {
    return false;
  }
  config.codeFileLocations = locations;
  return true;
}

export async function configureFileExtensionsAsync(
  config: Partial<I18nextScannerModuleConfiguration>
): Promise<boolean> {
  const extensions = await vscode.window.showInputBox({
    placeHolder: 'For example: ts, tsx, js, jsx',
    prompt: 'Enter the file extensions to scan',
  });
  if (!extensions) {
    return false;
  }
  config.fileExtensions = extensions.split(/,\s|,/);
  return true;
}

export async function configureDefaultLanguageAsync(
  config: Partial<I18nextScannerModuleConfiguration>
): Promise<boolean> {
  const defaultLanguage = await vscode.window.showInputBox({
    placeHolder: 'For example: en or fr',
    prompt: 'Enter the default (two-letter) language of your application',
  });
  if (!defaultLanguage) {
    return false;
  }
  config.defaultLanguage = defaultLanguage;
  return true;
}

export async function configureLanguagesAsync(
  config: Partial<I18nextScannerModuleConfiguration>
): Promise<boolean> {
  const languages = await vscode.window.showInputBox({
    placeHolder: 'For example: en, fr, de',
    prompt: 'Enter the languages of your application',
  });
  if (!languages) {
    return false;
  }
  config.languages = languages.split(/,\s|,/);
  return true;
}

export async function configureNamespacesAsync(
  config: Partial<I18nextScannerModuleConfiguration>
): Promise<boolean> {
  const namespaces = await vscode.window.showInputBox({
    placeHolder: 'For example: common, auth',
    prompt: 'Enter the namespaces of your application',
  });
  if (!namespaces) {
    return false;
  }
  config.namespaces = namespaces.split(/,\s|,/);
  return true;
}

export async function configureTranslationFunctionNamesAsync(
  config: Partial<I18nextScannerModuleConfiguration>
): Promise<boolean> {
  const functionNames = await vscode.window.showInputBox({
    placeHolder: 'For example: t, i18next.t',
    prompt: 'Enter the translation function names',
  });
  if (!functionNames) {
    return false;
  }
  config.translationFunctionNames = functionNames.split(/,\s|,/);
  return true;
}

export async function setConfigurationAsync(
  config: I18nextScannerModuleConfiguration,
  patch?: Partial<I18nextScannerModuleConfiguration>
): Promise<void> {
  if (patch) {
    Object.assign(config, patch);
  }
  await ConfigurationStoreManager.getInstance().setConfigAsync<I18nextScannerModuleConfiguration>(
    'i18nextScannerModule',
    config
  );
}
