import fs from 'fs';
import { ExtensionContext, ProgressLocation, window } from 'vscode';

import { FileReader } from '@i18n-weave/file-io/file-io-file-reader';

import { arraysEqual } from '@i18n-weave/util/util-array-utilities';
import {
  ConfigurationStoreManager,
  I18nextScannerModuleConfiguration,
} from '@i18n-weave/util/util-configuration';
import { LogLevel, Logger } from '@i18n-weave/util/util-logger';

type CodeTranslation = {
  filePath: string;
  translationFunctionNames: string[];
  dateModified: Date;
};

export class CodeTranslationStore {
  private _context: ExtensionContext | undefined;
  private readonly _cacheKey = 'i18nWeave.translationFunctionCache';
  private static _instance: CodeTranslationStore;
  private readonly _codeTranslations: Map<string, CodeTranslation> = new Map();
  private readonly _logger: Logger;

  private constructor() {
    this._logger = Logger.getInstance();
  }

  public static getInstance(): CodeTranslationStore {
    if (!CodeTranslationStore._instance) {
      CodeTranslationStore._instance = new CodeTranslationStore();
    }
    return CodeTranslationStore._instance;
  }

  public async initializeAsync(
    context: ExtensionContext,
    codeFilePaths: string[]
  ): Promise<void> {
    this._logger.log(LogLevel.INFO, 'Initializing code translation store');

    this._context = context;
    const storedCache = context.globalState.get<Map<string, CodeTranslation>>(
      this._cacheKey
    );

    if (storedCache) {
      storedCache.forEach(entry => {
        this._codeTranslations.set(entry.filePath, entry);
      });
      this._logger.log(LogLevel.INFO, 'Restored code translation cache');
    }

    window.withProgress(
      {
        location: ProgressLocation.Window,
        title: 'Initializing file caches',
      },
      async () => {
        try {
          codeFilePaths.forEach(async codeFilePath => {
            const stats = fs.statSync(codeFilePath);
            const dateModified = stats.mtime;

            if (
              !this._codeTranslations.get(codeFilePath) ||
              new Date(
                this._codeTranslations.get(codeFilePath)!.dateModified
              ).getTime() !== new Date(dateModified).getTime()
            ) {
              this._logger.log(
                LogLevel.VERBOSE,
                `File ${codeFilePath} does not exist in cache, updating cache`
              );
              await this.updateStoreRecordAsync(codeFilePath, dateModified);
            } else {
              this._logger.log(
                LogLevel.VERBOSE,
                `File ${codeFilePath} already exists in cache`
              );
            }
          });
        } catch (error) {
          this._logger.log(
            LogLevel.ERROR,
            'Error initializing initial file contents'
          );
          window.showErrorMessage('Error initializing initial file contents');
        }
      }
    );
  }

  public async updateStoreRecordAsync(
    codeFilePath: string,
    dateModified?: Date
  ) {
    const codeFileContents = await FileReader.readFileAsync(codeFilePath);
    const translationFunctionNames =
      this.scanCodeFileForTranslationFunctionNames(codeFileContents);

    const codeTranslation: CodeTranslation = {
      translationFunctionNames: translationFunctionNames,
      dateModified: dateModified ?? new Date(),
      filePath: codeFilePath,
    };

    this._codeTranslations.set(codeFilePath, codeTranslation);
    this.updateCache();
  }

  public deleteStoreRecord(codeFilePath: string) {
    this._codeTranslations.delete(codeFilePath);
    this.updateCache();
  }

  private readonly updateCache = () => {
    const cacheArray = Array.from(this._codeTranslations.values());
    this._context!.globalState.update(this._cacheKey, cacheArray);
  };

  public async fileChangeContainsTranslationFunctionsAsync(
    codeFilePath: string
  ): Promise<boolean> {
    const codeFileContents = await FileReader.readFileAsync(codeFilePath);
    const newTranslationFunctionNames =
      this.scanCodeFileForTranslationFunctionNames(codeFileContents);
    const currentTranslationFunctionNames =
      this._codeTranslations.get(codeFilePath)?.translationFunctionNames;

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
