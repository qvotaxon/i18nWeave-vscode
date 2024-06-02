import * as vscode from 'vscode';
import ConfigurationStore from './configurationStore';
import ExtensionConfiguration from '../entities/configuration/extensionConfiguration';

/**
 * Represents a configuration store manager that manages the options for the extension.
 */
export default class ConfigurationStoreManager {
  private _configurationStore: ConfigurationStore | undefined;

  /**
   * Initializes the configuration store by updating the options and subscribing to configuration changes.
   */
  public Initialize(): void {
    this.syncConfigurationStore();
    vscode.workspace.onDidChangeConfiguration(() =>
      this.syncConfigurationStore()
    );
  }

  /**
   * Updates the options based on the current workspace configuration.
   * @throws Error if the configuration is not found or a configuration value is missing.
   */
  private syncConfigurationStore(): void {
    const userConfigurationStore: Partial<ExtensionConfiguration> = {};
    const extension = vscode.extensions.getExtension('qvotaxon.i18nWeave');

    if (!extension?.packageJSON.contributes?.configuration) {
      throw new Error('Configuration not found.');
    }

    const config = vscode.workspace.getConfiguration();
    const contributes = extension.packageJSON.contributes.configuration;

    for (const moduleConfig of contributes) {
      const moduleId = moduleConfig.id as keyof ExtensionConfiguration;
      const moduleOptions: any = {};

      for (const propertyKey in moduleConfig.properties) {
        const configKey = `${propertyKey}`;
        const configValue = config.get(configKey);
        const internalPropertyKey = propertyKey
          .replace(`i18nWeave.${moduleId}.`, '')
          .replace('i18nWeave.', '');

        if (configValue !== undefined) {
          this.setNestedProperty(
            moduleOptions,
            internalPropertyKey,
            configValue
          );
        } else {
          const defaultValue = moduleConfig.properties[propertyKey].default;
          if (defaultValue !== undefined) {
            this.setNestedProperty(
              moduleOptions,
              internalPropertyKey,
              defaultValue
            );
          } else {
            throw new Error(
              `Configuration value not found for key: ${configKey}`
            );
          }
        }
      }

      userConfigurationStore[moduleId] = moduleOptions;
    }

    this._configurationStore = new ConfigurationStore(userConfigurationStore);
  }

  /**
   * Recursively sets a nested property value in an object based on a dot-separated key.
   * @param obj The object to set the property in.
   * @param key The dot-separated key.
   * @param value The value to set.
   */
  private setNestedProperty(obj: any, key: string, value: any): void {
    const keys = key.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]] = current[keys[i]] || {};
    }

    current[keys[keys.length - 1]] = value;
  }

  /**
   * Gets the options from the configuration store.
   * @throws Error if the options are not initialized.
   * @returns The options from the configuration store.
   */
  public getConfigurationStore(): ConfigurationStore {
    if (!this._configurationStore) {
      throw new Error('Configuration Store not initialized.');
    }
    return this._configurationStore;
  }

  /**
   * Gets a specific configuration object from the configuration store.
   * @param key - The key of the configuration to retrieve.
   * @returns The configuration object.
   */
  public getConfig<T>(key: keyof ExtensionConfiguration): T {
    const config = this.getConfigurationStore().get(key);
    if (!config) {
      throw new Error(`Configuration for key "${String(key)}" not found.`);
    }
    return config as T;
  }
}
