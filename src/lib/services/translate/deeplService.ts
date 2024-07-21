import * as Sentry from '@sentry/node';
import * as deepl from 'deepl-node';
import vscode from 'vscode';

import TranslationModuleConfiguration from '../../entities/configuration/modules/translationModule/translationModuleConfiguration';
import ConfigurationStoreManager from '../../stores/configuration/configurationStoreManager';
import { sharedCacheKeys } from '../caching/cacheKeys';
import { CacheService } from '../caching/cachingService';

/**
 * Singleton class for managing DeepL translation services.
 */
export default class DeeplService {
  private context: vscode.ExtensionContext;
  private static instance: DeeplService;
  private translator: deepl.Translator | undefined;
  private static previousApiKey: string | undefined;
  private static supportedSourceLanguages: readonly deepl.Language[]; // this is probably not needed
  private static supportedTargetLanguages: readonly deepl.Language[];

  private constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  /**
   * Retrieves the singleton instance of DeeplService.
   * @returns {DeeplService} The singleton instance.
   */
  public static async getInstance(
    context: vscode.ExtensionContext
  ): Promise<DeeplService> {
    const currentApiKey = DeeplService.getApiKey();

    if (
      !DeeplService.instance ||
      DeeplService.previousApiKey !== currentApiKey
    ) {
      DeeplService.instance = new DeeplService(context);
      DeeplService.previousApiKey = currentApiKey;
      await DeeplService.initializeTranslator(currentApiKey);
    }

    return DeeplService.instance;
  }

  /**
   * Fetches a translation for the given text and target language.
   * @param {string} text - The text to translate.
   * @param {string} requestedTargetLanguage - The target language code.
   * @returns {Promise<string>} The translated text.
   * @throws Will throw an error if the translation fails or the translator is not initialized.
   */
  public async fetchTranslation(
    text: string,
    requestedTargetLanguage: string
  ): Promise<string> {
    try {
      if (!DeeplService.instance.translator) {
        throw new Error('Translator not initialized.');
      }

      let targetLanguage = requestedTargetLanguage;

      const shouldUseSimplifiedTargetLanguage =
        requestedTargetLanguage !== 'en-US' &&
        requestedTargetLanguage !== 'en-GB' &&
        requestedTargetLanguage !== 'pt-BR' &&
        requestedTargetLanguage !== 'pt-PT' &&
        requestedTargetLanguage !== 'zh-Hans';

      if (shouldUseSimplifiedTargetLanguage) {
        const languageRegex = new RegExp('([a-z]{2})(?:-[A-Z]{2})?');
        const simplifiedTargetLanguage =
          requestedTargetLanguage.match(languageRegex);

        if (!simplifiedTargetLanguage) {
          throw new Error(
            `Invalid target language code. ${requestedTargetLanguage}`
          );
        }

        targetLanguage = simplifiedTargetLanguage[1];
      }

      let formality: deepl.Formality | undefined = DeeplService.getFormality();

      if (requestedTargetLanguage === 'en') {
        targetLanguage = 'en-GB';
      }

      if (
        DeeplService.supportedTargetLanguages
          .map(x => x.code)
          .indexOf(targetLanguage as deepl.LanguageCode) === -1
      ) {
        console.info(
          `Skipping translation for unsupported target language: ${targetLanguage}`
        );

        return '';
      }

      const supportsFormality = DeeplService.supportedTargetLanguages.find(
        x => x.code === targetLanguage
      )?.supportsFormality;

      if (!supportsFormality) {
        formality = 'default';
      }

      const result = await DeeplService.translateUsingDeepl(
        DeeplService.instance.translator,
        text,
        targetLanguage,
        formality
      );

      return result.text;
    } catch (error) {
      console.error(
        'Error fetching translation:',
        error,
        requestedTargetLanguage
      );
      throw error;
    }
  }

  private static async translateUsingDeepl(
    translator: deepl.Translator,
    text: string,
    targetLanguage: string,
    formality: deepl.Formality | undefined
  ) {
    return await Sentry.startSpan(
      { op: 'http.client', name: `Retrieve DeepL Translations` },
      async span => {
        return await translator!.translateText(
          text,
          null,
          targetLanguage as deepl.TargetLanguageCode,
          {
            formality: formality ?? 'default',
            preserveFormatting: DeeplService.getPreserveFormatting() ?? false,
          }
        );
      }
    );
  }

