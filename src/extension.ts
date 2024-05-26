import { ExtensionContext } from 'vscode';
import FileWatcherCreator from './services/fileWatcherCreator';
import ConfigurationStore from './services/configurationStore';

export async function activate(context: ExtensionContext) {
  console.log('Congratulations, your extension "i18nweave" is now active!');

  const configurationStore: ConfigurationStore = new ConfigurationStore();
  const fileWatcherCreator: FileWatcherCreator = new FileWatcherCreator();

  //TODO: Come up with some way of determining the glob pattern for the json files dynamically
  //The user should set the path to the most common root of their translation files
  const jsonFileGlobPattern = `**/locales/**/*.json`;

  const jsonFileWatchers =
    await fileWatcherCreator.createFileWatchersForFilesMatchingGlobAsync(
      jsonFileGlobPattern
    );

  configurationStore.Initialize();

  // Example code for using options pattern.
  // setInterval(() => {
  //   const translationModuleOptions =
  //     configurationStore.Get<TranslationModuleOptions>('translationModule');
  //   const debuggingOptions =
  //     configurationStore.Get<DebuggingOptions>('debugging');
  //   const i18nextJsonToPoConversionModuleOptions =
  //     configurationStore.Get<I18nextJsonToPoConversionModuleOptions>(
  //       'i18nextJsonToPoConversionModule'
  //     );
  //   console.log('yup, still running...');
  // }, 5000);

  context.subscriptions.push(...jsonFileWatchers);
}

export function deactivate() {
  // This method is called when your extension is deactivated
}
