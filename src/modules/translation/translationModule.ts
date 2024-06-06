import { BaseActionModule } from '../baseActionModule';
import { TranslationModuleContext } from './translationModuleContext';

export default class TranslationModule extends BaseActionModule {
  protected async doExecute(context: TranslationModuleContext): Promise<void> {
    if (context.jsonContent) {
      const translatedJsonContent = {
        dummy: {
          translations: {
            test: 'test',
          },
        },
      };

      context.jsonContent = translatedJsonContent;
    }
  }
}
