import vscode, { Uri } from 'vscode';

import {
  ActionModule,
  BaseModuleContext,
} from '@i18n-weave/module/module-base-action';
import { PoToI18nextJsonConversionModule } from '@i18n-weave/module/module-po-to-i18nextjson-conversion';
import { ReadPoFileModule } from '@i18n-weave/module/module-read-po-file';

import { BaseFileChangeHandler } from '@i18n-weave/feature/feature-base-file-change-handler';
import { FileWatcherCreator } from '@i18n-weave/feature/feature-file-watcher-creator';
import { ModuleChainManager } from '@i18n-weave/feature/feature-module-chain-manager';

import { FileLocationStore } from '@i18n-weave/store/store-file-location-store';
import { FileLockStore } from '@i18n-weave/store/store-file-lock-store';

import { TraceMethod } from '@i18n-weave/util/util-decorators';
import { ChainType } from '@i18n-weave/util/util-enums';
import { extractFilePathParts } from '@i18n-weave/util/util-file-path-utilities';

export class PoFileChangeHandler extends BaseFileChangeHandler {
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

    const extractedFileParts = extractFilePathParts(changeFileLocation.fsPath);

    const context: BaseModuleContext = {
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
          FileLockStore.getInstance().delete(extractedFileParts.outputPath);

          poFileChangeHandler.dispose();
        }
      );
  }
}
