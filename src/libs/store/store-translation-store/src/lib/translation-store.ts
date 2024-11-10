import deepDiff from 'deep-diff';

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
    this._logger.log(LogLevel.INFO, 'Initializing translation store');

    const fileLocations =
      FileLocationStore.getInstance().getFileLocationsByType(['json']);

    fileLocations.forEach(async fileLocation => {
      const rawData = await FileReader.readFileAsync(fileLocation);
      const jsonObject = JSON.parse(rawData) as JSON;

      this._translationFileContents.set(fileLocation, jsonObject);

      this._logger.log(
        LogLevel.VERBOSE,
        `Added translation file ${fileLocation} to store`
      );
    });

    this._logger.log(
      LogLevel.INFO,
      `Added ${fileLocations.length} translation files to store`
    );
  }

  public getTranslationFileDiffs(filePath: string, newJsonContent: string) {
    const newJsonObject = JSON.parse(newJsonContent) as JSON;
    const oldJsonObject = this._translationFileContents.get(filePath);

    var one = deepDiff.diff(JSON.stringify(oldJsonObject), newJsonContent);
    var two = diffJsonObjects(oldJsonObject ?? {}, newJsonObject);

    return two;
  }

  public updateEntry(filePath: string, updatedJsonContent: string) {
    const updatedJsonObject = JSON.parse(updatedJsonContent) as JSON;

    this._translationFileContents.set(filePath, updatedJsonObject);

    this._logger.log(
      LogLevel.VERBOSE,
      `Updated translation file ${filePath} in store`
    );
  }

  public deleteEntry(filePath: string) {
    this._translationFileContents.delete(filePath);

    this._logger.log(
      LogLevel.VERBOSE,
      `Deleted translation file ${filePath} from store`
    );
  }

  public async addEntryAsync(filePath: string) {
    const rawData = await FileReader.readFileAsync(filePath);
    const jsonObject = JSON.parse(rawData) as JSON;
    this._translationFileContents.set(filePath, jsonObject);

    this._logger.log(
      LogLevel.VERBOSE,
      `Added translation file ${filePath} to store`
    );
  }
}
