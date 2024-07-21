import fs from 'fs';
import vscode from 'vscode';

import DeeplService from './deeplService';

/**
 * Singleton class for managing translation services.
 */
export default class TranslationService {
  private static instance: TranslationService;
  private _context: vscode.ExtensionContext;

  private constructor(context: vscode.ExtensionContext) {
    this._context = context;
  }

  /**
   * Retrieves the singleton instance of TranslationService.
   * @returns {TranslationService} The singleton instance.
   */
  public static getInstance(
    context: vscode.ExtensionContext
  ): TranslationService {
    if (!TranslationService.instance) {
      TranslationService.instance = new TranslationService(context);
    }
    return TranslationService.instance;
  }

  /**
   * Retrieves paths of other translation files in the same directory structure.
   * @param {string} fileLocation - The location of the file to find related translation files.
   * @returns {string[]} An array of file paths for other translation files.
   */
  public getOtherTranslationFilesPaths = (fileLocation: string): string[] => {
    const directory = fileLocation.substring(0, fileLocation.lastIndexOf('\\'));
    const parentDirectory = directory.substring(0, directory.lastIndexOf('\\'));
    const fileName = fileLocation.substring(fileLocation.lastIndexOf('\\') + 1);

    const files: string[] = [];
    fs.readdirSync(parentDirectory).forEach(file => {
      const filePath = `${parentDirectory}\\${file}`;
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        fs.readdirSync(filePath).forEach(subFile => {
          if (subFile === fileName) {
            files.push(`${filePath}\\${subFile}`);
          }
        });
      }
    });

    const index = files.indexOf(fileLocation);
    if (index > -1) {
      files.splice(index, 1);
    }

    return files;
  };

  /**
   * Translates missing keys in other i18n files based on the changes made in the given file.
   * @param {string} fileLocation - The location of the file with changes.
   * @param {string} changedFileContent - The content of the changed file.
   */
  public translateOtherI18nFiles = (
    fileLocation: string,
    changedFileContent: string
  ): void => {
    this.getOtherTranslationFilesPaths(fileLocation).forEach(filePath => {
      const changedTranslations = JSON.parse(changedFileContent);
      const existingTranslations = JSON.parse(
        fs.readFileSync(filePath, 'utf-8')
      );

      const getLocaleFromFilePath = (filePath: string): string => {
        const parts = filePath.split('\\');
        return parts[parts.length - 2];
      };

      const missingTranslations: {
        key: string;
        filePath: string;
        originalValue: string;
        locale: string;
      }[] = [];

      const findMissingTranslations = (
        changedObj: any,
        existingObj: any,
        path: string
      ) => {
        for (const key in changedObj) {
          if (changedObj.hasOwnProperty(key)) {
            const changedValue = changedObj[key];
            const existingValue = existingObj[key];

            if (
              typeof changedValue === 'object' &&
              typeof existingValue === 'object'
            ) {
              findMissingTranslations(
                changedValue,
                existingValue,
                path ? `${path}.${key}` : key
              );
            } else if (changedValue !== '' && existingValue === '') {
              missingTranslations.push({
                filePath: filePath,
                key: path ? `${path}.${key}` : key,
                originalValue: changedValue,
                locale: getLocaleFromFilePath(filePath),
              });
            }
          }
        }
      };

      findMissingTranslations(changedTranslations, existingTranslations, '');

      missingTranslations.forEach(async missingTranslation => {
        const deepLService = await DeeplService.getInstance(this._context);

        const translatedValue = await deepLService.fetchTranslation(
          missingTranslation.originalValue,
          missingTranslation.locale
        );

        const keys = missingTranslation.key.split('.');
        let nestedObj = existingTranslations;
        for (let i = 0; i < keys.length - 1; i++) {
          const key = keys[i];
          if (!nestedObj[key]) {
            nestedObj[key] = {};
          }
          nestedObj = nestedObj[key];
        }
        nestedObj[keys[keys.length - 1]] = translatedValue;
        fs.writeFileSync(
          filePath,
          JSON.stringify(existingTranslations, null, 2)
        );
      });

      return missingTranslations;
    });
  };
}
