import vscode from 'vscode';

import I18nextScannerModuleConfiguration from '../../entities/configuration/modules/i18nextScanner/i18nextScannerModuleConfiguration';
import ConfigurationStoreManager from '../../stores/configuration/configurationStoreManager';
import { getLocalizedTexts } from '../../utilities/localizationUtilities';
import {
  promptForFolder as promptForFolderAsync,
  promptForFolders as promptForFoldersAsync,
} from '../../utilities/windowUtilities';

enum Framework {
  // TODO: implement specific logic for each framework

  // Angular = 'Angular (angular-i18next)', // import { I18NEXT_SERVICE, I18NextLoadResult, I18NextModule, ITranslationService, defaultInterpolationFormat } from 'angular-i18next';
  //https://github.com/Romanchuk/angular-i18next-demo/blob/master/src/app/AppModule.ts

  // React = 'React (react-i18next)', // if react scan for usages of import { initReactI18next } from 'react-i18next'; using https://chatgpt.com/c/59f6a733-dd77-4d20-9622-ab6934808cfb.
  NextJS = 'Next.js (next-i18next)', //if next js then read next-i18next.config.js file
  Custom = 'Custom',
}

enum ProjectType {
  SingleProject = 'Single project',
  MonoRepo = 'Mono-repo (not supported yet)',
}

export default class ConfigurationWizardService {
  public async startConfigurationWizardAsync(): Promise<
    Partial<I18nextScannerModuleConfiguration> | undefined
  > {
    const i18nextScannerModuleConfiguration: I18nextScannerModuleConfiguration =
      new I18nextScannerModuleConfiguration();

    const projectType = await this.selectProjectTypeAsync();

    if (!projectType || projectType === ProjectType.MonoRepo) {
      return undefined;
    }

    const framework = await this.selectFrameworkAsync();

    if (!framework) {
      return undefined;
    }

    if (framework === Framework.Custom) {
      if (
        !(await this.configureCustomProjectAsync(
          i18nextScannerModuleConfiguration
        ))
      ) {
        return undefined;
      }
    } else if (framework === Framework.NextJS) {
      const configFilePath = await this.scanNextI18nextConfigFileAsync();
      if (configFilePath) {
        const config =
          await this.readNextI18nextConfigFileAsync(configFilePath);
        if (config) {
          const userResponse = await this.showConfigurationToUserAsync(
            configFilePath,
            config.defaultLanguage!
          );
          if (userResponse?.includes(', lead the way!')) {
            this.setConfigurationAsync(
              i18nextScannerModuleConfiguration,
              config
            );
            return i18nextScannerModuleConfiguration;
          } else if (userResponse?.includes('configure it myself.')) {
            if (
              !(await this.configureCustomProjectAsync(
                i18nextScannerModuleConfiguration
              ))
            ) {
              return undefined;
            }
            if (
              !(await this.configureGeneralSettingsAsync(
                i18nextScannerModuleConfiguration
              ))
            ) {
              return undefined;
            }

            await this.setConfigurationAsync(i18nextScannerModuleConfiguration);
            return i18nextScannerModuleConfiguration;
          } else {
            return undefined;
          }
        }
      }
      if (
        !(await this.configureCustomProjectAsync(
          i18nextScannerModuleConfiguration
        ))
      ) {
        return undefined;
      }
    } else {
      // TODO: implement specific logic for each framework
    }

    if (
      !(await this.configureGeneralSettingsAsync(
        i18nextScannerModuleConfiguration
      ))
    ) {
      return undefined;
    }

    await this.setConfigurationAsync(i18nextScannerModuleConfiguration);

    return i18nextScannerModuleConfiguration;
  }

  private async selectProjectTypeAsync(): Promise<string | undefined> {
    return await vscode.window.showQuickPick(Object.values(ProjectType), {
      placeHolder: 'Select the project type',
    });
  }

  private async selectFrameworkAsync(): Promise<string | undefined> {
    return await vscode.window.showQuickPick(Object.values(Framework), {
      placeHolder: 'Select a framework',
    });
  }

  private async configureCustomProjectAsync(
    i18nextScannerModuleConfiguration: I18nextScannerModuleConfiguration
  ): Promise<boolean> {
    if (
      !(await this.configureTranslationFilesLocationAsync(
        i18nextScannerModuleConfiguration
      ))
    ) {
      return false;
    }

    if (
      !(await this.configureCodeFileLocationsAsync(
        i18nextScannerModuleConfiguration
      ))
    ) {
      return false;
    }

    if (
      !(await this.configureFileExtensionsAsync(
        i18nextScannerModuleConfiguration
      ))
    ) {
      return false;
    }

    return true;
  }

  private async configureGeneralSettingsAsync(
    i18nextScannerModuleConfiguration: I18nextScannerModuleConfiguration
  ): Promise<boolean> {
    if (
      !(await this.configureDefaultLanguageAsync(
        i18nextScannerModuleConfiguration
      ))
    ) {
      return false;
    }

    if (
      !(await this.configureLanguagesAsync(i18nextScannerModuleConfiguration))
    ) {
      return false;
    }

    if (
      !(await this.configureNamespacesAsync(i18nextScannerModuleConfiguration))
    ) {
      return false;
    }

    if (
      !(await this.configureTranslationFunctionNamesAsync(
        i18nextScannerModuleConfiguration
      ))
    ) {
      return false;
    }

    return true;
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

  //TODO: change to return vscode.Uri to and actual configuration file
  private async scanNextI18nextConfigFileAsync(): Promise<string | undefined> {
    return '/path/to/next-i18next.config.js';
  }

  //TODO: change to return the actual configuration
  private async readNextI18nextConfigFileAsync(
    configFilePath: string
  ): Promise<Partial<I18nextScannerModuleConfiguration> | undefined> {
    return {
      defaultLanguage: 'en',
      languages: ['en', 'fr'],
      namespaces: ['common'],
      fileExtensions: ['ts', 'tsx', 'js', 'jsx'],
      translationFunctionNames: ['t', 'i18next.t'],
    };
  }

  private async showConfigurationToUserAsync(
    configFilePath: string,
    defaultLanguage: string
  ): Promise<string | undefined> {
    const localizedTexts = getLocalizedTexts(defaultLanguage);

    const configText = `
      ${localizedTexts.greeting}! We've detected a configuration file at: "${configFilePath}". Shall we proceed with this file?
    `;

    return await vscode.window.showInformationMessage(
      `${configText}`,
      `${localizedTexts.confirmativeText}, lead the way!`,
      `${localizedTexts.dismissiveText}, I'll configure it myself.`
    );
  }

  private async setConfigurationAsync(
    i18nextScannerModuleConfiguration: I18nextScannerModuleConfiguration,
    configurationPatch?: Partial<I18nextScannerModuleConfiguration>
  ): Promise<void> {
    if (configurationPatch) {
      i18nextScannerModuleConfiguration.defaultLanguage =
        configurationPatch.defaultLanguage!;
      i18nextScannerModuleConfiguration.languages =
        configurationPatch.languages!;
      i18nextScannerModuleConfiguration.namespaces =
        configurationPatch.namespaces!;
      i18nextScannerModuleConfiguration.fileExtensions =
        configurationPatch.fileExtensions!;
      i18nextScannerModuleConfiguration.translationFunctionNames =
        configurationPatch.translationFunctionNames!;
    }

    await ConfigurationStoreManager.getInstance().setConfigAsync<I18nextScannerModuleConfiguration>(
      'i18nextScannerModule',
      i18nextScannerModuleConfiguration
    );
  }
}
