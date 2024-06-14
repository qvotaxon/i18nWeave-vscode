import * as Sentry from '@sentry/node';
import { i18next2po } from 'gettext-converter';

import FileWriter from '../../services/fileWriter';
import { BaseActionModule } from '../baseActionModule';
import I18nextJsonToPoConversionModuleContext from './i18nextJsonToPoConversionModuleContext';

/**
 * Module for converting JSON to PO using i18next library.
 */
export default class I18nextJsonToPoConversionModule extends BaseActionModule {
  /**
   * Executes the conversion of JSON to PO.
   * @param context - The context for the conversion.
   * @returns A Promise that resolves when the conversion is complete.
   */
  protected async doExecuteAsync(
    context: I18nextJsonToPoConversionModuleContext
  ): Promise<void> {
    await Sentry.startSpan(
      {
        op: 'json.convertJsonToPo',
        name: 'JSON to PO Conversion Module',
      },
      async () => {
        console.log(
          `Converting json to po using : ${context.inputPath.fsPath}`
        );
        if (context.jsonContent) {
          const res = i18next2po(context.locale, context.jsonContent, {
            compatibilityJSON: 'v3',
          });
          await FileWriter.writeToFileAsync(context.outputPath, res);
        }
      }
    );
  }
}
