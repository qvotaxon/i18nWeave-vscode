import { BaseActionModule } from '../baseActionModule';
import I18nextScannerModuleContext from './i18nextScannerModuleContext';
import I18nextScannerService from '../../services/i18nextScannerService';

/**
 * Module for handling i18next scanner execution.
 */
export default class I18nextScannerModule extends BaseActionModule {
  /**
   * Executes the i18next scanner module.
   * @param context The context for the i18next scanner module.
   */
  protected async doExecuteAsync(context: I18nextScannerModuleContext): Promise<void> {
    I18nextScannerService.getInstance().scanCode();
  }
}
