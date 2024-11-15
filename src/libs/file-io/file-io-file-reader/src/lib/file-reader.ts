import Sentry from '@sentry/node';
import fs from 'fs';
import { Uri, workspace } from 'vscode';

/**
 * Utility class for reading files asynchronously.
 */
export class FileReader {
  /**
   * Reads the contents of a file asynchronously.
   * @param filePath - The path to the file to be read.
   * @returns A promise that resolves with the contents of the file as a string.
   */
  public static async readWorkspaceFileAsync(filePath: Uri): Promise<string> {
    try {
      const fileData = await workspace.fs.readFile(filePath);
      return new TextDecoder().decode(fileData);
    } catch (error) {
      Sentry.captureException(error);
      return Promise.reject(error as Error);
    }
  }
}
