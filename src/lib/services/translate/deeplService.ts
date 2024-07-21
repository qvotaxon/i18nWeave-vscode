import * as Sentry from '@sentry/node';
import * as deepl from 'deepl-node';

import TranslationModuleConfiguration from '../../entities/configuration/modules/translationModule/translationModuleConfiguration';
import ConfigurationStoreManager from '../../stores/configuration/configurationStoreManager';

/**
 * Singleton class for managing DeepL translation services.
 */
export default class DeeplService {
  private static instance: DeeplService;
  public static translator: deepl.Translator | undefined;
  private static previousApiKey: string | undefined;

  private constructor() {}

  /**
   * Retrieves the singleton instance of DeeplService.
   * @returns {DeeplService} The singleton instance.
   */
  public static getInstance(): DeeplService {
    const currentApiKey = DeeplService.getApiKey();

    if (
      !DeeplService.instance ||
      DeeplService.previousApiKey !== currentApiKey
    ) {
      DeeplService.initializeTranslator(currentApiKey);
      DeeplService.instance = new DeeplService();
      DeeplService.previousApiKey = currentApiKey;
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
      if (!DeeplService.translator) {
        throw new Error('Translator not initialized. Please try again.');
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

      //TODO: Replace with data frorm language api endpoint
      if (
        targetLanguage !== 'nl' &&
        targetLanguage !== 'de' &&
        targetLanguage !== 'pl' &&
        targetLanguage !== 'fr' &&
        targetLanguage !== 'es' &&
        targetLanguage !== 'it' &&
        targetLanguage !== 'pt' &&
        targetLanguage !== 'ru'
      ) {
        formality = 'default';
      }

      // formality = 'default';

      const result = await DeeplService.translateUsingDeepl(
        DeeplService.translator,
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
  private static initializeTranslator(apiKey: string): void {
    DeeplService.translator = new deepl.Translator(apiKey);
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
