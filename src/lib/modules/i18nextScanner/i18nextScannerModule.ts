import * as Sentry from '@sentry/node';

import I18nextScannerModuleConfiguration from '../../entities/configuration/modules/i18nextScanner/i18nextScannerModuleConfiguration';
import I18nextScannerService from '../../services/i18nextScannerService/i18nextScannerService';
import ConfigurationStoreManager from '../../stores/configuration/configurationStoreManager';
import { BaseActionModule } from '../baseActionModule';
import I18nextScannerModuleContext from './i18nextScannerModuleContext';

/**
 * Module for handling i18next scanner execution.
 */
export default class I18nextScannerModule extends BaseActionModule {
  /**
   * Executes the i18next scanner module.
   * @param context The context for the i18next scanner module.
   */
  protected async doExecuteAsync(
    context: I18nextScannerModuleContext
  ): Promise<void> {
    if (
      ConfigurationStoreManager.getInstance().getConfig<I18nextScannerModuleConfiguration>(
        'i18nextScannerModule'
      ).enabled
    ) {
      await Sentry.startSpan(
        {
          op: 'typeScript.scanCodeFori18next',
          name: 'TypeScript i18next Scanner Module',
        },
        async () => {
          I18nextScannerService.getInstance().scanCode();
        }
      );
    }
  }
}
