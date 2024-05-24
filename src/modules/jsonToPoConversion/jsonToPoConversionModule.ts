import { BaseActionModule } from '../baseActionModule';
import { JsonToPoConversionModuleContext } from './jsonToPoConversionModuleContext';

export class JsonToPoConversionModule extends BaseActionModule {
  protected doExecute(context: JsonToPoConversionModuleContext): void {
    console.log(`Converting json to po using : ${context.fileUri.fsPath}`);
    if (context.jsonContent) {
      const translations = {};
    }
  }
}
