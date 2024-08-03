import vscode from 'vscode';
import { Uri } from 'vscode';

import { ChainType } from '../../../enums/chainType';
import ActionModule from '../../../interfaces/actionModule';
import FileChangeHandler from '../../../interfaces/fileChangeHandler';
import ModuleContext from '../../../interfaces/moduleContext';
import { ModuleChainManager} from '@i18n-weave/feature/feature-module-chain-manager';
import PoToI18nextJsonConversionModule from '../../../../libs/module/module-po-to-i18nextjson-conversion/src/lib/po-to-i18nextjson-conversion-module';
import ReadPoFileModule from '../../../../libs/module/module-read-po-file/src/lib/read-po-file-module';
import FileLocationStore from '../../../stores/fileLocation/fileLocationStore';
import { FileLockStore } from '@i18n-weave/store/store-file-lock-store';
import { extractFilePathParts } from '@i18n-weave/util/util-file-path-utilities';
import { FileWatcherCreator } from '@i18n-weave/feature/feature-file-watcher-creator';
import { TraceMethod } from '@i18n-weave/util/util-decorators';

export default class PoFileChangeHandler extends FileChangeHandler {
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
    super();

    PoFileChangeHandler.fileWatcherCreator = fileWatcherCreator;
    PoFileChangeHandler.readPoFileModule = readPoFileModule;
    PoFileChangeHandler.poToI18nextJsonConversionModule =
      poToI18nextJsonConversionModule;

    PoFileChangeHandler.moduleChainManager.registerChain(
      ChainType.Po,
      this.createPoChain()
    );
  }

  public static readonly create = (
    context: vscode.ExtensionContext
  ): PoFileChangeHandler => {
    const fileWatcherCreator = new FileWatcherCreator();
    const readPoFileModule = new ReadPoFileModule(context);
    const poToI18nextJsonConversionModule = new PoToI18nextJsonConversionModule(
      context
    );

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

    await PoFileChangeHandler.moduleChainManager.executeChainAsync(
      ChainType.Po,
      context
    );

    const poFileChangeHandler =
      PoFileChangeHandler.fileWatcherCreator.createFileWatcherForFile(
        extractedFileParts.outputPath.fsPath,
        () => {
          FileLockStore.getInstance().delete(
            extractedFileParts.outputPath
          );

          poFileChangeHandler.dispose();
        }
      );
  }
}
