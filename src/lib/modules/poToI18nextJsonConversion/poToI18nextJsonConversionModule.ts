import * as Sentry from '@sentry/node';
import { po2i18next } from 'gettext-converter';
import stringify from 'json-stable-stringify';

import FileWriter from '../../services/fileIo/fileWriter';
import { BaseActionModule } from '../baseActionModule';
import PoToI18nextJsonConversionModuleContext from './poToI18nextJsonConversionModuleContext';

/**
 * Module for converting PO to JSON using i18next library.
 */
export default class PoToI18nextJsonConversionModule extends BaseActionModule {
  /**
   * Executes the conversion of PO to JSON.
   * @param context - The context for the conversion.
   * @returns A Promise that resolves when the conversion is complete.
   */
  protected async doExecuteAsync(
    context: PoToI18nextJsonConversionModuleContext
  ): Promise<void> {
    await Sentry.startSpan(
      {
        op: 'po.convertPoToJson',
        name: 'PO to JSON Conversion Module',
      },
      async () => {
        console.log(
          `Converting po to json using : ${context.inputPath.fsPath}`
        );
        if (context.poContent) {
          const res = po2i18next(context.poContent, {
            compatibilityJSON: 'v3',
          });

          let jsonResult = stringify(res, {
            space: 4,
            cycles: false,
          });
          jsonResult = jsonResult + '\n';

          await FileWriter.writeToFileAsync(context.outputPath, jsonResult);
        }
      }
    );
  }
}
