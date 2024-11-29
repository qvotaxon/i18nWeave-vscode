import fs from 'fs';
import { debounce } from 'lodash';
import vscode, { Uri } from 'vscode';

import {
  ActionModule,
  BaseModuleContext,
} from '@i18n-weave/module/module-base-action';
import { I18nextScannerModule } from '@i18n-weave/module/module-i18next-scanner';

import { BaseFileChangeHandler } from '@i18n-weave/feature/feature-base-file-change-handler';
import { ModuleChainManager } from '@i18n-weave/feature/feature-module-chain-manager';

import { CodeTranslationKeyStore } from '@i18n-weave/store/store-code-translation-key-store';

import {
  ConfigurationStoreManager,
  I18nextScannerModuleConfiguration,
} from '@i18n-weave/util/util-configuration';
import { TraceMethod } from '@i18n-weave/util/util-decorators';
import { ChainType } from '@i18n-weave/util/util-enums';
import { LogLevel, Logger } from '@i18n-weave/util/util-logger';

export class CodeFileChangeHandler extends BaseFileChangeHandler {
  private readonly _className = 'CodeFileChangeHandler';
  private readonly _logger: Logger;
  private static i18nextScannerModule: I18nextScannerModule;
  private static moduleChainManager: ModuleChainManager =
    new ModuleChainManager();

  private changedFiles: Set<string> = new Set();
  private debouncedHandleChanges: () => void;

  private constructor(i18nextScannerModule: I18nextScannerModule) {
    super();

    this._logger = Logger.getInstance();
    CodeFileChangeHandler.i18nextScannerModule = i18nextScannerModule;
    CodeFileChangeHandler.moduleChainManager.registerChain(
      ChainType.Code,
      this.createCodeFileChain()
    );

    // Initialize debounced function
    this.debouncedHandleChanges = debounce(this.processChanges.bind(this), 300); // 300ms debounce time
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
  public async handleFileChangeAsync(changeFileLocation?: Uri): Promise<void> {
    if (!changeFileLocation) {
      return;
    }

    this.changedFiles.add(changeFileLocation.fsPath);
    this.debouncedHandleChanges();
  }
  private async processChanges(): Promise<void> {
    let shouldFullScan = false;
    let filesToScan: Uri[] = [];

    for (const filePath of this.changedFiles) {
      const uri = Uri.file(filePath);

      if (!fs.existsSync(filePath)) {
        shouldFullScan = true;
        break;
      }

      const i18nextScannerModuleConfig =
        ConfigurationStoreManager.getInstance().getConfig<I18nextScannerModuleConfiguration>(
          'i18nextScannerModule'
        );
      const hasTranslationFunctions =
        await CodeTranslationKeyStore.getInstance().hasTranslationChanges(
          uri,
          i18nextScannerModuleConfig
        );

      if (
        hasTranslationFunctions.hasDeletions ||
        hasTranslationFunctions.hasRenames
      ) {
        shouldFullScan = true;
        break;
      }

      if (hasTranslationFunctions.hasChanges) {
        filesToScan.push(uri);
      }
    }

    if (shouldFullScan) {
      await this.performFullScan();
    } else if (filesToScan.length > 0) {
      await this.scanSpecificFiles(filesToScan);
    }

    // Clear the set of changed files
    this.changedFiles.clear();
  }

  private async performFullScan(): Promise<void> {
    if (!vscode.workspace.workspaceFolders?.[0].uri) {
      this._logger.log(
        LogLevel.ERROR,
        'No workspace folder found',
        this._className
      );
      return;
    }

    const context: BaseModuleContext = {
      inputPath: vscode.workspace.workspaceFolders?.[0].uri,
      locale: '',
      outputPath: vscode.workspace.workspaceFolders?.[0].uri,
      hasChanges: true,
      hasDeletions: true,
      hasRenames: true,
    };

    await CodeFileChangeHandler.moduleChainManager.executeChainAsync(
      ChainType.Code,
      context
    );

    this._logger.log(LogLevel.INFO, `Full scan performed`, this._className);
  }

  private async scanSpecificFiles(files: Uri[]): Promise<void> {
    for (const file of files) {
      const context: BaseModuleContext = {
        inputPath: file,
        locale: '',
        outputPath: file,
        hasChanges: true,
        hasDeletions: false,
        hasRenames: false,
      };

      await CodeFileChangeHandler.moduleChainManager.executeChainAsync(
        ChainType.Code,
        context
      );

      this._logger.log(
        LogLevel.INFO,
        `Specific file scanned: ${file.fsPath}`,
        this._className
      );

      await CodeTranslationKeyStore.getInstance().updateStoreRecordAsync(file);
    }
  }

  public async handleFileDeletionAsync(
    changeFileLocation?: Uri
  ): Promise<void> {
    if (!changeFileLocation) {
      return;
    }
    await super.handleFileDeletionAsync(changeFileLocation);
    this.changedFiles.add(changeFileLocation.fsPath);
    this.debouncedHandleChanges();
    CodeTranslationKeyStore.getInstance().deleteStoreRecord(changeFileLocation);
  }

  public async handleFileCreationAsync(changeFileLocation: Uri): Promise<void> {
    if (!changeFileLocation) {
      return;
    }
    await super.handleFileCreationAsync(changeFileLocation);
    this.changedFiles.add(changeFileLocation.fsPath);
    this.debouncedHandleChanges();
  }
}
