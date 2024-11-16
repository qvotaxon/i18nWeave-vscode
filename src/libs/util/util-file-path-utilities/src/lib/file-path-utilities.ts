import fs from 'fs';
import path from 'path';
import vscode, { Uri, workspace } from 'vscode';

import {
  ConfigurationStoreManager,
  I18nextScannerModuleConfiguration,
} from '@i18n-weave/util/util-configuration';
import { ExtractedFileParts } from '@i18n-weave/util/util-types';

export function extractLocaleFromFileUri(fileUri: Uri): string {
  const translationFilesLocation =
    ConfigurationStoreManager.getInstance()
      .getConfig<I18nextScannerModuleConfiguration>('i18nextScannerModule')
      .translationFilesLocation.split('/')
      .pop() ?? '';

  const localePattern = new RegExp(
    `[\\\\/]${translationFilesLocation}[\\\\/]([^\\\\/]+)[\\\\/]`
  );

  const match = localePattern.exec(fileUri.fsPath);
  if (!match || match.length < 2) {
    throw new Error('Unable to extract locale from file path.');
  }
  return match[1];
}

export function determineOutputPath(fileUri: Uri): Uri {
  if (!fileUri.fsPath.endsWith('.po') && !fileUri.fsPath.endsWith('.json')) {
    throw new Error(
      'Invalid file extension. Only .po and .json files are supported.'
    );
  }

  const commonPath = fileUri.fsPath.replace(/\.po$|\.json$/, '');
  return fileUri.fsPath.endsWith('.po')
    ? Uri.file(`${commonPath}.json`)
    : Uri.file(`${commonPath}.po`);
}

/**
 * Processes the given file path and extracts the locale and output path.
 * @param fileUri - The file path to process.
 * @returns A {@link ExtractedFileParts} object containing the extracted locale and output path.
 */
export function extractFileUriParts(fileUri: Uri): ExtractedFileParts {
  const locale = extractLocaleFromFileUri(fileUri);
  const outputPath = determineOutputPath(fileUri);

  return { locale, outputPath } satisfies ExtractedFileParts;
}

/**
 * Gets the file extension from a URI.
 * @param uri The URI of the file.
 * @returns The file extension.
 */
export function getFileExtension(uri: Uri): string {
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
export function findProjectRoot(dir: Uri): Uri | undefined {
  const queue: Uri[] = [dir];

  while (queue.length > 0) {
    const currentDir = queue.shift()!;

    // Check for node_modules directory
    const nodeModulesPath = path.join(currentDir.fsPath, 'node_modules');
    if (fs.existsSync(nodeModulesPath)) {
      return currentDir;
    }

    // Check for package.json file
    const packageJsonPath = path.join(currentDir.fsPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      return currentDir;
    }

    // Add subdirectories to the queue
    const subDirs = fs
      .readdirSync(currentDir.fsPath)
      .map(name => path.join(currentDir.fsPath, name))
      .filter(subPath => fs.lstatSync(subPath).isDirectory());

    queue.push(...subDirs.map(subDir => Uri.file(subDir)));
  }

  return undefined;
}

/**
 * Get the actual project root folder by locating the package.json file.
 * @returns The path to the project root folder or undefined if not found.
 */
export function getProjectRootFolder(): Uri {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (workspaceFolders) {
    for (const folder of workspaceFolders) {
      const projectRoot = findProjectRoot(folder.uri);
      if (projectRoot) {
        return projectRoot;
      }
    }
  }

  throw new Error('Project root folder not found');
}

/**
 * Converts a VSCode URI to a POSIX-style path.
 * @param uri - The VSCode URI object.
 * @returns The POSIX-style filesystem path.
 */
export function getPosixPathFromUri(fsPath: string): string {
  return path.posix.normalize(fsPath.replace(/\\/g, '/'));
}

/**
 * Sanitizes an array of file system paths by removing any leading or trailing path separators.
 *
 * @param fileFsPaths - An array of file system paths to be sanitized.
 * @returns An array of sanitized file system paths.
 */
export function sanitizeLocations(fileFsPaths: string[]): string[] {
  const sanitizedLocations: string[] = [];

  fileFsPaths.forEach(fileFsPaths => {
    let fileFsPath = fileFsPaths;

    if (fileFsPath.endsWith(path.sep)) {
      fileFsPath = fileFsPath.substring(0, fileFsPath.length - 1);
    }

    if (fileFsPath.startsWith(path.sep)) {
      fileFsPath = fileFsPath.substring(1);
    }

    const sanitizedUri = fileFsPath;

    sanitizedLocations.push(sanitizedUri);
  });

  return sanitizedLocations;
}

/**
 * Gets the relative path of a folder from the project root folder.
 * @param folderPath - The path of the folder.
 * @returns The relative path of the folder.
 * @throws Error if the project root folder is not found.
 */
//TODO: find out why this doesn't actually return a relative path
export function getRelativePath(folderPath: Uri) {
  const projectRootFolder = getProjectRootFolder();

  return getPosixPathFromUri(
    folderPath.fsPath.replace(projectRootFolder.fsPath, '')
  );
}
