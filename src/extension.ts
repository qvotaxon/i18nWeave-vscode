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

    await initializeFileLocations();

    const onDidOpenTextDocumentDisposable =
      await createWebViewForFilesMatchingPattern(webviewService);

    const configurationWatcherDisposable =
      vscode.workspace.onDidChangeConfiguration(async () => {
        ConfigurationStoreManager.getInstance().syncConfigurationStore();

        await reinitialize(fileWatcherCreator, context);
      });

    const { typeScriptFileWatchers, jsonFileWatchers, poFileWatchers } =
      await createFileWatchers(fileWatcherCreator);

    const configurationWizardCommandDisposable =
      await registerConfigurationWizardCommand(
        configurationWizardService,
        fileWatcherCreator,
        context
      );

    context.subscriptions.push(
      ...typeScriptFileWatchers,
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

async function initializeFileLocations() {
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

  FileContentStore.getInstance().initializeInitialFileContents();
}

async function createFileWatchers(fileWatcherCreator: FileWatcherCreator) {
  const typeScriptFileWatchers = await createWatchersForFileType(
    ConfigurationStoreManager.getInstance().getConfig<I18nextScannerModuleConfiguration>(
      'i18nextScannerModule'
    ).fileExtensions,
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

  return {
    typeScriptFileWatchers,
    jsonFileWatchers,
    poFileWatchers,
  };
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
  initializeFileLocations();

  const { typeScriptFileWatchers, jsonFileWatchers, poFileWatchers } =
    await createFileWatchers(fileWatcherCreator);

  context.subscriptions.push(
    ...typeScriptFileWatchers,
    ...jsonFileWatchers,
    ...poFileWatchers
  );
}

export function deactivate() {
  // This method is called when your extension is deactivated
}
