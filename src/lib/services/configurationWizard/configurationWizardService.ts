import vscode from 'vscode';

import ExtensionConfiguration from '../../entities/configuration/extensionConfiguration';
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
    Partial<ExtensionConfiguration> | undefined
  > {
    const config: Partial<ExtensionConfiguration> =
      new ExtensionConfiguration();

    const framework = await this.selectFramework();

    if (!framework) {
      return undefined;
    }

    if (framework === Framework.Custom) {
      if (!(await this.configureTranslationFilesLocationAsync(config))) {
        return undefined;
      }

      if (!(await this.configureCodeFileLocations(config))) {
        return undefined;
      }
    } else {
      //TODO: implement specific logic for each framework
    }

    if (!(await this.configureDefaultLanguageAsync(config))) {
      return undefined;
    }

    return config;
  }

  private async selectFramework(): Promise<string | undefined> {
    return await vscode.window.showQuickPick(Object.values(Framework), {
      placeHolder: 'Select a framework',
    });
  }

  private async configureTranslationFilesLocationAsync(
    config: Partial<ExtensionConfiguration>
  ): Promise<boolean> {
    const translationFilesLocation = await promptForFolderAsync(
      'Select the translation files location folder'
    );
    if (!translationFilesLocation) {
      return false;
    }

    config.i18nextScannerModule!.translationFilesLocation =
      translationFilesLocation;

    return true;
  }

  private async configureCodeFileLocations(
    config: Partial<ExtensionConfiguration>
  ): Promise<boolean> {
    const codeFileLocations = await promptForFoldersAsync(
      'Select the code file locations folders'
    );
    if (!codeFileLocations) {
      return false;
    }

    config.i18nextScannerModule!.codeFileLocations = codeFileLocations;

    return true;
  }

  private async configureDefaultLanguageAsync(
    config: Partial<ExtensionConfiguration>
  ): Promise<boolean> {
    const defaultLanguage = await vscode.window.showInputBox({
      placeHolder: 'For example: en or fr',
      prompt: 'Enter the default (two-letter) language of your application',
    });

    if (!defaultLanguage) {
      return false; // User cancelled
    }

    config.i18nextScannerModule!.defaultLanguage = defaultLanguage;

    return true;
  }
}
