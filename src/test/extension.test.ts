import * as assert from 'assert';
import sinon from 'sinon';
import { ExtensionContext } from 'vscode';

import { activate, deactivate } from '../extension';
import I18nextJsonToPoConversionModuleConfiguration from '../lib/entities/configuration/modules/I18nextJsonToPoConversionModule/i18nextJsonToPoConversionModuleConfiguration';
import I18nextScannerModuleConfiguration from '../lib/entities/configuration/modules/i18nextScanner/i18nextScannerModuleConfiguration';
import FileWatcherCreator from '../lib/services/fileChange/fileWatcherCreator';
import ConfigurationStoreManager from '../lib/stores/configuration/configurationStoreManager';
import FileContentStore from '../lib/stores/fileContent/fileContentStore';

suite('Extension Activation', () => {
  let context: ExtensionContext;
  let fileWatcherCreator: sinon.SinonStubbedInstance<FileWatcherCreator>;
  let configurationStoreManagerStub: sinon.SinonStub;

  let fileContentStoreStub: sinon.SinonStubbedInstance<FileContentStore>;

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
      .returns({ enabled: true } as I18nextScannerModuleConfiguration);
    (configurationStoreManagerStub().getConfig as sinon.SinonStub)
      .withArgs('i18nextJsonToPoConversionModule')
      .returns({
        enabled: true,
      } as I18nextJsonToPoConversionModuleConfiguration);

    fileContentStoreStub = sinon.createStubInstance(FileContentStore);
    sinon.stub(FileContentStore, 'getInstance').returns(fileContentStoreStub);
  });

  teardown(() => {
    sinon.restore();
  });

  test('should activate extension and create file watchers', async () => {
    fileWatcherCreator.createFileWatchersForFilesMatchingGlobAsync.resolves([]);

    await activate(context, fileWatcherCreator);

    sinon.assert.calledWith(
      fileWatcherCreator.createFileWatchersForFilesMatchingGlobAsync,
      '**/{apps,libs}/**/*.{tsx,ts}',
      sinon.match.func
    );
    sinon.assert.calledWith(
      fileWatcherCreator.createFileWatchersForFilesMatchingGlobAsync,
      '**/locales/**/*.json',
      sinon.match.func
    );
    sinon.assert.calledWith(
      fileWatcherCreator.createFileWatchersForFilesMatchingGlobAsync,
      '**/locales/**/*.po',
      sinon.match.func
    );
    sinon.assert.calledOnce(configurationStoreManagerStub().initialize);
    assert.strictEqual(context.subscriptions.length, 0);
  });

  test('should deactivate extension', () => {
    deactivate();
    // No assertion needed as the deactivate function is currently a no-op
  });
});
