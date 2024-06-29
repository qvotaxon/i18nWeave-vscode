import fs from 'fs';
import { ProgressLocation, window } from 'vscode';

import I18nextScannerModuleConfiguration from '../../entities/configuration/modules/i18nextScanner/i18nextScannerModuleConfiguration';
import ConfigurationStoreManager from '../configuration/configurationStoreManager';
import FileLocationStore from '../fileLocation/fileLocationStore';

export default class FileContentStore {
  private static instance: FileContentStore;
  public static readonly previousFileContents: string[] = [];
  public static readonly currentFileContents: string[] = [];

  public getCurrentFileContents = () => FileContentStore.currentFileContents;
  public getPreviousFileContents = () => FileContentStore.previousFileContents;

  private constructor() {}

  public static getInstance(): FileContentStore {
    if (!FileContentStore.instance) {
      FileContentStore.instance = new FileContentStore();
    }
    return FileContentStore.instance;
  }

  public initializeInitialFileContents() {
    window.withProgress(
      {
        location: ProgressLocation.Window,
        title: 'Initializing file caches',
      },
      async () => {
        try {
          const fsPaths = FileLocationStore.getInstance().getFilesByType([
            'ts',
            'tsx',
          ]);

          fsPaths.forEach(fsPath => {
            FileContentStore.updatePreviousFileContents(fsPath);
          });
        } catch (error) {
          console.error('Error initializing initial file contents:', error);
          window.showErrorMessage('Error initializing initial file contents');
        }
      }
    );
  }

  public static fileChangeContainsTranslationKeys(fsPath: string): boolean {
    const changedLines = FileContentStore.getChangedLines(
      FileContentStore.currentFileContents[fsPath as keyof object],
      FileContentStore.previousFileContents[fsPath as keyof object]
    );

    if (changedLines.length === 0) {
      return false;
    }

    const translationKeys =
      FileContentStore.extractTranslationKeys(changedLines);

    return translationKeys.length > 0;
  }

  public static updatePreviousFileContents(fsPath: string) {
    const fileContent = fs.readFileSync(fsPath, { encoding: 'utf8' });
    FileContentStore.previousFileContents[fsPath as keyof object] = fileContent;
  }

  public static updateCurrentFileContents(fsPath: string) {
    const fileContent = fs.readFileSync(fsPath, { encoding: 'utf8' });
    FileContentStore.currentFileContents[fsPath as keyof object] = fileContent;
  }

  public static storeFileState(fsPath: string) {
    const previousData =
      FileContentStore.previousFileContents[fsPath as keyof object] || '';

    if (
      FileContentStore.currentFileContents[fsPath as keyof object] !==
      previousData
    ) {
      FileContentStore.previousFileContents[fsPath as keyof object] =
        FileContentStore.currentFileContents[fsPath as keyof object];
    }
  }

  private static getChangedLines = (
    currentData: string,
    previousData: string
  ): string[] => {
    const currentLines = currentData.split('\n');
    const previousLines = previousData?.split('\n') ?? [];

    const changedLines: string[] = [];

    const currentLineSet = new Set(currentLines.map(line => line.trim()));
    const previousLineSet = new Set(previousLines.map(line => line.trim()));

    for (const element of currentLines) {
      const currentLine = element.trim();

      if (!previousLineSet.has(currentLine)) {
        changedLines.push(element);
      }
    }

    for (const element of previousLines) {
      const previousLine = element.trim();

      if (!currentLineSet.has(previousLine)) {
        changedLines.push(element);
      }
    }

    return changedLines;
  };

  private static extractTranslationKeys = (lines: string[]) => {
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

    const translationKeys: string[] = [];
    lines.forEach((line: string) => {
      let match;
      while ((match = keyRegex.exec(line)) !== null) {
        translationKeys.push(match[1]);
      }
    });

    return translationKeys;
  };
}
