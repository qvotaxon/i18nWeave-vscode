import * as path from 'path';
import * as vscode from 'vscode';
import { FileReader } from 'src/libs/file-io/file-io-file-reader/src';
import { FileLocationStore } from 'src/libs/store/store-file-location-store/src';

import { JsonSymbolProvider } from '@i18n-weave/feature/feature-json-symbol-provider';
import {
  JsonTreeDataProvider,
  JsonTreeItem,
} from '@i18n-weave/feature/feature-json-tree-data-provider';

import {
  ConfigurationStoreManager,
  I18nextScannerModuleConfiguration,
} from '@i18n-weave/util/util-configuration';
import { highlightSymbolInDocumentAsync } from '@i18n-weave/util/util-highlight-symbol-in-document';
import { openFileByUriAsync } from '@i18n-weave/util/util-open-file-by-uri';

export class TranslationsManager {
  private treeDataProvider: JsonTreeDataProvider | undefined;
  private defaultLanguageJsonFilePaths: string[] = [];

  constructor(private readonly context: vscode.ExtensionContext) {}

  private async openFileAndHighlightSymbolAsync(
    filePath: string,
    fullKeyPath: string
  ) {
    const uri = vscode.Uri.file(filePath);
    const document = await openFileByUriAsync(uri);
    await highlightSymbolInDocumentAsync(document, fullKeyPath);
  }

  private async loadJsonData(selectedLanguage?: string) {
    const config =
      ConfigurationStoreManager.getInstance().getConfig<I18nextScannerModuleConfiguration>(
        'i18nextScannerModule'
      );
    this.defaultLanguageJsonFilePaths =
      FileLocationStore.getInstance().getFileLocationsByType(
        ['json'],
        new RegExp(
          `.*\\${path.sep}${selectedLanguage ?? config.defaultLanguage}\\${path.sep}.*`
        )
      );

    const jsonData: { [key: string]: any } = {};
    const fileReadPromises: Promise<void>[] = [];
    this.defaultLanguageJsonFilePaths.forEach(defaultLanguageJsonFilePath => {
      const promise = FileReader.readFileAsync(
        defaultLanguageJsonFilePath
      ).then(namespaceJsonContent => {
        const namespace = path.basename(
          defaultLanguageJsonFilePath,
          path.extname(defaultLanguageJsonFilePath)
        );
        jsonData[namespace] = JSON.parse(namespaceJsonContent);
      });
      fileReadPromises.push(promise);
    });

    await Promise.all(fileReadPromises);
    return jsonData;
  }

  private async refreshTreeView(selectedLanguage?: string) {
    const jsonData = await this.loadJsonData(selectedLanguage);
    if (this.treeDataProvider) {
      this.treeDataProvider.refresh(jsonData);
    }
  }

  public initialize() {
    this.loadJsonData().then(jsonData => {
      this.treeDataProvider = new JsonTreeDataProvider(jsonData);
      const treeView = vscode.window.createTreeView('translationsManagerView', {
        treeDataProvider: this.treeDataProvider,
      });

      treeView.onDidChangeSelection(async event => {
        const selectedItem = event.selection[0];
        if (selectedItem.value) {
          const fileToOpen = this.defaultLanguageJsonFilePaths.find(filePath =>
            filePath.includes(selectedItem.namespace)
          );

          if (fileToOpen) {
            await this.openFileAndHighlightSymbolAsync(
              fileToOpen,
              selectedItem.fullKey
            );
          }
        }
      });

      // Copy item value command
      this.context.subscriptions.push(
        vscode.commands.registerCommand(
          'translationsManagerView.copyItemValue',
          (item: JsonTreeItem) => {
            if (item.value) {
              vscode.env.clipboard.writeText(item.value).then(() => {
                vscode.window.showInformationMessage(
                  `Copied value for key '${item.fullKey}' to clipboard.`
                );
              });
            }
          }
        )
      );

      this.context.subscriptions.push(
        vscode.commands.registerCommand(
          'translationsManagerView.copyItemKey',
          (item: JsonTreeItem) => {
            if (item.value) {
              vscode.env.clipboard.writeText(item.fullKey).then(() => {
                vscode.window.showInformationMessage(
                  `Copied '${item.fullKey}' to clipboard.`
                );
              });
            }
          }
        )
      );

      this.context.subscriptions.push(
        vscode.commands.registerCommand(
          'translationsManagerView.showLanguages',
          async () => {
            const config =
              ConfigurationStoreManager.getInstance().getConfig<I18nextScannerModuleConfiguration>(
                'i18nextScannerModule'
              );
            const selectedLang = await vscode.window.showQuickPick(
              config.languages,
              { placeHolder: 'Select a language' }
            );

            if (selectedLang) {
              await this.refreshTreeView(selectedLang).then(() => {
                vscode.window.showInformationMessage(
                  `Selected language: ${selectedLang}`
                );
              });
            }
          }
        )
      );

      this.context.subscriptions.push(
        vscode.languages.registerDocumentSymbolProvider(
          { language: 'json' },
          new JsonSymbolProvider()
        )
      );

      // Watch for changes in JSON files
      const fileWatcher = vscode.workspace.createFileSystemWatcher('**/*.json');
      fileWatcher.onDidChange(() => this.refreshTreeView());
      fileWatcher.onDidCreate(() => this.refreshTreeView());
      fileWatcher.onDidDelete(() => this.refreshTreeView());

      this.context.subscriptions.push(fileWatcher);
    });
  }
}

export default TranslationsManager;
