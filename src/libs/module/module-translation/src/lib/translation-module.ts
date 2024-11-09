import { BaseActionModule } from '@i18n-weave/module/module-base-action';

import { TranslationService } from '@i18n-weave/feature/feature-translation-service';

import { TranslationStore } from '@i18n-weave/store/store-translation-store';

import {
  ConfigurationStoreManager,
  GeneralConfiguration,
} from '@i18n-weave/util/util-configuration';
import { LogLevel } from '@i18n-weave/util/util-logger';

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
        // TranslationService.getInstance(
        //   this.extensionContext
        // ).translateOtherI18nFiles(
        //   context.inputPath.fsPath,
        //   context.jsonContent
        // );

        const translationFileDeltas =
          TranslationStore.getInstance().getTranslationFileDeltas(
            context.inputPath.fsPath,
            context.jsonContent
          );

        TranslationStore.getInstance().updateEntry(
          context.inputPath.fsPath,
          context.jsonContent
        );

        this.logger.log(
          LogLevel.INFO,
          `Calculated diff for translation file ${context.inputPath}
        Additions: ${translationFileDeltas.additions.length}
        Deletions: ${translationFileDeltas.deletions.length}
        Updates: ${translationFileDeltas.updates.length}`
        );

        const test = translationFileDeltas.updates[0];

        this.logger.log(LogLevel.INFO, translationFileDeltas.updates[0]);
      }
    }
  }
}
