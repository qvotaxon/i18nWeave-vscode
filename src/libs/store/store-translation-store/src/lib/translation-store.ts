import { Uri } from 'vscode';

import { FileReader } from '@i18n-weave/file-io/file-io-file-reader';

import { FileLocationStore } from '@i18n-weave/store/store-file-location-store';

import { diffJsonObjects } from '@i18n-weave/util/util-file-diff';
import { LogLevel, Logger } from '@i18n-weave/util/util-logger';

export class TranslationStore {
  private static _instance: TranslationStore;
  private readonly _translationFileContents: Map<string, JSON> = new Map();
  private readonly _logger: Logger;

  private constructor() {
    this._logger = Logger.getInstance();
  }

  /**
   * Returns the singleton instance of TranslationStore.
   */
  public static getInstance(): TranslationStore {
    if (!TranslationStore._instance) {
      TranslationStore._instance = new TranslationStore();
    }
    return TranslationStore._instance;
  }

  public async initializeAsync(): Promise<void> {
    this._logger.log(
      LogLevel.INFO,
      'Initializing translation store',
      TranslationStore.name
    );

    const fileLocations = FileLocationStore.getInstance()
      .getTranslationFiles()
      .map(file => file.metaData.uri);

    for (const fileUri of fileLocations) {
      const rawData = await FileReader.readWorkspaceFileAsync(fileUri);
      const jsonObject = JSON.parse(rawData) as JSON;
      this._translationFileContents.set(fileUri.fsPath, jsonObject);

      this._logger.log(
        LogLevel.VERBOSE,
        `Added translation file ${fileUri.fsPath} to store`,
        TranslationStore.name
      );
    }

    this._logger.log(
      LogLevel.INFO,
      `Added ${fileLocations.length} translation files to store`,
      TranslationStore.name
    );
  }

  public getTranslationFileDiffs(fileUri: Uri, newJsonContent: string) {
    const newJsonObject = JSON.parse(newJsonContent) as JSON;
    const oldJsonObject = this._translationFileContents.get(fileUri.fsPath);

    const diffs = diffJsonObjects(oldJsonObject ?? {}, newJsonObject);
    return diffs;
  }

  public updateEntry(fileUri: Uri, updatedJsonContent: string) {
    const updatedJsonObject = JSON.parse(updatedJsonContent) as JSON;
    this._translationFileContents.set(fileUri.fsPath, updatedJsonObject);

    this._logger.log(
      LogLevel.VERBOSE,
      `Updated translation file ${fileUri.fsPath} in store`,
      TranslationStore.name
    );
  }

  public deleteEntry(fileUri: Uri) {
    this._translationFileContents.delete(fileUri.fsPath);
    this._logger.log(
      LogLevel.VERBOSE,
      `Deleted translation file ${fileUri.fsPath} from store`,
      TranslationStore.name
    );
  }

  public async addEntryAsync(fileUri: Uri) {
    if (fileUri.fsPath.endsWith('.json')) {
      const rawData = await FileReader.readWorkspaceFileAsync(fileUri);
      const jsonObject = JSON.parse(rawData) as JSON;
      this._translationFileContents.set(fileUri.fsPath, jsonObject);

      this._logger.log(
        LogLevel.VERBOSE,
        `Added translation file ${fileUri.fsPath} to store`,
        TranslationStore.name
      );
    }
  }
}
