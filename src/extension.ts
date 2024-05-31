import { ExtensionContext } from 'vscode';
import FileWatcherCreator from './services/fileWatcherCreator';
import ConfigurationStoreManager from './services/configurationStoreManager';

export async function activate(context: ExtensionContext) {
  console.log('Congratulations, your extension "i18nweave" is now active!');

  const configurationStoreManager: ConfigurationStoreManager =
    new ConfigurationStoreManager();
  const fileWatcherCreator: FileWatcherCreator = new FileWatcherCreator();

  //TODO: Come up with some way of determining the glob pattern for the json files dynamically
  //The user should set the path to the most common root of their translation files
  const jsonFileGlobPattern = `**/locales/**/*.json`;

  const jsonFileWatchers =
    await fileWatcherCreator.createFileWatchersForFilesMatchingGlobAsync(
      jsonFileGlobPattern
    );

  configurationStoreManager.Initialize();

  context.subscriptions.push(...jsonFileWatchers);
}

export function deactivate() {
  // This method is called when your extension is deactivated
}
