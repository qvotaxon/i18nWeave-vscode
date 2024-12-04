import * as vscode from 'vscode';

import { FileLocationStore } from '@i18n-weave/store/store-file-location-store';

import {
  ConfigurationStoreManager,
  I18nextScannerModuleConfiguration,
} from '@i18n-weave/util/util-configuration';
import { createI18nCompletionMarkdown } from '@i18n-weave/util/util-markdown-string-utils';
import {
  extractNamespaceFromTranslationKey,
  extractTranslationKeys,
} from '@i18n-weave/util/util-translation-key-utils';

export class TranslationKeyCompletionProvider
  implements vscode.CompletionItemProvider<vscode.CompletionItem>
{
  private static instance: TranslationKeyCompletionProvider;

  private constructor() {}

  public static getInstance(): TranslationKeyCompletionProvider {
    if (!TranslationKeyCompletionProvider.instance) {
      TranslationKeyCompletionProvider.instance =
        new TranslationKeyCompletionProvider();
    }
    return TranslationKeyCompletionProvider.instance;
  }

  public resolveCompletionItem(
    item: vscode.CompletionItem,
    _: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.CompletionItem> {
    const fileLocationStore = FileLocationStore.getInstance();
    const configuration =
      ConfigurationStoreManager.getInstance().getConfig<I18nextScannerModuleConfiguration>(
        'i18nextScannerModule'
      );

    if (item.detail) {
      const { namespace, translationKey } = JSON.parse(item.detail.toString());
      const translationValue = fileLocationStore.getTranslationValue(
        configuration.defaultLanguage,
        namespace,
        translationKey
      );

      item.documentation = createI18nCompletionMarkdown(
        configuration.defaultLanguage,
        namespace,
        translationValue
      );

      item.detail = translationKey;
    }

    return item;
  }

  public provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.ProviderResult<vscode.CompletionItem[]> {
    const fileLocationStore = FileLocationStore.getInstance();
    const configuration =
      ConfigurationStoreManager.getInstance().getConfig<I18nextScannerModuleConfiguration>(
        'i18nextScannerModule'
      );

    // Get the current line and the line before it
    const currentLine = document.lineAt(position.line).text;
    const previousLine =
      position.line > 0 ? document.lineAt(position.line - 1).text : '';

    // Combine the previous line (if it exists) with the current line up to the cursor position
    const textToCheck = (previousLine + '\n' + currentLine).substring(
      0,
      previousLine.length + 1 + position.character
    );

    const translationFunctionNames = configuration.translationFunctionNames;
    const match = extractTranslationKeys(textToCheck, translationFunctionNames);

    if (!match) {
      return [];
    }

    const keyPrefix = match[2];
    const [namespace, keyWithoutNamespace] = extractNamespaceFromTranslationKey(
      keyPrefix,
      configuration.nsSeparator,
      configuration.defaultNamespace
    );

    const keys = fileLocationStore.getTranslationKeys(
      configuration.defaultLanguage,
      namespace
    );

    return keys
      .filter(translationKey =>
        this.isValidTranslationKey(
          translationKey,
          keyWithoutNamespace,
          configuration
        )
      )
      .map(translationKey =>
        this.createCompletionItem(
          document,
          position,
          namespace,
          translationKey,
          configuration
        )
      );
  }

  private isValidTranslationKey(
    translationKey: string,
    keyWithoutNamespace: string,
    configuration: I18nextScannerModuleConfiguration
  ): boolean {
    return (
      translationKey.startsWith(keyWithoutNamespace) &&
      !translationKey.includes(configuration.contextSeparator) &&
      !translationKey.includes(configuration.pluralSeparator)
    );
  }

  private createCompletionItem(
    document: vscode.TextDocument,
    position: vscode.Position,
    namespace: string,
    translationKey: string,
    configuration: I18nextScannerModuleConfiguration
  ): vscode.CompletionItem {
    const fullKey =
      namespace === configuration.defaultNamespace
        ? translationKey
        : `${namespace}${configuration.nsSeparator}${translationKey}`;
    const item = new vscode.CompletionItem(
      fullKey,
      vscode.CompletionItemKind.Text
    );

    item.detail = JSON.stringify({ namespace, translationKey });

    const wordRange = document.getWordRangeAtPosition(position, /[\w\.:]+/);

    if (wordRange) {
      item.range = wordRange;
      item.insertText = fullKey;
    } else {
      item.range = new vscode.Range(position, position);
      item.insertText = fullKey;
    }

    return item;
  }
}
