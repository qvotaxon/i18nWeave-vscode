import * as vscode from 'vscode';

import { FileType } from '../../enums/fileType';
import FileLocationStore from '../../stores/fileLocation/fileLocationStore';
import { FileSearchLocation } from '../../types/fileSearchLocation';
import FileChangeHandlerFactory from './fileChangeHandlerFactory';

/**
 * Class responsible for creating file watchers for files matching a given glob pattern.
 */
export default class FileWatcherCreator {
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
    ...disableFlags: (() => boolean)[]
  ): Promise<vscode.FileSystemWatcher[]> {
    const fileWatchers: vscode.FileSystemWatcher[] = [];
    const fileWatcher = vscode.workspace.createFileSystemWatcher(
      fileSearchLocation.filePattern
    );
    const fileChangeHandler =
      new FileChangeHandlerFactory().createFileChangeHandler(fileType);

    fileWatcher.onDidCreate(async uri => {
      if (!disableFlags.some(flag => flag())) {
        await fileChangeHandler?.handleFileCreationAsync(uri);
      }
    });

    // TODO: Find a way to get this to work.
    // Currently it's not working because files not existing during extension startup are not registered in the file location store, so the watcher is not created.
    //
    // We can fix this by adding the file to the file location store when the file change handler is created (so in the createFileChangeHandler method).
    // And having the current flow just work based on glob patterns.
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
    // })
    // );

    return fileWatchers;
  }
}
