import * as assert from 'assert';
import * as sinon from 'sinon';
import { window, ExtensionContext, FileSystemWatcher } from 'vscode';
import I18nextJsonToPoConversionModuleConfiguration from '../entities/configuration/modules/I18nextJsonToPoConversionModule/i18nextJsonToPoConversionModuleConfiguration';
import { activate, deactivate } from '../extension';
import ConfigurationStoreManager from '../services/configurationStoreManager';
import FileWatcherCreator from '../services/fileWatcherCreator';

suite('Extension Test Suite', () => {
  window.showInformationMessage('Start all tests.');

  let context: ExtensionContext;
  let sandbox: sinon.SinonSandbox;
  let mockFileWatcherCreator: sinon.SinonStubbedInstance<FileWatcherCreator>;
  let mockConfigurationStoreManager: sinon.SinonStubbedInstance<ConfigurationStoreManager>;

  setup(() => {
    context = { subscriptions: [] } as unknown as ExtensionContext;
    sandbox = sinon.createSandbox();

    mockFileWatcherCreator = sandbox.createStubInstance(FileWatcherCreator);
    mockConfigurationStoreManager = sandbox.createStubInstance(
      ConfigurationStoreManager
    );

    mockFileWatcherCreator.createFileWatchersForFilesMatchingGlobAsync.resolves(
      []
    );
    mockConfigurationStoreManager.getConfig.returns({
      enabled: true,
    } as I18nextJsonToPoConversionModuleConfiguration);
  });

  teardown(() => {
    sandbox.restore();
  });

  test('Activate extension', async () => {
    await activate(
      context,
      mockConfigurationStoreManager,
      mockFileWatcherCreator
    );

    assert.strictEqual(context.subscriptions.length, 0);
    assert.strictEqual(
      mockFileWatcherCreator.createFileWatchersForFilesMatchingGlobAsync
        .calledTwice,
      true
    );
    assert.doesNotThrow(() => mockConfigurationStoreManager.Initialize());
  });

  test('Deactivate extension', () => {
    deactivate();
  });

  test('Create file watchers for files matching glob', async () => {
    const fileWatchers = ['fileWatcher1', 'fileWatcher2'].map((_) => ({
      onDidChange: () => {},
      onDidCreate: () => {},
      onDidDelete: () => {},
      dispose: () => {},
      ignoreCreateEvents: false,
      ignoreChangeEvents: false,
      ignoreDeleteEvents: false,
    }));
    mockFileWatcherCreator.createFileWatchersForFilesMatchingGlobAsync.resolves(
      fileWatchers as unknown as FileSystemWatcher[]
    );

    await activate(
      context,
      mockConfigurationStoreManager,
      mockFileWatcherCreator
    );

    assert.strictEqual(
      mockFileWatcherCreator.createFileWatchersForFilesMatchingGlobAsync.getCalls()
        .length,
      2
    );
    assert.strictEqual(context.subscriptions.length, fileWatchers.length * 2);
  });

  test('Initialize configuration store manager', async () => {
    await activate(
      context,
      mockConfigurationStoreManager,
      mockFileWatcherCreator
    );

    assert.strictEqual(
      mockConfigurationStoreManager.Initialize.calledOnce,
      true
    );
    assert.doesNotThrow(() => mockConfigurationStoreManager.Initialize());
  });
});
