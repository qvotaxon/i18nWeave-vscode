import { ActionModule } from '../interfaces/actionModule';
import { ModuleContext } from '../interfaces/moduleContext';

export abstract class BaseActionModule implements ActionModule {
  private nextModule: ActionModule | null = null;

  public setNext(module: ActionModule | null): void {
    this.nextModule = module;
  }

  public execute(context: ModuleContext): void {
    this.doExecute(context);
    if (this.nextModule) {
      this.nextModule.execute(context);
    }
  }

  protected abstract doExecute(context: ModuleContext): void;
}
