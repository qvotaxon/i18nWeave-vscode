import assert from 'assert';
import vscode from 'vscode';
import sinon from 'sinon';
import I18nextScannerModule from '../../modules/i18nextScanner/i18nextScannerModule';
import ModuleChainManager from '../../modules/moduleChainManager';
import { ChainType } from '../../enums/chainType';
import TypeScriptFileChangeHandler from '../../fileChangeHandlers/typeScriptFileChangeHandler';
import ModuleContext from '../../interfaces/moduleContext';
import ConfigurationStoreManager from '../../services/configurationStoreManager';
import GeneralConfiguration from '../../entities/configuration/general/generalConfiguration';

suite('TypeScriptFileChangeHandler', () => {
  let i18nextScannerModuleStub: sinon.SinonStubbedInstance<I18nextScannerModule>;
  let moduleChainManagerStub: sinon.SinonStubbedInstance<ModuleChainManager>;
  let handler: TypeScriptFileChangeHandler;
  let getConfigStub: sinon.SinonStub;

  setup(() => {
    i18nextScannerModuleStub = sinon.createStubInstance(I18nextScannerModule);
    moduleChainManagerStub = sinon.createStubInstance(ModuleChainManager);
    handler = TypeScriptFileChangeHandler.create();

    const pathsConfiguration = {
      packageJsonAbsoluteFolderPath: 'some/path',
    } as GeneralConfiguration['pathsConfiguration'];
    getConfigStub = sinon.stub(
      ConfigurationStoreManager.getInstance(),
      'getConfig'
    ).returns({ pathsConfiguration });;
  });

  teardown(() => {
    sinon.restore();
  });

  suite('create', () => {
    test('should create an instance of TypeScriptFileChangeHandler', () => {
      const instance = TypeScriptFileChangeHandler.create();
      assert(instance instanceof TypeScriptFileChangeHandler);
    });
  });

  suite('handleFileChangeAsync', () => {
    test('should not execute chain if changeFileLocation is undefined', async () => {
      const executeChainStub = moduleChainManagerStub.executeChainAsync as sinon.SinonStub;
      await handler.handleFileChangeAsync(undefined);
      sinon.assert.notCalled(executeChainStub);
    });

    test('should execute chain if changeFileLocation is provided', async () => {
      const executeChainStub = moduleChainManagerStub.executeChainAsync as sinon.SinonStub;
      const uri = vscode.Uri.file('path/to/file.ts');

      await handler.handleFileChangeAsync(uri);

      const expectedContext: ModuleContext = {
        inputPath: uri,
        locale: '',
        outputPath: uri,
      };

      executeChainStub.calledOnceWithExactly(
        ChainType.TypeScript,
        expectedContext
      );
    });
  });
});
