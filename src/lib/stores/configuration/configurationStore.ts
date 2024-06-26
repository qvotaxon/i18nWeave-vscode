import vscode, { ConfigurationTarget } from 'vscode';

import ExtensionConfiguration from '../../entities/configuration/extensionConfiguration';

export default class ConfigurationStore {
  private options: Partial<ExtensionConfiguration> = {};

  constructor(userOptions: Partial<ExtensionConfiguration>) {
    this.options = { ...userOptions };
  }

  get<K extends keyof ExtensionConfiguration>(
    key: K
  ): ExtensionConfiguration[K] | undefined {
    return this.options[key];
  }

  async setAsync<K extends keyof ExtensionConfiguration>(
    key: K,
    value: ExtensionConfiguration[K],
    configurationTarget = ConfigurationTarget.Workspace
  ): Promise<void> {
    Object.keys(value).forEach(key => {
      const configuration = vscode.workspace.getConfiguration(
        `i18nWeave.${key}`
      );
      const configValue = (value as { [key: string]: any })[key];
      configuration.update(key, configValue, configurationTarget);
    });

    this.options[key] = value;
  }

  update(userOptions: Partial<ExtensionConfiguration>): void {
    this.options = { ...this.options, ...userOptions };
  }
}
