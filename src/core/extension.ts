import * as Sentry from '@sentry/node';
import vscode, { ConfigurationChangeEvent, ExtensionContext } from 'vscode';

import { ActiveTextEditorChangedHandler } from '@i18n-weave/feature/feature-active-text-editor-changed-handler';
import { ConfigurationWizardService } from '@i18n-weave/feature/feature-configuration-wizard';
import { FileLocationInitializer } from '@i18n-weave/feature/feature-file-location-initializer';
import { FileWatcherCreator } from '@i18n-weave/feature/feature-file-watcher-creator';
import { I18nextDefinitionProvider } from '@i18n-weave/feature/feature-i18next-definition-provider';
import {
  StatusBarManager,
  StatusBarState,
} from '@i18n-weave/feature/feature-status-bar-manager';
import { TextDocumentChangedHandler } from '@i18n-weave/feature/feature-text-document-changed-handler';
import { TranslationKeyCompletionProvider } from '@i18n-weave/feature/feature-translation-key-completion-provider';
import { TranslationKeyHoverProvider } from '@i18n-weave/feature/feature-translation-key-hover-provider';

import { TranslationStore } from '@i18n-weave/store/store-translation-store';

import {
  ConfigurationStoreManager,
  I18nextScannerModuleConfiguration,
} from '@i18n-weave/util/util-configuration';
import { FileType } from '@i18n-weave/util/util-enums';
import { isProduction } from '@i18n-weave/util/util-environment-utilities';
import { LogLevel, Logger } from '@i18n-weave/util/util-logger';
import { FileSearchLocation } from '@i18n-weave/util/util-types';

const publisherExtensionName = 'qvotaxon.i18nWeave';
const extensionName = 'i18nWeave';
const extensionStacktraceFrameFilters = [
  extensionName,
  extensionName.toLowerCase(),
  publisherExtensionName,
  publisherExtensionName.toLowerCase(),
  `${extensionName}-vscode`,
  `${extensionName}-vscode`.toLowerCase(),
];

