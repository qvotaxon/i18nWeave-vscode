import { BaseActionModule } from '../baseActionModule';
import { TranslationModuleContext } from './translationModuleContext';

export default class TranslationModule extends BaseActionModule {
  protected async doExecuteAsync(
    context: TranslationModuleContext
  ): Promise<void> {
    if (context.jsonContent) {
      const translatedJsonContent = context.jsonContent;

      context.jsonContent = translatedJsonContent;
    }
  }
}
