import { SourceLanguageCode, TargetLanguageCode } from 'deepl-node';
import vscode from 'vscode';

import { DeeplClient } from '@i18n-weave/http/http-deepl-client';

type NestedObject = { [key: string]: any };

/**
 * Singleton class for managing translation services.
 */
export class TranslationService {
  private static instance: TranslationService;
  private readonly context: vscode.ExtensionContext;

  private constructor(context: vscode.ExtensionContext) {
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
    const translateTexts = async (texts: string[]) => {
      const nonEmptyTexts = texts
        .map((text, index) => ({ text, index }))
        .filter(({ text }) => text.trim() !== '');

      const client = await DeeplClient.getInstanceAsync(this.context);
      const translatedNonEmptyTexts = await client.translateAsync(
        nonEmptyTexts.map(({ text }) => text),
        sourceLang as SourceLanguageCode,
        targetLang as TargetLanguageCode
      );

      const translatedTexts: string[] = [];
      let nonEmptyIndex = 0;

      texts.forEach((text, index) => {
        if (text.trim() === '') {
          translatedTexts[index] = text;
        } else {
          translatedTexts[index] = translatedNonEmptyTexts[nonEmptyIndex++];
        }
      });

      return translatedTexts;
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
        const leaves = this.collectLeafValues(text);
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
        return this.reconstructObjectWithUpdatedValues(originalObj, leaves);
      }
    );

    const result: (object | string)[] = [];
    let stringIndex = 0;
    let objectIndex = 0;

    texts.forEach(text => {
      if (typeof text === 'string') {
        result.push(translatedStrings[stringIndex++]);
      } else {
        result.push(translatedObjects[objectIndex++]);
      }
    });

    return result;
  }

  private collectLeafValues(
    obj: NestedObject,
    path: string[] = []
  ): { path: string[]; value: any }[] {
    let leaves: { path: string[]; value: any }[] = [];

    for (const key in obj) {
      const value = obj[key];
      const currentPath = [...path, key];

      if (typeof value === 'object' && value !== null) {
        leaves = leaves.concat(this.collectLeafValues(value, currentPath));
      } else {
        leaves.push({ path: currentPath, value });
      }
    }

    return leaves;
  }

  private reconstructObjectWithUpdatedValues(
    obj: NestedObject,
    updatedLeaves: { path: string[]; value: any }[]
  ): NestedObject {
    let result = { ...obj };

    updatedLeaves.forEach(({ path, value }) => {
      const lastKey = path.pop()!;
      let current = result;

      path.forEach(key => {
        current = current[key];
      });

      current[lastKey] = value;
    });

    return result;
  }
}
