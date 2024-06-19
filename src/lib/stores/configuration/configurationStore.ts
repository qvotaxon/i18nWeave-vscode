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

  set<K extends keyof ExtensionConfiguration>(
    key: K,
    value: ExtensionConfiguration[K]
  ): void {
    this.options[key] = value;
  }

  update(userOptions: Partial<ExtensionConfiguration>): void {
    this.options = { ...this.options, ...userOptions };
  }
}
