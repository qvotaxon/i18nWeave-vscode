import vscode, { Uri } from 'vscode';

import { getFileExtension } from '@i18n-weave/util/util-file-path-utilities';
import { LogLevel, Logger } from '@i18n-weave/util/util-logger';
import { FileSearchLocation } from '@i18n-weave/util/util-types';

export class FileLocationStore {
  private static instance: FileLocationStore;
  private readonly fileLocations: Map<string, Map<string, Uri>> = new Map();
  private readonly _logger: Logger;

  private constructor() {
    // Private constructor to prevent instantiation
    this._logger = Logger.getInstance();
  }

  /**
   * Returns the singleton instance of FileLocationStore.
   */
  public static getInstance(): FileLocationStore {
    if (!FileLocationStore.instance) {
      FileLocationStore.instance = new FileLocationStore();
    }
    return FileLocationStore.instance;
  }

  /**
   * Scans the workspace for specific file types and populates the store.
   */
  public async scanWorkspaceAsync(fileSearchLocations: FileSearchLocation[]) {
    this._logger.log(LogLevel.INFO, 'Scanning workspace for files...');
    for (const fileSearchLocation of fileSearchLocations) {
      const files = await vscode.workspace.findFiles(
        fileSearchLocation.filePattern,
        fileSearchLocation.ignorePattern
      );
      files.forEach(file => this.addFile(file));
      this._logger.log(
        LogLevel.INFO,
        `Found ${files.length} number of files for search pattern ${fileSearchLocation.filePattern as string}, ignoring ${fileSearchLocation.ignorePattern as string} and .gitignore patterns.`
      );
    }
  }

  /**
   * Clears the file location store.
   * Removes all file locations from the store.
   */
  public async clearStoreAsync() {
    this.fileLocations.clear();
  }

  /**
   * Adds a file to the store.
   * @param uri The URI of the file.
   */
  public addFile(uri: vscode.Uri) {
    const extension = getFileExtension(uri);
    if (!this.fileLocations.has(extension)) {
      this.fileLocations.set(extension, new Map());
    }
    this.fileLocations.get(extension)!.set(uri.fsPath, uri);

    this._logger.log(
      LogLevel.VERBOSE,
      `Added file ${uri.fsPath} to the store.`
    );
  }

  /**
   * Removes a file from the store.
   * @param uri The URI of the file.
   */
  public deleteFile(uri: vscode.Uri) {
    const extension = getFileExtension(uri);
    this.fileLocations.get(extension)?.delete(uri.fsPath);

    this._logger.log(
      LogLevel.VERBOSE,
      `Deleted file ${uri.fsPath} from the store.`
    );
  }

  /**
   * Gets all files of specific types.
   * @param extensions An array of file extensions (e.g., ['json', 'po', 'ts']).
   * @returns An array of strings for files of the specified types.
   */
  public getFileLocationsByType(extensions: string[]): Uri[] {
    const files: Uri[] = [];
    for (const extension of extensions) {
      const extensionFiles = this.fileLocations.get(extension);
      if (extensionFiles) {
        files.push(...Array.from(extensionFiles).map(([_, value]) => value));
      }
    }
    return files;
  }

  public hasFile(uri: vscode.Uri): boolean {
    const extension = getFileExtension(uri);

    return this.fileLocations.get(extension)?.has(uri.fsPath) ?? false;
  }
}