function initializeSentry() {
  const i18nWeaveExtension = vscode.extensions.getExtension(
    publisherExtensionName
  )!;
  const installationId = vscode.env.machineId;

  Sentry.init({
    enabled:
      isProduction() &&
      process.env.SENTRY_ENABLED === 'true' &&
      vscode.env.isTelemetryEnabled,
    dsn: 'https://188de1d08857e4d1a5e59d8a9da5da1a@o4507423909216256.ingest.de.sentry.io/4507431475019856',
    integrations: Sentry.getDefaultIntegrations({}),
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
    release: i18nWeaveExtension.packageJSON.version,
    beforeSend(event) {
      if (
        event.exception?.values?.some(value =>
          value.stacktrace?.frames?.some(
            frame =>
              frame.filename &&
              extensionStacktraceFrameFilters.some(
                filter => frame.filename && frame.filename.includes(filter)
              )
          )
        )
      ) {
        return event;
      }

      return null;
    },
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
  fileLocationInitializer: FileLocationInitializer = new FileLocationInitializer(
    context
  ),
  textDocumentOpenedHandler: ActiveTextEditorChangedHandler = new ActiveTextEditorChangedHandler(
    context
  ),
  textDocumentChangedHandler: TextDocumentChangedHandler = new TextDocumentChangedHandler()
) {
  const translationStore: TranslationStore = TranslationStore.getInstance();
  const configurationManager: ConfigurationStoreManager =
    ConfigurationStoreManager.getInstance();

  initializeSentry();

  try {
    const logger = Logger.getInstance();
    const statusBarManager = StatusBarManager.getInstance(context);
    statusBarManager.updateState(StatusBarState.Running, 'Initializing...');

    configurationManager.initialize(publisherExtensionName);
    logger.log(LogLevel.INFO, 'i18nWeave is starting up...', 'Core');

    await fileLocationInitializer.initializeFileLocations();
    await translationStore.initializeAsync();

    const onDidOpenTextDocumentDisposable =
      textDocumentOpenedHandler.initialize();

    const onDidChangeTextDocumentDisposable =
      textDocumentChangedHandler.initialize();

    const configurationWatcherDisposable =
      vscode.workspace.onDidChangeConfiguration(
        async (event: ConfigurationChangeEvent) => {
          if (!event.affectsConfiguration(extensionName)) {
            return;
          }

          configurationManager.syncConfigurationStore(publisherExtensionName);

          await reinitialize(
            fileLocationInitializer,
            fileWatcherCreator,
            context
          );
          logger.log(
            LogLevel.INFO,
            'Configuration changed, re-initializing...',
            'Core'
          );
        }
      );

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

    // -------------------------------------

    //both should be filtered on only the files we need to scan and manage

    const i18nextScannerModuleConfiguration =
      ConfigurationStoreManager.getInstance().getConfig<I18nextScannerModuleConfiguration>(
        'i18nextScannerModule'
      );
    const translationKeyCompletionProvider =
      TranslationKeyCompletionProvider.getInstance();
    const translationKeyCompletionProviderDisposable =
      vscode.languages.registerCompletionItemProvider(
        [
          { language: 'javascript', scheme: 'file' },
          { language: 'typescript', scheme: 'file' },
          { language: 'javascriptreact', scheme: 'file' }, // For .jsx files
          { language: 'typescriptreact', scheme: 'file' }, // For .tsx files
        ], // Adjust languages as needed
        translationKeyCompletionProvider,
        "'",
        '"',
        i18nextScannerModuleConfiguration.nsSeparator,
        i18nextScannerModuleConfiguration.keySeparator
      );

    const translationKeyHoverProvider =
      TranslationKeyHoverProvider.getInstance();
    const translationKeyHoverProviderDisposable =
      vscode.languages.registerHoverProvider(
        [
          { language: 'javascript', scheme: 'file' },
          { language: 'typescript', scheme: 'file' },
          { language: 'javascriptreact', scheme: 'file' }, // For .jsx files
          { language: 'typescriptreact', scheme: 'file' }, // For .tsx files
        ],
        translationKeyHoverProvider
      );

    const i18nextDefinitionProvider = I18nextDefinitionProvider.getInstance();
    const i18nextDefinitionProviderDisposable =
      vscode.languages.registerDefinitionProvider(
        [
          { language: 'javascript', scheme: 'file' },
          { language: 'typescript', scheme: 'file' },
          { language: 'javascriptreact', scheme: 'file' }, // For .jsx files
          { language: 'typescriptreact', scheme: 'file' }, // For .tsx files
        ],
        i18nextDefinitionProvider
      );

    // -------------------------------------

    context.subscriptions.push(
      ...codeFileWatchers,
      ...jsonFileWatchers,
      onDidOpenTextDocumentDisposable,
      onDidChangeTextDocumentDisposable,
      configurationWizardCommandDisposable,
      configurationWatcherDisposable,
      translationKeyCompletionProviderDisposable,
      translationKeyHoverProviderDisposable,
      i18nextDefinitionProviderDisposable
    );

    statusBarManager.updateState(StatusBarState.Idle, 'Idle');
    logger.log(LogLevel.INFO, 'i18nWeave is watching your files... 🌍', 'Core');
  } catch (error) {
    Logger.getInstance().log(
      LogLevel.ERROR,
      `Something went wrong: ${(error as Error).message}`,
      'Core'
    );
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
    FileType.Translation,
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

export async function deactivate() {
  Logger.getInstance().log(
    LogLevel.INFO,
    'i18nWeave is shutting down...',
    'Core'
  );

  Sentry.endSession();
  await Sentry.flush();
  Logger.getInstance().log(
    LogLevel.INFO,
    'Sentry session ended and flushed.',
    'Core'
  );

  StatusBarManager.disposeInstance();
  Logger.disposeInstance();
}
