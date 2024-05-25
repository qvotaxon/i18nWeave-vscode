import { Uri } from 'vscode';
import { ChainType } from '../enums/chainType';
import ActionModule from '../interfaces/actionModule';
import FileChangeHandler from '../interfaces/fileChangeHandler';
import ModuleContext from '../interfaces/moduleContext';
import I18nextJsonToPoConversionModule from '../modules/i18nextJsonToPoConversion/i18nextJsonToPoConversionModule';
import ModuleChainManager from '../modules/moduleChainManager';
import ReadJsonFileModule from '../modules/readJsonFile/readJsonFileModule';
import TranslationModule from '../modules/translation/translationModule';
import FilePathProcessor from '../services/filePathProcessor';

/**
 * Handles changes to JSON files and executes a chain of modules to process the changes.
 */
export default class JsonFileChangeHandler implements FileChangeHandler {
  moduleChainManager: ModuleChainManager;

  constructor() {
    this.moduleChainManager = new ModuleChainManager();

    this.moduleChainManager.registerChain(
      ChainType.Json,
      this.createJsonChain()
    );
  }

  /**
   * Creates a chain of modules for processing JSON files.
   * @returns The first module in the chain.
   */
  createJsonChain(): ActionModule {
    const readJsonFileModule = new ReadJsonFileModule();
    const translationModule = new TranslationModule();
    const i18nextJsonToPoConversionModule =
      new I18nextJsonToPoConversionModule();

    readJsonFileModule.setNext(translationModule);
    translationModule.setNext(i18nextJsonToPoConversionModule);

    return readJsonFileModule;
  }

  /**
   * Handles the asynchronous file change event.
   * @param changeFileLocation - The location of the changed file.
   * @returns A promise that resolves when the file change is handled.
   */
  async handleFileChangeAsync(
    changeFileLocation?: Uri | undefined
  ): Promise<void> {
    if (!changeFileLocation) {
      return Promise.resolve();
    }

    const extractedFileParts = FilePathProcessor.processFilePath(
      changeFileLocation.fsPath
    );

    const context: ModuleContext = {
      inputPath: changeFileLocation,
      locale: extractedFileParts.locale,
      outputPath: extractedFileParts.outputPath,
    };
    this.moduleChainManager.executeChain(ChainType.Json, context);
  }
}
