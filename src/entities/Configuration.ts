export default class Configuration<T> {
  private options: T;
  private defaults: T;

  constructor(userOptions: Partial<T>, defaults: T) {
    this.options = { ...defaults, ...userOptions };
    this.defaults = defaults;
  }

  get<K extends keyof T>(key: K): T[K] {
    return this.options[key];
  }

  set<K extends keyof T>(key: K, value: T[K]): void {
    this.options[key] = value;
  }

  update(userOptions: Partial<T>): void {
    this.options = { ...userOptions, ...this.defaults };
  }
}
