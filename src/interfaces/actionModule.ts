import ModuleContext from './moduleContext';

export default interface ActionModule {
  setNext(module: ActionModule | null): void;
  executeAsync(context: ModuleContext): Promise<void>;
}
