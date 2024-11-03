import vscode from 'vscode';

import { ConfigurationStoreManager } from '@i18n-weave/util/util-configuration';
import { getFileExtension } from '@i18n-weave/util/util-file-path-utilities';
import { LogLevel, Logger } from '@i18n-weave/util/util-logger';
import { FileSearchLocation } from '@i18n-weave/util/util-types';

export class FileLocationStore {
  private static instance: FileLocationStore;
  private readonly fileLocations: Map<string, Set<string>> = new Map();
  private readonly _logger: Logger;
  private readonly _configurationStoreManager: ConfigurationStoreManager;

  private constructor() {
    // Private constructor to prevent instantiation
    this._logger = Logger.getInstance();
    this._configurationStoreManager = ConfigurationStoreManager.getInstance();
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
      files.forEach(file => this.addOrUpdateFile(file));
      this._logger.log(
        LogLevel.INFO,
        `Found ${files.length} number of files for search pattern ${fileSearchLocation.filePattern.toString}, ignoring ${fileSearchLocation.ignorePattern.toString}`
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
  public addOrUpdateFile(uri: vscode.Uri) {
    const extension = getFileExtension(uri);
    if (!this.fileLocations.has(extension)) {
      this.fileLocations.set(extension, new Set());
    }
    this.fileLocations.get(extension)!.add(uri.fsPath);
  }

  /**
   * Removes a file from the store.
   * @param uri The URI of the file.
   */
  public deleteFile(uri: vscode.Uri) {
    const extension = getFileExtension(uri);
    this.fileLocations.get(extension)?.delete(uri.fsPath);
  }

  /**
   * Gets all files of specific types.
   * @param extensions An array of file extensions (e.g., ['json', 'po', 'ts']).
   * @returns An array of URIs for files of the specified types.
   */
  public getFileLocationsByType(extensions: string[]): string[] {
    const files: string[] = [];
    for (const extension of extensions) {
      const extensionFiles = this.fileLocations.get(extension);
      if (extensionFiles) {
        files.push(...Array.from(extensionFiles));
      }
    }
    return files;
  }

  public hasFile(uri: vscode.Uri): boolean {
    const extension = getFileExtension(uri);

    return this.fileLocations.get(extension)?.has(uri.fsPath) ?? false;
  }
}
