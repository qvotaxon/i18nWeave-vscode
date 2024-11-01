import fs from 'fs';
import { ExtensionContext, ProgressLocation, window } from 'vscode';

import { FileReader } from '@i18n-weave/file-io/file-io-file-reader';

import { FileLocationStore } from '@i18n-weave/store/store-file-location-store';

import { arraysEqual } from '@i18n-weave/util/util-array-utilities';
import {
  ConfigurationStoreManager,
  I18nextScannerModuleConfiguration,
} from '@i18n-weave/util/util-configuration';

type CodeTranslation = {
  filePath: string;
  translationFunctionNames: string[];
  dateModified: Date;
};

export class CodeTranslationStore {
  private _context: ExtensionContext | undefined;
  private _cacheKey = 'i18nWeave.translationFunctionCache';
  private static _instance: CodeTranslationStore;
  private _codeTranslations: Map<string, CodeTranslation> = new Map();

  private constructor() {}

  public static getInstance(): CodeTranslationStore {
    if (!CodeTranslationStore._instance) {
      CodeTranslationStore._instance = new CodeTranslationStore();
    }
    return CodeTranslationStore._instance;
  }

  public async initializeAsync(context: ExtensionContext): Promise<void> {
    this._context = context;
    const storedCache = context.globalState.get<Map<string, CodeTranslation>>(
      this._cacheKey
    );

    if (storedCache) {
      storedCache.forEach(entry => {
        this._codeTranslations.set(entry.filePath, entry);
      });
    }

    window.withProgress(
      {
        location: ProgressLocation.Window,
        title: 'Initializing file caches',
      },
      async () => {
        try {
          const fileExtensions =
            ConfigurationStoreManager.getInstance().getConfig<I18nextScannerModuleConfiguration>(
              'i18nextScannerModule'
            ).fileExtensions;

          const fsPaths =
            FileLocationStore.getInstance().getFileLocationsByType(
              fileExtensions
            );

          fsPaths.forEach(async fsPath => {
            const stats = fs.statSync(fsPath);
            const dateModified = stats.mtime;

            if (
              !this._codeTranslations.get(fsPath) ||
              new Date(
                this._codeTranslations.get(fsPath)!.dateModified
              ).getTime() !== new Date(dateModified).getTime()
            ) {
              await this.updateStoreRecordAsync(fsPath, dateModified);
            }
          });
        } catch (error) {
          console.error('Error initializing initial file contents:', error);
          window.showErrorMessage('Error initializing initial file contents');
        }
      }
    );
  }

  public async updateStoreRecordAsync(fsPath: string, dateModified?: Date) {
    const codeFileContents = await FileReader.readFileAsync(fsPath);
    const translationFunctionNames =
      this.scanCodeFileForTranslationFunctionNames(codeFileContents);

    const codeTranslation: CodeTranslation = {
      translationFunctionNames: translationFunctionNames,
      dateModified: dateModified ?? new Date(),
      filePath: fsPath,
    };

    this._codeTranslations.set(fsPath, codeTranslation);
    this.updateCache();
  }

  public deleteStoreRecord(fsPath: string) {
    this._codeTranslations.delete(fsPath);
    this.updateCache();
  }

  private updateCache = () => {
    const cacheArray = Array.from(this._codeTranslations.values());
    this._context!.globalState.update(this._cacheKey, cacheArray);
  };

  public async fileChangeContainsTranslationFunctionsAsync(
    fsPath: string
  ): Promise<boolean> {
    const codeFileContents = await FileReader.readFileAsync(fsPath);
    const newTranslationFunctionNames =
      this.scanCodeFileForTranslationFunctionNames(codeFileContents);
    const currentTranslationFunctionNames =
      this._codeTranslations.get(fsPath)?.translationFunctionNames;

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
