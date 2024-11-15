import * as Sentry from '@sentry/node';
import * as deepl from 'deepl-node';
import { SourceLanguageCode, TargetLanguageCode, TextResult } from 'deepl-node';
import vscode from 'vscode';

import {
  CachingService,
  sharedCacheKeys,
} from '@i18n-weave/feature/feature-caching-service';
import {
  StatusBarManager,
  StatusBarState,
} from '@i18n-weave/feature/feature-status-bar-manager';
import { ITranslator } from '@i18n-weave/feature/feature-translation-service';

import {
  ConfigurationStoreManager,
  TranslationModuleConfiguration,
} from '@i18n-weave/util/util-configuration';
import { LogLevel, Logger } from '@i18n-weave/util/util-logger';

/**
 * Singleton class for managing DeepL translation services.
 */
export class DeeplClient implements ITranslator {
  private readonly _logger: Logger;
  private readonly context: vscode.ExtensionContext;
  private static instance: DeeplClient;
  private translator: deepl.Translator | undefined;
  private static previousApiKey: string | undefined;
  private static supportedTargetLanguages: readonly deepl.Language[];

  private constructor(context: vscode.ExtensionContext) {
    this._logger = Logger.getInstance();
    this.context = context;
  }

  public async translateAsync(
    texts: string[],
    sourceLanguage: SourceLanguageCode,
    requestedTargetLanguage: string
  ): Promise<string[]> {
    // Mocking the translation for now
    // return texts.map(
    //   text => `Translated (${text}) to ${requestedTargetLanguage}`
    // );

    // Uncomment the following code to enable the actual translation

    if (!this.translator) {
      throw new Error('Translator not initialized.');
    }

    if (requestedTargetLanguage === 'en') {
      requestedTargetLanguage = 'en-GB';
    }

    let targetLanguage = this.getTargetLanguage(requestedTargetLanguage);

    if (!this.isSupportedTargetLanguage(targetLanguage)) {
      this._logger.log(
        LogLevel.WARN,
        `Skipping translation for unsupported target language: ${targetLanguage}`
      );
      return [''];
    }

    const formality = this.getFormality(targetLanguage);

    const translatedTexts = await this.translateUsingDeepl(
      this.translator,
      texts,
      targetLanguage,
      formality,
      sourceLanguage
    );

    this._logger.log(
      LogLevel.INFO,
      `Translation completed from ${sourceLanguage} to ${targetLanguage}.`
    );

    return translatedTexts.map(x => x.text);
  }

  public static async getInstanceAsync(
    context: vscode.ExtensionContext
  ): Promise<DeeplClient> {
    const currentApiKey = this.getApiKey();

    if (!this.instance || this.previousApiKey !== currentApiKey) {
      this.instance = new DeeplClient(context);
      this.previousApiKey = currentApiKey;
      await this.initializeTranslator(currentApiKey);
    }

    return this.instance;
  }

  private async translateUsingDeepl(
    translator: deepl.Translator,
    texts: string[],
    targetLanguage: string,
    formality: deepl.Formality | undefined,
    sourceLanguage?: string
  ) {
    this._logger.log(
      LogLevel.INFO,
      `Translating ${texts.length} text(s) with DeepL from ${sourceLanguage ?? '[Auto Detect Language]'} to ${targetLanguage}.`
    );

    return await Sentry.startSpan(
      { op: 'http.client', name: `Retrieve DeepL Translations` },
      async span => {
        try {
          return await translator.translateText(
            texts,
            sourceLanguage
              ? (sourceLanguage as deepl.SourceLanguageCode)
              : null,
            targetLanguage as deepl.TargetLanguageCode,
            {
              formality: formality ?? 'default',
              preserveFormatting: DeeplClient.getPreserveFormatting() ?? false,
            }
          );
        } catch (error) {
          this._logger.log(
            LogLevel.ERROR,
            `Failed to translate text with DeepL. Received error: ${error}`
          );
          this._logger.show();
          throw error;
        } finally {
          span.end();
        }
      }
    );
  }

  private static async initializeTranslator(apiKey: string): Promise<void> {
    this.instance.translator = new deepl.Translator(apiKey);

    const supportedTargetLanguages = await this.getSupportedTargetLanguages();

    if (!supportedTargetLanguages) {
      this.instance._logger.log(
        LogLevel.ERROR,
        'Failed to retrieve supported languages from DeepL.'
      );
      this.instance._logger.show();
      throw new Error('Failed to retrieve supported languages from DeepL.');
    }

    this.supportedTargetLanguages = supportedTargetLanguages;
  }

  private static async getSupportedTargetLanguages(): Promise<
    readonly deepl.Language[] | undefined
  > {
    const targetLanguages = await CachingService.get<
      readonly deepl.Language[] | undefined
    >(
      this.instance.context,
      sharedCacheKeys.SUPPORTED_TARGET_LANGUAGES,
      async () => {
        this.instance._logger.log(
          LogLevel.INFO,
          'Retrieved supported target languages.'
        );

        return this.instance.translator?.getTargetLanguages();
      }
    );

    this.instance._logger.log(
      LogLevel.INFO,
      'Read from cache: Retrieved supported target languages.'
    );

    return targetLanguages;
  }

  private getTargetLanguage(requestedTargetLanguage: string): string {
    const shouldUseSimplifiedTargetLanguage = ![
      'en-US',
      'en-GB',
      'pt-BR',
      'pt-PT',
      'zh-Hans',
    ].includes(requestedTargetLanguage);

    if (shouldUseSimplifiedTargetLanguage) {
      const languageRegex = new RegExp('([a-z]{2})(?:-[A-Z]{2})?');
      const simplifiedTargetLanguage =
        requestedTargetLanguage.match(languageRegex);

      if (!simplifiedTargetLanguage) {
        throw new Error(
          `Invalid target language code. ${requestedTargetLanguage}`
        );
      }

      return simplifiedTargetLanguage[1];
    }

    return requestedTargetLanguage === 'en' ? 'en-GB' : requestedTargetLanguage;
  }

  private isSupportedTargetLanguage(targetLanguage: string): boolean {
    return DeeplClient.supportedTargetLanguages
      .map(x => x.code)
      .includes(targetLanguage as deepl.LanguageCode);
  }

  private getFormality(targetLanguage: string): deepl.Formality | undefined {
    const supportsFormality = DeeplClient.supportedTargetLanguages.find(
      x => x.code === targetLanguage
    )?.supportsFormality;

    return supportsFormality ? DeeplClient.getFormality() : 'default';
  }

  private static getPreserveFormatting(): boolean {
    return ConfigurationStoreManager.getInstance().getConfig<TranslationModuleConfiguration>(
      'translationModule'
    ).deepL.preserveFormatting;
  }

  private static getFormality(): deepl.Formality | undefined {
    return ConfigurationStoreManager.getInstance().getConfig<TranslationModuleConfiguration>(
      'translationModule'
    ).deepL.formality;
  }

  private static getApiKey(): string {
    const apiKey =
      ConfigurationStoreManager.getInstance().getConfig<TranslationModuleConfiguration>(
        'translationModule'
      ).deepL.apiKey;

    if (!apiKey) {
      this.instance._logger.log(
        LogLevel.ERROR,
        'No DeepL API key found in the configuration.'
      );
      this.instance._logger.show();
      throw new Error('No DeepL API key found in the configuration.');
    }

    return apiKey;
  }
}
