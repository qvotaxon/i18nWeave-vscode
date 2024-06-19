import * as vscode from 'vscode';

import ExtensionConfiguration from '../../entities/configuration/extensionConfiguration';
import ConfigurationStore from './configurationStore';

/**
 * Represents a configuration store manager that manages the options for the extension.
 */
export default class ConfigurationStoreManager {
  private static _instance: ConfigurationStoreManager;
  private _configurationStore?: ConfigurationStore;

  private constructor() {
    // Private constructor to prevent instantiation
  }

  /**
   * Returns the singleton instance of ConfigurationStoreManager.
   */
  public static getInstance(): ConfigurationStoreManager {
    if (!ConfigurationStoreManager._instance) {
      ConfigurationStoreManager._instance = new ConfigurationStoreManager();
    }
    return ConfigurationStoreManager._instance;
  }

  /**
   * Initializes the configuration store by updating the options and subscribing to configuration changes.
   */
  public initialize(): void {
    this.syncConfigurationStore();
    vscode.workspace.onDidChangeConfiguration(() =>
      this.syncConfigurationStore()
    );
  }

  /**
   * Updates the options based on the current workspace configuration.
   * @throws Error if the configuration is not found or a configuration value is missing.
   */
  public syncConfigurationStore(): void {
    const extension = vscode.extensions.getExtension('qvotaxon.i18nWeave');
    if (!extension?.packageJSON.contributes?.configuration) {
      throw new Error('Configuration not found.');
    }

    const config = vscode.workspace.getConfiguration();
    const contributes = extension.packageJSON.contributes.configuration;

    const userConfigurationStore: Partial<ExtensionConfiguration> =
      contributes.reduce((acc: any, moduleConfig: any) => {
        const moduleId = moduleConfig.id as keyof ExtensionConfiguration;
        const moduleOptions: any = {};

        for (const propertyKey in moduleConfig.properties) {
          const configKey = propertyKey;
          const configValue = config.get(configKey);
          const internalPropertyKey = propertyKey
            .replace(`i18nWeave.${moduleId}.`, '')
            .replace('i18nWeave.', '');

          this.setNestedProperty(
            moduleOptions,
            internalPropertyKey,
            configValue ?? moduleConfig.properties[propertyKey].default
          );

          if (
            configValue === undefined &&
            moduleConfig.properties[propertyKey].default === undefined
          ) {
            throw new Error(
              `Configuration value not found for key: ${configKey}`
            );
          }
        }

        acc[moduleId] = moduleOptions;
        return acc;
      }, {} as Partial<ExtensionConfiguration>);

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

    keys.slice(0, -1).forEach(k => {
      current[k] = current[k] || {};
      current = current[k];
    });

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
