import { Uri } from 'vscode';
import FileChangeHandler from '../interfaces/fileChangeHandler';
import ModuleChainManager from '../modules/moduleChainManager';
import I18nextScannerModule from '../modules/i18nextScanner/i18nextScannerModule';
import { ChainType } from '../enums/chainType';
import ActionModule from '../interfaces/actionModule';
import ModuleContext from '../interfaces/moduleContext';

export default class TypeScriptFileChangeHandler implements FileChangeHandler {
  private static i18nextScannerModule: I18nextScannerModule;

  static readonly moduleChainManager: ModuleChainManager =
    new ModuleChainManager();

  private constructor(i18nextScannerModule: I18nextScannerModule) {
    TypeScriptFileChangeHandler.i18nextScannerModule = i18nextScannerModule;

    TypeScriptFileChangeHandler.moduleChainManager.registerChain(
      ChainType.TypeScript,
      this.createTypeScriptChain()
    );
  }

  public static readonly create = (): TypeScriptFileChangeHandler => {
    const i18nextScannerModule = new I18nextScannerModule();

    this.i18nextScannerModule = i18nextScannerModule;

    return new TypeScriptFileChangeHandler(i18nextScannerModule);
  };

  createTypeScriptChain(): ActionModule {
    return TypeScriptFileChangeHandler.i18nextScannerModule;
  }

  async handleFileChangeAsync(
    changeFileLocation?: Uri | undefined
  ): Promise<void> {
    if (!changeFileLocation) {
      return Promise.resolve();
    }

    //TODO: //fix the requirement of the modulecontext. Not all modules will need it.
    const context: ModuleContext = {
      inputPath: changeFileLocation,
      locale: '',
      outputPath: changeFileLocation,
    };

    TypeScriptFileChangeHandler.moduleChainManager.executeChain(
      ChainType.TypeScript,
      context
    );
  }
}
