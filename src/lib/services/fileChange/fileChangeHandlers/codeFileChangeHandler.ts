import * as Sentry from '@sentry/node';
import { Uri } from 'vscode';

import { ChainType } from '../../../enums/chainType';
import ActionModule from '../../../interfaces/actionModule';
import FileChangeHandler from '../../../interfaces/fileChangeHandler';
import ModuleContext from '../../../interfaces/moduleContext';
import I18nextScannerModule from '../../../modules/i18nextScanner/i18nextScannerModule';
import ModuleChainManager from '../../../modules/moduleChainManager';
import CodeTranslationStore from '../../../stores/codeTranslation/codeTranslationStore';
import FileLocationStore from '../../../stores/fileLocation/fileLocationStore';

export default class CodeFileChangeHandler extends FileChangeHandler {
  private static i18nextScannerModule: I18nextScannerModule;
  private static moduleChainManager: ModuleChainManager =
    new ModuleChainManager();

  private constructor(i18nextScannerModule: I18nextScannerModule) {
    super();

    CodeFileChangeHandler.i18nextScannerModule = i18nextScannerModule;
    CodeFileChangeHandler.moduleChainManager.registerChain(
      ChainType.Code,
      this.createCodeFileChain()
    );
  }

  public static create(): CodeFileChangeHandler {
    const i18nextScannerModule = new I18nextScannerModule();
    return new CodeFileChangeHandler(i18nextScannerModule);
  }

  private createCodeFileChain(): ActionModule {
    return CodeFileChangeHandler.i18nextScannerModule;
  }

  public async handleFileChangeAsync(changeFileLocation?: Uri): Promise<void> {
    await Sentry.startSpan(
      {
        op: 'codeFile.handleFileChange',
        name: 'Code File Change Handler',
      },
      async () => {
        if (!changeFileLocation) {
          return;
        }

        if (
          !(await CodeTranslationStore.getInstance().fileChangeContainsTranslationFunctionsAsync(
            changeFileLocation.fsPath
          ))
        ) {
          return;
        }

        const context: ModuleContext = {
          inputPath: changeFileLocation,
          locale: '',
          outputPath: changeFileLocation,
        };

        await CodeFileChangeHandler.moduleChainManager.executeChainAsync(
          ChainType.Code,
          context
        );

        CodeTranslationStore.getInstance().updateStoreRecordAsync(
          changeFileLocation.fsPath
        );
      }
    );
  }

  public async handleFileDeletionAsync(
    changeFileLocation?: Uri
  ): Promise<void> {
    if (!changeFileLocation) {
      return;
    }
    super.handleFileDeletionAsync(changeFileLocation);

    FileLocationStore.getInstance().deleteStoreRecord(changeFileLocation);

    CodeTranslationStore.getInstance().deleteStoreRecord(
      changeFileLocation.fsPath
    );
  }
}
