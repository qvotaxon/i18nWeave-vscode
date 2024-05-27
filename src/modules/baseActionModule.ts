import ActionModule from '../interfaces/actionModule';
import ModuleContext from '../interfaces/moduleContext';
import ConfigurationStoreManager from '../services/configurationStoreManager';

/**
 * Represents a base class for action modules.
 */
export abstract class BaseActionModule implements ActionModule {
  protected configurationStore: ConfigurationStoreManager;
  private nextModule: ActionModule | null = null;

  /**
   *
   */
  constructor() {
    this.configurationStore = new ConfigurationStoreManager();
    this.configurationStore.Initialize();
  }

  /**
   * Sets the next action module in the chain.
   * @param module The next action module to set.
   */
  public setNext(module: ActionModule | null): void {
    this.nextModule = module;
  }

  /**
   * Executes the action module.
   * @param context The module context.
   */
  public async execute(context: ModuleContext): Promise<void> {
    await this.doExecute(context);

    if (this.nextModule) {
      await this.nextModule.execute(context);
    }
  }

  /**
   * Performs the execution logic of the action module.
   * @param context The module context.
   */
  protected abstract doExecute(context: ModuleContext): Promise<void>;
}
