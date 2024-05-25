import { BaseActionModule } from '../baseActionModule';
import { I18nextJsonToPoConversionModuleContext } from './i18nextJsonToPoConversionModuleContext';

export class I18nextJsonToPoConversionModule extends BaseActionModule {
  protected async doExecute(
    context: I18nextJsonToPoConversionModuleContext
  ): Promise<void> {
    console.log(`Converting json to po using : ${context.fileUri.fsPath}`);

    //   const { poOutputPath, locale } =
    //   FileManagement.extractParts(changeFileLocation);
    // const json = await FileUtilities.readFileContentsAsync(changeFileLocation);
    // const res = i18next2po(locale, json, { compatibilityJSON: 'v3' });

    if (context.jsonContent) {
      const translations = {};
    }
  }
}
