import { Uri } from 'vscode';

/**
 * Represents a store for managing file locks.
 */
export default class FileLockStoreStore {
  private static instance: FileLockStoreStore;
  private fileLocks: Set<string> = new Set<string>();

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
    this.fileLocks.add(uri.fsPath);
  }

  /**
   * Deletes the file lock for the specified URI.
   * @param uri - The URI of the file.
   */
  delete(uri: Uri): void {
    this.fileLocks.delete(uri.fsPath);
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
