import { I18nextScannerModuleConfiguration } from '../../entities/configuration/modules/i18nextScanner/i18nextScannerModuleConfiguration';
import { I18nextScannerService } from '@i18n-weave/feature/feature-i18next-scanner-service';
import { ConfigurationStoreManager } from 'src/libs/util/util-configuration/src/lib/store-configuration-store-manager/src';
import { BaseActionModule } from '../baseActionModule';
import I18nextScannerModuleContext from './i18next-scanner-module-context';
import { TraceMethod } from '@i18n-weave/util/util-decorators';

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
