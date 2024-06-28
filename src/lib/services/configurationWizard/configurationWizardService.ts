import vscode from 'vscode';

import I18nextScannerModuleConfiguration from '../../entities/configuration/modules/i18nextScanner/i18nextScannerModuleConfiguration';
import ConfigurationStoreManager from '../../stores/configuration/configurationStoreManager';
import {
  promptForFolder as promptForFolderAsync,
  promptForFolders as promptForFoldersAsync,
} from '../../utilities/windowUtilities';

// Define an enum for the frameworks.
enum Framework {
  Angular = 'Angular',
  React = 'React',
  NextJS = 'Next.js',
  Custom = 'Custom',
}

export default class ConfigurationWizardService {
  public async startConfigurationWizardAsync(): Promise<
    Partial<I18nextScannerModuleConfiguration> | undefined
  > {
    const i18nextScannerModuleConfiguration: I18nextScannerModuleConfiguration =
      new I18nextScannerModuleConfiguration();

    const framework = await this.selectFramework();

    if (!framework) {
      return undefined;
    }

    if (framework === Framework.Custom) {
      if (
        !(await this.configureTranslationFilesLocationAsync(
          i18nextScannerModuleConfiguration
        ))
      ) {
        return undefined;
      }

      if (
        !(await this.configureCodeFileLocationsAsync(
          i18nextScannerModuleConfiguration
        ))
      ) {
        return undefined;
      }

      if (
        !(await this.configureFileExtensionsAsync(
          i18nextScannerModuleConfiguration
        ))
      ) {
        return undefined;
      }
    } else {
      //TODO: implement specific logic for each framework
    }

    if (
      !(await this.configureDefaultLanguageAsync(
        i18nextScannerModuleConfiguration
      ))
    ) {
      return undefined;
    }

    if (
      !(await this.configureLanguagesAsync(i18nextScannerModuleConfiguration))
    ) {
      return undefined;
    }

    if (
      !(await this.configureNamespacesAsync(i18nextScannerModuleConfiguration))
    ) {
      return undefined;
    }

    if (
      !(await this.configureTranslationFunctionNamesAsync(
        i18nextScannerModuleConfiguration
      ))
    ) {
      return undefined;
    }

    await ConfigurationStoreManager.getInstance().setConfigAsync<I18nextScannerModuleConfiguration>(
      'i18nextScannerModule',
      i18nextScannerModuleConfiguration
    );

    return i18nextScannerModuleConfiguration;
  }

  private async selectFramework(): Promise<string | undefined> {
    return await vscode.window.showQuickPick(Object.values(Framework), {
      placeHolder: 'Select a framework',
    });
  }

  private async configureTranslationFilesLocationAsync(
    i18nextScannerModuleConfiguration: Partial<I18nextScannerModuleConfiguration>
  ): Promise<boolean> {
    const translationFilesLocation = await promptForFolderAsync(
      'Select the translation files location folder'
    );
    if (!translationFilesLocation) {
      return false;
    }

    i18nextScannerModuleConfiguration!.translationFilesLocation =
      translationFilesLocation;

    return true;
  }

  private async configureCodeFileLocationsAsync(
    i18nextScannerModuleConfiguration: Partial<I18nextScannerModuleConfiguration>
  ): Promise<boolean> {
    const codeFileLocations = await promptForFoldersAsync(
      'Select the code file locations folders'
    );
    if (!codeFileLocations) {
      return false;
    }

    i18nextScannerModuleConfiguration.codeFileLocations = codeFileLocations;

    return true;
  }

  private async configureDefaultLanguageAsync(
    i18nextScannerModuleConfiguration: Partial<I18nextScannerModuleConfiguration>
  ): Promise<boolean> {
    const defaultLanguage = await vscode.window.showInputBox({
      placeHolder: 'For example: en or fr',
      prompt: 'Enter the default (two-letter) language of your application',
    });

    if (!defaultLanguage) {
      return false; // User cancelled
    }

    i18nextScannerModuleConfiguration!.defaultLanguage = defaultLanguage;

    return true;
  }

  private async configureFileExtensionsAsync(
    i18nextScannerModuleConfiguration: Partial<I18nextScannerModuleConfiguration>
  ): Promise<boolean> {
    const fileExtensions = await vscode.window.showInputBox({
      placeHolder: 'For example: ts, tsx, js, jsx',
      prompt: 'Enter the file extensions to scan',
    });

    if (!fileExtensions) {
      return false; // User cancelled
    }

    i18nextScannerModuleConfiguration!.fileExtensions =
      fileExtensions.split(', ');

    return true;
  }

  private async configureLanguagesAsync(
    i18nextScannerModuleConfiguration: Partial<I18nextScannerModuleConfiguration>
  ): Promise<boolean> {
    const languages = await vscode.window.showInputBox({
      placeHolder: 'For example: en, fr, de',
      prompt: 'Enter the languages of your application',
    });

    if (!languages) {
      return false; // User cancelled
    }

    i18nextScannerModuleConfiguration!.languages = languages.split(', ');

    return true;
  }

  private async configureNamespacesAsync(
    i18nextScannerModuleConfiguration: Partial<I18nextScannerModuleConfiguration>
  ): Promise<boolean> {
    const namespaces = await vscode.window.showInputBox({
      placeHolder: 'For example: common, auth',
      prompt: 'Enter the namespaces of your application',
    });

    if (!namespaces) {
      return false; // User cancelled
    }

    i18nextScannerModuleConfiguration!.namespaces = namespaces.split(', ');

    return true;
  }

  private async configureTranslationFunctionNamesAsync(
    i18nextScannerModuleConfiguration: Partial<I18nextScannerModuleConfiguration>
  ): Promise<boolean> {
    const translationFunctionNames = await vscode.window.showInputBox({
      placeHolder: 'For example: t, i18next.t',
      prompt: 'Enter the translation function names',
    });

    if (!translationFunctionNames) {
      return false; // User cancelled
    }

    i18nextScannerModuleConfiguration!.translationFunctionNames =
      translationFunctionNames.split(', ');

    return true;
  }
}
