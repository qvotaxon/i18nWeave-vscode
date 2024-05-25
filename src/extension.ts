import { ExtensionContext, commands, window } from 'vscode';
import FileWatcherCreator from './services/fileWatcherCreator';

export async function activate(context: ExtensionContext) {
  console.log('Congratulations, your extension "i18nweave" is now active!');

  const fileWatcherCreator: FileWatcherCreator = new FileWatcherCreator();

  //TODO: Come up with some way of determining the glob pattern for the json files dynamically
  //The user should set the path to the most common root of their translation files
  const jsonFileGlobPattern = `**/locales/**/*.json`;

  const jsonFileWatchers =
    await fileWatcherCreator.createFileWatcherForEachFileInGlobAsync(
      jsonFileGlobPattern
      // fileLockManager.isMasterLockEnabled
    );
  context.subscriptions.push(...jsonFileWatchers);
}

export function deactivate() {
  // This method is called when your extension is deactivated
}
