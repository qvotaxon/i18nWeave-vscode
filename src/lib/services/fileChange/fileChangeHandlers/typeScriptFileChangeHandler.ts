import * as Sentry from '@sentry/node';
import { Uri } from 'vscode';

import { ChainType } from '../../../enums/chainType';
import ActionModule from '../../../interfaces/actionModule';
import FileChangeHandler from '../../../interfaces/fileChangeHandler';
import ModuleContext from '../../../interfaces/moduleContext';
import I18nextScannerModule from '../../../modules/i18nextScanner/i18nextScannerModule';
import ModuleChainManager from '../../../modules/moduleChainManager';
import FileContentStore from '../../../stores/fileContent/fileContentStore';

export default class TypeScriptFileChangeHandler implements FileChangeHandler {
  private static i18nextScannerModule: I18nextScannerModule;
  private static moduleChainManager: ModuleChainManager =
    new ModuleChainManager();

  private constructor(i18nextScannerModule: I18nextScannerModule) {
    TypeScriptFileChangeHandler.i18nextScannerModule = i18nextScannerModule;
    TypeScriptFileChangeHandler.moduleChainManager.registerChain(
      ChainType.TypeScript,
      this.createTypeScriptChain()
    );
  }

  public static create(): TypeScriptFileChangeHandler {
    const i18nextScannerModule = new I18nextScannerModule();
    return new TypeScriptFileChangeHandler(i18nextScannerModule);
  }

  private createTypeScriptChain(): ActionModule {
    return TypeScriptFileChangeHandler.i18nextScannerModule;
  }

  public async handleFileChangeAsync(changeFileLocation?: Uri): Promise<void> {
    await Sentry.startSpan(
      {
        op: 'typeScript.handleFileChange',
        name: 'TypeScript File Change Handler',
      },
      async () => {
        if (!changeFileLocation) {
          return;
        }

        FileContentStore.updateCurrentFileContents(changeFileLocation.fsPath);

        if (
          !FileContentStore.fileChangeContainsTranslationKeys(
            changeFileLocation.fsPath
          )
        ) {
          return;
        }

        const context: ModuleContext = {
          inputPath: changeFileLocation,
          locale: '',
          outputPath: changeFileLocation,
        };

        await TypeScriptFileChangeHandler.moduleChainManager.executeChainAsync(
          ChainType.TypeScript,
          context
        );

        FileContentStore.storeFileState(changeFileLocation.fsPath);
      }
    );
  }
}
