import {
  CancellationToken,
  Hover,
  HoverProvider,
  Position,
  ProviderResult,
  TextDocument,
} from 'vscode';

import { FileLocationStore } from '@i18n-weave/store/store-file-location-store';

import {
  ConfigurationStoreManager,
  I18nextScannerModuleConfiguration,
} from '@i18n-weave/util/util-configuration';
import { createI18nHoverMarkdown } from '@i18n-weave/util/util-markdown-string-utils';
import { extractNamespaceFromTranslationKey } from '@i18n-weave/util/util-translation-key-utils';

export class TranslationKeyHoverProvider implements HoverProvider {
  private static _instance: TranslationKeyHoverProvider;

  private constructor() {
    // Private constructor to prevent instantiation
  }

  /**
   * Returns the singleton instance of TranslationKeyHoverProvider.
   */
  public static getInstance(): TranslationKeyHoverProvider {
    if (!TranslationKeyHoverProvider._instance) {
      TranslationKeyHoverProvider._instance = new TranslationKeyHoverProvider();
    }
    return TranslationKeyHoverProvider._instance;
  }

  public provideHover(
    document: TextDocument,
    position: Position,
    _: CancellationToken
  ): ProviderResult<Hover> {
    const fileLocationStore = FileLocationStore.getInstance();
    const configuration =
      ConfigurationStoreManager.getInstance().getConfig<I18nextScannerModuleConfiguration>(
        'i18nextScannerModule'
      );

    const fullKey = this.getFullKeyAtPosition(document, position);
    if (!fullKey) {
      return null; // No key found at cursor position
    }

    const [namespace, keyWithoutNamespace] = extractNamespaceFromTranslationKey(
      fullKey,
      configuration.nsSeparator,
      configuration.defaultNamespace
    );

    // Fetch translation values from file store
    const keys = fileLocationStore.getTranslationKeys(
      configuration.defaultLanguage,
      namespace
    );
    const translationKey = keys.find(key => key === keyWithoutNamespace);

    if (!translationKey) {
      return null; // No matching translation key found
    }

    // Fetch the translation value for the detected key
    const translationValues =
      fileLocationStore.getTranslationValuesByNamespaceAndKey(
        namespace,
        translationKey
      );

    const hoverContent = createI18nHoverMarkdown(
      translationValues,
      configuration.defaultLanguage
    );

    return new Hover(hoverContent);
  }

  private getFullKeyAtPosition(
    document: TextDocument,
    position: Position
  ): string | null {
    const line = document.lineAt(position.line).text;
    const beforeCursor = line.substring(0, position.character);
    const afterCursor = line.substring(position.character);

    const startQuote = beforeCursor.lastIndexOf("'") + 1;
    const endQuote = afterCursor.indexOf("'");

    if (startQuote > 0 && endQuote >= 0) {
      return line.substring(startQuote, position.character + endQuote);
    }

    return null;
  }
}

