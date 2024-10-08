import * as Sentry from '@sentry/node';
import * as deepl from 'deepl-node';
import vscode from 'vscode';

import {
  CachingService,
  sharedCacheKeys,
} from '@i18n-weave/feature/feature-caching-service';

import {
  ConfigurationStoreManager,
  TranslationModuleConfiguration,
} from '@i18n-weave/util/util-configuration';

/**
 * Singleton class for managing DeepL translation services.
 */
export class DeeplClient {
  private context: vscode.ExtensionContext;
  private static instance: DeeplClient;
  private translator: deepl.Translator | undefined;
  private static previousApiKey: string | undefined;
  private static supportedTargetLanguages: readonly deepl.Language[];

  private constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  /**
   * Retrieves the singleton instance of DeeplService.
   * @returns {DeeplClient} The singleton instance.
   */
  public static async getInstanceAsync(
    context: vscode.ExtensionContext
  ): Promise<DeeplClient> {
    const currentApiKey = DeeplClient.getApiKey();

    if (!DeeplClient.instance || DeeplClient.previousApiKey !== currentApiKey) {
      DeeplClient.instance = new DeeplClient(context);
      DeeplClient.previousApiKey = currentApiKey;
      await DeeplClient.initializeTranslator(currentApiKey);
    }

    return DeeplClient.instance;
  }

  public async fetchTranslations(
    text: string[],
    requestedTargetLanguage: string
  ): Promise<string[]> {
    try {
      if (!DeeplClient.instance.translator) {
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

      let formality: deepl.Formality | undefined = DeeplClient.getFormality();

      if (requestedTargetLanguage === 'en') {
        targetLanguage = 'en-GB';
      }

      if (
        DeeplClient.supportedTargetLanguages
          .map(x => x.code)
          .indexOf(targetLanguage as deepl.LanguageCode) === -1
      ) {
        console.info(
          `Skipping translation for unsupported target language: ${targetLanguage}`
        );

        return [''];
      }

      const supportsFormality = DeeplClient.supportedTargetLanguages.find(
        x => x.code === targetLanguage
      )?.supportsFormality;

      if (!supportsFormality) {
        formality = 'default';
      }

      const result = await DeeplClient.translateArrayUsingDeepl(
        DeeplClient.instance.translator,
        text,
        targetLanguage,
        formality
      );

      return result.map(x => x.text);
    } catch (error) {
      console.error(
        'Error fetching translation:',
        error,
        requestedTargetLanguage
      );
      throw error;
    }
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
      if (!DeeplClient.instance.translator) {
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

      let formality: deepl.Formality | undefined = DeeplClient.getFormality();

      if (requestedTargetLanguage === 'en') {
        targetLanguage = 'en-GB';
      }

      if (
        DeeplClient.supportedTargetLanguages
          .map(x => x.code)
          .indexOf(targetLanguage as deepl.LanguageCode) === -1
      ) {
        console.info(
          `Skipping translation for unsupported target language: ${targetLanguage}`
        );

        return '';
      }

      const supportsFormality = DeeplClient.supportedTargetLanguages.find(
        x => x.code === targetLanguage
      )?.supportsFormality;

      if (!supportsFormality) {
        formality = 'default';
      }

      const result = await DeeplClient.translateUsingDeepl(
        DeeplClient.instance.translator,
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
        return await translator.translateText(
          text,
          null,
          targetLanguage as deepl.TargetLanguageCode,
          {
            formality: formality ?? 'default',
            preserveFormatting: DeeplClient.getPreserveFormatting() ?? false,
          }
        );
      }
    );
  }

  private static async translateArrayUsingDeepl(
    translator: deepl.Translator,
    text: string[],
    targetLanguage: string,
    formality: deepl.Formality | undefined
  ) {
    return await Sentry.startSpan(
      { op: 'http.client', name: `Retrieve DeepL Translations` },
      async span => {
        return await translator.translateText(
          text,
          null,
          targetLanguage as deepl.TargetLanguageCode,
          {
            formality: formality ?? 'default',
            preserveFormatting: DeeplClient.getPreserveFormatting() ?? false,
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
    DeeplClient.instance.translator = new deepl.Translator(apiKey);

    const supportedTargetLanguages = await this.getSupportedTargetLanguages();

    if (!supportedTargetLanguages) {
      throw new Error('Failed to retrieve supported languages from DeepL.');
    }

    DeeplClient.supportedTargetLanguages = supportedTargetLanguages;
  }

  private static async getSupportedTargetLanguages(): Promise<
    readonly deepl.Language[] | undefined
  > {
    const targetLanguages = await CachingService.get<
      readonly deepl.Language[] | undefined
    >(
      DeeplClient.instance.context,
      sharedCacheKeys.SUPPORTED_TARGET_LANGUAGES,
      async () => {
        return DeeplClient.instance.translator?.getTargetLanguages();
      }
    );

    return targetLanguages;
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
