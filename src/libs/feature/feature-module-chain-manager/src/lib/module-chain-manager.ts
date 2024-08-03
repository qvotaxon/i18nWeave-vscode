import { ChainType } from '../../../../../lib/enums/chainType';
import ActionModule from '../../../../../lib/interfaces/actionModule';
import ModuleContext from '../../../../../lib/interfaces/moduleContext';

/**
 * Manages the module chains for the i18nWeave extension.
 */
export class ModuleChainManager {
  private chains: { [chainType: number]: ActionModule | null } = {};

  /**
   * Registers a chain of modules for a specific chain type.
   * @param chainType - The type of chain to register.
   * @param module - The module to register.
   */
  public registerChain(chainType: ChainType, module: ActionModule): void {
    this.chains[chainType] = module;
  }

  /**
   * Executes a module chain.
   * @param chainType - The type of the chain to execute.
   * @param moduleContext - The module context for the chain execution.
   */
  public async executeChainAsync(
    chainType: ChainType,
    moduleContext: ModuleContext
  ): Promise<void> {
    const chain = this.chains[chainType];
    if (chain) {
      return await chain.executeAsync(moduleContext);
    }
  }
}
