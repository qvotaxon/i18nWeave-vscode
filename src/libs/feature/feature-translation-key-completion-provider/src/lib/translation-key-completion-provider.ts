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

  public resolveCompletionItem?(
    item: vscode.CompletionItem,
    _: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.CompletionItem> {
    const fileLocationStore = FileLocationStore.getInstance();
    const configuration =
      ConfigurationStoreManager.getInstance().getConfig<I18nextScannerModuleConfiguration>(
        'i18nextScannerModule'
      );

    if (item.detail) {
      const itemData = JSON.parse(item.detail.toString()) as {
        namespace: string;
        translationKey: string;
      };
      const namespace = itemData.namespace;
      const translationKey = itemData.translationKey;

      const translationValue = fileLocationStore
        .getTranslationFiles()
        .filter(
          x =>
            x.language === configuration.defaultLanguage &&
            x.namespace === namespace
        )
        .filter(x => x.keys[translationKey.toString()].value)
        .map(x => x.keys[translationKey].value)[0];

      item.documentation = `${translationValue}`;
      item.detail = `Key: ${translationKey} (Namespace: ${namespace})}`;
      // item.label = `${translationKey} - ${translationValue}`;
    }

    return item;
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

    const [namespace, _] = keyPrefix.includes(configuration.nsSeparator)
      ? keyPrefix.split(configuration.nsSeparator)
      : [configuration.defaultNamespace, keyPrefix];

    const translationFiles = fileLocationStore
      .getTranslationFiles()
      .filter(
        x =>
          x.language === configuration.defaultLanguage &&
          x.namespace === namespace
      );

    const keys = translationFiles.flatMap(file => Object.keys(file.keys));

    return keys
      .filter(
        translationKey =>
          translationKey.startsWith(translationKey) &&
          !translationKey.includes(configuration.contextSeparator) &&
          !translationKey.includes(configuration.pluralSeparator)
      )
      .map(translationKey => {
        const item = new vscode.CompletionItem(
          translationKey,
          vscode.CompletionItemKind.Text
        );

        item.detail = `{"namespace":"${namespace}", "translationKey":"${translationKey}"}`;

        const wordRange = document.getWordRangeAtPosition(position, /[\w\.]+/); // Match alphanumeric or dots
        if (wordRange) {
          // Step 2: Set the range for replacement to the detected word range
          item.range = wordRange;

          // Step 3: Specify the text to insert
          item.insertText = translationKey;
        } else {
          // Step 4: If no word range is detected, handle insertion at the cursor position
          item.range = new vscode.Range(position, position); // Insert at cursor only
          item.insertText = translationKey;
        }

        return item;
      });
  }
}
