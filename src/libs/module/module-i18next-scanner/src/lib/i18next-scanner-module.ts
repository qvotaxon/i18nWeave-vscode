import { BaseActionModule } from '@i18n-weave/module/module-base-action';

import { I18nextScannerService } from '@i18n-weave/feature/feature-i18next-scanner-service';

import {
  ConfigurationStoreManager,
  I18nextScannerModuleConfiguration,
} from '@i18n-weave/util/util-configuration';
import { TraceMethod } from '@i18n-weave/util/util-decorators';

import I18nextScannerModuleContext from './i18next-scanner-module-context';

/**
 * Module for handling i18next scanner execution.
 */
export class I18nextScannerModule extends BaseActionModule {
  /**
   * Executes the i18next scanner module.
   * @param context The context for the i18next scanner module.
   */
  @TraceMethod
  protected async doExecuteAsync(
    _: I18nextScannerModuleContext
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
