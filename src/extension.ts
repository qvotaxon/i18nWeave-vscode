import { ExtensionContext } from 'vscode';
import FileWatcherCreator from './services/fileWatcherCreator';
import ConfigurationStoreManager from './services/configurationStoreManager';
import I18nextJsonToPoConversionModuleConfiguration from './entities/configuration/modules/I18nextJsonToPoConversionModule/i18nextJsonToPoConversionModuleConfiguration';

export async function activate(context: ExtensionContext) {
  console.log('Congratulations, your extension "i18nweave" is now active!');

  const configurationStoreManager: ConfigurationStoreManager =
    new ConfigurationStoreManager();
  const fileWatcherCreator: FileWatcherCreator = new FileWatcherCreator();

  //TODO: Come up with some way of determining the glob pattern for the json files dynamically
  //The user should set the path to the most common root of their translation files
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

  configurationStoreManager.Initialize();

  context.subscriptions.push(...jsonFileWatchers, ...poFileWatchers);
}

export function deactivate() {
  // This method is called when your extension is deactivated
}
