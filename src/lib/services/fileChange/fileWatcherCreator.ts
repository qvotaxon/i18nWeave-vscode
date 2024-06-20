import * as vscode from 'vscode';

import WebViewService from '../webview/webviewService';
import FileChangeHandlerFactory from './fileChangeHandlerFactory';
import JsonFileChangeHandler from './fileChangeHandlers/jsonFileChangeHandler';

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
  public async createFileWatchersForFilesMatchingGlobAsync(
    pattern: string,
    context: vscode.ExtensionContext,
    ...disableFlags: (() => boolean)[]
  ): Promise<vscode.FileSystemWatcher[]> {
    const fileURIs = await vscode.workspace.findFiles(
      pattern,
      '**/{node_modules,.next}/**'
    );
    const fileWatchers: vscode.FileSystemWatcher[] = [];

    await Promise.all(
      fileURIs.map(async fileURI => {
        const fsPath = fileURI.fsPath;
        const fileWatcher = vscode.workspace.createFileSystemWatcher(fsPath);
        const fileChangeHandler =
          new FileChangeHandlerFactory().createFileChangeHandler(fsPath);

        fileWatcher.onDidChange(async uri => {
          if (!disableFlags.some(flag => flag())) {
            await fileChangeHandler?.handleFileChangeAsync(uri);
          }
        });

        //TODO: Move this to a more appropriate place
        // Open JSON files as tables
        if (fileChangeHandler instanceof JsonFileChangeHandler) {
          vscode.workspace.onDidOpenTextDocument(document => {
            const uri = document.uri;
            if (uri.scheme === 'file' && uri.fsPath === fsPath) {
              WebViewService.getInstance().openJsonAsTable(uri, context);
            }
          });
        }

        fileWatchers.push(fileWatcher);
      })
    );

    return fileWatchers;
  }
}
