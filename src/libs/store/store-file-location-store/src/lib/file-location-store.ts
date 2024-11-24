import fs from 'fs';
import vscode, { Uri } from 'vscode';

import { FileReader } from '@i18n-weave/file-io/file-io-file-reader';

import {
  ConfigurationStoreManager,
  I18nextScannerModuleConfiguration,
} from '@i18n-weave/util/util-configuration';
import { FileType } from '@i18n-weave/util/util-enums';
import {
  extractLocaleFromFileUri,
  extractNamespaceFromFileUri,
  getFileExtension,
} from '@i18n-weave/util/util-file-path-utilities';
import { LogLevel, Logger } from '@i18n-weave/util/util-logger';
import { FileSearchLocation } from '@i18n-weave/util/util-types';

import {
  CodeFile,
  TranslationFile,
  TranslationKeyData,
} from './file-location-store.types';

export class FileLocationStore {
  private readonly _className = 'FileLocationStore';
  private static instance: FileLocationStore;
  private readonly fileLocations: Map<string, TranslationFile | CodeFile> =
    new Map();
  private readonly _logger: Logger;

  private constructor() {
    // Private constructor to prevent instantiation
    this._logger = Logger.getInstance();
  }

  /**
   * Returns the singleton instance of FileLocationStore.
   */
  public static getInstance(): FileLocationStore {
    if (!FileLocationStore.instance) {
      FileLocationStore.instance = new FileLocationStore();
    }
    return FileLocationStore.instance;
  }

  /**
   * Scans the workspace for specific file types and populates the store.
   */
  public async scanWorkspaceAsync(fileSearchLocations: FileSearchLocation[]) {
    this._logger.log(
      LogLevel.INFO,
      'Scanning workspace for files...',
      this._className
    );
    for (const fileSearchLocation of fileSearchLocations) {
      const files = await vscode.workspace.findFiles(
        fileSearchLocation.filePattern,
        fileSearchLocation.ignorePattern
      );
      files.forEach(file => this.addOrUpdateFile(file));
      this._logger.log(
        LogLevel.INFO,
        `Found ${files.length} number of files for search pattern ${fileSearchLocation.filePattern as string}, ignoring ${fileSearchLocation.ignorePattern as string} and .gitignore patterns.`,
        this._className
      );
    }
  }

  /**
   * Clears the file location store.
   * Removes all file locations from the store.
   */
  public async clearStoreAsync() {
    this.fileLocations.clear();
  }

  /**
   * Adds a file to the store.
   * @param uri The URI of the file.
   */
  public async addOrUpdateFile(uri: vscode.Uri) {
    const fileType = this.determineFileType(uri);
    let file: TranslationFile | CodeFile;

    switch (fileType) {
      case FileType.Translation:
        file = await this.createTranslationFileAsync(uri);
        break;
      case FileType.Code:
        file = await this.createCodeFileAsync(uri);
        break;
    }

    this.fileLocations.set(uri.fsPath, file);

    this._logger.log(
      LogLevel.VERBOSE,
      `Added file ${uri.fsPath} to the store.`,
      this._className
    );
  }

  async createTranslationFileAsync(uri: vscode.Uri): Promise<TranslationFile> {
    const fileContent = await FileReader.readWorkspaceFileAsync(uri);
    const language = extractLocaleFromFileUri(uri);
    const namespace = extractNamespaceFromFileUri(uri);
    const stats = fs.statSync(uri.fsPath);
    const lastModified = stats.mtime;
    const keys = await this.extractTranslationKeys(uri);

    const translationFile = {
      content: fileContent,
      language: language,
      namespace: namespace,
      keys: keys,
      metaData: {
        entryLastModified: lastModified,
        type: FileType.Translation,
        uri: uri,
      },
    } satisfies TranslationFile;

    return translationFile;
  }

  async createCodeFileAsync(uri: vscode.Uri) {
    const fileContent = await FileReader.readWorkspaceFileAsync(uri);
    const stats = fs.statSync(uri.fsPath);
    const lastModified = stats.mtime;

    const codeFile = {
      content: fileContent,
      metaData: {
        entryLastModified: lastModified,
        type: FileType.Code,
        uri: uri,
      },
    } satisfies CodeFile;

    return codeFile;
  }