  /**
   * Initializes the DeepL translator with the API key from the configuration.
   * @throws Will throw an error if no API key is found in the configuration.
   */
  private static async initializeTranslator(apiKey: string): Promise<void> {
    DeeplService.instance.translator = new deepl.Translator(apiKey);

    const supportedSourceLanguages = await this.getSupportedSourceLanguages();
    const supportedTargetLanguages = await this.getSupportedTargetLanguages();

    if (!supportedSourceLanguages || !supportedTargetLanguages) {
      throw new Error('Failed to retrieve supported languages from DeepL.');
    }

    DeeplService.supportedSourceLanguages = supportedSourceLanguages;
    DeeplService.supportedTargetLanguages = supportedTargetLanguages;
  }

  private static async getSupportedSourceLanguages(): Promise<
    readonly deepl.Language[] | undefined
  > {
    // Retrieve the cache entry or call a callback if expired or missing
    // const data = await CacheService.get<readonly deepl.Language[] | undefined>(
    //   DeeplService.instance.context,
    //   sharedCacheKeys.SUPPORTED_SOURCE_LANGUAGES,
    //   async () => {
    //     // Callback function for cache miss
    //     console.log('Cache expired or not found. Providing default value.');
    //     // return await Sentry.startSpan(
    //     //   { op: 'http.client', name: `Retrieve DeepL Supported Languages` },
    //     //   async span => {
    //     const retrievedSourceLanguages =
    //       await DeeplService.instance.translator?.getSourceLanguages();

    //     // Set a cache entry with a custom expiration of 7 days
    //     CacheService.set(
    //       DeeplService.instance.context,
    //       sharedCacheKeys.SUPPORTED_SOURCE_LANGUAGES,
    //       retrievedSourceLanguages
    //     );

    //     return retrievedSourceLanguages;
    //     // }
    //     // );
    //   }
    // );

    // console.log('Cached data:', data);

    let tempHardcodedReturnValueWithoutCache =
      await DeeplService.instance.translator?.getSourceLanguages();

    return tempHardcodedReturnValueWithoutCache;

    // return data;
  }

  private static async getSupportedTargetLanguages(): Promise<
    readonly deepl.Language[] | undefined
  > {
    // Retrieve the cache entry or call a callback if expired or missing
    // const data = await CacheService.get<readonly deepl.Language[] | undefined>(
    //   DeeplService.instance.context,
    //   sharedCacheKeys.SUPPORTED_TARGET_LANGUAGES,
    //   async () => {
    //     // Callback function for cache miss
    //     console.log('Cache expired or not found. Providing default value.');
    //     return await Sentry.startSpan(
    //       { op: 'http.client', name: `Retrieve DeepL Supported Languages` },
    //       async span => {
    //         const retrievedTargetLanguages =
    //           await DeeplService.instance.translator?.getTargetLanguages();

    //         // Set a cache entry with a custom expiration of 7 days
    //         CacheService.set(
    //           DeeplService.instance.context,
    //           sharedCacheKeys.SUPPORTED_TARGET_LANGUAGES,
    //           retrievedTargetLanguages
    //         );

    //         return retrievedTargetLanguages;
    //       }
    //     );
    //   }
    // );

    // console.log('Cached data:', data);

    let tempHardcodedReturnValueWithoutCache =
      await DeeplService.instance.translator?.getTargetLanguages();

    return tempHardcodedReturnValueWithoutCache;

    // return data;
  }

  /**
   * Retrieves the preserve formatting setting from the configuration.
   * @returns {boolean} The preserve formatting setting.
   */
  private static getPreserveFormatting(): boolean {
    return ConfigurationStoreManager.getInstance().getConfig<TranslationModuleConfiguration>(
      'translationModule'
    ).deepL.preserveFormatting;
  }

  /**
   * Retrieves the formality setting from the configuration.
   * @returns {deepl.Formality | undefined} The formality setting.
   */
  private static getFormality(): deepl.Formality | undefined {
    return ConfigurationStoreManager.getInstance().getConfig<TranslationModuleConfiguration>(
      'translationModule'
    ).deepL.formality;
  }

  /**
   * Retrieves the DeepL API key from the configuration.
   * @returns {string} The API key.
   */
  public static getApiKey(): string {
    const apiKey =
      ConfigurationStoreManager.getInstance().getConfig<TranslationModuleConfiguration>(
        'translationModule'
      ).deepL.apiKey;

    if (!apiKey) {
      throw new Error('No DeepL API key found in the configuration.');
    }

    return apiKey;
  }
}
