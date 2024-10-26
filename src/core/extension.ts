import * as Sentry from '@sentry/node';
import * as dotenv from 'dotenv';
import path from 'path';
import vscode, { ExtensionContext } from 'vscode';

import { ConfigurationWizardService } from '@i18n-weave/feature/feature-configuration-wizard';
import { FileWatcherCreator } from '@i18n-weave/feature/feature-file-watcher-creator';
import { WebviewFactory } from '@i18n-weave/feature/feature-webview-factory';
import { WebviewService } from '@i18n-weave/feature/feature-webview-service';

import { FileReader } from '@i18n-weave/file-io/file-io-file-reader';

import { CodeTranslationStore } from '@i18n-weave/store/store-code-translation-store';
import { FileLocationStore } from '@i18n-weave/store/store-file-location-store';
import { WebviewStore } from '@i18n-weave/store/store-webview-store';

import {
  ConfigurationStoreManager,
  GeneralConfiguration,
  I18nextScannerModuleConfiguration,
} from '@i18n-weave/util/util-configuration';
import { FileType } from '@i18n-weave/util/util-enums';
import { isProduction } from '@i18n-weave/util/util-environment-utilities';
import { FileSearchLocation } from '@i18n-weave/util/util-types';

const envFilePath =
  process.env.DOTENV_CONFIG_PATH ??
  path.join(__dirname, '..', '.env.production');
dotenv.config({ path: envFilePath });

function initializeSentry() {
  const i18nWeaveExtension =
    vscode.extensions.getExtension('qvotaxon.i18nWeave')!;
  const installationId = vscode.env.machineId;

  Sentry.init({
    enabled: isProduction() && vscode.env.isTelemetryEnabled,
    dsn: 'https://188de1d08857e4d1a5e59d8a9da5da1a@o4507423909216256.ingest.de.sentry.io/4507431475019856',
    integrations: Sentry.getDefaultIntegrations({}),
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
    release: i18nWeaveExtension.packageJSON.version,
  });

  Sentry.setUser({
    id: installationId,
  });

  Sentry.startSession();
}

class JsonSymbolProvider implements vscode.DocumentSymbolProvider {
  provideDocumentSymbols(
    document: vscode.TextDocument
  ): vscode.ProviderResult<vscode.SymbolInformation[]> {
    const text = document.getText();
    const jsonObject = JSON.parse(text);
    return this.parseJsonObject(jsonObject, '', document.uri, text);
  }

  private parseJsonObject(
    obj: any,
    parentKey: string,
    uri: vscode.Uri,
    originalText: string
  ): vscode.SymbolInformation[] {
    const symbols: vscode.SymbolInformation[] = [];
    for (const key in obj) {
      const value = obj[key];
      const fullKey = parentKey ? `${parentKey}.${key}` : key;

      const startPos = this.findKeyPosition(originalText, key);
      const location = new vscode.Location(uri, startPos);
      const kind =
        typeof value === 'object' && value !== null
          ? vscode.SymbolKind.Object
          : vscode.SymbolKind.Field;

      symbols.push(new vscode.SymbolInformation(key, kind, fullKey, location));
      if (typeof value === 'object' && value !== null) {
        symbols.push(
          ...this.parseJsonObject(value, fullKey, uri, originalText)
        );
      }
    }
    return symbols;
  }

  private findKeyPosition(text: string, key: string): vscode.Position {
    const regex = new RegExp(`"${key}"`, 'g');
    const match = regex.exec(text);
    if (match) {
      const index = match.index;
      return this.indexToPosition(index, text);
    }
    return new vscode.Position(0, 0); // Fallback if not found
  }

  private indexToPosition(index: number, text: string): vscode.Position {
    const lines = text.slice(0, index).split('\n');
    return new vscode.Position(
      lines.length - 1,
      lines[lines.length - 1].length
    );
  }
}

class JsonTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly fullKey: string,
    public readonly namespace: string,
    public readonly children: JsonTreeItem[] = [],
    collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly value?: string
  ) {
    super(label, collapsibleState);
  }
}

class JsonTreeProvider implements vscode.TreeDataProvider<JsonTreeItem> {
  constructor(private jsonData: any) {}

