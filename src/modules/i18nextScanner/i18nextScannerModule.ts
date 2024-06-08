import ModuleContext from '../../interfaces/moduleContext';
import { BaseActionModule } from '../baseActionModule';

export default class I18nextScannerModule extends BaseActionModule {
  protected doExecuteAsync(context: ModuleContext): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
