import { Uri } from 'vscode';
import { ExtractedFileParts } from '../types/extractedFileParts';

/**
 * The FilePathProcessor class is responsible for processing file paths and extracting locale and output path information.
 */
export default class FilePathProcessor {
  private static extractLocale(filePath: string): string {
    const localePattern = /\\locales\\([^\\]+)\\/;
    const match = localePattern.exec(filePath);
    if (!match || match.length < 2) {
      throw new Error('Invalid file path format');
    }
    return match[1];
  }

  private static determineOutputPath(filePath: string): Uri {
    if (!filePath.endsWith('.po') && !filePath.endsWith('.json')) {
      throw new Error(
        'Invalid file extension. Only .po and .json files are supported.'
      );
    }

    const isPOFile = filePath.endsWith('.po');
    const commonPath = filePath.replace(/\.po$|\.json$/, '');

    return isPOFile
      ? Uri.file(`${commonPath}.json`)
      : Uri.file(`${commonPath}.po`);
  }

  /**
   * Processes the given file path and extracts the locale and output path.
   * @param filePath - The file path to process.
   * @returns A {@link ExtractedFileParts} object containing the extracted locale and output path.
   */
  public static processFilePath(filePath: string): ExtractedFileParts {
    const locale = this.extractLocale(filePath);
    const outputPath = this.determineOutputPath(filePath);

    return { locale, outputPath };
  }
}
