import * as vscode from 'vscode';
import Options from '../interfaces/options';
import Configuration from '../entities/Configuration';

/**
 * Represents a configuration store that manages the options for the extension.
 */
export default class ConfigurationStore {
  private _options?: Configuration<Options>;

  /**
   * Initializes the configuration store by updating the options and subscribing to configuration changes.
   */
  public Initialize(): void {
    this.updateOptions();

    vscode.workspace.onDidChangeConfiguration(() => {
      this.updateOptions();
    });
  }

  /**
   * Updates the options based on the current workspace configuration.
   * @throws Error if the configuration is not found or a configuration value is missing.
   */
  private updateOptions(): void {
    const config = vscode.workspace.getConfiguration();

    const contributes =
      vscode.extensions.getExtension('qvotaxon.i18nWeave')?.packageJSON
        .contributes;
    if (!contributes || !contributes.configuration) {
      throw new Error('Configuration not found.');
    }

    const userOptions: Partial<Options> = {};

    for (const moduleConfig of contributes.configuration) {
      const moduleId = moduleConfig.id;
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

      userOptions[moduleId as keyof Options] = moduleOptions;
    }

    const defaults: Options = {
      translationModule: {
        enabled: false,
        googleTranslate: {
          enabled: false,
        },
        deepL: {
          enabled: false,
          apiKey: '',
          preserveFormatting: false,
          formality: 'default',
        },
      },
      i18nextJsonToPoConversionModule: {
        enabled: false,
      },
      debugging: {
        logging: {
          enableVerboseLogging: false,
        },
      },
    };

    this._options = new Configuration<Options>(userOptions, defaults);
  }

  /**
   * Gets the options from the configuration store.
   * @throws Error if the options are not initialized.
   * @returns The options from the configuration store.
   */
  public GetOptions(): Configuration<Options> {
    if (this._options === undefined) {
      throw new Error('Options not initialized.');
    }
    return this._options;
  }

  /**
   * Gets a specific configuration from the configuration store.
   * @param configurationKey - The key of the configuration to retrieve.
   * @returns The configuration with the specified key.
   */
  public Get<T>(configurationKey: string): Configuration<T> {
    const options = this.GetOptions();

    return new Configuration<T>(
      options.get(configurationKey) as T as Partial<T>,
      options.get(configurationKey) as T
    );
  }
}
