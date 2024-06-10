import { BaseActionModule } from '../baseActionModule';
import I18nextScannerModuleContext from './i18nextScannerModuleContext';
import I18nextScannerService from '../../services/i18nextScannerService';
import ConfigurationStoreManager from '../../services/configurationStoreManager';

export default class I18nextScannerModule extends BaseActionModule {
  protected async doExecuteAsync(
    context: I18nextScannerModuleContext
  ): Promise<void> {
    await I18nextScannerService.getInstance().scanCode();
  }
}
