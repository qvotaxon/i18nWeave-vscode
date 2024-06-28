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
    const theKey = key; // i18nextScannerModule
    const theValue = value as { [key: string]: any };

    Object.keys(theValue).forEach(key => {
      const configuration = vscode.workspace.getConfiguration(
        `i18nWeave.${theKey}`
      );
      const configValue = theValue[key];
      configuration.update(key, configValue, configurationTarget);
    });

    this.options[key] = value;

    // theValue.forEach(element => {

    // });

    // const configuration = vscode.workspace.getConfiguration(
    //   `i18nWeave.${theKey}`
    // );
    // return await configuration.update('', '', ConfigurationTarget.Workspace);
  }

  update(userOptions: Partial<ExtensionConfiguration>): void {
    this.options = { ...this.options, ...userOptions };
  }
}
