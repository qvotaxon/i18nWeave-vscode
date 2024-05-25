import { FileReader } from '../../services/fileReader';
import { BaseActionModule } from '../baseActionModule';
import { ReadJsonFileModuleContext } from './readJsonFileModuleContext';

export class ReadJsonFileModule extends BaseActionModule {
  protected async doExecute(context: ReadJsonFileModuleContext): Promise<void> {
    console.log(`Reading Json file contents: ${context.fileUri.fsPath}`);

    const jsonContent = await FileReader.readFileAsync(context.fileUri.fsPath);

    if (jsonContent) {
      context.jsonContent = jsonContent;
    }
  }
}
