import { ExtensionConfiguration } from '@i18n-weave/util/util-configuration';
import vscode, { ConfigurationTarget } from 'vscode';

export class ConfigurationStore {
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
    moduleName: K,
    moduleValue: ExtensionConfiguration[K],
    configurationTarget = ConfigurationTarget.Workspace
  ): Promise<void> {
    Object.keys(moduleValue).forEach(async configurationKey => {
      const configuration = vscode.workspace.getConfiguration(
        `i18nWeave.${moduleName}`
      );
      const configurationValue = (moduleValue as { [key: string]: any })[
        configurationKey
      ];
      await configuration.update(
        configurationKey,
        configurationValue,
        configurationTarget
      );
    });

    this.options[moduleName] = moduleValue;
  }

  update(userOptions: Partial<ExtensionConfiguration>): void {
    this.options = { ...this.options, ...userOptions };
  }
}
