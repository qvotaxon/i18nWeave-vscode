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
import FileLockStoreStore from '../services/fileLockStore';

export default class JsonFileChangeHandler implements FileChangeHandler {
  private static readJsonFileModule: ReadJsonFileModule;
  private static translationModule: TranslationModule;
  private static i18nextJsonToPoConversionModule: I18nextJsonToPoConversionModule;

  static readonly moduleChainManager: ModuleChainManager =
    new ModuleChainManager();

  private constructor(
    readJsonFileModule: ReadJsonFileModule,
    translationModule: TranslationModule,
    i18nextJsonToPoConversionModule: I18nextJsonToPoConversionModule
  ) {
    JsonFileChangeHandler.readJsonFileModule = readJsonFileModule;
    JsonFileChangeHandler.translationModule = translationModule;
    JsonFileChangeHandler.i18nextJsonToPoConversionModule =
      i18nextJsonToPoConversionModule;

    JsonFileChangeHandler.moduleChainManager.registerChain(
      ChainType.Json,
      this.createJsonChain()
    );
  }

  public static readonly create = (): JsonFileChangeHandler => {
    const readJsonFileModule = new ReadJsonFileModule();
    const translationModule = new TranslationModule();
    const i18nextJsonToPoConversionModule =
      new I18nextJsonToPoConversionModule();

    this.readJsonFileModule = readJsonFileModule;
    this.translationModule = translationModule;
    this.i18nextJsonToPoConversionModule = i18nextJsonToPoConversionModule;

    return new JsonFileChangeHandler(
      readJsonFileModule,
      translationModule,
      i18nextJsonToPoConversionModule
    );
  };

  createJsonChain(): ActionModule {
    JsonFileChangeHandler.readJsonFileModule.setNext(
      JsonFileChangeHandler.translationModule
    );
    JsonFileChangeHandler.translationModule.setNext(
      JsonFileChangeHandler.i18nextJsonToPoConversionModule
    );

    return JsonFileChangeHandler.readJsonFileModule;
  }

  /**
   * Handles the asynchronous file change event.
   *
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

    FileLockStoreStore.getInstance().add(extractedFileParts.outputPath);

    JsonFileChangeHandler.moduleChainManager.executeChain(
      ChainType.Json,
      context
    );

    setTimeout(() => {
      FileLockStoreStore.getInstance().delete(extractedFileParts.outputPath);
    }, 250);
  }
}
