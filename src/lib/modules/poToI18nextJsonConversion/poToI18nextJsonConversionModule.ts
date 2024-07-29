import { po2i18next } from 'gettext-converter';
import stringify from 'json-stable-stringify';

import I18nextJsonToPoConversionModuleConfiguration from '../../entities/configuration/modules/I18nextJsonToPoConversionModule/i18nextJsonToPoConversionModuleConfiguration';
import FileWriter from '../../services/fileIo/fileWriter';
import ConfigurationStoreManager from '../../../libs/store/store-configuration-store-manager/src/lib/configuration-store-manager';
import { BaseActionModule } from '../baseActionModule';
import PoToI18nextJsonConversionModuleContext from './poToI18nextJsonConversionModuleContext';
import {TraceMethod} from '../../decorators/methodDecorators';

/**
 * Module for converting PO to JSON using i18next library.
 */
export default class PoToI18nextJsonConversionModule extends BaseActionModule {
  private temporarilyDisabled = true;

  /**
   * Executes the conversion of PO to JSON.
   * @param context - The context for the conversion.
   * @returns A Promise that resolves when the conversion is complete.
   */
  @TraceMethod
  protected async doExecuteAsync(
    context: PoToI18nextJsonConversionModuleContext
  ): Promise<void> {
    if (
      !this.temporarilyDisabled &&
      ConfigurationStoreManager.getInstance().getConfig<I18nextJsonToPoConversionModuleConfiguration>(
        'i18nextJsonToPoConversionModule'
      ).enabled
    ) {
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
  }
}
