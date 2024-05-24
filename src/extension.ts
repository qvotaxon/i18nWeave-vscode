// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ActionModule } from './interfaces/actionModule';
import { TranslationModule } from './modules/translation/translationModule';
import { ModuleChainManager } from './modules/moduleChainManager';
import { ModuleContext } from './interfaces/moduleContext';
import { JsonToPoConversionModule } from './modules/jsonToPoConversion/jsonToPoConversionModule';
import { ChainType } from './enums/chainType';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "i18nweave" is now active!');

  const moduleChainManager = new ModuleChainManager();

  function createJsonChain(): ActionModule {
    const translateModule = new TranslationModule();

    const config = vscode.workspace.getConfiguration('i18nWeave');
    if (config.get('enableJsonToPoConversion')) {
      const convertModule = new JsonToPoConversionModule();
      translateModule.setNext(convertModule);
    }

    return translateModule;
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

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    'i18nweave.helloWorld',
    () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      vscode.window.showInformationMessage('Hello World from i18nWeave!');
    }
  );

  context.subscriptions.push(disposable, jsonFileWatcher);
}

// This method is called when your extension is deactivated
export function deactivate() {}
