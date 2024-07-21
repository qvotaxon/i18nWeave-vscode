import vscode from 'vscode';

import { CacheEntry } from './cacheEntry';

export class CachingService {
  private static expirationDays: number = 14;

  /**
   * Sets a cache entry with an expiration time.
   *
   * @param context - The extension context.
   * @param key - The key for the cache entry.
   * @param value - The value to cache.
   */
  public static set<T>(
    context: vscode.ExtensionContext,
    key: string,
    value: T
  ): void {
    const timestamp = new Date().toISOString();
    context.globalState.update(key, { value, timestamp });
  }

  /**
   * Retrieves a cache entry if it exists and is not expired.
   *
   * @param context - The extension context.
   * @param key - The key for the cache entry.
   * @param expirationDays - Number of days after which the cache expires.
   * @param onCacheMiss - Callback function to be called if the cache entry is not found or expired.
   * @returns The cached value if available and not expired; otherwise, calls the onCacheMiss callback.
   */
  public static async get<T>(
    context: vscode.ExtensionContext,
    key: string,
    onCacheMiss: () => Promise<T>,
    expirationDays: number = CachingService.expirationDays
  ): Promise<T> {
    const cacheEntry = context.globalState.get<CacheEntry<T>>(key);

    if (!cacheEntry) {
      const result = await onCacheMiss(); // Cache does not exist

      CachingService.set(context, key, result);

      return result;
    }

    const { timestamp } = cacheEntry;
    const cacheDate = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - cacheDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays >= expirationDays) {
      const result = await onCacheMiss(); // Cache does not exist

      CachingService.set(context, key, result);

      return result;
    }

    return cacheEntry.value; // Cache is valid
  }

  /**
   * Clears a cache entry.
   *
   * @param context - The extension context.
   * @param key - The key for the cache entry.
   */
  public static clear(context: vscode.ExtensionContext, key: string): void {
    context.globalState.update(key, undefined);
  }

  /**
   * Sets the default expiration days for cache entries.
   *
   * @param days - Number of days after which the cache entries should expire.
   */
  public static setDefaultExpirationDays(days: number): void {
    CachingService.expirationDays = days;
  }
}