  public deleteFile(uri: vscode.Uri) {
    this.fileLocations.delete(uri.fsPath);

    this._logger.log(
      LogLevel.VERBOSE,
      `Deleted file ${uri.fsPath} from the store.`,
      this._className
    );
  }

  public getCodeFiles(): CodeFile[] {
    return Array.from(this.fileLocations.values())
      .filter(file => file.metaData.type === FileType.Code)
      .map(file => file as CodeFile);
  }

  public getTranslationFiles(): TranslationFile[] {
    return Array.from(this.fileLocations.values())
      .filter(file => file.metaData.type === FileType.Translation)
      .map(file => file as TranslationFile);
  }

  public hasFile(uri: vscode.Uri): boolean {
    return this.fileLocations.has(uri.fsPath);
  }

  private determineFileType(uri: vscode.Uri) {
    const extension = getFileExtension(uri);
    const config =
      ConfigurationStoreManager.getInstance().getConfig<I18nextScannerModuleConfiguration>(
        'i18nextScannerModule'
      );

    if (extension === 'json') {
      return FileType.Translation;
    } else if (config.fileExtensions.includes(extension)) {
      return FileType.Code;
    }

    this._logger.log(
      LogLevel.ERROR,
      `Unsupported file type: ${extension}`,
      this._className
    );
    throw new Error(`Unsupported file type: ${extension}`);
  }

  // extract below to util

  /**
   * Extracts translation keys, values, and their locations from a JSON resource file.
   * @param filePath - The path to the JSON resource file.
   * @returns A map of keys to their corresponding TranslationKeyData.
   */
  private async extractTranslationKeys(
    fileUri: Uri
  ): Promise<Record<string, TranslationKeyData>> {
    const content = await FileReader.readWorkspaceFileAsync(fileUri);
    const json = JSON.parse(content);

    const keysData: Record<string, TranslationKeyData> = {};

    // Recursively traverse the JSON object to find keys and track their locations
    await this.traverseJsonObject(json, fileUri, [], keysData);

    return keysData;
  }

  /**
   * Traverses a JSON object recursively and records the locations of each translation key.
   * @param obj - The JSON object being traversed.
   * @param filePath - The path to the file, for location context.
   * @param parentKeys - Array of parent keys leading to the current key.
   * @param keysData - The map to store the key data.
   */
  private async traverseJsonObject(
    obj: any,
    fileUri: Uri,
    parentKeys: string[],
    keysData: Record<string, TranslationKeyData>
  ): Promise<void> {
    if (typeof obj === 'object' && obj !== null) {
      // If it's an object, recurse through the keys
      for (const key of Object.keys(obj)) {
        const newParentKeys = [...parentKeys, key];

        // Recursively traverse deeper if the value is an object
        this.traverseJsonObject(obj[key], fileUri, newParentKeys, keysData);
      }
    } else {
      // If it's a primitive (string, number, etc.), we've reached a translation key
      const fullKey = parentKeys.join('.');
      const location = await this.getLocationForKey(fileUri, fullKey);

      keysData[fullKey] = {
        value: obj,
        location: location,
      };
    }
  }

  /**
   * Finds the location of a translation key in the source code.
   * This function will simulate how you might map the key to a location in the code.
   * You can use `vscode.Position` to create locations, depending on your use case.
   * @param filePath - The path to the resource file.
   * @param key - The translation key.
   * @returns A vscode.Location representing the position of the key in the file.
   */
  private async getLocationForKey(
    fileUri: Uri,
    _: string
    // key: string
  ): Promise<vscode.Location> {
    // For the sake of this example, assume the location is at the first line, and the key is at the start of the line
    const position = new vscode.Position(0, 0); // Adjust this logic based on how you locate the key in the file
    // const document = await vscode.workspace.openTextDocument(fileUri.fsPath);
    // const text = document.getText();
    // const regex = new RegExp(`"${key}"\\s*:\\s*`, 'g');
    // let match;
    // let position = new vscode.Position(14, 20);

    // while ((match = regex.exec(text)) !== null) {
    //   const startIndex = match.index;
    //   position = document.positionAt(startIndex);
    //   // Return the first match found
    //   return new vscode.Location(document.uri, position);
    // }

    // Simulate the location based on the key and file
    const document = await vscode.workspace.openTextDocument(fileUri.fsPath); // Load document for location details
    // If no match is found, return the default position
    return new vscode.Location(document.uri, position);
  }
}
