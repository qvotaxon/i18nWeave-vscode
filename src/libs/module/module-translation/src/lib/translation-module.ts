import { BaseActionModule } from '@i18n-weave/module/module-base-action';

import { TranslationService } from '@i18n-weave/feature/feature-translation-service';

import {
  ConfigurationStoreManager,
  GeneralConfiguration,
  TranslationModuleConfiguration,
} from '@i18n-weave/util/util-configuration';

import { TranslationModuleContext } from './translation-module-context';

export class TranslationModule extends BaseActionModule {
  protected async doExecuteAsync(
    context: TranslationModuleContext
  ): Promise<void> {
    if (
      ConfigurationStoreManager.getInstance().getConfig<GeneralConfiguration>(
        'general'
      ).betaFeaturesConfiguration.enableTranslationModule
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
