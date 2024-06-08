import fs from 'fs';
import { Uri } from 'vscode';

/**
 * Utility class for writing data to a file asynchronously.
 */
export default class FileWriter {
  /**
   * Writes data to a file asynchronously.
   * @param filePath - The path of the file to write to.
   * @param data - The data to write to the file.
   * @returns A promise that resolves when the data has been written successfully, or rejects with an error if there was a problem.
   */
  public static async writeToFileAsync(
    filePath: Uri,
    data: string | NodeJS.ArrayBufferView
  ): Promise<void> {
    try {
      await fs.promises.writeFile(filePath.fsPath, data, 'utf8');
    } catch (err) {
      throw new Error((err as Error).message);
    }
  }
}