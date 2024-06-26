import assert from 'assert';
import fs from 'fs';
import sinon from 'sinon';
import vscode from 'vscode';

import GeneralConfiguration from '../../../entities/configuration/general/generalConfiguration';
import { ChainType } from '../../../enums/chainType';
import ModuleContext from '../../../interfaces/moduleContext';
import ModuleChainManager from '../../../modules/moduleChainManager';
import ConfigurationStoreManager from '../../../stores/configuration/configurationStoreManager';
import FileContentStore from '../../../stores/fileContent/fileContentStore';
import TypeScriptFileChangeHandler from './typeScriptFileChangeHandler';

suite('TypeScriptFileChangeHandler', () => {
  let moduleChainManagerStub: sinon.SinonStubbedInstance<ModuleChainManager>;
  let readFileSyncStub: sinon.SinonStub;
  let handler: TypeScriptFileChangeHandler;

  setup(() => {
    moduleChainManagerStub = sinon.createStubInstance(ModuleChainManager);
    readFileSyncStub = sinon.stub(fs, 'readFileSync');
    handler = TypeScriptFileChangeHandler.create();

    // const pathsConfiguration = {
    //   packageJsonAbsoluteFolderPath: 'some/path',
    // } as GeneralConfiguration['pathsConfiguration'];
    // sinon
    //   .stub(ConfigurationStoreManager.getInstance(), 'getConfig')
    //   .returns({ pathsConfiguration });
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
    let getConfigStub: sinon.SinonStub;

    teardown(() => {
      sinon.restore();
    });

    test('should not execute chain if changeFileLocation is undefined', async () => {
      sinon
        .stub(FileContentStore, 'fileChangeContainsTranslationKeys')
        .returns(true);

      const executeChainStub =
        moduleChainManagerStub.executeChainAsync as sinon.SinonStub;
      await handler.handleFileChangeAsync();
      sinon.assert.notCalled(executeChainStub);
    });

    test('should execute chain if changeFileLocation is provided', async () => {
      const config = {
        i18nextScannerModule: {
          translationFilesLocation: 'locales',
          translationFunctionNames: ['I18nKey'],
          translationComponentTranslationKey: 'i18nKey',
          translationComponentName: 'Trans',
          codeFileLocations: ['src'],
        },
      };

      getConfigStub = sinon
        .stub(ConfigurationStoreManager.getInstance(), 'getConfig')
        .returns(config.i18nextScannerModule);

      sinon
        .stub(FileContentStore, 'fileChangeContainsTranslationKeys')
        .returns(true);

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

      sinon
        .stub(FileContentStore, 'fileChangeContainsTranslationKeys')
        .returns(false);

      await handler.handleFileChangeAsync(uri);

      sinon.assert.notCalled(executeChainStub);
    });

    test('should execute chain if changeFileLocation contains translation keys', async () => {
      const config = {
        i18nextScannerModule: {
          translationFilesLocation: 'locales',
          translationFunctionNames: ['I18nKey'],
          translationComponentTranslationKey: 'i18nKey',
          translationComponentName: 'Trans',
          codeFileLocations: ['src'],
        },
      };

      getConfigStub = sinon
        .stub(ConfigurationStoreManager.getInstance(), 'getConfig')
        .returns(config.i18nextScannerModule);
      sinon
        .stub(FileContentStore, 'fileChangeContainsTranslationKeys')
        .returns(true);

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
