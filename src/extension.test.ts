import sinon from 'sinon';
import { ExtensionContext } from 'vscode';

import { activate, deactivate } from './extension';
import I18nextJsonToPoConversionModuleConfiguration from './lib/entities/configuration/modules/I18nextJsonToPoConversionModule/i18nextJsonToPoConversionModuleConfiguration';
import I18nextScannerModuleConfiguration from './lib/entities/configuration/modules/i18nextScanner/i18nextScannerModuleConfiguration';
import FileWatcherCreator from './lib/services/fileChange/fileWatcherCreator';
import CodeTranslationStore from './lib/stores/codeTranslation/codeTranslationStore';
import ConfigurationStoreManager from './lib/stores/configuration/configurationStoreManager';

suite('Extension Activation', () => {
  let context: ExtensionContext;
  let fileWatcherCreator: sinon.SinonStubbedInstance<FileWatcherCreator>;
  let configurationStoreManagerStub: sinon.SinonStub;

  let codeTranslationStoreStub: sinon.SinonStubbedInstance<CodeTranslationStore>;

  setup(() => {
    context = { subscriptions: [] } as any;
    fileWatcherCreator = sinon.createStubInstance(FileWatcherCreator);
    configurationStoreManagerStub = sinon
      .stub(ConfigurationStoreManager, 'getInstance')
      .returns({
        getConfig: sinon.stub(),
        initialize: sinon.stub(),
      } as any);

    (configurationStoreManagerStub().getConfig as sinon.SinonStub)
      .withArgs('i18nextScannerModule')
      .returns({
        enabled: true,
        fileExtensions: ['ts', 'tsx'],
      } as I18nextScannerModuleConfiguration);
    (configurationStoreManagerStub().getConfig as sinon.SinonStub)
      .withArgs('i18nextJsonToPoConversionModule')
      .returns({
        enabled: true,
      } as I18nextJsonToPoConversionModuleConfiguration);

    codeTranslationStoreStub = sinon.createStubInstance(CodeTranslationStore);
    sinon
      .stub(CodeTranslationStore, 'getInstance')
      .returns(codeTranslationStoreStub);
  });

  teardown(() => {
    sinon.restore();
  });

  test.skip('should activate extension and create file watchers', async () => {
    fileWatcherCreator.createFileWatchersForFileTypeAsync.resolves([]);

    await activate(context, fileWatcherCreator);

    sinon.assert.calledThrice(
      fileWatcherCreator.createFileWatchersForFileTypeAsync
    );

    sinon.assert.calledWith(
      fileWatcherCreator.createFileWatchersForFileTypeAsync,
      ['ts', 'tsx'],
      sinon.match.func
    );
    sinon.assert.calledWith(
      fileWatcherCreator.createFileWatchersForFileTypeAsync,
      ['json'],
      sinon.match.func
    );
    sinon.assert.calledWith(
      fileWatcherCreator.createFileWatchersForFileTypeAsync,
      ['po'],
      sinon.match.func
    );
    sinon.assert.calledOnce(configurationStoreManagerStub().initialize);
  });

  test('should deactivate extension', () => {
    deactivate();
    // No assertion needed as the deactivate function is currently a no-op
  });
});
