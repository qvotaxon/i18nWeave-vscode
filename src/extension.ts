import { ExtensionContext } from 'vscode';
import FileWatcherCreator from './services/fileWatcherCreator';
import ConfigurationStoreManager from './services/configurationStoreManager';
import I18nextJsonToPoConversionModuleConfiguration from './entities/configuration/modules/I18nextJsonToPoConversionModule/i18nextJsonToPoConversionModuleConfiguration';

export async function activate(
  context: ExtensionContext,
  configurationStoreManager: ConfigurationStoreManager = new ConfigurationStoreManager(),
  fileWatcherCreator: FileWatcherCreator = new FileWatcherCreator()
) {
  console.log('i18nWeave is now active!');

  const jsonFileGlobPattern = `**/locales/**/*.json`;
  const poFileGlobPattern = `**/locales/**/*.po`;

  const jsonFileWatchers =
    await fileWatcherCreator.createFileWatchersForFilesMatchingGlobAsync(
      jsonFileGlobPattern,
      () =>
        false ===
        configurationStoreManager.getConfig<I18nextJsonToPoConversionModuleConfiguration>(
          'i18nextJsonToPoConversionModule'
        ).enabled
    );

  const poFileWatchers =
    await fileWatcherCreator.createFileWatchersForFilesMatchingGlobAsync(
      poFileGlobPattern,
      () =>
        false ===
        configurationStoreManager.getConfig<I18nextJsonToPoConversionModuleConfiguration>(
          'i18nextJsonToPoConversionModule'
        ).enabled
    );

  configurationStoreManager.initialize();

  context.subscriptions.push(...jsonFileWatchers, ...poFileWatchers);
}

export function deactivate() {
  // This method is called when your extension is deactivated
}
