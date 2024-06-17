import fs from 'fs';
import {
  ExtensionContext,
  GlobPattern,
  ProgressLocation,
  window,
  workspace,
} from 'vscode';

/**
 * Manages the content of files and their state for the VSCode extension.
 */
export default class FileContentStore {
  private static instance: FileContentStore;
  private previousFileContents: Map<string, string> = new Map();
  private currentFileContents: Map<string, string> = new Map();
  private fileModificationTimes: Map<string, Date> = new Map();
  private context?: ExtensionContext;

  private constructor() {
    this.loadCacheFromState();
  }

  /**
   * Returns the singleton instance of FileContentStore.
   */
  public static getInstance(
    context?: ExtensionContext | undefined
  ): FileContentStore {
    if (!FileContentStore.instance) {
      if (!context) {
        throw new Error('Extension context not provided');
      }

      FileContentStore.instance = new FileContentStore();
      FileContentStore.instance.context = context;
    }
    return FileContentStore.instance;
  }

  /**
   * Initializes the initial file contents asynchronously based on the given pattern.
   * @param pattern - Glob pattern to match files.
   */
  public async initializeInitialFileContentsAsync(pattern: GlobPattern) {
    await window.withProgress(
      {
        location: ProgressLocation.Window,
        title: 'Initializing file caches',
      },
      async () => {
        try {
          const fileUris = await workspace.findFiles(
            pattern,
            '**/{node_modules,.git,.next}/**'
          );

          for (const fileUri of fileUris) {
            await this.updatePreviousFileContents(fileUri.fsPath);
          }
          this.saveCacheToState();
        } catch (error) {
          console.error('Error initializing initial file contents:', error);
          window.showErrorMessage('Error initializing initial file contents');
        }
      }
    );
  }

  /**
   * Checks if the file changes contain translation keys.
   * @param fsPath - The file system path of the file.
   */
  public fileChangeContainsTranslationKeys(fsPath: string): boolean {
    const previousData = this.previousFileContents.get(fsPath) || '';
    const currentData = this.currentFileContents.get(fsPath) || '';
    const changedLines = this.getChangedLines(currentData, previousData);
    const translationKeys = this.extractTranslationKeys(changedLines);
    return translationKeys.length > 0;
  }

  /**
   * Updates the previous file contents for a given file path if it has changed.
   * @param fsPath - The file system path of the file.
   */
  public async updatePreviousFileContents(fsPath: string) {
    const stats = await fs.promises.stat(fsPath);
    const lastModified = stats.mtime;

    if (
      this.fileModificationTimes.get(fsPath)?.getTime() !==
      lastModified.getTime()
    ) {
      const fileContent = await fs.promises.readFile(fsPath, {
        encoding: 'utf8',
      });
      this.previousFileContents.set(fsPath, fileContent);
      this.fileModificationTimes.set(fsPath, lastModified);
    }
  }

  /**
   * Updates the current file contents for a given file path if it has changed.
   * @param fsPath - The file system path of the file.
   */
  public async updateCurrentFileContents(fsPath: string) {
    const stats = await fs.promises.stat(fsPath);
    const lastModified = stats.mtime;

    if (
      this.fileModificationTimes.get(fsPath)?.getTime() !==
      lastModified.getTime()
    ) {
      const fileContent = await fs.promises.readFile(fsPath, {
        encoding: 'utf8',
      });
      this.currentFileContents.set(fsPath, fileContent);
      this.fileModificationTimes.set(fsPath, lastModified);
    }
  }

  /**
   * Stores the current file state if it has changed.
   * @param fsPath - The file system path of the file.
   */
  public storeFileState(fsPath: string) {
    const previousData = this.previousFileContents.get(fsPath) || '';
    const currentData = this.currentFileContents.get(fsPath) || '';

    if (currentData !== previousData) {
      this.previousFileContents.set(fsPath, currentData);
    }
  }

  private getChangedLines(currentData: string, previousData: string): string[] {
    const currentLines = currentData.split('\n');
    const previousLines = previousData.split('\n');

    const changedLines: string[] = [];

    const currentLineSet = new Set(currentLines.map(line => line.trim()));
    const previousLineSet = new Set(previousLines.map(line => line.trim()));

    for (const line of currentLines) {
      if (!previousLineSet.has(line.trim())) {
        changedLines.push(line);
      }
    }

    for (const line of previousLines) {
      if (!currentLineSet.has(line.trim())) {
        changedLines.push(line);
      }
    }

    return changedLines;
  }

  private extractTranslationKeys(lines: string[]): string[] {
    const translationKeys: string[] = [];
    const keyRegex = /(?:I18nKey|t)\(\s*['"`](.*?)['"`]\s*\)?/g;

    for (const line of lines) {
      let match;
      while ((match = keyRegex.exec(line)) !== null) {
        translationKeys.push(match[1]);
      }
    }

    return translationKeys;
  }

  /**
   * Saves the current cache to VSCode state.
   */
  private saveCacheToState() {
    const cacheData = {
      previousFileContents: Array.from(this.previousFileContents.entries()),
      currentFileContents: Array.from(this.currentFileContents.entries()),
      fileModificationTimes: Array.from(
        this.fileModificationTimes.entries()
      ).map(([key, value]) => [key, value.toISOString()]),
    };
    this.context!.globalState.update('fileCache', JSON.stringify(cacheData));
  }

  /**
   * Loads the cache from VSCode state.
   */
  private loadCacheFromState() {
    const cacheDataString = this.context!.globalState.get<string>('fileCache');
    if (cacheDataString) {
      const cacheData = JSON.parse(cacheDataString);
      this.previousFileContents = new Map(cacheData.previousFileContents);
      this.currentFileContents = new Map(cacheData.currentFileContents);
      this.fileModificationTimes = new Map(
        cacheData.fileModificationTimes.map(
          ([key, value]: [string, string]) => [key, new Date(value)]
        )
      );
    }
  }
}
