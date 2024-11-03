import { Uri } from 'vscode';

import { LogLevel, Logger } from '@i18n-weave/util/util-logger';

/**
 * Represents a store for managing file locks.
 */
export class FileLockStore {
  private static instance: FileLockStore;
  private fileLocks: Map<string, number> = new Map<string, number>();
  private readonly _logger: Logger;

  private constructor() {
    this._logger = Logger.getInstance();
  }

  /**
   * Returns the singleton instance of FileLockStore.
   * @returns The singleton instance.
   */
  static getInstance(): FileLockStore {
    if (!FileLockStore.instance) {
      FileLockStore.instance = new FileLockStore();
    }
    return FileLockStore.instance;
  }

  /**
   * Adds a file lock for the specified URI.
   * @param uri - The URI of the file.
   */
  add(uri: Uri): void {
    this._logger.log(LogLevel.VERBOSE, 'Added file lock for ' + uri.fsPath);

    const lockCount = this.fileLocks.get(uri.fsPath) || 0;
    this.fileLocks.set(uri.fsPath, lockCount + 1);
  }

  /**
   * Deletes the file lock for the specified URI.
   * @param uri - The URI of the file.
   */
  delete(uri: Uri): void {
    this._logger.log(LogLevel.VERBOSE, 'Deleted file lock for ' + uri.fsPath);

    const lockCount = this.fileLocks.get(uri.fsPath) || 0;
    if (lockCount > 1) {
      this.fileLocks.set(uri.fsPath, lockCount - 1);
    } else {
      this.fileLocks.delete(uri.fsPath);
    }
  }

  /**
   * Checks if a file lock exists for the specified URI.
   * @param uri - The URI of the file.
   * @returns `true` if a file lock exists, `false` otherwise.
   */
  hasFileLock(uri: Uri): boolean {
    this._logger.log(LogLevel.VERBOSE, 'Checking file lock for ' + uri.fsPath);
    return this.fileLocks.has(uri.fsPath);
  }
}
