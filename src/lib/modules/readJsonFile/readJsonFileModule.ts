import * as Sentry from '@sentry/node';

import FileReader from '../../services/fileIo/fileReader';
import { BaseActionModule } from '../baseActionModule';
import { ReadJsonFileModuleContext } from './readJsonFileModuleContext';

/**
 * Module for reading JSON files.
 */
export default class ReadJsonFileModule extends BaseActionModule {
  /**
   * Executes the readJsonFile module.
   * Reads the contents of a JSON file and assigns it to the `jsonContent` property of the context.
   * @param context The context object for the readJsonFile module.
   * @returns A Promise that resolves when the execution is complete.
   */
  protected async doExecuteAsync(
    context: ReadJsonFileModuleContext
  ): Promise<void> {
    await Sentry.startSpan(
      {
        op: 'json.readJsonFile',
        name: 'Read Json File Module',
      },
      async () => {
        console.log(`Reading Json file contents: ${context.inputPath.fsPath}`);

        const jsonContent = await FileReader.readFileAsync(
          context.inputPath.fsPath
        );

        if (jsonContent) {
          context.jsonContent = jsonContent;
        }
      }
    );
  }
}
