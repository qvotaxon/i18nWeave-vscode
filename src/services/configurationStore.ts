export default class ConfigurationStore<T> {
  private options: Partial<T> = {};

  constructor(userOptions: Partial<T>) {
    this.options = { ...userOptions };
  }

  get<K extends keyof T>(key: K): T[K] | undefined {
    return this.options[key];
  }

  set<K extends keyof T>(key: K, value: T[K]): void {
    this.options[key] = value;
  }

  update(userOptions: Partial<T>): void {
    this.options = { ...this.options, ...userOptions };
  }
}
