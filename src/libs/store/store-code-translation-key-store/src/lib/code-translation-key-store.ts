import fs from 'fs';
import { ExtensionContext, ProgressLocation, Uri, window } from 'vscode';

import { FileReader } from '@i18n-weave/file-io/file-io-file-reader';

import { arraysEqual } from '@i18n-weave/util/util-array-utilities';
import {
  ConfigurationStoreManager,
  I18nextScannerModuleConfiguration,
} from '@i18n-weave/util/util-configuration';
import { LogLevel, Logger } from '@i18n-weave/util/util-logger';

type CodeTranslation = {
  fileUri: Uri;
  translationFunctionNames: string[];
  dateModified: Date;
};

export class CodeTranslationKeyStore {
  private _context: ExtensionContext | undefined;
  private readonly _oldCacheKey = 'i18nWeave.translationFunctionCache';
  private readonly _newCacheKey = 'i18nWeave.translationFunctionCacheNew';
  private static _instance: CodeTranslationKeyStore;
  private readonly _codeTranslations: Map<string, CodeTranslation> = new Map();
  private readonly _logger: Logger;

  private constructor() {
    this._logger = Logger.getInstance();
  }

  public static getInstance(): CodeTranslationKeyStore {
    if (!CodeTranslationKeyStore._instance) {
      CodeTranslationKeyStore._instance = new CodeTranslationKeyStore();
    }
    return CodeTranslationKeyStore._instance;
  }

  public async initializeAsync(
    context: ExtensionContext,
    codeFileUris: Uri[]
  ): Promise<void> {
    this._logger.log(
      LogLevel.INFO,
      'Initializing code translation key store',
      CodeTranslationKeyStore.name
    );

    context.globalState.update(this._oldCacheKey, undefined);

    this._context = context;
    const storedCache = context.globalState.get<Map<string, CodeTranslation>>(
      this._newCacheKey
    );

    if (storedCache) {
      try {
        storedCache.forEach(entry => {
          this._codeTranslations.set(entry.fileUri.fsPath, entry);
        });
      } catch (error) {
        this._logger.log(
          LogLevel.ERROR,
          'Error restoring code translation cache',
          CodeTranslationKeyStore.name
        );
        window.showErrorMessage('Error restoring code translation cache');
      }

      this._logger.log(
        LogLevel.INFO,
        'Restored code translation cache',
        CodeTranslationKeyStore.name
      );
    }

    //TODO: Update logic to also remove deleted files from cache
    window.withProgress(
      {
        location: ProgressLocation.Window,
        title: 'Initializing file caches',
      },
      async () => {
        this.cleanupCache();

        try {
          codeFileUris.forEach(async codeFileUri => {
            const stats = fs.statSync(codeFileUri.fsPath);
            const dateModified = stats.mtime;

            if (
              !this._codeTranslations.get(codeFileUri.fsPath) ||
              new Date(
                this._codeTranslations.get(codeFileUri.fsPath)!.dateModified
              ).getTime() !== new Date(dateModified).getTime()
            ) {
              this._logger.log(
                LogLevel.VERBOSE,
                `File ${codeFileUri} does not exist in cache, updating cache`,
                CodeTranslationKeyStore.name
              );
              await this.updateStoreRecordAsync(codeFileUri, dateModified);
            } else {
              this._logger.log(
                LogLevel.VERBOSE,
                `File ${codeFileUri} already exists in cache`,
                CodeTranslationKeyStore.name
              );
            }
          });
        } catch (error) {
          this._logger.log(
            LogLevel.ERROR,
            'Error initializing initial file contents',
            CodeTranslationKeyStore.name
          );
          window.showErrorMessage('Error initializing initial file contents');
        }
      }
    );
  }

  /**
   * Clean up the cache by removing entries for files that no longer exist.
   */
  private cleanupCache(): void {
    let removedCount = 0;
    const keysToRemove = [];

    for (const [filePath] of this._codeTranslations) {
      if (!fs.existsSync(filePath)) {
        keysToRemove.push(filePath);
      }
    }

    keysToRemove.forEach(key => {
      this._codeTranslations.delete(key);
    });
    removedCount = keysToRemove.length;

    this._logger.log(
      LogLevel.INFO,
      `Removed ${removedCount} non-existent file(s) from cache`,
      CodeTranslationKeyStore.name
    );
  }

  public async updateStoreRecordAsync(codeFileUri: Uri, dateModified?: Date) {
    const codeFileContents = await FileReader.readWorkspaceFileAsync(
      Uri.file(codeFileUri.fsPath)
    );
    const translationFunctionNames =
      this.scanCodeFileForTranslationFunctionNames(codeFileContents);

    const codeTranslation: CodeTranslation = {
      translationFunctionNames: translationFunctionNames,
      dateModified: dateModified ?? new Date(),
      fileUri: codeFileUri,
    };

    this._codeTranslations.set(codeFileUri.fsPath, codeTranslation);
    this.updateCache();
  }

  public deleteStoreRecord(codeFileUri: Uri) {
    this._codeTranslations.delete(codeFileUri.fsPath);
    this.updateCache();
  }

  private readonly updateCache = () => {
    const cacheArray = Array.from(this._codeTranslations.values());
    this._context!.globalState.update(this._newCacheKey, cacheArray);
  };

  public async fileChangeContainsTranslationFunctionsAsync(
    codeFileUri: Uri
  ): Promise<boolean> {
    const codeFileContents = await FileReader.readWorkspaceFileAsync(
      Uri.file(codeFileUri.fsPath)
    );
    const newTranslationFunctionNames =
      this.scanCodeFileForTranslationFunctionNames(codeFileContents);
    const currentTranslationFunctionNames = this._codeTranslations.get(
      codeFileUri.fsPath
    )?.translationFunctionNames;

    if (newTranslationFunctionNames?.length === 0) {
      return false;
    }

    if (
      newTranslationFunctionNames?.length > 0 &&
      !currentTranslationFunctionNames
    ) {
      return true;
    }

    if (
      !arraysEqual(
        newTranslationFunctionNames,
        currentTranslationFunctionNames!
      )
    ) {
      return true;
    }

    return false;
  }

  private scanCodeFileForTranslationFunctionNames(
    codeFileContents: string
  ): string[] {
    const lines = codeFileContents.split('\n');
    const i18nextScannerModuleConfig =
      ConfigurationStoreManager.getInstance().getConfig<I18nextScannerModuleConfiguration>(
        'i18nextScannerModule'
      );
    const translationFunctionNames = [];
    translationFunctionNames.push(
      i18nextScannerModuleConfig.translationFunctionNames
    );
    const translationComponentName =
      i18nextScannerModuleConfig.translationComponentName;
    const keysToSearchFor = translationFunctionNames.flat().join('|');

    const keyRegex = new RegExp(
      `(?:${keysToSearchFor})\\(\\s*['"\`](.*?)['"\`]\\s*\\)?|<${translationComponentName}\\s+${keysToSearchFor}=['"\`](.*?)['"\`]\\s*>`,
      'g'
    );

    const foundTranslationFunctionNames: string[] = [];
    lines.forEach((line: string) => {
      let match;
      while ((match = keyRegex.exec(line)) !== null) {
        foundTranslationFunctionNames.push(match[1]);
      }
    });

    return foundTranslationFunctionNames;
  }
}
