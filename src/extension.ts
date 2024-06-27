import * as Sentry from '@sentry/node';
import * as dotenv from 'dotenv';
import path from 'path';
import vscode, { ExtensionContext } from 'vscode';

import GeneralConfiguration from './lib/entities/configuration/general/generalConfiguration';
import I18nextScannerModuleConfiguration from './lib/entities/configuration/modules/i18nextScanner/i18nextScannerModuleConfiguration';
import { FileType } from './lib/enums/fileType';
import WebviewFactory from './lib/factories/webviewFactory';
import FileWatcherCreator from './lib/services/fileChange/fileWatcherCreator';
import WebviewService from './lib/services/webview/webviewService';
import ConfigurationStoreManager from './lib/stores/configuration/configurationStoreManager';
import FileContentStore from './lib/stores/fileContent/fileContentStore';
import FileLocationStore from './lib/stores/fileLocation/fileLocationStore';
import WebviewStore from './lib/stores/webview/webviewStore';
import { FileSearchLocation } from './lib/types/fileSearchLocation';
import { isProduction } from './lib/utilities/environmentUtilities';

const envFilePath =
  process.env.DOTENV_CONFIG_PATH ??
  path.join(__dirname, '..', '.env.production');
dotenv.config({ path: envFilePath });

function initializeSentry() {
  Sentry.init({
    enabled: isProduction(),
    dsn: 'https://188de1d08857e4d1a5e59d8a9da5da1a@o4507423909216256.ingest.de.sentry.io/4507431475019856',
    integrations: Sentry.getDefaultIntegrations({}),
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
  });
}
initializeSentry();

export async function activate(
  context: ExtensionContext,
  fileWatcherCreator: FileWatcherCreator = new FileWatcherCreator(),
  webviewService: WebviewService = new WebviewService(
    WebviewStore.getInstance(),
    new WebviewFactory(context)
  )
) {
  console.log('i18nWeave is now active!');

  ConfigurationStoreManager.getInstance().initialize();

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

  try {
    const fileSearchLocations = [
      {
        filePattern: `**/${translationFilesLocation}/**/*.json`,
        ignorePattern:
          '{**/node_modules/**,**/.next/**,**/.git/**,**/.nx/**,**/.coverage/**,**/.cache/**}',
      } as FileSearchLocation,
      {
        filePattern: `**/${translationFilesLocation}/**/*.po`,
        ignorePattern:
          '{**/node_modules/**,**/.next/**,**/.git/**,**/.nx/**,**/.coverage/**,**/.cache/**}',
      } as FileSearchLocation,
      {
        filePattern: `**/{${codeFileLocations}}/**/*{${codeFileExtensions}}`,
        ignorePattern:
          '{**/node_modules/**,**/.next/**,**/.git/**,**/.nx/**,**/.coverage/**,**/.cache/**,**/*.spec.ts,**/*.spec.tsx}',
      } as FileSearchLocation,
    ];

    await FileLocationStore.getInstance().scanWorkspaceAsync(
      fileSearchLocations
    );

    FileContentStore.getInstance().initializeInitialFileContents();

    const onDidOpenTextDocumentDisposable =
      await createWebViewForFilesMatchingPattern(webviewService);

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
        webviewService.showWebview(FileType.JSON, uri);
      }
    });

  return onDidOpenTextDocumentDisposable;
}

export function deactivate() {
  // This method is called when your extension is deactivated
}
