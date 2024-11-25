import * as vscode from 'vscode';
import { MarkdownString } from 'vscode';

import { FileLocationStore } from '@i18n-weave/store/store-file-location-store';

import {
  ConfigurationStoreManager,
  I18nextScannerModuleConfiguration,
} from '@i18n-weave/util/util-configuration';

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
      const translationValue = this.getTranslationValue(
        fileLocationStore,
        configuration.defaultLanguage,
        namespace,
        translationKey
      );

      if (translationValue) {
        item.documentation = new MarkdownString(`
          (Namespace: ${namespace})
          
          Value:
          ${translationValue}`);
      } else {
        item.documentation = new MarkdownString(`
          
          *No translation value found*`);
      }
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

    const linePrefix = document
      .lineAt(position)
      .text.substring(0, position.character);
    const match = this.matchTranslationFunction(linePrefix, configuration);

    if (!match) {
      return [];
    }

    const keyPrefix = match[2];
    const [namespace, keyWithoutNamespace] = this.extractNamespace(
      keyPrefix,
      configuration
    );

    const keys = this.getTranslationKeys(
      fileLocationStore,
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

  private getTranslationValue(
    fileLocationStore: FileLocationStore,
    language: string,
    namespace: string,
    translationKey: string
  ): string | undefined | null {
    return fileLocationStore
      .getTranslationFiles()
      .filter(
        file => file.language === language && file.namespace === namespace
      )
      .map(file => file.keys[translationKey]?.value)
      .find(value => value !== undefined);
  }

  private matchTranslationFunction(
    linePrefix: string,
    configuration: I18nextScannerModuleConfiguration
  ): RegExpExecArray | null {
    const translationFunctionNames =
      configuration.translationFunctionNames.join('|');
    const translationCallRegex = new RegExp(
      `(${translationFunctionNames})\\(['"]([^'"]*)$`
    );
    return translationCallRegex.exec(linePrefix);
  }

  private extractNamespace(
    keyPrefix: string,
    configuration: I18nextScannerModuleConfiguration
  ): [string, string] {
    if (keyPrefix.includes(configuration.nsSeparator)) {
      const [namespace, keyWithoutNamespace] = keyPrefix.split(
        configuration.nsSeparator
      );
      return [namespace, keyWithoutNamespace];
    } else {
      return [configuration.defaultNamespace, keyPrefix];
    }
  }

  private getTranslationKeys(
    fileLocationStore: FileLocationStore,
    language: string,
    namespace: string
  ): string[] {
    return fileLocationStore
      .getTranslationFiles()
      .filter(
        file => file.language === language && file.namespace === namespace
      )
      .flatMap(file => Object.keys(file.keys));
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
