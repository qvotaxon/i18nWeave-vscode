import { TranslationModuleConfiguration } from '@i18n-weave/util/util-configuration';
import { ConfigurationStoreManager } from '@i18n-weave/util/util-configuration';

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
