import Sentry from '@sentry/node';
import { Uri, workspace } from 'vscode';

/**
 * Utility class for writing data to a file asynchronously.
 */
export class FileWriter {
  /**
   * Writes data to a file asynchronously.
   * @param filePath - The path of the file to write to.
   * @param data - The data to write to the file.
   * @returns A promise that resolves when the data has been written successfully, or rejects with an error if there was a problem.
   */
  public static async writeToWorkspaceFileAsync(
    filePath: Uri,
    data: string
  ): Promise<void> {
    try {
      const textEncoder = new TextEncoder();
      await workspace.fs.writeFile(filePath, textEncoder.encode(data));
    } catch (err) {
      if (Sentry) {
        Sentry.captureException(err);
      }
    }
  }
}
