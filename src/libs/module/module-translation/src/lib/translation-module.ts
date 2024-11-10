import deepDiff, { Diff } from 'deep-diff';
import { SourceLanguageCode, TargetLanguageCode } from 'deepl-node';
import path from 'path';

import { BaseActionModule } from '@i18n-weave/module/module-base-action';

import { TranslationService } from '@i18n-weave/feature/feature-translation-service';

import { FileReader } from '@i18n-weave/file-io/file-io-file-reader';
import { FileWriter } from '@i18n-weave/file-io/file-io-file-writer';

import { FileLocationStore } from '@i18n-weave/store/store-file-location-store';
import { TranslationStore } from '@i18n-weave/store/store-translation-store';

import {
  ConfigurationStoreManager,
  GeneralConfiguration,
} from '@i18n-weave/util/util-configuration';
import { applyChange } from '@i18n-weave/util/util-file-diff';
import { extractLocaleFromFilePath } from '@i18n-weave/util/util-file-path-utilities';
import { LogLevel } from '@i18n-weave/util/util-logger';

import { TranslationModuleContext } from './translation-module-context';

export class TranslationModule extends BaseActionModule {
  protected async doExecuteAsync(
    context: TranslationModuleContext
  ): Promise<void> {
    if (
      ConfigurationStoreManager.getInstance().getConfig<GeneralConfiguration>(
        'general'
      ).betaFeaturesConfiguration.enableTranslationModule
    ) {
      if (context.jsonContent) {
        // TranslationService.getInstance(
        //   this.extensionContext
        // ).translateOtherI18nFiles(
        //   context.inputPath.fsPath,
        //   context.jsonContent
        // );

        const translationFileDiffs =
          TranslationStore.getInstance().getTranslationFileDiffs(
            context.inputPath.fsPath,
            context.jsonContent
          );

        const additions =
          translationFileDiffs?.filter(d => d.kind === 'N') || [];
        const deletions =
          translationFileDiffs?.filter(d => d.kind === 'D') || [];
        const updates = translationFileDiffs?.filter(d => d.kind === 'E') || [];

        // const additionsAndUpdates =
        //   fileDifferences?.filter(d => d.kind === 'N' || d.kind === 'E') || [];

        this.logger.log(
          LogLevel.INFO,
          `Calculated diff for translation file ${context.inputPath}
          Additions: ${additions.length}
          Deletions: ${deletions.length}
          Updates: ${updates.length}`
        );

        // Initialize an object to store translations for each language
        const translationsByLanguage: { [lang: string]: Diff<any, any>[] } = {};

        if (!translationFileDiffs || translationFileDiffs.length === 0) {
          this.logger.log(
            LogLevel.VERBOSE,
            `No diffs found for file ${context.inputPath.fsPath}. Skipping translation.`
          );
          // If there are no diffs, there is no need to translate
          return;
        }

        // Filter diffs to collect all rhs values for translation
        const valuesToTranslate = translationFileDiffs
          .filter(change => change.kind === 'E' || change.kind === 'N')
          .map(change => change.rhs.toString());

        if (valuesToTranslate.length === 0) {
          this.logger.log(
            LogLevel.VERBOSE,
            `No values to translate found for file ${context.inputPath.fsPath}. Skipping translation.`
          );
          return;
        }

        const generalConfig =
          ConfigurationStoreManager.getInstance().getConfig<GeneralConfiguration>(
            'general'
          );

        const translationService = TranslationService.getInstance(
          this.extensionContext
        );

        let targetLanguages: string[] = [];
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

        otherI18nFilesWithSameNamespace.forEach(async fileWithSameNameSpace => {
          targetLanguages.push(
            extractLocaleFromFilePath(
              fileWithSameNameSpace
            ) as TargetLanguageCode
          );
        });

        // Translate all values for each target language in one go
        for (const targetLanguage of targetLanguages) {
          const translatedValues = await translationService.translateKeysAsync(
            valuesToTranslate,
            sourceLanguage,
            targetLanguage
          );

          // Map each translated value back to its corresponding diff
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

        //--------------------------------------------------------------------------------

        // //get other i18n files
        // const one = FileLocationStore.getInstance();
        // const two = one.getFileLocationsByType(['json']);
        // const three = two.filter(
        //   fileLocation => fileLocation !== context.inputPath.fsPath
        // );
        // const four = three.filter(
        //   fileLocation =>
        //     fileLocation.split(path.sep).pop() ===
        //     context.inputPath.fsPath.split(path.sep).pop()
        // );

        // const otherI18nFilesWithSameNamespace = FileLocationStore.getInstance()
        //   .getFileLocationsByType(['json'])
        //   .filter(
        //     fileLocation =>
        //       fileLocation !== context.inputPath.fsPath &&
        //       fileLocation.split(path.sep).pop() ===
        //         context.inputPath.fsPath.split(path.sep).pop()
        //   );

        // const keyValueMap = new Map<string, string>([
        //   ['greeting.hello', 'Hello'],
        //   ['farewell.goodbye', 'Goodbye'],
        //   ['appreciation.thanks', 'Thank you'],
        // ]);
        // additionsAndUpdates.forEach(diff => {
        //   if (diff.kind === 'N' || diff.kind === 'E') {
        //     const key = diff.path!.join('.');
        //     const value = diff.rhs;
        //     keyValueMap.set(key, value.toString());
        //   }
        // });

        // otherI18nFilesWithSameNamespace.forEach(async fileWithSameNameSpace => {
        //   const sourceLanguage = extractLocaleFromFilePath(
        //     context.inputPath.fsPath
        //   ) as SourceLanguageCode;
        //   const targetLanguage = extractLocaleFromFilePath(
        //     fileWithSameNameSpace
        //   ) as TargetLanguageCode;

        //   const translationService = TranslationService.getInstance(
        //     this.extensionContext
        //   );
        //   const translatedKeyValueMap =
        //     await translationService.translateKeysAsync(
        //       keyValueMap,
        //       sourceLanguage,
        //       targetLanguage
        //     );

        //   additionsAndUpdates.forEach(diff => {
        //     if (diff.kind === 'N' || diff.kind === 'E') {
        //       const key = diff.path!.join('.');
        //       const newDiff = {
        //         ...diff,
        //         rhs: { value: translatedKeyValueMap.get(key)! },
        //       };

        //       const test = newDiff;
        //       diff = newDiff;
        //     }
        //   });

        //   const translatedJsonResult = applyChange(
        //     JSON.parse(context.jsonContent),
        //     additionsAndUpdates
        //   );

        //   const test = translatedJsonResult;

        //TODO: find out how to update the other files with the translations
        // TranslationStore.getInstance().updateEntry(
        //   fileWithSameNameSpace,
        //
        // );
        // });

        function applyDiffsToJSON(target: JSON, diffs: Diff<any, any>[]): JSON {
          for (const change of diffs) {
            // From the docs:
            // NOTE: source is unused and may be removed.
            // https://www.npmjs.com/package/deep-diff
            deepDiff.applyChange(target, {}, change);
          }
          return target;
        }

        // for (const lang of targetLanguages) {
        otherI18nFilesWithSameNamespace.forEach(async fileWithSameNameSpace => {
          // const sourceLanguage = extractLocaleFromFilePath(
          //   context.inputPath.fsPath
          // ) as SourceLanguageCode;
          const targetLanguage = extractLocaleFromFilePath(
            fileWithSameNameSpace
          ) as TargetLanguageCode;

          // const langFilePath = `./${lang}.json`;
          const langContent = JSON.parse(
            await FileReader.readFileAsync(fileWithSameNameSpace)
          );

          const updatedContent = applyDiffsToJSON(
            langContent,
            translationsByLanguage[targetLanguage]
          );

          await FileWriter.writeToFileAsync(
            fileWithSameNameSpace,
            JSON.stringify(
              updatedContent,
              null,
              generalConfig.format.numberOfSpacesForIndentation
            )
          );

          TranslationStore.getInstance().updateEntry(
            fileWithSameNameSpace,
            JSON.stringify(
              updatedContent,
              null,
              generalConfig.format.numberOfSpacesForIndentation
            )
          );
        });

        TranslationStore.getInstance().updateEntry(
          context.inputPath.fsPath,
          context.jsonContent
        );
      }
    }
  }
}
