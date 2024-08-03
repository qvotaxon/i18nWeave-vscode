import * as vscode from 'vscode';
import FileChangeHandlerFactory from 'lib/services/fileChange/fileChangeHandlerFactory';
import { FileSearchLocation } from 'lib/types/fileSearchLocation';

import { FileType } from '@i18n-weave/util/util-enums';

/**
 * Class responsible for creating file watchers for files matching a given glob pattern.
 */
export class FileWatcherCreator {
  public createFileWatcherForFile(
    pattern: string,
    onDidChange: (e: vscode.Uri) => any
  ) {
    const fileWatcher = vscode.workspace.createFileSystemWatcher(pattern);

    fileWatcher.onDidChange(onDidChange);

    return fileWatcher;
  }

  /**
   * Creates file watchers for files matching the specified glob pattern.
   * @param pattern - The glob pattern to match files against.
   * @param disableFlags - Optional disable flags that determine whether the file watchers should be disabled.
   * @returns A promise that resolves to an array of file system watchers.
   */
  public async createFileWatchersForFileTypeAsync(
    fileType: FileType,
    fileSearchLocation: FileSearchLocation,
    context: vscode.ExtensionContext,
    ...disableFlags: (() => boolean)[]
  ): Promise<vscode.FileSystemWatcher[]> {
    const fileWatchers: vscode.FileSystemWatcher[] = [];
    const fileWatcher = vscode.workspace.createFileSystemWatcher(
      fileSearchLocation.filePattern
    );
    const fileChangeHandler =
      new FileChangeHandlerFactory().createFileChangeHandler(fileType, context);

    fileWatcher.onDidCreate(async uri => {
      if (!disableFlags.some(flag => flag())) {
        await fileChangeHandler?.handleFileCreationAsync(uri);
      }
    });

    fileWatcher.onDidDelete(async uri => {
      if (!disableFlags.some(flag => flag())) {
        await fileChangeHandler?.handleFileDeletionAsync(uri);
      }
    });

    fileWatcher.onDidChange(async uri => {
      if (!disableFlags.some(flag => flag())) {
        await fileChangeHandler?.handleFileChangeAsync(uri);
      }
    });

    fileWatchers.push(fileWatcher);

    return fileWatchers;
  }
}
