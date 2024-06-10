import * as assert from 'assert';
import sinon from 'sinon';
import { ExtensionContext } from 'vscode';

import I18nextJsonToPoConversionModuleConfiguration from '../entities/configuration/modules/I18nextJsonToPoConversionModule/i18nextJsonToPoConversionModuleConfiguration';
import I18nextScannerModuleConfiguration from '../entities/configuration/modules/i18nextScanner/i18nextScannerModuleConfiguration';
import { activate, deactivate } from '../extension';
import ConfigurationStoreManager from '../services/configurationStoreManager';
import FileWatcherCreator from '../services/fileWatcherCreator';

suite('Extension Activation', () => {
  let context: ExtensionContext;
  let fileWatcherCreator: sinon.SinonStubbedInstance<FileWatcherCreator>;
  let configurationStoreManagerStub: sinon.SinonStub;

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
