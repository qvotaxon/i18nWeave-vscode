import fs from 'fs';
import vscode from 'vscode';
import { Uri } from 'vscode';

import {
  ActionModule,
  BaseModuleContext,
} from '@i18n-weave/module/module-base-action';
import { I18nextScannerModule } from '@i18n-weave/module/module-i18next-scanner';

import { BaseFileChangeHandler } from '@i18n-weave/feature/feature-base-file-change-handler';
import { ModuleChainManager } from '@i18n-weave/feature/feature-module-chain-manager';

import { CodeTranslationKeyStore } from '@i18n-weave/store/store-code-translation-key-store';

import { TraceMethod } from '@i18n-weave/util/util-decorators';
import { ChainType } from '@i18n-weave/util/util-enums';
import { LogLevel, Logger } from '@i18n-weave/util/util-logger';

export class CodeFileChangeHandler extends BaseFileChangeHandler {
  private readonly _logger: Logger;
  private static i18nextScannerModule: I18nextScannerModule;
  private static moduleChainManager: ModuleChainManager =
    new ModuleChainManager();

  private constructor(i18nextScannerModule: I18nextScannerModule) {
    super();

    this._logger = Logger.getInstance();
    CodeFileChangeHandler.i18nextScannerModule = i18nextScannerModule;
    CodeFileChangeHandler.moduleChainManager.registerChain(
      ChainType.Code,
      this.createCodeFileChain()
    );
  }

  public static create(
    context: vscode.ExtensionContext
  ): CodeFileChangeHandler {
    const i18nextScannerModule = new I18nextScannerModule(context);
    return new CodeFileChangeHandler(i18nextScannerModule);
  }

  private createCodeFileChain(): ActionModule {
    return CodeFileChangeHandler.i18nextScannerModule;
  }

  @TraceMethod
  public async handleFileChangeAsync(
    changeFileLocation?: Uri,
    isFileDeletionChange: boolean = false
  ): Promise<void> {
    if (!changeFileLocation) {
      return;
    }

    let hasTranslationFunctions = false;

    if (fs.existsSync(changeFileLocation.fsPath)) {
      hasTranslationFunctions =
        await CodeTranslationKeyStore.getInstance().fileChangeContainsTranslationFunctionsAsync(
          changeFileLocation
        );
    }

    if (!isFileDeletionChange && !hasTranslationFunctions) {
      return;
    }

    const context: BaseModuleContext = {
      inputPath: changeFileLocation,
      locale: '',
      outputPath: changeFileLocation,
    };

    await CodeFileChangeHandler.moduleChainManager.executeChainAsync(
      ChainType.Code,
      context
    );

    this._logger.log(
      LogLevel.INFO,
      `Code File change handled: ${changeFileLocation}`
    );

    if (!isFileDeletionChange) {
      await CodeTranslationKeyStore.getInstance().updateStoreRecordAsync(
        changeFileLocation
      );
    }
  }

  public async handleFileDeletionAsync(
    changeFileLocation?: Uri
  ): Promise<void> {
    if (!changeFileLocation) {
      return;
    }
    await super.handleFileDeletionAsync(changeFileLocation);
    await this.handleFileChangeAsync(changeFileLocation, true);
    CodeTranslationKeyStore.getInstance().deleteStoreRecord(changeFileLocation);
  }

  public async handleFileCreationAsync(changeFileLocation: Uri): Promise<void> {
    if (!changeFileLocation) {
      return;
    }
    await super.handleFileCreationAsync(changeFileLocation);
    await this.handleFileChangeAsync(changeFileLocation);
  }
}
