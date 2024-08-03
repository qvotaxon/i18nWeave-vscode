import { TranslationService } from '@i18n-weave/feature/feature-translation-service';
import { BaseActionModule } from '@i18n-weave/module/module-base-action';
import { TranslationModuleContext } from '@i18n-weave/module/module-translation';
import {
  ConfigurationStoreManager,
  TranslationModuleConfiguration,
} from '@i18n-weave/util/util-configuration';

export class TranslationModule extends BaseActionModule {
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
