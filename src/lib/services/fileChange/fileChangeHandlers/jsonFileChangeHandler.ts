import vscode from 'vscode';
import { Uri } from 'vscode';

import { ChainType } from '../../../enums/chainType';
import ActionModule from '../../../interfaces/actionModule';
import FileChangeHandler from '../../../interfaces/fileChangeHandler';
import ModuleContext from '../../../interfaces/moduleContext';
import I18nextJsonToPoConversionModule from '../../../modules/i18nextJsonToPoConversion/i18nextJsonToPoConversionModule';
import ModuleChainManager from '../../../modules/moduleChainManager';
import ReadJsonFileModule from '../../../modules/readJsonFile/readJsonFileModule';
import TranslationModule from '../../../modules/translation/translationModule';
import { FileLockStore } from '@i18n-weave/store/store-file-lock-store';
import { extractFilePathParts } from '@i18n-weave/util/util-file-path-utilities';
import { FileWatcherCreator } from '@i18n-weave/feature/feature-file-watcher-creator';
import { TraceMethod } from '@i18n-weave/util/util-decorators';

export default class JsonFileChangeHandler extends FileChangeHandler {
  private static fileWatcherCreator: FileWatcherCreator;
  private static readJsonFileModule: ReadJsonFileModule;
  private static translationModule: TranslationModule;
  private static i18nextJsonToPoConversionModule: I18nextJsonToPoConversionModule;

  static readonly moduleChainManager: ModuleChainManager =
    new ModuleChainManager();

  private constructor(
    fileWatcherCreator: FileWatcherCreator,
    readJsonFileModule: ReadJsonFileModule,
    translationModule: TranslationModule,
    i18nextJsonToPoConversionModule: I18nextJsonToPoConversionModule
  ) {
    super();

    JsonFileChangeHandler.fileWatcherCreator = fileWatcherCreator;
    JsonFileChangeHandler.readJsonFileModule = readJsonFileModule;
    JsonFileChangeHandler.translationModule = translationModule;
    JsonFileChangeHandler.i18nextJsonToPoConversionModule =
      i18nextJsonToPoConversionModule;

    JsonFileChangeHandler.moduleChainManager.registerChain(
      ChainType.Json,
      this.createJsonChain()
    );
  }

  public static readonly create = (
    context: vscode.ExtensionContext
  ): JsonFileChangeHandler => {
    const fileWatcherCreator = new FileWatcherCreator();
    const readJsonFileModule = new ReadJsonFileModule(context);
    const translationModule = new TranslationModule(context);
    const i18nextJsonToPoConversionModule = new I18nextJsonToPoConversionModule(
      context
    );

    this.readJsonFileModule = readJsonFileModule;
    this.translationModule = translationModule;
    this.i18nextJsonToPoConversionModule = i18nextJsonToPoConversionModule;

    return new JsonFileChangeHandler(
      fileWatcherCreator,
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
  @TraceMethod
  async handleFileChangeAsync(
    changeFileLocation?: Uri | undefined
  ): Promise<void> {
    if (
      !changeFileLocation ||
      FileLockStore.getInstance().hasFileLock(changeFileLocation)
    ) {
      return Promise.resolve();
    }

    const extractedFileParts = extractFilePathParts(
      changeFileLocation.fsPath
    );

    const context: ModuleContext = {
      inputPath: changeFileLocation,
      locale: extractedFileParts.locale,
      outputPath: extractedFileParts.outputPath,
    };

    FileLockStore.getInstance().add(extractedFileParts.outputPath);

    await JsonFileChangeHandler.moduleChainManager.executeChainAsync(
      ChainType.Json,
      context
    );

    JsonFileChangeHandler.fileWatcherCreator.createFileWatcherForFile(
      extractedFileParts.outputPath.fsPath,
      () => {
        FileLockStore.getInstance().delete(
          extractedFileParts.outputPath
        );
      }
    );
  }
}
