import path from 'path';
import vscode, { workspace } from 'vscode';
import { Uri } from 'vscode';

import I18nextScannerModuleConfiguration from '../entities/configuration/modules/i18nextScanner/i18nextScannerModuleConfiguration';
import ConfigurationStoreManager from '../stores/configuration/configurationStoreManager';
import { ExtractedFileParts as FilePathParts } from '../types/extractedFileParts';

export function extractLocale(filePath: string): string {
  const translationFilesLocation =
    ConfigurationStoreManager.getInstance()
      .getConfig<I18nextScannerModuleConfiguration>('i18nextScannerModule')
      .translationFilesLocation.split('/')
      .pop() || '';

  const localePattern = new RegExp(
    `\\\\${translationFilesLocation}\\\\([^\\\\]+)\\\\`
  );

  const match = localePattern.exec(filePath);
  if (!match || match.length < 2) {
    throw new Error('Invalid file path format');
  }
  return match[1];
}

export function determineOutputPath(filePath: string): Uri {
  if (!filePath.endsWith('.po') && !filePath.endsWith('.json')) {
    throw new Error(
      'Invalid file extension. Only .po and .json files are supported.'
    );
  }

  const commonPath = filePath.replace(/\.po$|\.json$/, '');
  return filePath.endsWith('.po')
    ? Uri.file(`${commonPath}.json`)
    : Uri.file(`${commonPath}.po`);
}

/**
 * Processes the given file path and extracts the locale and output path.
 * @param filePath - The file path to process.
 * @returns A {@link FilePathParts} object containing the extracted locale and output path.
 */
export function extractFilePathParts(filePath: string): FilePathParts {
  const locale = extractLocale(filePath);
  const outputPath = determineOutputPath(filePath);

  return { locale, outputPath } as FilePathParts;
}

/**
 * Gets the file extension from a URI.
 * @param uri The URI of the file.
 * @returns The file extension.
 */
export function getFileExtension(uri: vscode.Uri): string {
  return path.extname(uri.fsPath).slice(1);
}

export function getSingleWorkSpaceRoot(): string {
  const workspaceFolders = workspace.workspaceFolders;
  if (!workspaceFolders) {
    throw new Error('No workspace folders found');
  }

  // Assuming you want to use the first workspace folder
  const rootFolder = workspaceFolders[0].uri.fsPath;

  return rootFolder;
}
