import Sentry from '@sentry/node';
import { Uri, workspace } from 'vscode';

/**
 * Utility class for reading files asynchronously.
 */
export class FileReader {
  constructor(private fs = workspace.fs) {}

  /**
   * Reads the contents of a file asynchronously.
   * @param filePath - The path to the file to be read.
   * @returns A promise that resolves with the contents of the file as a string.
   */
  public async readWorkspaceFileAsync(filePath: Uri): Promise<string> {
    try {
      const fileData = await this.fs.readFile(filePath);
      return new TextDecoder().decode(fileData);
    } catch (error) {
      Sentry?.captureException(error);
      return Promise.reject(error as Error);
    }
  }
}
