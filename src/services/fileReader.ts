import fs from 'fs';

/**
 * A utility class for reading files asynchronously.
 */
export class FileReader {
  /**
   * Reads a file asynchronously and returns its content as a string.
   * @param filePath - The path to the file to be read.
   * @returns A Promise that resolves to the content of the file as a string.
   * @throws If there was an error reading the file.
   */
  public static async readFileAsync(filePath: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    }).catch((err) => {
      throw new Error(`Error reading file: ${err.message}`);
    });
  }
}
