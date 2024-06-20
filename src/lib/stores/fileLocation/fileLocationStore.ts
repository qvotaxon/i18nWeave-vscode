import vscode from 'vscode';

import { getFileExtension } from '../../utilities/filePathUtilities';

export default class FileLocationStore {
  private static instance: FileLocationStore;
  private fileLocations: Map<string, Set<vscode.Uri>> = new Map();

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
  public async scanWorkspace(filePatterns: string[], ignorePattern: string) {
    for (const pattern of filePatterns) {
      const files = await vscode.workspace.findFiles(pattern, ignorePattern);
      files.forEach(file => this.addFile(file));
    }
  }

  /**
   * Adds a file to the store.
   * @param uri The URI of the file.
   */
  private addFile(uri: vscode.Uri) {
    const extension = getFileExtension(uri);
    if (!this.fileLocations.has(extension)) {
      this.fileLocations.set(extension, new Set());
    }
    this.fileLocations.get(extension)!.add(uri);
  }

  /**
   * Removes a file from the store.
   * @param uri The URI of the file.
   */
  private removeFile(uri: vscode.Uri) {
    const extension = getFileExtension(uri);
    this.fileLocations.get(extension)?.delete(uri);
  }

  /**
   * Gets all files of specific types.
   * @param extensions An array of file extensions (e.g., ['json', 'po', 'ts']).
   * @returns An array of URIs for files of the specified types.
   */
  public getFilesByType(extensions: string[]): vscode.Uri[] {
    const files: vscode.Uri[] = [];
    for (const extension of extensions) {
      const extensionFiles = this.fileLocations.get(extension);
      if (extensionFiles) {
        files.push(...Array.from(extensionFiles));
      }
    }
    return files;
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

  /**
   * Creates file watchers for the tracked files and sets up event handlers.
   */
  public createFileWatchers(context: vscode.ExtensionContext) {
    const filePatterns = ['**/*.json', '**/*.po', '**/*.ts'];

    for (const pattern of filePatterns) {
      const watcher = vscode.workspace.createFileSystemWatcher(pattern);

      watcher.onDidCreate(uri => this.addFile(uri));
      watcher.onDidDelete(uri => this.removeFile(uri));
      // Optionally handle file changes if necessary

      context.subscriptions.push(watcher);
    }
  }
}
