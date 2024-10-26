import vscode from 'vscode';

import { getFileExtension } from '@i18n-weave/util/util-file-path-utilities';
import { FileSearchLocation } from '@i18n-weave/util/util-types';

export class FileLocationStore {
  private static instance: FileLocationStore;
  private fileLocations: Map<string, Set<string>> = new Map();

  private constructor() {
    // Private constructor to prevent instantiation
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
    for (const fileSearchLocation of fileSearchLocations) {
      const files = await vscode.workspace.findFiles(
        fileSearchLocation.filePattern,
        fileSearchLocation.ignorePattern
      );
      files.forEach(file => this.addOrUpdateFile(file));
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
   * Gets all file locations of specific types.
   * @param extensions An array of file extensions (e.g., ['json', 'po', 'ts']).
   * @returns An array of URIs for files of the specified types.
   */
  public getFileLocationsByType(
    extensions: string[],
    filter?: RegExp
  ): string[] {
    const files: string[] = [];
    for (const extension of extensions) {
      const extensionFiles = this.fileLocations.get(extension);
      if (extensionFiles) {
        files.push(...Array.from(extensionFiles));
      }
    }

    if (filter) {
      return files.filter(file => filter.test(file));
    }

    return files;
  }

  public hasFile(uri: vscode.Uri): boolean {
    const extension = getFileExtension(uri);

    const filesWithExtension = this.fileLocations.get(extension);
    const hasFile = filesWithExtension?.has(uri.fsPath) ?? false;

    return this.fileLocations.get(extension)?.has(uri.fsPath) ?? false;
  }

  //TODO: reenable this method and fix the related tests. I couldnt' get the mocking of the files to work and the method is unused for now.
  /**
   * Gets related files by replacing the extension of the given URI.
   * @param uri The original URI.
   * @param newExtension The new extension to look for.
   * @returns An array of related URIs.
   */
  //   public getRelatedFiles(uri: vscode.Uri, newExtension: string): vscode.Uri[] {
  //     const originalPath = uri.fsPath;
  //     const baseName = originalPath.slice(0, originalPath.lastIndexOf('.'));
  //     const relatedFilePath = vscode.Uri.file(`${baseName}.${newExtension}`);

  //     return this.fileLocations.get(newExtension)?.has(relatedFilePath)
  //       ? [relatedFilePath]
  //       : [];
  //   }
}
