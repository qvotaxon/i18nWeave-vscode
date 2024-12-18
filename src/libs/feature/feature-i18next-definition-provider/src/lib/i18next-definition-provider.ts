import * as vscode from 'vscode';

import { FileLocationStore } from '@i18n-weave/store/store-file-location-store';

import {
  ConfigurationStoreManager,
  I18nextScannerModuleConfiguration,
} from '@i18n-weave/util/util-configuration';
import { extractNamespaceFromTranslationKey } from '@i18n-weave/util/util-translation-key-utils';

export class I18nextDefinitionProvider implements vscode.DefinitionProvider {
  private static _instance: I18nextDefinitionProvider;

  private constructor() {
    // Private constructor to prevent instantiation
  }

  public static getInstance(): I18nextDefinitionProvider {
    if (!I18nextDefinitionProvider._instance) {
      I18nextDefinitionProvider._instance = new I18nextDefinitionProvider();
    }
    return I18nextDefinitionProvider._instance;
  }

  public async provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position
  ): Promise<vscode.Location | vscode.Location[] | null> {
    const fileLocationStore = FileLocationStore.getInstance();
    const configuration =
      ConfigurationStoreManager.getInstance().getConfig<I18nextScannerModuleConfiguration>(
        'i18nextScannerModule'
      );

    // Get the full translation key under the cursor
    const fullKey = this.getFullKeyAtPosition(document, position);

    if (!fullKey) {
      return null;
    }

    const [namespace, keyWithoutNamespace] = extractNamespaceFromTranslationKey(
      fullKey,
      configuration.nsSeparator,
      configuration.defaultNamespace
    );

    // Search for this key in the translation store
    for (const record of fileLocationStore
      .getTranslationFiles()
      .filter(
        x =>
          x.language === configuration.defaultLanguage &&
          x.namespace === namespace
      )) {
      const keyData = record.keys[keyWithoutNamespace];

      if (keyData) {
        // If we find the key, return its location
        return keyData.location;
      }
    }

    return null; // Key not found
  }

  private getFullKeyAtPosition(
    document: vscode.TextDocument,
    position: vscode.Position
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

