import deepDiff, { Diff, applyChange } from 'deep-diff';
import { SourceLanguageCode, TargetLanguageCode } from 'deepl-node';
import { unset } from 'lodash';
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
import { extractLocaleFromFileUri } from '@i18n-weave/util/util-file-path-utilities';
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

    const diffs = TranslationStore.getInstance().getTranslationFileDiffs(
      context.inputPath,
      context.jsonContent
    );
    if (!diffs || diffs.length === 0) {
      this.logger.log(
        LogLevel.VERBOSE,
        `No diffs found for file ${context.inputPath.fsPath}. Skipping.`
      );
      return;
    }

    const changesToTranslate = this.extractRelevantChanges(diffs);
    if (changesToTranslate.length === 0) {
      this.logger.log(
        LogLevel.VERBOSE,
        `No diff changes to translate. Skipping.`
      );
      return;
    }

    const sourceLanguage = extractLocaleFromFileUri(context.inputPath);
    const otherFiles = this.findRelatedFiles(context.inputPath.fsPath);
    const translationsByLanguage = await this.translateChanges(
      sourceLanguage,
      changesToTranslate,
      otherFiles
    );
    await this.applyTranslationsToFile(
      otherFiles,
      translationsByLanguage,
      config
    );
    TranslationStore.getInstance().updateEntry(
      context.inputPath,
      context.jsonContent
    );
  }

  private extractRelevantChanges(diffs: any[]) {
    return diffs.filter(({ kind }) => kind === 'N' || kind === 'E');
  }

  private findRelatedFiles(currentFilePath: string) {
    return FileLocationStore.getInstance()
      .getFileLocationsByType(['json'])
      .filter(
        fileUri =>
          fileUri.fsPath !== currentFilePath &&
          path.basename(fileUri.fsPath) === path.basename(currentFilePath)
      );
  }

  private async translateChanges(
    sourceLanguage: string,
    changes: any[],
    targetFiles: Uri[]
  ) {
    const translationService = TranslationService.getInstance(
      this.extensionContext
    );
    // const targetLanguages = targetFiles.map((file: string) =>
    //   extractLocaleFromFilePath(file)
    // );

    let translationsByLanguage: { [key: string]: any[] } = {};

    for (const targetFile of targetFiles) {
      const targetLanguage = extractLocaleFromFileUri(targetFile);
      const fileContent = JSON.parse(
        await FileReader.readWorkspaceFileAsync(targetFile)
      );

      // Filter changes to only include those that are missing or null in the target file
      const changesToTranslate = changes.filter(change => {
        const currentValue = change.path.reduce(
          (obj: { [x: string]: any }, key: string | number) => obj?.[key],
          fileContent
        );
        return (
          currentValue === undefined ||
          currentValue === null ||
          currentValue === ''
        );
      });

      if (changesToTranslate.length > 0) {
        const valuesToTranslate = changesToTranslate.map(
          (change: { rhs: any }) => change.rhs
        );

        const translatedValues = await translationService.translateKeysAsync(
          valuesToTranslate,
          sourceLanguage,
          targetLanguage
        );

        translationsByLanguage[targetLanguage] = changesToTranslate.map(
          (change: any, index: number) => ({
            ...change,
            rhs: translatedValues[index],
          })
        );
      }
    }

    return translationsByLanguage;
  }

  private async applyTranslationsToFile(
    targetFiles: Uri[],
    translationsByLanguage: { [x: string]: any },
    config: GeneralConfiguration
  ) {
    for (const fileUri of targetFiles) {
      if (FileLockStore.getInstance().hasFileLock(fileUri)) {
        continue;
      }

      let fileContent;
      try {
        fileContent = JSON.parse(
          await FileReader.readWorkspaceFileAsync(fileUri)
        );
      } catch (error) {
        this.logger.log(
          LogLevel.ERROR,
          `Failed to parse JSON content from file ${fileUri}: ${(error as Error).message}`
        );
        continue;
      }
      const targetLanguage = extractLocaleFromFileUri(fileUri);
      const diffs = translationsByLanguage[targetLanguage];
      this.applyDiffsToJSON(fileContent, diffs);

      FileLockStore.getInstance().addLock(fileUri);
      await FileWriter.writeToFileAsync(
        fileUri,
        JSON.stringify(
          fileContent,
          null,
          config.format.numberOfSpacesForIndentation
        )
      ).then(() => {
        setTimeout(() => {
          FileLockStore.getInstance().delete(fileUri);
        }, 500);
      });

      TranslationStore.getInstance().updateEntry(
        fileUri,
        JSON.stringify(fileContent)
      );
    }
  }

  private applyDiffsToJSON(target: any, diffs: any[]) {
    diffs?.forEach(change => {
      if (change.kind === 'D') {
        const path = change.path.join('.');
        unset(target, path);
      } else {
        applyChange(target, {}, change);
      }
    });
  }
}
