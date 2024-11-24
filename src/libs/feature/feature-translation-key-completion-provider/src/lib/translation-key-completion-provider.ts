import * as vscode from 'vscode';

import { FileLocationStore } from '@i18n-weave/store/store-file-location-store';

import {
  ConfigurationStoreManager,
  I18nextScannerModuleConfiguration,
} from '@i18n-weave/util/util-configuration';

export class TranslationKeyCompletionProvider {
  private static _instance: TranslationKeyCompletionProvider;

  private constructor() {
    // Private constructor to prevent instantiation
  }

  /**
   * Returns the singleton instance of TranslationKeyCompletionProvider.
   */
  public static getInstance(): TranslationKeyCompletionProvider {
    if (!TranslationKeyCompletionProvider._instance) {
      TranslationKeyCompletionProvider._instance =
        new TranslationKeyCompletionProvider();
    }
    return TranslationKeyCompletionProvider._instance;
  }

  public provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.CompletionItem[] | Thenable<vscode.CompletionItem[]> {
    const fileLocationStore = FileLocationStore.getInstance();
    const configuration =
      ConfigurationStoreManager.getInstance().getConfig<I18nextScannerModuleConfiguration>(
        'i18nextScannerModule'
      );

    const linePrefix = document
      .lineAt(position)
      .text.substring(0, position.character);

    const translationFunctionNames =
      configuration.translationFunctionNames.join('|');
    const translationCallRegex = new RegExp(
      `(${translationFunctionNames})\\(['"]([^'"]*)$`
    );
    const match = translationCallRegex.exec(linePrefix);

    if (!match) {
      return [];
    }

    const keyPrefix = match[2];

    const [namespace, key] = keyPrefix.includes(configuration.nsSeparator)
      ? keyPrefix.split(configuration.nsSeparator)
      : [configuration.defaultNamespace, keyPrefix];

    return fileLocationStore
      .getTranslationFiles()
      .filter(x => x.language === configuration.defaultLanguage)
      .filter(x => x.namespace === namespace)
      .reduce((acc, file) => {
        return acc.concat(Object.keys(file.keys));
      }, [] as string[])
      .filter(
        k =>
          k.startsWith(key) &&
          !k.includes(configuration.contextSeparator) &&
          !k.includes(configuration.pluralSeparator)
      )
      .map(k => {
        const item = new vscode.CompletionItem(
          k,
          vscode.CompletionItemKind.Text
        );
        item.insertText = k.substring(key.length);
        item.detail = `Translation key ${k} - i18nWeave`;
        item.documentation = `This is a translation key ${k}`;
        return item;
      });
  }
}
