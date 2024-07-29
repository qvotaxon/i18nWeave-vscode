import I18nextScannerModuleConfiguration from '../../entities/configuration/modules/i18nextScanner/i18nextScannerModuleConfiguration';
import I18nextScannerService from '../../services/i18nextScannerService/i18nextScannerService';
import ConfigurationStoreManager from '../../stores/configuration/configurationStoreManager';
import { BaseActionModule } from '../baseActionModule';
import I18nextScannerModuleContext from './i18next-scanner-module-context';
import {TraceMethod} from '../../decorators/methodDecorators';

/**
 * Module for handling i18next scanner execution.
 */
export default class I18nextScannerModule extends BaseActionModule {
  /**
   * Executes the i18next scanner module.
   * @param context The context for the i18next scanner module.
   */
  @TraceMethod
  protected async doExecuteAsync(
    context: I18nextScannerModuleContext
  ): Promise<void> {
    if (
      ConfigurationStoreManager.getInstance().getConfig<I18nextScannerModuleConfiguration>(
        'i18nextScannerModule'
      ).enabled
    ) {
      I18nextScannerService.getInstance().scanCode();
    }
  }
}
