import { BaseActionModule } from '../baseActionModule';
import { TranslationModuleContext } from './translationModuleContext';

export default class TranslationModule extends BaseActionModule {
  protected async doExecute(context: TranslationModuleContext): Promise<void> {
    console.log(`Translating missing keys in: ${context.inputPath.fsPath}`);
    if (context.jsonContent) {
      const translations = {};
    }
  }
}
