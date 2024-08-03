import { FileWatcherCreator } from '@i18n-weave/feature/feature-file-watcher-creator';
import {
  I18nextJsonToPoConversionModuleConfiguration,
  I18nextScannerModuleConfiguration,
} from '@i18n-weave/util/util-configuration';
import { ConfigurationStoreManager } from '@i18n-weave/util/util-configuration';
import { FileType } from '@i18n-weave/util/util-enums';
import CodeTranslationStore from 'lib/stores/codeTranslation/codeTranslationStore';
import sinon from 'sinon';
import { ExtensionContext } from 'vscode';

import { activate, deactivate } from './extension';

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
        fileExtensions: ['ts', 'blaat'],
        codeFileLocations: ['src'],
        translationFilesLocation: 'src/locales',
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

  test('should activate extension and create file watchers', async () => {
    fileWatcherCreator.createFileWatchersForFileTypeAsync.resolves([]);

    await activate(context, fileWatcherCreator);

    sinon.assert.calledThrice(
      fileWatcherCreator.createFileWatchersForFileTypeAsync
    );

    sinon.assert.calledWith(
      fileWatcherCreator.createFileWatchersForFileTypeAsync,
      FileType.Code,
      sinon.match.object,
      sinon.match.object,
      sinon.match.func
    );
    sinon.assert.calledWith(
      fileWatcherCreator.createFileWatchersForFileTypeAsync,
      FileType.Json,
      sinon.match.object,
      sinon.match.object,
      sinon.match.func
    );
    sinon.assert.calledWith(
      fileWatcherCreator.createFileWatchersForFileTypeAsync,
      FileType.Po,
      sinon.match.object,
      sinon.match.object,
      sinon.match.func
    );
    sinon.assert.calledOnce(configurationStoreManagerStub().initialize);
  });

  test('should deactivate extension', () => {
    deactivate();
    // No assertion needed as the deactivate function is currently a no-op
  });
});
