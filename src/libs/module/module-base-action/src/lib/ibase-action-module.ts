import { ModuleContext } from './ibase-action-module-context';

export interface ActionModule {
  setNext(module: ActionModule | null): void;
  executeAsync(context: ModuleContext): Promise<void>;
}
