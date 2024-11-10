import { SourceLanguageCode, TargetLanguageCode } from 'deepl-node';
import vscode from 'vscode';

import { DeeplClient } from '@i18n-weave/http/http-deepl-client';

type NestedObject = { [key: string]: any };

/**
 * Singleton class for managing translation services.
 */
export class TranslationService {
  private static instance: TranslationService;
  private context: vscode.ExtensionContext;

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
    // Asynchronous translation logic
    const translateTexts = async (texts: string[]) => {
      return await (
        await DeeplClient.getInstanceAsync(this.context)
      ).translateAsync(
        texts,
        sourceLang as SourceLanguageCode,
        targetLang as TargetLanguageCode
      );
    };

    const stringsToTranslate: string[] = [];
    const objectLeavesToTranslate: {
      objIndex: number;
      leaves: { path: string[]; value: string }[];
    }[] = [];

    // Collect strings and leaf nodes from objects
    texts.forEach((text, index) => {
      if (typeof text === 'string') {
        stringsToTranslate.push(text);
      } else {
        const leaves = this.collectLeafValues(text);
        objectLeavesToTranslate.push({ objIndex: index, leaves });
      }
    });

    // Translate strings directly
    const translatedStrings =
      stringsToTranslate.length > 0
        ? await translateTexts(stringsToTranslate)
        : [];

    // Translate all object leaf values together in one batch
    const leafValuesToTranslate = objectLeavesToTranslate.flatMap(
      ({ leaves }) => leaves.map(leaf => leaf.value)
    );
    const translatedLeafValues =
      leafValuesToTranslate.length > 0
        ? await translateTexts(leafValuesToTranslate)
        : [];

    // Distribute translated leaf values back to their respective objects
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

    // Reconstruct each object with its translated values
    const translatedObjects = updatedObjectLeaves.map(
      ({ objIndex, leaves }) => {
        const originalObj = texts[objIndex] as object;
        return this.reconstructObjectWithUpdatedValues(originalObj, leaves);
      }
    );

    // Merge translated strings and objects back into the final result
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

  private async updateWithManipulations(
    leaves: { path: string[]; value: any }[],
    manipulationFn: (texts: string[]) => Promise<string[]>
  ): Promise<{ path: string[]; value: any }[]> {
    const texts = leaves.map(leaf => leaf.value); // Collect all texts that need to be translated
    const translatedTexts = await manipulationFn(texts); // Get the translated texts

    return leaves.map((leaf, index) => ({
      ...leaf,
      value: translatedTexts[index], // Replace the value with the translated text
    }));
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
        leaves = leaves.concat(this.collectLeafValues(value, currentPath)); // Recursively collect leaf values
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

      // Navigate to the correct location and set the updated value
      path.forEach(key => {
        current = current[key];
      });

      current[lastKey] = value;
    });

    return result;
  }
}
