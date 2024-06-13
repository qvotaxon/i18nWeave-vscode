import Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { ExtensionContext } from 'vscode';

import ConfigurationStoreManager from './services/configurationStoreManager';
import FileWatcherCreator from './services/fileWatcherCreator';

export async function activate(
  context: ExtensionContext,
  fileWatcherCreator: FileWatcherCreator = new FileWatcherCreator()
) {
  console.log('i18nWeave is now active!');

  Sentry.init({
    dsn: 'https://ab1a5dba41e42eb2f3b2c32b4432da37@o4507423909216256.ingest.de.sentry.io/4507426153955408',
    integrations: [nodeProfilingIntegration()],
    // Performance Monitoring
    tracesSampleRate: 1.0, //  Capture 100% of the transactions

    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: 1.0,
  });

  Sentry.startSpan(
    {
      op: 'test',
      name: 'My First Test Span',
    },
    () => {
      try {
        throw new Error('This is a test error');
      } catch (e) {
        Sentry.captureException(e);
      }
    }
  );

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
