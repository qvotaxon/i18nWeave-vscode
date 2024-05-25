import { ChainType } from '../enums/chainType';
import ActionModule from '../interfaces/actionModule';
import ModuleContext from '../interfaces/moduleContext';

/**
 * Manages the module chains for the i18nWeave extension.
 */
export default class ModuleChainManager {
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
