import * as Sentry from '@sentry/node';
import * as dotenv from 'dotenv';
import path from 'path';
import vscode, { ExtensionContext } from 'vscode';

import { ConfigurationWizardService } from '@i18n-weave/feature/feature-configuration-wizard';
import { FileWatcherCreator } from '@i18n-weave/feature/feature-file-watcher-creator';
import {
  StatusBarManager,
  StatusBarState,
} from '@i18n-weave/feature/feature-status-bar-manager';
import { WebviewFactory } from '@i18n-weave/feature/feature-webview-factory';
import { WebviewService } from '@i18n-weave/feature/feature-webview-service';

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
import { LogLevel, Logger } from '@i18n-weave/util/util-logger';
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
    const logger = Logger.getInstance();
    const statusBarManager = StatusBarManager.getInstance(context);
    statusBarManager.updateState(StatusBarState.Running, 'Initializing...');
    logger.log(LogLevel.INFO, 'i18nWeave is now active!');

    ConfigurationStoreManager.getInstance().initialize();

    await initializeFileLocations(context);

    const onDidOpenTextDocumentDisposable =
      await createWebViewForFilesMatchingPattern(webviewService);

    const configurationWatcherDisposable =
      vscode.workspace.onDidChangeConfiguration(async () => {
        ConfigurationStoreManager.getInstance().syncConfigurationStore();

        await reinitialize(fileWatcherCreator, context);
        logger.log(LogLevel.INFO, 'Configuration changed, re-initializing...');
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

    statusBarManager.updateState(StatusBarState.Idle, 'Idle');
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
      filePattern: `**/{${codeFileLocations}}/**/*.{${codeFileExtensions}}`,
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
