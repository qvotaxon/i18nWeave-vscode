import * as Sentry from '@sentry/node';

import I18nextScannerService from '../../services/i18nextScannerService/i18nextScannerService';
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
