import * as vscode from 'vscode';
import FileChangeHandlerFactory from './fileChangeHandlerFactory';

/**
 * Class responsible for creating file watchers.
 */
export default class FileWatcherCreator {
  /**
   * Creates a single file watcher for a given glob pattern.
   * @param pattern - The glob pattern to watch for file changes.
   * @param disableFlags - Optional disable flags that determine whether the file watcher should be disabled.
   * @returns A promise that resolves to a `vscode.FileSystemWatcher` instance.
   */
  public createSingleFileWatcherForGlobAsync = async (
    pattern: vscode.GlobPattern,
    ...disableFlags: (() => boolean)[]
  ): Promise<vscode.FileSystemWatcher> => {
    return new Promise<vscode.FileSystemWatcher>((resolve, reject) => {
      try {
        const fileWatcher = vscode.workspace.createFileSystemWatcher(pattern);
        const fileChangeHandlerFactory = new FileChangeHandlerFactory();

        fileWatcher.onDidChange(async (uri) => {
          if (!disableFlags.some((disableFlag) => disableFlag())) {
            const fileChangeHandler =
              fileChangeHandlerFactory.createFileChangeHandler(uri.fsPath);
            await fileChangeHandler?.handleFileChangeAsync(uri);
          }
        });

        resolve(fileWatcher);
      } catch (error) {
        reject(new Error(error as string));
      }
    });
  };

  /**
   * Creates file watchers for each file in a given glob pattern.
   * @param pattern - The glob pattern to search for files.
   * @param disableFlags - Optional disable flags that determine whether the file watchers should be disabled.
   * @returns A promise that resolves to an array of `vscode.FileSystemWatcher` instances.
   */
  public async createFileWatcherForEachFileInGlobAsync(
    pattern: string,
    ...disableFlags: (() => boolean)[]
  ): Promise<vscode.FileSystemWatcher[]> {
    const fileURIs = await vscode.workspace.findFiles(
      pattern,
      '**/node_modules/**'
    );
    const fileWatchers: vscode.FileSystemWatcher[] = [];

    await Promise.all(
      fileURIs.map(async (fileURI) => {
        const filePath = fileURI.fsPath;
        const fileWatcher = await this.createSingleFileWatcherForGlobAsync(
          filePath,
          ...disableFlags
        );
        fileWatchers.push(fileWatcher);
      })
    );

    return fileWatchers;
  }
}
