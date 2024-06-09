import { ExtensionContext } from 'vscode';
import FileWatcherCreator from './services/fileWatcherCreator';
import ConfigurationStoreManager from './services/configurationStoreManager';
import I18nextJsonToPoConversionModuleConfiguration from './entities/configuration/modules/I18nextJsonToPoConversionModule/i18nextJsonToPoConversionModuleConfiguration';
import I18nextScannerModuleConfiguration from './entities/configuration/modules/i18nextScanner/i18nextScannerModuleConfiguration';

export async function activate(
  context: ExtensionContext,
  fileWatcherCreator: FileWatcherCreator = new FileWatcherCreator()
) {
  console.log('i18nWeave is now active!');

  const typeScriptFileGlobPattern = '**/{apps,libs}/**/*.{tsx,ts}';
  const jsonFileGlobPattern = `**/locales/**/*.json`;
  const poFileGlobPattern = `**/locales/**/*.po`;

  const typeScriptFileWatchers =
    await fileWatcherCreator.createFileWatchersForFilesMatchingGlobAsync(
      typeScriptFileGlobPattern,
      () =>
        false ===
        ConfigurationStoreManager.getInstance().getConfig<I18nextScannerModuleConfiguration>(
          'i18nextScannerModule'
        ).enabled
    );

  const jsonFileWatchers =
    await fileWatcherCreator.createFileWatchersForFilesMatchingGlobAsync(
      jsonFileGlobPattern,
      () =>
        false ===
        ConfigurationStoreManager.getInstance().getConfig<I18nextJsonToPoConversionModuleConfiguration>(
          'i18nextJsonToPoConversionModule'
        ).enabled
    );

  const poFileWatchers =
    await fileWatcherCreator.createFileWatchersForFilesMatchingGlobAsync(
      poFileGlobPattern,
      () =>
        false ===
        ConfigurationStoreManager.getInstance().getConfig<I18nextJsonToPoConversionModuleConfiguration>(
          'i18nextJsonToPoConversionModule'
        ).enabled
    );

  ConfigurationStoreManager.getInstance().initialize();

  context.subscriptions.push(
    ...typeScriptFileWatchers,
    ...jsonFileWatchers,
    ...poFileWatchers
  );
}

export function deactivate() {
  // This method is called when your extension is deactivated
}
