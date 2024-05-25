import { BaseActionModule } from '../baseActionModule';
import { TranslationModuleContext } from './translationModuleContext';

export class TranslationModule extends BaseActionModule {
  protected async doExecute(context: TranslationModuleContext): Promise<void> {
    console.log(`Translating missing keys in: ${context.fileUri.fsPath}`);
    if (context.jsonContent) {
      const translations = {};
    }
  }
}
