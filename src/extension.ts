import * as Sentry from '@sentry/node';
import vscode from 'vscode';
import { ExtensionContext } from 'vscode';

import FileWatcherCreator from './lib/services/fileChange/fileWatcherCreator';
import WebViewService from './lib/services/webview/webviewService';
import ConfigurationStoreManager from './lib/stores/configuration/configurationStoreManager';
import FileContentStore from './lib/stores/fileContent/fileContentStore';
import FileLocationStore from './lib/stores/fileLocation/fileLocationStore';

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
    const filePatterns = [
      '**/*.json',
      '**/*.po',
      '**/{apps,libs}/**/*.{tsx,ts}',
    ];
    const ignorePattern = '**/{node_modules,.next,.spec.*}/**';

    await FileLocationStore.getInstance().scanWorkspaceAsync(
      filePatterns,
      ignorePattern
    );

    FileContentStore.getInstance().initializeInitialFileContents();

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
      ...poFileWatchers
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

async function createWebViewForFilesMatchingPattern(globPattern: string) {
  const fileURIs = await vscode.workspace.findFiles(
    globPattern,
    '**/{node_modules,.next}/**'
  );

  const onDidOpenTextDocumentDisposable =
    vscode.workspace.onDidOpenTextDocument(document => {
      const uri = document.uri;
      if (
        uri.scheme === 'file' &&
        fileURIs.find(fileUri => uri.fsPath === fileUri.fsPath)
      ) {
        WebViewService.getInstance().openJsonAsTable(uri, _context);
      }
    });

  return onDidOpenTextDocumentDisposable;
}

export function deactivate() {
  // This method is called when your extension is deactivated
}
