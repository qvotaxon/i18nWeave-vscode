// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ActionModule } from './interfaces/actionModule';
import { TranslationModule } from './modules/translation/translationModule';
import { ModuleChainManager } from './modules/moduleChainManager';
import { ModuleContext } from './interfaces/moduleContext';
import { I18nextJsonToPoConversionModule } from './modules/i18nextJsonToPoConversion/i18nextJsonToPoConversionModule';
import { ChainType } from './enums/chainType';
import { ReadJsonFileModule } from './modules/readJsonFile/readJsonFileModule';

export function activate(context: vscode.ExtensionContext) {
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

  const jsonFileWatcher = vscode.workspace
    .createFileSystemWatcher(
      'c:/Users/j.vervloed/RGF/USG Portals React Web/portals-web/public/**/*.json'
    )
    .onDidChange((uri) => {
      const context: ModuleContext = { fileUri: uri };
      moduleChainManager.executeChain(ChainType.Json, context);
    });

  let disposable = vscode.commands.registerCommand(
    'i18nweave.helloWorld',
    () => {
      vscode.window.showInformationMessage('Hello World from i18nWeave!');
    }
  );

  context.subscriptions.push(disposable, jsonFileWatcher);
}

export function deactivate() {
  // This method is called when your extension is deactivated
}
