import fs from 'fs';

/**
 * Utility class for reading files asynchronously.
 */
export default class FileReader {
  /**
   * Reads the contents of a file asynchronously.
   * @param filePath - The path to the file to be read.
   * @returns A promise that resolves with the contents of the file as a string.
   */
  public static async readFileAsync(filePath: string): Promise<string> {
    try {
      return await fs.promises.readFile(filePath, 'utf8');
    } catch (err) {
      throw new Error(err.message);
    }
  }
}