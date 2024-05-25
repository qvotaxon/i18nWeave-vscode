import ModuleContext from './moduleContext';

export default interface ActionModule {
  setNext(module: ActionModule | null): void;
  execute(context: ModuleContext): Promise<void>;
}
