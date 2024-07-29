import ConfigurationStoreManager from '../../../libs/store/store-configuration-store-manager/src/lib/configuration-store-manager';
import TranslationModuleConfiguration from '../../entities/configuration/modules/translationModule/translationModuleConfiguration';
import TranslationService from '../../services/translate/translationService';
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
        TranslationService.getInstance(
          this.extensionContext
        ).translateOtherI18nFiles(
          context.inputPath.fsPath,
          context.jsonContent
        );
      }
    }
  }
}
