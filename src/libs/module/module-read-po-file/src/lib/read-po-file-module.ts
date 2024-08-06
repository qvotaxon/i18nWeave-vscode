import { BaseActionModule } from '@i18n-weave/module/module-base-action';

import { FileReader } from '@i18n-weave/file-io/file-io-file-reader';

import { ReadPoFileModuleContext } from './read-po-file-module-context';

/**
 * Module for reading PO files.
 */
export class ReadPoFileModule extends BaseActionModule {
  /**
   * Executes the readPoFile module.
   * Reads the contents of a PO file and assigns it to the `poContent` property of the context.
   * @param context The context object for the readPoFile module.
   * @returns A Promise that resolves when the execution is complete.
   */
  protected async doExecuteAsync(
    context: ReadPoFileModuleContext
  ): Promise<void> {
    console.log(`Reading PO file contents: ${context.inputPath.fsPath}`);

    const poContent = await FileReader.readFileAsync(context.inputPath.fsPath);

    if (poContent) {
      context.poContent = poContent;
    }
  }
}
