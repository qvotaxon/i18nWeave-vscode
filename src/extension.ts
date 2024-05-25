// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

import { ExtensionContext, workspace, commands, window } from 'vscode';
import { ChainType } from './enums/chainType';
import ActionModule from './interfaces/actionModule';
import ModuleContext from './interfaces/moduleContext';
import I18nextJsonToPoConversionModule from './modules/i18nextJsonToPoConversion/i18nextJsonToPoConversionModule';
import ModuleChainManager from './modules/moduleChainManager';
import ReadJsonFileModule from './modules/readJsonFile/readJsonFileModule';
import TranslationModule from './modules/translation/translationModule';
import FilePathProcessor from './services/filePathProcessor';

export function activate(context: ExtensionContext) {
  console.log('Congratulations, your extension "i18nweave" is now active!');

  const moduleChainManager = new ModuleChainManager();

  function createJsonChain(): ActionModule {
    const readJsonFileModule = new ReadJsonFileModule();
    const translationModule = new TranslationModule();
    const i18nextJsonToPoConversionModule =
      new I18nextJsonToPoConversionModule();

    readJsonFileModule.setNext(translationModule);
    translationModule.setNext(i18nextJsonToPoConversionModule);

    return readJsonFileModule;
  }

  moduleChainManager.registerChain(ChainType.Json, createJsonChain());

  const jsonFileWatcher = workspace
    .createFileSystemWatcher(
      'c:/Users/j.vervloed/RGF/USG Portals React Web/portals-web/public/**/*.json'
    )
    .onDidChange((uri) => {
      const extractedFileParts = FilePathProcessor.processFilePath(uri.fsPath);

      const context: ModuleContext = {
        inputPath: uri,
        locale: extractedFileParts.locale,
        outputPath: extractedFileParts.outputPath,
      };
      moduleChainManager.executeChain(ChainType.Json, context);
    });

  let disposable = commands.registerCommand('i18nweave.helloWorld', () => {
    window.showInformationMessage('Hello World from i18nWeave!');
  });

  context.subscriptions.push(disposable, jsonFileWatcher);
}

export function deactivate() {
  // This method is called when your extension is deactivated
}
