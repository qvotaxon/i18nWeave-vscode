import vscode from 'vscode';

import {
  ConfigurationStoreManager,
  I18nextScannerModuleConfiguration,
} from '@i18n-weave/util/util-configuration';
import { sanitizeLocations } from '@i18n-weave/util/util-file-path-utilities';
import {
  promptForFolderAsync,
  promptForFoldersAsync,
} from '@i18n-weave/util/util-prompt-utilities';

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
    'Where are the translation files located?'
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
    'Where are the code files you want to scan for translation keys?'
  );
  if (!locations) {
    return false;
  }

  config.codeFileLocations = sanitizeLocations(locations).map(
    location => location
  );
  return true;
}

export async function configureFileExtensionsAsync(
  config: Partial<I18nextScannerModuleConfiguration>
): Promise<boolean> {
  const extensions = await vscode.window.showInputBox({
    placeHolder: 'For example: ts, tsx, js, jsx',
    prompt:
      'What are the extensions of the code files you want to scan for translation keys?',
    title: 'File Extensions',
  });
  if (!extensions) {
    return false;
  }

  const fileExtensions = extensions
    .split(/,\s|,/)
    .map(ext => (ext.startsWith('.') ? ext.slice(1) : ext))
    .filter((ext, index, self) => self.indexOf(ext) === index);

  config.fileExtensions = fileExtensions;

  return true;
}

export async function configureDefaultLanguageAsync(
  config: Partial<I18nextScannerModuleConfiguration>
): Promise<boolean> {
  const defaultLanguage = await vscode.window.showInputBox({
    placeHolder: 'For example: en',
    prompt: 'What is the default language of your application?',
    title: 'Default Language',
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
    prompt: 'Enter the lanugages of your application separated by commas',
    title: 'Languages',
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
    placeHolder: 'For example: common, home, about',
    prompt: 'Enter the namespaces of your application separated by commas',
    title: 'Namespaces',
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
    placeHolder: 'For example: t, I18nKey',
    prompt:
      'Enter the translation function names separated by commas. For example when translating using t("my.key", { count: 5 }), the function name is "t"',
    title: 'Translation Function Names',
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
  await ConfigurationStoreManager.getInstance().setConfigAsync(
    'i18nextScannerModule',
    config
  );
}
