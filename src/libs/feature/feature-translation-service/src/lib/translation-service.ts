import { SourceLanguageCode, TargetLanguageCode } from 'deepl-node';
import fs from 'fs';
import path from 'path';
import { FormatConfiguration } from 'src/libs/util/util-configuration/src/lib/general/format-configuration';
import vscode from 'vscode';

import {
  StatusBarManager,
  StatusBarState,
} from '@i18n-weave/feature/feature-status-bar-manager';

import { DeeplClient } from '@i18n-weave/http/http-deepl-client';

import {
  ConfigurationStoreManager,
  GeneralConfiguration,
} from '@i18n-weave/util/util-configuration';

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
    texts: string[],
    sourceLang: string,
    targetLang: string
  ): Promise<string[]> {
    // //TODO: enable for actual translation
    // const translatedValues = await (
    //   await DeeplClient.getInstanceAsync(this.context)
    // ).translateAsync(texts, sourceLang, targetLang);

    // return translatedValues;
    return texts.map(text => `Translated(${text}) to ${targetLang}`);
  }

  /**
   * Retrieves paths of other translation files in the same directory structure.
   * @param fileLocation - The location of the file to find related translation files.
   * @returns An array of file paths for other translation files.
   */
  public getOtherTranslationFilesPaths(fileLocation: string): string[] {
    const directory = fileLocation.substring(
      0,
      fileLocation.lastIndexOf(path.sep)
    );
    const parentDirectory = directory.substring(
      0,
      directory.lastIndexOf(path.sep)
    );
    const fileName = fileLocation.substring(
      fileLocation.lastIndexOf(path.sep) + 1
    );

    const files: string[] = [];
    fs.readdirSync(parentDirectory).forEach(file => {
      const filePath = `${parentDirectory}${path.sep}${file}`;
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        fs.readdirSync(filePath).forEach(subFile => {
          if (subFile === fileName) {
            files.push(`${filePath}${path.sep}${subFile}`);
          }
        });
      }
    });

    const index = files.indexOf(fileLocation);
    if (index > -1) {
      files.splice(index, 1);
    }

    return files;
  }

  /**
   * Translates missing keys in other i18n files based on the changes made in the given file.
   * @param fileLocation - The location of the file with changes.
   * @param changedFileContent - The content of the changed file.
   */
  public async translateOtherI18nFiles(
    fileLocation: string,
    changedFileContent: string
  ): Promise<void> {
    const statusBarManager = StatusBarManager.getInstance();
    statusBarManager.updateState(
      StatusBarState.Running,
      'Translating missing keys in other i18n files...'
    );
    const deeplClient = await DeeplClient.getInstanceAsync(this.context);

    const configManager = ConfigurationStoreManager.getInstance();
    const generalConfig =
      configManager.getConfig<GeneralConfiguration>('general');
    const otherFilePaths = this.getOtherTranslationFilesPaths(fileLocation);
    const changedTranslations = JSON.parse(changedFileContent);

    const translationPromises = otherFilePaths.map(async filePath => {
      const existingTranslations = JSON.parse(
        fs.readFileSync(filePath, 'utf-8')
      );
      const missingTranslations = this.findMissingTranslations(
        changedTranslations,
        existingTranslations,
        '',
        filePath
      );

      // Group missingTranslation to groups with locale and all values to be translated.
      const groupedValuesToBeTranslated: { [locale: string]: string[] }[] = [];

      for (const missingTranslation of missingTranslations) {
        const locale = missingTranslation.locale;
        const value = missingTranslation.originalValue;

        const group = groupedValuesToBeTranslated.find(group => group[locale]);
        if (group) {
          group[locale].push(value);
        } else {
          groupedValuesToBeTranslated.push({ [locale]: [value] });
        }
      }

      const translationPromises = groupedValuesToBeTranslated.map(
        async valueToBeTranslated => {
          const locale = Object.keys(valueToBeTranslated)[0];
          const values = valueToBeTranslated[locale];

          const translatedValues = await deeplClient.fetchTranslations(
            values,
            locale
          );

          for (let i = 0; i < values.length; i++) {
            this.updateTranslation(
              existingTranslations,
              missingTranslations[i].key.split('.'),
              translatedValues[i]
            );
          }
        }
      );

      await Promise.all(translationPromises);

      if (
        groupedValuesToBeTranslated &&
        groupedValuesToBeTranslated.length > 0
      ) {
        fs.writeFileSync(
          filePath,
          JSON.stringify(
            existingTranslations,
            null,
            generalConfig.format.numberOfSpacesForIndentation
          )
        );
      }
    });

    await Promise.all(translationPromises);

    statusBarManager.setIdle();
  }

  private findMissingTranslations(
    changedObj: any,
    existingObj: any,
    path: string,
    filePath: string
  ): {
    key: string;
    filePath: string;
    originalValue: string;
    locale: string;
  }[] {
    const missingTranslations: {
      key: string;
      filePath: string;
      originalValue: string;
      locale: string;
    }[] = [];

    for (const key in changedObj) {
      if (changedObj.hasOwnProperty(key)) {
        const changedValue = changedObj[key];
        const existingValue = existingObj[key];

        if (
          typeof changedValue === 'object' &&
          typeof existingValue === 'object'
        ) {
          missingTranslations.push(
            ...this.findMissingTranslations(
              changedValue,
              existingValue,
              path ? `${path}.${key}` : key,
              filePath
            )
          );
        } else if (changedValue !== '' && existingValue === '') {
          missingTranslations.push({
            filePath: filePath,
            key: path ? `${path}.${key}` : key,
            originalValue: changedValue,
            locale: this.getLocaleFromFilePath(filePath),
          });
        }
      }
    }

    return missingTranslations;
  }

  private getLocaleFromFilePath(filePath: string): string {
    const parts = filePath.split(path.sep);
    return parts[parts.length - 2];
  }

  private updateTranslation(
    existingObj: any,
    keys: string[],
    translatedValue: string
  ): void {
    let nestedObj = existingObj;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!nestedObj[key]) {
        nestedObj[key] = {};
      }
      nestedObj = nestedObj[key];
    }
    nestedObj[keys[keys.length - 1]] = translatedValue;
  }
}
