import * as Sentry from '@sentry/node';
import vscode from 'vscode';
import { ExtensionContext } from 'vscode';

import FileWatcherCreator from './lib/services/fileChange/fileWatcherCreator';
import WebViewService from './lib/services/webview/webviewService';
import ConfigurationStoreManager from './lib/stores/configuration/configurationStoreManager';
import FileContentStore from './lib/stores/fileContent/fileContentStore';
import FileLocationStore from './lib/stores/fileLocation/fileLocationStore';
import { FileSearchLocation } from './lib/types/fileSearchLocation';

function initializeSentry() {
  Sentry.init({
    dsn: 'https://188de1d08857e4d1a5e59d8a9da5da1a@o4507423909216256.ingest.de.sentry.io/4507431475019856',
    integrations: Sentry.getDefaultIntegrations({}),
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
  });
}
initializeSentry();

let _context = {} as ExtensionContext;

export async function activate(
  context: ExtensionContext,
  fileWatcherCreator: FileWatcherCreator = new FileWatcherCreator()
) {
  console.log('i18nWeave is now active!');

  _context = context;

  try {
    const fileSearchLocations = [
      {
        filePattern: '**/public/locales/**/*.json',
        ignorePattern:
          '{**/node_modules/**,**/.next/**,**/.git/**,**/.nx/**,**/.coverage/**,**/.cache/**}',
      } as FileSearchLocation,
      {
        filePattern: '**/public/locales/**/*.po',
        ignorePattern:
          '**/node_modules/**,**/.next/**,**/.git/**,**/.nx/**,**/.coverage/**,**/.cache/**',
      } as FileSearchLocation,
      {
        filePattern: '**/{apps,libs}/**/*.{tsx,ts}',
        ignorePattern:
          '{**/node_modules/**,**/.next/**,**/.git/**,**/.nx/**,**/.coverage/**,**/.cache/**,**/*.spec.ts,**/*.spec.tsx}',
      } as FileSearchLocation,
    ];

    await FileLocationStore.getInstance().scanWorkspaceAsync(
      fileSearchLocations
    );

    FileContentStore.getInstance().initializeInitialFileContents();

    const onDidOpenTextDocumentDisposable =
      await createWebViewForFilesMatchingPattern();

    const typeScriptFileWatchers = await createWatchersForFileType(
      ['ts', 'tsx'],
      'i18nextScannerModule',
      fileWatcherCreator
    );

    const jsonFileWatchers = await createWatchersForFileType(
      ['json'],
      'i18nextJsonToPoConversionModule',
      fileWatcherCreator
    );

    const poFileWatchers = await createWatchersForFileType(
      ['po'],
      'i18nextJsonToPoConversionModule',
      fileWatcherCreator
    );

    ConfigurationStoreManager.getInstance().initialize();

    context.subscriptions.push(
      ...typeScriptFileWatchers,
      ...jsonFileWatchers,
      ...poFileWatchers,
      onDidOpenTextDocumentDisposable
    );
  } catch (error) {
    Sentry.captureException(error);
  }
}

async function createWatchersForFileType(
  fileExtensions: string[],
  configKey: 'i18nextScannerModule' | 'i18nextJsonToPoConversionModule',
  fileWatcherCreator: FileWatcherCreator
) {
  return await fileWatcherCreator.createFileWatchersForFileTypeAsync(
    fileExtensions,
    () =>
      false ===
      ConfigurationStoreManager.getInstance().getConfig<any>(configKey).enabled
  );
}

async function createWebViewForFilesMatchingPattern() {
  const onDidOpenTextDocumentDisposable =
    vscode.workspace.onDidOpenTextDocument(document => {
      const uri = document.uri;
      if (
        uri.scheme === 'file' &&
        uri.path.endsWith('.json') &&
        FileLocationStore.getInstance().hasFile(uri)
      ) {
        WebViewService.getInstance().openJsonAsTable(uri, _context);
      }
    });

  return onDidOpenTextDocumentDisposable;
}

export function deactivate() {
  // This method is called when your extension is deactivated
}
