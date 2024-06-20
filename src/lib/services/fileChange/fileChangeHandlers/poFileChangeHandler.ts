import * as Sentry from '@sentry/node';
import { Uri } from 'vscode';

import { ChainType } from '../../../enums/chainType';
import ActionModule from '../../../interfaces/actionModule';
import FileChangeHandler from '../../../interfaces/fileChangeHandler';
import ModuleContext from '../../../interfaces/moduleContext';
import ModuleChainManager from '../../../modules/moduleChainManager';
import PoToI18nextJsonConversionModule from '../../../modules/poToI18nextJsonConversion/poToI18nextJsonConversionModule';
import ReadPoFileModule from '../../../modules/readPoFile/readPoFileModule';
import FileLockStoreStore from '../../../stores/fileLock/fileLockStore';
import { extractFilePathParts } from '../../../utilities/filePathUtilities';
import FileWatcherCreator from '../fileWatcherCreator';

export default class PoFileChangeHandler implements FileChangeHandler {
  private static fileWatcherCreator: FileWatcherCreator;
  private static readPoFileModule: ReadPoFileModule;
  private static poToI18nextJsonConversionModule: PoToI18nextJsonConversionModule;

  static readonly moduleChainManager: ModuleChainManager =
    new ModuleChainManager();

  private constructor(
    fileWatcherCreator: FileWatcherCreator,
    readPoFileModule: ReadPoFileModule,
    poToI18nextJsonConversionModule: PoToI18nextJsonConversionModule
  ) {
    PoFileChangeHandler.fileWatcherCreator = fileWatcherCreator;
    PoFileChangeHandler.readPoFileModule = readPoFileModule;
    PoFileChangeHandler.poToI18nextJsonConversionModule =
      poToI18nextJsonConversionModule;

    PoFileChangeHandler.moduleChainManager.registerChain(
      ChainType.Po,
      this.createPoChain()
    );
  }

  public static readonly create = (): PoFileChangeHandler => {
    const fileWatcherCreator = new FileWatcherCreator();
    const readPoFileModule = new ReadPoFileModule();
    const poToI18nextJsonConversionModule =
      new PoToI18nextJsonConversionModule();

    this.readPoFileModule = readPoFileModule;
    this.poToI18nextJsonConversionModule = poToI18nextJsonConversionModule;

    return new PoFileChangeHandler(
      fileWatcherCreator,
      readPoFileModule,
      poToI18nextJsonConversionModule
    );
  };

  createPoChain(): ActionModule {
    PoFileChangeHandler.readPoFileModule.setNext(
      PoFileChangeHandler.poToI18nextJsonConversionModule
    );

    return PoFileChangeHandler.readPoFileModule;
  }

  /**
   * Handles the asynchronous file change event.
   * @param changeFileLocation - The location of the changed file.
   * @returns A promise that resolves when the file change is handled.
   */
  async handleFileChangeAsync(
    changeFileLocation?: Uri | undefined
  ): Promise<void> {
    await Sentry.startSpan(
      {
        op: 'po.handleFileChange',
        name: 'Po File Change Handler',
      },
      async () => {
        if (
          !changeFileLocation ||
          FileLockStoreStore.getInstance().hasFileLock(changeFileLocation)
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

        FileLockStoreStore.getInstance().add(extractedFileParts.outputPath);

        PoFileChangeHandler.moduleChainManager.executeChainAsync(
          ChainType.Po,
          context
        );

        PoFileChangeHandler.fileWatcherCreator.createFileWatcherForFile(
          extractedFileParts.outputPath.fsPath,
          () => {
            FileLockStoreStore.getInstance().delete(
              extractedFileParts.outputPath
            );
          }
        );
      }
    );
  }
}
