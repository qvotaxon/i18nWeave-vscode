import assert from 'assert';
import sinon from 'sinon';
import vscode from 'vscode';

import GeneralConfiguration from '../../entities/configuration/general/generalConfiguration';
import { ChainType } from '../../enums/chainType';
import TypeScriptFileChangeHandler from '../../fileChangeHandlers/typeScriptFileChangeHandler';
import ModuleContext from '../../interfaces/moduleContext';
import ModuleChainManager from '../../modules/moduleChainManager';
import ConfigurationStoreManager from '../../services/configurationStoreManager';
import FileContentStore from '../../services/fileContentStore';

suite('TypeScriptFileChangeHandler', () => {
  let moduleChainManagerStub: sinon.SinonStubbedInstance<ModuleChainManager>;
  let handler: TypeScriptFileChangeHandler;

  setup(() => {
    moduleChainManagerStub = sinon.createStubInstance(ModuleChainManager);
    handler = TypeScriptFileChangeHandler.create();

    const pathsConfiguration = {
      packageJsonAbsoluteFolderPath: 'some/path',
    } as GeneralConfiguration['pathsConfiguration'];
    sinon
      .stub(ConfigurationStoreManager.getInstance(), 'getConfig')
      .returns({ pathsConfiguration });
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
    let fileContentStoreStub: sinon.SinonStubbedInstance<FileContentStore>;

    setup(() => {
      fileContentStoreStub = sinon.createStubInstance(FileContentStore);
      sinon.stub(FileContentStore, 'getInstance').returns(fileContentStoreStub);
    });

    test('should not execute chain if changeFileLocation is undefined', async () => {
      fileContentStoreStub.fileChangeContainsTranslationKeys.returns(true);

      const executeChainStub =
        moduleChainManagerStub.executeChainAsync as sinon.SinonStub;
      await handler.handleFileChangeAsync();
      sinon.assert.notCalled(executeChainStub);
    });

    test('should execute chain if changeFileLocation is provided', async () => {
      fileContentStoreStub.fileChangeContainsTranslationKeys.returns(true);

      const executeChainStub =
        moduleChainManagerStub.executeChainAsync as sinon.SinonStub;
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

    test('should not execute chain if changeFileLocation does not contain translation keys', async () => {
      const executeChainStub =
        moduleChainManagerStub.executeChainAsync as sinon.SinonStub;
      const uri = vscode.Uri.file('path/to/file.ts');

      fileContentStoreStub.fileChangeContainsTranslationKeys.returns(false);

      await handler.handleFileChangeAsync(uri);

      sinon.assert.notCalled(executeChainStub);
    });

    test('should execute chain if changeFileLocation contains translation keys', async () => {
      fileContentStoreStub.fileChangeContainsTranslationKeys.returns(true);

      const executeChainStub =
        moduleChainManagerStub.executeChainAsync as sinon.SinonStub;
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
