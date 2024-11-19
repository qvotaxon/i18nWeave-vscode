import * as vscode from 'vscode';

import { FileChangeHandlerFactory } from '@i18n-weave/feature/feature-file-change-handler-factory';

import { FileLocationStore } from '@i18n-weave/store/store-file-location-store';

import { FileType } from '@i18n-weave/util/util-enums';
import { FileSearchLocation } from '@i18n-weave/util/util-types';

/**
 * Class responsible for creating file watchers for files matching a given glob pattern.
 */
export class FileWatcherCreator {
  private readonly debounceMap: Map<string, NodeJS.Timeout> = new Map();

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
        if (FileLocationStore.getInstance().hasFile(uri)) {
          await fileChangeHandler?.handleFileDeletionAsync(uri);
        }
      }
    });

    fileWatcher.onDidChange(async uri => {
      if (!disableFlags.some(flag => flag())) {
        const uriString = uri.toString();
        if (this.debounceMap.has(uriString)) {
          clearTimeout(this.debounceMap.get(uriString));
        }

        this.debounceMap.set(
          uriString,
          setTimeout(async () => {
            if (FileLocationStore.getInstance().hasFile(uri)) {
              await fileChangeHandler?.handleFileChangeAsync(uri);
            }
            this.debounceMap.delete(uriString);
          }, 150)
        );
      }
    });

    fileWatchers.push(fileWatcher);

    return fileWatchers;
  }
}
