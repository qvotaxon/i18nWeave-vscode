import { ActionModule } from '../interfaces/actionModule';
import { ModuleContext } from '../interfaces/moduleContext';

export class ModuleChainManager {
  private chains: { [pattern: string]: ActionModule | null } = {};

  public registerChain(pattern: string, chain: ActionModule): void {
    this.chains[pattern] = chain;
  }

  public executeChain(pattern: string, moduleContext: ModuleContext): void {
    const chain = this.chains[pattern];
    if (chain) {
      chain.execute(moduleContext);
    }
  }
}