  getTreeItem(element: JsonTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: JsonTreeItem): Thenable<JsonTreeItem[]> {
    if (!element) {
      // For root elements, each will have its own namespace (root key)
      return Promise.resolve(
        Object.keys(this.jsonData).map(rootKey =>
          this.createTreeItem(rootKey, this.jsonData[rootKey], rootKey, '')
        )
      );
    }
    return Promise.resolve(element.children || []);
  }

  private createTreeItem(
    key: string,
    value: any,
    namespace: string,
    parentKey: string
  ): JsonTreeItem {
    const fullKey = parentKey ? `${parentKey}.${key}` : key;
    if (typeof value === 'object' && value !== null) {
      const children = Object.keys(value).map(childKey =>
        this.createTreeItem(childKey, value[childKey], namespace, fullKey)
      );
      return new JsonTreeItem(
        key,
        fullKey,
        namespace,
        children,
        vscode.TreeItemCollapsibleState.Collapsed
      );
    } else {
      return new JsonTreeItem(
        key,
        fullKey,
        namespace,
        [],
        vscode.TreeItemCollapsibleState.None,
        value
      );
    }
  }
}

async function openFileAndNavigate(filePath: string, fullKeyPath: string) {
  const uri = vscode.Uri.file(filePath);
  const document = await vscode.workspace.openTextDocument(uri);
  await vscode.window.showTextDocument(document);

  const symbols = await vscode.commands.executeCommand<
    vscode.SymbolInformation[]
  >('vscode.executeDocumentSymbolProvider', uri);
  if (symbols) {
    const symbol = symbols.find(
      sym => sym.name === fullKeyPath.split('.').pop()
    );
    if (symbol) {
      const range = symbol.location.range;
      const editor = vscode.window.activeTextEditor;

      if (editor) {
        editor.revealRange(range);
        editor.selection = new vscode.Selection(range.start, range.end);
      }
    } else {
      vscode.window.showErrorMessage(
        `Key "${fullKeyPath}" not found in the JSON file ${filePath}.`
      );
    }
  }
}

