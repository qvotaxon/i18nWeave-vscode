import * as Sentry from '@sentry/node';
import { i18next2po } from 'gettext-converter';

import { I18nextJsonToPoConversionModuleConfiguration, ConfigurationStoreManager } from '@i18n-weave/util/util-configuration';
import FileWriter from '../../services/fileIo/fileWriter';
import { BaseActionModule } from '../baseActionModule';
import I18nextJsonToPoConversionModuleContext from './i18nextJsonToPoConversionModuleContext';
import { TraceMethod } from '@i18n-weave/util/util-decorators';

/**
 * Module for converting JSON to PO using i18next library.
 */
export default class I18nextJsonToPoConversionModule extends BaseActionModule {
  private temporarilyDisabled = true;

  /**
   * Executes the conversion of JSON to PO.
   * @param context - The context for the conversion.
   * @returns A Promise that resolves when the conversion is complete.
   */
  @TraceMethod
  protected async doExecuteAsync(
    context: I18nextJsonToPoConversionModuleContext
  ): Promise<void> {
    if (
      !this.temporarilyDisabled &&
      ConfigurationStoreManager.getInstance().getConfig<I18nextJsonToPoConversionModuleConfiguration>(
        'i18nextJsonToPoConversionModule'
      ).enabled
    ) {
      console.log(
        `Converting json to po using : ${context.inputPath.fsPath}`
      );
      if (context.jsonContent) {
        try {
          const res = i18next2po(context.locale, context.jsonContent, {
            compatibilityJSON: 'v3',
          });
          await FileWriter.writeToFileAsync(context.outputPath, res);
        } catch (error) {
          if (error instanceof SyntaxError) {
            Sentry.captureException(error);
          } else {
            Sentry.captureException(error, { extra: { context } });
          }
        }
      }
    }
  }
}
