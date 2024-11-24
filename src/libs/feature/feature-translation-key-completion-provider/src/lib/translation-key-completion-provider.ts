import * as vscode from 'vscode';

import { FileLocationStore } from '@i18n-weave/store/store-file-location-store';

import {
  ConfigurationStoreManager,
  I18nextScannerModuleConfiguration,
} from '@i18n-weave/util/util-configuration';

export class TranslationKeyCompletionProvider {
  private static _instance: TranslationKeyCompletionProvider;
  // private _translationKeys: string[] = [];

  private constructor() {
    // Private constructor to prevent instantiation
  }

  /**
   * Returns the singleton instance of TranslationKeyCompletionProvider.
   */
  public static getInstance() // translationKeys: string[]
  : TranslationKeyCompletionProvider {
    if (!TranslationKeyCompletionProvider._instance) {
      TranslationKeyCompletionProvider._instance =
        new TranslationKeyCompletionProvider();
    }

    // TranslationKeyCompletionProvider._instance._translationKeys =
    //   translationKeys;
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
    const translationKeys = fileLocationStore
      .getTranslationFiles()
      .filter(x => x.language === configuration.defaultLanguage)
      .reduce((acc, file) => {
        return acc.concat(Object.keys(file.keys));
      }, [] as string[]);

    const linePrefix = document
      .lineAt(position)
      .text.substring(0, position.character);

    // Check if the current context looks like a translation function call
    const translationFunctionNames =
      configuration.translationFunctionNames.join('|');
    const translationCallRegex = new RegExp(
      `(${translationFunctionNames})\\(['"][^'"]*$`
    );
    const endsWithTranslationCall = translationCallRegex.test(linePrefix);

    if (!endsWithTranslationCall) {
      return []; // Return no completions if context is not relevant
    }

    // Generate completion items for the translation keys
    return translationKeys.map(key => {
      const item = new vscode.CompletionItem(
        key,
        vscode.CompletionItemKind.Text
      );
      item.insertText = key;
      item.detail = `Translation key ${key} - i18nWeave`; // Optional: Add a description
      item.documentation = `This is a translation key ${key}`; // Optional: Add a description
      return item;
    });
  }
}
