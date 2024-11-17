import { SourceLanguageCode, TargetLanguageCode } from 'deepl-node';
import vscode from 'vscode';

import { DeeplClient } from '@i18n-weave/http/http-deepl-client';

import { LogLevel, Logger } from '@i18n-weave/util/util-logger';
import {
  collectLeafValues,
  reconstructObjectWithUpdatedValues,
} from '@i18n-weave/util/util-nested-object-utils';

/**
 * Singleton class for managing translation services.
 */
export class TranslationService {
  private readonly _logger: Logger;
  private static instance: TranslationService;
  private readonly context: vscode.ExtensionContext;

  private constructor(context: vscode.ExtensionContext) {
    this._logger = Logger.getInstance();
    this.context = context;
  }

  /**
   * Retrieves the singleton instance of TranslationService.
   * @param context - The VSCode extension context.
   * @returns The singleton instance.
   */
  public static getInstance(
    context: vscode.ExtensionContext
  ): TranslationService {
    if (!TranslationService.instance) {
      TranslationService.instance = new TranslationService(context);
    }
    return TranslationService.instance;
  }

  public async translateKeysAsync(
    texts: (object | string)[],
    sourceLang: string,
    targetLang: string
  ): Promise<(object | string)[]> {
    const deeplClient = await DeeplClient.getInstanceAsync(this.context);

    const translateTexts = async (texts: string[]): Promise<string[]> => {
      const nonEmptyTexts = texts.filter(text => text.trim() !== '');
      const translatedNonEmptyTexts = await deeplClient.translateAsync(
        nonEmptyTexts,
        sourceLang as SourceLanguageCode,
        targetLang as TargetLanguageCode
      );

      let nonEmptyIndex = 0;
      return texts.map(text =>
        text.trim() === '' ? text : translatedNonEmptyTexts[nonEmptyIndex++]
      );
    };

    const stringsToTranslate: string[] = [];
    const objectLeavesToTranslate: {
      objIndex: number;
      leaves: { path: string[]; value: string }[];
    }[] = [];

    texts.forEach((text, index) => {
      if (typeof text === 'string') {
        stringsToTranslate.push(text);
      } else {
        const leaves = collectLeafValues(text);
        objectLeavesToTranslate.push({ objIndex: index, leaves });
      }
    });

    const translatedStrings =
      stringsToTranslate.length > 0
        ? await translateTexts(stringsToTranslate)
        : [];
    const leafValuesToTranslate = objectLeavesToTranslate.flatMap(
      ({ leaves }) => leaves.map(leaf => leaf.value)
    );
    const translatedLeafValues =
      leafValuesToTranslate.length > 0
        ? await translateTexts(leafValuesToTranslate)
        : [];

    let translationIndex = 0;
    const updatedObjectLeaves = objectLeavesToTranslate.map(
      ({ objIndex, leaves }) => ({
        objIndex,
        leaves: leaves.map(leaf => ({
          ...leaf,
          value: translatedLeafValues[translationIndex++],
        })),
      })
    );

    const translatedObjects = updatedObjectLeaves.map(
      ({ objIndex, leaves }) => {
        const originalObj = texts[objIndex] as object;
        return reconstructObjectWithUpdatedValues(originalObj, leaves);
      }
    );

    const translatedTexts = texts.map(text =>
      typeof text === 'string'
        ? translatedStrings.shift()!
        : translatedObjects.shift()!
    );

    this._logger.log(
      LogLevel.INFO,
      `Translated ${deeplClient.getSessionCharacterCount()} characters during this session.`,
      TranslationService.name
    );

    return translatedTexts;
  }
}
