import TranslationModuleConfiguration from '../../entities/configuration/modules/translationModule/translationModuleConfiguration';
import ConfigurationStoreManager from '../../services/configurationStoreManager';
import TranslationService from '../../services/translationService';
import { BaseActionModule } from '../baseActionModule';
import { TranslationModuleContext } from './translationModuleContext';

export default class TranslationModule extends BaseActionModule {
  protected async doExecuteAsync(
    context: TranslationModuleContext
  ): Promise<void> {
    if (
      ConfigurationStoreManager.getInstance().getConfig<TranslationModuleConfiguration>(
        'translationModule'
      ).enabled
    ) {
      if (context.jsonContent) {
        TranslationService.getInstance().translateOtherI18nFiles(
          context.inputPath.fsPath,
          context.jsonContent
        );
      }
    }
  }
}
