import * as Sentry from '@sentry/node';
import * as dotenv from 'dotenv';
import path from 'path';
import vscode, { ExtensionContext } from 'vscode';

import GeneralConfiguration from './lib/entities/configuration/general/generalConfiguration';
import I18nextScannerModuleConfiguration from './lib/entities/configuration/modules/i18nextScanner/i18nextScannerModuleConfiguration';
import { FileType } from './lib/enums/fileType';
import WebviewFactory from './lib/factories/webviewFactory';
import ConfigurationWizardService from './lib/services/configurationWizard/configurationWizardService';
import FileWatcherCreator from './lib/services/fileChange/fileWatcherCreator';
import WebviewService from './lib/services/webview/webviewService';
import CodeTranslationStore from './lib/stores/codeTranslation/codeTranslationStore';
import ConfigurationStoreManager from './lib/stores/configuration/configurationStoreManager';
import FileLocationStore from './lib/stores/fileLocation/fileLocationStore';
import WebviewStore from './lib/stores/webview/webviewStore';
import { FileSearchLocation } from './lib/types/fileSearchLocation';
import { isProduction } from './lib/utilities/environmentUtilities';

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
    ConfigurationStoreManager.getInstance().initialize();

    await initializeFileLocations(context);

    const onDidOpenTextDocumentDisposable =
      await createWebViewForFilesMatchingPattern(webviewService);

    const configurationWatcherDisposable =
      vscode.workspace.onDidChangeConfiguration(async () => {
        ConfigurationStoreManager.getInstance().syncConfigurationStore();

        await reinitialize(fileWatcherCreator, context);
      });

    const { codeFileWatchers, jsonFileWatchers, poFileWatchers } =
      await createFileWatchers(fileWatcherCreator);

    const configurationWizardCommandDisposable =
      await registerConfigurationWizardCommand(
        configurationWizardService,
        fileWatcherCreator,
        context
      );

    context.subscriptions.push(
      ...codeFileWatchers,
      ...jsonFileWatchers,
      ...poFileWatchers,
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

async function createFileWatchers(fileWatcherCreator: FileWatcherCreator) {
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
    'i18nextScannerModule'
  );

  const jsonFileWatchers = await createWatchersForFileType(
    FileType.Json,
    {
      filePattern: `**${translationFilesLocation}/**/*.json`,
      ignorePattern:
        '{**/node_modules/**,**/.next/**,**/.git/**,**/.nx/**,**/.coverage/**,**/.cache/**}',
    } as FileSearchLocation,
    fileWatcherCreator
  );

  const poFileWatchers = await createWatchersForFileType(
    FileType.Po,
    {
      filePattern: `**${translationFilesLocation}/**/*.po`,
      ignorePattern:
        '{**/node_modules/**,**/.next/**,**/.git/**,**/.nx/**,**/.coverage/**,**/.cache/**}',
    } as FileSearchLocation,
    fileWatcherCreator,
    'i18nextJsonToPoConversionModule'
  );

  return {
    codeFileWatchers,
    jsonFileWatchers,
    poFileWatchers,
  };
}

async function createWatchersForFileType(
  fileType: FileType,
  fileSearchLocation: FileSearchLocation,
  fileWatcherCreator: FileWatcherCreator,
  disableFlag?: 'i18nextScannerModule' | 'i18nextJsonToPoConversionModule'
) {
  return await fileWatcherCreator.createFileWatchersForFileTypeAsync(
    fileType,
    fileSearchLocation,
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

  const { codeFileWatchers, jsonFileWatchers, poFileWatchers } =
    await createFileWatchers(fileWatcherCreator);

  context.subscriptions.push(
    ...codeFileWatchers,
    ...jsonFileWatchers,
    ...poFileWatchers
  );
}

export function deactivate() {
  Sentry.endSession();
}
