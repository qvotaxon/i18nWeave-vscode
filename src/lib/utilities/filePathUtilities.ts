import fs from 'fs';
import path from 'path';
import vscode, { Uri, workspace } from 'vscode';

import I18nextScannerModuleConfiguration from '../entities/configuration/modules/i18nextScanner/i18nextScannerModuleConfiguration';
import ConfigurationStoreManager from '../stores/configuration/configurationStoreManager';
import { ExtractedFileParts as FilePathParts } from '../types/extractedFileParts';

export function extractLocale(filePath: string): string {
  const translationFilesLocation =
    ConfigurationStoreManager.getInstance()
      .getConfig<I18nextScannerModuleConfiguration>('i18nextScannerModule')
      .translationFilesLocation.split('/')
      .pop() ?? '';

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

  const rootFolder = workspaceFolders[0].uri.fsPath;

  return rootFolder;
}

/**
 * Search for the project root by looking for package.json file downward.
 * Stops at node_modules directory as it likely indicates the project root.
 * @param dir - The starting directory to search from.
 * @returns The path to the project root folder or undefined if not found.
 */
export function findProjectRoot(dir: string): string | undefined {
  const queue: string[] = [dir];

  while (queue.length > 0) {
    const currentDir = queue.shift()!;

    // Check for node_modules directory
    const nodeModulesPath = path.join(currentDir, 'node_modules');
    if (fs.existsSync(nodeModulesPath)) {
      return currentDir;
    }

    // Check for package.json file
    const packageJsonPath = path.join(currentDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      return currentDir;
    }

    // Add subdirectories to the queue
    const subDirs = fs
      .readdirSync(currentDir)
      .map(name => path.join(currentDir, name))
      .filter(subPath => fs.lstatSync(subPath).isDirectory());

    queue.push(...subDirs);
  }

  return undefined;
}

/**
 * Get the actual project root folder by locating the package.json file.
 * @returns The path to the project root folder or undefined if not found.
 */
export function getProjectRootFolder(): string | undefined {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (workspaceFolders) {
    for (const folder of workspaceFolders) {
      const projectRoot = findProjectRoot(folder.uri.fsPath);
      if (projectRoot) {
        return projectRoot;
      }
    }
  }

  return undefined;
}
