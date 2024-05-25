import { ActionModule } from '../interfaces/actionModule';
import { ModuleContext } from '../interfaces/moduleContext';

export abstract class BaseActionModule implements ActionModule {
  private nextModule: ActionModule | null = null;

  public setNext(module: ActionModule | null): void {
    this.nextModule = module;
  }

  public async execute(context: ModuleContext): Promise<void> {
    await this.doExecute(context);

    if (this.nextModule) {
      await this.nextModule.execute(context);
    }
  }

  protected abstract doExecute(context: ModuleContext): Promise<void>;
}
