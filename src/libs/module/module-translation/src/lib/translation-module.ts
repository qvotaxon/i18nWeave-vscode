import deepDiff, { Diff } from 'deep-diff';
import { SourceLanguageCode, TargetLanguageCode } from 'deepl-node';
import { set, unset } from 'lodash';
import path from 'path';
import { Uri } from 'vscode';

import { BaseActionModule } from '@i18n-weave/module/module-base-action';

import { TranslationService } from '@i18n-weave/feature/feature-translation-service';

import { FileReader } from '@i18n-weave/file-io/file-io-file-reader';
import { FileWriter } from '@i18n-weave/file-io/file-io-file-writer';

import { FileLocationStore } from '@i18n-weave/store/store-file-location-store';
import { FileLockStore } from '@i18n-weave/store/store-file-lock-store';
import { TranslationStore } from '@i18n-weave/store/store-translation-store';

import {
  ConfigurationStoreManager,
  GeneralConfiguration,
} from '@i18n-weave/util/util-configuration';
import { extractLocaleFromFilePath } from '@i18n-weave/util/util-file-path-utilities';
import { LogLevel } from '@i18n-weave/util/util-logger';

import { TranslationModuleContext } from './translation-module-context';

export class TranslationModule extends BaseActionModule {
  protected async doExecuteAsync(
    context: TranslationModuleContext
  ): Promise<void> {
    const config =
      ConfigurationStoreManager.getInstance().getConfig<GeneralConfiguration>(
        'general'
      );
    if (!config.betaFeaturesConfiguration.enableTranslationModule) {
      return;
    }

    if (!context.jsonContent) {
      return;
    }

    const translationFileDiffs =
      TranslationStore.getInstance().getTranslationFileDiffs(
        context.inputPath.fsPath,
        context.jsonContent
      );

    if (!translationFileDiffs || translationFileDiffs.length === 0) {
      this.logger.log(
        LogLevel.VERBOSE,
        `No diffs found for file ${context.inputPath.fsPath}. Skipping translation.`
      );
      return;
    }

    const arrayChanges = translationFileDiffs.filter(d => d.kind === 'A');
    const additions = translationFileDiffs.filter(d => d.kind === 'N');
    const deletions = translationFileDiffs.filter(d => d.kind === 'D');
    const updates = translationFileDiffs.filter(d => d.kind === 'E');

    this.logger.log(
      LogLevel.VERBOSE,
      `Calculated diff for translation file ${context.inputPath},
      Array changes: ${arrayChanges.length}
      Additions: ${additions.length}
      Deletions: ${deletions.length}
      Updates: ${updates.length}`
    );

    const valuesToTranslate = translationFileDiffs
      .filter(change => change.kind === 'E' || change.kind === 'N')
      .map(change => change.rhs);

    var test = hasOnlyEmptyValues(valuesToTranslate);

    if (
      (valuesToTranslate.length === 0 ||
        hasOnlyEmptyValues(valuesToTranslate)) &&
      deletions.length === 0
    ) {
      this.logger.log(
        LogLevel.VERBOSE,
        `No values to translate or remove found for file ${context.inputPath.fsPath}. Skipping translation.`
      );
      return;
    }

    const translationService = TranslationService.getInstance(
      this.extensionContext
    );
    const sourceLanguage = extractLocaleFromFilePath(
      context.inputPath.fsPath
    ) as SourceLanguageCode;

    const otherI18nFilesWithSameNamespace = FileLocationStore.getInstance()
      .getFileLocationsByType(['json'])
      .filter(
        fileLocation =>
          fileLocation !== context.inputPath.fsPath &&
          fileLocation.split(path.sep).pop() ===
            context.inputPath.fsPath.split(path.sep).pop()
      );

    const targetLanguages = otherI18nFilesWithSameNamespace.map(
      fileWithSameNameSpace =>
        extractLocaleFromFilePath(fileWithSameNameSpace) as TargetLanguageCode
    );

    const translationsByLanguage: { [lang: string]: Diff<any, any>[] } = {};

    for (const targetLanguage of targetLanguages) {
      const translatedValues = await translationService.translateKeysAsync(
        valuesToTranslate,
        sourceLanguage,
        targetLanguage
      );

      let translationIndex = 0;
      translationsByLanguage[targetLanguage] = translationFileDiffs.map(
        change => {
          if (change.kind === 'E' || change.kind === 'N') {
            return { ...change, rhs: translatedValues[translationIndex++] };
          }
          return change;
        }
      );
    }

    function hasOnlyEmptyValues(obj: any): boolean {
      // Check for null or undefined explicitly
      if (obj === null || obj === undefined) {
        return true;
      }

      // Check if obj is an object and is not an array
      if (typeof obj === 'object' && !Array.isArray(obj)) {
        // Recursively check all values in the object
        return Object.values(obj).every(value => hasOnlyEmptyValues(value));
      }

      // Check for empty string
      if (typeof obj === 'string') {
        return obj.trim() === '';
      }

      if (Array.isArray(obj)) {
        return obj.every(value => hasOnlyEmptyValues(value));
      }

      // If it's any other data type (number, boolean, array, etc.), treat it as non-empty
      return false;
    }

    function applyDiffsToJSON(target: JSON, diffs: Diff<any, any>[]): JSON {
      diffs.forEach(change => {
        if (change.kind === 'D') {
          const path = change.path?.join('.');
          if (path) {
            unset(target, path);
          }
        } else {
          deepDiff.applyChange(target, {}, change);
        }
      });
      return target;
    }

    // FileLockStore.getInstance().add(
    //   otherI18nFilesWithSameNamespace.map(file => Uri.file(file))
    // );

    for (const fileWithSameNameSpace of otherI18nFilesWithSameNamespace) {
      if (
        !fileWithSameNameSpace ||
        FileLockStore.getInstance().hasFileLock(Uri.file(fileWithSameNameSpace))
      ) {
        continue;
      }

      const targetLanguage = extractLocaleFromFilePath(
        fileWithSameNameSpace
      ) as TargetLanguageCode;
      const langContent = JSON.parse(
        await FileReader.readFileAsync(fileWithSameNameSpace)
      );
      const updatedContent = applyDiffsToJSON(
        langContent,
        translationsByLanguage[targetLanguage]
      );

      FileLockStore.getInstance().add(Uri.file(fileWithSameNameSpace));

      await FileWriter.writeToFileAsync(
        fileWithSameNameSpace,
        JSON.stringify(
          updatedContent,
          null,
          config.format.numberOfSpacesForIndentation
        )
      ).then(() => {
        setTimeout(() => {
          FileLockStore.getInstance().delete(Uri.file(fileWithSameNameSpace));
        }, 500);
      });

      TranslationStore.getInstance().updateEntry(
        fileWithSameNameSpace,
        JSON.stringify(
          updatedContent,
          null,
          config.format.numberOfSpacesForIndentation
        )
      );
    }

    TranslationStore.getInstance().updateEntry(
      context.inputPath.fsPath,
      context.jsonContent
    );
  }
}
