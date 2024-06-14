import * as Sentry from '@sentry/node';

import FileReader from '../../services/fileReader';
import { BaseActionModule } from '../baseActionModule';
import { ReadPoFileModuleContext } from './readPoFileModuleContext';

/**
 * Module for reading PO files.
 */
export default class ReadPoFileModule extends BaseActionModule {
  /**
   * Executes the readPoFile module.
   * Reads the contents of a PO file and assigns it to the `poContent` property of the context.
   * @param context The context object for the readPoFile module.
   * @returns A Promise that resolves when the execution is complete.
   */
  protected async doExecuteAsync(
    context: ReadPoFileModuleContext
  ): Promise<void> {
    await Sentry.startSpan(
      {
        op: 'po.readPoFile',
        name: 'Read PO File Module',
      },
      async () => {
        console.log(`Reading PO file contents: ${context.inputPath.fsPath}`);

        const poContent = await FileReader.readFileAsync(
          context.inputPath.fsPath
        );

        if (poContent) {
          context.poContent = poContent;
        }
      }
    );
  }
}
