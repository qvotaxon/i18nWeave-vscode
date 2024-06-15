import { Uri } from 'vscode';

/**
 * Represents a store for managing file locks.
 */
export default class FileLockStoreStore {
  private static instance: FileLockStoreStore;
  private fileLocks: Map<string, number> = new Map<string, number>();

  private constructor() {}

  /**
   * Returns the singleton instance of FileLockStoreStore.
   * @returns The singleton instance.
   */
  static getInstance(): FileLockStoreStore {
    if (!FileLockStoreStore.instance) {
      FileLockStoreStore.instance = new FileLockStoreStore();
    }
    return FileLockStoreStore.instance;
  }

  /**
   * Adds a file lock for the specified URI.
   * @param uri - The URI of the file.
   */
  add(uri: Uri): void {
    const lockCount = this.fileLocks.get(uri.fsPath) || 0;
    this.fileLocks.set(uri.fsPath, lockCount + 1);
  }

  /**
   * Deletes the file lock for the specified URI.
   * @param uri - The URI of the file.
   */
  delete(uri: Uri): void {
    const lockCount = this.fileLocks.get(uri.fsPath);
    if (lockCount === undefined) {
      return;
    }

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
    return this.fileLocks.has(uri.fsPath);
  }
}
