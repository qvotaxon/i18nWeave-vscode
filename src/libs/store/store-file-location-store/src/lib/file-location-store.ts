import fs from 'fs';
import vscode, { Uri } from 'vscode';

import { FileReader } from '@i18n-weave/file-io/file-io-file-reader';

import { FileType } from '@i18n-weave/util/util-enums';
import {
  extractLocaleFromFileUri,
  extractNamespaceFromFileUri,
  getFileExtension,
} from '@i18n-weave/util/util-file-path-utilities';
import { LogLevel, Logger } from '@i18n-weave/util/util-logger';
import { FileSearchLocation } from '@i18n-weave/util/util-types';

type Metadata = {
  uri: Uri;
  lastModified: Date;
  type: FileType;
};

type FileData = {
  content: string;
  metaData: Metadata;
};

type TranslationFile = {
  language: string;
  namespace: string;
  dialect?: string;
} & FileData;

type CodeFile = FileData;

export class FileLocationStore {
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
      FileLocationStore.name
    );
    for (const fileSearchLocation of fileSearchLocations) {
      const files = await vscode.workspace.findFiles(
        fileSearchLocation.filePattern,
        fileSearchLocation.ignorePattern
      );
      files.forEach(file => this.addFile(file));
      this._logger.log(
        LogLevel.INFO,
        `Found ${files.length} number of files for search pattern ${fileSearchLocation.filePattern as string}, ignoring ${fileSearchLocation.ignorePattern as string} and .gitignore patterns.`,
        FileLocationStore.name
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
  public async addFile(uri: vscode.Uri) {
    const fileType = this.determineFileType(uri);
    let file: TranslationFile | CodeFile;

    switch (fileType) {
      case FileType.Json:
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
      FileLocationStore.name
    );
  }

  async createTranslationFileAsync(uri: vscode.Uri): Promise<TranslationFile> {
    const fileContent = await FileReader.readWorkspaceFileAsync(uri);
    const language = extractLocaleFromFileUri(uri);
    const namespace = extractNamespaceFromFileUri(uri);
    const stats = fs.statSync(uri.fsPath);
    const lastModified = stats.mtime;

    const translationFile = {
      content: fileContent,
      language: language,
      namespace: namespace,
      metaData: {
        lastModified: lastModified,
        type: FileType.Json,
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
        lastModified: lastModified,
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
      FileLocationStore.name
    );
  }

  public getCodeFiles(): CodeFile[] {
    return Array.from(this.fileLocations.values())
      .filter(file => file.metaData.type === FileType.Code)
      .map(file => file as CodeFile);
  }

  public getTranslationFiles(): TranslationFile[] {
    return Array.from(this.fileLocations.values())
      .filter(file => file.metaData.type === FileType.Json)
      .map(file => file as TranslationFile);
  }

  public hasFile(uri: vscode.Uri): boolean {
    return this.fileLocations.has(uri.fsPath);
  }

  private determineFileType(uri: vscode.Uri) {
    const extension = getFileExtension(uri);
    switch (extension) {
      case FileType.Json:
        return FileType.Json;
      case FileType.Code:
        return FileType.Code;
      default: {
        this._logger.log(
          LogLevel.ERROR,
          `Unsupported file type: ${extension}`,
          FileLocationStore.name
        );
        throw new Error(`Unsupported file type: ${extension}`);
      }
    }
  }
}
