import fs from 'fs';
import { ExtensionContext, ProgressLocation, Uri, window } from 'vscode';

import { FileReader } from '@i18n-weave/file-io/file-io-file-reader';

import { extractTranslationKeys } from '@i18n-weave/util/util-code-file-utils';
import { I18nextScannerModuleConfiguration } from '@i18n-weave/util/util-configuration';
import { LogLevel, Logger } from '@i18n-weave/util/util-logger';

type CodeTranslation = {
  fileUri: Uri;
  fileContents: string;
  dateModified: Date;
};

// TODO: This logic contains a bug where if a change is made to a value in such a way that it changes from a string into an object or the other way around,
// it seems like the wrong logic is ran. So removed/updated keys are not removed, resulting in the new keys not being added / being able to be added.
export class CodeTranslationKeyStore {
  private readonly _className = 'CodeTranslationKeyStore';
  private _context: ExtensionContext | undefined;
  private readonly _oldCacheKeys = [
    'i18nWeave.translationFunctionCache',
    'i18nWeave.translationFunctionCacheNew',
  ];
  private readonly _newCacheKey = 'i18nWeave.translationFunctionCache_v0.14.4';
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
      this._className
    );

    this.clearOldCaches(context);

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
          this._className
        );
        window.showErrorMessage('Error restoring code translation cache');
      }

      this._logger.log(
        LogLevel.INFO,
        'Restored code translation cache',
        this._className
      );
    }

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
                this._className
              );
              await this.updateStoreRecordAsync(codeFileUri, dateModified);
            } else {
              this._logger.log(
                LogLevel.VERBOSE,
                `File ${codeFileUri} already exists in cache`,
                this._className
              );
            }
          });
        } catch (error) {
          this._logger.log(
            LogLevel.ERROR,
            'Error initializing initial file contents',
            this._className
          );
          window.showErrorMessage('Error initializing initial file contents');
        }
      }
    );
  }

  private clearOldCaches(context: ExtensionContext) {
    this._oldCacheKeys.forEach(oldCacheKey => {
      const oldCache =
        context.globalState.get<Map<string, CodeTranslation>>(oldCacheKey);
      if (oldCache) {
        context.globalState.update(oldCacheKey, undefined);
      }
    });
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
      this._className
    );
  }

  public async updateStoreRecordAsync(codeFileUri: Uri, dateModified?: Date) {
    const codeFileContents = await new FileReader().readWorkspaceFileAsync(
      Uri.file(codeFileUri.fsPath)
    );

    const codeTranslation: CodeTranslation = {
      fileContents: codeFileContents,
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

  public getCodeTranslation(codeFileUri: Uri): CodeTranslation | undefined {
    return this._codeTranslations.get(codeFileUri.fsPath);
  }

  private readonly updateCache = () => {
    const cacheArray = Array.from(this._codeTranslations.values());
    this._context!.globalState.update(this._newCacheKey, cacheArray);
  };

  /**
   * Compares translation keys between two versions of code and
   * determines if translation-related changes are present.
   *
   * @param oldCode - The initial code snapshot.
   * @param newCode - The modified code snapshot.
   * @param config - User-defined configuration for translation functions and components.
   * @returns An object containing a boolean indicating if changes occurred and another boolean indicating if deletions occurred.
   */
  public async hasTranslationChanges(
    changeFileUri: Uri,
    config: I18nextScannerModuleConfiguration
  ): Promise<{
    hasChanges: boolean;
    hasDeletions: boolean;
    hasRenames: boolean;
  }> {
    const oldCode = this._codeTranslations.get(
      changeFileUri.fsPath
    )?.fileContents;
    const newCode = await new FileReader().readWorkspaceFileAsync(
      changeFileUri
    );

    const oldKeys = extractTranslationKeys(oldCode ?? '', config);
    const newKeys = extractTranslationKeys(newCode, config);

    if (!newKeys) {
      return { hasChanges: false, hasDeletions: false, hasRenames: false };
    }

    const oldKeyObject = oldKeys?.reduce((acc, key) => {
      const keyParts = key.split(config.keySeparator);
      let current = acc;
      keyParts.forEach((part, index) => {
        if (!current[part]) {
          current[part] = index === keyParts.length - 1 ? true : {};
        }
        current = current[part];
      });
      return acc;
    }, {} as any);

    const newKeyObject = newKeys.reduce((acc, key) => {
      const keyParts = key.split(config.keySeparator);
      let current = acc;
      keyParts.forEach((part, index) => {
        if (!current[part]) {
          current[part] = index === keyParts.length - 1 ? true : {};
        }
        current = current[part];
      });
      return acc;
    }, {} as any);

    const compareObjects = (
      obj1: any,
      obj2: any
    ): { hasChanges: boolean; hasDeletions: boolean; hasRenames: boolean } => {
      let hasChanges = false;
      let hasDeletions = false;
      let hasRenames = false;

      const keys1 = Object.keys(obj1);
      const keys2 = Object.keys(obj2);

      for (const key of keys2) {
        if (!keys1.includes(key)) {
          hasChanges = true;
        } else if (
          typeof obj1[key] === 'object' &&
          typeof obj2[key] === 'object'
        ) {
          const result = compareObjects(obj1[key], obj2[key]);
          hasChanges = hasChanges || result.hasChanges;
          hasDeletions = hasDeletions || result.hasDeletions;
          hasRenames = hasRenames || result.hasRenames;
        }
      }

      for (const key of keys1) {
        if (!keys2.includes(key)) {
          hasChanges = true;
          hasDeletions = true;
        }
      }

      return { hasChanges, hasDeletions, hasRenames };
    };

    return compareObjects(oldKeyObject, newKeyObject);
  }
}
