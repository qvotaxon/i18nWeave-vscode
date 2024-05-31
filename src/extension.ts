import { ExtensionContext } from 'vscode';
import FileWatcherCreator from './services/fileWatcherCreator';
import ConfigurationStoreManager from './services/configurationStoreManager';
import DebuggingConfiguration from './entities/configuration/debugging/debuggingConfiguration';
import I18nextJsonToPoConversionModuleConfiguration from './entities/configuration/modules/I18nextJsonToPoConversionModule/i18nextJsonToPoConversionModuleConfiguration';
import TranslationModuleConfiguration from './entities/configuration/modules/translationModule/translationModuleConfiguration';

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

  // Example code for using options pattern.
  setInterval(() => {
    try {
      const translationModuleOptions =
        configurationStoreManager.getConfig<TranslationModuleConfiguration>(
          'translationModule'
        );
      const debuggingOptions =
        configurationStoreManager.getConfig<DebuggingConfiguration>(
          'debugging'
        );
      const i18nextJsonToPoConversionModuleOptions =
        configurationStoreManager.getConfig<I18nextJsonToPoConversionModuleConfiguration>(
          'i18nextJsonToPoConversionModule'
        );

      const test = translationModuleOptions.deepL?.formality;
      const test2 = translationModuleOptions.deepL?.apiKey;
      const test3 = translationModuleOptions.deepL?.preserveFormatting;
      const test4 = debuggingOptions.logging?.enableVerboseLogging;
      const test5 = i18nextJsonToPoConversionModuleOptions.enabled;

      console.log('yup, still running...');
    } catch (error) {
      console.error(error);
    }
  }, 5000);

  context.subscriptions.push(...jsonFileWatchers);
}

export function deactivate() {
  // This method is called when your extension is deactivated
}
