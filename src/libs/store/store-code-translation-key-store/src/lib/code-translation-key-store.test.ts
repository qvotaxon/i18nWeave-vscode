/* eslint-disable no-restricted-imports */
import assert from 'assert';
import fs from 'fs';
import sinon from 'sinon';
import { ExtensionContext, Uri, window } from 'vscode';

import { FileReader } from '@i18n-weave/file-io/file-io-file-reader';

import { FileLocationStore } from '@i18n-weave/store/store-file-location-store';

import {
  ConfigurationStoreManager,
  I18nextScannerModuleConfiguration,
} from '@i18n-weave/util/util-configuration';

import { CodeTranslationKeyStore } from './code-translation-key-store';

suite('CodeTranslationKeyStore', () => {
  suite('general tests', () => {
    let context: ExtensionContext;
    let codeTranslationStore: CodeTranslationKeyStore;
    let readFileAsyncStub: sinon.SinonStub;
    let getConfigStub: sinon.SinonStub;
    let getFilesByTypeStub: sinon.SinonStub;
    let showErrorMessageStub: sinon.SinonStub;
    let updateStoreRecordAsyncStub: sinon.SinonStub;
    let globalStateUpdateStub: sinon.SinonStub;

    setup(() => {
      globalStateUpdateStub = sinon.stub();
      context = {
        globalState: { get: sinon.stub(), update: globalStateUpdateStub },
      } as any;
      codeTranslationStore = CodeTranslationKeyStore.getInstance();
      readFileAsyncStub = sinon.stub(FileReader, 'readWorkspaceFileAsync');
      getConfigStub = sinon.stub(
        ConfigurationStoreManager.getInstance(),
        'getConfig'
      );
      getFilesByTypeStub = sinon.stub(
        FileLocationStore.getInstance(),
        'getFileLocationsByType'
      );
      showErrorMessageStub = sinon.stub(window, 'showErrorMessage');
      updateStoreRecordAsyncStub = sinon.stub(
        codeTranslationStore,
        'updateStoreRecordAsync'
      );
      //@ts-ignore - private method
      // updateCacheStub = sinon.stub(codeTranslationStore, 'updateCache');
    });

    teardown(() => {
      sinon.restore();
    });

    test('should initialize code translations and update cache', async () => {
      const fsPaths = [Uri.file('path1'), Uri.file('path2')];
      const stats = { mtime: new Date() };

      updateStoreRecordAsyncStub.callThrough();

      context.globalState.get('i18nWeave.translationFunctionCache');
      getFilesByTypeStub.returns(fsPaths);
      sinon.stub(fs, 'statSync').returns(stats as unknown as fs.Stats);
      readFileAsyncStub.resolves('fileContents');
      getConfigStub
        .withArgs('i18nextScannerModule')
        .returns({ fileExtensions: ['ts', 'tsx'] });
      getConfigStub.withArgs('debugging').returns({
        logging: {
          enableVerboseLogging: true,
        },
      });

      await codeTranslationStore.initializeAsync(context, fsPaths);

      sinon.assert.calledTwice(readFileAsyncStub);
      sinon.assert.calledTwice(updateStoreRecordAsyncStub);
    });

    test('should handle error during initialization', async () => {
      getConfigStub
        .withArgs('i18nextScannerModule')
        .returns({ fileExtensions: ['ts', 'tsx'] });
      getConfigStub.withArgs('debugging').returns({
        logging: {
          enableVerboseLogging: true,
        },
      });

      // @ts-expect-error - testing error handling
      await codeTranslationStore.initializeAsync(context, null);

      sinon.assert.calledOnce(showErrorMessageStub);
      sinon.assert.calledWith(
        showErrorMessageStub,
        'Error initializing initial file contents'
      );
    });

    test('should check if file change contains translation functions', async () => {
      const fsPath = Uri.file('path');
      const codeFileContents = 'fileContents';

      readFileAsyncStub.resolves(codeFileContents);
      sinon
        //@ts-ignore - stubbing private method
        .stub(codeTranslationStore, 'hasTranslationChanges')
        //@ts-ignore - stubbing private method
        .returns(true);

      const result = await codeTranslationStore.hasTranslationChanges(fsPath, {
        enabled: true,
        translationFilesLocation: 'src/i18n',
        codeFileLocations: ['src'],
        defaultNamespace: 'common',
        namespaces: ['common'],
        languages: ['en'],
        defaultLanguage: 'en',
        nsSeparator: ':',
        keySeparator: '.',
        pluralSeparator: '_',
        contextSeparator: '_',
        translationFunctionNames: ['t', 'i18next.t'],
        translationComponentTranslationKey: 'i18nKey',
        translationComponentName: 'Trans',
        fileExtensions: ['ts', 'tsx', 'js', 'jsx'],
      } satisfies I18nextScannerModuleConfiguration);

      // sinon.assert.calledOnce(readFileAsyncStub);
      sinon.assert.calledOnce(
        //@ts-ignore - stubbing private method
        codeTranslationStore.hasTranslationChanges
      );
      sinon.assert.calledWith(
        //@ts-ignore - stubbing private method
        codeTranslationStore.hasTranslationChanges,
        fsPath,
        {
          enabled: true,
          translationFilesLocation: 'src/i18n',
          codeFileLocations: ['src'],
          defaultNamespace: 'common',
          namespaces: ['common'],
          languages: ['en'],
          defaultLanguage: 'en',
          nsSeparator: ':',
          keySeparator: '.',
          pluralSeparator: '_',
          contextSeparator: '_',
          translationFunctionNames: ['t', 'i18next.t'],
          translationComponentTranslationKey: 'i18nKey',
          translationComponentName: 'Trans',
          fileExtensions: ['ts', 'tsx', 'js', 'jsx'],
        } satisfies I18nextScannerModuleConfiguration
      );
      sinon.assert.notCalled(globalStateUpdateStub);
      assert.equal(result, true);
    });

    test.skip('should return false if file change does not contain translation functions', async () => {
      const fsPath = Uri.file('path');
      const codeFileContents = 'fileContents';
      const newTranslationFunctionNames = ['translate'];
      const currentTranslationFunctionNames = ['translate'];

      readFileAsyncStub.resolves(codeFileContents);
      sinon
        //@ts-ignore - stubbing private method
        .stub(codeTranslationStore, 'hasTranslationChanges')
        //@ts-ignore - stubbing private method
        .returns(newTranslationFunctionNames);
      sinon
        //@ts-ignore - stubbing private property
        .stub(codeTranslationStore._codeTranslations, 'get')
        //@ts-ignore - stubbing private property
        .returns({ translationFunctionNames: currentTranslationFunctionNames });

      const result = await codeTranslationStore.hasTranslationChanges(fsPath, {
        enabled: true,
        translationFilesLocation: 'src/i18n',
        codeFileLocations: ['src'],
        defaultNamespace: 'common',
        namespaces: ['common'],
        languages: ['en'],
        defaultLanguage: 'en',
        nsSeparator: ':',
        keySeparator: '.',
        pluralSeparator: '_',
        contextSeparator: '_',
        translationFunctionNames: ['t', 'i18next.t'],
        translationComponentTranslationKey: 'i18nKey',
        translationComponentName: 'Trans',
        fileExtensions: ['ts', 'tsx', 'js', 'jsx'],
      } satisfies I18nextScannerModuleConfiguration);

      // sinon.assert.calledOnce(readFileAsyncStub);
      sinon.assert.calledOnce(
        //@ts-ignore - stubbing private method
        codeTranslationStore.hasTranslationChanges
      );
      sinon.assert.notCalled(globalStateUpdateStub);
      assert.strictEqual(result, false);
    });
  });

  suite('updateStoreRecordAsync', () => {
    let codeTranslationStore: CodeTranslationKeyStore;
    let readFileAsyncStub: sinon.SinonStub;
    let updateStoreRecordAsyncStub: sinon.SinonStub;
    let globalStateUpdateStub: sinon.SinonStub;
    let updateCacheStub: sinon.SinonStub;

    setup(() => {
      globalStateUpdateStub = sinon.stub();
      context = {
        globalState: { get: sinon.stub(), update: globalStateUpdateStub },
      } as any;
      codeTranslationStore = CodeTranslationKeyStore.getInstance();
      readFileAsyncStub = sinon.stub(FileReader, 'readWorkspaceFileAsync');
      sinon.stub(ConfigurationStoreManager.getInstance(), 'getConfig');
      sinon.stub(FileLocationStore.getInstance(), 'getFileLocationsByType');
      sinon.stub(window, 'showErrorMessage');
      updateStoreRecordAsyncStub = sinon.stub(
        codeTranslationStore,
        'updateStoreRecordAsync'
      );
      //@ts-ignore - private method
      updateCacheStub = sinon.stub(codeTranslationStore, 'updateCache');
    });

    teardown(() => {
      sinon.restore();
    });

    test.skip('should update store record and cache', async () => {
      const fileUri = Uri.file('path');
      const dateModified = new Date();
      const codeFileContents = 'fileContents';
      const translationFunctionNames = ['translate'];

      updateStoreRecordAsyncStub.callThrough();

      readFileAsyncStub.resolves(codeFileContents);
      sinon
        //@ts-ignore - stubbing private method
        .stub(codeTranslationStore, 'hasTranslationChanges')
        //@ts-ignore - stubbing private method
        .returns(translationFunctionNames);

      codeTranslationStore.initializeAsync(
        { subscriptions: [] } as unknown as ExtensionContext,
        [fileUri]
      );

      await codeTranslationStore.updateStoreRecordAsync(fileUri, dateModified);

      sinon.assert.calledOnce(readFileAsyncStub);
      sinon.assert.calledOnce(updateStoreRecordAsyncStub);
      sinon.assert.calledWith(
        updateStoreRecordAsyncStub,
        fileUri,
        dateModified
      );
      sinon.assert.calledOnce(updateCacheStub);

      updateStoreRecordAsyncStub.reset();
    });
  });
});
