import * as vscode from 'vscode';
import ConfigurationStore from './configurationStore';
import ExtensionConfiguration from '../entities/configuration/extensionConfiguration';

/**
 * Represents a configuration store that manages the options for the extension.
 */
export default class ConfigurationStoreManager {
  private _configurationStore?: ConfigurationStore<ExtensionConfiguration>;

  /**
   * Initializes the configuration store by updating the options and subscribing to configuration changes.
   */
  public Initialize(): void {
    this.syncConfigurationStore();

    vscode.workspace.onDidChangeConfiguration(() => {
      this.syncConfigurationStore();
    });
  }

  /**
   * Updates the options based on the current workspace configuration.
   * @throws Error if the configuration is not found or a configuration value is missing.
   */
  private syncConfigurationStore(): void {
    const userConfigurationStore: Partial<ExtensionConfiguration> = {};

    const contributes =
      vscode.extensions.getExtension('qvotaxon.i18nWeave')?.packageJSON
        .contributes;
    if (!contributes?.configuration) {
      throw new Error('Configuration not found.');
    }
    const config = vscode.workspace.getConfiguration();

    for (const moduleConfig of contributes.configuration) {
      const moduleId = moduleConfig.id as keyof ExtensionConfiguration;
      const moduleProperties = moduleConfig.properties;

      const moduleOptions: any = {};

      for (const propertyKey in moduleProperties) {
        const propertyValue = moduleProperties[propertyKey];
        const configKey = propertyKey;
        const configValue = config.get(configKey);

        if (configValue !== undefined) {
          moduleOptions[propertyKey] = configValue;
        } else if (propertyValue.default !== undefined) {
          moduleOptions[propertyKey] = propertyValue.default;
        } else {
          throw new Error(
            `Configuration value not found for key: ${configKey}`
          );
        }
      }

      (userConfigurationStore[moduleId] as any) = moduleOptions;
    }

    this._configurationStore = new ConfigurationStore<ExtensionConfiguration>(
      userConfigurationStore
    );
  }

  /**
   * Gets the options from the configuration store.
   * @throws Error if the options are not initialized.
   * @returns The options from the configuration store.
   */
  public GetConfigurationStore(): ConfigurationStore<ExtensionConfiguration> {
    if (this._configurationStore === undefined) {
      throw new Error('Configuration Store not initialized.');
    }
    return this._configurationStore;
  }

  /**
   * Gets a specific configuration from the configuration store.
   * @param configurationKey - The key of the configuration to retrieve.
   * @returns The configuration with the specified key.
   */
  public Get<T>(
    configurationKey: keyof ExtensionConfiguration
  ): ConfigurationStore<T> {
    const configurationStore = this.GetConfigurationStore();

    return new ConfigurationStore<T>(
      configurationStore.get(configurationKey) as T as Partial<T>
    );
  }
}
