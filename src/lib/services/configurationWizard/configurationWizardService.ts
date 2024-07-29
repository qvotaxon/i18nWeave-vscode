import vscode from 'vscode';

import I18nextScannerModuleConfiguration from '../../entities/configuration/modules/i18nextScanner/i18next-scanner-module-configuration';
import { Framework } from '../../enums/framework';
import { ProjectType } from '../../enums/projectType';
import {
  selectFrameworkAsync,
  selectProjectTypeAsync,
  showConfigurationToUserAsync,
} from '../../utilities/promptUtilities';
import {
  configureCustomProjectAsync,
  configureGeneralSettingsAsync,
  setConfigurationAsync,
} from './configurationHandlers';
import {
  readNextI18nextConfigFileAsync,
  scanNextI18nextConfigFileAsync,
} from './nextI18nextConfigHandlers';

export default class ConfigurationWizardService {
  public async startConfigurationWizardAsync(): Promise<
    Partial<I18nextScannerModuleConfiguration> | undefined
  > {
    const config = new I18nextScannerModuleConfiguration();

    const projectType = await selectProjectTypeAsync();
    if (!projectType || projectType === ProjectType.MonoRepo) {
      return undefined;
    }

    const framework = await selectFrameworkAsync();
    if (!framework) {
      return undefined;
    }

    if (framework === Framework.Custom) {
      if (!(await configureCustomProjectAsync(config))) {
        return undefined;
      }
    }
    // TODO: Enable this once the logic for NextJS has been fully implemented.
    else if (framework === Framework.NextJS) {
      // const result = await this.handleNextJSConfigAsync(config);
      // if (result === undefined) {
      vscode.window.showInformationMessage(
        'This feature is not yet implemented yet.'
      );
      return undefined;
      // }
    }

    if (!(await configureGeneralSettingsAsync(config))) {
      return undefined;
    }

    await setConfigurationAsync(config);
    return config;
  }

  private async handleNextJSConfigAsync(
    config: I18nextScannerModuleConfiguration
  ): Promise<I18nextScannerModuleConfiguration | boolean | undefined> {
    const configFilePath = await scanNextI18nextConfigFileAsync();
    if (configFilePath) {
      const nextConfig = await readNextI18nextConfigFileAsync(configFilePath);
      if (nextConfig) {
        const userResponse = await showConfigurationToUserAsync(
          configFilePath,
          nextConfig.defaultLanguage!
        );
        if (userResponse?.title?.includes(', lead the way!')) {
          setConfigurationAsync(config, nextConfig);
          return config;
        } else if (userResponse?.title?.includes('configure it myself.')) {
          if (!(await configureCustomProjectAsync(config))) {
            return undefined;
          }
          if (!(await configureGeneralSettingsAsync(config))) {
            return undefined;
          }
          await setConfigurationAsync(config);
          return config;
        } else {
          return undefined;
        }
      }
    }
    return await configureCustomProjectAsync(config);
  }
}
