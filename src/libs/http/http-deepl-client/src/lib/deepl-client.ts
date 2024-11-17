import * as Sentry from '@sentry/node';
import * as deepl from 'deepl-node';
import vscode from 'vscode';

import {
  CachingService,
  sharedCacheKeys,
} from '@i18n-weave/feature/feature-caching-service';
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
  private static supportedSourceLanguages: readonly deepl.Language[];

  private constructor(context: vscode.ExtensionContext) {
    this._logger = Logger.getInstance();
    this.context = context;
  }

  public async translateAsync(
    texts: string[],
    sourceLanguage: string,
    requestedTargetLanguage: string
  ): Promise<string[]> {
    if (texts.length === 0) {
      return [''];
    }

    if (!this.translator) {
      throw new Error('Translator not initialized.');
    }

    let targetLanguage = this.getTargetLanguage(requestedTargetLanguage);

    if (!this.isSupportedTargetLanguage(targetLanguage)) {
      this._logger.log(
        LogLevel.WARN,
        `Skipping translation for unsupported target language: ${targetLanguage}`,
        DeeplClient.name
      );
      return [''];
    }

    if (!this.isSupportedSourceLanguage(sourceLanguage)) {
      this._logger.log(
        LogLevel.WARN,
        `Skipping translation for unsupported source language: ${sourceLanguage}`,
        DeeplClient.name
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

    const inputCharacterCount = texts.reduce(
      (count, text) => count + text.length,
      0
    );

    const outputCharacterCount = translatedTexts.reduce(
      (count, text) => count + text.text.length,
      0
    );

    this._logger.log(
      LogLevel.INFO,
      `Translated ${texts.length} text(s) with DeepL.\nSource language: ${sourceLanguage ?? '[Auto Detect Language]'} to ${targetLanguage}.\n${formality ? `Formality: ${formality}` : ''}.\nInput character count: ${inputCharacterCount}.\nOutput character count: ${outputCharacterCount}.\nTotal character: ${inputCharacterCount + outputCharacterCount}.`,
      DeeplClient.name
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
    const supportedSourceLanguages = await this.getSupportedSourceLanguages();

    if (!supportedTargetLanguages) {
      this.instance._logger.log(
        LogLevel.ERROR,
        'Failed to retrieve supported languages from DeepL.',
        DeeplClient.name
      );
      this.instance._logger.show();
      throw new Error('Failed to retrieve supported languages from DeepL.');
    }

    if (!supportedSourceLanguages) {
      this.instance._logger.log(
        LogLevel.ERROR,
        'Failed to retrieve supported source languages from DeepL.',
        DeeplClient.name
      );
      this.instance._logger.show();
      throw new Error(
        'Failed to retrieve supported source languages from DeepL.'
      );
    }

    this.supportedTargetLanguages = supportedTargetLanguages;
    this.supportedSourceLanguages = supportedSourceLanguages;
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
          'Retrieved supported target languages.',
          DeeplClient.name
        );

        return this.instance.translator?.getTargetLanguages();
      }
    );

    this.instance._logger.log(
      LogLevel.INFO,
      'Read from cache: Retrieved supported target languages.',
      DeeplClient.name
    );

    return targetLanguages;
  }

  private static async getSupportedSourceLanguages(): Promise<
    readonly deepl.Language[] | undefined
  > {
    const sourceLanguages = await CachingService.get<
      readonly deepl.Language[] | undefined
    >(
      this.instance.context,
      sharedCacheKeys.SUPPORTED_SOURCE_LANGUAGES,
      async () => {
        this.instance._logger.log(
          LogLevel.INFO,
          'Retrieved supported source languages.',
          DeeplClient.name
        );

        return this.instance.translator?.getSourceLanguages();
      }
    );

    this.instance._logger.log(
      LogLevel.INFO,
      'Read from cache: Retrieved supported source languages.',
      DeeplClient.name
    );

    return sourceLanguages;
  }

  private getTargetLanguage(requestedTargetLanguage: string): string {
    if (requestedTargetLanguage === 'en') {
      return 'en-GB';
    } else if (requestedTargetLanguage === 'zh') {
      return 'zh-Hans';
    } else if (requestedTargetLanguage === 'pt') {
      return 'pt-PT';
    }

    return requestedTargetLanguage;
  }

  private isSupportedTargetLanguage(targetLanguage: string): boolean {
    return DeeplClient.supportedTargetLanguages
      .map(x => x.code)
      .includes(targetLanguage as deepl.TargetLanguageCode);
  }

  private isSupportedSourceLanguage(sourceLanguage: string): boolean {
    return DeeplClient.supportedSourceLanguages
      .map(x => x.code)
      .includes(sourceLanguage as deepl.SourceLanguageCode);
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
        'No DeepL API key found in the configuration.',
        DeeplClient.name
      );
      this.instance._logger.show();
      throw new Error('No DeepL API key found in the configuration.');
    }

    return apiKey;
  }
}
