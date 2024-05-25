import { ModuleContext } from './moduleContext';

export interface ActionModule {
  setNext(module: ActionModule | null): void;
  execute(context: ModuleContext): Promise<void>;
}
