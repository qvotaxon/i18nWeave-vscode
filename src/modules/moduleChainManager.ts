import { ChainType } from '../enums/chainType';
import { ActionModule } from '../interfaces/actionModule';
import { ModuleContext } from '../interfaces/moduleContext';

export class ModuleChainManager {
  private chains: { [chainType: number]: ActionModule | null } = {};

  public registerChain(chainType: ChainType, chain: ActionModule): void {
    this.chains[chainType] = chain;
  }

  public executeChain(
    chainType: ChainType,
    moduleContext: ModuleContext
  ): void {
    const chain = this.chains[chainType];
    if (chain) {
      chain.execute(moduleContext);
    }
  }
}
