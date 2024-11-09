import * as Sentry from '@sentry/node';
import * as dotenv from 'dotenv';
import path from 'path';
import vscode, { ExtensionContext } from 'vscode';

import { ActiveTextEditorChangedHandler } from '@i18n-weave/feature/feature-active-text-editor-changed-handler';
import { ConfigurationWizardService } from '@i18n-weave/feature/feature-configuration-wizard';
import { FileLocationInitializer } from '@i18n-weave/feature/feature-file-location-initializer';
import { FileWatcherCreator } from '@i18n-weave/feature/feature-file-watcher-creator';
import {
  StatusBarManager,
  StatusBarState,
} from '@i18n-weave/feature/feature-status-bar-manager';
import { TextDocumentChangedHandler } from '@i18n-weave/feature/feature-text-document-changed-handler';

import { TranslationStore } from '@i18n-weave/store/store-translation-store';

import {
  ConfigurationStoreManager,
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
  configurationManager: ConfigurationStoreManager = ConfigurationStoreManager.getInstance(),
  configurationWizardService: ConfigurationWizardService = new ConfigurationWizardService(),
  translationStore: TranslationStore = TranslationStore.getInstance(),
  fileLocationInitializer: FileLocationInitializer = new FileLocationInitializer(
    context
  ),
  textDocumentOpenedHandler: ActiveTextEditorChangedHandler = new ActiveTextEditorChangedHandler(
    context
  ),
  textDocumentChangedHandler: TextDocumentChangedHandler = new TextDocumentChangedHandler()
) {
  console.log('i18nWeave is now active!');

  initializeSentry();

  try {
    const logger = Logger.getInstance();
    const statusBarManager = StatusBarManager.getInstance(context);
    statusBarManager.updateState(StatusBarState.Running, 'Initializing...');

    configurationManager.initialize();
    logger.log(LogLevel.INFO, 'i18nWeave is now active!');

    await fileLocationInitializer.initializeFileLocations();
    await translationStore.initializeAsync();

    const onDidOpenTextDocumentDisposable =
      textDocumentOpenedHandler.initialize();

    const onDidChangeTextDocumentDisposable =
      textDocumentChangedHandler.initialize();

    const configurationWatcherDisposable =
      vscode.workspace.onDidChangeConfiguration(async () => {
        configurationManager.syncConfigurationStore();

        await reinitialize(
          fileLocationInitializer,
          fileWatcherCreator,
          context
        );
        logger.log(LogLevel.INFO, 'Configuration changed, re-initializing...');
      });

    const { codeFileWatchers, jsonFileWatchers } = await createFileWatchers(
      fileWatcherCreator,
      context
    );

    const configurationWizardCommandDisposable =
      await registerConfigurationWizardCommand(
        fileLocationInitializer,
        configurationWizardService,
        fileWatcherCreator,
        context
      );

    context.subscriptions.push(
      ...codeFileWatchers,
      ...jsonFileWatchers,
      onDidOpenTextDocumentDisposable,
      onDidChangeTextDocumentDisposable,
      configurationWizardCommandDisposable,
      configurationWatcherDisposable
    );

    statusBarManager.updateState(StatusBarState.Idle, 'Idle');
  } catch (error) {
    Sentry.captureException(error);
  }
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
    } as FileSearchLocation,
    fileWatcherCreator,
    context,
    'i18nextScannerModule'
  );

  const jsonFileWatchers = await createWatchersForFileType(
    FileType.Json,
    {
      filePattern: `**${translationFilesLocation}/**/*.json`,
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

async function registerConfigurationWizardCommand(
  fileLocationInitializer: FileLocationInitializer,
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
        await reinitialize(
          fileLocationInitializer,
          fileWatcherCreator,
          context
        );

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
  fileLocationInitializer: FileLocationInitializer,
  fileWatcherCreator: FileWatcherCreator,
  context: vscode.ExtensionContext
) {
  fileLocationInitializer.initializeFileLocations();

  const { codeFileWatchers, jsonFileWatchers } = await createFileWatchers(
    fileWatcherCreator,
    context
  );

  context.subscriptions.push(...codeFileWatchers, ...jsonFileWatchers);
}

export function deactivate() {
  Sentry.endSession();
}