export async function activate(
  context: ExtensionContext,
  fileWatcherCreator: FileWatcherCreator = new FileWatcherCreator(),
  configurationWizardService: ConfigurationWizardService = new ConfigurationWizardService(),
  webviewService: WebviewService = new WebviewService(
    WebviewStore.getInstance(),
    new WebviewFactory(context)
  )
) {
  console.log('i18nWeave is now active!');

  initializeSentry();

  try {
    const configurationStoreManager = ConfigurationStoreManager.getInstance();
    configurationStoreManager.initialize();

    await initializeFileLocations(context);

    const onDidOpenTextDocumentDisposable =
      await createWebViewForFilesMatchingPattern(webviewService);

    // ----
    const config =
      configurationStoreManager.getConfig<I18nextScannerModuleConfiguration>(
        'i18nextScannerModule'
      );
    const defaultLanguageJsonFilePaths =
      FileLocationStore.getInstance().getFileLocationsByType(
        ['json'],
        new RegExp(`.*\\${path.sep}${config.defaultLanguage}\\${path.sep}.*`)
      );

    const jsonData: { [key: string]: any } = {};
    const fileReadPromises: Promise<void>[] = [];
    defaultLanguageJsonFilePaths.forEach(defaultLanguageJsonFilePath => {
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

    Promise.all(fileReadPromises).then(() => {
      const treeDataProvider = new JsonTreeProvider(jsonData);
      const treeView = vscode.window.createTreeView('translationsManagerView', {
        treeDataProvider,
      });

      treeView.onDidChangeSelection(async event => {
        const selectedItem = event.selection[0];
        if (selectedItem.value) {
          vscode.window.showInformationMessage(
            `Selected: ${selectedItem.fullKey} ${selectedItem.value}`
          );

          const fileToOpen = defaultLanguageJsonFilePaths.find(filePath =>
            filePath.includes(selectedItem.namespace)
          );

          if (fileToOpen) {
            await openFileAndNavigate(fileToOpen, selectedItem.fullKey);
          }
        }
      });

      context.subscriptions.push(
        vscode.commands.registerCommand(
          'translationsManagerView.showItemDetails',
          (item: JsonTreeItem) => {
            vscode.window.showInformationMessage(
              `Details of ${item.label}: ${item.value}`
            );
          }
        )
      );

      // Copy item value command
      context.subscriptions.push(
        vscode.commands.registerCommand(
          'translationsManagerView.copyItemValue',
          (item: JsonTreeItem) => {
            if (item.value) {
              vscode.env.clipboard.writeText(item.value).then(() => {
                vscode.window.showInformationMessage(`Copied: ${item.value}`);
              });
            }
          }
        )
      );

      context.subscriptions.push(
        vscode.commands.registerCommand(
          'translationsManagerView.showLanguages',
          async () => {
            // const configManager = ConfigurationStoreManager.getInstance();
            const config =
              configurationStoreManager.getConfig<I18nextScannerModuleConfiguration>(
                'i18nextScannerModule'
              );
            const selectedLang = await vscode.window.showQuickPick(
              config.languages,
              {
                placeHolder: 'Select a language',
              }
            );

            if (selectedLang) {
              vscode.window.showInformationMessage(
                `Selected language: ${selectedLang}`
              );
              // await vscode.workspace.getConfiguration().update('i18nWeave.selectedLanguage', selectedLang, vscode.ConfigurationTarget.Global);
              // treeDataProvider.refresh(selectedLang);
            }
          }
        )
      );
    });

    context.subscriptions.push(
      vscode.languages.registerDocumentSymbolProvider(
        { language: 'json' },
        new JsonSymbolProvider()
      )
    );
    // ----

    const configurationWatcherDisposable =
      vscode.workspace.onDidChangeConfiguration(async () => {
        ConfigurationStoreManager.getInstance().syncConfigurationStore();

        await reinitialize(fileWatcherCreator, context);
      });

    const { codeFileWatchers, jsonFileWatchers } = await createFileWatchers(
      fileWatcherCreator,
      context
    );

    const configurationWizardCommandDisposable =
      await registerConfigurationWizardCommand(
        configurationWizardService,
        fileWatcherCreator,
        context
      );

    context.subscriptions.push(
      ...codeFileWatchers,
      ...jsonFileWatchers,
      onDidOpenTextDocumentDisposable,
      configurationWizardCommandDisposable,
      configurationWatcherDisposable
    );
  } catch (error) {
    Sentry.captureException(error);
  }
}

async function initializeFileLocations(context: ExtensionContext) {
  const translationFilesLocation =
    ConfigurationStoreManager.getInstance().getConfig<I18nextScannerModuleConfiguration>(
      'i18nextScannerModule'
    ).translationFilesLocation;

  const codeFileLocations =
    ConfigurationStoreManager.getInstance().getConfig<I18nextScannerModuleConfiguration>(
      'i18nextScannerModule'
    ).codeFileLocations;

  const codeFileExtensions =
    ConfigurationStoreManager.getInstance().getConfig<I18nextScannerModuleConfiguration>(
      'i18nextScannerModule'
    ).fileExtensions;

  const fileSearchLocations = [
    {
      filePattern: `**${translationFilesLocation}/**/*.json`,
      ignorePattern:
        '{**/node_modules/**,**/.next/**,**/.git/**,**/.nx/**,**/.coverage/**,**/.cache/**}',
    } as FileSearchLocation,
    {
      filePattern: `**${translationFilesLocation}/**/*.po`,
      ignorePattern:
        '{**/node_modules/**,**/.next/**,**/.git/**,**/.nx/**,**/.coverage/**,**/.cache/**}',
    } as FileSearchLocation,
    {
      filePattern: `**{${codeFileLocations}}/**/*{${codeFileExtensions}}`,
      ignorePattern:
        '{**/node_modules/**,**/.next/**,**/.git/**,**/.nx/**,**/.coverage/**,**/.cache/**,**/*.spec.ts,**/*.spec.tsx}',
    } as FileSearchLocation,
  ];

  await FileLocationStore.getInstance().scanWorkspaceAsync(fileSearchLocations);

  await CodeTranslationStore.getInstance().initializeAsync(context);
}

async function createFileWatchers(
  fileWatcherCreator: FileWatcherCreator,
  context: vscode.ExtensionContext
) {
  const translationFilesLocation =
    ConfigurationStoreManager.getInstance().getConfig<I18nextScannerModuleConfiguration>(
      'i18nextScannerModule'
    ).translationFilesLocation;

  const codeFileLocations =
    ConfigurationStoreManager.getInstance().getConfig<I18nextScannerModuleConfiguration>(
      'i18nextScannerModule'
    ).codeFileLocations;

  const codeFileExtensions =
    ConfigurationStoreManager.getInstance().getConfig<I18nextScannerModuleConfiguration>(
      'i18nextScannerModule'
    ).fileExtensions;

  const codeFileWatchers = await createWatchersForFileType(
    FileType.Code,
    {
      filePattern: `**/{${codeFileLocations}}/**/*.{${codeFileExtensions}}`,
      ignorePattern:
        '{**/node_modules/**,**/.next/**,**/.git/**,**/.nx/**,**/.coverage/**,**/.cache/**,**/*.spec.ts,**/*.spec.tsx}',
    } as FileSearchLocation,
    fileWatcherCreator,
    context,
    'i18nextScannerModule'
  );

  const jsonFileWatchers = await createWatchersForFileType(
    FileType.Json,
    {
      filePattern: `**${translationFilesLocation}/**/*.json`,
      ignorePattern:
        '{**/node_modules/**,**/.next/**,**/.git/**,**/.nx/**,**/.coverage/**,**/.cache/**}',
    } as FileSearchLocation,
    fileWatcherCreator,
    context
  );

  return {
    codeFileWatchers,
    jsonFileWatchers,
  };
}

async function createWatchersForFileType(
  fileType: FileType,
  fileSearchLocation: FileSearchLocation,
  fileWatcherCreator: FileWatcherCreator,
  context: vscode.ExtensionContext,
  disableFlag?: 'i18nextScannerModule'
) {
  return await fileWatcherCreator.createFileWatchersForFileTypeAsync(
    fileType,
    fileSearchLocation,
    context,
    () =>
      false ===
      (disableFlag
        ? ConfigurationStoreManager.getInstance().getConfig<any>(disableFlag)
            .enabled
        : true)
  );
}

async function createWebViewForFilesMatchingPattern(
  webviewService: WebviewService
) {
  const onDidOpenTextDocumentDisposable =
    vscode.workspace.onDidOpenTextDocument(document => {
      const uri = document.uri;
      if (
        uri.scheme === 'file' &&
        uri.path.endsWith('.json') &&
        FileLocationStore.getInstance().hasFile(uri) &&
        ConfigurationStoreManager.getInstance().getConfig<GeneralConfiguration>(
          'general'
        ).betaFeaturesConfiguration.enableJsonFileWebView
      ) {
        webviewService.showWebview(FileType.Json, uri);
      }
    });

  return onDidOpenTextDocumentDisposable;
}

async function registerConfigurationWizardCommand(
  configurationWizardService: ConfigurationWizardService,
  fileWatcherCreator: FileWatcherCreator,
  context: vscode.ExtensionContext
): Promise<vscode.Disposable> {
  return vscode.commands.registerCommand(
    'i18nWeave.launchConfigurationWizard',
    async () => {
      const config =
        await configurationWizardService.startConfigurationWizardAsync();
      if (config) {
        await reinitialize(fileWatcherCreator, context);

        vscode.window.showInformationMessage(
          `Successfully configured i18nWeave. Happy weaving! 🌍`
        );
      } else {
        vscode.window.showWarningMessage(
          'Configuration wizard cancelled, no changes were made.'
        );
      }
    }
  );
}

async function reinitialize(
  fileWatcherCreator: FileWatcherCreator,
  context: vscode.ExtensionContext
) {
  initializeFileLocations(context);

  const { codeFileWatchers, jsonFileWatchers } = await createFileWatchers(
    fileWatcherCreator,
    context
  );

  context.subscriptions.push(...codeFileWatchers, ...jsonFileWatchers);
}

export function deactivate() {
  Sentry.endSession();
}
