import * as Sentry from '@sentry/node';
// import { Integrations } from '@sentry/tracing';
import { ExtensionContext } from 'vscode';

import ConfigurationStoreManager from './services/configurationStoreManager';
import FileWatcherCreator from './services/fileWatcherCreator';

export async function activate(
  context: ExtensionContext,
  fileWatcherCreator: FileWatcherCreator = new FileWatcherCreator()
) {
  console.log('i18nWeave is now active!');

  // Initialize Sentry for Node.js environment
  Sentry.init({
    dsn: 'https://188de1d08857e4d1a5e59d8a9da5da1a@o4507423909216256.ingest.de.sentry.io/4507431475019856',
    integrations: [
      // nodeProfilingIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0, //  Capture 100% of the transactions

    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: 1.0,
  });
  const typeScriptFileGlobPattern = '**/{apps,libs}/**/*.{tsx,ts}';
  const jsonFileGlobPattern = `**/locales/**/*.json`;
  const poFileGlobPattern = `**/locales/**/*.po`;

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
