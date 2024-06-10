import { ExtensionContext } from 'vscode';
import FileWatcherCreator from './services/fileWatcherCreator';
import ConfigurationStoreManager from './services/configurationStoreManager';

export async function activate(
  context: ExtensionContext,
  fileWatcherCreator: FileWatcherCreator = new FileWatcherCreator()
) {
  console.log('i18nWeave is now active!');

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
    () => false === ConfigurationStoreManager.getInstance().getConfig<any>(configKey).enabled
  );
}

export function deactivate() {
  // This method is called when your extension is deactivated
}
