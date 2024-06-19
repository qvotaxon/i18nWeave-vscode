import * as Sentry from '@sentry/node';
import { ExtensionContext } from 'vscode';

import FileWatcherCreator from './lib/services/fileChange/fileWatcherCreator';
import ConfigurationStoreManager from './lib/stores/configuration/configurationStoreManager';
import FileContentStore from './lib/stores/fileContent/fileContentStore';

function initializeSentry() {
  Sentry.init({
    dsn: 'https://188de1d08857e4d1a5e59d8a9da5da1a@o4507423909216256.ingest.de.sentry.io/4507431475019856',
    integrations: Sentry.getDefaultIntegrations({}),
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
  });
}
initializeSentry();

export async function activate(
  context: ExtensionContext,
  fileWatcherCreator: FileWatcherCreator = new FileWatcherCreator()
) {
  console.log('i18nWeave is now active!');

  try {
    const typeScriptFileGlobPattern = '**/{apps,libs}/**/*.{tsx,ts}';
    const jsonFileGlobPattern = `**/locales/**/*.json`;
    const poFileGlobPattern = `**/locales/**/*.po`;

    await FileContentStore.getInstance().initializeInitialFileContentsAsync(
      typeScriptFileGlobPattern
    );

    const typeScriptFileWatchers = await createWatchersForPattern(
      typeScriptFileGlobPattern,
      'i18nextScannerModule',
      fileWatcherCreator
    );

    const jsonFileWatchers = await createWatchersForPattern(
      jsonFileGlobPattern,
      'i18nextJsonToPoConversionModule',
      fileWatcherCreator
    );

    const poFileWatchers = await createWatchersForPattern(
      poFileGlobPattern,
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

async function createWatchersForPattern(
  globPattern: string,
  configKey: 'i18nextScannerModule' | 'i18nextJsonToPoConversionModule',
  fileWatcherCreator: FileWatcherCreator
) {
  return await fileWatcherCreator.createFileWatchersForFilesMatchingGlobAsync(
    globPattern,
    () =>
      false ===
      ConfigurationStoreManager.getInstance().getConfig<any>(configKey).enabled
  );
}

export function deactivate() {
  // This method is called when your extension is deactivated
}
